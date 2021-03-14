const productController = require('../controllers/products.server.controller');
const authMiddleware = require('../../../middlewares/auth.server.middlewares');

module.exports = function (app) {

    app.route('/api/product')
    .post([authMiddleware.isAuthenticated], productController.createProduct);

    app.route('/api/products')
    .get([authMiddleware.isAuthenticated], productController.allProductsByLocationWithComments);
    
    app.route('/api/products/:productId')
    .get([authMiddleware.isAuthenticated], productController.getProductByLocationWithComments);
    
}