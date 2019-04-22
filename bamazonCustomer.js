var inquirer = require("inquirer");
var mysql = require("mysql");
var table = require('table');

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "zoecayxav314159",
    database: "bamazon"
  });
  
  //----------CODE STARTS HERE--------------------
  displayData();
  
  //Function to display data
  function displayData() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw (err);

        let data = [],
                tables = [],
                output;

        tables = ["ID", "PRODUCT", "DEPARTMENT", "PRICE", "QUANTITY"];
        data.push(tables);

            //format object data into an array for the table
            for (var i = 0; i < res.length; i++) {
                tables = [];
                tables.push(res[i].id, res[i].product_name, res[i].department_name, "$"+res[i].price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'), res[i].stock_quantity);
                data.push(tables);
            }  
            //output the data
            output = table.table(data);
            console.log(output);
            promptBuy();
    })
}

function promptBuy() {
    inquirer.prompt ([
        {
            type:           "input",
            message:        "Please enter the ID number of the product you wish to buy:",
            name:           "productID"    
        },
        {
            type:           "input",
            message:        "Please enter the quantity you wish to buy",
            name:           "quantity"
        }
    ]).then (function (inquirerResponse) {
        //Make sure the response is a number
        if (isNaN(inquirerResponse.productID) || isNaN(inquirerResponse.quantity)) {
            console.log('Please enter a valid response [numbers only]');
            promptBuy();
        } else {
            //Check the inventory to see if the quantity to purchase exists
            var query = connection.query(
                "SELECT * FROM products WHERE id = ?",[inquirerResponse.productID],function(err, res) 
                {
                    if (inquirerResponse.quantity > res[0].stock_quantity) {
                        console.log('Insufficient Quantity!');
                        mainMenu();
                    } else {
                        newQuantity = res[0].stock_quantity - inquirerResponse.quantity;
                        getCost(inquirerResponse.productID, inquirerResponse.quantity, newQuantity);
                    }
    
                })

        }
    })
}

function getCost(id, buy, stock) {
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: stock
          },
          {
             id: id 
          }
        ],
        function(err, res) {
            if (err) throw (err);
        }
      );

    connection.query("SELECT * FROM products WHERE id = ?",[id], function(err, res) {
        //format object data into an array for the table
            let data = [];
            let tables = [];
            tables.push("PRODUCT", "DEPARTMENT NAME", "PRICE", "QUANTITY", "TAX", "TOTAL");
            data.push(tables);
            tables = [];
            let semi = buy * res[0].price;
            let tax = semi * .0825;
            let total = semi + tax;
            tables.push(res[0].product_name, res[0].department_name, res[0].price, buy, tax.toFixed(2), total.toFixed(2));
            data.push(tables);

            //Update sales into database
            totalSales = total.toFixed(2) + parseFloat(res[0].product_sales);
            totalSales = parseFloat(totalSales).toFixed(2);
            connection.query("UPDATE products SET ? WHERE ?", 
            [
                {
                    product_sales:  totalSales 
                }, 
                {
                    id: id
                }
            ]), function (err) {if (err) throw err;}
                
            //output the data
            output = table.table(data);
            console.log(output);
            connection.end();
    })
}


 

 

 
