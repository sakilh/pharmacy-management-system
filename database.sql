Here is the SQL script to create the tables for the Pharmacy Management System in MySQL, named 'hrm_db', along with the specified relationships and a sample user insertion.

SQL SCRIPT:
-- Create the database
DROP DATABASE IF EXISTS hrm_db;
CREATE DATABASE hrm_db;
USE hrm_db;

-- 1. tbl_crm_user (User Management)
-- Note: This table is assumed to already exist in a real CRM system.
-- For the purpose of a complete creation script, it's included here.
CREATE TABLE IF NOT EXISTS tbl_crm_user (
    user_id VARCHAR(50) PRIMARY KEY,
    user_pass VARCHAR(255) NOT NULL,
    user_department VARCHAR(100),
    user_type VARCHAR(50),
    user_status VARCHAR(20)
);

-- Sample user insertion for tbl_crm_user
INSERT INTO tbl_crm_user (user_id, user_pass, user_department, user_type, user_status) VALUES
('admin_pharmacy', 'hashed_password_123', 'Pharmacy', 'Administrator', 'Active');

-- 2. Manufacturers
CREATE TABLE IF NOT EXISTS Manufacturers (
    ManufacturerID INT AUTO_INCREMENT PRIMARY KEY,
    ManufacturerName VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    ContactPerson VARCHAR(100),
    PhoneNumber VARCHAR(20),
    Email VARCHAR(100)
);

-- 3. Products
CREATE TABLE IF NOT EXISTS Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(255) NOT NULL,
    GenericName VARCHAR(255),
    Strength VARCHAR(100),
    PharmaceuticalForm VARCHAR(100),
    RouteOfAdministration VARCHAR(100),
    ManufacturerID INT,
    ATC_Code VARCHAR(50),
    Description TEXT,
    PrescriptionRequired BOOLEAN,
    DrugIdentificationNumber VARCHAR(100),
    FOREIGN KEY (ManufacturerID) REFERENCES Manufacturers(ManufacturerID)
);

-- 4. ActiveIngredients
CREATE TABLE IF NOT EXISTS ActiveIngredients (
    IngredientID INT AUTO_INCREMENT PRIMARY KEY,
    IngredientName VARCHAR(255) NOT NULL,
    ChemicalFormula VARCHAR(100),
    TherapeuticClass VARCHAR(255)
);

-- 5. ProductIngredients (Junction table for Products and ActiveIngredients)
CREATE TABLE IF NOT EXISTS ProductIngredients (
    ProductID INT,
    IngredientID INT,
    QuantityPerUnit VARCHAR(50),
    PRIMARY KEY (ProductID, IngredientID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (IngredientID) REFERENCES ActiveIngredients(IngredientID)
);

-- 6. Inventory
CREATE TABLE IF NOT EXISTS Inventory (
    InventoryID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    BatchNumber VARCHAR(100) NOT NULL,
    ExpiryDate DATE,
    QuantityInStock INT NOT NULL DEFAULT 0,
    Location VARCHAR(100),
    CostPrice DECIMAL(10, 2),
    SellingPrice DECIMAL(10, 2),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- 7. Suppliers
CREATE TABLE IF NOT EXISTS Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    SupplierName VARCHAR(255) NOT NULL,
    ContactPerson VARCHAR(100),
    PhoneNumber VARCHAR(20)
);

-- 8. PurchaseOrders
CREATE TABLE IF NOT EXISTS PurchaseOrders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    SupplierID INT NOT NULL,
    OrderDate DATE NOT NULL,
    ExpectedDeliveryDate DATE,
    Status VARCHAR(50), -- e.g., 'Pending', 'Ordered', 'Received', 'Cancelled'
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID)
);

-- 9. OrderDetails
CREATE TABLE IF NOT EXISTS OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    OrderedQuantity INT NOT NULL,
    ReceivedQuantity INT DEFAULT 0,
    UnitPriceAtPurchase DECIMAL(10, 2),
    FOREIGN KEY (OrderID) REFERENCES PurchaseOrders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);

-- 10. Customers
CREATE TABLE IF NOT EXISTS Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerName VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    PhoneNumber VARCHAR(20)
);

-- 11. Sales
CREATE TABLE IF NOT EXISTS Sales (
    SaleID INT AUTO_INCREMENT PRIMARY KEY,
    SaleDate DATETIME NOT NULL,
    CustomerID INT,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- 12. SaleDetails
CREATE TABLE IF NOT EXISTS SaleDetails (
    SaleDetailID INT AUTO_INCREMENT PRIMARY KEY,
    SaleID INT NOT NULL,
    ProductID INT NOT NULL,
    QuantitySold INT NOT NULL,
    UnitPriceAtSale DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (SaleID) REFERENCES Sales(SaleID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);