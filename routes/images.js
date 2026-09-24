const express = require("express");
const router = express.Router();
const multer = require("multer");
const requireAdmin = require("../middleware/requireAdmin");
const upload = multer({ storage: multer.memoryStorage() });
const Image = require("../models/Image");
const sharp = require("sharp");

router.post("/upload", requireAdmin, upload.single("img"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Žádný soubor" });
 const resizedBuffer = await sharp(req.file.buffer)
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer();
  const image = await Image.create({
    data: resizedBuffer,
    contentType: "image/webp",
  });

  const url = "/api/images/" + image._id;
  res.json({ url });
});
router.get("/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: "Obrázek nenalezen" });

    res.set("Content-Type", image.contentType);
    res.send(image.data);
  } catch (err) {
    res.status(500).json({ error: "Chyba serveru" });
  }
});

module.exports = router;    
