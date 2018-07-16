// Firebase Functions SDK
// HTTPリクエストをトリガするために使用
const functions = require('firebase-functions');

// Firebase Admin SDK
// Realtime Databaseの処理および認証をするために使用
const admin = require('firebase-admin');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const express = require('express');
const app = express();
const cors = require('cors')({origin: true});

app.use(cors);
