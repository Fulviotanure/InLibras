Descrição de Projeto Detalhada: Recriação da Aplicação Web InLibras
1. Visão Geral do Projeto
O objetivo é desenvolver uma aplicação web robusta, chamada "InLibras", para servir como uma ferramenta completa de orçamentação para intérpretes de Libras. A aplicação permitirá criar, salvar, visualizar e gerenciar orçamentos, com uma estrutura de múltiplas páginas, dados persistidos em um banco de dados e acesso restrito.
2. Arquitetura e Estrutura de Pastas
A aplicação será organizada em uma estrutura de pastas separadas para cada página, garantindo modularidade:
home/: Contém os arquivos da página principal (index.html, style.css, script.js).
orcamentos/: Contém os arquivos da página de listagem (index.html, style.css, script.js).
visualizar-orcamento/: Contém os arquivos da página de visualização (index.html, style.css, script.js).
3. Navegação
Um menu de navegação com botões para "Home" (calculadora) e "Orçamentos" (lista) deve estar presente e visível em todas as páginas da aplicação para garantir uma experiência de usuário consistente.
4. Ativos de Imagem (Assets)
favicon.png: Ícone do site na aba do navegador.
logo.png: Usado no cabeçalho de todas as páginas da aplicação web.
logopdf.png: Usado exclusivamente no cabeçalho dos documentos PDF gerados.
5. Funcionalidades Detalhadas (Página a Página)
Página 1: home/index.html (Calculadora de Orçamento)
Entrada de Dados Gerais:
Um campo para o nome do cliente ou do evento.
Tabela de Itens/Dias de Serviço:
Uma tabela dinâmica onde o usuário pode adicionar e remover linhas.
Colunas da Tabela:
Data: Seletor de data.
Início: Seletor de horário (formato 24h).
Fim: Seletor de horário (formato 24h).
Horas: Calculado automaticamente (Fim - Início).
Qtd. Tils: Campo numérico para "Quantidade de Intérpretes".
V.Hora (R$): Campo numérico para o "Valor Hora".
Língua Estrangeira?: Checkbox. Ao ser marcado, deve exibir dois novos campos de horário: horario Início e horario Fimfazer o calculo das horas e inserir valor .
Feriado?: Checkbox.
Total (R$): Custo total da linha, calculado automaticamente.
Ações: Um botão para eliminar (excluir) a linha.
Lógica de Cálculo Detalhada (por linha):
Cálculo de Horas Totais: Se Hora Início > Hora Fim, o sistema deve entender que o trabalho atravessou a meia-noite e calcular as horas corretamente.
Valor Base da Linha: (Horas Totais * Qtd. Tils * V.Hora).
Cálculo de Acréscimos (Automático e Manual):
Fim de Semana (Automático): Sábado (+25%), Domingo (+50%).
Feriado (Manual): Se o checkbox Feriado? estiver marcado, calcula um acréscimo de 50%. (Se um domingo for feriado, prevalece o maior percentual).
Horário Noturno (Automático): Acréscimo de 25% aplicado somente às horas trabalhadas entre 22:00 e 05:00.
Língua Estrangeira (Manual/Parcial): Acréscimo de 50% aplicado somente às horas definidas nos campos hora Início e hora Fim .
Coluna Total (R$): Será o Valor Base da Linha + Soma de todos os valores de acréscimo calculados para a linha.
Resumo Final do Orçamento:
Valor Bruto: Soma da coluna Total (R$) de todas as linhas.
Total de Acréscimos (R$): A soma de todos os valores de acréscimos de todas as linhas, exibida para fins informativos.
Desconto (R$): Um campo opcional para inserir um valor de desconto.
Valor Final: Valor Bruto - Desconto.
Ações da Página: Adicionar Linha, Salvar Orçamento, Gerar PDF.
Páginas 2 e 3 (orcamentos/ e visualizar-orcamento/)
orcamentos/index.html: A funcionalidade permanece a mesma: listar orçamentos com opções para "Visualizar" e "Excluir".
visualizar-orcamento/index.html: A página de visualização deve refletir a nova estrutura da tabela e do resumo, mostrando todos os dados que foram salvos em modo de somente leitura, antes de permitir a geração do PDF.
6. Fase Final: Autenticação de Usuário
Após a conclusão e teste de todas as funcionalidades principais de orçamentação, a fase final do projeto será a implementação de uma página de login para restringir o acesso à aplicação. A especificação detalhada desta página está em um documento separado.
7. Tecnologias Recomendadas
Frontend: HTML5, CSS3, JavaScript (Vanilla).
Backend e Banco de Dados:
Firebase Authentication: Para gerenciar o fluxo de login de usuários.
Firestore: Para armazenar os documentos de orçamento e a lista de e-mails autorizados.
Firebase Hosting: Para hospedar a aplicação.
Geração de PDF: html2pdf.js.
