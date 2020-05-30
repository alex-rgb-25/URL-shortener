var express = require ("express");
var app = express();
var mongoose = require("mongoose");
autoIncrement = require('mongoose-auto-increment');
var bodyParser = require('body-parser');
var dns = require('dns');

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

const uri = "mongodb+srv://alex:1234@cluster0-5eknc.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(uri, {  useNewUrlParser: true,  useUnifiedTopology: true})
.then(() => {  console.log("mongoDB connected...")})
.catch(err => console.log(err))

//Get the default connection
var db = mongoose.connection;
autoIncrement.initialize(mongoose.connection);
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));

var Schema = mongoose.Schema;

var urlSchema = new Schema({
    url: String
  });
  urlSchema.plugin(autoIncrement.plugin, 'UrlModel');
  var UrlModel = mongoose.model('UrlModel', urlSchema );

app.get("/",function(req, res){
    UrlModel.find({}, function(err, allUrls){
        if(err){
            console.log(err);
        }else{
            res.render("home.ejs", {urls:allUrls});
        }
    });
})

app.post('/', function(req, res){
    const username = req.body.username
    var new_url = {
        url: req.body.username
    }
    var newUrl = {url:username};


    UrlModel.findOne({url:req.body.username}, function(err, found){
        if(found==null){

    //check if it's valid url
    dns.lookup(req.body.username, function(err, addresses){
        console.log('addresses: %j', addresses)
        if(addresses == undefined){
            res.json({"orginal_url": "invalid url"})
        }else{
            UrlModel.create(newUrl, function(err, newlyCreated){
                if(err){
                    console.log(err);
                }else{
                    res.json({"orginal_url":req.body.username, "short_url": newlyCreated._id}) 
                }
            
            })
        
        }
    })
        }else{
            res.json({"error":"The url is already in the database"});
        }
    })

  console.log("hit the post route"+ req.body.username);
})

app.get("/shorturl/:name",function(req, res){

    UrlModel.findOne({url:req.params.name}, function(err, newlyFound){
        if(err){
            console.log(err);
        }else{

           //look for the host name and get the ip address
            dns.lookup(req.params.name, function(err, addresses){
                console.log('addresses: %j', addresses)
               if(addresses == undefined){
                   res.json({"orginal_url": "invalid url"})
               }else{
                UrlModel.create(newUrl, function(err, newlyCreated){
                    if(err){
                        console.log(err);
                    }else{
                        res.json({"orginal_url":req.params.name, "short_url": newlyCreated._id}) 
                    }
                
                })
            
               }

    })
    }
  })
})


app.get("/:id", function(req, res){

    UrlModel.findById(req.params.id, function(err, found){

        if(err){
            console.log("found error: " + err);
        }else{
            if(found==null){
                res.json({'error': "The URL is not in the DB"})
            }else{
                res.status(301).redirect(`http://${found.url}`)
            }
        }
    })
})



app.get("/api/shorturl/:new", function(req, res){

    const name = req.params.new
    var new_url = {
        url: req.params.new
    }
    var newUrl = {url:name};
    UrlModel.findOne({url:req.params.new}, function(err, found){
        if(found==null){
//check if it's valid url
    dns.lookup(req.params.new, function(err, addresses){
        console.log('addresses: %j', addresses)
    if(addresses == undefined){
        console.log("THIS IS HOW I CHECK");
        res.json({"orginal_url": "invalid url"})
    }else{
        UrlModel.create(newUrl, function(err, newlyCreated){
            if(err){
                console.log(err);
            }else{
                res.json({"orginal_url":req.params.new, "short_url": newlyCreated._id}) 
            }
        })

    }

    })
        }else{
            res.json({"error":"The url is already in the database"});
        }
    })

})

app.listen(process.env.PORT || 3000, function(req, res){
    console.log("Server starting on port 3000");
})