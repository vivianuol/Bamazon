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
        console.log(res[2].item_id);
        // displayResults(res);
        console.table(res);
        questions(res);
    })   
   
}

function questions(res) {
    return inquirer.prompt([
        {
            type:"input",
            name: "productId",
            message: "what is the ID of the item you would like to purchase?(press Q to quit)",
            validate: function validation(id) {
                // console.log( "\n input:"+id);
                var item_list = [];
                 for (var i=0; i<res.length; i++ ) {
                    //  console.log("item_id:"+res[i].item_id);
                     item_list.push((res[i].item_id).toString(10))
                 }
                //  console.log(item_list);
                //  console.log(item_list.includes(id.toString(10)));
                    if ( item_list.includes(id.toString(10)) || id.toLowerCase().trim() == "q" ) {
                      return true;
                    } else {
                    console.log("please input a valid item_id!")
                      return false;
                    } 
               }         
            }
        
    ]).then(function(response1){
        console.log(response1);
        if ( response1.productId.toLowerCase().trim() === "q" || response1.productId.toLowerCase().trim()=== "q") {
            connection.end();
        } else{
            inquirer.prompt({
                    type:"input",
                    name: "quantity",
                    message: "How many do you want to buy?(press Q to quit)"
            }).then(function(response2){
                console.log(response2)
                if ( response2.quantity.toLowerCase().trim() === "q" || response2.quantity.toLowerCase().trim()=== "q") {
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