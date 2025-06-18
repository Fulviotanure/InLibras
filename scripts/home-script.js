// === Funções de formatação e validação ===
console.log("home-script.js loaded!");

// Import Firebase functions
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Variáveis globais
let budgetItems = [];
let totalHours = 0;
let subtotal = 0;
let totalAdditions = 0;
let grossTotal = 0;
let finalTotal = 0;

// Global variables for budget calculation (should be updated by updateSummary)
let globalGrossTotal = 0;
let globalDiscount = 0;
let globalFinalValue = 0;

// Referências a elementos do DOM (declaradas globalmente)
let dataServicoInput;
let horaInicioInput;
let horaFinalInput;
let comLinguaEstrangeiraCheckbox;
let ehFeriadoCheckbox;
let leHoraInicioInput;
let leHoraFimInput;
let valorHoraInterpreteInput;

// === Funções de formatação e validação ===

// Inicialização das formatações quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const clientNameInput = document.getElementById('clientName');
    valorHoraInterpreteInput = document.getElementById('valorHoraInterprete');
    const quantidadeInterpretesInput = document.getElementById('quantidadeInterpretes');
    dataServicoInput = document.getElementById('dataServico');
    horaInicioInput = document.getElementById('horaInicio');
    horaFinalInput = document.getElementById('horaFim');
    comLinguaEstrangeiraCheckbox = document.getElementById('linguaEstrangeira');
    ehFeriadoCheckbox = document.getElementById('eFeriado');
    leHoraInicioInput = document.getElementById('horaInicioLinguaEstrangeira');
    leHoraFimInput = document.getElementById('horaFimLinguaEstrangeira');
    const foreignLangInputsDivs = document.querySelectorAll('.foreign-lang-inputs');

    const addDayBtn = document.getElementById('addDay');
    const budgetTableBody = document.getElementById('budgetTableBody');

    const subtotalSpan = document.getElementById('subtotal');
    const totalAdditionsSpan = document.getElementById('totalAdditions');
    const discountInput = document.getElementById('porcentagemDesconto');
    const valorTotalSpan = document.getElementById('valorFinal');

    const saveBudgetBtn = document.getElementById('saveBudgetBtn');
    const generatePdfBtn = document.getElementById('generatePdfBtn');

    console.log('generatePdfBtn element:', generatePdfBtn);

    // Firebase config e inicialização agora são globais

    // Função para alternar o menu do usuário
    window.toggleUserMenu = function() {
        const menu = document.getElementById('userMenu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    };

    // Fechar o menu quando clicar fora
    document.addEventListener('click', function(event) {
        const menu = document.getElementById('userMenu');
        const userButton = event.target.closest('button');
        if (menu && !userButton && !menu.contains(event.target)) {
            menu.classList.add('hidden');
        }
    });

    // Função de logout
    window.logout = function() {
        console.log('Botão Sair clicado. Tentando fazer logout...');
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        }).catch((error) => {
            console.error('Erro ao fazer logout:', error);
            alert('Erro ao fazer logout: ' + error.message);
        });
    };

    const calcularOrcamentoBtn = document.getElementById('calcularOrcamento');
    const resultadosDiv = document.getElementById('resultados');
    const horasContabilizadasSpan = document.getElementById('horasContabilizadas');
    const valorBaseSpan = document.getElementById('valorBase');
    const totalAcrescimosSpan = document.getElementById('totalAcrescimos');
    const valorBrutoSpan = document.getElementById('valorBruto');
    const valorNotaFiscalSpan = document.getElementById('valorNotaFiscal');
    const valorTotalAntesDescontoSpan = document.getElementById('valorTotalAntesDesconto');
    const secaoDescontoDiv = document.getElementById('secaoDesconto');
    const porcentagemDescontoInput = document.getElementById('porcentagemDesconto');
    const aplicarDescontoBtn = document.getElementById('aplicarDesconto');
    const valorFinalSpan = document.getElementById('valorFinal');

    // Novos elementos para entradas diárias e horário de língua estrangeira
    const dailyEntriesContainer = document.getElementById('dailyEntriesContainer');
    const dailyEntryTemplate = document.getElementById('dailyEntryTemplate');
    const dailyResultsSummary = document.getElementById('dailyResultsSummary');

    let dailyCalculations = []; // Para armazenar resultados de cada dia

    const feriadoCheckbox = document.getElementById('eFeriado');
    if (feriadoCheckbox) {
        feriadoCheckbox.addEventListener('change', window.atualizarTotais);
    }

    // Lógica para adicionar uma nova linha à tabela
    if (addDayBtn) {
        addDayBtn.addEventListener('click', addDayToBudget);
    }

    // Event listeners para atualização dos totais
    if (valorHoraInterpreteInput) {
        valorHoraInterpreteInput.addEventListener('input', window.atualizarTotais);
    }
    if (quantidadeInterpretesInput) {
        quantidadeInterpretesInput.addEventListener('input', window.atualizarTotais);
    }
    if (discountInput) {
        discountInput.addEventListener('input', function() {
            this.value = Math.floor(this.value);
            atualizarTotais();
        });
    }
    if (dataServicoInput) {
        dataServicoInput.addEventListener('change', window.atualizarTotais);
    }
    if (horaInicioInput) {
        horaInicioInput.addEventListener('change', window.atualizarTotais);
    }
    if (horaFinalInput) {
        horaFinalInput.addEventListener('change', window.atualizarTotais);
    }
    if (leHoraInicioInput) {
        leHoraInicioInput.addEventListener('change', window.atualizarTotais);
    }
    if (leHoraFimInput) {
        leHoraFimInput.addEventListener('change', window.atualizarTotais);
    }

    // Event listeners para as checkboxes
    if (ehFeriadoCheckbox) {
        ehFeriadoCheckbox.addEventListener('change', window.atualizarTotais);
    }

    // Save and Generate PDF buttons
    if (saveBudgetBtn) {
        saveBudgetBtn.addEventListener('click', saveBudget);
    }
    if (generatePdfBtn) {
        generatePdfBtn.addEventListener('click', generatePDF);
    }

    // Chamada inicial para calcular totais
    window.atualizarTotais();

    // User menu functionality
    const userNameElement = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    // Update user name when auth state changes
    window.auth.onAuthStateChanged((user) => {
        if (user) {
            // Get user's display name, email, or uid as fallback
            let displayName;
            if (user.displayName) {
                displayName = user.displayName;
            } else if (user.email) {
                displayName = user.email.split('@')[0];
            } else {
                displayName = `Usuário ${user.uid.slice(0, 4)}`;
            }
            userNameElement.textContent = displayName;
        }
    });

    // Handle logout
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await window.auth.signOut();
            window.location.replace('pages/login.html');
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Erro ao fazer logout. Por favor, tente novamente.');
        }
    });
});

