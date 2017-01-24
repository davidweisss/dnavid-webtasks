'use latest';

// DB access
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';
import { fromExpress } from 'webtask-tools';
import assert from 'assert';

const app = express();

// app.use(bodyParser.json());

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

app.get('/', (req, res, next) => {
  const { MONGO_URL, uid } = req.webtaskContext.data;
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) return next(err);
    db.collection(collection).findOne(
      {
        
      "profile.auth0_user_id": uid
      },
        (err, result) => {
      db.close();
      console.log(result.length());
      if (err) return next(err);
      res.status(201).send(result);
    });
  });
});

module.exports = fromExpress(app);
