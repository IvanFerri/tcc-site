// Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// CONFIGURAÇÃO DO SEU FIREBASE
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "grafica-vip-tcc.firebaseapp.com",
  projectId: "grafica-vip-tcc",
  storageBucket: "grafica-vip-tcc.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