// Função para atualizar os totais
function atualizarTotais() {
    // This function now primarily acts as a trigger for updateSummary
    updateSummary();
}

// Export functions that are called from HTML
export {
    atualizarTotais,
    addDayToBudget,
    removeItem,
    saveBudget,
    generatePDF
};

// Make functions available globally for HTML onclick handlers
window.atualizarTotais = atualizarTotais;
window.addDayToBudget = addDayToBudget;
window.removeItem = removeItem;
window.saveBudget = saveBudget;
window.generatePDF = generatePDF;

// Função para adicionar um novo dia (linha) à tabela de orçamento
function addDayToBudget(e) {
    if (e) {
        e.preventDefault();
    }

    console.log('=== INICIANDO ADIÇÃO DE NOVO DIA ===');
    console.log('1. Coletando valores dos campos...');

    // Get all required input elements
    const data = document.getElementById('dataServico')?.value;
    const inicio = document.getElementById('horaInicio')?.value;
    const fim = document.getElementById('horaFim')?.value;
    const qtdTils = parseInt(document.getElementById('quantidadeInterpretes')?.value) || 0;
    const vHora = parseFloat(document.getElementById('valorHoraInterprete')?.value?.replace('R$', '').replace(/\s/g, '').replace(',', '.')) || 0;
    const comLE = document.getElementById('linguaEstrangeira')?.checked || false;
    const leInicio = document.getElementById('horaInicioLinguaEstrangeira')?.value;
    const leFim = document.getElementById('horaFimLinguaEstrangeira')?.value;
    const feriado = document.getElementById('eFeriado')?.checked || false;

    console.log('2. Valores coletados:', {
        data,
        inicio,
        fim,
        qtdTils,
        vHora,
        comLE,
        leInicio,
        leFim,
        feriado
    });

    // Get the error message div
    const errorMessageDiv = document.getElementById('errorMessage');
    if (!errorMessageDiv) {
        console.error('3. ERRO: Elemento errorMessage não encontrado');
        return;
    }
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.innerHTML = '';

    // Array to store validation errors and warnings
    const errors = [];
    const warnings = [];

    console.log('4. Iniciando validações...');

    // Validate each field and add specific error messages
    if (!data) {
        console.log('4.1. Data do serviço não preenchida');
        errors.push("❌ Data do Serviço: Campo obrigatório");
    }

    if (!inicio) {
        console.log('4.2. Hora de início não preenchida');
        errors.push("❌ Hora de Início: Campo obrigatório");
    }

    if (!fim) {
        console.log('4.3. Hora final não preenchida');
        errors.push("❌ Hora Final: Campo obrigatório");
    }

    if (!qtdTils || qtdTils < 1) {
        console.log('4.4. Quantidade de Intérpretes inválida:', qtdTils);
        errors.push("❌ Quantidade de Intérpretes: Deve ser maior que zero");
    }

    if (!vHora || vHora <= 0) {
        console.log('4.5. Valor hora inválido:', vHora);
        errors.push("❌ Valor Hora por Intérprete: Deve ser maior que zero");
    }

    // Validate time format if times are provided
    if (inicio) {
        console.log('4.6. Validando formato da hora de início:', inicio);
        if (!isValidTimeFormat(inicio)) {
            console.log('4.6.1. Formato da hora de início inválido');
            errors.push("❌ Hora de Início: Formato inválido (use HH:mm)");
        }
    }

    if (fim) {
        console.log('4.7. Validando formato da hora final:', fim);
        if (!isValidTimeFormat(fim)) {
            console.log('4.7.1. Formato da hora final inválido');
            errors.push("❌ Hora Final: Formato inválido (use HH:mm)");
        }
    }

    // Validate if end time is after start time (this becomes a warning)
    if (inicio && fim && isValidTimeFormat(inicio) && isValidTimeFormat(fim)) {
        console.log('4.8. Validando ordem dos horários');
        const start = new Date(`2000-01-01T${inicio}`);
        const end = new Date(`2000-01-01T${fim}`);
        if (end <= start) {
            console.log('4.8.1. Horário final é anterior ao inicial (possível serviço noturno)');
            warnings.push("⚠️ Aviso: Horário final é anterior ao horário de início (serviço noturno)");
        }
    }

    // Validate foreign language times if checkbox is checked
    if (comLE) {
        console.log('4.9. Validando campos de língua estrangeira');
        if (!leInicio) {
            console.log('4.9.1. Início de língua estrangeira não preenchido');
            errors.push("❌ Início Língua Estrangeira: Campo obrigatório quando língua estrangeira está marcada");
        }
        if (!leFim) {
            console.log('4.9.2. Fim de língua estrangeira não preenchido');
            errors.push("❌ Fim Língua Estrangeira: Campo obrigatório quando língua estrangeira está marcada");
        }
        if (leInicio && !isValidTimeFormat(leInicio)) {
            console.log('4.9.3. Formato do início de língua estrangeira inválido');
            errors.push("❌ Início Língua Estrangeira: Formato inválido (use HH:mm)");
        }
        if (leFim && !isValidTimeFormat(leFim)) {
            console.log('4.9.4. Formato do fim de língua estrangeira inválido');
            errors.push("❌ Fim Língua Estrangeira: Formato inválido (use HH:mm)");
        }
        if (leInicio && leFim && isValidTimeFormat(leInicio) && isValidTimeFormat(leFim)) {
            const leStart = new Date(`2000-01-01T${leInicio}`);
            const leEnd = new Date(`2000-01-01T${leFim}`);
            if (leEnd <= leStart) {
                console.log('4.9.5. Fim de língua estrangeira é anterior ao início');
                errors.push("❌ Fim Língua Estrangeira: Deve ser maior que o horário de início");
            }
        }
    }

    console.log('5. Total de erros encontrados:', errors.length);

    // If there are any errors, show them and return
    if (errors.length > 0) {
        console.log('6. Exibindo erros encontrados');
        errorMessageDiv.innerHTML = `
            <div class="error-header">❌ Não foi possível adicionar o dia. Por favor, corrija os seguintes erros:</div>
            <ul class="error-list">
                ${errors.map(error => `<li>${error}</li>`).join('')}
            </ul>
        `;
        errorMessageDiv.style.display = 'block';
        return;
    }

    // If there are warnings, display them
    if (warnings.length > 0) {
        console.log('6. Exibindo avisos encontrados');
        errorMessageDiv.innerHTML = `
            <div class="error-header">⚠️ Avisos:</div>
            <ul class="error-list">
                ${warnings.map(warning => `<li>${warning}</li>`).join('')}
            </ul>
        `;
        errorMessageDiv.style.display = 'block';
    }

    console.log('7. Criando novo item...');

    // Convert date from DD/MM/YYYY to YYYY-MM-DD for internal use
    const [day, month, year] = data.split('/');
    const formattedDate = `${year}-${month}-${day}`;

    // Calculate segmented hours for the new item
    const segmentValues = getSegmentBaseValues(formattedDate, inicio, fim, qtdTils, vHora);
    const newSaturdayHours = segmentValues.saturdayHours;
    const newSundayHours = segmentValues.sundayHours;

    // Calculate night hours for the new item
    const newNightHours = calculateActualNightHours(inicio, fim);

    // Create new item
    const newItem = {
        date: formattedDate,
        startTime: inicio,
        endTime: fim,
        hourlyRate: vHora,
        interpreters: qtdTils,
        hasForeignLanguage: comLE,
        leHoraInicio: leInicio,
        leHoraFim: leFim,
        isHoliday: feriado,
        isSaturday: new Date(formattedDate).getDay() === 6,
        saturdayHours: newSaturdayHours,
        sundayHours: newSundayHours,
        nightHours: newNightHours
    };

    // Calculate derived values for newItem
    const hours = calculateHours(newItem.startTime, newItem.endTime);
    const baseValue = hours * newItem.hourlyRate * newItem.interpreters;

    // Create a temporary item for calculateAdditions, it expects certain properties
    const tempItemForAdditions = {
        date: newItem.date,
        startTime: newItem.startTime,
        endTime: newItem.endTime,
        interpreters: newItem.interpreters,
        hourlyRate: newItem.hourlyRate,
        hasForeignLanguage: newItem.hasForeignLanguage,
        leHoraInicio: newItem.leHoraInicio,
        leHoraFim: newItem.leHoraFim,
        isHoliday: newItem.isHoliday,
        saturdayHours: newItem.saturdayHours,
        sundayHours: newItem.sundayHours,
        nightHours: newItem.nightHours,
    };

    const additionsResult = calculateAdditions(tempItemForAdditions, baseValue);

    // Add these calculated properties to newItem
    newItem.hours = hours;
    newItem.baseValue = baseValue;
    newItem.additionsAmount = (additionsResult.foreignLanguageAddition + additionsResult.saturdayAddition + additionsResult.sundayHolidayAddition + additionsResult.nightAddition);
    newItem.total = additionsResult.finalTotalWithAdditions;
    newItem.isNight = (newItem.nightHours > 0);
    // Adicionar os valores monetários individuais dos acréscimos
    newItem.foreignLanguageAddition = additionsResult.foreignLanguageAddition;
    newItem.saturdayAddition = additionsResult.saturdayAddition;
    newItem.sundayHolidayAddition = additionsResult.sundayHolidayAddition;
    newItem.nightAddition = additionsResult.nightAddition;

    console.log('8. Novo item criado:', newItem);

    // Add to budget items array
    budgetItems.push(newItem);
    console.log('9. Array de itens atualizado:', budgetItems);

    // Update table
    updateTable();
    console.log('10. Tabela atualizada');

    // Update summary
    updateSummary();
    console.log('11. Resumo atualizado');

    // Clear inputs
    clearInputs();
    console.log('12. Campos limpos');
    console.log('=== FIM DA ADIÇÃO DE NOVO DIA ===');
}

