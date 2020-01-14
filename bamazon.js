drop database if exists bamazon;

CREATE DATABASE bamazon;



USE bamazon;



CREATE TABLE products (

  item_id INT NOT NULL AUTO_INCREMENT,

  product_name VARCHAR(100) NOT NULL,

  department_name VARCHAR(50) NULL,

  price DECIMAL(7,2) NOT NULL,

  stock_quantity INT NOT NULL DEFAULT '1',
  
  PRIMARY KEY (item_id)

);

Select * From products;


insert into products(product_name, department_name, price, stock_quantity, product_sales)
   value ("Dumbo", "Plush", 19.99, 500, 25);
