# Minimal Meat Inventory System — Backend

Minimal working backend module for meat inventory management.

## Features

- JWT authentication with 3 roles: `admin`, `manager`, `staff`
- Product CRUD with soft-delete (`is_active`) and stock updates
- Stock deduction routes
- Purchase/source tracking (each purchase row links to product)
- Inventory logs tracking every stock change
- APIs for low-stock alerts

 ## To test APIs in Postman, you will be added to the shared workspace.
 
## Database schema and Dump file included

## ER diagram included

## Requirements

- Node 18+ (or stable LTS)
- MySQL2
- (Optional) PM2 for production
- MySQL CLI or Workbench
- Postman to test apis

## Env variables

Create a `.env` file:

- DB_PASS=your_password
- JWT_SECRET_KEY=your_secret_key
- NODE_ENV=development

## Setup & Run

1. Clone

```bash
https://github.com/SushantPokhrel/meat_inventory_backend.git
cd meatinventory
npm install
mysql -u root -p
mysql -u your_mysql_user -p < database_dump.sql


```

`mysql -u root -p` will prompt for the password you set for root in workbench

