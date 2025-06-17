<<<<<<< HEAD
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

=======
>>>>>>> 840cb517a393942c92d9ec5f5e3022b5074e868f
// DOM Elements
const budgetsList = document.getElementById('budgetsList');

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
        budgetsList.innerHTML = '<div class="loading">Carregando orçamentos...</div>';

<<<<<<< HEAD
        const budgetsQuery = query(
            collection(window.db, 'budgets'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(budgetsQuery);
=======
        const snapshot = await window.db.collection('budgets')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
>>>>>>> 840cb517a393942c92d9ec5f5e3022b5074e868f

        if (snapshot.empty) {
            budgetsList.innerHTML = `
                <div class="empty-state">
                    <p>Você ainda não salvou nenhum orçamento.</p>
                    <button class="action-btn view-btn" onclick="window.location.href='../index.html'">
                        Criar Novo Orçamento
                    </button>
                </div>
            `;
            return;
        }

        budgetsList.innerHTML = '';
<<<<<<< HEAD
        snapshot.forEach(docSnap => {
            const budget = docSnap.data();
=======
        snapshot.forEach(doc => {
            const budget = doc.data();
>>>>>>> 840cb517a393942c92d9ec5f5e3022b5074e868f
            const date = budget.createdAt ? new Date(budget.createdAt.toDate()) : new Date();
            
            const budgetCard = document.createElement('div');
            budgetCard.className = 'budget-card';
            budgetCard.innerHTML = `
                <div class="budget-info">
                    <h3>${budget.clientName || 'Cliente não especificado'}</h3>
                    <p>Criado em: ${date.toLocaleDateString('pt-BR')}</p>
                    <p>Valor Final: R$ ${budget.finalValue ? budget.finalValue.toFixed(2) : '0.00'}</p>
                </div>
                <div class="budget-actions">
<<<<<<< HEAD
                    <button class="action-btn view-btn" onclick="viewBudget('${docSnap.id}')">
                        Visualizar
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteBudget('${docSnap.id}')">
=======
                    <button class="action-btn view-btn" onclick="viewBudget('${doc.id}')">
                        Visualizar
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteBudget('${doc.id}')">
>>>>>>> 840cb517a393942c92d9ec5f5e3022b5074e868f
                        Excluir
                    </button>
                </div>
            `;
            budgetsList.appendChild(budgetCard);
        });
    } catch (error) {
        console.error('Erro ao carregar orçamentos:', error);
        budgetsList.innerHTML = `
            <div class="empty-state">
                <p>Erro ao carregar orçamentos. Por favor, tente novamente.</p>
            </div>
        `;
    }
}

// View budget details
function viewBudget(budgetId) {
    window.location.href = `../pages/visualizar-orcamento.html?id=${budgetId}`;
}
<<<<<<< HEAD
window.viewBudget = viewBudget;
=======
>>>>>>> 840cb517a393942c92d9ec5f5e3022b5074e868f

// Delete budget
async function deleteBudget(budgetId) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) {
        return;
    }

    try {
<<<<<<< HEAD
        await deleteDoc(doc(window.db, 'budgets', budgetId));
=======
        await window.db.collection('budgets').doc(budgetId).delete();
>>>>>>> 840cb517a393942c92d9ec5f5e3022b5074e868f
        // Remove the budget card from the UI without reloading
        const budgetCard = document.querySelector(`[onclick*="${budgetId}"]`).closest('.budget-card');
        if (budgetCard) {
            budgetCard.remove();
            // If no budgets left, show empty state
            if (budgetsList.children.length === 0) {
                budgetsList.innerHTML = `
                    <div class="empty-state">
                        <p>Você ainda não salvou nenhum orçamento.</p>
                        <button class="action-btn view-btn" onclick="window.location.href='../index.html'">
                            Criar Novo Orçamento
                        </button>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
        alert('Erro ao excluir orçamento. Por favor, tente novamente.');
    }
}

// Start the application
init(); 