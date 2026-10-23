const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const sessionName = require("../sessionName");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Příliš mnoho neúspěšných pokusů. Zkuste to za 15 minut." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const validUsername = process.env.ADMIN_USERNAME;
    const validPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!validUsername || !validPasswordHash || !username || !password) {
      return res.status(401).json({ success: false });
    }

    
    const usernameMatch = 
      username.length === validUsername.length &&
      crypto.timingSafeEqual(Buffer.from(username), Buffer.from(validUsername));

    
    const passwordMatch = await argon2.verify(validPasswordHash, password);

    if (!usernameMatch || !passwordMatch) {
      return res.status(401).json({ success: false, message: "Neplatné přihlašovací údaje" });
    }

    
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ success: false });
      }

      req.session.admin = true;
      res.json({ success: true });
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false });
    }
    
    res.clearCookie(sessionName); 
    res.json({ success: true });
  });
});

module.exports = router;