const mongoose = require('mongoose'),
  Users = mongoose.model('User');
const crypto = require('crypto');

exports.findUserByUsername = function (username, callback) {
    Users.findOne({
      username: username
    }, function (err, result) {
      if (err) {
        callback('Something went wrong');
      } else if (!result) {
        callback('User credentials are not found');
      } else {
        callback(null, result);
      }
    });

};

exports.validatePassword = function (userData, pwd, callback) {
    let password = crypto.pbkdf2Sync(pwd, new Buffer(userData.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
    if (password === userData.password) {
      let data = {};
      data._id = userData._id;
      data.username = userData.username;
      data.provider = userData.provider;
      data.roles = userData.roles;
      data.profileImageURL = userData.profileImageURL;
      data.email = userData.email;
      data.firstName = userData.firstName;
      data.lastName = userData.lastName;
      data.phoneNumber = userData.phoneNumber;
      data.location = userData.location;


      callback(null, data);
    } else {
      callback('Password does not mathch');
    }
};