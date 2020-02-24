const functions = require('firebase-functions');
const admin= require('firebase-admin');
// const sendEmail = require('./lib/lib');
const mailgun = require("mailgun-js");
const os = require('os');
// const Joi = require('joi');
const express = require('express');
const app = express();


admin.initializeApp();


const firebaseConfig = {
  apiKey: "AIzaSyDIk6xDRVSqIDSdDOaEH31uP71uaecaxtk",
  authDomain: "silofit-6712a.firebaseapp.com",
  databaseURL: "https://silofit-6712a.firebaseio.com",
  projectId: "silofit-6712a",
  storageBucket: "silofit-6712a.appspot.com",
  messagingSenderId: "283420534510",
  appId: "1:283420534510:web:610eec866ad6baf86eb5ff",
  measurementId: "G-DS9H6FXQCL"
};

const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

app.post('/sendemail', (req, res)=>{
  // let DOMAIN = 'sandbox71adfa44c9814f53b758442a7fde8893.mailgun.org';
  // let API_KEY = '82b80482742dd8b98189e7a4eda890c2-f8faf5ef-298dceda';
  // let mg = mailgun({apiKey: API_KEY, domain: DOMAIN});

  // // function sendEmail(){
  // const data = {
  //   from: 'MailGun sandbox <postmaster@sandbox71adfa44c9814f53b758442a7fde8893.mailgun.org>',
  //   to: 'setarehadavi@yahoo.com',
  //   subject: 'Hello',
  //   text: 'Hi'
  // };
  // mg.messages().send(data, function (error, body) {
  //   !error ? res.send("email sent") : res.send(error);
  // });

});
// Check if company Domain exist
app.post('/domainvalidation', (req, res)=> {
  db
  .collection('companies')
  .where('domain', '==',  req.body.domain)
  .get()
  .then(snapshot  => {
    if(snapshot.empty)
      res.send(false);
    let obj = {};
    snapshot.forEach(doc=>{
     obj = Object.assign(doc.data(),{})
    })
    res.send(obj);
    })
  .catch(error => res.send(error))
});
// Anonymous login rout
app.post('/login', (req, res)=>{
  firebase
    .auth()
    .signInAnonymously()
    .catch(function(error) {
    // Handle Errors here.
      let errorCode = error.code;
      let errorMessage = error.message;
      res.send(error)  
    });
  res.send(true);
});



app.post('/getspots', (req,res)=>{
  let now = new Date();
  let query = db.collection('reservation');
  query = query.where('company_name', '==', req.body.domain);
  query = query.where('available_date', '>=',new Date('2020-02-01 00:00'));
  query = query.where('available_date', '<=', new Date('2020-03-01 00:00'));
  query = query.orderBy('available_date', 'desc');
  query.get()
  .then(querySnapshot => {
    let recArr=[]
    querySnapshot.forEach(doc=> {
      recArr.push({...doc.data(),docId:doc.id});
    })  
    res.send(recArr);
  })  
  .catch(error => res.send(error))
})

app.post('/bookspot', (req,res)=>{
  db
  .collection('reservation')
  .doc(req.body.docId)
  .update({
    reserved: admin.firestore.FieldValue.arrayUnion(req.body.email)
  })
  res.send(req.body.docId);
})

app.post('/cancelbooking', (req,res)=>{
  db
  .collection('reservation')
  .doc(req.body.docId)
  .update({
    reserved: admin.firestore.FieldValue.arrayRemove(req.body.email)
  })
  res.send(req.body.docId);
})

app.post('/joinwaitinglist', (req,res)=>{
  db
  .collection('reservation')
  .doc(req.body.docId)
  .update({
    waiting_list: admin.firestore.FieldValue.arrayUnion(req.body.email)
  })
  res.send(req.body.docId);
})

app.post('/leavewaitinglist', (req,res) => {
  db
  .collection('reservation')
  .doc(req.body.docId)
  .update({
    waiting_list: admin.firestore.FieldValue.arrayRemove(req.body.email)
  })
  res.send(req.body.docId);
})

app.post('/generatedaycode', (req, res) => {
  let rand = Math.floor(100000 + Math.random() * 900000);
 db
  .collection('reservation')
  .where('available_date', '>=', new Date(`${req.body.date} 00:00`))
  .where('available_date', '<=', new Date(`${req.body.date} 23:59 `))
  .get()
  .then(querySnapshot => {
    let recArr=[];
    if(querySnapshot.empty)
      res.send('No record fornd.');
    querySnapshot.forEach(doc=> {
      recArr.push(doc.id);
      db.collection('reservation').doc(doc.id).update({
          access_code: rand
         });
    })  
    res.send(recArr);
  })  
  .catch(error => res.send(error));
})

exports.api = functions.https.onRequest(app);

