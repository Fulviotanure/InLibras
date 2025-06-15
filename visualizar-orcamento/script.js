// Firebase configuration
const firebaseConfig = {
    // Your Firebase configuration will go here
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const clientNameElement = document.getElementById('clientName');
const creationDateElement = document.getElementById('creationDate');
const budgetTableBody = document.getElementById('budgetTableBody');
const grossValueElement = document.getElementById('grossValue');
const totalAdditionsElement = document.getElementById('totalAdditions');
const discountElement = document.getElementById('discount');
const finalValueElement = document.getElementById('finalValue');
const generatePdfBtn = document.getElementById('generatePdfBtn');

// Get budget ID from URL
const urlParams = new URLSearchParams(window.location.search);
const budgetId = urlParams.get('id');

// Initialize the page
function init() {
    // Check authentication state
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = '../login/index.html';
        } else if (budgetId) {
            loadBudget();
        } else {
            showError('ID do orçamento não fornecido.');
        }
    });

    // Add event listener for PDF generation
    generatePdfBtn.addEventListener('click', generatePDF);
}

// Load budget from Firebase
async function loadBudget() {
    try {
        const doc = await db.collection('budgets').doc(budgetId).get();

        if (!doc.exists) {
            showError('Orçamento não encontrado.');
            return;
        }

        const budget = doc.data();

        // Check if user has access to this budget
        if (budget.userId !== auth.currentUser.uid) {
            showError('Você não tem permissão para visualizar este orçamento.');
            return;
        }

        // Update client info
        clientNameElement.textContent = budget.clientName;
        const date = budget.createdAt ? new Date(budget.createdAt.toDate()) : new Date();
        creationDateElement.textContent = `Criado em: ${date.toLocaleDateString('pt-BR')}`;

        // Update table
        budgetTableBody.innerHTML = '';
        budget.rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(row.date)}</td>
                <td>${row.startTime}</td>
                <td>${row.endTime}</td>
                <td>${row.hours.toFixed(1)}</td>
                <td>${row.tilsQty}</td>
                <td>R$ ${row.hourValue.toFixed(2)}</td>
                <td>${row.isForeignLang ? 'Sim' : 'Não'}</td>
                <td>${row.isForeignLang ? row.leStartTime : '-'}</td>
                <td>${row.isForeignLang ? row.leEndTime : '-'}</td>
                <td>${row.isHoliday ? 'Sim' : 'Não'}</td>
                <td>R$ ${row.total.toFixed(2)}</td>
            `;
            budgetTableBody.appendChild(tr);
        });

        // Update summary
        grossValueElement.textContent = `R$ ${budget.grossValue.toFixed(2)}`;
        totalAdditionsElement.textContent = `R$ ${budget.totalAdditions.toFixed(2)}`;
        discountElement.textContent = `R$ ${budget.discount.toFixed(2)}`;
        finalValueElement.textContent = `R$ ${budget.finalValue.toFixed(2)}`;

    } catch (error) {
        console.error('Erro ao carregar orçamento:', error);
        showError('Erro ao carregar orçamento. Por favor, tente novamente.');
    }
}

// Format date from YYYY-MM-DD to DD/MM/YYYY
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Show error message
function showError(message) {
    const main = document.querySelector('main');
    main.innerHTML = `
        <section class="view-budget-section">
            <div class="error">
                <h2>Erro</h2>
                <p>${message}</p>
                <button onclick="window.location.href='../orcamentos/index.html'" class="action-btn">
                    Voltar para Lista de Orçamentos
                </button>
            </div>
        </section>
    `;
}

// Generate PDF
function generatePDF() {
    const element = document.querySelector('.view-budget-section');
    const opt = {
        margin: 1,
        filename: `Orcamento_${clientNameElement.textContent}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}

// Start the application
init(); 