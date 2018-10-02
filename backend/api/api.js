const express = require('express'),
          api = express.Router(),
          userRouter = require('./routers/userRouter');


api.use("/users", userRouter);


module.exports = api;