const express = require('express'),
          router = express.Router(),
          userController = require('../controllers/userController');

router.route('/register')
.post(userController.addUser);


module.exports = router;