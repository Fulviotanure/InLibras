// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db;
let auth;
try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log('Firebase initialized in home/script.js');
} catch (error) {
    console.error("Error initializing Firebase: ", error);
}

// DOM Elements
const clientNameInput = document.getElementById('clientName');
const valorHoraPadraoInput = document.getElementById('valorHoraPadrao');
const qtdTilsPadraoInput = document.getElementById('qtdTilsPadrao');
const dataServicoInput = document.getElementById('dataServico');
const horaInicioInput = document.getElementById('horaInicio');
const horaFinalInput = document.getElementById('horaFinal');
const comLinguaEstrangeiraCheckbox = document.getElementById('comLinguaEstrangeira');
const ehFeriadoCheckbox = document.getElementById('ehFeriado');
const leHoraInicioInput = document.getElementById('leHoraInicio');
const leHoraFimInput = document.getElementById('leHoraFim');
const foreignLangInputsDivs = document.querySelectorAll('.foreign-lang-inputs');

const addDayBtn = document.getElementById('addDayBtn');
const budgetTableBody = document.getElementById('budgetTableBody');

const subtotalSpan = document.getElementById('subtotal');
const totalAdditionsSpan = document.getElementById('totalAdditions');
const discountInput = document.getElementById('discount');
const valorTotalSpan = document.getElementById('valorTotal');

const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const generatePdfBtn = document.getElementById('generatePdfBtn');

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

// Função para alternar visibilidade dos campos de língua estrangeira
function toggleForeignLangInputs() {
    const checkbox = document.getElementById('comLinguaEstrangeira');
    const foreignLangInputs = document.querySelector('.foreign-lang-inputs');
    
    if (checkbox.checked) {
        foreignLangInputs.style.display = 'grid';
    } else {
        foreignLangInputs.style.display = 'none';
        // Limpar os campos quando desmarcar
        document.getElementById('leHoraInicio').value = '';
        document.getElementById('leHoraFim').value = '';
    }
}

