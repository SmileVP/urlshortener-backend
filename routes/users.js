var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const { dbUrl } = require("../config/dbConfig");
const { UrlModel } = require("../schema/urlSchema");

//to  create amazingly short non-sequential url-friendly unique ids
const shortid = require("shortid");

//connect to db
mongoose.connect(dbUrl);

//create url
router.post("/create-url", async (req, res) => {
  let data = {
    email: req.body.email,
    longurl: req.body.longurl,
    shorturl: shortid.generate(),
    clicks: 0,
    time: new Date(),
  };
  try {
    let doc = new UrlModel(data);
    await doc.save();
    res.status(201).send({
      message: "Url created successfully",
      doc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

// get longer url link
router.post("/redirect/:urlValue", async function (req, res) {
  try {
    let shorturl = req.params.urlValue;
    let details = await UrlModel.findOne({ shorturl: shorturl });
    let urlDetails = details.longurl;
    let data = await UrlModel.findOneAndUpdate(
      { shorturl: shorturl },
      { clicks: details.clicks + 1 }
    );

    if (details) {
      res.status(200).send({
        urlDetails,
      });
    } else {
      res.status(400).json({
        message: "Url not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

// get all urls
router.get("/getUrls", async function (req, res) {
  try {
    let urls = await UrlModel.find();
    res.status(200).send({
      urls,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal server error",
    });
  }
});

module.exports = router;
