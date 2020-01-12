// The customer module is part of bamazon.

// Users can view a list of products in bamazon.

// And select to purchase products.


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

  // Password is empty string.

  password: "Marine6226@@",

  database: "bamazon"

});


// If connection doesn't work, throws error, else...

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
          
            /*
			console.log("Product ID: " + res[i].item_id + " || Product Name: " +
						res[i].product_name + "|| Stock Quantity: " + res[i].stock_quantity
                         +" || Price: " + res[i].price);
            */
		}
        console.log(table.toString());
        //console.log("\n");
		// Requests product and number of product items user wishes to purchase.

  		requestProduct();

	});

};

// Requests product and number of product items user wishes to purchase.

var requestProduct = function() {

	inquirer.prompt([{

		name: "productID",

		type: "input",

		message: "Please enter product ID for product you want.",

		validate: function(value) {

			if (isNaN(value) === false) {

				return true;

			}

			return false;
		}

	}, {

		name: "productUnits",

		type: "input",

		message: "How many units do you want?",

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

			// Checks there's enough inventory  to process user's request.

			if (available_stock >= answer.productUnits) {

				// Processes user's request passing in data to complete purchase.

				completePurchase(available_stock, price_per_unit, answer.productID, answer.productUnits);

			} else {



				// Tells user there isn't enough stock left.
                console.log("\n");
				console.log("Sorry, there isn't enough of that item in stock!");
				console.log("\n");
				displayProducts();

				// Lets user request a new product.

				requestProduct();
			}
		});

	});
};

// Completes user's request to purchase product.

var completePurchase = function(availableStock, price, selectedProductID, selectedProductUnits) {

	// Updates stock quantity once purchase complete.

	var updatedStockQuantity = availableStock - selectedProductUnits;

	// Calculates total price for purchase based on unit price, and number of units.

	var totalPrice = parseFloat(price * selectedProductUnits);

	// Updates stock quantity on the database based on user's purchase.

	var query = "UPDATE products SET ? WHERE ?";

	connection.query(query, [{

		stock_quantity: updatedStockQuantity,

	}, {

		item_id: selectedProductID

	}], function(err, res) {


		if (err) throw err;

		// Tells user purchase is a success.
        console.log("\n");
		console.log("Congratulations!, your purchase is complete.");

		// Display the total price for that purchase.

		console.log("Thank you, the payment has been received in the amount of : " + totalPrice);
        console.log("\n");
        
		// Displays products so user can make a new selection.

	});
    displayProducts();
};