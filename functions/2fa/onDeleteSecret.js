const functions = require('firebase-functions');

const admin = require('firebase-admin');
try {admin.initializeApp(functions.config().database);} catch(e) {}

exports.onDeleteSecret = functions.firestore.document('/twofa/{personId}')
    .onDelete(event => {

    var personId = event.params.personId;

    return admin.firestore().doc(`persons/${personId}`).update({
        twofa: null
    });

});
