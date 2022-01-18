// setup express
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// setup cors policy
app.use(cors());

// setup json body as middleware
// ? set whatever come out from body as JSON
app.use(express.json());

// connect to mongoDB
mongoose.connect("mongodb://localhost:27017/mern-stack-auth");

// determine API route

// ? register API
app.post("/api/register", async (req, res) => {
  try {
    //   create hashed password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.json({ status: "ok" });
  } catch (error) {
    res.json({ status: "error", error: "Duplicate email" });
  }
});

// ? login API
app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.json({ status: "error", error: "Invalid login" });
  }

  const isPasswordValid = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (isPasswordValid) {
    //   signed a jwt token
    const token = jwt.sign(
      {
        name: user.name,
        email: user.email,
      },
      "mysecretkey"
    );
    //   return the status and token
    //   check the token using atob('token')
    //   remove the payload in between the token determined bwo fullstop
    return res.json({ status: "ok", token: token });
  } else {
    return res.json({ status: "error", error: "Invalid password" });
  }
});

// ? get quote API
app.get("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "mysecretkey");
    const email = decoded.email;
    const user = await User.findOne({ email: email });
    return res.json({ status: "ok", quote: user.quote });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

// ? post quote API
app.post("/api/quote", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, "mysecretkey");
    const email = decoded.email;
    await User.updateOne({ email: email }, { $set: { quote: req.body.quote } });
    return res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "invalid token" });
  }
});

// create a port
app.listen(8000, () => {
  console.log("Server started at 8000");
});
