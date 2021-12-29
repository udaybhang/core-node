const accountController = require('../controllers/userController')
const auth = require('../utils/auth')
module.exports = function (app){
    app.post('/signup',accountController.signup);
    app.post('/login',accountController.login);
    app.post('/userUpdate',auth.requireToken,accountController.userUpdate);
    app.get('/userList', auth.requireToken, accountController.userList);
    app.post('/searchUser', auth.requireToken, accountController.searchUser);
 };