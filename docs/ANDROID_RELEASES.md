# Atualizar o app do teu celular sem perder a assinatura

A assinatura Android permite atualizar o **Protocolo** já instalado (antes chamado **Protocolo Novo**). O nome visível muda na versão 2.1, mantendo a mesma identidade e os dados. O acesso ao GitHub é uma permissão separada. O código pode ser recriado noutro ambiente; a assinatura privada precisa de um armazenamento permanente e de um backup.

A identidade atual fica fixa:

- App: **Protocolo** (anteriormente **Protocolo Novo**) (`app.protocolo.mobile`).
- Impressão digital pública: `android/signing-certificate.sha256`.
- Versão: `android/release.json` — a mesma origem para Python e Gradle.
- Dados pessoais: apenas no celular/browser; não entram no APK gerado.

## Configurar uma vez no GitHub

Usa o ZIP **privado de configuração do GitHub** entregue no chat. Guarda-o num local privado, fora deste repositório. Contém a assinatura atual, a senha e dois ficheiros preparados para os campos abaixo.

1. Abre [Settings → Secrets and variables → Actions](https://github.com/BRAVOS23/PROTOCOLO/settings/secrets/actions).
2. Escolhe **New repository secret**.
3. Nome: `ANDROID_KEYSTORE_BASE64`. Valor: o conteúdo completo de `ANDROID_KEYSTORE_BASE64.txt`, dentro do ZIP privado.
4. Cria outro segredo com nome `ANDROID_KEYSTORE_PASSWORD`. Valor: o conteúdo de `ANDROID_KEYSTORE_PASSWORD.txt`.
5. Guarda também o ZIP privado como backup de recuperação.

Os valores pertencem apenas aos campos de segredo do GitHub. Não os coloques em Issues, commits ou no chat. O ZIP privado não é um backup dos dados do celular: esses continuam a ser exportados em Definições → Exportar dados.

A integração do Codex desta sessão recebeu **HTTP 403 — Resource not accessible by integration** ao aceder a Actions Secrets. A existência dos workflows no repositório não significa que esses dois segredos já estejam configurados. Esta configuração precisa de ser feita pelo proprietário no painel acima ou de uma integração com essa permissão.

## Gerar o APK pelo GitHub

1. Abre [Actions → Gerar APK para o meu celular](https://github.com/BRAVOS23/PROTOCOLO/actions/workflows/android-apk.yml).
2. Escolhe **Run workflow**, branch **main**.
3. Quando terminar, descarrega o artefacto `Protocolo-Novo-…` e extrai `Protocolo-Novo.apk`.
4. Instala por cima do **Protocolo Novo**, sem o desinstalar. Os dados continuam na mesma instalação.

O artefacto inclui apenas o APK, o checksum e a verificação pública. A chave temporária é apagada antes do upload, mesmo se a compilação falhar. O download do artefacto fica disponível por sete dias; o app instalado não expira. Este repositório é público e usa o runner padrão do GitHub, sem Play Store, servidor ou serviço pago.

Se faltar um segredo, a senha estiver errada ou o certificado não corresponder à assinatura atual, a compilação para com uma mensagem. Não é gerada uma chave substituta.

## Preparar uma nova versão

1. Faz e testa a alteração no código.
2. Em `android/release.json`, aumenta `version_code` e atualiza `version_name` (por exemplo, de `1`/`2.0` para `2`/`2.1`). Nunca reduzas o código de versão.
3. Publica essas alterações em `main` e confirma o workflow **Verificar app Android**. Esse workflow compila sem segredos; não entrega um APK instalável.
4. Executa **Gerar APK para o meu celular**. O workflow valida a assinatura antes de gerar o APK.
5. Para atualizar também o link do site, descarrega o APK assinado e executa localmente:

```bash
python3 android/tools/install_sdk.py
python3 android/tools/publish_apk.py /caminho/Protocolo-Novo.apk
```

Esse comando recusa um APK não assinado, com outra identidade, de depuração, ou com versão igual/inferior ao download atual. Depois de passar, revê e faz commit de `downloads/Protocolo-Novo.apk`, do seu `.sha256` e do link atualizado em `index.html`. O GitHub Pages publica o download pelo processo existente. O APK legado `downloads/Protocolo.apk` fica preservado.

## Recuperar a compilação local

Restaura `personal.p12` e `password.txt` do ZIP privado numa pasta fora do Git e com acesso restrito:

```bash
export PROTOCOLO_SIGNING_DIR=/caminho/privado/assinatura
python3 android/tools/signing.py check
python3 android/tools/build.py
```

Não uses PWABuilder, Bubblewrap, uma chave de debug ou um novo applicationId para contornar a falta da assinatura: isso produz outra identidade em vez de uma atualização desta instalação.

Para preparar novamente os dois ficheiros de configuração do GitHub a partir da chave original restaurada:

```bash
python3 android/tools/signing.py export-setup --output /caminho/fora-do-repositorio/Protocolo-Novo-configuracao-GitHub-privada.zip
```
