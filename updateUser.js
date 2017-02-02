'use latest';

// DB access
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';
import { fromExpress } from 'webtask-tools';

const app = express();

app.use(bodyParser.json());

// To retrieve JSON Web Key
const jwksRsa = require('jwks-rsa');
const jwt = require('express-jwt');

// Authentication
app.use((req, res, next) => { 
  const issuer = 'https://' + req.webtaskContext.secrets.AUTH0_DOMAIN + '/';
  jwt({
    secret: new Buffer(req.webtaskContext.secrets.CLIENT_SECRET, 'base64'),
    audience: req.webtaskContext.secrets.AUDIENCE,
    issuer: issuer,
  })(req, res, next);
});

app.get('/test', (req, res) => {
  // test endpoint, no-operation
  res.send(200);
});

const collection = 'users';

app.post('/', (req, res, next) => {
  var { MONGO_URL, category, subcategory, key, text,json } = req.webtaskContext.data;
  if(!category){
    console.log("category is not defined, key is: ",key);
    var catDotKey = key;
    text= text;
  }
  else if(!subcategory){
         console.log("subcategory is not defined, category is: ", category);
  var catDotKey = category + "." + key;
  }else if(category && subcategory){
    console.log("subcategory is defined, and is: ", subcategory);
    var catDotKey = category + "." + subcategory + "." + key;
 }
  
  if(json){
    console.log("Parsing JSON")
    text = JSON.parse(text)
    
  }
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) return next(err);
    console.log(catDotKey,text)
    db.collection(collection).updateOne(
      {"profile.auth0_user_id": req.user.sub},
      {$set : {
        [catDotKey]: text
    }
    },
        (err, result) => {
      db.close();
      if (err) return next(err);
      res.status(201).send(result);
    });
  });
});

module.exports = fromExpress(app);