// Function to add a new day (row) to the budget table
function addDayToBudget(e) {
    if (e) {
        e.preventDefault(); // Prevent form submission and page jump
    }

    console.log('Iniciando adição de novo dia...');
    // console.trace('Chamada de addDayToBudget'); // Removido após depuração

    const data = dataServicoInput.value;
    const inicio = horaInicioInput.value;
    const fim = horaFinalInput.value;
    const qtdTils = parseInt(qtdTilsPadraoInput.value) || 0;
    // Clean the value before parsing: remove "R$", spaces, and replace comma with dot
    const vHora = parseFloat(valorHoraPadraoInput.value.replace('R$', '').replace(/\s/g, '').replace(',', '.')) || 0;
    const comLE = comLinguaEstrangeiraCheckbox.checked;
    const leInicio = leHoraInicioInput.value;
    const leFim = leHoraFimInput.value;
    const feriado = ehFeriadoCheckbox.checked;

    // Validate times
    if (!validateTime(inicio) || !validateTime(fim)) {
        displayErrorMessage('Por favor, insira horários válidos no formato HH:MM.');
        return;
    }

    // Warn if end time is before start time (implies overnight)
    const startDateTime = new Date(`2000-01-01T${inicio}`);
    const endDateTime = new Date(`2000-01-01T${fim}`);
    if (endDateTime < startDateTime) {
        console.warn('O horário final é anterior ao horário de início, indicando um serviço noturno que se estende ao dia seguinte.');
        displayErrorMessage('Horário final é anterior ao horário de início. Certifique-se de que é um serviço noturno.');
    }

    // Parse the date components to create a Date object in local time
    const dateParts = data.split('-'); // data is in 'YYYY-MM-DD' format
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed (0 for Jan, 11 for Dec)
    const day = parseInt(dateParts[2]);
    const serviceDate = new Date(year, month, day);

    console.log('Dados coletados:', {
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
    errorMessageDiv.style.display = 'none'; // Hide previous errors
    errorMessageDiv.innerHTML = ''; // Clear previous messages

    // Array to store validation errors
    const errors = [];

    // Validate each field and add specific error messages
    if (!data) {
        errors.push("📅 Selecione a Data do Serviço");
    }

    if (!inicio) {
        errors.push("⏰ Digite a Hora de Início");
    }

    if (!fim) {
        errors.push("⏰ Digite a Hora Final");
    }

    if (qtdTils === 0) {
        errors.push("👥 Informe a Quantidade de Intérpretes (mínimo 1)");
    }

    if (vHora === 0) {
        errors.push("💰 Informe o Valor Hora por Intérprete (maior que R$ 0,00)");
    }

    console.log('Erros de validação:', errors);

    // Validate time format if times are provided
    if (inicio && !validateTime(inicio)) {
        errors.push("⏰ Hora de Início inválida (formato correto: HH:mm)");
    }

    if (fim && !validateTime(fim)) {
        errors.push("⏰ Hora Final inválida (formato correto: HH:mm)");
    }

    // Validate if end time is after start time
    if (inicio && fim && validateTime(inicio) && validateTime(fim)) {
        const start = new Date(`2000-01-01T${inicio}`);
        const end = new Date(`2000-01-01T${fim}`);
        if (end <= start) {
            // This check is now handled by the warning/info message above, allowing overnight shifts
            // errors.push("⚠️ A Hora Final deve ser maior que a Hora de Início");
        }
    }

    // Validate foreign language times if checkbox is checked
    if (comLE) {
        if (!leInicio) {
            errors.push("🌍 Digite o Início do Horário de Língua Estrangeira");
        }
        if (!leFim) {
            errors.push("🌍 Digite o Fim do Horário de Língua Estrangeira");
        }
        if (leInicio && !validateTime(leInicio)) {
            errors.push("🌍 Início de Língua Estrangeira inválido (formato correto: HH:mm)");
        }
        if (leFim && !validateTime(leFim)) {
            errors.push("🌍 Fim de Língua Estrangeira inválido (formato correto: HH:mm)");
        }
        if (leInicio && leFim && validateTime(leInicio) && validateTime(leFim)) {
            const leStart = new Date(`2000-01-01T${leInicio}`);
            const leEnd = new Date(`2000-01-01T${leFim}`);
            if (leEnd <= leStart) {
                errors.push("⚠️ O Fim do Horário de Língua Estrangeira deve ser maior que o Início");
            }
        }
    }

    // If there are any errors, show them and return
    if (errors.length > 0) {
        errorMessageDiv.innerHTML = "❌ Não foi possível adicionar o dia. Por favor, verifique:<br><br>" + errors.join("<br>");
        errorMessageDiv.style.display = 'block';
        return;
    }

    // Create new item
    const newItem = {
        date: data,
        startTime: inicio,
        endTime: fim,
        hourlyRate: vHora,
        interpreters: qtdTils,
        hasForeignLanguage: comLE,
        leHoraInicio: leInicio,
        leHoraFim: leFim,
        isHoliday: feriado,
        isSaturday: serviceDate.getDay() === 6 // Use the correctly constructed Date object
    };

    console.log('Novo item criado:', newItem);

    // Add to budget items array
    budgetItems.push(newItem);
    console.log('Array de itens atualizado:', budgetItems);

    // Update table
    updateTable();
    console.log('Tabela atualizada');

    // Update summary
    updateSummary();
    console.log('Resumo atualizado');

    // Clear inputs
    clearInputs();
}

// Function to calculate the total for a single row
function calculateRowTotal(row) {
    console.log('Iniciando cálculo de total para a linha:', row);
    console.log('InnerHTML da linha:', row.innerHTML);

    const data = row.dataset.date;
    const startTime = row.dataset.startTime;
    const endTime = row.dataset.endTime;
    const qtdTils = parseFloat(row.dataset.qtdTils) || 0;
    const vHora = parseFloat(row.dataset.vHora) || 0;
    const comLE = row.dataset.comLE === 'true';
    const leStartTime = row.dataset.leStartTime;
    const leEndTime = row.dataset.leEndTime;
    const feriado = row.dataset.feriado === 'true';

    // Parse the date components
    const dateParts = data.split('-');
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1;
    const day = parseInt(dateParts[2]);
    const serviceDate = new Date(year, month, day);

    // Calculate base hours
    let totalHours = calculateTimeDifference(startTime, endTime);
    
    // Apply rounding as per description: "Horas fracionadas são arredondadas para o próximo número inteiro (ex: 2,5 horas = 3 horas)"
    totalHours = Math.ceil(totalHours);

    // Add 1 hour if service is more than 4 hours
    if (totalHours > 4) {
        totalHours += 1;
        console.log('Acréscimo de 1 hora aplicado (serviço > 4h). Horas totais:', totalHours);
    }

    console.log('Horas totais calculadas:', totalHours);

    const hoursCalcElement = row.querySelector('.hours-calc');
    if (hoursCalcElement) {
        hoursCalcElement.textContent = totalHours.toFixed(1);
    }

    let baseValue = totalHours * qtdTils * vHora;
    console.log('Valor Base calculado:', baseValue);
    let currentAdditions = 0;

    // Get segmented hours for accurate Saturday/Sunday calculations
    const segmentedHours = getSegmentBaseValues(data, startTime, endTime, qtdTils, vHora);
    console.log('Horas segmentadas:', segmentedHours);

    let saturdayAdditionValue = 0;
    let sundayHolidayAdditionValue = 0;

    // Calculate Saturday addition (25%) based on Saturday hours
    const saturdayBase = segmentedHours.saturdayHours * qtdTils * vHora;
    if (segmentedHours.saturdayHours > 0) {
        saturdayAdditionValue = saturdayBase * 0.25;
    }
    console.log('Acréscimo de Sábado:', saturdayAdditionValue);
    const saturdayElement = row.querySelector('.saturday-addition');
    if (saturdayElement) {
        saturdayElement.textContent = `R$ ${saturdayAdditionValue.toFixed(2).replace('.', ',')}`;
    }

    // Calculate Sunday/Holiday addition (50%) based on Sunday hours or if it's a holiday
    const sundayBase = segmentedHours.sundayHours * qtdTils * vHora;
    const initialDayOfWeek = serviceDate.getDay();

    if (feriado) {
        // If it's a holiday, apply 50% to the entire baseValue for the service
        sundayHolidayAdditionValue = baseValue * 0.50;
    } else if (segmentedHours.sundayHours > 0) {
        // If not a holiday, but there are Sunday hours, apply 50% to Sunday's base
        sundayHolidayAdditionValue = sundayBase * 0.50;
    }

    console.log('Acréscimo de Domingo/Feriado:', sundayHolidayAdditionValue);
    const sundayHolidayElement = row.querySelector('.sunday-holiday-addition');
    if (sundayHolidayElement) {
        sundayHolidayElement.textContent = `R$ ${sundayHolidayAdditionValue.toFixed(2).replace('.', ',')}`;
    }

    // Sum weekend/holiday additions
    currentAdditions += saturdayAdditionValue + sundayHolidayAdditionValue;
    console.log('Acréscimos de Fim de Semana/Feriado (acumulado):', currentAdditions);

    // Night shift addition (22:00 to 05:00)
    let nightHours = calculateActualNightHours(startTime, endTime);

    let nightAdditionValue = 0;
    if (nightHours > 0) {
        nightAdditionValue = (nightHours * qtdTils * vHora) * 0.25;
    }
    console.log('Horas noturnas:', nightHours);
    console.log('Acréscimo de Horário Noturno:', nightAdditionValue);
    const nightElement = row.querySelector('.night-addition');
    if (nightElement) {
        nightElement.textContent = `R$ ${nightAdditionValue.toFixed(2).replace('.', ',')}`;
    }
    currentAdditions += nightAdditionValue;
    console.log('Acréscimos (após noturno):', currentAdditions);

    // Foreign language addition (50% of LE hours)
    let leAdditionValue = 0;
    if (comLE && leStartTime && leEndTime) {
        const leHours = calculateTimeDifference(leStartTime, leEndTime);
            leAdditionValue = (leHours * qtdTils * vHora) * 0.50;
        }
    console.log('Acréscimo de Língua Estrangeira:', leAdditionValue);
    const foreignLangElement = row.querySelector('.foreign-lang-addition');
    if (foreignLangElement) {
        foreignLangElement.textContent = `R$ ${leAdditionValue.toFixed(2).replace('.', ',')}`;
    }
    currentAdditions += leAdditionValue;
    console.log('Acréscimos (total final):', currentAdditions);

    const rowTotalElement = row.querySelector('.row-total');
    const totalRowValue = baseValue + currentAdditions;
    console.log('Total da Linha Calculado:', totalRowValue);
    if (rowTotalElement) {
        rowTotalElement.textContent = `R$ ${totalRowValue.toFixed(2).replace('.', ',')}`;
    }
}

// Função para calcular horas totais (esta função não estava sendo usada e pode ser removida se não for necessária)
function calculateTotalHours() {
    let total = 0;
    budgetItems.forEach(item => {
        total += calculateHours(item.startTime, item.endTime);
    });
    return total;
}

// Função para calcular valor base (esta função não estava sendo usada diretamente e pode ser removida se não for necessária)
function calculateBaseValue(item) {
    return calculateHours(item.startTime, item.endTime) * item.hourlyRate * item.interpreters;
}

// Função para calcular acréscimos (esta função não estava sendo usada diretamente e pode ser removida se não for necessária)
function calculateAdditions(item, baseValue) {
    const dataObj = new Date(item.date); // Assumindo que item.date já está no formato correto
    const diaDaSemana = dataObj.getDay();
    let acrescimos = 0;

    if (item.isSaturday) acrescimos += baseValue * 0.25;
    if (item.isHoliday) acrescimos += baseValue * 0.50;
    
    // Acréscimo de Língua Estrangeira (50%) baseado nas horas de LE
    if (item.hasForeignLanguage && item.leHoraInicio && item.leHoraFim) {
        const leHours = calculateTimeDifference(item.leHoraInicio, item.leHoraFim);
        // O valor do acréscimo de LE é calculado com base nas horas de LE, qtd de interpretes e valor/hora padrão
        acrescimos += (leHours * item.interpreters * item.hourlyRate) * 0.50;
    }

    const startHour = parseInt(item.startTime.split(':')[0]);
    const endHour = parseInt(item.endTime.split(':')[0]);
    if ((startHour >= 22 || startHour < 5) || (endHour >= 22 || endHour < 5)) {
        acrescimos += baseValue * 0.25;
    }
    return acrescimos;
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
        
        // Calculate hours
        const hours = calculateTimeDifference(item.startTime, item.endTime);
        
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
    toggleForeignLangInputs();

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
    const startHour = parseInt(start.split(':')[0]);
    const startMinute = parseInt(start.split(':')[1]);
    const endHour = parseInt(end.split(':')[0]);
    const endMinute = parseInt(end.split(':')[1]);

    let totalNightMinutes = 0;

    // Convert times to minutes from a fixed reference (e.g., 00:00 day 1)
    let currentStart = startHour * 60 + startMinute;
    let currentEnd = endHour * 60 + endMinute;

    if (currentEnd < currentStart) {
        currentEnd += 24 * 60; // Add 24 hours if overnight shift
    }

    // Define night windows (in minutes from 00:00 day 1)
    const nightWindow1Start = 22 * 60; // 22:00 day 1
    const nightWindow1End = 24 * 60;   // 00:00 day 2

    const nightWindow2Start = 24 * 60; // 00:00 day 2
    const nightWindow2End = (24 + 5) * 60; // 05:00 day 2

    // Check overlap with first night window (22:00 - 00:00)
    let overlapStart1 = Math.max(currentStart, nightWindow1Start);
    let overlapEnd1 = Math.min(currentEnd, nightWindow1End);
    if (overlapEnd1 > overlapStart1) {
        totalNightMinutes += (overlapEnd1 - overlapStart1);
    }

    // Check overlap with second night window (00:00 - 05:00) on the next day
    let overlapStart2 = Math.max(currentStart, nightWindow2Start);
    let overlapEnd2 = Math.min(currentEnd, nightWindow2End);
    if (overlapEnd2 > overlapStart2) {
        totalNightMinutes += (overlapEnd2 - overlapStart2);
    }
    
    return Math.ceil(totalNightMinutes / 60); // Return in hours, rounded up
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
    let totalHoursSummary = 0;
    let subtotalSummary = 0;
    let totalAdditionsSummary = 0;
    let grossTotalSummary = 0;

    budgetItems.forEach(item => {
        let hours = calculateTimeDifference(item.startTime, item.endTime);
        // Apply rounding for summary as well
        hours = Math.ceil(hours);

        const baseValue = hours * item.hourlyRate * item.interpreters;

        // Recalculate additions for summary as they depend on the item
        const dateParts = item.date.split('-');
        const serviceDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));

        const dayOfWeek = serviceDate.getDay();
        let currentItemAdditions = 0;

        // Saturday addition (25%)
        if (dayOfWeek === 6) {
            currentItemAdditions += baseValue * 0.25;
        }

        // Sunday/Holiday addition (50%)
        if (dayOfWeek === 0 || item.isHoliday) {
            currentItemAdditions += baseValue * 0.50;
        }

        // Foreign language addition (50%) - needs to be based on foreign language hours, not baseValue
        // This needs actual foreign language hour calculation, placeholder for now.
        if (item.hasForeignLanguage) {
            currentItemAdditions += baseValue * 0.50; // Simplified, ideally based on LE hours
        }

        // Night shift addition (25%) - needs to be based on night hours
        // This needs actual night hour calculation, placeholder for now.
        const startHour = parseInt(item.startTime.split(':')[0]);
        const endHour = parseInt(item.endTime.split(':')[0]);
        if ((startHour >= 22 || startHour < 5) || (endHour >= 22 || endHour < 5)) {
            currentItemAdditions += baseValue * 0.25; // Simplified, ideally based on night hours
        }

        const itemTotal = baseValue + currentItemAdditions;

        totalHoursSummary += hours;
        subtotalSummary += baseValue;
        totalAdditionsSummary += currentItemAdditions;
        grossTotalSummary += itemTotal;
    });

    // Assign to global variables
    totalHours = totalHoursSummary;
    subtotal = subtotalSummary;
    totalAdditions = totalAdditionsSummary;
    grossTotal = grossTotalSummary;

    const discountPercentage = parseFloat(document.getElementById('discount').value.replace(',', '.')) || 0;
    const discountAmount = grossTotal * (discountPercentage / 100);
    finalTotal = grossTotal - discountAmount;

    document.getElementById('totalHours').textContent = `${totalHours} horas`;
    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('totalAdditions').textContent = formatCurrency(totalAdditions);
    document.getElementById('grossTotal').textContent = formatCurrency(grossTotal);
    document.getElementById('valorTotal').textContent = formatCurrency(finalTotal);

    // Update global variables
    globalGrossTotal = grossTotal;
    globalDiscount = discountPercentage;
    globalFinalValue = finalTotal;
}

