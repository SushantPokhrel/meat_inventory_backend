import mysql from "mysql2/promise";
import { configDotenv } from "dotenv";
import express from "express";
const app = express();
configDotenv();
//mysql connection
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.db_pass,
  database: "meat_inventory",
});
// console.log(await db.execute(`create database meat_inventory`));
console.log(await db.execute(`show tables`));
app.get("/", (req, res) => {
  console.log(req);
  res.json({message:"hi from server"})
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
