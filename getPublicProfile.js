'use latest';
import bodyParser from 'body-parser';
import express from 'express';
import Webtask from 'webtask-tools';
import { MongoClient } from 'mongodb';
import { ObjectID } from 'mongodb';

const collection = 'nbUsers';
const server = express();


server.use(bodyParser.json());


server.get('/', (req, res, next) => {
  const { MONGO_URL } = req.webtaskContext.data;
  MongoClient.connect(MONGO_URL, (err, db) => {
    if (err) return next(err);
    db.collection(collection).findOne({}, (err, result) => {
      db.close();
      if (err) return next(err);
      res.status(200).send(result);
    });
  });
});


module.exports = Webtask.fromExpress(server);
