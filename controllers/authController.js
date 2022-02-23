const { OAuth2Client } = require("google-auth-library");
const AppError = require("../utils/AppError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const catchAsync = require("./../utils/catchAsync");
const User = require("../modals/userModel");

//function to generate jwt signin token
signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

//Function to send the response
createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ staus: "success", data: { user }, token });
};

/////////////////
/*
exports.signUp = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    mobile: req.body.mobile,
    email: req.body.email,
    password: req.body.password,
    deviceType: req.body.deviceType,
    role: req.body.role,
    active: req.body.active,
  });
  createSendToken(newUser, 201, res);
  // console.log(req.body);
  // res.status(201).json({ status: "success", data: { newUser } });

  // res.status(404).json({ status: "failed", Error: err });
});

/////////////////////

// Google Auth
*/
const client = new OAuth2Client(process.env.CLIENT_ID);
exports.googleLogin = catchAsync(async (req, res, next) => {
  let token = req.body.token;
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });
    const payload = ticket.getPayload();
    // const userid = payload["sub"];
    console.log(payload);
    const user = User.findOne(payload.email);
    if (!user) {
      newUser = User.create({
        name: payload.name,
        email: payload.email,
        photo: payload.picture,
        password: null,
      });
    }
  }
  verify()
    .then(() => {
      res.cookie("session-token", token);
      res.status(200).json({ status: "Success" });
    })
    .catch(console.error);
});
/////////////
exports.Login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //to check email and password are not blank
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }
  //To find the user by email and selecting the password explicitly
  const user = await User.findOne({ email }).select("+password");
  // console.log(user);

  //function of instance methode in Usermodel of hashing canditate(password)and compare to user password
  // const correct=user.confirmPassword(password, user.password)
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password", 404));
  }
  //if candidate and user password matched then sending the id of user to the signToken function to generate token for login
  createSendToken(user, 200, res);
});

///////////////////
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1.) getting token & check if it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    // console.log(token);
  }

  if (!token)
    return next(
      new AppError("You are not logged in! Please login to get access", 401)
    );

  //2.) Verification Token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //3.) check if user still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user does not exits belonging to this token", 401)
    );
  }
  //4.) Check user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "The user recently changed password! please login again",
        401
      )
    );
  }
  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

/////////////////
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do no have permission to perform this action", 403)
      );
    }
    next();
  };
};
