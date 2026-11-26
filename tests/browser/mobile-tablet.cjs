const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const phone = devices['Pixel 7'];
    const configurations = [
      { ...phone, viewport: { width: 360, height: 800 } },
      { ...phone, viewport: { width: 800, height: 360 } },
      { ...phone, viewport: { width: 800, height: 1280 }, deviceScaleFactor: 2 },
      { ...phone, viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }
    ];
    for (const config of configurations) {
      const context = await browser.newContext({ ...config, serviceWorkers: 'block' });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('https://fonts.googleapis.com/**', route => route.abort());
        await page.goto('http://127.0.0.1:8080', { waitUntil: 'domcontentloaded' });
        const previous = await page.evaluate(() => {
          const key = 'protocolo:v1:state';
          const state = JSON.parse(localStorage.getItem(key));
          state.notebooks = [{ id: 'saved', title: 'Caderno guardado', notes: [{ id: 'note', title: 'Nota', text: 'Dados guardados' }] }];
          state.weeklyRouteTabId = 'plano-rota-china';
          state.recentPages = ['china', 'caderno', 'agenda', 'compras', 'planos'];
          state.estudoMaterias = [{ id: 'eng', name: 'Inglês', color: '#4ade80' }];
          state.estudoLog = [{ id: 's', date: '2026-11-26', materia: 'Inglês', minutos: 45 }];
          localStorage.setItem(key, JSON.stringify(state));
          return { notebooks: state.notebooks, planos: state.planos };
        });
        await page.reload({ waitUntil: 'domcontentloaded' });

        const menu = page.locator('#workspaceMenu');
        if (await menu.isVisible()) await menu.tap();
        await page.locator('.tabbtn[data-tab=vida]').tap();
        assert.equal(await page.locator('#vida-hub.active').count(), 1);
        assert.equal(await page.locator('#railNotebooks,#openJournal,#dashOpenChina,#dashOpenNotebooks').count(), 0);
        assert.equal(await page.locator('[data-page-destination=china],[data-page-destination=caderno]').count(), 0);
        await page.locator('.workspace-search:visible').first().tap();
        for (const term of ['China', 'Cadernos', 'Agenda', 'Compras', 'Planos futuros']) {
          await page.locator('#pageSearch input').fill(term);
          assert.equal(await page.locator('#pageSearch [data-page-destination]').count(), 0);
        }
        await page.locator('#pageSearch input').fill('Estudos');
        await page.locator('#pageSearch [data-page-destination=estudos]').tap();
        await page.locator('#estudoPeriodBox [data-p=total]').tap();
        assert.equal(await page.locator('.study-chart svg').count(), 2);
        assert.ok((await page.locator('.study-chart').first().locator('title').textContent()).endsWith('45 min'));
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.locator('#vida-estudos [data-vida-back]').tap();
        await page.locator('[data-vida-go=frases]').tap();
        assert.equal(await page.locator('#phraseRoot [name=day]').count(), 7);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        const backup = await page.evaluate(() => PDFVault.pack(JSON.parse(localStorage.getItem('protocolo:v1:state'))));
        assert.deepEqual(backup.notebooks, previous.notebooks);
        assert.deepEqual(backup.planos, previous.planos);
        assert.deepEqual(errors, []);
        console.log('PASS mobile/tablet', config.viewport.width, config.viewport.height);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
