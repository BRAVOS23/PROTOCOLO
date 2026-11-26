# Frases com horários escolhidos

Em **Vida → Frases**, escreve ou edita uma frase, marca os dias da semana e usa **Adicionar horário** para acrescentar horas. Cada horário aplica-se a todos os dias selecionados para essa frase. Guarda e escolhe **Ativar notificações**. Uma frase agendada já é suficiente. As frases antigas ficam na lista e podem receber os seus próprios horários.

No Android, a página mostra o próximo aviso no fuso horário do aparelho. Frases marcadas para o mesmo momento são agrupadas num aviso. **Enviar teste** mostra a primeira frase agendada e mantém o próximo horário. O Android pode atrasar avisos sem permissão de horário exato. Se o aparelho ficar desligado por um período prolongado, os avisos antigos não são acumulados.

Os textos, dias, horários e o estado da ativação acompanham os dados em **Exportar dados / Importar dados** e na cópia na pasta. O Android usa o canal **Frases**, separado dos lembretes de atividades e agenda.

`PhraseScheduleTest.java` cobre vários horários, dias, virada da semana, horários coincidentes e mudanças de fuso ou de horário de verão. `tests/browser/phrases.cjs` verifica a interface e a ponte Android simulada. A entrega de alarmes em segundo plano requer validação num aparelho Android.
