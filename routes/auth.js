const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/requireAdmin")


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
 

module.exports = router;