const express = require('express');
const router = express.Router();
const Users = require("../Models/Users");
const bcrypt = require("bcrypt");
const hbs = require('hbs');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('home');
});

router.get('/register', (req, res, next) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  const theUser = req.body.username;
  const thePassword = req.body.password;
  const saltRounds = 2;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(thePassword, salt);
  if (theUser === "" || thePassword === "") {
    res.render("register", {
      errorMessage: "Please enter both, username and password to sign up."
    });
    return;
  }
  Users.findOne({
    name: req.body.username
  }).then(user => {
    if (user !== null) {
      res.render("register", {
        errorMessage: "This username already exist."
      });
    } else {
      Users.create({
          name: req.body.username,
          password: hash
        })
        .then(() => {
          res.redirect('/private'); //change this
        })
        .catch(() => {
          res.render('home');
        });
    }
  });
});

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  const thePassword = req.body.password;
  const theUser = req.body.username
  if (theUser === "" || thePassword === "") {
    res.render("login", {
      errorMessage: "Please enter both, username and password to sign up."
    });
    return;
  }
  Users.findOne({
      "name": theUser
    })
    .then(user => {
      if (!user) {
        res.render("login", {
          errorMessage: "The username doesn't exist."
        });
        return;
      }
      if (bcrypt.compareSync(thePassword, user.password)) {
        // Save the login in the session!
        req.session.currentUser = user;
        res.redirect("/private");
      } else {
        res.render("login", {
          errorMessage: "Incorrect password"
        });
      }
    })
    .catch(error => {
      next(error);
    })
});


router.get("/private", (req, res) => {
  if (req.session.currentUser) {
    res.render("private", {
      user: req.session.currentUser
    });
  } else {
    res.redirect("/login");
  }
});

router.get("/main", (req, res) => {
  if (req.session.currentUser) {
    res.render("main", {
      user: req.session.currentUser
    });

  } else {
    res.redirect("/login");
  }
});

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
});

module.exports = router;