# Protocolo — Línguas & Forma

Um único PWA que junta dois planos pessoais num só app instalável:

- **Rota para B1** — plano de inglês de 13 semanas (A2 → B1), com tracker de vocabulário.
- **Judo, Tiros e Emagrecimento** — plano de treino e alimentação, com tracker de peso e de treinos.

Sem backend, sem contas, sem anúncios. Tudo fica guardado no `localStorage` do teu telemóvel/browser.

## Funcionalidades

- **Início** — resumo do dia: streaks, progresso de cada módulo, checklist "hoje" e tendência de peso.
- **Línguas** — rotina semanal, currículo das 13 semanas (gramática + vocabulário com checkboxes), checkpoints, recursos e fontes.
- **Forma** — registo de peso com gráfico e tendência (kg/semana vs meta), treino semanal com checkboxes, protocolos, plano alimentar e regras.
- **Definições** — tema claro/escuro/automático, exportar/importar backup (`.json`), repor tudo.
- Instalável como app (PWA) com ícone, splash e funcionamento offline (service worker faz cache da app shell).

## Correr localmente

Qualquer servidor estático serve. Por exemplo:

```bash
npx http-server . -p 8080
# depois abre http://localhost:8080
```

Não uses `file://` diretamente — o *service worker* e o manifest precisam de `http(s)`.

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
js/data.js             conteúdo dos dois planos (sem lógica)
js/app.js              navegação, trackers, persistência, gráfico de peso
manifest.webmanifest   metadados do PWA
sw.js                  service worker (cache da app shell, funciona offline)
icons/                 ícones do PWA (192, 512, maskable, apple-touch, favicon)
```

## Créditos

Conteúdo adaptado dos planos pessoais "Rota para B1" (revisão do plano original de @itsteacherlais) e "Judo, Tiros e Emagrecimento".
