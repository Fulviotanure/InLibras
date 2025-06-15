Especificação Detalhada | Página: home/index.html (Calculadora de Orçamento)
1. Objetivo da Página

Esta é a página principal e o coração da aplicação. Sua função é permitir que o usuário crie um novo orçamento do zero, inserindo todos os detalhes do serviço, realizando cálculos complexos em tempo real e, ao final, salvando ou exportando o resultado.

2. Componentes da Interface (Layout e Estrutura Visual)

Navegação Superior: Um menu fixo no topo da página contendo:

O logo da aplicação (logo.png) à esquerda.

Links de navegação para "Home" (página atual) e "Orçamentos" à direita.

Área de Título e Cliente:

Um título principal: "Calculadora de Orçamento".

Campo "Nome do Cliente/Evento": Um campo de texto padrão para o usuário identificar a quem ou a que se destina o orçamento.

Entradas de Informação (Acima da Tabela):

Uma seção dedicada para inserir os dados que servirão de base para os itens do orçamento.

"Valor Hora por Intérprete (R$)": Campo numérico para definir o custo padrão da hora.

"Quantidade de Intérpretes": Campo numérico para definir a quantidade padrão de profissionais.

"Data do Serviço": Seletor de data.

"Hora de Início" / "Hora Final": Seletores de horário (formato 24h).

"Início Língua Estrangeira" / "Fim Língua Estrangeira": Campos de horário que podem estar visíveis ou aparecer somente quando o checkbox abaixo for marcado.

Checkboxes de Opções:

Com Língua Estrangeira?

É Feriado?

Botão "Adicionar Dia": Ao ser clicado, este botão pega todas as informações inseridas nos campos acima e as utiliza para criar uma nova linha na "Tabela de Itens de Serviço" abaixo, com os valores já preenchidos.

Tabela de Itens de Serviço:

Um subtítulo "Itens do Orçamento" acima da tabela.

Esta tabela é preenchida principalmente pela ação do botão "Adicionar Dia".

Colunas da Tabela:

Data: Preenchido a partir da entrada superior.

Início/Fim: Preenchido a partir da entrada superior.

Horas: Campo de texto (somente leitura), preenchido automaticamente.

Qtd. Tils: Preenchido a partir da entrada superior.

V.Hora (R$): Preenchido a partir da entrada superior.

Língua Estrangeira (50%): Exibe o valor do acréscimo em R$. (somente leitura).

Sábado (25%): Exibe o valor do acréscimo em R$. (somente leitura).

Domingo/Feriado (50%): Exibe o valor do acréscimo em R$. (somente leitura).

Horário Noturno (25%): Exibe o valor do acréscimo em R$. (somente leitura).

Total (R$): Campo de texto (somente leitura), que mostra o custo total da linha.

Ações: Um ícone de lixeira para excluir a linha da tabela.

Seção de Resumo Final: Uma área distinta, geralmente à direita ou abaixo da tabela, com os seguintes campos:

Subtotal (R$): Mostra a soma dos valores base de todas as linhas (Horas * Qtd * V.Hora), sem acréscimos. (Somente leitura).

Acréscimos (R$): Mostra a soma de todos os valores de acréscimo (soma de todas as colunas de acréscimo) de todas as linhas. (Somente leitura).

Desconto (R$): Um campo numérico editável para o usuário inserir um valor de desconto.

Valor Total (R$): O resultado final do orçamento (Subtotal + Acréscimos - Desconto). (Somente leitura).

Ações da Página: Botões grandes e claros no final da página.

Salvar Orçamento: Botão principal para persistir os dados no banco de dados.

Gerar PDF: Botão secundário para exportar o orçamento atual como um documento PDF.

3. Lógica e Funcionalidade (script.js)

O script deve ser orientado a eventos, recalculando tudo sempre que um valor é alterado.

Lógica do "Adicionar Dia": A função principal desta seção. Ao ser clicada, ela lê todos os campos de entrada, cria uma nova linha na tabela abaixo e preenche as células com esses valores. Depois disso, dispara a função de recálculo total.

Recálculo Automático (Função Principal): Esta função é chamada sempre que uma linha é adicionada/removida ou um campo dentro da tabela é alterado.

Lógica de Cálculo (Passo a Passo dentro do Recálculo):

Para cada linha da tabela:
a.  Calcular Horas Totais: A função deve ser robusta, lidando com o cenário de pernoite (ex: início 22:00, fim 02:00 = 4 horas). Atualizar o campo Horas.
b.  Calcular Valor Base: Valor Base = Horas Totais * Qtd. Tils * V.Hora.
c.  Calcular e Preencher Colunas de Acréscimos:
* Coluna Sábado (25%): Se a Data for sábado, calcular Valor Base * 0.25 e preencher a coluna. Senão, o valor é 0.
* Coluna Domingo/Feriado (50%): Se a Data for domingo OU o checkbox É Feriado? correspondente a essa linha estiver marcado, calcular Valor Base * 0.50 e preencher a coluna. Senão, o valor é 0. (Regra: Se for um domingo E feriado, usar apenas o de 50%, não somar).
* Coluna Horário Noturno (25%): Calcular quantas horas do intervalo Início/Fim caem entre 22:00 e 05:00. O valor do acréscimo é (horas_noturnas * Qtd. Tils * V.Hora) * 0.25. Preencher a coluna com este valor.
* Coluna Língua Estrangeira (50%): Se o checkbox Com Língua Estrangeira? estiver marcado, calcular a duração entre Início (L.E.) e Fim (L.E.). O valor do acréscimo é (horas_L.E. * Qtd. Tils * V.Hora) * 0.50. Preencher a coluna com este valor.
d.  Calcular Total da Linha: Total da Linha = Valor Base + Soma de todas as colunas de acréscimo. Atualizar o campo Total (R$) da linha.

Calcular Resumo Final:
a.  Subtotal = Soma dos Valor Base de todas as linhas.
b.  Acréscimos = Soma de todas as colunas de acréscimo (Sábado, Domingo/Feriado, etc.) de todas as linhas.
c.  Valor Total = Subtotal + Acréscimos - Valor do Desconto.

Persistência de Dados (Função salvar):

Monta um objeto JSON contendo: nomeCliente, resumo (com subtotal, acréscimos, etc.) e um array de itens, onde cada item é um objeto com todos os dados da sua linha (data, horas, valores, valores de cada acréscimo, etc.).

Envia este objeto para o Firestore.

Após o sucesso, redireciona para orcamentos/index.html.

Geração de PDF (Função gerarPdf):

Utiliza uma biblioteca como html2pdf.js para capturar uma div que envolve a tabela e o resumo, formatando-a para um documento PDF que inclui o logopdf.png no cabeçalho.