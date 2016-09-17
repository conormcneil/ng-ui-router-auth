var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.get('/protected', function(req, res, next) {
  console.log('/api/protected route');
  res.json(['user1','user2','user3']);
});

module.exports = router;
