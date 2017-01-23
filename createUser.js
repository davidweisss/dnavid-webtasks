////////////////////////////////////////////////
// Libraries
////////////////////////////////////////////////
'use latest';

// DB access
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';

// Authentication
// import express from 'express';
import { fromExpress } from 'webtask-tools';
// import bodyParser from 'body-parser';
const app = express();

////////////////////////////////////////////////
// Body
////////////////////////////////////////////////

// DB access 
const collection = 'users';
const server = express();


server.use(bodyParser.json());


server.get('/', (req, res, next) => {
  const { MONGO_URL, pseudo } = req.webtaskContext.data;
  MongoClient.connect(MONGO_URL, (err, db) => {
    db.collection(collection).findOne({_id: pseudo}, (err, result) => {
        if (err) return next(err);
      db.close();
      if (err) return next(err);
      res.status(200).send(result);
    });
  });
});
module.exports = Webtask.fromExpress(server);



// Authentication
app.use(bodyParser.json());

// To retrieve JSON Web Key
const jwksRsa = require('jwks-rsa');
const jwt = require('express-jwt');

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

app.get('/', (req, res) => {
  // add your logic, you can use scopes from req.user
  res.json({hi : req.user.sub});
});

module.exports = fromExpress(app);
