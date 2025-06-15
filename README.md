# InLibras - Sistema de Orçamentação para Intérpretes de Libras

## Descrição
InLibras é uma aplicação web desenvolvida para auxiliar intérpretes de Libras na criação e gerenciamento de orçamentos. O sistema permite calcular custos considerando diversos fatores como horários, quantidade de intérpretes, língua estrangeira e feriados.

## Funcionalidades Principais
- Calculadora de orçamentos com múltiplos itens
- Cálculo automático de horas e valores
- Suporte a acréscimos por:
  - Fim de semana (Sábado: +25%, Domingo: +50%)
  - Feriados (+50%)
  - Horário noturno (+25% entre 22:00 e 05:00)
  - Língua estrangeira (+50%)
- Geração de PDF
- Sistema de autenticação
- Armazenamento em nuvem

## Tecnologias Utilizadas
- HTML5
- CSS3
- JavaScript (Vanilla)
- Firebase (Authentication, Firestore, Hosting)
- html2pdf.js

## Estrutura do Projeto
```
inlibras/
├── home/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── orcamentos/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── visualizar-orcamento/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── assets/
│   ├── favicon.png
│   ├── logo.png
│   └── logopdf.png
└── README.md
```

## Instalação e Configuração
1. Clone o repositório
2. Configure as credenciais do Firebase
3. Abra o arquivo `home/index.html` em seu navegador


