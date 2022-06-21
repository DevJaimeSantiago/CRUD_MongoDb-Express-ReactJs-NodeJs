require("dotenv").config();
const mongoose = require("mongoose");

const clientDb = mongoose
  .connect(process.env.URI)
  .then((m) => {
    console.log("Db conectada 😍");
    return m.connection.getClient();
  })
  .catch((e) => console.log("falló la conexion 😵 " + e));

module.exports = clientDb;
