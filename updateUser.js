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


// DB access 
// db.users.update( {"_id":"lalaland"},{ $set :{"profile.bio": "my new bio3"}},{upsert:false})
const collection = 'users';

app.post('/', (req, res, next) => {
  const { MONGO_URL, category , key, text } = req.webtaskContext.data;
  console.log(  req.user.sub, category , key, text );
  const catDotKey = category + "." + key;
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) return next(err);
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