// Function to save budget to Firebase
async function saveBudget() {
    console.log("saveBudget function called.");
    console.log("Current globalGrossTotal:", globalGrossTotal);
    console.log("Current globalDiscount:", globalDiscount);
    console.log("Current globalFinalValue:", globalFinalValue);

    // Get client info elements
    const clientNameInput = document.getElementById('clientName');
    const clientEmailInput = document.getElementById('clientEmail');
    const clientPhoneInput = document.getElementById('clientPhone');

    // Check if elements exist
    if (!clientNameInput || !clientEmailInput || !clientPhoneInput) {
        console.error('Elementos de informações do cliente não encontrados');
        alert('Erro: Elementos de informações do cliente não encontrados. Por favor, recarregue a página.');
        return;
    }

    const clientName = clientNameInput.value;
    const clientEmail = clientEmailInput.value;
    const clientPhone = clientPhoneInput.value;

    if (!clientName || !clientEmail || !clientPhone) {
        alert('Por favor, preencha todos os dados do cliente (Nome, Email, Telefone).');
        return;
    }

    if (globalFinalValue <= 0) {
        alert('O valor final do orçamento deve ser maior que zero para ser salvo.');
        return;
    }

    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Você precisa estar logado para salvar orçamentos.');
            window.location.href = '../login/index.html'; // Redirect to login
            return;
        }

        const budgetData = {
            userId: user.uid,
            clientName: clientName,
            clientEmail: clientEmail,
            clientPhone: clientPhone,
            grossTotal: globalGrossTotal,
            discount: globalDiscount,
            finalValue: globalFinalValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            budgetItems: [] // This will store the details from the table
        };

        // Collect budget items from the table
        const tableBody = document.getElementById('budgetTableBody');
        if (!tableBody) {
            console.error('Tabela de orçamento não encontrada');
            alert('Erro: Tabela de orçamento não encontrada. Por favor, recarregue a página.');
            return;
        }

        for (let i = 0; i < tableBody.rows.length; i++) {
            const row = tableBody.rows[i];
            const date = row.querySelector('td:nth-child(1) input[type="date"]').value;
            const startTime = row.querySelector('td:nth-child(2) input[type="time"]').value;
            const endTime = row.querySelector('td:nth-child(3) input[type="time"]').value;
            const hours = parseFloat(row.querySelector('td:nth-child(4)').textContent);
            const numInterpreters = parseInt(row.querySelector('td:nth-child(5)').textContent);
            const foreignLang = row.querySelector('td:nth-child(6) input[type="checkbox"]').checked;
            const saturday = row.querySelector('td:nth-child(7) input[type="checkbox"]').checked;
            const sundayHoliday = row.querySelector('td:nth-child(8) input[type="checkbox"]').checked;
            const nightShift = row.querySelector('td:nth-child(9) input[type="checkbox"]').checked;
            const baseValue = parseFloat(row.querySelector('td:nth-child(10)').textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));
            const rowTotal = parseFloat(row.querySelector('td:nth-child(11)').textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));

            budgetData.budgetItems.push({
                date,
                startTime,
                endTime,
                hours,
                numInterpreters,
                foreignLang,
                saturday,
                sundayHoliday,
                nightShift,
                baseValue,
                rowTotal
            });
        }

        // Add a new document with a generated ID
        const docRef = await db.collection('budgets').add(budgetData);
        alert('Orçamento salvo com sucesso! ID: ' + docRef.id);

        // Optionally redirect to the budgets list page
        window.location.href = '../orcamentos/index.html';

    } catch (error) {
        console.error('FirebaseError:', error);
        if (error.code === 'permission-denied') {
            alert('Erro: Você não tem permissão para salvar orçamentos. Verifique suas regras de segurança do Firebase.');
        } else if (error.message.includes('Function addDoc() called with invalid data. Unsupported field value: undefined')) {
             alert('Erro ao salvar orçamento: Dados inválidos. Verifique os valores calculados (Total Bruto, Desconto, Valor Final).');
             console.error('Detalhes do erro:', error);
        } else {
            alert('Erro ao salvar orçamento: ' + error.message);
        }
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

    const clientName = document.getElementById('clientName').value || 'N/A';
    const totalHours = document.getElementById('totalHours').textContent;
    const subtotal = document.getElementById('subtotal').textContent;
    const totalAdditions = document.getElementById('totalAdditions').textContent;
    const grossTotal = document.getElementById('grossTotal').textContent;
    const discount = document.getElementById('discount').value || '0';
    const valorTotal = document.getElementById('valorTotal').textContent;

    let tableRowsHtml = '';
    budgetItems.forEach(item => {
        const hours = calculateTimeDifference(item.startTime, item.endTime); // Use raw difference for display
        const baseValue = hours * item.hourlyRate * item.interpreters;

        // Recalculate additions for PDF, ensuring consistency with calculateRowTotal logic
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
            sundayHolidayAdditionValue = baseValue * 0.50; // Apply to total base if holiday
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
            const leHours = calculateTimeDifference(item.leHoraInicio, item.leHoraFim);
            leAdditionValue = (Math.ceil(leHours) * item.interpreters * item.hourlyRate) * 0.50; // Ensure LE hours are rounded
        }

        // Calculate base value for this row for display in PDF table
        const rowBaseValue = (hours) * item.interpreters * item.hourlyRate; // Hours already rounded by Math.ceil earlier in calculateRowTotal

        const rowTotal = rowBaseValue + saturdayAdditionValue + sundayHolidayAdditionValue + nightAdditionValue + leAdditionValue;

        tableRowsHtml += `
            <tr>
            <td>${formatDate(item.date)}</td>
            <td>${item.startTime}</td>
            <td>${item.endTime}</td>
                <td>${hours.toFixed(1)}</td>
            <td>${item.interpreters}</td>
                <td>${formatCurrency(leAdditionValue)}</td>
                <td>${formatCurrency(saturdayAdditionValue)}</td>
                <td>${formatCurrency(sundayHolidayAdditionValue)}</td>
                <td>${formatCurrency(nightAdditionValue)}</td>
                <td>${formatCurrency(rowBaseValue)}</td> <!-- Valor Base Column -->
                <td>${formatCurrency(rowTotal)}</td>
            </tr>
        `;
    });

    const pdfHtml = `
        <div class="pdf-document">
            <div class="pdf-header">
                <img src="../assets/logopdf.png" alt="InLibras Logo" class="pdf-logo">
                <h1>Orçamento de Serviço</h1>
            </div>
            <div class="pdf-section">
                <h2>Informações do Cliente</h2>
                <p><strong>Cliente/Evento:</strong> ${clientName}</p>
            </div>
            <div class="summary-pdf">
                <div class="summary-grid-pdf">
                    <div>
                        <p><strong>Horas Totais:</strong> <span id="printTotalHoras">${totalHours}</span></p>
                        <p><strong>Valor Hora por Intérprete:</strong> <span id="printValorHora">${formatCurrency(parseFloat(valorHoraPadraoInput.value.replace(',', '.')) || 0)}</span></p>
                        <p><strong>Total Acréscimos:</strong> <span id="printTotalAcrescimos">${totalAdditions}</span></p>
                    </div>
                    <div>
                        <p><strong>Total Bruto:</strong> <span id="printTotalGeral">${grossTotal}</span></p>
                        <p><strong>Desconto:</strong> <span id="printDesconto">${discount}%</span></p>
                        <p><strong>VALOR FINAL:</strong> <span id="printValorFinal" style="color: #7c3aed; font-weight: bold; font-size: 1.2rem;">${valorTotal}</span></p>
                    </div>
                </div>
            </div>

            <div class="pdf-section">
                <h2>Itens do Orçamento</h2>
                <table class="pdf-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Início</th>
                            <th>Fim</th>
                            <th>Horas</th>
                            <th>Qtd. Tils</th>
                            <th>Língua Estrangeira (50%)</th>
                            <th>Sábado (25%)</th>
                            <th>Domingo/Feriado (50%)</th>
                            <th>Horário Noturno (25%)</th>
                            <th>Valor Base (R$)</th>
                            <th>Total (R$)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>
            </div>
             <div class="pdf-section pdf-description">
                <h2>Descrição dos Valores</h2>
                <p><strong>Valor Base:</strong> É o resultado da multiplicação das Horas Totais pelo Valor Hora por Intérprete.</p>
                <p><strong>Arredondamento de Horas:</strong> Horas fracionadas são arredondadas para o próximo número inteiro (ex: 2,5 horas = 3 horas).</p>
                <p><strong>Acréscimo de 1 Hora:</strong> Para períodos acima de 4 horas, é adicionada automaticamente 1 hora extra ao total.</p>
                <p><strong>Acréscimo de Sábado:</strong> Adiciona 25% sobre o valor base do período trabalhado no sábado.</p>
                <p><strong>Acréscimo de Domingo/Feriado:</strong> Adiciona 50% sobre o valor base do período trabalhado no domingo ou se a data for um feriado. Se for feriado, aplica-se sobre o valor total bruto do serviço.</p>
                <p><strong>Acréscimo de Língua Estrangeira:</strong> Adiciona 50% sobre o valor base das horas de língua estrangeira.</p>
                <p><strong>Acréscimo de Horário Noturno:</strong> Adiciona 25% sobre o valor base das horas trabalhadas entre 22h e 5h.</p>
                <p><strong>Total de Acréscimos:</strong> É a soma de todos os acréscimos aplicados.</p>
                <p><strong>Total Bruto:</strong> É o valor final após a aplicação de todos os acréscimos percentuais.</p>
                <p><strong>Valor Final:</strong> É o Total Bruto menos o percentual de desconto aplicado.</p>
            </div>
        </div>
    `;

    pdfContentArea.innerHTML = pdfHtml;

    const opt = {
        filename: `orcamento_${clientName.replace(/\s/g, '_')}.pdf`,
        image: { type: 'png', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, dpi: 192, useCORS: true },
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
                </style>
            </head>
            <body>
                <button class="print-button" onclick="window.print()">Imprimir</button>
                <div class="print-container">
                    <img src="${canvas.toDataURL('image/png')}" style="width: 100%; display: block;">
                </div>
                <script>
                    // Focar na nova janela
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

// Função para formatar moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para validar hora
function validateTime(time) {
    if (!time) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    
    // Validação básica
    if (isNaN(hours) || isNaN(minutes)) return false;
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    
    return true;
}

// Função para formatar valor monetário
function formatarValorMonetario(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9,]/g, ''); // Allow digits and comma
        // Ensure only one comma
        const parts = value.split(',');
        if (parts.length > 2) {
            value = parts[0] + ',' + parts.slice(1).join('');
        }
        e.target.value = value;
    });
    input.addEventListener('blur', function(e) {
        let value = e.target.value.replace(',', '.'); // Convert comma to dot for parsing
        let numericValue = parseFloat(value) || 0;
        e.target.value = formatCurrency(numericValue); // Format back to comma for display
    });
}

