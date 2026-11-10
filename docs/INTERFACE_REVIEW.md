# Revisão da interface — novembro de 2026

Objetivo: fundo preto real, ações diárias fáceis de encontrar, cores vivas nos destaques, menos repetição e espaçamento consistente. O tema claro continua disponível. Os dados e o texto integral das missões não são alterados pela revisão visual.

| Área | Problema observado | Alteração |
| --- | --- | --- |
| Início | Ciclo e explicações antes das tarefas; histórico extenso sempre aberto | Atividades antes do ciclo; histórico recolhido, sem atalho duplicado; sequências vazias ocultas |
| Línguas | Plano inteiro e referências competiam com as sessões | Sessões primeiro, meses e recursos recolhidos; atalhos abrem a secção; estado dos meses mantido ao editar |
| Forma | Peso antes dos treinos, estatísticas fixas, todos os dias alimentares expostos | Treino primeiro; referências recolhidas; plano alimentar do dia aberto, outros acessíveis |
| Peso | Peso inicial apresentado como atual; SVG vazio ocupava espaço | Sem registos mostra «—»; atributo hidden real no SVG; formulário alinhado e sem mensagem vazia duplicada |
| Trabalho | Cancelar criação deixava uma tarefa nova no plano | Nova tarefa permanece temporária até Guardar; cancelar ou mudar de dia descarta o rascunho |
| Vida | Título e resumo em spans em linha, texto longo ultrapassava cartão | Título e resumo em linhas próprias; largura limitada e resumo truncado |
| Agenda, pendentes, compras, estudos e planos | Controlos e espaçamento inconsistentes | Componentes partilhados para campos, cartões, ações, cabeçalhos e navegação |
| Cadernos | Biblioteca com ritmo visual próprio e grelha pouco consistente | Espaçamento e tipografia alinhados com o app; documento contínuo e gestos preservados |
| Definições | Personalização dispersa entre dados e instalação | Personalização agrupada; cópias separadas; ação de apagar identificada e distinta |
| Editores e painéis | Hora recebia rótulo «Nome»; painéis fechados podiam pintar abaixo do viewport | Rótulo correto; painéis fechados invisíveis e sem interação; edição de refeições acessível por teclado |
| Android | Fundo nativo e widget ainda grafite/azul | Preto na janela e widget; destaque violeta consistente, mantendo identidade e assinatura |

## Verificação

Perfis de navegador isolados, larguras de celular, tablet e computador. Teste `tests/browser/interface-review.cjs` percorre as cinco abas, destinos de Vida, histórico, edição de línguas, refeições, peso, cancelamento de rascunhos e definições. Os testes existentes cobrem rotina, cópia/ordem, planos diários, cadernos/gestos, rotação, pasta de cópias e missões/PDF. As ações destrutivas usam dados sintéticos nos testes; não foram usadas informações pessoais.

A compilação e os testes de ponte nativa simulada não substituem a validação física de caneta, widget e permissões num Android real.

## 9 de novembro — composição de página

Capa pessoal opcional no Início, escolhida no aparelho e reduzida antes de guardar. A imagem acompanha Exportar/Importar e a pasta de cópias; ficheiros inválidos ou falta de espaço preservam a capa anterior. O seletor Android distingue imagens, PDFs e backups. O ciclo fica na coluna lateral nas telas grandes, eliminando a linha alta vazia do cabeçalho. Secções e referências usam divisórias e toggles simples em vez de caixas encaixadas. Verificação em `tests/browser/home-cover.cjs`, incluindo persistência, recuperação do backup, falta de espaço e rotação de layout.

## Missões — página de leitura

A missão deixa de repetir a semana no cabeçalho e no cartão de progresso. O texto integral aparece em blocos tipográficos simples, com a alternativa em destaque discreto e o anexo PDF junto da prova. Uma única marcação conclui a missão, exigindo o PDF como antes. Os dados existentes de ação/prova permanecem compatíveis. Os testes de rota validam texto exato, anexos, conclusão, exportação/importação e retoma; `tests/browser/mission-page.cjs` verifica a composição em celular e tablet.

## Espaço de páginas — versão 3.27

Navegação lateral com nomes nas telas a partir de 1000 px; menu de páginas no celular e nos tablets estreitos. Pesquisa de destinos por nome, com Ctrl+K, teclado, Escape e botão de voltar do Android. Os caminhos em Vida permitem regressar ao índice sem percorrer a sequência de telas. Vida passa a ser um diretório com linhas e ícones, e os cadernos usam capas compactas. Tipografia, subtabs, referências e planos diários partilham uma linguagem de página. As rotinas e o conteúdo das missões permanecem no modelo existente. Testes: `tests/browser/workspace.cjs`, mais as verificações responsivas, de capa, cadernos e rota.

## Páginas flexíveis — versão 3.28

«Visitadas recentemente» reflete navegação real, sem duplicar destinos, e acompanha o backup. A divisão entre tarefas e análise pode ser arrastada nas telas largas ou ajustada com o teclado; a proporção é guardada. A rotina do Início tem vistas Lista/Tabela sobre os mesmos registos, incluindo conclusão, princípios e ordem manual.

O botão Personalizar página permite acrescentar texto, títulos, checklists, imagens e divisórias entre secções existentes. Os blocos podem ser editados, arrastados, deslocados por botões/teclado e apagados com confirmação. As imagens são reduzidas localmente; os blocos, marcações e posições seguem em `pageBlocks` no backup completo. O conteúdo original das missões permanece separado. O editor de escrita à mão mantém a própria superfície de páginas.

Em telas estreitas, as colunas passam para uma sequência vertical e a tabela tem rolagem horizontal. `tests/browser/flexible-pages.cjs` valida visitas, redimensionamento real com ponteiro, conclusão partilhada entre vistas, blocos de texto/imagem/checklist, arrasto, reordenação, cancelamento de eliminação, persistência e reorganização responsiva.

## Edição contextual — versão 3.29

Retirado o modo global que expunha botões e contornos em todos os blocos. Texto, título e checklist editam-se na própria página e guardam automaticamente. Uma lista compacta permite escolher o conteúdo a adicionar; imagens abrem o seletor de ficheiros diretamente. As ações ficam no bloco selecionado/ao passar o ponteiro, com apenas a pega e um pequeno menu. Os pontos de inserção deixam de ocupar espaço e ficam ocultos na leitura normal. O modelo `pageBlocks` mantém compatibilidade com os dados anteriores.

A análise do Início fica aberta, com os detalhes de um dia apresentados mediante seleção da data. `tests/browser/quiet-blocks.cjs` verifica dados anteriores, escrita direta, seleção de imagem, ações contextuais, gravação e navegação no celular; os testes de páginas flexíveis continuam a verificar arrasto e as vistas da rotina.
