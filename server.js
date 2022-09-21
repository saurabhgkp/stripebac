const express = require('express');
const app = express();
const { resolve } = require('path');
const fs = require('fs');
var logger = require("morgan");



app.use(express.json());
// Copy the .env.example in the root into a .env file in this folder
require('dotenv').config({ path: './.env' });
app.use(logger("dev"));
// Ensure environment variables are set.
checkEnv();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/accept-a-payment/prebuilt-checkout-page",
    version: "0.0.1",
    url: "https://github.com/stripe-samples"
  }
});

app.use(express.static(process.env.STATIC_DIR));
app.use(express.urlencoded());
// app.use(
//   express.json({
//     // We need the raw body to verify webhook signatures.
//     // Let's compute it only when hitting the Stripe webhook endpoint.
//     verify: function (req, res, buf) {
//       if (req.originalUrl.startsWith('/webhook')) {
//         req.rawBody = buf.toString();
//       }
//     },
//   })
// );

app.get('/', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});

// Fetch the Checkout Session to display the JSON result on the success page
app.get('/checkout-session', async (req, res) => {
  const { sessionId } = req.query;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  res.send(session);
});

app.post('/create-checkout-session', async (req, res) => {
  const domainURL = process.env.DOMAIN;

  // Create new Checkout Session for the order
  // Other optional params include:
  // For full details see https://stripe.com/docs/api/checkout/sessions/create
  const session = await stripe.checkout.sessions.create({
    // payment_method_types: ['card'],
    mode: 'subscription',
    customer: process.env.CUSTOMER,
    billing_address_collection: "required",
    line_items: [{
      price: process.env.PRICE,
      quantity: 1,
    }],
    // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
    success_url: `${domainURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${domainURL}/canceled.html`,
    // automatic_tax: { enabled: true }
  });
console.log("=======================");
  return res.redirect(303, session.url);
});

// Webhook handler for asynchronous events.



app.post('/webhook', async (req, res) => {
 // let event;
 console.log("=======================2222222");
 console.log( "======payment_method.attached========1");
  const event = req.body;
  console.log(event.type);
  switch (event.type) {
    case 'invoice.payment_failed':
      const invoice = event.data.object;

fs.writeFile('helloworld.txt', JSON.stringify(invoice), function (err) {
  if (err) return console.log(err);
  console.log('Hello World > helloworld.txt');
});

      console.log(invoice);
      break;
    // ... handle other event types
 

    case "payment_method.attached":
      const paymentMethod = event.data.object;
      fs.writeFile('helloworld.txt', JSON.stringify(paymentMethod), function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
      });

      break;

    case "payment_intent.succeeded":
      
      const paymentIntent = event.data.object;
      fs.writeFile('helloworld.txt', JSON.stringify(paymentIntent),
        console.log('Hello World > helloworld.txt')
     )

      break;
    case "payment_intent.payment_failed":
    const  intent = event.data.object;
      fs.writeFile('helloworld.txt', JSON.stringify(intent), function (err) {
        if (err) return console.log(err);
        console.log('Hello World > helloworld.txt');
      });

      case "charge.failed":
     const   daa = event.data.object;
        fs.writeFile('helloworld.txt', JSON.stringify(daa), function (err) {
          if (err) return console.log(err);
          console.log('Hello World > helloworld.txt');
        });
  
        
        break;

    case "invoice.payment_succeeded":
      const inv = event.data.object;

    fs.writeFile('helloworld.txt', JSON.stringify(inv), function (err) {
      if (err) return console.log(err);
      console.log('Hello World > helloworld.txt');
    });

    default:
  }



});


    app.listen(process.env.PORT, () =>
      console.log(`Server Running on Port: http://localhost:${process.env.PORT}`) )
  




function checkEnv() {
  const price = process.env.PRICE;
  if (price === "price_12345" || !price) {
    console.log("You must set a Price ID in the environment variables. Please see the README.");
    process.exit(0);
  }
}


// const aa = {hhj:'hjhh'}
// fs.writeFile('helloworld.txt', JSON.stringify(aa), function (err) {
//   if (err) return console.log(err);
//   console.log('Hello World > helloworld.txt');
// });
