# Frases de hora a hora

No APK: **Vida → Frases**. Adiciona pelo menos duas frases diferentes e escolhe **Ativar de hora a hora**. A primeira notificação fica marcada para uma hora depois da ativação. **Enviar teste** envia uma imediatamente, mantendo o horário programado.

O sorteio usa cada frase uma vez por ciclo. Quando a lista acaba, inicia outro ciclo, impedindo que a primeira frase seja igual à última enviada. O ciclo e a última frase ficam guardados no Android, incluindo quando o processo termina ou o aparelho reinicia. Alterar a lista atualiza o sorteio sem adiar o próximo horário. Pausar ou deixar menos de duas frases cancela o envio. Depois de um período com o aparelho desligado, é enviado no máximo um aviso em atraso, seguindo-se uma nova hora; não há uma sequência de avisos acumulados.

As frases e a opção de ativação acompanham Exportar/Importar e a cópia na pasta. Os alarmes e o histórico do sorteio usam preferências privadas locais. Não há conta, servidor ou serviço pago. As notificações de frases têm canal, alarme e permissão de ativação separados dos lembretes da agenda.

No Android 13 ou posterior, é necessário permitir notificações. A permissão de horário exato reduz atrasos durante a suspensão do dispositivo; sem ela, o Android pode adiar avisos. A página mostra o estado e os botões para ajustar estas permissões.

Validação automática: `PhraseCycleTest.java` verifica 10 mil escolhas, ciclos completos, alterações, duplicados e intervalo de uma hora. `tests/browser/phrases.cjs` verifica a biblioteca e a ponte nativa simulada. A compilação confirma as APIs Android utilizadas. A entrega de alarmes com a tela desligada, após reinício e durante a suspensão requer confirmação num aparelho físico; esses cenários não foram executados neste ambiente.
