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

        const snapshot = await window.db.collection('budgets')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

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
        snapshot.forEach(doc => {
            const budget = doc.data();
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
                    <button class="action-btn view-btn" onclick="viewBudget('${doc.id}')">
                        Visualizar
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteBudget('${doc.id}')">
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

// Delete budget
async function deleteBudget(budgetId) {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) {
        return;
    }

    try {
        await window.db.collection('budgets').doc(budgetId).delete();
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