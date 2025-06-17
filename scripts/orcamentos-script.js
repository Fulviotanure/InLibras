import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// DOM Elements
const budgetsTableBody = document.getElementById('budgetsTableBody');

// Initialize the page
function init() {
    // Check authentication state
    window.auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = '../pages/login.html';
        } else {
            loadBudgets(user.uid);
        }
    });
}

// Load budgets from Firebase
async function loadBudgets(userId) {
    try {
        budgetsTableBody.innerHTML = '<div class="loading">Carregando orçamentos...</div>';

        const budgetsQuery = query(
            collection(window.db, 'budgets'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(budgetsQuery);

        if (snapshot.empty) {
            budgetsTableBody.innerHTML = `
                <tr>
                    <td colspan="4">
                        <div class="empty-state">
                            <p>Você ainda não salvou nenhum orçamento.</p>
                            <button class="action-btn view-btn" onclick="window.location.href='../index.html'">
                                Criar Novo Orçamento
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        budgetsTableBody.innerHTML = '';
        snapshot.forEach(docSnap => {
            const budget = docSnap.data();
            const date = budget.createdAt ? new Date(budget.createdAt.toDate()) : new Date();
            
            const tr = document.createElement('tr');
            tr.dataset.id = docSnap.id; // Store the document ID on the row
            tr.innerHTML = `
                <td>${budget.clientName || 'Cliente não especificado'}</td>
                <td>${date.toLocaleDateString('pt-BR')}</td>
                <td>R$ ${budget.finalValue ? budget.finalValue.toFixed(2) : '0.00'}</td>
                <td>
                    <button class="action-btn view-btn" onclick="viewBudget('${docSnap.id}')">
                        Visualizar
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteBudget('${docSnap.id}')">
                        Excluir
                    </button>
                </td>
            `;
            budgetsTableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        budgetsTableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    <div class="empty-state">
                        <p>Erro ao carregar orçamentos. Por favor, tente novamente.</p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// View budget details
function viewBudget(budgetId) {
    window.location.href = `../pages/visualizar-orcamento.html?id=${budgetId}`;
}
window.viewBudget = viewBudget;

// Delete budget
async function deleteBudget(budgetId) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) {
        return;
    }

    try {
        await deleteDoc(doc(window.db, 'budgets', budgetId));
        // Remove the budget row from the UI
        const budgetRow = document.querySelector(`tr[data-id="${budgetId}"]`);
        if (budgetRow) {
            budgetRow.remove();
            // If no budgets left, show empty state
            if (budgetsTableBody.children.length === 0) {
                budgetsTableBody.innerHTML = `
                    <tr>
                        <td colspan="4">
                            <div class="empty-state">
                                <p>Você ainda não salvou nenhum orçamento.</p>
                                <button class="action-btn view-btn" onclick="window.location.href='../index.html'">
                                    Criar Novo Orçamento
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        alert('Erro ao excluir orçamento. Por favor, tente novamente.');
    }
}
window.deleteBudget = deleteBudget;

// Start the application
init(); 