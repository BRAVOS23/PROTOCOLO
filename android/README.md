# Protocolo Novo 2.0 — instalação separada, sem loja ou servidor

O APK inclui o app web e funciona offline. Não usa Firebase, conta, serviço de push, assinatura mensal, publicidade ou permissão de Internet. Os links externos de estudo abrem o navegador apenas quando são tocados.

Download direto: [Protocolo-Novo.apk](https://bravos23.github.io/PROTOCOLO/downloads/Protocolo-Novo.apk?v=2.0). A cópia distribuída fica em `downloads/Protocolo-Novo.apk`.

Esta instalação tem nome **Protocolo Novo** e identificador `app.protocolo.mobile`. Instala ao lado do APK antigo (`app.protocolo.android`), sem substituir nem apagar os seus dados. O APK antigo em `downloads/Protocolo.apk` continua preservado. A chave antiga não está disponível; por isso, esta é uma nova identidade, com assinatura própria.

Esta versão passou na compilação/assinatura, nos testes de lógica e na integração da interface com ponte nativa simulada. A entrega de notificações e a inclusão do widget ainda precisam de validação num Android real; o emulador deste ambiente não ficou disponível sem aceleração de hardware.

## Instalar e trazer os dados existentes

1. No **Protocolo antigo**, abre **Definições → Exportar dados** e guarda o JSON. Também podes usar um backup do site/PWA.
2. Descarrega e instala **Protocolo-Novo.apk**. Mantém o antigo instalado. Se o Android pedir, permite a instalação pelo navegador/gestor de ficheiros que estás a usar. Não é necessário desativar o Play Protect.
3. Abre **Protocolo Novo** e usa **Definições → Importar dados** para escolher o JSON. A importação substitui apenas os dados desta nova instalação; não altera os dados do app antigo ou do Chrome/PWA.
4. Confere as atividades, tarefas, áreas, agenda, planos e histórico importados. O teste de migração exportou dados pelos assets reais do APK 1.2 e importou-os pela interface atual com ponte Android simulada; os campos e as conclusões foram preservados.
5. No novo app, ativa **Definições → Lembretes das atividades e agenda** e permite as notificações.
6. Se aparecer **Permitir horário exato**, abre essa opção e permite alarmes/lembretes para o **Protocolo Novo**. Sem esse acesso, o Android pode atrasar os avisos.
7. Usa **Adicionar widget** e confirma no Android. Também podes manter pressionada a tela inicial e escolher **Widgets → Protocolo Novo → Atividades de hoje · Novo**.
8. Depois de conferir a transferência, desativa os lembretes no app antigo para evitar avisos duplicados. Não precisas de desinstalá-lo para usar o novo.

Para copiar atividades: **Início → lápis → dia de origem → Copiar atividades para outro dia**. Seleciona algumas ou todas, escolhe o destino e confirma. As originais e as atividades já existentes no destino ficam preservadas. As cópias mantêm horários, áreas e detalhes, com novos identificadores e conclusão independente.

O widget mostra **todas as atividades do dia no Início**, por horário, como no Início: Acordar, God Moment, treinos, leitura, etc. A lista pode ser deslizada e inclui horários, conclusão e progresso do dia. O Início, o editor e o widget ordenam as atividades pela hora de início; horários iguais mantêm a ordem existente e atividades sem hora ficam no fim. Agenda e tarefas usam primeiro a data, depois a hora. Editar uma data/hora reposiciona o item sem mudar as suas marcações de conclusão. Tocar numa atividade abre o Início e destaca-a. A agenda continua com notificações; o conteúdo do widget agora é a rotina diária.

A rotina semanal fica guardada no Android para mudar de dia e programar as próximas ocorrências sem abrir o app. Edições, exclusões, importações e marcações de conclusão atualizam o widget e os avisos. Uma atividade concluída cancela o seu aviso; desmarcá-la não repete um aviso já enviado naquele dia. Cada dia/semana tem uma ocorrência independente. O widget é atualizado à meia-noite (o sistema pode atrasar sem a permissão de horário exato), periodicamente e após reinício/mudanças de relógio ou fuso.

Os lembretes das atividades usam a hora de início definida no Início: `05h40`, `5h`, `14:30` e intervalos como `18h–19h` são reconhecidos. Atividades sem hora ou com texto sem um horário válido continuam no widget e não recebem um horário inventado; define uma hora no editor do Início para receber aviso. A opção de lembretes em Definições controla tanto as atividades como a agenda.

A antecedência é configurável: 10 minutos, 30 minutos, 1 hora ou 1 dia. Eventos sem hora são considerados às 09:00 para os lembretes e continuam visíveis no widget até ao fim do dia. Um evento criado dentro da janela de antecedência recebe um aviso próximo da criação, se ainda não começou. Avisos já enviados não se repetem ao marcar tarefas ou reabrir o app. Alterar a data/hora permite um novo aviso; apagar o evento cancela o aviso pendente e remove a notificação antiga.

Os lembretes usam o relógio/fuso do celular. Funcionam sem o app aberto, mas o aparelho precisa estar ligado. Se usares **Forçar parada**, o Android bloqueia a execução até reabrires o app. Restrições de bateria e a falta de acesso a alarmes exatos podem afetar o horário.

O mínimo do APK é Android 8.0/API 26. O Android System WebView deve estar atualizado. O APK distribuído tem depuração desativada. Futuras atualizações desta nova instalação precisam do mesmo identificador e da sua nova chave; não podem usar a assinatura antiga.

## Compilar no Linux/Codex

Prérequisitos: Python 3, Java com o módulo `jdk.compiler` (JDK 17+ recomendado) e as ferramentas oficiais do Android SDK. A compilação padrão não precisa de Gradle nem de dependências pagas.

```bash
cd /workspace/PROTOCOLO
python3 android/tools/install_sdk.py
python3 android/tools/test_logic.py
node --test tests/*.test.cjs
python3 android/tools/build.py
```

O instalador descarrega `platforms;android-35` e `build-tools;35.0.0` de `dl.google.com`, valida tamanho e checksum contra os metadados oficiais via HTTPS e escreve em `/workspace/android-tools/sdk`. Não desativa TLS ou verificação de artefactos. Usa `--sdk /outro/caminho` em ambos os scripts para mudar esse diretório.

O APK fica em `android/dist/Protocolo-Novo.apk`. O script compila recursos/Java/DEX, alinha o APK, assina-o e verifica a assinatura e o alinhamento. `--debug` gera uma variante separada para testar WebView por ADB; essa variante não deve ser distribuída.

A nova chave fica em `/workspace/.protocolo-novo-signing`, fora do Git, com permissões privadas. `PROTOCOLO_SIGNING_DIR` permite restaurar uma pasta de assinatura já existente. **Guarda o backup privado da assinatura: contém `personal.p12` e `password.txt`, necessários para atualizar o Protocolo Novo instalado.** Nunca publiques esses ficheiros ou o ZIP privado.

O ficheiro versionado `android/signing-certificate.sha256` contém apenas a impressão digital pública do certificado. O build verifica-a e recusa uma assinatura diferente. Depois da primeira distribuição, se a chave/senha faltar, o script recusa gerar outra identidade. Restaura os dois ficheiros do backup privado numa pasta com acesso restrito e define `PROTOCOLO_SIGNING_DIR` para essa pasta.

O código Java e o namespace dos recursos continuam em `app.protocolo.android` para reutilizar a implementação; o **applicationId** é `app.protocolo.mobile`. Os componentes do manifesto usam nomes de classe completos, e o build AAPT2 gera recursos no namespace Java com `--custom-package`.

Os dados pessoais de teste e as chaves não entram no APK. Os assets são apenas `index.html`, `manifest.webmanifest`, `css/`, `js/` e `icons/` do repositório; o APK não inclui a pasta de compilação, SDK ou backups.

## Testes

`python3 android/tools/test_logic.py` verifica fusos horários, horário de verão, datas inválidas, eventos sem hora, antecedência, eventos passados, identidade dos avisos, horários da rotina, conclusão, repetição semanal e mudança de dia. `node --test tests/*.test.cjs` também verifica a projeção da rotina e das conclusões para a ponte Android. Os testes web em `tests/logic.test.cjs` continuam independentes.

Num emulador/dispositivo, verifica também:

- permissões negadas e concedidas, incluindo acesso a alarmes exatos;
- criação, alteração e exclusão de um evento, sem avisos duplicados;
- aviso com o app em segundo plano e abertura do evento pela notificação;
- inclusão/atualização do widget e abertura dos seus eventos;
- exportação/importação pelo seletor nativo de documentos;
- instalação de atualização assinada pela mesma chave sem perder dados.

O projeto também inclui os ficheiros Gradle para manutenção no Android Studio. A distribuição pessoal deste ambiente usa o script acima e a chave preservada, sem publicação em loja.
