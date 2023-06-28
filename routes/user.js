import express from "express";
import { deleteProfile, followUser, getAllFollowing, getAllUsers, getUserProfile, login, logout, myProfile, register, updatePassword, updateProfile } from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

router.post("/register",register);
router.post("/login",login);
router.get("/logout",logout);
router.put("/user/update/password",isAuthenticated,updatePassword);
router.put("/user/update/profile",isAuthenticated,updateProfile);
router.get("/user/follow/:id",isAuthenticated,followUser);
router.delete("/user/deleteMe",isAuthenticated,deleteProfile);
router.get("/user/me",isAuthenticated,myProfile);
router.get("/user/profile/:id",isAuthenticated,getUserProfile);
router.get("/users",isAuthenticated,getAllUsers);
router.get("/user/following",isAuthenticated,getAllFollowing);
export default router;