// Função para calcular horas (função auxiliar que já existia)
function calculateHours(startTime, endTime) {
    const [hInicio, mInicio] = startTime.split(':').map(Number);
    const [hFim, mFim] = endTime.split(':').map(Number);
    let totalMinutos;

    if (hFim < hInicio) {
        const minutosAteMeiaNoite = (24 * 60) - (hInicio * 60 + mInicio);
        const minutosDepoisMeiaNoite = hFim * 60 + mFim;
        totalMinutos = minutosAteMeiaNoite + minutosDepoisMeiaNoite;
    } else {
        totalMinutos = (hFim * 60 + mFim) - (hInicio * 60 + mInicio);
    }

    let horasTrabalhadas = totalMinutos / 60;
    horasTrabalhadas = Math.ceil(horasTrabalhadas);

    if (horasTrabalhadas > 4) {
        horasTrabalhadas += 1;
    }

    return horasTrabalhadas;
}

// Função para formatar moeda (BRL)
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para validar formato de data (dd/mm/aaaa)
function isValidDateFormat(date) {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return dateRegex.test(date);
}

// Função para validar formato de hora (HH:mm)
function isValidTimeFormat(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

// Função para atualizar a tabela
function updateTable() {
    console.log('Iniciando atualização da tabela...');
    console.log('Itens a serem exibidos:', budgetItems);
    
    // Clear the table body
    budgetTableBody.innerHTML = '';
    
    // Add each item to the table
    budgetItems.forEach((item, index) => {
        console.log(`Processando item ${index}:`, item);
        
        const row = document.createElement('tr');
        row.dataset.date = item.date;
        row.dataset.startTime = item.startTime;
        row.dataset.endTime = item.endTime;
        row.dataset.qtdTils = item.interpreters;
        row.dataset.vHora = item.hourlyRate;
        row.dataset.comLE = item.hasForeignLanguage;
        row.dataset.leStartTime = item.leHoraInicio;
        row.dataset.leEndTime = item.leHoraFim;
        row.dataset.feriado = item.isHoliday;
        
        // Calculate hours using the function that includes the +1 hour logic
        const hours = calculateHours(item.startTime, item.endTime);
        
        row.innerHTML = `
            <td>${formatDate(item.date)}</td>
            <td>${item.startTime}</td>
            <td>${item.endTime}</td>
            <td class="hours-calc">${hours.toFixed(1)}</td>
            <td>${item.interpreters}</td>
            <td>R$ ${item.hourlyRate.toFixed(2).replace('.', ',')}</td>
            <td class="foreign-lang-addition"></td>
            <td class="saturday-addition"></td>
            <td class="sunday-holiday-addition"></td>
            <td class="night-addition"></td>
            <td class="row-total"></td>
            <td>
                <button onclick="removeItem(${index})" class="button-62">Remover</button>
            </td>
        `;
        
        console.log(`Linha ${index} criada:`, row.innerHTML);
        budgetTableBody.appendChild(row);
        
        // Calculate row total
        calculateRowTotal(row);
    });
    
    console.log('Tabela atualizada com sucesso');
}

// Função para remover item
function removeItem(index) {
    budgetItems.splice(index, 1);
    updateTable();
    updateSummary();
}

// Função para exibir mensagens de erro
function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
    }
}

