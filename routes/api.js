var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.use(function(req, res, next) {
  // JWT API auth here
  console.log(req.headers.authorization);
  next();
})

router.get('/public', function(req, res, next) {
  res.send('public');
});

router.get('/auth', function(req, res, next) {
  res.send('auth');
});

function check_scopes(scopes) {
  return function(req, res, next) {
    // check if any of the scopes defined in the token,
    // is one of the scopes declared on check_scopes
    var token = req.token_payload;
    for (var i =0; i<token.scopes.length; i++){
      for (var j=0; j<scopes.length; j++){
          if(scopes[j] === token.scopes[i]) return next();
      }
    }
    return res.send(401, 'insufficient scopes')
  }
}

module.exports = router;
