import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const form = document.getElementById("form-contato");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const mensagem = document.getElementById("mensagem").value;

    try {
      await addDoc(collection(db, "mensagens"), {
        nome,
        email,
        mensagem,
        data: Timestamp.now()
      });

      alert("Mensagem enviada com sucesso!");
      form.reset();
    } catch (error) {
      alert("Erro ao enviar mensagem");
      console.error(error);
    }
  });
}