// Função para ocultar mensagens de erro
function hideErrorMessage() {
    const errorMessageElement = document.getElementById('errorMessage');
    if (errorMessageElement) {
        errorMessageElement.textContent = '';
        errorMessageElement.style.display = 'none';
    }
}

// Função para limpar inputs
function clearInputs() {
    // Temporarily remove event listeners to prevent unwanted triggers
    dataServicoInput.removeEventListener('input', window.atualizarTotais);
    horaInicioInput.removeEventListener('input', window.atualizarTotais);
    horaFinalInput.removeEventListener('input', window.atualizarTotais);
    leHoraInicioInput.removeEventListener('input', window.atualizarTotais);
    leHoraFimInput.removeEventListener('input', window.atualizarTotais);

    // Clear inputs
    dataServicoInput.value = '';
    horaInicioInput.value = '';
    horaFinalInput.value = '';
    comLinguaEstrangeiraCheckbox.checked = false;
    ehFeriadoCheckbox.checked = false;
    leHoraInicioInput.value = '';
    leHoraFimInput.value = '';

    // Re-add event listeners
    dataServicoInput.addEventListener('input', window.atualizarTotais);
    horaInicioInput.addEventListener('input', window.atualizarTotais);
    horaFinalInput.addEventListener('input', window.atualizarTotais);
    leHoraInicioInput.addEventListener('input', window.atualizarTotais);
    leHoraFimInput.addEventListener('input', window.atualizarTotais);
}

// Funções auxiliares
function calculateTimeDifference(start, end) {
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    let diff = (endDate - startDate) / (1000 * 60 * 60);
    if (diff < 0) {
        diff += 24; // Handle overnight shifts
    }
    return diff;
}

function calculateNightHours(start, end) {
    // Simplified for now, real calculation would involve iterating through hours
    // This is a placeholder for actual night hour calculation logic.
    return 0; 
}

// Função para calcular horas noturnas reais (22:00 - 05:00)
function calculateActualNightHours(start, end) {
    let nightMinutes = 0;

    const startDateTime = new Date(`2000-01-01T${start}`);
    let endDateTime = new Date(`2000-01-01T${end}`);

    if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1); // Overnight shift
    }

    let current = new Date(startDateTime);
    while (current < endDateTime) {
        const hour = current.getHours();
        const nextHour = new Date(current);
        nextHour.setHours(current.getHours() + 1, 0, 0, 0); // Start of next full hour

        const segmentStart = current.getTime();
        const segmentEnd = Math.min(endDateTime.getTime(), nextHour.getTime());
        
        const durationInMinutesInSegment = (segmentEnd - segmentStart) / (1000 * 60);

        if (durationInMinutesInSegment <= 0) { // Avoid infinite loop if current is already endDateTime
             break;
        }

        // Check if the current hour falls into the night period (22:00 - 05:00)
        if (hour >= 22 || hour < 5) {
            nightMinutes += durationInMinutesInSegment;
        }
        current = nextHour;
    }
    
    return Math.ceil(nightMinutes / 60); // Return in hours, rounded up
}

