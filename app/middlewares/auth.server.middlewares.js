const jwt = require('jsonwebtoken');
const config = require('../config/config');
const sessionDbo = require('../modules/users/dbo/session.server.dbo');

exports.generateToken = function (data, expiresIn, callback) {
    const token = jwt.sign({
        data: data
    }, config.sessionSecret, {
            expiresIn: expiresIn * 60 * 60
        });
    callback(null, token);
}

exports.updateSession = function (selectQuery, updateQuery) {
    sessionDbo.updateSession(selectQuery, updateQuery, function (err, res) {

    });
}

exports.isAuthenticated = function (req, res, next) {
    const token = req.headers.access_token;
    jwt.verify(token, config.sessionSecret, function (err, response) {
        if (err) {
            console.log('err :',err);
            res.status(422).send({
                success: false,
                message: 'unauthenticated'
            });
        } else {
            req.userDetails = {
                id: response.data._id,
                email: response.data.email,
                name: `${response.data.firstName} ${response.data.lastName}`,
                phoneNumber: response.phoneNumber,
                location: response.data.location || null
            };
            return next();
        }
    })
}

exports.getAccessToken = function (req, res) {
    const refreshToken = req.body.refresh_token;
    jwt.verify(refreshToken, config.sessionSecret, function (err, response) {
        if (err) {
            res.status(422).send({
                success: false,
                message: 'You are not authorized'
            });
        } else {
            sessionDbo.getUserByRefreshToken(refreshToken, function (err, result) {
                if (err) {
                    res.status(422).send({
                        success: false,
                        message: 'You are not authorized'
                    });
                } else {
                    if (result) {
                        const dataForToken = {
                            _id: result._id,
                            email: result.email,
                            username: result.username,
                            roles: result.roles
                        };

                        require('./auth.server.middlewares').generateToken(dataForToken, 2, function (err, token) {
                            require('./auth.server.middlewares').updateSession({
                                refreshToken: refreshToken
                            }, {
                                    accessToken: token
                                });
                            res.status(200).send({
                                success: true,
                                message: 'New access token sent',
                                access_token: token
                            });

                        });


                    } else {
                        res.status(422).send({
                            success: false,
                            message: 'You are not authorized'
                        });
                    }
                }
            });

        }
    })
}