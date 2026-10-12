# Protocolo Android — APK pessoal, sem loja ou servidor

O APK inclui o app web e funciona offline. Não usa Firebase, conta, serviço de push, assinatura mensal, publicidade ou permissão de Internet. Os links externos de estudo abrem o navegador apenas quando são tocados.

Download direto: [Protocolo.apk](https://bravos23.github.io/PROTOCOLO/downloads/Protocolo.apk?v=1.1). A cópia distribuída fica em `downloads/Protocolo.apk`; substitui-a apenas depois de compilar e verificar uma atualização assinada pela mesma chave.

Esta versão passou na compilação/assinatura, nos testes de lógica e na integração da interface com ponte nativa simulada. A entrega de notificações e a inclusão do widget ainda precisam de validação num Android real; o emulador deste ambiente não ficou disponível sem aceleração de hardware.

## Instalar e trazer os dados existentes

1. No site/PWA atual, abre **Definições → Exportar dados** e guarda o JSON.
2. Descarrega e instala `Protocolo.apk`. Se o Android pedir, permite a instalação pelo navegador/gestor de ficheiros que estás a usar. Não é necessário desativar o Play Protect.
3. Abre o APK e usa **Definições → Importar dados** para escolher o JSON. O APK tem armazenamento próprio; não lê nem apaga o armazenamento do Chrome/PWA. A importação substitui os dados do APK.
4. Em **Definições → Lembretes das atividades e agenda**, ativa os lembretes e permite as notificações.
5. Se aparecer **Permitir horário exato**, abre essa opção e permite alarmes/lembretes para o Protocolo. Sem esse acesso, o Android pode atrasar os avisos.
6. Usa **Adicionar widget** e confirma no Android. Também podes manter pressionada a tela inicial e escolher **Widgets → Protocolo → Atividades de hoje**.

O widget mostra **todas as atividades do dia no Início**, na mesma ordem: Acordar, God Moment, treinos, leitura, etc. A lista pode ser deslizada e inclui horários, conclusão e progresso do dia. Tocar numa atividade abre o Início e destaca-a. A agenda continua com notificações; o conteúdo do widget agora é a rotina diária.

A rotina semanal fica guardada no Android para mudar de dia e programar as próximas ocorrências sem abrir o app. Edições, exclusões, importações e marcações de conclusão atualizam o widget e os avisos. Uma atividade concluída cancela o seu aviso; desmarcá-la não repete um aviso já enviado naquele dia. Cada dia/semana tem uma ocorrência independente. O widget é atualizado à meia-noite (o sistema pode atrasar sem a permissão de horário exato), periodicamente e após reinício/mudanças de relógio ou fuso.

Os lembretes das atividades usam a hora de início definida no Início: `05h40`, `5h`, `14:30` e intervalos como `18h–19h` são reconhecidos. Atividades sem hora ou com texto sem um horário válido continuam no widget e não recebem um horário inventado; define uma hora no editor do Início para receber aviso. A opção de lembretes em Definições controla tanto as atividades como a agenda.

A antecedência é configurável: 10 minutos, 30 minutos, 1 hora ou 1 dia. Eventos sem hora são considerados às 09:00 para os lembretes e continuam visíveis no widget até ao fim do dia. Um evento criado dentro da janela de antecedência recebe um aviso próximo da criação, se ainda não começou. Avisos já enviados não se repetem ao marcar tarefas ou reabrir o app. Alterar a data/hora permite um novo aviso; apagar o evento cancela o aviso pendente e remove a notificação antiga.

Os lembretes usam o relógio/fuso do celular. Funcionam sem o app aberto, mas o aparelho precisa estar ligado. Se usares **Forçar parada**, o Android bloqueia a execução até reabrires o app. Restrições de bateria e a falta de acesso a alarmes exatos podem afetar o horário.

O mínimo do APK é Android 8.0/API 26. O Android System WebView deve estar atualizado. O APK pessoal distribuído tem depuração desativada. A versão 1.1 tem o mesmo identificador e a mesma assinatura da 1.0: instala-a por cima, **sem desinstalar**, para preservar os dados. Faz um backup antes da atualização.

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

O APK fica em `android/dist/Protocolo.apk`. O script compila recursos/Java/DEX, alinha o APK, assina-o e verifica a assinatura e o alinhamento. `--debug` gera uma variante separada para testar WebView por ADB; essa variante não deve ser distribuída.

A primeira compilação cria a chave de assinatura em `/workspace/.protocolo-android-signing`, fora do Git, com permissões privadas. `PROTOCOLO_SIGNING_DIR` permite usar uma pasta de assinatura já existente. **Guarda a chave e o ficheiro de senha em segurança: todas as atualizações precisam da mesma chave para manter os dados do APK instalado.** Nunca publiques esses ficheiros. O script recusa uma pasta em que falta a chave ou a senha; não substitui material existente.

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
