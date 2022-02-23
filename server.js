const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const app = require("./app");
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  DB = process.env.DATABASE.replace("<PASSWORD>", process.env.PASSWORD);

  mongoose
    .connect(DB, {
      useNewUrlParser: "true",
      useCreateIndex: "true",
      useUnifiedTopology: true,
      useFindAndModify: "false",
    })
    .then((con) => {
      console.log("DB is connected sucessfully");
    });
  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`app is running on the Port ${port}`);
  });
}
