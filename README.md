# twofa-angular
an example of how to provide two factor authentication using firestore, cloud functions, and angular

Firestore holds user data in the persons collection. The person object tracks whether 2fa has been setup
The secret is generated using firebase cloud functions and is read and written only by the cloud function so
the firestore rules do not allow anyone to read or write the secrets.
Once the 2fa is setup and the user provides a valid OTP then a custom token is minted and sent to the
client to use for login. The auth-guard then checks to make sure that anyone try to gain access must be twofactorauth'd

Database rules can then be written to restrict database access to claims in the custom token.
