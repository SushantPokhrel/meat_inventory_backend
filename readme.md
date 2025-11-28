# Minimal Meat Inventory System — Backend

Minimal working backend module for meat inventory management.

## Features

- JWT authentication with 3 roles: `admin`, `manager`, `staff`
- Product CRUD with soft-delete (`is_active`) and stock updates
- Stock deduction routes
- Purchase/source tracking (each purchase row links to product)
- Inventory logs tracking every stock change
- APIs for low-stock alerts

## Database schema

# users table

Create Table: CREATE TABLE `users` (
`id` int NOT NULL AUTO_INCREMENT,
`firstname` varchar(15) DEFAULT NULL,
`email` varchar(150) NOT NULL,
`password_hash` varchar(255) NOT NULL,
`role` enum('admin','manager','staff') NOT NULL DEFAULT 'staff',
`lastname` varchar(15) DEFAULT NULL,
PRIMARY KEY (`id`),
UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

# products table

Create Table: CREATE TABLE `products` (
`id` int NOT NULL AUTO_INCREMENT,
`name` varchar(150) NOT NULL,
`current_stock` int NOT NULL DEFAULT '0',
`price_per_unit` decimal(10,2) DEFAULT NULL,
`low_stock_threshold` decimal(10,2) DEFAULT '5.00',
`expiry_date` date DEFAULT NULL,
`unit` enum('kg','half_kg','dozen','piece') DEFAULT NULL,
`category` enum('fish','chicken','goat','pork','beef','egg') DEFAULT NULL,
`is_active` tinyint(1) DEFAULT '1',
PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

# purchase query

Create Table: CREATE TABLE `purchases` (
`id` int NOT NULL AUTO_INCREMENT,
`product_id` int NOT NULL,
`quantity` int DEFAULT NULL,
`purchase_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
`created_by_id` int NOT NULL,
`supplier_name` varchar(30) DEFAULT 'pushkar poultry',
`created_by` varchar(30) DEFAULT NULL,
`product_name` varchar(30) DEFAULT NULL,
`expiry_date` date DEFAULT NULL,
PRIMARY KEY (`id`),
KEY `fk_product` (`product_id`),
KEY `fk_created_by` (`created_by_id`),
CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
CONSTRAINT `fk_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
)

# inventory_logs

Create Table: CREATE TABLE `inventory_logs` (
`id` int NOT NULL AUTO_INCREMENT,
`product_id` int NOT NULL,
`changed_by_id` int NOT NULL,
`change_type` enum('purchase','deduction','adjustment') NOT NULL,
`quantity_change` int NOT NULL,
`old_stock` int NOT NULL,
`new_stock` int NOT NULL,
`timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
`changed_by` varchar(30) DEFAULT NULL,
`user_role` enum('staff','manager','admin') DEFAULT NULL,
PRIMARY KEY (`id`),
KEY `product_id` (`product_id`),
KEY `changed_by` (`changed_by_id`),
CONSTRAINT `inventory_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
CONSTRAINT `inventory_logs_ibfk_2` FOREIGN KEY (`changed_by_id`) REFERENCES `users` (`id`))

## Requirements

- Node 18+ (or stable LTS)
- MySQL2
- (Optional) PM2 for production
- MySQL CLI or Workbench
- Postman to test apis

## Env variables

Create a `.env` file:

- DB_PASS=yourpassword
- JWT_SECRET_KEY=secretkey123
- NODE_ENV=development

## Setup & Run

1. Clone

```bash
git clone  meat_inventory_backend
cd meatinventory
npm install
mysql -u root -p

```

`mysql -u root -p` will prompt for the password you set for root
