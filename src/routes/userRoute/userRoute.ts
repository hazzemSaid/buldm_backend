
import { Router } from "express";
import AuthUserRoute from "./auth/AuthUserRoute";
import user from "./user/user"; // Ensure userRouter is a valid Router instance
const user_Router = Router();
user_Router.use('/', AuthUserRoute);
user_Router.use('/', user); // Ensure userRouter is correctly exported as a Router
export default user_Router;