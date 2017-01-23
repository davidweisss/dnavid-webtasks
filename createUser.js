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

//app.get('/', (req, res) => {
//  // add your logic, you can use scopes from req.user
//  res.json({hi : req.user.sub});
//});

// DB access 
const collection = 'users';

app.get('/', (req, res, next) => {
  const { MONGO_URL, pseudo, bio } = req.webtaskContext.data;
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) return next(err);
    db.collection(collection).insertOne(
      {
      _id: pseudo,
      profile: {
        auth0_id: req.user.sub,
        bio: bio
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
