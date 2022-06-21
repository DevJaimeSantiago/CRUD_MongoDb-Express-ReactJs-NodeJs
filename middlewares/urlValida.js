const { URL } = require("url");
const urlValidar = (req, res, next) => {
  try {
    const { origin } = req.body;
    const urlFrontEnd = new URL(origin);
    if (urlFrontEnd.origin !== "null") {
      if (
        urlFrontEnd.protocol === "http:" ||
        urlFrontEnd.protocol === "https:"
      ) {
        return next();
      }
      throw new Error("tiene que tener https:// ");
    }
    throw new Error("No valida 😍");
  } catch (error) {
    if (error.message === "invalid URL") {
      req.flash("mensajes", [{ msg: "URL no valida" }]);
    } else {
      req.flash("mensajes", [{ msg: error.message }]);
    }
    return res.redirect("/");
  }
};

module.exports = urlValidar;
