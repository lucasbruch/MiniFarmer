// Captures README screenshots. Run from the project root:
//   npx electron tools/capture.js
// Uses a throwaway user-data dir so the demo farm doesn't touch your real save.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.setPath('userData', path.join(app.getPath('temp'), 'minifarmer-capture-' + Date.now()));

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'docs');

app.whenReady().then(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const win = new BrowserWindow({
    width: 580, height: 680, useContentSize: true, frame: false, resizable: false,
    webPreferences: { preload: path.join(ROOT, 'preload.js'), contextIsolation: true, backgroundThrottling: false },
  });
  await win.loadFile(path.join(ROOT, 'index.html'));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const js = (code) => win.webContents.executeJavaScript(code);
  const shot = async (name) => {
    for (let tries = 0; tries < 6; tries++) {
      const buf = (await win.webContents.capturePage()).toPNG();
      if (buf.length > 1000) { fs.writeFileSync(path.join(OUT, name), buf); console.log('saved docs/' + name + ' (' + buf.length + ' bytes)'); return; }
      await sleep(600);
    }
    console.error('FAILED to capture ' + name);
  };
  const wheel = (dir, n, fx = 0.5, fy = 0.5) => js(`(() => { const c=document.getElementById('c'), b=c.getBoundingClientRect(); for(let i=0;i<${n};i++) c.dispatchEvent(new WheelEvent('wheel',{deltaY:${dir},clientX:b.left+b.width*${fx},clientY:b.top+b.height*${fy},bubbles:true,cancelable:true})); return 1; })()`);

  // 1) gameplay close-up: wait for wheat to ripen/harvest, zoom onto the Home Farm + its field
  await sleep(70000);
  await wheel(-100, 4, 0.22, 0.24);
  await sleep(800);
  await shot('screenshot-farm.png');

  // 2) full parcel map
  await wheel(100, 22);
  await sleep(700);
  await shot('screenshot-map.png');

  // 3) market panel (silo has stock by now)
  await sleep(6000);
  await js(`document.getElementById('siloChip').click()`);
  await sleep(600);
  await shot('screenshot-market.png');

  app.quit();
});
