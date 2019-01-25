//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null) {
  var mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'];
    mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'];
    mongoDatabase = process.env[mongoServiceName + '_DATABASE'];
    mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    mongoUser = process.env[mongoServiceName + '_USER'];

  // If using env vars from secret from service binding  
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    var mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;
  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};
const bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({    
  extended: true
})); 
app.use(bodyParser.json());
var recipes={"Spaghetti":{
    "name": "Spaghetti",
    "writer": 899,
    "description": "lrevnofn ",
    "rating": 4,
    "image": {
      // "small": "https://drive.google.com/file/d/1lWuG-WEIiuortryx5D8WQjaLOfmbkvcE/view",
      "large": "data:image/jpeg;base64,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"
	}
},"Cheesecake":{
	"name":"Cheesecake",
	"writer":"doctorwhocomposer",
	"description":"buwfeivnles",
	"rating":3,
	"image":{
		"small":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Making_cheese_cake.jpg/1200px-Making_cheese_cake.jpg",
		"large":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Making_cheese_cake.jpg/1200px-Making_cheese_cake.jpg"
		}
},"Burgers":{
	"name":"Burgers",
	"writer":"doctorwhocomposer",
	"description":"weogbnildk io1wdqne niowqw",
	"rating":2,
	"image":{
		"small":"https://bluewater.co.uk/sites/bluewater/files/styles/image_spotlight_large/public/images/spotlights/burger-cropped.jpg?itok=SeFYMFP6",
		"large":"https://bluewater.co.uk/sites/bluewater/files/styles/image_spotlight_large/public/images/spotlights/burger-cropped.jpg?itok=SeFYMFP6"
		
	}
	
}
};
var people={"doctorwhocomposer":{"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire"}};
app.get('/', function (req, res) {
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});
app.all('/allrecipes',function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
	
});
app.all('/people',function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
	
});
app.all('/user/',function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
	
});
app.get("/user/:user", function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	var person=req.params.user;
	res.send(people[person]);
});
app.get('/recipes/:user',function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	var userStr=req.params.user;
	var current=[];
	for(var r in recipes){
		if(recipes[r].writer==userStr){
			console.log("sending"+recipes[r]);
			current.push(recipes[r]);
			
		}
	}
	console.log(current);
	res.send(current);
	
});
app.get('/recipe/:recipe',function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	var recipe=req.params.recipe;
	console.log("request made for:"+recipe);
	res.send(recipes[recipe]);
})
app.get('/allrecipes',function(req,resp,next){
	console.log("request made for recipes");
	resp.send(recipes);
});

app.get('/people',function(req,resp,next){
	console.log("request made for people");
	resp.send(people);
	
});
app.listen(8080, ()=>{
	console.log("Listening on port 8080");
	
});
app.get("/isUser/:username",function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	var username=req.params.username;
	console.log("trying first");
	res.send(people.hasOwnProperty(username));
	
});
app.post("/newRecipe",function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	console.log("trying to post");
	console.log(req.body);
	console.log("title:"+req.body.title);
	console.log("writer:"+req.body.writer);
	console.log("description:"+req.body.description);
	recipes[req.body.title]={name: req.body.title,
	writer: req.body.writer,
    description: req.body.description ,
    rating: req.body.rating,
    image: {
      small: req.body.image,
     large: req.body.image}
	}
});
app.post("/people",function(req,res,next){
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	if(req.body.access_token=="concertina"){
		if(people.hasOwnProperty(req.body.username)){
			res.status(400);
		}else{
		people[req.body.username]={username:req.body.username,forename:req.body.forename,surname:req.body.surname}}
	}else{
		
		res.status(403);
	}
});
module.exports = app ;
