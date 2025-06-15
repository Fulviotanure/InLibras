// Funções de formatação e validação
function formatarDataInput(input) {
    // Inicializar Flatpickr
    const flatpickrInstance = flatpickr(input, {
        locale: "pt",
        dateFormat: "d/m/Y",
        allowInput: true,
        clickOpens: true,
        onChange: function(selectedDates, dateStr) {
            // Validar a data selecionada
            if (selectedDates[0]) {
                const day = selectedDates[0].getDate();
                const month = selectedDates[0].getMonth() + 1;
                const year = selectedDates[0].getFullYear();

                if (year < 1900 || year > 2100) {
                    alert('Ano inválido. Por favor, use um ano entre 1900 e 2100.');
                    input.value = '';
                    return;
                }

                // Formatar a data com zeros à esquerda
                const formattedDay = day.toString().padStart(2, '0');
                const formattedMonth = month.toString().padStart(2, '0');
                input.value = `${formattedDay}/${formattedMonth}/${year}`;
            }
        }
    });

    // Função para formatar a data enquanto digita
    function formatarDataDigitacao(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value.length <= 2) {
                value = value;
            } else if (value.length <= 4) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            } else {
                value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
            }
        }
        e.target.value = value;
    }

    // Adicionar evento de input para formatação durante digitação
    input.addEventListener('input', formatarDataDigitacao);

    input.addEventListener('keydown', function(e) {
        if (!/[\d\b\t\←\→\Delete]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    });

    input.addEventListener('blur', function(e) {
        let value = e.target.value;
        if (value.length > 0) {
            let [day, month, year] = value.split('/');
            
            // Validar dia
            if (day && (parseInt(day) < 1 || parseInt(day) > 31)) {
                alert('Dia inválido. Por favor, use um dia entre 01 e 31.');
                return;
            }
            
            // Validar mês
            if (month && (parseInt(month) < 1 || parseInt(month) > 12)) {
                alert('Mês inválido. Por favor, use um mês entre 01 e 12.');
                return;
            }
            
            // Validar ano
            if (year && (parseInt(year) < 1900 || parseInt(year) > 2100)) {
                alert('Ano inválido. Por favor, use um ano entre 1900 e 2100.');
                return;
            }

            // Garantir que todos os campos tenham dois dígitos
            if (day) day = day.padStart(2, '0');
            if (month) month = month.padStart(2, '0');
            if (year) year = year.padStart(4, '0');

            // Reconstruir a data com as barras
            if (day && month && year) {
                e.target.value = `${day}/${month}/${year}`;
            } else if (day && month) {
                e.target.value = `${day}/${month}`;
            } else if (day) {
                e.target.value = day;
            }
        }
    });

    // Limitar o tamanho máximo
    input.addEventListener('input', function(e) {
        if (e.target.value.length > 10) {
            e.target.value = e.target.value.slice(0, 10);
        }
    });

    // Adicionar evento de clique no ícone do calendário
    const calendarIcon = input.parentElement.querySelector('.calendar-icon');
    if (calendarIcon) {
        calendarIcon.addEventListener('click', function() {
            flatpickrInstance.open();
        });
    }
}

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

    input.addEventListener('keydown', function(e) {
        if (!/[\d\b\t\←\→\Delete]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    });

    input.addEventListener('blur', function(e) {
        let value = e.target.value;
        if (value.length > 0) {
            let [hours, minutes] = value.split(':');

            // Validar horas
            if (hours && (parseInt(hours) < 0 || parseInt(hours) > 23)) {
                e.target.value = '';
                alert('Hora inválida. Por favor, use um valor entre 00 e 23.');
                return;
            }

            // Validar minutos
            if (minutes && (parseInt(minutes) < 0 || parseInt(minutes) > 59)) {
                e.target.value = '';
                alert('Minuto inválido. Por favor, use um valor entre 00 e 59.');
                return;
            }

            // Garantir dois dígitos para horas e minutos
            if (hours) hours = hours.padStart(2, '0');
            if (minutes) minutes = minutes.padStart(2, '0');

            if (hours && minutes) {
                e.target.value = `${hours}:${minutes}`;
            } else if (hours) {
                e.target.value = `${hours}:00`;
            }
        }
    });

    // Limitar o tamanho máximo
    input.addEventListener('input', function(e) {
        if (e.target.value.length > 5) {
            e.target.value = e.target.value.slice(0, 5);
        }
    });
}

function formatarValorMonetario(input) {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = (parseFloat(value) / 100).toFixed(2);
            e.target.value = value;
        }
    });

    input.addEventListener('blur', function(e) {
        if (e.target.value) {
            let value = parseFloat(e.target.value);
            e.target.value = value.toFixed(2);
        }
    });
}

// Função para controlar a visibilidade dos campos de língua estrangeira
function toggleForeignLangInputs() {
    const linguaEstrangeiraCheckbox = document.getElementById('linguaEstrangeira');
    const divHoraInicioLE = document.getElementById('divHoraInicioLE');

    // Garantir que os campos estejam escondidos inicialmente
    divHoraInicioLE.classList.remove('show');

    linguaEstrangeiraCheckbox.addEventListener('change', function() {
        if (this.checked) {
            divHoraInicioLE.classList.add('show');
        } else {
            divHoraInicioLE.classList.remove('show');
            // Limpar valores quando desmarcado
            document.getElementById('horaInicioLinguaEstrangeira').value = '';
            document.getElementById('horaFimLinguaEstrangeira').value = '';
        }
    });
}

// Inicializar todas as funções quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar formatação de data
    const dataServicoInput = document.getElementById('dataServico');
    if (dataServicoInput) {
        formatarDataInput(dataServicoInput);
    }

    // Inicializar formatação de hora
    const horaInputs = ['horaInicio', 'horaFim', 'horaInicioLinguaEstrangeira', 'horaFimLinguaEstrangeira'];
    horaInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            formatarHoraInput(input);
        }
    });

    // Inicializar formatação de valor monetário
    const valorHoraInput = document.getElementById('valorHoraInterprete');
    if (valorHoraInput) {
        formatarValorMonetario(valorHoraInput);
    }

    // Inicializar controle de campos de língua estrangeira
    toggleForeignLangInputs();
}); 