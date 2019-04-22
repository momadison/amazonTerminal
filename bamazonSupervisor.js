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
            choices:    ["View Product Sales by Department", "Create New Department"],
            name:       "Menu"
        }
    ]).then (function(menuResponse) {
        switch (menuResponse.Menu) {
            case "View Product Sales by Department":
                viewProductSales();
                break;
            case "Create New Department":
                addDepartment();
                break;
        }
    })
}

function viewProductSales() {
    let data = [], tables = [], output, sales = 0;
    //push headers into table
    tables = ["DEPARTMENT ID", "DEPARTMENT NAME", "OVERHEAD COSTS", "PRODUCT SALES", "TOTAL PROFIT"];
    data.push(tables);
    //Get everything from departments
    connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw (err);
        //Get everything from products
        connection.query("SELECT * FROM products", function(err, res2) {
            //For every department add up the department sales
            for (var i = 0; i < res.length; i ++) {
                sales = 0;
                for (var x = 0; x < res2.length; x++) {
                    if (res2[x].department_name === res[i].department_name) {
                        sales = sales + res2[x].product_sales;
                    }
                }
                //push all data into data array
                tables = [];
                profit = sales - res[i].over_head_costs;
                tables.push(res[i].department_id, res[i].department_name, "$"+res[i].over_head_costs.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'), 
                "$" + sales.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'), "$" + profit.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));
                data.push(tables);
            }
            //output the data
            output = table.table(data);
            console.log("\n"+output);
            mainMenu(); 
        })   
    })
}

function addDepartment() {
let depCheck = false;
    inquirer.prompt([
        {
            type:       "input",
            message:    "please enter the name of the department you would like to add",
            name:       "departmentName"
        },
        {
            type:       "input",
            message:    "please add the department's overhead costs",
            name:       "departmentCost"
        }
    ]).then (function (response) {
        connection.query("SELECT * FROM departments", function (err, res) {
            if (err) throw (err)
            for (var i = 0; i < res.length; i++) {
                if (res[i].department_name.toLowerCase() === response.departmentName.toLowerCase()) {
                    console.log('That department already exists');
                    depCheck = true;
                    mainMenu();
                }
            }
        if (depCheck === false) {
            connection.query("INSERT INTO departments (department_name, over_head_costs) VALUE ("+"'"+response.departmentName+"','"+response.departmentCost+"')",
                function (err) {
                    if (err) throw (err)
                    console.log("Successfully Added!");
                    mainMenu();
                })
        }
            
        })
    })
}


