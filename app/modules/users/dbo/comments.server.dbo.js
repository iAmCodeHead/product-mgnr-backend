const mongoose = require('mongoose'),
  Comments = mongoose.model('Comments');

exports.findCommentsOnProduct = function (productId, callback) {
    Comments.find({
      'commentOn.id': productId
    }, function (err, result) {
      if (err) {
        callback('Something went wrong');
      } else if (!result) {
        callback('Comments not found');
      } else {
        callback(null, result);
      }
    });

};