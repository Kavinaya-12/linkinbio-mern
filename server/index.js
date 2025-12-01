const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://linkinbio-mern-3h5jls7ts-kavinayas-projects.vercel.app"
    ],
    credentials: true,
  })
);

app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));
