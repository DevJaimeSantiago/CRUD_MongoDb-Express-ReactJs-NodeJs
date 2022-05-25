const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const urls = [
    { origin: "wwww.google.com/bluuweb1", shortURL: "dadffas1" },
    { origin: "wwww.google.com/bluuweb2", shortURL: "dadffas2" },
    { origin: "wwww.google.com/bluuweb3", shortURL: "dadffas3" },
  ];
  res.render("home", { urls: urls });
});

module.exports = router;
