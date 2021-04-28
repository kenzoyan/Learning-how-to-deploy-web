//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-kenzo:Test123@cluster0.dpnyq.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String,
};

const listSchema ={
  name:String,
  items: [itemsSchema]
};

const List =mongoose.model("List",listSchema);
const Item = mongoose.model("Item", itemsSchema);


const ex1 = new Item({
  name: "Buy food"
});
const ex2 = new Item({
  name: "Cook food"
});
const ex3 = new Item({
  name: "Eat food"
});
const defaultitems = [ex1, ex2, ex3];

const today = date.getDate();


app.get("/", function(req, res) {


  Item.find({}, function(err, founditems) {

    if (founditems.length === 0) {
      Item.insertMany(defaultitems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved default items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: today,
        newListItems: founditems
      });
    }
  });

});


app.get("/:customListName", function(req, res) {
  const customListName =_.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundList){
    if (!err){
      if (!foundList){
        const list = new List({
          name: customListName,
          items: defaultitems,
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  })

});


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listname = req.body.list;

  const newitem =new Item({
    name:itemName,
  });

  if(listname===today){
    newitem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listname},function(err,foundList){
      foundList.items.push(newitem);
      foundList.save();
      res.redirect("/"+listname);
    });
  }
});


app.post("/delete", function(req, res) {
 const checkItemId= req.body.checkbox
 const listname = req.body.listName;

 if(listname===today){
   Item.findByIdAndRemove(checkItemId,function(err){
     if (!err){
       console.log("Successfully Delete Item");
       res.redirect("/");
     }
   });
 }else{
   List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkItemId}}},function(err,foundList){
     if (!err){
       console.log("Successfully Delete Item");
       res.redirect("/"+listname);
     }
   });
 }
});






app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(3000, function() {
  console.log("Server started Successfully");
});
