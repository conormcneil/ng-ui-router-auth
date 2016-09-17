var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

router.use('/signin',function (req,res,next) {
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

module.exports = router;
