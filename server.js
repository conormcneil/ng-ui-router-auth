require('dotenv').config();
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');

var app = express();
var users = require('./routes/users');
var api = require('./routes/api');

app.use(bearerToken());
app.use(express.static('public'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/users', users);

app.use(function(req, res, next) {
  // JWT API auth here
  // check header or url parameters or post parameters for token
  // Lots of different methods to authorize token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    if (token.charAt(0) === '"') {
      token = token.split('');
      token.splice(0,1);
      token.splice(token.length-1,1);
      token = token.join('');
    }
    // verifies secret and checks exp
    jwt.verify(token, process.env.SECRET, function(err, data) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.data = data;
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    });
  }
})
// List protected routes
app.use('/api', api);

// redirect from # to remove from URL
app.get('*',function(req, res) {
  res.redirect('/#' + req.originalUrl);
});

app.listen(3000);
