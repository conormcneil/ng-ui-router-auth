require('dotenv').config();
var express = require('express');
var jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var bearerToken = require('express-bearer-token');

var app = express();

app.use(bearerToken());
app.use(bodyParser());
app.use(express.static('public'));

app.post('/users/signin',function (req,res,next) {
  // retrieve user from database here
  // for sake of demo, API retrieves either admin or standard user
  var user = {name: "User"};
  var admin = {name: "Admin",roles: ['admin']};
  if(req.body.user === 'admin') {
    res.json({
      token:jwt.sign(admin,process.env.SECRET),
      user: admin
    });
  } else {
    res.json({
      token:jwt.sign(user,process.env.SECRET),
      user: user
    });
  };
});

// redirect from # to remove from URL
app.get('*',function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

// JWT Middleware
app.use(function (req,res,next) {
  jwt.verify(req.token, process.env.SECRET,function (err,decoded) {
    if (!err) {
      next();
    } else {
      res.redirect('/');
    }
  });
});

app.listen(3000);
