//Declare server parameters
express = require('express');
sql = require('mssql');
path = require('path');
events = require('events');
cookieParser = require('cookie-parser');
//session = require('express-session');
validator = require('express-validator');
exphbs = require('express-handlebars');
dotenv = require('dotenv').config();
//flash = require('connect-flash');
admin = require("firebase-admin");
NodeRSA = require('node-rsa');
serviceAccount = require("./quaero_operations_serviceAccountKey.json");
app = express();
/*app.use(session({
  secret:'ThisIsAnExtremelySecretSessionKeyThatMustBeStoreSafely',
  resave: true,
  saveUninitialized: true
}));*/

var routes = require('./routes/index');
var users = require('./routes/users');
var wf_man = require('./routes/wf_man');

//Configure Helpers
var hbs = exphbs.create({
  helpers : {
    
  }
});

// Create an eventEmitter object
emitter = new events.EventEmitter();

//To parse JSON fields
app.use(express.json())

//To parse url encoded params
app.use(express.urlencoded({
  extended: true
}));


app.use(cookieParser());

var port = process.env.PORT;
var hostname = process.env.HOSTNAME;

//View Engine
app.set('views',path.join(__dirname,'views'));
app.engine('handlebars',hbs.engine);
app.set('view engine','handlebars');

app.use('/',routes);
app.use('/users',users);
app.use('/wf_man',wf_man);

//Serve the website
app.use(express.static('public'))

//Start Server and listen for requests
var server  = app.listen(port,hostname,function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});


//Initialize Firebase App
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://quaero-operations.firebaseio.com"
});

//Get the current firebase database instance
firebase = admin.database();

acquireTokenAsString = function(token)
{    
    if(!token)
        token = "none";
    return token;
}
