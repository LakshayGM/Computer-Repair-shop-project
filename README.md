# Repair Shop Management System

This project is a full-stack web application designed for managing inventory, tracking transactions, and handling employee access for a computer repair shop. It uses a **Node.js/Express** backend with a **PostgreSQL** database and a responsive, glassmorphism-styled **HTML/CSS/JS** frontend.

## Project Structure and Files Overview

### 1. Backend & Configuration
- **`server.js`**: The main Express server entry point. It sets up API endpoints for authentication (`/login`), inventory management (`/items`, `/add-item`), transactions (`/transactions`, `/add-transaction`), and fetching users. It also serves the static frontend files.
- **`db.js`**: Contains the connection configuration for the PostgreSQL database using the `pg` library.
- **`setup_db.js`**: A database initialization script. Run this once to create the necessary tables (`users`, `items`) and seed the database with a default admin user.
- **`package.json` & `package-lock.json`**: Manage the project's dependencies (e.g., `express`, `pg`, `cors`) and custom scripts (like `npm start`).
- **`test_insert.js` & `scratch_cleanup.js`**: Utility and testing scripts created during the development process to test endpoints and clear scratch data.

### 2. Frontend (`public/` Directory)
The frontend relies on standard HTML/CSS/JavaScript without any heavy frameworks, using Chart.js for data visualization.

- **`index.html`**: The portal's entry point featuring a secure login screen.
- **`dashboard.html`**: The primary inventory management page. It includes bar and donut charts to visualize stock levels, a table of all current inventory items, and forms to add or update stock.
- **`transaction.html`**: The dedicated module for managing logs. Here users can select an item from inventory to log a transaction (i.e. parts used in a repair), deducting it automatically from the inventory stock.
- **`employees.html`**: A dashboard to view the registered personnel/users with system access.
- **`style.css`**: The central stylesheet providing the modern, dark-themed, glassmorphic UI across all HTML pages.
- **`script.js`**: The main frontend JavaScript logic. Handles handling forms, calling backend API routes, updating the DOM and charts dynamically, and exporting data as CSV.
- **`login_image.png`**: The backdrop graphic utilized on the main login page.

## Key Features
- **User Authentication**: Simple login mechanism before dashboard access is permitted.
- **Dynamic Inventory Dashboard**: Visualizes stock levels and color-codes "low stock" components automatically.
- **Linked Transactions**: Whenever a user records a transaction, the system dynamically deducts the used quantity from the main inventory.
- **CSV Exports**: Allows exporting the current state of both the inventory and transaction logs.
