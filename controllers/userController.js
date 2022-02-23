const User = require("../modals/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/AppError");
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res
    .status(200)
    .json({ status: "success", result: users.length, data: { users } });
});
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No user exists with this Id", 404));
  }
  res.status(200).json({
    status: "success",
    user,
  });
});
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({ status: "success", data: { newUser } });
  } catch (err) {
    res.status(404).json({ status: "failed", Error: err });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "sucess",
      user,
    });
  } catch (err) {
    res.status(404).json({ mesaage: err });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "sucess",
      data: null,
    });
  } catch (err) {
    res.status(404).json({ mesaage: "error" });
  }
};
