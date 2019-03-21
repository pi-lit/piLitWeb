const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://pi-lit-db-user:EBQ0fF6WUD9TLQjM@cis-db-fxsbk.mongodb.net/test?retryWrites=true"
const client = new MongoClient(uri, { useNewUrlParser: true });

/* GET users listing. */
router.get('/users', function(req, res, next) {
	client.connect(err => {
 		const collection = client.db("Pi-Lit").collection("users");
  		collection.find({}).toArray(function(err, result) {
  			if (err) throw err;
  			console.log(result);
  			client.close();
  		})
	});
});

client.connect(err => {
	const collection = client.db("Pi-Lit").collection("users");
	collection.find({}).toArray(function(err, result) {
		if (err) throw err;
		console.log(result);
		client.close();
	})
});



module.exports = router;