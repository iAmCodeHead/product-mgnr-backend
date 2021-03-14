const Products = require('mongoose').model('Products');

const commentDbo = require('../dbo/comments.server.dbo');

exports.createProduct = function (req, res) {
    let data = req.body;
    data.owner = {...req.userDetails}

    const product = new Products(data);

    product.save(function (err, result) {
        if (err) {
            res.status(422).send({
                success: false,
                message: err.message
            })
        } else {
            res.status(200).send({
                success: true,
                message: 'Product successfully added!',
                data: result
            });
        }
    });
}


exports.allProductsByLocationWithComments = function (req, res) {

    const location = req.userDetails.location;

    Products.aggregate([
        {
            $match: { location }
        },
        {
            $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'commentOn.id',
                as: "allComents"
            }
        }
    ], function (err, result){
        if(err) {
            res.status(500).send({
                success: false,
                message: 'Internal Server Error!',
                data: null
            });
        } else {
            res.status(200).send({
                success: true,
                message: 'All products are here!',
                data: result
            });
        }
    });
}

exports.getProductByLocationWithComments = function (req, res) {

    const location = req.userDetails.location;
    
    let data = {};

        Products.find({location}, function (err, result) {
            if(err) {
                res.status(500).send({
                    success: false,
                    message: 'Internal Server Error!',
                    data: null
                });
            } else {
                data.productDetails = result;
                commentDbo.findCommentsOnProduct(req.params.productId, function(err, result) {
                    if (err) {
                        res.status(400).send({
                            success: false,
                            message: err
                        })
                    } else {
                        data.comments = result;
                        res.status(200).send({
                            success: true,
                            message: 'success',
                            data
                        });
                    }
                });
            }
        });
}