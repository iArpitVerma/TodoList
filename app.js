const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { process_params } = require("express/lib/router");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use("/public" , express.static("public"));
app.set('view engine', 'ejs');


//set up default mongoose connection
var db1 = mongoose.connect('mongodb+srv://admin-arpit:'+encodeURIComponent("Arpit#123") +'@cluster0.l1d59.mongodb.net/todolistDB',{useNewUrlParser: true , useUnifiedTopology: true})

//get he default connection
var db = mongoose.connection;

//bind the connection to error event
db.on('error', console.error.bind(console,'MongoDB connection error:'));

//Creating Schema
const itemsSchema = {
    name: String
};

//Creating Model
const Item = mongoose.model("Item" , itemsSchema);

//Creating Document
const item1 = new Item({
    name: "Welcome to todolist"
})

const item2 = new Item({
    name: "Hit the + to add new item"
})

const item3 = new Item({
    name: "<-- to delete the item"
})

const defaultItems = [item1 , item2 , item3];

const listSchema = {
    name: String,
    items : [itemsSchema]
};

const List = mongoose.model("List" , listSchema);

app.get("/" , function(req,res){
    
    Item.find({},function(err,foundItems){

        if(foundItems.length === 0){
            Item.insertMany(defaultItems ,(err) => {});
        }
        res.render("list" , {
            listTitle : "Today",
            newListItems : foundItems 
        });
    });
});


app.post("/" , function(req,res){
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name : itemName,
    })
    
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Deleted successfully");
          res.redirect("/");
        }
      });
    }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err, foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      });
    }
    
    });


app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    if(customListName == "Favicon.ico") return;

    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
            
                list.save();
            }else{
                res.render("list" , {
                    listTitle : foundList.name,
                    newListItems : foundList.items 
                });
               
            }
        }
    });
});

app.listen(3000 , function(){
    console.log("server working in port 3000");
})