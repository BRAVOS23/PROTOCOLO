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
