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
  const shot = async (name) => {
    for (let tries = 0; tries < 6; tries++) {
      const img = await win.webContents.capturePage();
      const buf = img.toPNG();
      if (buf.length > 1000) {
        fs.writeFileSync(path.join(OUT, name), buf);
        console.log('saved docs/' + name + ' (' + buf.length + ' bytes)');
        return;
      }
      await sleep(600);
    }
    console.error('FAILED to capture ' + name);
  };
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  await sleep(9000); // let the starting crew plant a few rows
  await shot('screenshot-farm.png');

  // zoom all the way out for the parcel-map shot
  await win.webContents.executeJavaScript(`(() => {
    const c = document.getElementById('c'); const b = c.getBoundingClientRect();
    for (let i = 0; i < 12; i++) c.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, clientX: b.left + b.width / 2, clientY: b.top + b.height / 2, bubbles: true, cancelable: true }));
    return 1;
  })()`);
  await sleep(800);
  await shot('screenshot-map.png');

  app.quit();
});
