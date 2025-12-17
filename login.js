function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  auth.signInWithEmailAndPassword(email, senha)
    .then(() => {
      window.location.href = "admin.html";
    })
    .catch(() => {
      alert("Usuário ou senha inválidos");
    });
}