// Função para formatar quantidade
function formatarQuantidade(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value;
    });
}

// Função para formatar data
function formatarDataInput(input) {
    input.setAttribute('type', 'date');
    input.setAttribute('pattern', '\d{4}-\d{2}-\d{2}');
    input.min = '2000-01-01';
    input.max = '2100-12-31';
}

// Função para formatar hora
function formatarHoraInput(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value.length <= 2) {
                value = value;
            } else if (value.length <= 4) {
                value = value.slice(0, 2) + ':' + value.slice(2);
            }
        }
        
        e.target.value = value;
    });

    input.addEventListener('blur', function(e) {
        let value = e.target.value;
        if (value.length > 0) {
            let [hours, minutes] = value.split(':');
            
            // Validar horas
            if (!hours || hours.length === 0) {
                e.target.value = '';
                return;
            }

            let hoursNum = parseInt(hours);
            if (isNaN(hoursNum) || hoursNum < 0 || hoursNum > 23) {
                e.target.value = '';
                return;
            }
            
            // Validar minutos
            if (!minutes || minutes.length === 0) {
                e.target.value = hours.padStart(2, '0') + ':00';
                return;
            }

            let minutesNum = parseInt(minutes);
            if (isNaN(minutesNum) || minutesNum < 0 || minutesNum > 59) {
                e.target.value = hours.padStart(2, '0') + ':00';
                return;
            }
            
            // Formatar a hora final
            e.target.value = hours.padStart(2, '0') + ':' + minutes.padStart(2, '0');
        }
    });

    // Limitar o tamanho máximo
    input.addEventListener('input', function(e) {
        if (e.target.value.length > 5) {
            e.target.value = e.target.value.slice(0, 5);
        }
    });
}

// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', function() {
    // Ensure valorHoraPadraoInput is treated as text to avoid browser number parsing errors
    valorHoraPadraoInput.type = 'text';
    valorHoraPadraoInput.removeAttribute('min');
    valorHoraPadraoInput.removeAttribute('step');

    // Inicializar formatação dos campos
    formatarValorMonetario(valorHoraPadraoInput);
    formatarQuantidade(qtdTilsPadraoInput);
    formatarDataInput(dataServicoInput);
    formatarHoraInput(horaInicioInput);
    formatarHoraInput(horaFinalInput);
    formatarHoraInput(leHoraInicioInput);
    formatarHoraInput(leHoraFimInput);

    // Event listeners para atualização dos totais
    valorHoraPadraoInput.addEventListener('input', window.atualizarTotais);
    qtdTilsPadraoInput.addEventListener('input', window.atualizarTotais);
    discountInput.addEventListener('input', function() {
        // Garante que apenas números inteiros sejam aceitos
        this.value = Math.floor(this.value);
        atualizarTotais();
    });
    dataServicoInput.addEventListener('change', window.atualizarTotais); // Listen to change for date
    horaInicioInput.addEventListener('change', window.atualizarTotais); // Listen to change for hours
    horaFinalInput.addEventListener('change', window.atualizarTotais); // Listen to change for hours
    leHoraInicioInput.addEventListener('change', window.atualizarTotais); // Listen to change for LE hours
    leHoraFimInput.addEventListener('change', window.atualizarTotais); // Listen to change for LE hours

    // Event listeners para as checkboxes
    comLinguaEstrangeiraCheckbox.addEventListener('change', function() {
        toggleForeignLangInputs();
        window.atualizarTotais();
    });

    ehFeriadoCheckbox.addEventListener('change', window.atualizarTotais);

    // Add day button click handler
    addDayBtn.addEventListener('click', function(e) {
        e.preventDefault();
        addDayToBudget(e);
    });

    // Save and Generate PDF buttons
    saveBudgetBtn.addEventListener('click', saveBudget);
    generatePdfBtn.addEventListener('click', generatePDF);

    // Chamada inicial para calcular totais
    window.atualizarTotais();

    // Call toggleForeignLangInputs initially to set correct display state
    toggleForeignLangInputs();
});

