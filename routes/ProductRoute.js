import express from "express";
const ProductRouter = express.Router();
import connectDB from "../databaseConnection.js";
const db = await connectDB();
import verifyToken from "../middlewares/Auth.js";
// helper function
function getExpiry(category, purchaseDate) {
  const expiry = new Date(purchaseDate);

  switch (category.toLowerCase()) {
    case "chicken":
    case "pork":
    case "fish":
      expiry.setDate(expiry.getDate() + 3); // 3 days
      break;

    case "eggs":
      expiry.setMonth(expiry.getMonth() + 1); // 1 month
      break;

    default:
      expiry.setDate(expiry.getDate() + 7); // default 1 week
  }

  return expiry;
}
async function logInventoryChange({
  product_id,
  changed_by_id,
  change_type,
  quantity_change,
  old_stock,
  new_stock,
  changed_by,
  user_role,
  db,
}) {
  await db.execute(
    `INSERT INTO inventory_logs 
    (product_id, changed_by_id, change_type, quantity_change, old_stock, new_stock, changed_by, user_role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product_id,
      changed_by_id,
      change_type,
      quantity_change,
      old_stock,
      new_stock,
      changed_by,
      user_role,
    ]
  );
}

// add a product
ProductRouter.post("/add", verifyToken, async (req, res) => {
  try {
    console.log("user", req.user);
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "forbidden" });
    }

    const { product_name, category, unit, added_quantity, price_per_unit } =
      req.body;

    // Basic validation
    if (
      !product_name ||
      !category ||
      !unit ||
      !price_per_unit ||
      !added_quantity
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // Check if product already exists (active or soft-deleted)
    const [rows] = await db.execute("SELECT * FROM products WHERE name = ?", [
      product_name,
    ]);

    if (rows.length) {
      const product = rows[0];

      if (product.is_active === 0) {
        // Reactivate product
        const newStock = Number(product.current_stock) + Number(added_quantity);
        await db.execute(
          `UPDATE products SET is_active = 1, current_stock = ?, price_per_unit = ?, category = ?, unit = ? WHERE id = ?`,
          [newStock, price_per_unit, category, unit, product.id]
        );

        await logInventoryChange({
          product_id: product.id,
          changed_by_id: req.user.user_id,
          change_type: "purchase",
          quantity_change: added_quantity,
          old_stock: product.current_stock,
          new_stock: newStock,
          changed_by: req.user.firstname,
          user_role: req.user.role,
          db,
        });

        return res.status(200).json({
          message: "Product reactivated and stock updated successfully",
          product_name,
          current_stock: newStock,
        });
      } else {
        // Active product: just update stock
        const newStock = Number(product.current_stock) + Number(added_quantity);
        await db.execute(
          `UPDATE products SET current_stock = ?, price_per_unit = ? WHERE id = ?`,
          [newStock, price_per_unit, product.id]
        );

        await logInventoryChange({
          product_id: product.id,
          changed_by_id: req.user.user_id,
          change_type: "purchase",
          quantity_change: added_quantity,
          old_stock: product.current_stock,
          new_stock: newStock,
          changed_by: req.user.firstname,
          user_role: req.user.role,
          db,
        });

        return res.status(200).json({
          message: "Product stock updated successfully",
          product_name,
          current_stock: newStock,
        });
      }
    } else {
      // New product
      const [insertedResult] = await db.execute(
        `INSERT INTO products (name, category, unit, price_per_unit, current_stock) VALUES (?, ?, ?, ?, ?)`,
        [product_name, category, unit, price_per_unit, added_quantity]
      );

      const insertID = insertedResult.insertId;

      await logInventoryChange({
        product_id: insertID,
        changed_by_id: req.user.user_id,
        change_type: "purchase",
        quantity_change: added_quantity,
        old_stock: 0,
        new_stock: added_quantity,
        changed_by: req.user.firstname,
        user_role: req.user.role,
        db,
      });

      // Insert purchase record
      const [purchasedResult] = await db.execute(
        `INSERT INTO purchases (product_id, product_name, quantity, created_by_id, supplier_name, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          insertID,
          product_name,
          added_quantity,
          req.user.user_id,
          "pushkar poultry",
          req.user.role,
        ]
      );

      const purchaseID = purchasedResult.insertId;
      const expiryDate = getExpiry(category, new Date());

      await db.execute(`UPDATE purchases SET expiry_date = ? WHERE id = ?`, [
        expiryDate,
        purchaseID,
      ]);

      return res.status(201).json({
        message: "Product added successfully",
        product_name,
        current_stock: added_quantity,
      });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "internal server error" });
  }
});

