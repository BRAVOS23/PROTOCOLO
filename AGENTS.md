# Protocolo — manutenção

O app é pessoal, offline e sem serviços pagos. Usa o checkout existente; não cries worktrees sem pedido explícito.

## Assinatura Android

- A instalação atual chama-se **Protocolo**, linha 3.x, applicationId `app.protocolo.personal`. O namespace Java/recursos é `app.protocolo.android`.
- Nunca geres outra chave, alteres o applicationId, mudes a impressão digital de `android/signing-certificate.sha256` ou peças para desinstalar o app para contornar um erro. Uma nova identidade exige instrução explícita do utilizador.
- A chave privada pertence ao utilizador. No GitHub, fica exclusivamente nos Actions Secrets `ANDROID_KEYSTORE_BASE64` e `ANDROID_KEYSTORE_PASSWORD`. Localmente, usa `PROTOCOLO_SIGNING_DIR` ou `/workspace/.protocolo-personal-signing`.
- Não publiques, imprimas ou incluas chaves/senhas nos assets, commits, artefactos ou logs. O backup privado deve ficar fora do checkout.
- Uma pasta de assinatura ausente num ambiente novo não significa que o app precise de outra chave. Usa o workflow assinado ou restaura o backup original. Explica qualquer bloqueio real de permissões.

A mudança para `app.protocolo.personal` e uma nova assinatura foi autorizada explicitamente pelo utilizador em 17/10/2026, após confirmar a perda da chave anterior. Não voltes a trocar a identidade. Os APKs legados `downloads/Protocolo.apk` e `downloads/Protocolo-Novo.apk` ficam preservados. O download atual é `downloads/Protocolo-Pessoal.apk`.

## Atualizações

- Consulta `docs/ANDROID_RELEASES.md` antes de preparar um APK.
- A versão tem uma única origem: `android/release.json`. Incrementa `version_code` e `version_name` numa nova atualização que será publicada.
- `python3 android/tools/build.py --unsigned` compila sem segredos para verificar o código; esse APK não é instalável e não deve ser distribuído.
- O workflow `Gerar APK para o meu celular` produz o APK assinado sem depender deste ambiente. Só corre manualmente a partir de `main`.
- Antes de substituir o download, usa `python3 android/tools/publish_apk.py <APK>`: verifica assinatura, applicationId e versão estritamente superior. Não substituas `downloads/Protocolo.apk`, que é o APK legado.

## Validação e dados

- Lógica: `node --test tests/*.test.cjs`, `python3 android/tools/test_logic.py`, `python3 android/tests/test_release_tools.py`.
- Para alterações na rota semanal, executa `node tests/browser/weekly-route.cjs` com o servidor local, Playwright e Chromium disponíveis. O teste usa um perfil isolado e dados sintéticos.
- Verifica alterações de interface num perfil isolado de browser. Preserva o localStorage e os backups do utilizador.
- Não confundas compilação ou testes com ponte nativa simulada com uma validação de notificações/widget num Android real.
- O site é estático. Para testes locais usa `python3 -m http.server 8080 --bind 127.0.0.1`; não exponhas links de preview localhost.