// Função auxiliar para obter as horas de serviço segmentadas por dia da semana
function getSegmentBaseValues(dateString, startTime, endTime, qtdTils, vHora) {
    const dateParts = dateString.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);

    const startDateTime = new Date(year, month, day, parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]));
    let endDateTime = new Date(year, month, day, parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]));

    if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1); // Service spans overnight
    }

    let saturdayRawHours = 0;
    let sundayRawHours = 0;
    let weekdayRawHours = 0;

    let current = new Date(startDateTime);
    while (current < endDateTime) {
        const currentDayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday

        let endOfCurrentDay = new Date(current);
        endOfCurrentDay.setHours(24, 0, 0, 0); // Midnight of the current day (start of next day)

        let segmentEnd = Math.min(endDateTime.getTime(), endOfCurrentDay.getTime());
        let durationInHoursInSegment = (segmentEnd - current.getTime()) / (1000 * 60 * 60);

        // Arredondar para cima antes de adicionar às horas segmentadas
        durationInHoursInSegment = Math.ceil(durationInHoursInSegment);

        if (durationInHoursInSegment === 0) { // Avoid infinite loop if current is already endDateTime
             break;
        }

        if (currentDayOfWeek === 6) { // Saturday
            saturdayRawHours += durationInHoursInSegment;
        } else if (currentDayOfWeek === 0) { // Sunday
            sundayRawHours += durationInHoursInSegment;
        } else { // Weekday
            weekdayRawHours += durationInHoursInSegment;
        }
        current = new Date(segmentEnd);
    }
    const totalRawHours = saturdayRawHours + sundayRawHours + weekdayRawHours;

    return {
        saturdayHours: Math.ceil(saturdayRawHours),
        sundayHours: Math.ceil(sundayRawHours),
        weekdayHours: Math.ceil(weekdayRawHours),
        totalRawHours: Math.ceil(totalRawHours) // Although totalRawHours is not directly used for monetary calc, better to keep it consistent
    };
}

// Função para formatar data (dd/mm/yyyy)
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

function updateSummary() {
    console.log('updateSummary called. Current budgetItems:', budgetItems);
    let totalHoursSummary = 0;
    let subtotalSummary = 0;
    let totalAdditionsSummary = 0;
    let grossTotalSummary = 0;

    budgetItems.forEach(item => {
        console.log('Processing item in updateSummary:', item);
        let hours = calculateHours(item.startTime, item.endTime);
        hours = Math.ceil(hours); // Apply rounding for summary as well
        console.log('  Calculated hours for item:', hours);

        const baseValue = hours * item.hourlyRate * item.interpreters;
        console.log('  Calculated baseValue for item:', baseValue);

        // Use the refactored calculateAdditions to get detailed additions
        const additions = calculateAdditions({
            date: item.date,
            startTime: item.startTime,
            endTime: item.endTime,
            interpreters: item.interpreters,
            hourlyRate: item.hourlyRate,
            hasForeignLanguage: item.hasForeignLanguage,
            leHoraInicio: item.leHoraInicio,
            leHoraFim: item.leHoraFim,
            isHoliday: item.isHoliday,
            saturdayHours: item.saturdayHours, // Ensure these are passed from the item
            sundayHours: item.sundayHours, // Ensure these are passed from the item
            nightHours: item.nightHours // Ensure this is passed from the item
        }, baseValue);
        console.log('  Additions for item:', additions);

        totalHoursSummary += hours;
        subtotalSummary += baseValue;
        totalAdditionsSummary += (additions.foreignLanguageAddition + additions.saturdayAddition + additions.sundayHolidayAddition + additions.nightAddition);
        grossTotalSummary += additions.finalTotalWithAdditions;

        console.log('  Accumulated totals after item:', {
            totalHoursSummary,
            subtotalSummary,
            totalAdditionsSummary,
            grossTotalSummary
        });
    });

    // Assign to global variables
    totalHours = totalHoursSummary;
    subtotal = subtotalSummary;
    totalAdditions = totalAdditionsSummary;
    grossTotal = grossTotalSummary;

    const discountElement = document.getElementById('porcentagemDesconto');
    const discountPercentage = discountElement ? parseFloat(discountElement.value.replace(',', '.')) || 0 : 0;
    const discountAmount = grossTotal * (discountPercentage / 100);
    const valorComDesconto = grossTotal - discountAmount;
    const valorNotaFiscal16 = valorComDesconto * 0.16;
    const valorFinalComNota = valorComDesconto + valorNotaFiscal16;

    console.log('Final summary values before DOM update:', {
        totalHours,
        subtotal,
        totalAdditions,
        grossTotal,
        valorComDesconto,
        valorNotaFiscal16,
        valorFinalComNota
    });

    const totalHoursElement = document.getElementById('totalHoras');
    if (totalHoursElement) {
        totalHoursElement.textContent = `${totalHours} horas`;
    }

    const valorHoraTotalElement = document.getElementById('valorHoraTotal');
    if (valorHoraTotalElement && valorHoraInterpreteInput) {
        valorHoraTotalElement.textContent = formatCurrency(parseFloat(valorHoraInterpreteInput.value.replace(',', '.')) || 0);
    }

    const totalAdditionsElement = document.getElementById('totalAcrescimos');
    if (totalAdditionsElement) {
        totalAdditionsElement.textContent = formatCurrency(totalAdditions);
    }

    const totalGeralElement = document.getElementById('totalGeral');
    if (totalGeralElement) {
        totalGeralElement.textContent = formatCurrency(grossTotal);
    }

    const valorNotaFiscal16Element = document.getElementById('valorNotaFiscal16');
    if (valorNotaFiscal16Element) {
        valorNotaFiscal16Element.textContent = formatCurrency(valorNotaFiscal16);
    }

    const valorFinalElement = document.getElementById('valorFinal');
    if (valorFinalElement) {
        valorFinalElement.textContent = formatCurrency(valorFinalComNota);
    }

    // Update global variables
    globalGrossTotal = grossTotal;
    globalDiscount = discountPercentage;
    globalFinalValue = valorFinalComNota;
}

