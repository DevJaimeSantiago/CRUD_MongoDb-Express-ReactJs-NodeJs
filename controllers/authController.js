const User = require("../models/User");
const { validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerForm = (req, res) => {
  res.render("register");
};

const loginForm = (req, res) => {
  res.render("login");
};

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return res.json(errors);
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/register");
  }

  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (user) throw new Error(" ya existe el usuario");

    user = new User({ userName, email, password, tokenConfirm: nanoid() });
    await user.save();

    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSEMAIL,
      },
    });

    await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: user.email, // list of receivers
      subject: "Verifica tu cuenta de correo", // Subject line
      html: `<a href="${
        process.env.PATHHEROKU || "http://localhost:5000"
      }/auth/confirmar/${user.tokenConfirm}">Verifica tu cuenta aqui</a>`, // html body
    });

    req.flash("mensajes", [
      { msg: "Revisa tu correo electronico y valida tu cuenta" },
    ]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/register");
    // res.json({ error: error.message });
  }
};

const confirmarCuenta = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ tokenConfirm: token });
    if (!user) throw new Error("No existe este usuario");

    user.cuentaConfirmada = true;
    user.tokenConfirm = null;

    await user.save();

    req.flash("mensajes", [
      { msg: "cuenta verificada, puedes iniciar sesion." },
    ]);
    res.redirect("/auth/login");
  } catch (error) {
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
    // res.json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash("mensajes", errors.array());
    return res.redirect("/auth/login");
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) throw new Error("No existe este email");

    if (!user.cuentaConfirmada) throw new Error("Falta confirmar cuenta");

    if (!(await user.comparePassword(password)))
      throw new Error("contraseña invalida");

    // Esta creando la sesion de usuario a traves de passport
    req.login(user, (err) => {
      if (err) throw new Error("Error al crear la sesion");
      res.redirect("/");
    });
  } catch (error) {
    // console.log(error);
    req.flash("mensajes", [{ msg: error.message }]);
    return res.redirect("/auth/login");
    // res.send(error.message);
  }
};

const cerrarSesion = (req, res) => {
  // Cambios debido a la actualizacion de passport a la version 0.6.0 (revisar en caso de nueva actualizacion)
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login");
  });
};

module.exports = {
  loginForm,
  registerForm,
  registerUser,
  confirmarCuenta,
  loginUser,
  cerrarSesion,
};
