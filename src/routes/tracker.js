const express = require("express");
const router = express.Router();

const {
  getItemById,
  getItem,
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  searchProduct,
} = require("../controllers/tracker");

router.param("itemId", getItemById); // Verified

router.post("/item/create", createItem); //Verified

router.get("/item/:itemId", getItem); //Verified
router.get("/items", getAllItems); //Verified

router.put("/item/:itemId", updateItem);
router.delete("/item/:itemId", deleteItem); //Verified

router.post("/searchProduct", searchProduct);

module.exports = router;
