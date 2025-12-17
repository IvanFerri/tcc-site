// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// CONFIGURAÇÃO DO SEU FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCK8zeZPCADspaeme6_QIkshectb_3nneA",
  authDomain: "grafica-vip-tcc.firebaseapp.com",
  projectId: "grafica-vip-tcc",
  storageBucket: "grafica-vip-tcc.firebasestorage.app",
  messagingSenderId: "768607783576",
  appId: "1:768607783576:web:2064c2d88a141ec0b59eed"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
