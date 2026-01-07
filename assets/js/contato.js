/**
 * Formulário de Contato - Gráfica VIP
 * Validação Bootstrap + SweetAlert2
 */

import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Toast Helper
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});

// Form
const form = document.getElementById("formContato");
const btnEnviar = document.getElementById("btnEnviar");

if (form) {
  // Bootstrap validation
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const mensagem = document.getElementById("mensagem").value.trim();

    // Disable button
    btnEnviar.disabled = true;
    btnEnviar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

    try {
      await addDoc(collection(db, "mensagens"), {
        nome,
        email,
        mensagem,
        lida: false,
        data: Timestamp.now()
      });

      // Success
      Swal.fire({
        icon: 'success',
        title: 'Mensagem enviada!',
        text: 'Obrigado pelo contato. Responderemos em breve.',
        confirmButtonColor: '#10b981'
      });
      
      form.reset();
      form.classList.remove("was-validated");

    } catch (error) {
      console.error("Erro ao enviar:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Erro ao enviar',
        text: 'Não foi possível enviar sua mensagem. Tente novamente.',
        confirmButtonColor: '#10b981'
      });
      
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.innerHTML = '<i class="bi bi-send-fill me-2"></i>Enviar Mensagem';
    }
  });

  // Real-time validation feedback
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
      }
    });
    
    input.addEventListener('input', () => {
      if (form.classList.contains('was-validated')) {
        if (input.checkValidity()) {
          input.classList.add('is-valid');
          input.classList.remove('is-invalid');
        } else {
          input.classList.remove('is-valid');
          input.classList.add('is-invalid');
        }
      }
    });
  });
}
