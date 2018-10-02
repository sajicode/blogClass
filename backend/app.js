require('./config/config');

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const api = require('./api/api');
const {mongoose} = require('./db/mongoose');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(morgan("dev"));
app.use(cors());

app.use("/api", api);

app.use(function(err, req, res, next) {
  res.status(500).json(err.message);
  next();
});

module.exports = {app};