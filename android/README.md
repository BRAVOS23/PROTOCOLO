# Protocolo Android — APK pessoal, sem loja ou servidor

O APK inclui o app web e funciona offline. Não usa Firebase, conta, serviço de push, assinatura mensal, publicidade ou permissão de Internet. Os links externos de estudo abrem o navegador apenas quando são tocados.

Download direto: [Protocolo.apk](https://bravos23.github.io/PROTOCOLO/downloads/Protocolo.apk). A cópia distribuída fica em `downloads/Protocolo.apk`; substitui-a apenas depois de compilar e verificar uma atualização assinada pela mesma chave.

Esta primeira versão passou na compilação/assinatura, nos testes de lógica e na integração da interface com ponte nativa simulada. A entrega de notificações e a inclusão do widget ainda precisam de validação num Android real; o emulador deste ambiente não ficou disponível sem aceleração de hardware.

## Instalar e trazer os dados existentes

1. No site/PWA atual, abre **Definições → Exportar dados** e guarda o JSON.
2. Descarrega e instala `Protocolo.apk`. Se o Android pedir, permite a instalação pelo navegador/gestor de ficheiros que estás a usar. Não é necessário desativar o Play Protect.
3. Abre o APK e usa **Definições → Importar dados** para escolher o JSON. O APK tem armazenamento próprio; não lê nem apaga o armazenamento do Chrome/PWA. A importação substitui os dados do APK.
4. Em **Definições → Lembretes da agenda**, ativa os lembretes e permite as notificações.
5. Se aparecer **Permitir horário exato**, abre essa opção e permite alarmes/lembretes para o Protocolo. Sem esse acesso, o Android pode atrasar os avisos.
6. Usa **Adicionar widget** e confirma no Android. Também podes manter pressionada a tela inicial e escolher **Widgets → Protocolo → Próximos eventos**.

O widget mostra os três próximos eventos e abre o evento tocado. A agenda atualiza o widget ao criar, editar, apagar ou importar eventos. O sistema também o atualiza periodicamente e após eventos, reinício e mudanças do relógio/fuso horário.

A antecedência é configurável: 10 minutos, 30 minutos, 1 hora ou 1 dia. Eventos sem hora são considerados às 09:00 para os lembretes e continuam visíveis no widget até ao fim do dia. Um evento criado dentro da janela de antecedência recebe um aviso próximo da criação, se ainda não começou. Avisos já enviados não se repetem ao marcar tarefas ou reabrir o app. Alterar a data/hora permite um novo aviso; apagar o evento cancela o aviso pendente e remove a notificação antiga.

Os lembretes usam o relógio/fuso do celular. Funcionam sem o app aberto, mas o aparelho precisa estar ligado. Se usares **Forçar parada**, o Android bloqueia a execução até reabrires o app. Restrições de bateria e a falta de acesso a alarmes exatos podem afetar o horário.

O mínimo do APK é Android 8.0/API 26. O Android System WebView deve estar atualizado. O APK pessoal distribuído tem depuração desativada.

## Compilar no Linux/Codex

Prérequisitos: Python 3, Java com o módulo `jdk.compiler` (JDK 17+ recomendado) e as ferramentas oficiais do Android SDK. A compilação padrão não precisa de Gradle nem de dependências pagas.

```bash
cd /workspace/PROTOCOLO
python3 android/tools/install_sdk.py
python3 android/tools/test_logic.py
node --test tests/logic.test.cjs
python3 android/tools/build.py
```

O instalador descarrega `platforms;android-35` e `build-tools;35.0.0` de `dl.google.com`, valida tamanho e checksum contra os metadados oficiais via HTTPS e escreve em `/workspace/android-tools/sdk`. Não desativa TLS ou verificação de artefactos. Usa `--sdk /outro/caminho` em ambos os scripts para mudar esse diretório.

O APK fica em `android/dist/Protocolo.apk`. O script compila recursos/Java/DEX, alinha o APK, assina-o e verifica a assinatura e o alinhamento. `--debug` gera uma variante separada para testar WebView por ADB; essa variante não deve ser distribuída.

A primeira compilação cria a chave de assinatura em `/workspace/.protocolo-android-signing`, fora do Git, com permissões privadas. `PROTOCOLO_SIGNING_DIR` permite usar uma pasta de assinatura já existente. **Guarda a chave e o ficheiro de senha em segurança: todas as atualizações precisam da mesma chave para manter os dados do APK instalado.** Nunca publiques esses ficheiros. O script recusa uma pasta em que falta a chave ou a senha; não substitui material existente.

Os dados pessoais de teste e as chaves não entram no APK. Os assets são apenas `index.html`, `manifest.webmanifest`, `css/`, `js/` e `icons/` do repositório; o APK não inclui a pasta de compilação, SDK ou backups.

## Testes

`python3 android/tools/test_logic.py` verifica fusos horários, horário de verão, datas inválidas, eventos sem hora, antecedência, eventos passados e identidade dos avisos. Os testes web em `tests/logic.test.cjs` continuam independentes.

Num emulador/dispositivo, verifica também:

- permissões negadas e concedidas, incluindo acesso a alarmes exatos;
- criação, alteração e exclusão de um evento, sem avisos duplicados;
- aviso com o app em segundo plano e abertura do evento pela notificação;
- inclusão/atualização do widget e abertura dos seus eventos;
- exportação/importação pelo seletor nativo de documentos;
- instalação de atualização assinada pela mesma chave sem perder dados.

O projeto também inclui os ficheiros Gradle para manutenção no Android Studio. A distribuição pessoal deste ambiente usa o script acima e a chave preservada, sem publicação em loja.
