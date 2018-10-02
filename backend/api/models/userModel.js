const mongoose = require('mongoose'),
      validator = require('validator'),
      jwt = require('jsonwebtoken'),
      _ = require('lodash'),
      bcrypt = require('bcryptjs'),
      Schema = mongoose.Schema;

  const UserSchema = new Schema({
    name: {
      type: String,
      required: true,
      minlength: 2
    },

    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: '{VALUE} is not a valid email'
      }
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    tokens: [{
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }]
  });

UserSchema.methods.generateAuthToken = function() {
  let user = this;
  let access = 'auth';
  let token = jwt.sign({
    _id: user._id.toHexString(), access},
  process.env.SECRET).toString();
  
  user.tokens.push({
    access,
    token
  });
  return user.save().then(() => token);
};

UserSchema.statics.findByToken = function(token) {
  let User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.SECRET);
  } catch(e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.statics.findByCredentials = function(email, password) {
  let User = this;
  return User.findOne({
    email
  }).then(user => {
    if(!user) {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if(res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};

UserSchema.pre('save', function(next) {
  let user = this;

  if(user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('user', UserSchema);

module.exports = {User};