const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const requireAdmin = require("../middleware/requireAdmin");
const upload = multer({ storage: multer.memoryStorage() }); 
const Image = require("../models/Image");
const sharp = require("sharp");

const uploadsDir = path.join(__dirname, "..", "res", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true }); 

router.post("/upload", requireAdmin, upload.single("img"), async (req, res) => {
  try {
  if (!req.file) return res.status(400).json({ error: "Žádný soubor" });

  const resizedBuffer = await sharp(req.file.buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .autoOrient()
    .toBuffer();

  const filename = Date.now() + "-" + Math.round(Math.random() * 1e9) + ".webp";
  fs.writeFileSync(path.join(uploadsDir, filename), resizedBuffer);

  const image = await Image.create({
    filename,
    path: "uploads/" + filename,
    contentType: "image/webp",
  });

  const url = "/api/images/" + image._id;
  res.json({ url });} catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru:" + err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Obrázek nenalezen" });

    res.sendFile(path.join(uploadsDir, image.filename));
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru" + err.message });
  }
});

module.exports = router;    
