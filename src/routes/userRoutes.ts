import { Router } from "express";
import { getUser, updateUser, deleteUser } from "../controllers/userController";
import { signup, login, protect } from "../controllers/authController";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

// Protect all routes after this middleware
router.use(protect);

router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router;
