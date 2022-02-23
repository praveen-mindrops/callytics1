const express = require("express");
const morgan = require("morgan");
const globalErrorHandler = require("./Controllers/ErrorController");
const AppError = require("././utils/AppError");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const userRouter = require("./routes/userRoute");

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Data Sanitization against noSQL query injection
app.use(mongoSanitize());

// Data Sanitization against xss(cross site scripting)
app.use(xss());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

// 3) ROUTES

app.use("/api/v2/users", userRouter);

// 3)ERROR HANDLING
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
