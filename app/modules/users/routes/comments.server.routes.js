const commentController = require('../controllers/comments.server.controller');
const authMiddleware = require('../../../middlewares/auth.server.middlewares');

module.exports = function (app) {

    app.route('/api/product/comment')
    .post([authMiddleware.isAuthenticated], commentController.makeComment);

    app.route('/api/product/comments')
    .get([authMiddleware.isAuthenticated], commentController.viewComments);
    
}