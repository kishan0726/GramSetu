const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gramsetu-91052.appspot.com",
    databaseURL: "https://gramsetu-91052-default-rtdb.firebaseio.com/"
});

// export const bucket = admin.storage().bucket();
const db = admin.database();

module.exports = db;

// const db = admin.database();
// module.exports = { admin, db };