// Function to save budget to Firebase
async function saveBudget() {
    console.log('saveBudget function called.');
    console.log('Current globalGrossTotal:', globalGrossTotal);
    console.log('Current globalDiscount:', globalDiscount);
    console.log('Current globalFinalValue:', globalFinalValue);

    try {
        // Get the current user
        const user = window.auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        // Get the client name
        let clientName = document.getElementById('clientName').value;
        
        // If no client name is provided, generate a sequential budget number
        if (!clientName) {
            try {
                const budgetsRef = collection(window.db, 'budgets');
                const q = query(budgetsRef, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const budgetCount = querySnapshot.size;
                clientName = `Orçamento ${budgetCount + 1}`;
            } catch (error) {
                console.error('Erro ao obter contagem de orçamentos:', error);
                // Fallback if there's an error getting count (e.g., first budget)
                clientName = 'Orçamento 1';
            }
        }

        // Create the budget data object
        const budgetData = {
            clientName: clientName,
            items: budgetItems,
            totalHours: totalHours,
            subtotal: subtotal,
            totalAdditions: totalAdditions,
            grossTotal: globalGrossTotal,
            discount: globalDiscount,
            finalValue: globalFinalValue,
            createdAt: serverTimestamp(),
            userId: user.uid
        };

        // Add the budget to Firestore
        const docRef = await addDoc(collection(window.db, "budgets"), budgetData);
        console.log("Orçamento salvo com sucesso! ID:", docRef.id);
        alert("Orçamento salvo com sucesso!");
        
        // Clear the form
        budgetItems = [];
        updateTable();
        updateSummary();
        document.getElementById('clientName').value = '';
        
    } catch (error) {
        console.error("Error saving budget:", error);
        alert("Erro ao salvar orçamento: " + error.message);
    }
}

function generatePDF() {
    const pdfContentArea = document.getElementById('pdfContentArea');
    if (!pdfContentArea) {
        console.error('PDF content area not found.');
        return;
    }

    // Clear previous content
    pdfContentArea.innerHTML = '';
    pdfContentArea.style.display = 'block'; // Make visible temporarily for html2pdf

    const clientName = document.getElementById('clientName')?.value || 'N/A';
    const totalHours = document.getElementById('totalHoras')?.textContent || '0 horas';
    const subtotal = document.getElementById('subtotal')?.textContent || 'R$ 0,00';
    const totalAdditions = document.getElementById('totalAcrescimos')?.textContent || 'R$ 0,00';
    const grossTotal = document.getElementById('totalGeral')?.textContent || 'R$ 0,00';
    const discount = document.getElementById('porcentagemDesconto')?.value || '0';
    const valorTotal = document.getElementById('valorFinal')?.textContent || 'R$ 0,00';

    console.log('PDF Generation Values:', {
        clientName,
        totalHours,
        subtotal,
        totalAdditions,
        grossTotal,
        discount,
        valorTotal
    });

    let tableRowsHtml = '';
    budgetItems.forEach(item => {
        const hours = calculateHours(item.startTime, item.endTime);
        const baseValue = hours * item.hourlyRate * item.interpreters;

        // Recalculate additions for PDF
        const dateParts = item.date.split('-');
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1;
        const day = parseInt(dateParts[2]);
        const serviceDate = new Date(year, month, day);

        const segmentedHours = getSegmentBaseValues(item.date, item.startTime, item.endTime, item.interpreters, item.hourlyRate);

        let saturdayAdditionValue = 0;
        const saturdayBase = segmentedHours.saturdayHours * item.interpreters * item.hourlyRate;
        if (segmentedHours.saturdayHours > 0) {
            saturdayAdditionValue = saturdayBase * 0.25;
        }

        let sundayHolidayAdditionValue = 0;
        const sundayBase = segmentedHours.sundayHours * item.interpreters * item.hourlyRate;
        if (item.isHoliday) {
            sundayHolidayAdditionValue = baseValue * 0.50;
        } else if (segmentedHours.sundayHours > 0) {
            sundayHolidayAdditionValue = sundayBase * 0.50;
        }

        let nightHours = calculateActualNightHours(item.startTime, item.endTime);
        let nightAdditionValue = 0;
        if (nightHours > 0) {
            nightAdditionValue = (nightHours * item.interpreters * item.hourlyRate) * 0.25;
        }
        
        let leAdditionValue = 0;
        if (item.hasForeignLanguage && item.leHoraInicio && item.leHoraFim) {
            const leHours = calculateHours(item.leHoraInicio, item.leHoraFim);
            leAdditionValue = (Math.ceil(leHours) * item.interpreters * item.hourlyRate) * 0.50;
        }

        const rowBaseValue = hours * item.interpreters * item.hourlyRate;
        const rowTotal = rowBaseValue + saturdayAdditionValue + sundayHolidayAdditionValue + nightAdditionValue + leAdditionValue;

        tableRowsHtml += `
            <tr style="background-color: white;">
                <td style="color: black;">${formatDate(item.date)}</td>
                <td style="color: black;">${item.startTime}</td>
                <td style="color: black;">${item.endTime}</td>
                <td style="color: black;">${hours.toFixed(1)}</td>
                <td style="color: black;">${item.interpreters}</td>
                <td style="color: black;">${formatCurrency(leAdditionValue)}</td>
                <td style="color: black;">${formatCurrency(saturdayAdditionValue)}</td>
                <td style="color: black;">${formatCurrency(sundayHolidayAdditionValue)}</td>
                <td style="color: black;">${formatCurrency(nightAdditionValue)}</td>
                <td style="color: black;">${formatCurrency(rowBaseValue)}</td>
                <td style="color: black;">${formatCurrency(rowTotal)}</td>
            </tr>
        `;
    });

    const pdfHtml = `
        <div class="pdf-document" style="background-color: white; color: black;">
            <div class="pdf-header">
                <img src="../assets/logopdf.png" alt="InLibras Logo" class="pdf-logo">
                <h1 style="color: black;">Orçamento de Serviço</h1>
            </div>
            <div class="pdf-section">
                <h2 style="color: black;">Informações do Cliente</h2>
                <p style="color: black;"><strong>Cliente/Evento:</strong> ${clientName}</p>
            </div>
            <div class="summary-pdf">
                <div class="summary-grid-pdf">
                    <div>
                        <p style="color: black;"><strong>Horas Totais:</strong> <span style="color: black;">${totalHours}</span></p>
                        <p style="color: black;"><strong>Valor Hora por Intérprete:</strong> <span style="color: black;">${formatCurrency(parseFloat(valorHoraInterpreteInput?.value?.replace(',', '.')) || 0)}</span></p>
                        <p style="color: black;"><strong>Total Acréscimos:</strong> <span style="color: black;">${totalAdditions}</span></p>
                    </div>
                    <div>
                        <p style="color: black;"><strong>Total Bruto:</strong> <span style="color: black;">${grossTotal}</span></p>
                        <p style="color: black;"><strong>Desconto:</strong> <span style="color: black;">${discount}%</span></p>
                        <p style="color: black;"><strong>Nota Fiscal 16%:</strong> <span style="color: black;">${formatCurrency(valorNotaFiscal16)}</span></p>
                        <p style="color: black;"><strong>VALOR FINAL:</strong> <span style="color: black; font-weight: bold; font-size: 1.2rem;">${formatCurrency(valorFinalComNota)}</span></p>
                    </div>
                </div>
            </div>

            <div class="pdf-section">
                <h2 style="color: black;">Itens do Orçamento</h2>
                <table class="pdf-table" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Data</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Início</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Fim</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Horas</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Qtd. Tils</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Língua Estrangeira (50%)</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Sábado (25%)</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Domingo/Feriado (50%)</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Horário Noturno (25%)</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Valor Base (R$)</th>
                            <th style="color: black; border: 1px solid #ddd; padding: 8px; text-align: left;">Total (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
            </div>
            <div class="pdf-section pdf-description">
                <h2 style="color: black;">Descrição dos Valores</h2>
                <p style="color: black;"><strong>Valor Base:</strong> É o resultado da multiplicação das Horas Totais pelo Valor Hora por Intérprete.</p>
                <p style="color: black;"><strong>Arredondamento de Horas:</strong> Horas fracionadas são arredondadas para o próximo número inteiro (ex: 2,5 horas = 3 horas).</p>
                <p style="color: black;"><strong>Acréscimo de 1 Hora:</strong> Para períodos acima de 4 horas, é adicionada automaticamente 1 hora extra ao total.</p>
                <p style="color: black;"><strong>Acréscimo de Sábado:</strong> Adiciona 25% sobre o valor base do período trabalhado no sábado.</p>
                <p style="color: black;"><strong>Acréscimo de Domingo/Feriado:</strong> Adiciona 50% sobre o valor base do período trabalhado no domingo ou se a data for um feriado. Se for feriado, aplica-se sobre o valor total bruto do serviço.</p>
                <p style="color: black;"><strong>Acréscimo de Língua Estrangeira:</strong> Adiciona 50% sobre o valor base das horas de língua estrangeira.</p>
                <p style="color: black;"><strong>Acréscimo de Horário Noturno:</strong> Adiciona 25% sobre o valor base das horas trabalhadas entre 22h e 5h.</p>
                <p style="color: black;"><strong>Total de Acréscimos:</strong> É a soma de todos os acréscimos aplicados.</p>
                <p style="color: black;"><strong>Total Bruto:</strong> É o valor final após a aplicação de todos os acréscimos percentuais.</p>
                <p style="color: black;"><strong>Valor Final:</strong> É o Total Bruto menos o percentual de desconto aplicado.</p>
            </div>
        </div>
    `;

    pdfContentArea.innerHTML = pdfHtml;

    // Make the pdfContentArea visible before generating the canvas
    pdfContentArea.style.display = 'block';

    // Get the dimensions of the pdfContentArea
    const pdfContentAreaRect = pdfContentArea.getBoundingClientRect();

    const opt = {
        filename: `orcamento_${clientName.replace(/\s/g, '_')}.pdf`,
        image: { type: 'png', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            logging: false, 
            dpi: 192, 
            useCORS: true, 
            backgroundColor: '#ffffff',
            width: pdfContentAreaRect.width,
            height: pdfContentAreaRect.height
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
    };

    // Primeiro, vamos gerar o canvas
    html2canvas(pdfContentArea, opt.html2canvas).then(function(canvas) {
        // Criar uma nova janela com o conteúdo formatado
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            alert('Por favor, permita pop-ups para visualizar o PDF.');
            return;
        }

        // Escrever o conteúdo HTML na nova janela
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <title>Orçamento - ${clientName}</title>
                <meta charset="UTF-8">
                <style>
                    body { 
                        margin: 0; 
                        padding: 20px; 
                        background: #f5f5f5;
                        font-family: Arial, sans-serif;
                        color: #333;
                    }
                    .print-container { 
                        max-width: 210mm; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 20px; 
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    .print-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 10px 20px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        z-index: 1000;
                    }
                    .print-button:hover {
                        background: #45a049;
                    }
                    @media print {
                        .print-button { display: none; }
                        body { padding: 0; background: white; }
                        .print-container { 
                            box-shadow: none; 
                            padding: 0;
                        }
                    }
                    .pdf-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    .pdf-table th,
                    .pdf-table td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                        color: #333;
                    }
                    .pdf-table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    .pdf-table tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .pdf-table tr:hover {
                        background-color: #f5f5f5;
                    }
                </style>
            </head>
            <body>
                <button class="print-button" onclick="window.print()">Imprimir</button>
                <div class="print-container">
                    <img src="${canvas.toDataURL('image/png')}" style="width: 100%; display: block;">
                </div>
                <script>
                    window.focus();
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();

        // Ocultar o contêiner do PDF após a geração
        pdfContentArea.style.display = 'none';
    }).catch(function(error) {
        console.error('Erro ao gerar o PDF:', error);
        alert('Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.');
        pdfContentArea.style.display = 'none';
    });
}

