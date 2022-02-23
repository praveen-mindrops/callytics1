const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, "User must have a name"] },
  mobile: {
    type: Number,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "User must have a name"],
    validate: [validator.isEmail, "Please enter a valid email address"],
    unique: true,
  },
  password: {
    type: String,
    // required: [true, "User must have password"],
    select: false,
  },
  deviceType: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  active: { type: Boolean, default: true },
});

//encryting the passsword before save in DB
UserSchema.pre("save", async function (next) {
  //Runs only If password will be modified
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//instance methode i.e available every where
//Function to compare the candidate and user password when login

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