// Delete product
ProductRouter.delete("/delete/:product_name", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { product_name } = req.params;

    const [rows] = await db.execute(
      "SELECT * FROM products WHERE name = ? AND is_active = 1",
      [product_name]
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ message: "Product not found or already deleted" });
    }

    const product = rows[0];

    // Log the soft deletion
    await logInventoryChange({
      product_id: product.id,
      changed_by_id: req.user.user_id,
      change_type: "adjustment",
      quantity_change: product.current_stock,
      old_stock: product.current_stock,
      new_stock: 0,
      changed_by: req.user.firstname,
      user_role: req.user.role,
      db,
    });

    // Soft delete: mark product as inactive
    await db.execute("UPDATE products SET is_active = 0 WHERE id = ?", [
      product.id,
    ]);

    return res
      .status(200)
      .json({ message: "Product removed from inventory successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update stock and price per unit of a product (add or deduct stock)
ProductRouter.put("/update/:product_name", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { product_name } = req.params;
    const { added_stock, deducted_stock, price_per_unit } = req.body;

    if (
      added_stock === undefined &&
      deducted_stock === undefined &&
      price_per_unit === undefined
    ) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const [rows] = await db.execute(
      "SELECT id, current_stock, price_per_unit FROM products WHERE name = ?",
      [product_name]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = rows[0];
    const oldStock = Number(product.current_stock);

    // Compute new stock
    let newStock = oldStock;
    if (added_stock !== undefined) newStock += Number(added_stock);
    if (deducted_stock !== undefined) newStock -= Number(deducted_stock);
    if (newStock < 0) newStock = 0; // prevent negative stock

    const newPrice =
      price_per_unit !== undefined ? price_per_unit : product.price_per_unit;

    await db.execute(
      "UPDATE products SET current_stock = ?, price_per_unit = ? WHERE name = ?",
      [newStock, newPrice, product_name]
    );

    async function logInventoryChange(change_type, quantity_change) {
      await db.execute(
        `INSERT INTO inventory_logs 
         (product_id, changed_by_id, change_type, quantity_change, old_stock, new_stock, changed_by, user_role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.id,
          req.user.user_id,
          change_type,
          quantity_change,
          oldStock,
          newStock,
          req.user.firstname,
          req.user.role,
        ]
      );
    }

    // Log stock changes
    if (added_stock && added_stock > 0) {
      await logInventoryChange("purchase", added_stock);
    }
    if (deducted_stock && deducted_stock > 0) {
      await logInventoryChange("deduction", deducted_stock);
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product_name,
      current_stock: newStock,
      price_per_unit: newPrice,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ProductRouter.get("/all",async(req,res)=>{})
// return alert for low stock and near expiry products
ProductRouter.get("/check", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Fetch products where stock is less than or equal to threshold and is active
    const [rows] = await db.execute(
      `SELECT id, name, current_stock, low_stock_threshold, unit, category
       FROM products
       WHERE is_active = 1 AND current_stock <= low_stock_threshold`
    );

    if (!rows.length) {
      return res
        .status(200)
        .json({ message: "No products are low in stock", products: [] });
    }

    return res.status(200).json({ products: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default ProductRouter;
