const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const mongoSanitize = require("express-mongo-sanitize");
const cors = require("cors");
const { create } = require("express-handlebars");
const csrf = require("csurf");

const User = require("./models/User");
require("dotenv").config();
const clientDB = require("./database/db");

const app = express();

const corsOption = {
  Credentials: true,
  origin: process.env.pathHEROKU || "*",
  methods: ["GET", "POST"],
};

app.use(cors());

app.use(
  session({
    secret: processs.env.SECRETSESSION,
    resave: false,
    saveUninitialized: false,
    name: "session-user",
    store: MongoStore.create({
      clientPromise: clientDB,
      dbName: process.env.DBNAME,
    }),
    cookie: {
      secure: process.env.MODO === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

//dudas
passport.serializeUser((user, done) =>
  done(null, { id: user._id, userName: user.userName })
);
passport.deserializeUser(async (user, done) => {
  // Es necesario revisar la base de datos ???
  const userDb = await User.findById(user.id);
  return done(null, { id: userDb._id, userName: userDb.userName });
});

const hbs = create({
  extname: ".hbs",
  partialsDir: "views/components",
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");
app.set("views", "./views");

// middlewares
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

app.use(csrf());
app.use(mongoSanitize());

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.mensajes = req.flash("mensajes");
  next();
});

app.use("/", require("./routes/home"));
app.use("/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("servidor funcionando... " + PORT));
