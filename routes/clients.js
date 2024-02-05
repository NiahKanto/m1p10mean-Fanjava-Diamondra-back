var express = require('express');
var router = express.Router();
const {connectToDB} = require('../db/db');

  const collectionName = 'client';
  router.get('/', async function(req, res, next) {
    const db = await connectToDB();
    const collection = db.collection(collectionName);
    const clients = await collection.find().toArray();
    res.json(clients)
  });

module.exports = router;
