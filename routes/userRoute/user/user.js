const Route = require('express').Router();
const controller = require('../../../controller/userController/userController.js');
Route.get('/:id', controller.getUser);
module.exports = Route;