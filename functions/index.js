// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const firebase = require('firebase-admin');
var serviceAccount = require('./2fa/authenticateOTP.json');

try {firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://login2fa.firebaseio.com"
});} catch(e) {}

const onDeleteSecret = require('./2fa/onDeleteSecret');
module.exports.onDeleteSecret = onDeleteSecret;

const verifyOTP = require('./2fa/verifyOTP');
module.exports.verifyOTP = verifyOTP;

const generateOTPSecret = require('./2fa/generateOTPSecret');
module.exports.generateOTPSecret = generateOTPSecret;
