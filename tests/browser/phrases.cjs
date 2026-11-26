const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.addInitScript(() => {
      window.phraseCalls = [];
      const status = { enabled: false, notificationsAllowed: false, exactAllowed: false, next: 0 };
      function refresh() {
        queueMicrotask(() => dispatchEvent(new CustomEvent('protocolo-native-status', { detail: {} })));
      }
      window.ProtocoloNative = {
        getStatus: () => JSON.stringify({ enabled: false, notificationsAllowed: false, leadMinutes: 30 }),
        getPhraseStatus: () => JSON.stringify(status),
        setAppearance() {}, syncAgenda() {}, syncActivities() {},
        syncPhrases(payload) {
          const value = JSON.parse(payload);
          phraseCalls.push(value);
          status.enabled = value.enabled;
          status.next = value.enabled ? Date.now() + 3600000 : 0;
          refresh();
        },
        requestPhraseNotifications() { status.notificationsAllowed = true; refresh(); },
        requestExactAlarms() { status.exactAllowed = true; refresh(); },
        testPhraseNotification() { window.phraseTestRequested = true; }
      };
    });
    await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded' });
    const original = await page.evaluate(() => {
      const key = 'protocolo:v1:state';
      const state = JSON.parse(localStorage.getItem(key));
      state.phrases = { enabled: true, items: [{ id: 'legacy-a', text: 'Um passo de cada vez.' }] };
      state.agenda = [{ id: 'event-test', date: '2099-01-01', title: 'Evento guardado', time: '12:00' }];
      state.shoppingLists = [{ id: 'test', name: 'Lista guardada', items: [{ id: 'item', text: 'Arroz', done: true }] }];
      state.planos.push({ id: 'saved-plan', title: 'Plano guardado', fases: [], chips: [] });
      state.recentPages = ['agenda', 'compras', 'planos'];
      state.estudoMaterias = [{ id: 'ing', name: 'Inglês', color: '#4ade80' }, { id: 'his', name: 'História', color: '#60a5fa' }];
      state.estudoLog = [
        { id: 'a', date: '2026-11-24', materia: 'Inglês', minutos: 35 },
        { id: 'b', date: '2026-11-24', materia: 'História', minutos: 25 },
        { id: 'c', date: '2026-11-25', materia: 'História', minutos: 90 }
      ];
      localStorage.setItem(key, JSON.stringify(state));
      return state;
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#recentPagesList [data-page-destination]').count(), 0);
    await page.locator('.tabbtn[data-tab=vida]').click();
    for (const section of ['agenda', 'compras', 'planos']) {
      assert.equal(await page.locator('[data-vida-go='+section+'],[data-page-destination='+section+']').count(), 0);
    }
    await page.locator('[data-vida-go=estudos]').click();
    await page.locator('#estudoPeriodBox [data-p=total]').click();
    assert.equal(await page.locator('.study-chart svg').count(), 2);
    assert.deepEqual(await page.locator('.study-chart').first().locator('title').allTextContents().then(t => t.map(s => s.split(' · ').at(-1))), ['60 min', '90 min']);
    assert.ok((await page.locator('.study-chart').last().locator('title').allTextContents()).some(text => /História.*25 min/.test(text)));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator('#vida-estudos [data-vida-back]').click();

    await page.locator('[data-vida-go=frases]').click();
    const root = page.locator('#phraseRoot');
    const toggle = root.locator('[data-phrase-toggle]');
    assert.equal(await root.locator('blockquote').textContent(), 'Um passo de cada vez.');
    assert.equal(await toggle.isEnabled(), false);
    assert.equal(await page.evaluate(() => phraseCalls.at(-1).enabled), false);
    await root.getByRole('button', { name: 'Editar frase' }).click();
    await root.locator('[name=day][value="1"]').check();
    await root.locator('[name=day][value="4"]').check();
    await root.locator('input[type=time]').first().fill('07:10');
    await root.getByRole('button', { name: 'Adicionar horário' }).click();
    await root.locator('input[type=time]').last().fill('18:35');
    await root.getByRole('button', { name: 'Guardar', exact: true }).click();
    await page.waitForFunction(() => phraseCalls.at(-1).enabled);
    assert.deepEqual(await page.evaluate(() => phraseCalls.at(-1)), {
      enabled: true, items: [{ text: 'Um passo de cada vez.', days: [1, 4], times: ['07:10', '18:35'] }]
    });
    await toggle.click();
    await toggle.click();
    assert.match(await root.locator('[data-phrase-status]').textContent(), /Próxima frase/);
    await root.getByRole('button', { name: 'Enviar teste' }).click();
    assert.equal(await page.evaluate(() => window.phraseTestRequested), true);
    await root.getByRole('button', { name: 'Permitir horário exato' }).click();
    assert.equal(await root.locator('[data-phrase-exact]').isHidden(), true);

    await root.getByRole('textbox', { name: 'Frase', exact: true }).fill('Rever o progresso.');
    await root.locator('[name=day][value="7"]').check();
    await root.locator('input[type=time]').first().fill('20:00');
    await root.getByRole('button', { name: 'Adicionar frase' }).click();
    assert.deepEqual(await page.evaluate(() => phraseCalls.at(-1).items[1]), {
      text: 'Rever o progresso.', days: [7], times: ['20:00']
    });
    await root.getByRole('textbox', { name: 'Frase', exact: true }).fill('Rever o progresso.');
    await root.getByRole('button', { name: 'Adicionar frase' }).click();
    assert.equal(await root.locator('.phrase-row').count(), 2);

    const backup = await page.evaluate(() => PDFVault.pack(JSON.parse(localStorage.getItem('protocolo:v1:state'))));
    for (const key of ['agenda', 'shoppingLists', 'planos', 'estudoLog']) assert.deepEqual(backup[key], original[key]);
    assert.deepEqual(backup.phrases.items[0], { id: 'legacy-a', text: 'Um passo de cada vez.', days: [1, 4], times: ['07:10', '18:35'] });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.evaluate(() => dispatchEvent(new CustomEvent('protocolo-open-event', { detail: { id: 'phrases' } })));
    assert.equal(await page.locator('#vida-frases.active').count(), 1);
    assert.deepEqual(await root.locator('.phrase-row small').allTextContents(), ['Seg, Qui · 07:10, 18:35', 'Dom · 20:00']);
    await root.getByRole('button', { name: 'Apagar frase' }).first().click();
    await page.locator('#confirmOkBtn').click();
    assert.equal(await root.locator('.phrase-row').count(), 1);
    assert.equal(await page.evaluate(() => phraseCalls.at(-1).enabled), true);
    await root.getByRole('button', { name: 'Apagar frase' }).click();
    await page.locator('#confirmOkBtn').click();
    assert.equal(await root.locator('.phrase-row').count(), 0);
    assert.equal(await page.evaluate(() => phraseCalls.at(-1).enabled), false);
    assert.deepEqual(errors, []);
    console.log('PASS menus, study charts, scheduled phrases, legacy data, backup and Android bridge simulation');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
