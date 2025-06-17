import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const googleLoginBtn = document.getElementById('googleLogin');
    
    googleLoginBtn.addEventListener('click', async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // Successful login
            const user = result.user;
            console.log('Logged in user:', user);
            
            // Redirect to home page
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Error during login:', error);
            alert('Erro ao fazer login. Por favor, tente novamente.');
        }
    });
}); 