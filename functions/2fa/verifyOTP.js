var speakeasy = require('speakeasy');
var functions = require('firebase-functions');

var firebase = require('firebase-admin');
var cors = require('cors')({origin: true});
var serviceAccount = require('./authenticateOTP.json');

try {firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://login2fa.firebaseio.com"
});} catch(e) {}


exports.verifyOTP = functions.https.onRequest((req, res) => {
    cors(req, res, () => {

            var userTwoFARef = firebase.firestore().doc(`twofa/${req.body.uid}`);
        
            return userTwoFARef.get().then((doc) => {

                if (!doc.exists) {
                    res.status(403).send('The request is forbidden');
                } else {

                    var reply = speakeasy.totp.verify({
                                    secret: doc.data().secret,
                                    encoding: 'base32',
                                    token: req.body.token
                                });
                            
                    if (reply) {

                        userTwoFARef.update( {
                                verified: true, 
                                lastAuthentication: firebase.firestore.FieldValue.serverTimestamp()
                            });
                    
                        firebase.auth().createCustomToken(req.body.uid, { twoFactorAuthenticated: true })
                            .then((token) => {
                                res.status(200).send({token: token});
                            })
                            .catch((error) => {
                                res.status(500).send('failed on custom token creation');
                            });
                    } else {
                        res.status(403).send({ message: 'Two-Factor Authentication Failed', token: req.body.token, epoch: Date.now()});
                    }


                }
            });
    }); 
});