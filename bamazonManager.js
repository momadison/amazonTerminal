var inquirer = require("inquirer");
var mysql = require('mysql');
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

mainMenu();

function mainMenu() {
    inquirer.prompt([
        {
            type:       "list",
            choices:    ["View Products for Sale","View Low Inventory","Add to Inventory","Add New Product", "Quit"],
            name:       "Menu"
        }
    ]).then (function(menuResponse) {
        switch (menuResponse.Menu) {
            case "View Products for Sale":
                viewProducts();
                break;
            case "View Low Inventory":
                viewLowInventory();
                break;
            case "Add to Inventory":
                increaseStock();
                break;
            case "Add New Product":
                addProduct();
                break;
            case "Quit":
                process.exit();
                break;
        }
    })
}


function viewProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw (err);
        outputTable(res);
        mainMenu();
    })
}

function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 30", function(err, res) {
        if (err) throw (err);
        outputTable(res);
        mainMenu();
    })
}

function increaseStock() {
    let purchased, id;
    inquirer.prompt([
        {
            type:   "input", 
            message: "Please enter the ID of the item you wish to add to:",
            name:    "ID"
        },
        {
            type:   "input",
            message: "Please enter how many items you wish to add:",
            name:   "quantity"
        }
    ]).then (function(stockResponse) {
        id = stockResponse.ID;
        connection.query("SELECT stock_quantity FROM products WHERE id = ?",[stockResponse.ID], function(err, res) {
            purchased = parseInt(res[0].stock_quantity) + parseInt(stockResponse.quantity);
            connection.query("UPDATE products SET ? WHERE ?", 
                [
                    {
                        stock_quantity:        purchased
                    },
                    {
                        id: id
                    }
                ], function(err) {
                if (err) throw (err);
                mainMenu();
            })
        })
})
}

function addProduct() {
    let depName = [];
connection.query("SELECT department_name FROM departments", function (err, res) {
    if (err) throw (err);
    
    //push department names into an array to use for choices
    for (var i = 0; i < res.length; i++) {
        depName.push(res[i].department_name);
    }
    inquirer.prompt([
        {
            type:   "input", 
            message: "Please enter the name of the product you'd like to add:",
            name:    "productName"
        },
        {
            type:   "list", 
            message: "Please enter the department of the product:",
            choices:  depName,
            name:    "productDepartment"
        },
        {
            type:   "input", 
            message: "Please enter the price of the product:",
            name:    "productPrice"
        },
        {
            type:   "input",
            message: "Please enter how many items you wish to add:",
            name:   "productQuantity"
        }
    ]).then (function(addResponse) {
        query = connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales) VALUES ("
        + "'" + addResponse.productName + "','" + addResponse.productDepartment + "','" + addResponse.productPrice + "','" 
        + addResponse.productQuantity + "',0)", function(err, res) {
            if (err) throw (err);
            mainMenu();
        })
    })
})
}

function outputTable(res) {
        let data = [], tables = [], output;
        tables = ["ID", "PRODUCT", "DEPARTMENT", "PRICE", "QUANTITY", "PRODUCT SALES"];
        data.push(tables);

        //format object data into an array for the table
        for (var i = 0; i < res.length; i++) {
            tables = [];
            tables.push(res[i].id, res[i].product_name, res[i].department_name, "$"+res[i].price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'), res[i].stock_quantity, "$"+res[i].product_sales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
            data.push(tables);
        }  
        //output the data
        output = table.table(data);
        console.log(output);
}