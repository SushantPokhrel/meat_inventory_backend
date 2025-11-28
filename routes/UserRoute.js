import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const UserRouter = express.Router();
// const { verifyToken } = require("../middlewares/Auth");
import verifyToken from "../middlewares/Auth.js";
import connectDB from "../databaseConnection.js";
const db = await connectDB();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const roleMap = {
  admin: ["admin@gmail.com"],
  manager: ["manager1@gmail.com", "manager2@gmail.com"],
  staff: [], // any email not in admin/manager goes here
};

// Helper to get role
function getRoleByEmail(email) {
  if (roleMap.admin.includes(email)) return "admin";
  if (roleMap.manager.includes(email)) return "manager";
  return "staff";
}
UserRouter.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    if (rows.length) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed_password = await bcrypt.hash(password, 8);

    const [result] = await db.execute(
      `INSERT INTO users (firstname, lastname, email, password_hash) VALUES (?, ?, ?, ?)`,
      [first_name, last_name, email, hashed_password]
    );

    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});
UserRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // dynamic role assign
    const role = getRoleByEmail(email);

    await db.execute(`UPDATE users SET role = ? WHERE email = ?`, [
      role,
      email,
    ]);

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "60m" }
    );
console.log(token)
    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3600000, // 1 hour
    });

    return res.status(200).json({
      message: "Login successful",
      user_id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: role,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});
UserRouter.get("/me", verifyToken, async (req, res) => {
  console.log(req.user);
  return res.status(200).json({
    message: "hi from /me route",
    user: req.user,
  });
});
export default UserRouter;
