import { app, BrowserWindow } from "electron";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

let springBootProcess;
let mainWindow;
let isSpringReady = false;

const SPRING_PORT = 8080;
const START_URL = `http://localhost:${SPRING_PORT}`;

const getAssetPath = (assetName) => {
  return app.isPackaged
    ? path.join(process.resourcesPath, assetName)
    : path.join(app.getAppPath(), assetName);
};
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,

    autoHideMenuBar: true,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.loadURL(START_URL);
  });
}

function startBackend() {
  const jarPath = getAssetPath("backend.jar");

  console.log(`[INFO] Spring Boot JAR yolu: ${jarPath}`);

  springBootProcess = spawn("java", ["-jar", jarPath], {
    cwd: app.isPackaged ? process.resourcesPath : app.getAppPath(),
    shell: true,
  });

  springBootProcess.stdout.on("data", (data) => {
    const dataString = data.toString();
    console.log(`[Spring Boot STDOUT]: ${dataString.trim()}`);

    if (!isSpringReady && dataString.includes("Tomcat started on port")) {
      isSpringReady = true;
      console.log("[INFO] Spring Boot BAŞLADI. Pencere oluşturuluyor...");
      createWindow();
    }
  });

  springBootProcess.stderr.on("data", (data) => {
    fs.appendFileSync(
      path.join(app.getPath("userData"), "spring-error.log"),
      data.toString()
    );
  });

  springBootProcess.on("error", (err) => {
    console.error(`[FATAL] Spring Boot başlatılamadı: ${err.message}`);
    app.quit();
  });

  springBootProcess.on("close", (code) => {
    console.log(`[INFO] Spring Boot Süreci sonlandı. Çıkış kodu: ${code}`);

    if (code !== 0 && code !== null) {
      // app.quit();
    }
  });
}

app.whenReady().then(() => {
  startBackend();

  // macOS'te dock ikonuna tıklanınca yeniden açılma
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0 && isSpringReady) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // macOS dışındaki platformlarda uygulamayı kapat.
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function killSpring() {
  if (!springBootProcess) return;

  if (process.platform === "win32") {
    // Windows
    spawn("taskkill", ["/PID", springBootProcess.pid, "/T", "/F"]);
  } else {
    // Linux / macOS
    try {
      process.kill(-springBootProcess.pid); // process group kill
    } catch (e) {
      console.error("Kill error:", e);
    }
  }
}

app.on("quit", () => {
  killSpring();
});
