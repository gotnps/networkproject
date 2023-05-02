import express from "express";
import {
  createUser,
  localLogin,
  logout,
  getNavbarInfo,
  checkLogin,
  // getUserInfo,
  getCSRF,
  getAllChat,
  getAllUsers,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
const router = express.Router();

router
  .route("/user")
  .post(createUser)
  .get(getAllUsers)
router.route("/user/login").post(localLogin); // login

// router
//   .route("/user/info")
  // .post(getUserInfo)
  
router.route("/user/logout").post(logout); // logout

router.route("/user/navbar").get(getNavbarInfo); // get navbar info

router.route("/user/check-login").get(checkLogin); // check if user login

router.route("/user/forgot-password").post(forgotPassword); // send resetlink to email
router.route("/user/reset-password").post(resetPassword); // reset password

router
  .route("/user/chatRooms/:userId")
  .get(getAllChat);
router.route("/csrf-token").get(getCSRF);

export default router;
