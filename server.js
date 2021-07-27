// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// Include mongoose in the server file
const mongoose = require("mongoose");
const app = express();
// Tell the server file about the .env file
require("dotenv").config();

const port = 4000;
// Use the MONGO_URI from .env or use local mongodb
const db = process.env.MONGO_URI;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// CORS
app.use(cors());
require("./endpoints")(app);
// Connect the Express application to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(port, () => {
      console.log(`Success! Your application is running on port ${port}.`);
    })
  )
  .catch((err) => console.log(err));
