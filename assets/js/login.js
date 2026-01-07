/**
 * Login - Gráfica VIP
 * Autenticação com Firebase e SweetAlert2
 */

import { auth } from "./firebase.js";
import { 
  signInWithEmailAndPassword,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Toast Helper
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});

// Check if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "admin.html";
  }
});

// Form submit
const formLogin = document.getElementById("formLogin");
const btnLogin = document.getElementById("btnLogin");

if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    
    // Disable button
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';
    
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      
      Toast.fire({
        icon: 'success',
        title: 'Login realizado com sucesso!'
      });
      
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 500);
      
    } catch (error) {
      console.error("Erro no login:", error);
      
      let errorMsg = 'Erro ao fazer login';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = 'E-mail ou senha incorretos';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'E-mail inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Muitas tentativas. Tente novamente mais tarde.';
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Erro no login',
        text: errorMsg,
        confirmButtonColor: '#10b981'
      });
      
    } finally {
      btnLogin.disabled = false;
      btnLogin.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Entrar';
    }
  });
}
