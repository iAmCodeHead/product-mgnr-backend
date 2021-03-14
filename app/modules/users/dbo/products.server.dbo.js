const mongoose = require('mongoose'),
  Products = mongoose.model('Products');

exports.findProductById = function (productId, callback) {
    Products.findOne({
      _id: productId
    }, function (err, result) {
      if (err) {
        callback('Something went wrong');
      } else if (!result) {
        callback('Product not found');
      } else {
        callback(null, result);
      }
    });

};
