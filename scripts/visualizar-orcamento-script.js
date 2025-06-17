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

        // Make budget object accessible globally for PDF generation
        window.currentBudget = budget;

        // Update table
        budgetTableBody.innerHTML = '';
        let totalHoras = 0;
        let totalAcrescimos = 0;
        let totalBruto = 0;
        budget.items.forEach(row => {
            console.log('Dados da linha (row) do orçamento:', row); // Log para depuração
            const rowTotalHours = (row.hours ?? 0);
            const rowHourlyRate = (row.hourlyRate ?? 0);
            const rowTotalAdditions = (row.additionsAmount ?? 0);
            const rowSubtotal = (row.baseValue ?? 0);
            const rowTotal = (row.total ?? 0);

            console.log('Valores calculados para a linha:', {
                rowTotalHours,
                rowHourlyRate,
                rowTotalAdditions,
                rowSubtotal,
                rowTotal
            }); // Log para depuração

            totalHoras += rowTotalHours;
            totalAcrescimos += rowTotalAdditions;
            totalBruto += rowSubtotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatDate(row.date)}</td>
                <td>${row.startTime}</td>
                <td>${row.endTime}</td>
                <td>${rowTotalHours.toFixed(1)}</td>
                <td>${(row.interpreters ?? 0)}</td>
                <td>R$ ${rowHourlyRate.toFixed(2)}</td>
                <td>${formatCurrency(row.foreignLanguageAddition ?? 0)}</td>
                <td>${formatCurrency(row.saturdayAddition ?? 0)}</td>
                <td>${formatCurrency(row.sundayHolidayAddition ?? 0)}</td>
                <td>${formatCurrency(row.nightAddition ?? 0)}</td>
                <td>R$ ${rowTotal.toFixed(2)}</td>
            `;
            budgetTableBody.appendChild(tr);
        });

        // Preencher resumo com os totais do documento do orçamento
        totalHorasElement.textContent = `${(budget.totalHours ?? 0).toFixed(1)} horas`;
        // Valor por hora é o do primeiro item, se existir, senão 0
        valorHoraTotalElement.textContent = `R$ ${((budget.items && budget.items.length > 0) ? (budget.items[0].hourlyRate ?? 0) : 0).toFixed(2)}`;
        totalAcrescimosElement.textContent = `R$ ${(budget.totalAdditions ?? 0).toFixed(2)}`;
        totalGeralElement.textContent = `R$ ${(budget.grossTotal ?? 0).toFixed(2)}`;
        // Desconto (%)
        descontoInput.textContent = `${(budget.discount ?? 0)}%`;
        // Valor final
        valorFinalElement.textContent = `R$ ${(budget.finalValue ?? 0).toFixed(2)}`;

    } catch (error) {
        console.error('Erro ao carregar orçamento:', error);
        showError('Erro ao carregar orçamento. Por favor, tente novamente.');
    }
}

// Função para formatar moeda (BRL)
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
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
    const pdfContentArea = document.getElementById('pdfContentArea');
    if (!pdfContentArea) {
        console.error('PDF content area not found.');
        return;
    }

    // Clear previous content
    pdfContentArea.innerHTML = '';
    pdfContentArea.style.display = 'block'; // Make visible temporarily for html2pdf

    const budget = window.currentBudget; // Get the current budget from the global scope

    if (!budget) {
        console.error('Orçamento não carregado para gerar PDF.');
        alert('Erro: Orçamento não disponível para gerar PDF.');
        pdfContentArea.style.display = 'none';
        return;
    }

    const clientName = budget.clientName || 'N/A';
    const totalHours = (budget.totalHours ?? 0).toFixed(1);
    const totalAdditions = (budget.totalAdditions ?? 0).toFixed(2);
    const grossTotal = (budget.grossTotal ?? 0).toFixed(2);
    const discount = (budget.discount ?? 0);
    const finalValue = (budget.finalValue ?? 0).toFixed(2);
    const valorHoraInterprete = (budget.items && budget.items.length > 0) ? (budget.items[0].hourlyRate ?? 0) : 0; // Use first item's hourlyRate

    let tableRowsHtml = '';
    budget.items.forEach(item => {
        // Use the values directly from the saved item object
        const hours = (item.hours ?? 0);
        const interpreters = (item.interpreters ?? 0);
        const hourlyRate = (item.hourlyRate ?? 0);
        const foreignLanguageAddition = (item.foreignLanguageAddition ?? 0);
        const saturdayAddition = (item.saturdayAddition ?? 0);
        const sundayHolidayAddition = (item.sundayHolidayAddition ?? 0);
        const nightAddition = (item.nightAddition ?? 0);
        const baseValue = (item.baseValue ?? 0); // Use baseValue from item
        const total = (item.total ?? 0); // Use total from item

        tableRowsHtml += `
            <tr style="background-color: white;">
                <td style="color: black;">${formatDate(item.date)}</td>
                <td style="color: black;">${item.startTime}</td>
                <td style="color: black;">${item.endTime}</td>
                <td style="color: black;">${hours.toFixed(1)}</td>
                <td style="color: black;">${interpreters}</td>
                <td style="color: black;">${formatCurrency(foreignLanguageAddition)}</td>
                <td style="color: black;">${formatCurrency(saturdayAddition)}</td>
                <td style="color: black;">${formatCurrency(sundayHolidayAddition)}</td>
                <td style="color: black;">${formatCurrency(nightAddition)}</td>
                <td style="color: black;">${formatCurrency(baseValue)}</td>
                <td style="color: black;">${formatCurrency(total)}</td>
            </tr>
        `;
    });

    const pdfHtml = `
        <div class="pdf-document" style="background-color: white; color: black;">
            <div class="pdf-header">
                <img src="../assets/logopdf.png" alt="InLibras Logo" class="pdf-logo" style="width: 150px; margin-bottom: 20px;">
                <h1 style="color: black;">Orçamento de Serviço</h1>
            </div>
            <div class="pdf-section">
                <h2 style="color: black;">Informações do Cliente</h2>
                <p style="color: black;"><strong>Cliente/Evento:</strong> ${clientName}</p>
            </div>
            <div class="summary-pdf">
                <div class="summary-grid-pdf">
                    <div>
                        <p style="color: black;"><strong>Horas Totais:</strong> <span style="color: black;">${totalHours} horas</span></p>
                        <p style="color: black;"><strong>Valor Hora por Intérprete:</strong> <span style="color: black;">${formatCurrency(valorHoraInterprete)}</span></p>
                        <p style="color: black;"><strong>Total Acréscimos:</strong> <span style="color: black;">${formatCurrency(totalAdditions)}</span></p>
                    </div>
                    <div>
                        <p style="color: black;"><strong>Total Bruto:</strong> <span style="color: black;">${formatCurrency(grossTotal)}</span></p>
                        <p style="color: black;"><strong>Desconto:</strong> <span style="color: black;">${discount}%</span></p>
                        <p style="color: black;"><strong>VALOR FINAL:</strong> <span style="color: black; font-weight: bold; font-size: 1.2rem;">${formatCurrency(finalValue)}</span></p>
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
            <div class="pdf-section pdf-description" style="color: black;">
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
    });
}

// Start the application
init();