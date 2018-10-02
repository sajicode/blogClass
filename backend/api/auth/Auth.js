const {User} = require('../models/userModel');

let authenticate = (req, res, next) => {
  let token = req.header('x-auth');

  User.findByToken(token)
    .then(user => {
      if(!user) {
        return Promise.reject();
      }
      req.user = user;
      req.token = token;
      next();
    }).catch(e => {
      res.status(401).send("Forbidden user")
    });
};

module.exports = {authenticate};