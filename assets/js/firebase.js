const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "grafica-vip-tcc.firebaseapp.com",
  projectId: "grafica-vip-tcc",
  storageBucket: "grafica-vip-tcc.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
