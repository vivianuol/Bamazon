var mysql = require("mysql");
const inquirer = require("inquirer");
const nodeTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
    readProducts();
  
});

function readProducts(){
    connection.query("SELECT * FROM products",function(err,res){
        if(err) throw err;
        // console.log(res);
        // displayResults(res);
        console.table(res);
        questions();
    })   
   
}

function questions() {
    return inquirer.prompt([
        {
            type:"input",
            name: "productId",
            message: "what is the ID of the item you would like to purchase?",
        }
        //   inquirer.prompt(questions, processAnswers);
        // {
        //     type:"input",
        //     name: "quantity",
        //     message: "How many do you want to buy?"
        // }
    ]).then(function(response1){
        console.log(response1);
        if ( response1.productId.toLowerCase() === "q" || response1.productId.toLowerCase()=== "q") {
            connection.end();
        } else{
            inquirer.prompt({
                    type:"input",
                    name: "quantity",
                    message: "How many do you want to buy?"
            }).then(function(response2){
                console.log(response2)
                if ( response2.quantity.toLowerCase() === "q" || response2.quantity.toLowerCase()=== "q") {
                    connection.end();
                } else {
                      console.log(response1,response2); calculate(response1, response2);  
                }
               
            })
            
        }
    })
}

function calculate (r1,r2) {
    console.log("Calculating the stock quantity after purchasing....")
    console.log("productId: " + r1.productId)
    console.log("quantity: " + r2.quantity)
    connection.query("SELECT stock_quantity FROM products WHERE item_id =" + r1.productId, function(err,res){
        if(err) throw err;
        console.log(res);
        console.log("the item " + r1.productId + "'s stock is " + res[0].stock_quantity);
        var updatedStock = res[0].stock_quantity - r2.quantity
        console.log(updatedStock);
        updateItems(r1.productId, updatedStock);
    })   
}


function updateItems(productId, stock) {

    console.log("Updating affected items...\n");

    var query = connection.query(
      "UPDATE products SET ? WHERE ?",
      [{
        stock_quantity: stock
      },{
        item_id: productId
      }],
      function(err, res) {
          if (err) {
              console.log(err)
          }
        console.log(res.affectedRows + "products updated!\n");
      }
    )
    console.log(query.sql);
    
    readProducts();
}