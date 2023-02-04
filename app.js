// importing express
const express = require('express');

// importing MongoClient from mongodb
const { MongoClient, ObjectId } = require('mongodb');

const cors = require('cors');

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

app.use(cors());

// connecting to the 'activities' database in MongoDB
let db;
MongoClient.connect(ConnectionString, (err, client) => {
    db = client.db('activities');
});

// display a message for root path to show that API is working
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /lessons or select an image, e.g., /arduino.png');
});

// get the collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

// get the specific collection (lessons)
app.get('/lessons', (req, res, next) => {
    db.collection('lessons').find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

// insert into a specific collection (orders)
app.post('/orders', (req, res, next) => {
    db.collection('orders').insertOne(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

// update a specific item from a collection (lesson spaces)
app.put('/lessons/:id', (req, res, next) => {
    db.collection('lessons').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (e, result) => {
            if (e) return next(e);
            res.send((result) ? { msg: 'success' } : { msg: 'error' });
        }
    );
});

// get a specific item from a collection (lessons)
app.get('/lessons/:search', (req, res, next) => {
    db.collection('lessons').find({}).toArray((e, results) => {
        if (e) return next(e);
        let searchResults = results.filter((item) => {
            return (
                item.subject.toLowerCase().match(req.params.search.toLowerCase()) || item.location.toLowerCase().match(req.params.search.toLowerCase())
            );
        });
        res.send(searchResults);
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
    let filePath = path.join(__dirname, "static/images", req.url);
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
});;