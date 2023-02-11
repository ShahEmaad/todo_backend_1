import { initializeApp } from "firebase/app";
import {
  getAuth,
  createAuthEmulator
  createUserWithEmailAndPassword ,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Auth Emulator
connectAuthEmulator(auth,'http://localhost:3000')

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const loginEmailPassword = async()=>{
  const password = body.password //txtPassword.password
  const email = body.email //txtEmail.email
  signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });

}
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in
    const user = userCredential.user;
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    // ..
  });



onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // ...
      } else {
        // User is signed out
        // ...
      }
    });

signOut(auth).then(() => {
      // Sign-out successful.
}).catch((error) => {
      // An error happened.
    });
