# Protocolo

Aplicativo pessoal de atividades, agenda, estudos e treino, com versão web instalável (PWA) e APK Android. Inclui dois planos pessoais:

- **Rota para B1** — plano de inglês de 13 semanas (A2 → B1), com tracker de vocabulário.
- **Judo, Tiros e Emagrecimento** — plano de treino e alimentação, com tracker de peso e de treinos.

Sem backend, sem contas, sem anúncios. Tudo fica guardado no `localStorage` do teu telemóvel/browser.

## Funcionalidades

- **Início** — tarefas e progresso de hoje, ciclo com “dia X de Y”, sequências, marcação conjunta de autenticidade, intensidade e fidelidade e histórico semanal/mensal em calendário ou quadro de hábitos.
- **Línguas** — rotina semanal, currículo das 13 semanas (gramática + vocabulário com checkboxes), checkpoints, recursos e fontes.
- **Forma** — lista e contador dos treinos de hoje, com mudança automática de dia e histórico preservado; áreas de treino selecionáveis (incluindo Gym e áreas criadas pelo utilizador), registo de peso com gráfico e tendência (kg/semana vs meta), treino semanal com checkboxes, protocolos, plano alimentar e regras.
- **Trabalho** — tarefas de áreas selecionáveis, incluindo áreas novas como DROP e Negócio; as tarefas usam as mesmas marcações do Início.
- **Vida** — estudos com cronómetro e gráficos de linhas, compras, pendentes, agenda e planos futuros com fases e contagem “dia X de Y”.
- **Ordem manual** — mantém pressionado o botão ⠿ e arrasta as atividades no Início, Trabalho ou editor de rotinas. A ordem fica guardada por dia e também no widget; «Usar horários» repõe a ordem cronológica.
- **Áreas da vida** — selecionar, criar, renomear e apagar diretamente no editor; também disponíveis nas Definições. As tarefas de uma área apagada passam para a área de destino “Outro”.
- **Definições** — tema claro/escuro/automático, exportar/importar backup (`.json`), repor tudo. Interface móvel em azul elétrico, turquesa e violeta.
- Instalável como app (PWA) com ícone, splash e funcionamento offline (service worker faz cache da app shell).

## Correr localmente

Qualquer servidor estático serve. Por exemplo:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
# depois abre http://localhost:8080
```

Não uses `file://` diretamente — o *service worker* e o manifest precisam de `http(s)`.

## Versão Android (APK, sem loja)

O **Protocolo 3.0** acrescenta lembretes locais, um widget com as atividades do dia e cópia de atividades entre rotinas, sem servidor ou mensalidade. A instalação e a transferência dos dados do PWA por backup estão descritas em [android/README.md](android/README.md). Os dados do PWA e do APK são separados; importar o backup substitui os dados no APK.

## Contadores, progresso e histórico

Os períodos têm uma data de início e uma data de fim editáveis. A contagem inclui ambos os dias: o primeiro é o dia 1 e o último é o dia total. Antes do início, o app mostra quando começa; depois do prazo, mostra que o período terminou. A barra mede a passagem dos dias, não a realização do objetivo.

A Rota para a China usa inicialmente 1 de setembro de 2026 até à data de candidatura já guardada. Edita o lápis do contador para ajustar essas datas.

O progresso de Forma inclui todas as atividades dessa área, mesmo quando há mais de uma no mesmo dia. A sequência de Línguas considera atividades concluídas nessa área ou vocabulário marcado no dia. No painel Protocolo, a chama reúne autenticidade, intensidade e fidelidade numa única marcação por atividade concluída. O progresso diário compara essas marcações com todas as atividades previstas; os registos anteriores são preservados sem os converter automaticamente para o novo critério.

As novas marcações guardam a rotina e os nomes para preservar o histórico após edições. Registos antigos sem a rotina e a classificação AIF necessárias continuam no calendário, mas não recebem uma pontuação AIF inventada. As migrações de conteúdo antigo são aplicadas uma vez, para não recriar tarefas que foram removidas.

## Validar a lógica

A versão web não precisa de build. Os testes de calendário e indicadores usam o Node.js nativo:

```bash
node --test tests/*.test.cjs
```

A validação no browser deve cobrir os temas claro/escuro em telas pequenas, navegação, edição de áreas, múltiplas tarefas de Forma e Trabalho, validação de datas, exportação/importação e recarregamento offline. Usa um perfil de browser de teste para preservar os dados pessoais.

## Publicar (GitHub Pages)

1. Neste repositório: **Settings → Pages → Build and deployment → Deploy from a branch**.
2. Escolhe o branch `main` e a pasta `/ (root)`.
3. Guarda. Em 1–2 minutos o app fica disponível em `https://<utilizador>.github.io/<repo>/`.

## Assinatura e atualizações do APK

A assinatura do **Protocolo 3.0** é fixa. As atualizações devem usar o mesmo applicationId e o certificado já registado. A chave privada deve ficar nos GitHub Actions Secrets e num backup privado do proprietário, fora do código.

O repositório inclui dois workflows:

- **Verificar app Android**: testes e compilação sem segredos, em cada alteração relevante.
- **Gerar APK para o meu celular**: compilação assinada, manual, na branch `main`; entrega o APK para instalar por cima do existente.

A configuração única dos dois segredos, a recuperação da chave e o processo de atualização estão em **[docs/ANDROID_RELEASES.md](docs/ANDROID_RELEASES.md)**. A integração atual não tem acesso aos Actions Secrets; o proprietário precisa de configurar esses campos no GitHub. A versão é mantida apenas em `android/release.json`.

## Estrutura

```
index.html            shell do app + as 5 vistas principais
css/styles.css         sistema de design (cores, tipografia, componentes)
js/logic.js            cálculos de calendário e indicadores, usados no app e nos testes
js/data.js             conteúdo dos dois planos (sem lógica)
js/app.js              navegação, trackers, persistência, gráfico de peso
manifest.webmanifest   metadados do PWA
sw.js                  service worker (cache da app shell, funciona offline)
icons/                 ícones do PWA (192, 512, maskable, apple-touch, favicon)
tests/                 testes de calendário, horários, AIF e ponte Android
android/               app Android, versão, validação e ferramentas de assinatura
.github/workflows/     testes automáticos e geração manual do APK assinado
docs/ANDROID_RELEASES.md  configuração e atualização da instalação pessoal
```

## Créditos

Conteúdo adaptado dos planos pessoais "Rota para B1" (revisão do plano original de @itsteacherlais) e "Judo, Tiros e Emagrecimento".
