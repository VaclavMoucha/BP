/**
 * Middleware ověřující, zda je uživatel přihlášen jako administrátor.
 */
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  const expectsJson = req.xhr || req.headers.accept?.includes("application/json");

  if (expectsJson) {
    return res.status(401).json({ success: false, error: "Nepřihlášen" });
  }
  return res.redirect("/login");
}

module.exports = requireAdmin;