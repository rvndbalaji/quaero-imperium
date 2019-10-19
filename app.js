//Declare server parameters
express = require('express');
sql = require('mssql');
fs = require('fs');
dotenv = require('dotenv').config();
admin = require("firebase-admin");
crypto = require('crypto',);
app = express();
var https = require('https');
var path = require("path");
var routes = require('./routes/index');
var users = require('./routes/users');
var wf_man = require('./routes/wf_man');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf} = format;
const DailyRotateFile = require('winston-daily-rotate-file');

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}\t${level}\t${message}`;
});

Date.prototype.getMonthName = function() {
  var monthNames = [ "January", "February", "March", "April", "May", "June", 
                     "July", "August", "September", "October", "November", "December" ];
  return monthNames[this.getMonth()];
}

var logRecycler = new (DailyRotateFile)({
  filename: 'imperium_global_%DATE%.log',
  auditFile : 'host/logs/imperium_log_audit',
  dirname : 'host/logs/',
  datePattern: 'DDMMYYYY',  
  maxSize: '200m',
  maxFiles: '10d'
});
//Create a Logger

function getTimeZone(mydate)
{
  zone_string = (mydate.toString().match(/\(([A-Za-z\s].*)\)/)[1]);
  try
  {    
    zone_word = zone_string.split(' ');
    return zone_word[0][0] + zone_word[1][0] + zone_word[2][0]
  }
  catch(err){
    return zone_string
  }
  
}


logger = createLogger({
  format: combine(    
    timestamp({ format: () => { 
      let mydate = new Date()
      return mydate.getDate() + ' ' + mydate.getMonthName() + ' '  + mydate.getFullYear() + ' - ' + mydate.toLocaleTimeString() + ' ' + getTimeZone(mydate);
     } }),
    myFormat
  ),
  transports: [        
    new transports.Console(),
    //new transports.File({ filename: './host/logs/imperium_global.log',/*options: { flags: 'w' }*/}),
    logRecycler
  ],
  exitOnError: false, // <--- set this to false

});

logger.info('server\tWelcome to Quaero Imperium');
logger.info('server\tLogger Initialized');
//To parse JSON fields
app.use(express.json())

//To parse url encoded params
app.use(express.urlencoded({
  extended: true
}));


var port = process.env.PORT;
var hostname = process.env.HOSTNAME;

//Fetch the Firebase ServiceAccountJSON values
var serviceAccount = {
  "type": process.env.type,
  "project_id": process.env.project_id,
  "private_key_id": process.env.private_key_id,
  "private_key": process.env.private_key.replace(/\\n/g, '\n'),
  "client_email": process.env.client_email,
  "client_id": process.env.client_id,
  "auth_uri": process.env.auth_uri,
  "token_uri": process.env.token_uri,
  "auth_provider_x509_cert_url": process.env.auth_provider_x509_cert_url,
  "client_x509_cert_url": process.env.client_x509_cert_url
}
app.use('/',routes);
app.use('/users',users);
app.use('/wf_man',wf_man);

//Serve the website
app.use(express.static('client/build'))


app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/build/index.html'), function(err) {
    if (err) {
      res.status(500).send(err)
    }
  })
})
logger.info('server\tServing site');
const options = {
  key : fs.readFileSync('./host/certificates/imperium.key'),
  cert : fs.readFileSync('./host/certificates/imperium.crt'),
  passphrase : process.env.https_passphrase
}

var httpsServer = https.createServer(options, app);

//Start Server and listen for requests
var server  = httpsServer.listen(port,hostname,function(){
  logger.info(`server\tServer running at https://${hostname}:${port}/`);
});

//Initialize Firebase App
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL
});
logger.info('server\tFirebase Initialized');
//Get the current firebase database instance
firebase = admin.firestore().collection('root');

acquireTokenAsString = function(token)
{    
    if(!token)
        token = "none";
    return token;
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

encrypt = function(text) {
	let iv = crypto.randomBytes(IV_LENGTH);
	let cipher = crypto.createCipheriv('aes-256-cbc', new Buffer.from(ENCRYPTION_KEY), iv);
	let encrypted = cipher.update(text);

	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString('hex') + ':' + encrypted.toString('hex');
}

decrypt = function(text) {
	let textParts = text.split(':');
	let iv = new Buffer.from(textParts.shift(), 'hex');
	let encryptedText = new Buffer.from(textParts.join(':'), 'hex');
	let decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer.from(ENCRYPTION_KEY), iv);
	let decrypted = decipher.update(encryptedText);

	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}


process.on('unhandledRejection', (reason, promise) => {  
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use  
  logger.error('server\t' + 'Unhandled Rejection at : ' + reason.stack || reason);
}).on('uncaughtException', err => {  

  logger.error('server\t' + 'Fatal Exception at : ' + err.stack || err);
  process.exit(1);
});