// Função para calcular acréscimos (esta função não estava sendo usada diretamente e pode ser removida se não for necessária)
function calculateAdditions(item, baseValue) {
    let currentAccumulatedTotal = baseValue; // Start with the base value

    let foreignLanguageAdditionAmount = 0;
    let saturdayAdditionAmount = 0;
    let sundayHolidayAdditionAmount = 0;
    let nightAdditionAmount = 0;
    
    // Acréscimo de Língua Estrangeira (50%) baseado nas horas de LE - Applied first as per UI order
    if (item.hasForeignLanguage && item.leHoraInicio && item.leHoraFim) {
        const leHours = calculateHours(item.leHoraInicio, item.leHoraFim);
        const leBaseValue = (Math.ceil(leHours) * item.interpreters * item.hourlyRate);
        foreignLanguageAdditionAmount = leBaseValue * 0.50;
        currentAccumulatedTotal += foreignLanguageAdditionAmount;
    }

    // Acréscimo de Sábado (25%)
    if (item.saturdayHours > 0) {
        saturdayAdditionAmount = currentAccumulatedTotal * 0.25;
        currentAccumulatedTotal += saturdayAdditionAmount;
    }

    // Acréscimo de Domingo/Feriado (50%)
    if (item.isHoliday || item.sundayHours > 0) { // Check both isHoliday and sundayHours
        sundayHolidayAdditionAmount = currentAccumulatedTotal * 0.50;
        currentAccumulatedTotal += sundayHolidayAdditionAmount;
    }

    // Acréscimo de Horário Noturno (25%)
    if (item.nightHours > 0) {
        nightAdditionAmount = currentAccumulatedTotal * 0.25;
        currentAccumulatedTotal += nightAdditionAmount;
    }

    return {
        foreignLanguageAddition: foreignLanguageAdditionAmount,
        saturdayAddition: saturdayAdditionAmount,
        sundayHolidayAddition: sundayHolidayAdditionAmount,
        nightAddition: nightAdditionAmount,
        finalTotalWithAdditions: currentAccumulatedTotal // The final accumulated total after all additions
    };
}

