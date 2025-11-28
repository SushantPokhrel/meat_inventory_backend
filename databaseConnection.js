import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
//mysql connection
export default async function connectDB() {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: process.env.DB_PASS,
      database: "meat_inventory",
    });
    // console.log(await db.execute(`create database meat_inventory`));
    console.log("db connected ")
    return db;
  } catch (e) {
    console.log(e);
  }
}
