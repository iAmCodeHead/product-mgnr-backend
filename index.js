const config = require('./app/config/config');
const mongoose = require('./app/config/mongoose');
const express = require('./app/config/express');

const db = mongoose();
const app = express();

const http = require('http').createServer(app);

http.listen(config.PORT);
console.log('App running at http://' + config.HOST + ':' + config.PORT + '/');
