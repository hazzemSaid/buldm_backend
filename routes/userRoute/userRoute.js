const UserRouter = require('express').Router();
const AuthUserRoute = require('./auth/AuthUserRoute');
const UserRoute = require('./user/user');
UserRouter.use('/', AuthUserRoute);
UserRouter.use('/', UserRoute);
module.exports = UserRouter;