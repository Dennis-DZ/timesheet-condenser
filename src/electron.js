import { app, BrowserWindow } from 'electron';

const createWindow = () => {
  const win = new BrowserWindow();

  win.loadFile('dist/index.html');
  win.setMenuBarVisibility(false);
  win.maximize();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
