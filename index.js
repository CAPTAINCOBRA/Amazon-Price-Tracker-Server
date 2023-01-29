const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const CronJob = require("cron").CronJob;
const Item = require("./src/models/item.js");
const sendGridMail = require("@sendgrid/mail");
// sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY_NEW);

const trackerRoutes = require("./src/routes/tracker.js");

//Scraping

const currentProduct = { name: "", price: "", url: "" };

async function scrapePrice(url, wantedPrice) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const container = $("div#dp-container");

  currentProduct.price = parseInt(
    $(container).find(".a-price-whole").first().text().replace(/[,.]/g, "")
  );
  if (currentProduct.price < wantedPrice) {
    // console.log("Price is low");
  } else {
    // console.log("Price is high");
  }
  return currentProduct.price;
}

// scrape(
//   "https://www.amazon.in/PHILIPS-Digital-HD9252-90-Technology/dp/B097RJ867P/?_encoding=UTF8&pd_rd_w=CjdBJ&content-id=amzn1.sym.86bd9ba7-f177-459f-9995-c8e962dd9848&pf_rd_p=86bd9ba7-f177-459f-9995-c8e962dd9848&pf_rd_r=G0A3MQ4FSWWFP3CMT2EB&pd_rd_wg=C5QK1&pd_rd_r=63f4be0c-394e-43d7-ad34-0d8e5b63731a&ref_=pd_gw_ci_mcx_mi",
//   4000
// );

//Scraping ends

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

app.use("/api", trackerRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`app is running at ${port}`);
});

const fetchAllItems = async () => {
  return new Promise((resolve, reject) => {
    Item.find({ Item })
      .then((items, err) => {
        // console.log(items);

        if (err) {
          console.log("No item found in the Database");
        }
        console.log("Got items successfully!");
        // return items;
        resolve(items);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const cronJob = async () => {
  const items = await fetchAllItems();
  // console.log("Items are - " + items);

  items.forEach(async (item) => {
    // console.log(item);
    try {
      const itemPrice = await scrapePrice(item.url, item.price);
      console.log(itemPrice);

      item.priceHistory.push({
        date: new Date(),
        price: itemPrice,
      });

      Item.findByIdAndUpdate(item._id, item, (err, updatedItem) => {
        if (err) {
          console.log(err);
        } else {
          console.log(updatedItem);
        }
      });
    } catch (error) {
      console.log(error);
    }
  });
};

// cronJob();

// var job = new CronJob(
//   "* * * * * *",
//   function () {
//     console.log("You will see this message every second");
//   },
//   null,
//   true,
//   "America/Los_Angeles"
// );

// create a new cronjob that runs every day
var job = new CronJob(
  "00 00 00 * * *",
  function () {
    cronJob();
    console.log("You will see this message every day");
  },
  null,
  true,
  "America/Los_Angeles"
);

//Test Purposes Below

const demoMailMethod = async () => {
  const items = await fetchAllItems();
  // console.log(items[0]);

  let wantedPrice = items[0].reqPrice;
  let url = items[0].url;
  let currentPrice = await scrapePrice(url, wantedPrice);
  console.log(currentPrice);
  currentPrice = 1000;

  if (currentPrice < wantedPrice) {
    console.log("Price is low");

    // send a mail to the user using sendgrid

    const msg = {
      to: items[0].infoEmail,
      from: process.env.SENDGRID_EMAIL,
      subject: "Price Drop Alert",
      text: "Price of the product you are tracking has dropped",
      html: "<strong>Price of the product you are tracking has dropped</strong>",
    };

    console.log(msg);

    sendGridMail
      .send(msg)
      .then((data) => {
        console.log("Email sent");
        console.log("data - " + data);
      })
      .catch((error) => {
        console.error(error);
      });

    // send a mail to the user using sendgrid ends
  } else {
    console.log("Price is high");
  }
};

// demoMailMethod();
