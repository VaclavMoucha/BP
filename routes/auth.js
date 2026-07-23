const express = require("express");
const router = express.Router();
const multer = require("multer");
const requireAdmin = require("../middleware/requireAdmin")
const upload = multer({ dest: "res/img/uploads/" });

router.post("/login", (req, res) => {
  const { username, password } = req.body;
 
  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;
 
  if (username === validUsername && password === validPassword) {
    req.session.admin = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});
 

router.post("/upload", requireAdmin, upload.single("img"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Žádný soubor" });
  const url = "/img/uploads/" + req.file.filename;
  res.json({ url });
});

module.exports = router;