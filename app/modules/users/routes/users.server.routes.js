const usersController = require('../controllers/users.server.controller');
const isAuthenticated = require('../../../middlewares/auth.server.middlewares').isAuthenticated;

module.exports = function (app) {
    app.route('/api/me')
        .get(isAuthenticated, usersController.me);
}