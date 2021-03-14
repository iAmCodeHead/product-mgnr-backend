const config = require('./config');
const express = require('express');
const logger = require('morgan');
const compress = require('compression');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const path = require('path');
const glob = require('glob');

module.exports = function(){
    
    const app = express();

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access_token");
        res.header("Access-Control-Allow-Methods","PUT, GET, POST, OPTIONS, DELETE");
        next();
    });

    app.use(express.static(path.join(__dirname, '../uploads')));

    if(process.env.NODE_ENV == 'development'){
        app.use(logger('dev'));
    }else{
        app.use(compress());
    }
    app.use(bodyParser.urlencoded({
        extended:true
    }));
    
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Adding all routes from modules by passing app to the routes with the help of glob
    glob(path.dirname(require.main.filename) + '/app/modules/**/routes/*.js', function (err, files) {
        if (files && files.length) {
            files.forEach(function (file) {
                require(file)(app);
            });
        }
    });

    return app;
}
