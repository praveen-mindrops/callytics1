const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();
// router.post("/signUp", authController.signUp);
router.post("/Login", authController.Login);
router.post("/googleLogin", authController.googleLogin);

// Protect All Routes After this middleware
router.use(authController.protect);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
