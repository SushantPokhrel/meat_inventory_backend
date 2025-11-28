# Minimal Meat Inventory System — Backend

Minimal working backend module for meat inventory management.

## Features
- JWT authentication with 3 roles: `admin`, `manager`, `staff`
- Product CRUD with soft-delete (`is_active`) and stock updates
- Stock deduction routes
- Purchase/source tracking (each purchase row links to product)
- Inventory logs tracking every stock change
- APIs for low-stock 


## Requirements
- Node 18+ (or stable LTS)
- MySQL2 
- (Optional) PM2 for production
- MySQL CLI or Workbench 
- Postman to test apis

## Env variables
Create a `.env` file:
DB_PASS=yourpassword
JWT_SECRET_KEY=secretkey123
NODE_ENV=development

