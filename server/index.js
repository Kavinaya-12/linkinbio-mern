const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json({ limit: "50gb" }));
app.use(express.urlencoded({ limit: "50gb", extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://linkinbio-mern.vercel.app"   
    ],
    credentials: true,
  })
);


const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

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
