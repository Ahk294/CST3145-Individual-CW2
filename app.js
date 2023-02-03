// importing express
const express = require('express');

// importing MongoClient from mongodb
const { MongoClient } = require('mongodb');

// imports for static file middleware
const path = require('path');
const fs = require('fs');

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

// connecting to the 'activities' database in MongoDB
let db;
MongoClient.connect(ConnectionString, (err, client) => {
    db = client.db('activities');
});

// display a message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages or select an image, e.g., /arduino.png');
});

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

// get the specific collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});


// logger middleware
app.use(function (req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request Date: " + new Date());
    next();
});

// static image file middleware
app.use(function (req, res, next) {
    let filePath = path.join(__dirname, "static", req.url);
    fs.stat(filePath, function (err, fileInfo) {
        if (err) {
            next();
            return;
        }

        if (fileInfo.isFile()) {
            res.sendFile(filePath);
        } else {
            next();
        }
    });
});

// handling error from the previous middleware
app.use(function (req, res) {
    // Sets the status code to 404
    res.status(404);
    // Sends the error "File not found!”
    res.send("File not found!");
});

// setting port for the application
app.listen(Port, function () {
    console.log("App started on port 3000");
});