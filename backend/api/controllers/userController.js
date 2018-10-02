const {User} = require('../models/userModel'),
          {ObjectID} = require('mongodb');

exports.addUser = function(req, res) {
  let data = req.body;

  // create a new instance of User
  let user = new User(data);

  user.save()
    .then(() => {
      return user.generateAuthToken()
    }).then(token => {
      res.header('x-auth', token).send({user});
    }).catch(err => {
      res.status(400).send("Boooo");
    });
};