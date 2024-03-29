import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as fs from "fs";
import { exec } from "child_process";
import { Catalog } from "./catalog";

let dataPath = "";
if (process.platform == "win32") dataPath = `${process.env.APPDATA}/moviecenter/userData`;
else if (process.platform == "linux") dataPath = `${process.env.HOME}/.config/moviecenter/userData`;

let catalogPath = `${dataPath}/catalog.json`;
let settingsPath = `${dataPath}/settings.json`;

console.log("storing data in: " + dataPath);

if (!fs.existsSync(dataPath)) {
    console.log("data folder does not exist, creating...");
    fs.mkdirSync(dataPath);
}

interface Settings {
    fullscreen: boolean;
}

let window: BrowserWindow | null = null;
let catalog = new Catalog(catalogPath);
let settings: Settings;

app.on("ready", () => {
    window = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        darkTheme: true,
        title: "Movie Center",
        fullscreen: false,
        icon: "./images/icon.png"
    });
    let defaultSettings = {
        "fullscreen": false,
    };
    catalog.linkWithWindow(window);

    console.log("loading settings...");
    fs.access(settingsPath, error => {

        // lecture des paramètres
        if (error == null) {
            fs.readFile(settingsPath, (err, data) => {
                settings = JSON.parse(String(data));
                if (settings.fullscreen) window?.setFullScreen(true);
                console.log("settings loaded and applied successfully");
            });
        } else {
            // écriture des paramètres par défaut
            console.log("settings file does not exist, creating...");
            fs.writeFile(settingsPath, JSON.stringify(defaultSettings), () => { });
        }
    });

    console.log("loading home page...");
    window.loadFile('./web/index.html');
    console.log("home page loaded");

    window.webContents.on('did-finish-load', () => {
        catalog.load();
    });

});

function writeSettings() {
    fs.writeFile(settingsPath, JSON.stringify(settings), () => { });
}

function openFile(filePath: string) {
    if (process.platform == "win32") exec(`"${filePath}"`);
    else exec(`xdg-open "${filePath}"`);
}

function openFolder(dirPath: string) {
    if (process.platform == "win32") exec(`start "" "${dirPath}"`);
    else exec(`xdg-open "${dirPath}"`);
}

ipcMain.on("open-film", (e, filmPath: string) => {
    openFile(filmPath);
});

ipcMain.on("open-folder", (e, filmPath: string) => {
    let path = filmPath.split("/").slice(0, -1).join("/");
    console.log("Opening : ", path, filmPath);
    openFolder(path);
});

ipcMain.on("scan", () => {
    let pathes = dialog.showOpenDialogSync(window!, { properties: ['openDirectory'] });
    if (pathes != undefined) {
        let path = pathes[0].split("\\");
        let targetFolder = path[path.length - 1];
        let path2 = path.slice(0, -1).join("/");
        catalog.getFilmsFromFolder(targetFolder, path2);
    } else {
        window!.webContents.send("scan-finished");
    }
});

ipcMain.on("toggleFavorite", (err, filmName: string) => {
    catalog.toggleFavorite(filmName);
    catalog.write();
});
ipcMain.on("resetCatalog", () => {
    fs.writeFile(catalogPath, "{}", () => { });
});
ipcMain.on("resetThumbnails", () => {
    catalog.resetThumbnails();
});
ipcMain.on("reloadCatalog", () => {
    catalog.removeDeletedFilms();
    catalog.write(() => window?.webContents.send("scan-finished"));
});

ipcMain.on("toggleFullscreen", () => {
    settings.fullscreen = !settings.fullscreen;
    writeSettings();
});

ipcMain.on("quit", () => app.quit());



