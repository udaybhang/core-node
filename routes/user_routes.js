const accountController = require('../controllers/userController')
const auth = require('../utils/auth')
module.exports = function (app){
    app.post('/signup',accountController.signup);
    app.post('/login',accountController.login);
    app.post('/userUpdate',auth.requireToken,accountController.userUpdate);
    app.get('/userList', auth.requireToken, accountController.userList);
    app.post('/searchUser', auth.requireToken, accountController.searchUser);
    app.post('/create', accountController.create);
    app.post('/token', accountController.token);
    app.post('/checkout', accountController.checkout);
    app.post('/success_url', accountController.success_url);
    app.post('/cancel_url', accountController.cancel_url);
    app.post('/retreavePaymentIntent', accountController.retreavePaymentIntent);
    app.post('/charge', accountController.charge);
 };