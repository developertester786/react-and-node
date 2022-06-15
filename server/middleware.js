const verify = (req, res, next) => {
    if(res.locals.session.loggedin && typeof res.locals.session.user.id != undefined){
        next();
    } else {
        req.flash('error', 'Please login to access portal!')
        res.redirect('/')
    }
}

const isloggedIn = (req, res, next) => {
    if(res.locals.session.loggedin && typeof res.locals.session.user.id != undefined){
        res.redirect('/dashboard');
    } else {
      next();
    }
}

module.exports = {
  verify,
  isloggedIn
};