'use latest';

import express from 'express';
import { fromExpress } from 'webtask-tools';
import bodyParser from 'body-parser';
const app = express();

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
