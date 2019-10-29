
let express = require('express');
let app = express();
app.set('view engine', 'ejs');
let fs = require('fs');
let bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({ extended: false }));
app.get('/', function (req, res) {
    res.contentType('text/html');
    fs.createReadStream('index.html').pipe(res);
})
let loanDetails=[];
app.post('/submitform', function (req, res) {
    let purchasePrice = req.body.purchaseprice;
    let deposit = req.body.deposit;
    let depositAmount = (deposit / 100) * purchasePrice;
    let bondLoan = purchasePrice - depositAmount;
    let bondTerm = req.body.years;
    let numberofPayments = bondTerm * 12;
    let ratee = req.body.rate;
    let rate = (req.body.rate / 12) / 100;
    let monthPayment = (rate * bondLoan * (1 + rate) ** numberofPayments) / (((1 + rate) ** numberofPayments) - 1);
    let totaInterestPaid = monthPayment * numberofPayments - bondLoan;
    let totalMortgage=monthPayment * numberofPayments;
    //console.log(totaInterestPaid);
    loanDetails.push({purchasePrice:purchasePrice,depositAmount:depositAmount, bondLoan: bondLoan,bondTerm:bondTerm,ratee:ratee,totaInterestPaid:totaInterestPaid,totalMortgage:totalMortgage});
    let debt = bondLoan;
    let accuminterest = 0;
    let accumloan = 0;
    let tabledata = [];
    for (let i = 1; i <= numberofPayments; i++) {
        let monthlyInterest = (debt * ((1 + rate) - 1));
        let principalpaid = monthPayment - monthlyInterest;
        debt = debt - principalpaid;
        accuminterest += monthlyInterest;
        accumloan += principalpaid;
        tabledata.push({month: i, interestAmountpaid: accuminterest, bondAmountPaid: accumloan});
    }

    res.render('index', {
        purchasePrice: purchasePrice,
        depositAmount: depositAmount,
        bondLoan: bondLoan,
        ratee: ratee,
        bondTerm: bondTerm,
        monthPayment: monthPayment.toFixed(2),
        tabledata: tabledata,
        totaInterestPaid: totaInterestPaid.toFixed(2),
        totalMortgage:totalMortgage.toFixed(2)
    })

})
app.post('/savedetails', function (req, res) {

    let url = "mongodb://localhost:27017/";
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect(url, {useUnifiedTopology: true}, function (err, db) {
        if (err) throw err;
        let dbconnect = db.db('bondDetails')
        let details = {
            'name': req.body.dname,
            'purchasePrice':loanDetails[0].purchasePrice,
            'depositAmount': loanDetails[0].depositAmount,
            'bondLoan': loanDetails[0].bondLoan,
            'ratee': loanDetails[0].ratee,
            'bondTerm': loanDetails[0].bondTerm,
            'monthPayment': loanDetails[0].monthPayment,
            'totaInterestPaid': loanDetails[0].totaInterestPaid.toFixed(2),
            'totalMortgage':loanDetails[0].totalMortgage.toFixed(2),
        };
        /////// insert one object in the database
        dbconnect.collection('bonds').insertOne(details, function (err, result) {
            if (err) console.log(err);
            console.log(result.insertedCount, 'document inserted');
        })
        db.close();
    })
    res.contentType('text/html');
    fs.createReadStream('index.html').pipe(res);
})


app.listen(3000, function () {
    console.log('server running at port 3000')
});