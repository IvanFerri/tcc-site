import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

window.login = function () {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      window.location.href = "admin.html";
    })
    .catch(() => {
      alert("Usuário ou senha inválidos");
    });
};
