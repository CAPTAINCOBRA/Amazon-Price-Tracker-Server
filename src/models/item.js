const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      maxlength: 2000,
    },
    reqPrice: {
      type: Number,
      trim: true,
      required: true,
      maxlength: 32,
    },
    infoEmail: {
      type: String,
      required: true,
      maxlength: 32,
      unique: false,
    },
    url: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    imageUrl: {
      type: String,
      required: true,
      maxlength: 2000,
      unique: true,
    },
    priceHistory: [{ price: Number, date: Date }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
