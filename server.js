const express = require('express');
const path = require('path');
const keys = require('./config/keys')
const bodyParser = require('body-parser');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');


// PayPal config
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': keys.stripeCliendId,
    'client_secret': keys.stripeClientSecret
  });

// Init app
const app = express();

// Template engine setup
app.set('views', path.join(__dirname, 'public/views')); 
app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);

// Set Static Folder 
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Index route
app.get('/', (req, res) => {
    res.render('index.html');
});

// Pay route
app.post('/pay', (req, res) => {
    console.log('pay');
    console.log(req.body);
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success?price=" + req.body.price + "&currency=" + req.body.currency,
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Media Forest Subscrition",
                    "sku": "item",
                    "price": req.body.price, //"25.00",
                    "currency": req.body.currency, //"USD",
                    "quantity": 1
                }]
            },  
            "amount": {
                "currency": req.body.currency, //"USD",
                "total": req.body.price, //"25.00",
            },
            "description": "Media Forest PayPal payment."
        }]
    };
    //console.log(create_payment_json.transactions);
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            console.log('appruval redirect');
            //console.log(payment);
            let approval_url = payment.links.find(obj => obj.rel == 'approval_url').href;
            res.redirect(approval_url);
        }
    });

});

// success
app.get('/success', (req, res) => {
    console.log('success');
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log(req.query);
    console.log(req.body);

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": req.query.currency, //"USD",
                "total": req.query.price //"25.00"
            }
        }]
    };

    console.log('execute');
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success!');
        }
    });
});

// cancel
app.get('/cancel', (req, res) => res.send('Cancelled'));

// Start server
const port = process.env.port || 3000;
app.listen(port, () => console.log(`server started on port ${port}`));