// Função para atualizar os totais
function atualizarTotais() {
    const rows = document.querySelectorAll('#budgetTableBody tr');
    let totalHorasSummary = 0;
    let subtotalSummary = 0;
    let totalAdditionsSummary = 0;
    let grossTotalSummary = 0;

    budgetItems.forEach(item => {
        const hours = calculateTimeDifference(item.startTime, item.endTime);
        const baseValue = hours * item.hourlyRate * item.interpreters;

        const acrescimos = calculateAdditions(item, baseValue); // Pass the 'item' object directly
        const valorTotal = baseValue + acrescimos;

        totalHorasSummary += hours;
        subtotalSummary += baseValue;
        totalAdditionsSummary += acrescimos;
        grossTotalSummary += valorTotal;
    });

    // Atualizar os elementos na página
    document.getElementById('totalHours').textContent = `${totalHorasSummary} horas`;
    document.getElementById('subtotal').textContent = formatCurrency(subtotalSummary);
    document.getElementById('totalAdditions').textContent = formatCurrency(totalAdditionsSummary);
    document.getElementById('grossTotal').textContent = formatCurrency(grossTotalSummary);

    // Calcular valor final com desconto percentual
    const discountPercentage = parseFloat(document.getElementById('discount').value.replace(',', '.')) || 0;
    const discountAmount = grossTotalSummary * (discountPercentage / 100);
    const valorFinal = grossTotalSummary - discountAmount;
    document.getElementById('valorTotal').textContent = formatCurrency(valorFinal);
}

// Make the function available globally
window.atualizarTotais = atualizarTotais;