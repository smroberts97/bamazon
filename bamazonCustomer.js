
// Required node modules.

var mysql = require("mysql");

var inquirer = require("inquirer");

var Table = require("cli-table");

// Connects to the database.

var connection = mysql.createConnection({

  host: "localhost",

  port: 3306,


  // Root is default username.

  user: "root",

  password: "root",

  database: "bamazon"

});


// If connection doesn't work, throws error

connection.connect(function(err) {

  if (err) throw err;


  // Displays list of available products.

  displayProducts();

});

// Displays list of all available products.

var displayProducts = function() {

	var query = "Select * FROM products";

	connection.query(query, function(err, res) {
		if (err) throw err;

        var table = new Table({
            head: ['Product ID', 'Product Name', 'Stock Quantity', 'Price']
          , colWidths: [15, 50, 16, 15]
        });
        
        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name, res[i].stock_quantity, res[i].price]
              
            );
          
		}
        console.log(table.toString());


  		requestProduct();

	});

};

// Requests product and number of product items

var requestProduct = function() {

	inquirer.prompt([{

		name: "productID",

		type: "input",

		message: "Please enter product ID for product you would like to purchase.",

		validate: function(value) {

			if (isNaN(value) === false) {

				return true;

			}

			return false;
		}

	}, {

		name: "productUnits",

		type: "input",

		message: "How many would you like?",

		validate: function(value) {

			if (isNaN(value) === false) {

				return true;

			}

			return false

		}

	}]).then(function(answer) {



		// Queries database for selected product.

		var query = "Select stock_quantity, price, department_name FROM products WHERE ?";

		connection.query(query, { item_id: answer.productID}, function(err, res) {
		

			if (err) throw err;

			var available_stock = res[0].stock_quantity;

			var price_per_unit = res[0].price;

			// Checks enough inventory to process request.

			if (available_stock >= answer.productUnits) {


				completePurchase(available_stock, price_per_unit, answer.productID, answer.productUnits);

			} else {


                console.log("\n");
				console.log("Sorry, there isn't enough of that item in stock!");
				console.log("\n");
				displayProducts();


				requestProduct();
			}
		});

	});
};


var completePurchase = function(availableStock, price, selectedProductID, selectedProductUnits) {

	// Updates stock quantity once purchase complete.

	var updatedStockQuantity = availableStock - selectedProductUnits;

	// Calculates total price for purchase based on unit price, and number of units.

	var totalPrice = parseFloat(price * selectedProductUnits);

	// Updates stock quantity on the database

	var query = "UPDATE products SET ? WHERE ?";

	connection.query(query, [{

		stock_quantity: updatedStockQuantity,

	}, {

		item_id: selectedProductID

	}], function(err, res) {


		if (err) throw err;


        console.log("\n");
		console.log("Congratulations!, your purchase is complete.");


		console.log("Thank you, the payment has been received in the amount of : " + totalPrice);
        console.log("\n");
        

	});
    displayProducts();
};