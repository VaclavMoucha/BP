/** 
 * @file app.js
 * @description Hlavní soubor aplikace, který nastavuje middleware a směruje požadavky na různé routery.
 * @requires express
 * @requires cors
 * @requires path
 * @requires express-session
 * @requires mongoose
 * @requires ./routes/articles
 * @requires ./routes/auth
 * @requires ./routes/images
 * @requires ./routes/pages
 * pagesRouter musí být přidán na konec, aby se zabránilo konfliktům s ostatními routami.
*/
const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const articlesRouter = require("./routes/articles");
const authRouter = require("./routes/auth");
const imagesRouter = require("./routes/images");
const pagesRouter = require("./routes/pages");

const app = express();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB připojeno"))
  .catch((err) => console.error(err));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "res")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

app.use("/api/articles", articlesRouter);

app.use("/api", authRouter);
app.use("/api/images", imagesRouter);
app.use("/", pagesRouter);
module.exports = app;
