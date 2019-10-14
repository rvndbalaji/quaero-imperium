//Declare server parameters
express = require('express');
sql = require('mssql');
validator = require('express-validator');
dotenv = require('dotenv').config();
admin = require("firebase-admin");
crypto = require('crypto',);
app = express();

var routes = require('./routes/index');
var users = require('./routes/users');
var wf_man = require('./routes/wf_man');

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

//Start Server and listen for requests
var server  = app.listen(port,hostname,function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});

//Initialize Firebase App
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.databaseURL
});

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