// Calculate row total
function calculateRowTotal(row) {
    const date = row.dataset.date;
    const startTime = row.dataset.startTime;
    const endTime = row.dataset.endTime;
    const interpreters = parseFloat(row.dataset.qtdTils);
    const hourlyRate = parseFloat(row.dataset.vHora);
    const hasForeignLanguage = row.dataset.comLE === 'true';
    const leHoraInicio = row.dataset.leStartTime;
    const leHoraFim = row.dataset.leEndTime;
    const isHoliday = row.dataset.feriado === 'true';

    // Base Calculation
    const hours = calculateHours(startTime, endTime);
    const baseValue = hours * hourlyRate * interpreters;

    // Segmented hours for additions
    const segmentValues = getSegmentBaseValues(date, startTime, endTime, interpreters, hourlyRate);
    const saturdayHours = segmentValues.saturdayHours;
    const sundayHours = segmentValues.sundayHours;
    const weekdayHours = segmentValues.weekdayHours;
    const totalRawHours = segmentValues.totalRawHours;

    // Night hours calculation
    const nightHours = calculateActualNightHours(startTime, endTime);

    // Create a temporary item object for calculateAdditions
    const tempItem = {
        date: date,
        startTime: startTime,
        endTime: endTime,
        interpreters: interpreters,
        hourlyRate: hourlyRate,
        hasForeignLanguage: hasForeignLanguage,
        leHoraInicio: leHoraInicio,
        leHoraFim: leHoraFim,
        isHoliday: isHoliday,
        saturdayHours: saturdayHours,
        sundayHours: sundayHours,
        weekdayHours: weekdayHours,
        nightHours: nightHours,
        totalRawHours: totalRawHours // Pass this to calculateAdditions for proper calculation
    };
    
    // Calculate additions
    const additions = calculateAdditions(tempItem, baseValue);

    // Update cells
    row.querySelector('.hours-calc').textContent = hours.toFixed(1);
    row.querySelector('.foreign-lang-addition').textContent = formatCurrency(additions.foreignLanguageAddition);
    row.querySelector('.saturday-addition').textContent = formatCurrency(additions.saturdayAddition);
    row.querySelector('.sunday-holiday-addition').textContent = formatCurrency(additions.sundayHolidayAddition);
    row.querySelector('.night-addition').textContent = formatCurrency(additions.nightAddition);

    const rowTotal = additions.finalTotalWithAdditions;
    row.querySelector('.row-total').textContent = formatCurrency(rowTotal);
}