const express = require("express");
const { body } = require("express-validator");

const {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
} = require("../controllers/authController");
const router = express.Router();

router.get("/register", registerForm);
router.post(
  "/register",
  [
    body("userName", "Ingrese un nombre valido").trim().notEmpty().escape(),
    body("email", "Ingrese un email valido").trim().isEmail().normalizeEmail(),
    body("password", "Ingrese contraseña de minimo 6 caracteres")
      .trim()
      .isLength({ min: 6 })
      .escape()
      .custom((value, { req }) => {
        if (value !== req.body.repassword) {
          throw new Error("No coinciden las contraseñas");
        } else {
          return value;
        }
      }),
  ],
  registerUser
);
router.get("/confirmar/:token", confirmarCuenta);
router.get("/login", loginForm);
router.post(
  "/login",
  [
    body("email", "Ingrese un email valido").trim().isEmail().normalizeEmail(),
    body("password", "Ingrese contraseña de minimo 6 caracteres")
      .trim()
      .isLength({ min: 6 })
      .escape(),
  ],
  loginUser
);

router.get("/logout", cerrarSesion);

module.exports = router;
