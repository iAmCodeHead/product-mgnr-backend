const User = require('mongoose').model('User');
const authMiddleware = require('../../../middlewares/auth.server.middlewares');
const usersDbo = require('../dbo/users.server.dbo');
const sessionsDbo = require('../dbo/session.server.dbo');
const async = require('async');

exports.signup = function (req, res) {
    let data = req.body;
    let firstName = data.firstName ? data.firstName : '';
    let lastName = data.lastName ? data.lastName : '';
    if (firstName) {
        data.displayName = firstName;
    }
    if (lastName) {
        if (firstName) {
            data.displayName += ' ';
        }
        data.displayName += lastName
    }
    
    const user = new User(data);
    user.save(function (err, result) {
        if (err) {
            res.status(422).send({
                success: false,
                message: err.message
            })
        } else {
            res.status(200).send({
                success: true,
                message: 'Successfully signed up!'
            });
        }
    });

}

exports.signin = function (req, res) {

    let loginData = req.body;
    let userId;
    let accessToken;
    let refreshToken;
    let headers = req.headers;
    async.waterfall([
        function (next) {
            usersDbo.findUserByUsername(loginData.username, next);
        },
        function (userData, next) {
            usersDbo.validatePassword(userData, loginData.password, next);
        },
        function (userData, callback) {
            callback(null, userData);
        }
    ], function (err, result) {
        if (err) {
            res.status(422).send({
                success: false,
                message: err
            });
        } else {

            // data for jwt-access-token and refresh-token-generation
            // console.log(result);
            let dataForToken = {
                _id: result._id,
                email: result.email,
                username: result.username,
                firstName: result.firstName,
                lastName: result.lastName,
                location: result.location,
                email: result.email,
                roles: result.roles
            };

            authMiddleware.generateToken(dataForToken, 2, function (err, accessToken) {
                authMiddleware.generateToken(dataForToken, 30 * 24, function (err, refreshToken) {
                    sessionsDbo.createSession({
                        userId: result._id,
                        accessToken: accessToken,
                        refreshToken: refreshToken,
                        headers: headers,
                        roles: result.roles
                    }, function (err, result) {
                        if (err) {
                            res.status(400).send({
                                success: false,
                                message: 'Can\'t access the server right now. Please try again.'
                            });
                        } else {
                            res.status(200).send({
                                accessToken: accessToken,
                                refreshToken: refreshToken,
                                userData: dataForToken
                            });
                        }
                    });
                });
            });
        }
    });
}

exports.signout = function (req, res) {
    const accessToken = req.headers.access_token;
    sessionsDbo.deleteSession(accessToken, function (err, result) {
        if (err) {
            res.status(422).send({
                success: false,
                message: 'Unable to log out the user'
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'Successfully logged out'
            });
        }
    });

}
