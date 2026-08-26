import { auth } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});
