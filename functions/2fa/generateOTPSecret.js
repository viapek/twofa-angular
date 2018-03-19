var firebase = require('firebase-admin');
var functions = require('firebase-functions');
var cors = require('cors')({origin: true});
var base32 = require('hi-base32');

exports.generateOTPSecret = functions.https.onRequest((req, res) => {

    cors(req, res, () => {

    const tokenId = req.get('Authorization');

    firebase.auth().verifyIdToken(tokenId)
        .then((decoded) => {
    
            const twoFactorAuthObject = {
                uid: req.body.uid,
                email: req.body.email,
                secret: '',
                otpURL: '',
                createdAt: null
            };
    
            const seed = (Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)).toUpperCase();
            const base32Secret = base32.encode(seed);
    
    
            twoFactorAuthObject.secret = base32Secret.substring(0, base32Secret.indexOf('='));
    
            twoFactorAuthObject.otpURL = `otpauth://totp/Example:${twoFactorAuthObject.email}?secret=${twoFactorAuthObject.secret}&issuer=My%20Issuer`
            
            twoFactorAuthObject.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    
            var userTwoFARef = firebase.firestore().doc(`twofa/${twoFactorAuthObject.uid}`);
    
            userTwoFARef.set({
                secret: twoFactorAuthObject.secret,
                createdAt: twoFactorAuthObject.createdAt
            }).then(() => {
    
                res.status(200).send(twoFactorAuthObject);
    
            });
        
        })
        .catch((err) => res.status(401).send(err));

    });
});

