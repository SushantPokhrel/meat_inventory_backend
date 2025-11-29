import cron from "node-cron";
import connectDB from "./databaseConnection.js";

const db = await connectDB();

const checkLowStock = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, current_stock, low_stock_threshold, unit, category
       FROM products
       WHERE is_active = 1 AND current_stock <= low_stock_threshold`
    );

    if (rows.length) {
      console.log("Low-stock alert:", rows);
      
    }
  } catch (err) {
    console.error(err);
  }
};

// Run immediately
checkLowStock();

// Schedule every 3min 
cron.schedule("0 */1 * * * *", () => {
  console.log("Running scheduled low-stock check...");
  checkLowStock();
});
