const app = require('express')();
const express = require('express');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const http = require('http').Server(app);
const flash = require('express-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;
const router = require('./router.js');
const Authrouter = require('./Authrouter.js');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');

// enable files upload
app.use(fileUpload({
  createParentPath: true
}));

// Access public folder from root
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public',express.static(path.join(__dirname, "public")));
app.get('/layouts/', function(req, res) {
  res.render('view');
});

//For set layouts of html view
var expressLayouts = require('express-ejs-layouts');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.use(cookieParser());
// if (app.get('env') === 'production') {
//   app.set('trust proxy', 1) // trust first proxy
//   sess.cookie.secure = true // serve secure cookies
// }
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret:"landCartSecretKey",
    cookie: { secure: false, maxAge: 14400000 },
  })
);
app.use(flash());
app.use(expressValidator());

// error handler
app.use(function (req, res, next) {
  res.locals.session = req.session;
  res.locals.errors = req.flash('errors');
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Add Authentication Route file with app
app.use('/', Authrouter); 

// Add Route file with app
app.use('/', router); 

app.get('*', function(req, res){
  res.render('Auth/pages_404',{
    title: 'Page Not Found',
    session: res.locals.session,
  });
});

app.get('/', function(req, res){
  res.writeHead(200, {
     'Content-type': 'text/html'
  });
  res.end(index);
});

http.listen(PORT, function(){
  console.log(`Server listening on ${PORT}`);
});
