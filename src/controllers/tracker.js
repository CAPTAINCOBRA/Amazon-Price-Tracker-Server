const Item = require("../models/item");
const axios = require("axios");
const cheerio = require("cheerio");
const item = require("../models/item");

exports.getItemById = (req, res, next, id) => {
  Item.findById(id).exec((err, item) => {
    if (err) {
      return res.status(400).json({
        error: "Item not found in DB",
      });
    }
    req.item = item;
    next();
  });
};

exports.createItem = (req, res) => {
  console.log("createItem");
  console.log(req.body);
  let { product } = req.body;
  product = JSON.parse(product);

  const item = new Item(product);
  item.save((err, item) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }
    return res.json({ item });
  });
};

exports.getItem = (req, res) => {
  return res.json(req.item);
};

exports.getAllItems = (req, res) => {
  Item.find({ Item })
    .then((items, err) => {
      if (err) {
        console.log("No item found in the Database");
        return res.status(400).json({ error: err });
      }

      res.json(items);
    })
    .catch((err) => {
      return res.status(401).json({ error: "No Item found in the Database!" });
    });
};

exports.updateItem = (req, res) => {
  Item.findByIdAndUpdate(req.item._id, req.body)
    .then((err, item) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      return res.status(200).json(item);
    })
    .catch((err) => {
      return res.status(401).json({ error: "Unable to update the item" });
    });
};

exports.deleteItem = (req, res) => {
  const item = req.item;
  item.remove((err, item) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    return res.json(item);
  });
};

exports.searchProduct = async (req, res) => {
  // parse req.body first to get the search value
  let { searchValue } = req.body;
  console.log(searchValue);

  try {
    const currentProduct = {
      name: "",
      price: "",
      url: "",
      image: "",
      details: "",
      reviews: "",
    };
    searchValue = decodeURIComponent(searchValue);
    searchValue = JSON.parse(searchValue);
    const response = await axios.get(searchValue);
    const { data } = response;
    console.log("Reached here");
    const $ = cheerio.load(data);
    const container = $("div#dp-container");
    currentProduct.name = $(container)
      .find("span#currentProductTitle")
      .text()
      .trim();
    if (currentProduct.name === "") {
      currentProduct.name = $(container).find("#productTitle").text().trim();
    }
    currentProduct.url = searchValue;
    currentProduct.price = parseInt(
      $(container).find(".a-price-whole").first().text().replace(/[,.]/g, "")
    );
    currentProduct.discount = parseInt(
      $(container).find(".a-price-whole").text().replace(/[,.]/g, "")
    );
    currentProduct.image = $(container).find("#landingImage").attr("src");
    currentProduct.details = $(container).find("#feature-bullets").text();
    currentProduct.details = currentProduct.details.replace(
      /(\r\n|\n|\r)/gm,
      ""
    );
    currentProduct.details = currentProduct.details.replace(/\s\s+/g, " "); //Basically tests if there are 2 or more spaces and replaces them with a single space
    currentProduct.details = currentProduct.details.trim();
    if (currentProduct.details.length > 1000) {
      currentProduct.details = currentProduct.details.substring(0, 1000);
    }
    if (currentProduct.details.indexOf("See more") > -1) {
      currentProduct.details = currentProduct.details.substring(
        0,
        currentProduct.details.indexOf("See more")
      );
    } else if (currentProduct.details.indexOf("see more") > -1) {
      currentProduct.details = currentProduct.details.substring(
        0,
        currentProduct.details.indexOf("see more")
      );
    } else if (currentProduct.details.indexOf("Show More") > -1) {
      currentProduct.details = currentProduct.details.substring(
        0,
        currentProduct.details.indexOf("Show More")
      );
    }
    currentProduct.reviews = $(container).find("#acrCustomerReviewText").text();

    console.log(currentProduct);
    return res.status(200).json(currentProduct);
  } catch (error) {
    console.log("Got an error - " + error);
  }

  // if (currentProduct.price < wantedPrice) {
  //   console.log("Price is low");
  // } else {
  //   console.log("Price is high");
  // }
};

async function scrapePrice(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const container = $("div#dp-container");

  currentProduct.price = parseInt(
    $(container).find(".a-price-whole").first().text().replace(/[,.]/g, "")
  );
  return currentProduct.price;
}
