/**
 * @file app.js
 * @description Hlavní soubor aplikace, který nastavuje middleware a směruje požadavky na různé routery.
 * @requires express
 * @requires path
 * @requires helmet
 * @requires express-session
 * @requires connect-mongo
 * @requires mongoose
 * @requires ./sessionName
 * @requires ./routes/articles
 * @requires ./routes/auth
 * @requires ./routes/images
 * @requires ./routes/pages
 *
 * pagesRouter musí být přidán na konec, aby se zabránilo konfliktům s ostatními routami.
 */
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const mongoose = require("mongoose");
const sessionName = require("./sessionName");
const articlesRouter = require("./routes/articles");
const authRouter = require("./routes/auth");
const imagesRouter = require("./routes/images");
const pagesRouter = require("./routes/pages");
const isDev = process.env.NODE_ENV !== "production";
const app = express();


app.set("trust proxy", 1);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB připojeno"))
  .catch((err) => console.error(err));

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "frame-src": ["'self'", "https://www.google.com"],
        "upgrade-insecure-requests": isDev ? null : [],
      },
    },
    hsts: isDev ? false : undefined,
  }),
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "res")));

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET není nastaven");
}

app.use(
  session({
    name: sessionName,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 2,
      autoRemove: "native",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 2,
    },
  }),
);


function checkOrigin(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  try {
    if (origin && new URL(origin).host === req.get("host")) return next();
  } catch {
    
  }
  return res.status(403).json({ error: "Neplatný původ požadavku" });
}

app.use(checkOrigin);

app.use("/api/articles", articlesRouter);
app.use("/api", authRouter);
app.use("/api/images", imagesRouter);
app.use("/", pagesRouter);

module.exports = app;