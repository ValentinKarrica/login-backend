import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/userController";
import {
  signup,
  login,
  protect,
  verifyToken,
  updatePassword,
} from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify", verifyToken);

// Protect all routes after this middleware
router.use(protect);
router.post("/updatePassword", updatePassword);

router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
