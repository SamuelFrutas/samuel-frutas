import { auth } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

// Se você já estiver logado, vai direto para o painel
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = 'admin.html';
  }
});

// Ação de clicar no botão "Entrar"
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'admin.html';
  } catch (error) {
    errorMessage.style.display = 'block';
    
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage.textContent = 'E-mail ou senha incorretos.';
        break;
      case 'auth/too-many-requests':
        errorMessage.textContent = 'Muitas tentativas incorretas. Tente novamente mais tarde.';
        break;
      default:
        errorMessage.textContent = 'Erro ao realizar login. Tente novamente.';
    }
  }
});