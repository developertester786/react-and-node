const path = require('path');
const express = require("express");
const PORT = process.env.PORT || 3001;
const bodyParser = require('body-parser');
const flash = require('express-flash');
const session = require('express-session'); 
const app = express();
//const router = express.Router();
const authRouter = require('./routes/auth');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());

app.use(session({ cookie: { maxAge: 60000 }, 
  secret: 'woot',
  resave: false, 
  saveUninitialized: false
}));

var flash = require('connect-flash');
app.use(flash()); // flash messages

app.use(function (req, res, next) {
    res.locals.success = req.flash('success');
    res.locals.info = req.flash('info');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });
app.use('/', authRouter);
// router.get("/", (req, res) => {
//   res.render("layout");
// });

// app.get("/", (req, res) => {
//   // const sql = "INSERT INTO lc_users (fname,lname,password) VALUES ('kiran','nagi','kiran@123')";
//   // db.query(sql,(err, result) => {
//   //   res.send('submitted 1');
//   // });
//      res.json({ message: "Hello from server!" });
// });

//app.use("/", router);
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});