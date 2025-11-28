import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/UserRoute.js";
import ProductRouter from "./routes/ProductRoute.js";
import db from "./databaseConnection.js";
import "./lowStock.js"
app.use(cors());
app.use(
  cors({
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); // for parsing url encoded string

// api routes
app.use("/api/product",ProductRouter)
app.use("/api/auth", UserRouter);
app.get("/", (req, res) => {
  console.log(req);
  res.json({ message: "hi from server" });
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
