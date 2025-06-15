import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const googleSignInBtn = document.getElementById('googleSignInBtn');
const userStatusDiv = document.getElementById('userStatus');
const auth = window.auth; // Access the auth object from firebase-config.js

const provider = new GoogleAuthProvider();

// Function to handle Google Sign-In
googleSignInBtn.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, provider);
        // User signed in successfully, onAuthStateChanged will handle UI update
    } catch (error) {
        console.error("Error during Google Sign-In:", error);
        userStatusDiv.textContent = `Erro: ${error.message}`;
    }
});

// Handle authentication state changes
onAuthStateChanged(auth, (user) => {
    const navButtonsMain = document.querySelector('.nav-buttons-main');
    let authButton = document.getElementById('authButton');

    // Remove existing auth button to prevent duplicates
    if (authButton) {
        authButton.remove();
    }

    if (user) {
        // User is signed in
        userStatusDiv.textContent = `Logado como: ${user.displayName} (${user.email})`;

        // Create logout button
        authButton = document.createElement('div');
        authButton.id = 'authButton';
        authButton.classList.add('logout-btn');
        authButton.innerHTML = `<a href="#" class="nav-btn">Sair (${user.displayName.split(' ')[0]})</a>`;
        navButtonsMain.appendChild(authButton);

        authButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await signOut(auth);
                // User signed out, onAuthStateChanged will handle UI update
            } catch (error) {
                console.error("Error during sign out:", error);
                userStatusDiv.textContent = `Erro ao sair: ${error.message}`;
            }
        });

        // Add Home and Orçamentos buttons if not present
        if (!document.querySelector('.home-btn')) {
            const homeBtn = document.createElement('div');
            homeBtn.classList.add('home-btn');
            homeBtn.innerHTML = `<a href="index.html" class="nav-btn">Home</a>`;
            navButtonsMain.prepend(homeBtn);
        }
        if (!document.querySelector('.budgets-btn')) {
            const budgetsBtn = document.createElement('div');
            budgetsBtn.classList.add('budgets-btn');
            budgetsBtn.innerHTML = `<a href="pages/orcamentos.html" class="nav-btn">Orçamentos</a>`;
            if (document.querySelector('.home-btn')) {
                document.querySelector('.home-btn').after(budgetsBtn);
            } else {
                navButtonsMain.prepend(budgetsBtn);
            }
        }

    } else {
        // User is signed out
        userStatusDiv.textContent = "Nenhum usuário logado.";

        // Create login button
        authButton = document.createElement('div');
        authButton.id = 'authButton';
        authButton.classList.add('login-btn');
        authButton.innerHTML = `<a href="pages/login.html" class="nav-btn">Login</a>`;
        navButtonsMain.appendChild(authButton);

        // Remove Home and Orçamentos buttons if present
        const homeBtn = document.querySelector('.home-btn');
        const budgetsBtn = document.querySelector('.budgets-btn');
        if (homeBtn) homeBtn.remove();
        if (budgetsBtn) budgetsBtn.remove();
    }
}); 