var url = "mongodb://localhost:27017/";
//Important: In MongoDB, a database is not created until it gets content!
//MongoDB waits until you have created a collection(table), with at least one document(record) before it actually creates the database(and collection).

// create a client to mongodb
var MongoClient = require('mongodb').MongoClient;
// make client connect to mongo service
MongoClient.connect(url,{ useUnifiedTopology: true }, function (err, db) {
    if (err) throw err;
    console.log("Database connected to the server!");
    // If a database called "bonds" exists, it is used, otherwise it gets created.
    let dbconnect = db.db('bondDetails')
    //// print database name
    console.log("Switched to " + dbconnect.databaseName + " database");
    /////create a collection
    dbconnect.createCollection("bonds", function (err, result) {
        if (err) throw err;
        console.log("Collection is created!");
    })
    let demo = {name: 'demo',purchasePrice:900000,depositAmount:90000,bondLoan:810000,ratee:11, bondTerm:20,monthPayment:7645};
    /////// insert one object in the database
    dbconnect.collection('bonds').insertOne(demo, function (err, result) {
       if (err) console.log(err);
       console.log(result.insertedCount,'document inserted');
    })

});