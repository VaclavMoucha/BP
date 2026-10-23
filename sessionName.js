const isProd = process.env.NODE_ENV === "production";

module.exports = isProd ? "__Host-sid" : "sid";