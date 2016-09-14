require('dotenv').config();
var express = require('express');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');

var app = express();

app.use(bearerToken());
app.use(express.static('public'));

app.get('/signin',function (req,res,next) {
  console.log('signin route');
  // var user = {
  //   name: "Tom"
  // }
  var user = {
    name: "Conor",
    roles: ['admin']
  }
  res.json({
    token:jwt.sign(user,process.env.SECRET),
    user: user
  });
});

// // redirect from # to remove from URL
// app.get('*',function(req, res) {
//   res.redirect('/#' + req.originalUrl);
// });

// JWT Middleware
app.use(function (req,res,next) {
  console.log('check auth');
  jwt.verify(req.token, process.env.SECRET,function (err,decoded) {
    if (!err) {
      next();
    } else {
      res.redirect('/');
    }
  });
});

// app.get('/api',function (req,res,next) {
//   res.send("Accessed Granted!");
// });
//
// app.get('/ipa',function (req,res,next) {
//   res.send("Sierra Nevada IPA for everyone on K C");
// });

app.listen(3000);
