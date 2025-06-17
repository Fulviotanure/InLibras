// Import Firebase functions
import { doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// DOM Elements
const clientNameElement = document.getElementById('clientName');
const creationDateElement = document.getElementById('creationDate');
const budgetTableBody = document.getElementById('budgetTableBody');
const totalHorasElement = document.getElementById('totalHoras');
const valorHoraTotalElement = document.getElementById('valorHoraTotal');
const totalAcrescimosElement = document.getElementById('totalAcrescimos');
const totalGeralElement = document.getElementById('totalGeral');
const descontoInput = document.getElementById('porcentagemDesconto');
const valorFinalElement = document.getElementById('valorFinal');
const generatePdfBtn = document.getElementById('generatePdfBtn');

// Get budget ID from URL
const urlParams = new URLSearchParams(window.location.search);
const budgetId = urlParams.get('id');

// Initialize the page
function init() {
    // Check authentication state
    onAuthStateChanged(window.auth, user => {
        if (!user) {
            window.location.href = '../pages/login.html';
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
        const docRef = doc(window.db, 'budgets', budgetId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            showError('Orçamento não encontrado.');
            return;
        }

        const budget = docSnap.data();

        // Check if user has access to this budget
        if (budget.userId !== window.auth.currentUser.uid) {
            showError('Você não tem permissão para visualizar este orçamento.');
            return;
        }

        // Update client info
        clientNameElement.textContent = budget.clientName;
        const date = budget.createdAt ? new Date(budget.createdAt.toDate()) : new Date();
        creationDateElement.textContent = `Criado em: ${date.toLocaleDateString('pt-BR')}`;

        // Update table
        budgetTableBody.innerHTML = '';
        let totalHoras = 0;
        let valorHora = 0;
        let totalAcrescimos = 0;
        let totalBruto = 0;
        let valorFinal = 0;
        budget.rows.forEach(row => {
            totalHoras += row.hours;
            valorHora = row.hourValue;
            totalAcrescimos += (row.additions || 0);
            totalBruto += row.baseValue || 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(row.date)}</td>
                <td>${row.startTime}</td>
                <td>${row.endTime}</td>
                <td>${row.hours.toFixed(1)}</td>
                <td>${row.tilsQty}</td>
                <td>R$ ${row.hourValue.toFixed(2)}</td>
                <td>${row.isForeignLang ? 'Sim' : 'Não'}</td>
                <td>${row.isSaturday ? 'Sim' : 'Não'}</td>
                <td>${row.isHoliday ? 'Sim' : 'Não'}</td>
                <td>${row.isNight ? 'Sim' : 'Não'}</td>
                <td>R$ ${row.total.toFixed(2)}</td>
            `;
            budgetTableBody.appendChild(tr);
        });

        // Preencher resumo
        totalHorasElement.textContent = `${totalHoras.toFixed(1)} horas`;
        valorHoraTotalElement.textContent = `R$ ${valorHora.toFixed(2)}`;
        totalAcrescimosElement.textContent = `R$ ${totalAcrescimos.toFixed(2)}`;
        totalGeralElement.textContent = `R$ ${totalBruto.toFixed(2)}`;
        // Desconto (%)
        if (budget.discountPercent !== undefined) {
            descontoInput.textContent = budget.discountPercent + '%';
        } else {
            descontoInput.textContent = '0%';
        }
        // Valor final
        valorFinalElement.textContent = `R$ ${budget.finalValue.toFixed(2)}`;

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
                <button onclick="window.location.href='../pages/orcamentos.html'" class="action-btn">
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

    window.html2pdf().set(opt).from(element).save();
}

// Start the application
init();