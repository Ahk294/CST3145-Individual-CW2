// importing express
const express = require('express');

// importing MongoClient from mongodb
const { MongoClient } = require('mongodb');

// importing cors
const cors = require('cors');

// using the express server
const app = express();

// configuring dotenv for environment variables
require("dotenv").config();

// setting environment variables
const Port = process.env.PORT;
const ConnectionString = process.env.CONNECTION_STRING;

// configuring the express server
app.use(express.json());
app.set('port', 3000);
app.use((req, res, next) => {
    res.setHeader('Allow-Control-Allow-Origin', '*');
    next();
});

// using cors to avoid CORS-Policy violation
app.use(cors());

// connecting to the 'activities' database in MongoDB
let db;
MongoClient.connect(ConnectionString, (err, client) => {
    db = client.db('activities');
});

// logger middleware
app.use((req, res, next) => {
    console.log("Request IP: " + req.url);
    console.log("Request Date: " + new Date());
    next();
});