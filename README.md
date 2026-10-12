# Protocolo — Línguas & Forma

Um único PWA que junta dois planos pessoais num só app instalável:

- **Rota para B1** — plano de inglês de 13 semanas (A2 → B1), com tracker de vocabulário.
- **Judo, Tiros e Emagrecimento** — plano de treino e alimentação, com tracker de peso e de treinos.

Sem backend, sem contas, sem anúncios. Tudo fica guardado no `localStorage` do teu telemóvel/browser.

## Funcionalidades

- **Início** — tarefas e progresso de hoje, ciclo com “dia X de Y”, sequências, indicadores AIF expansíveis e histórico semanal/mensal em calendário ou quadro de hábitos.
- **Línguas** — rotina semanal, currículo das 13 semanas (gramática + vocabulário com checkboxes), checkpoints, recursos e fontes.
- **Forma** — registo de peso com gráfico e tendência (kg/semana vs meta), treino semanal com checkboxes, protocolos, plano alimentar e regras.
- **Vida** — estudos com cronómetro e gráficos de linhas, compras, pendentes, agenda e planos futuros com fases e contagem “dia X de Y”.
- **Áreas da vida** — selecionar, criar, renomear e apagar diretamente no editor; também disponíveis nas Definições. As tarefas de uma área apagada passam para a área de destino “Outro”.
- **Definições** — tema claro/escuro/automático, exportar/importar backup (`.json`), repor tudo. Interface móvel em azul elétrico, turquesa e violeta.
- Instalável como app (PWA) com ícone, splash e funcionamento offline (service worker faz cache da app shell).

## Correr localmente

Qualquer servidor estático serve. Por exemplo:

```bash
npx http-server . -p 8080
# depois abre http://localhost:8080
```

Não uses `file://` diretamente — o *service worker* e o manifest precisam de `http(s)`.

## Contadores, progresso e histórico

Os períodos têm uma data de início e uma data de fim editáveis. A contagem inclui ambos os dias: o primeiro é o dia 1 e o último é o dia total. Antes do início, o app mostra quando começa; depois do prazo, mostra que o período terminou. A barra mede a passagem dos dias, não a realização do objetivo.

A Rota para a China usa inicialmente 1 de setembro de 2026 até à data de candidatura já guardada. Edita o lápis do contador para ajustar essas datas.

O progresso de Forma inclui todas as atividades dessa área, mesmo quando há mais de uma no mesmo dia. A sequência de Línguas considera atividades concluídas nessa área ou vocabulário marcado no dia. Uma categoria AIF sem atividades não reduz a média; intensidade compara as tarefas concluídas com a chama marcada com todas as tarefas de intensidade previstas.

As novas marcações guardam a rotina e os nomes para preservar o histórico após edições. Registos antigos sem a rotina e a classificação AIF necessárias continuam no calendário, mas não recebem uma pontuação AIF inventada. As migrações de conteúdo antigo são aplicadas uma vez, para não recriar tarefas que foram removidas.

## Validar a lógica

Não há dependências de build. Os testes de calendário e indicadores usam o Node.js nativo:

```bash
node --test tests/logic.test.cjs
```

A validação no browser deve cobrir os temas claro/escuro em telas pequenas, navegação, edição de áreas, múltiplas tarefas de Forma e Trabalho, validação de datas, exportação/importação e recarregamento offline. Usa um perfil de browser de teste para preservar os dados pessoais.

## Publicar (GitHub Pages)

1. Neste repositório: **Settings → Pages → Build and deployment → Deploy from a branch**.
2. Escolhe o branch `main` e a pasta `/ (root)`.
3. Guarda. Em 1–2 minutos o app fica disponível em `https://<utilizador>.github.io/<repo>/`.

## Transformar em APK (Android)

O app já cumpre os requisitos de um PWA instalável (manifest + ícones + service worker). Duas formas simples de gerar um `.apk`/`.aab` a partir do URL publicado (GitHub Pages):

- **[PWABuilder](https://www.pwabuilder.com/)** (mais simples, sem instalar nada): cola o URL do teu GitHub Pages, deixa validar o manifest, e escolhe "Android" para descarregar o pacote pronto a instalar ou publicar na Play Store.
- **[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)** (linha de comandos, mais controlo): `npx @bubblewrap/cli init --manifest=https://<teu-url>/manifest.webmanifest`.

Ambos geram uma *Trusted Web Activity* — uma app Android real que carrega o teu PWA em ecrã inteiro, sem barra de navegador.

## Estrutura

```
index.html            shell do app + as 3 vistas (Início, Línguas, Forma)
css/styles.css         sistema de design (cores, tipografia, componentes)
js/logic.js            cálculos de calendário e indicadores, usados no app e nos testes
js/data.js             conteúdo dos dois planos (sem lógica)
js/app.js              navegação, trackers, persistência, gráfico de peso
manifest.webmanifest   metadados do PWA
sw.js                  service worker (cache da app shell, funciona offline)
icons/                 ícones do PWA (192, 512, maskable, apple-touch, favicon)
tests/logic.test.cjs    testes de calendário, limites dos períodos e pontuações AIF
```

## Créditos

Conteúdo adaptado dos planos pessoais "Rota para B1" (revisão do plano original de @itsteacherlais) e "Judo, Tiros e Emagrecimento".
