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
      "small": "\images/foodExample1.jpg",
      "large": "/images/foodExample1.jpg"
	}
},"Cheesecake":{
	"name":"Cheesecake",
	"writer":"doctorwhocomposer",
	"description":"buwfeivnles",
	"rating":3,
	"image":{
		"small":"\images/foodExample3.jpg",
		"large":"\images/foodExample3.jpg"
		}
},"Burgers":{
	"name":"Burgers",
	"writer":"doctorwhocomposer",
	"description":"weogbnildk io1wdqne niowqw",
	"rating":2,
	"image":{
		"small":"\images/foodExample2.jpg",
		"large":"\images/foodExample2.jpg"
		
	}
	
}
};
var people={"doctorwhocomposer":{"username":"doctorwhocomposer", "forename":"Delia", "surname":"Derbyshire"}};
app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
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
app.listen(3000, ()=>{
	console.log("Listening on port 3000");
	
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
