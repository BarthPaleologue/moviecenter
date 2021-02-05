"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const catalog_1 = require("./catalog");
let dataPath = `${process.env.APPDATA}/moviecenter/userData`;
let catalogPath = `${dataPath}/catalog.json`;
let settingsPath = `${dataPath}/settings.json`;
if (!fs.existsSync(dataPath))
    fs.mkdirSync(dataPath);
let window = null;
let catalog = new catalog_1.Catalog(catalogPath);
let settings;
electron_1.app.on("ready", () => {
    window = new electron_1.BrowserWindow({
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
    fs.exists(settingsPath, exist => {
        if (exist) {
            fs.readFile(settingsPath, (err, data) => {
                settings = JSON.parse(String(data));
                if (settings.fullscreen)
                    window === null || window === void 0 ? void 0 : window.setFullScreen(true);
            });
        }
        else {
            fs.writeFile(settingsPath, JSON.stringify(defaultSettings), () => { });
        }
    });
    window.loadFile('./web/index.html');
    window.webContents.on('did-finish-load', () => {
        catalog.load();
    });
});
function writeSettings() {
    fs.writeFile(settingsPath, JSON.stringify(settings), () => { });
}
function openFile(filePath) {
    child_process_1.exec(`"${filePath}"`);
}
function openFolder(dirPath) {
    child_process_1.exec(`start "" "${dirPath}"`);
}
electron_1.ipcMain.on("open-film", (e, filmPath) => {
    openFile(filmPath);
});
electron_1.ipcMain.on("open-folder", (e, filmPath) => {
    let path = filmPath.split("/").slice(0, -1).join("/");
    console.log("Opening : ", path, filmPath);
    openFolder(path);
});
electron_1.ipcMain.on("scan", () => {
    let pathes = electron_1.dialog.showOpenDialogSync(window, { properties: ['openDirectory'] });
    if (pathes != undefined) {
        let path = pathes[0].split("\\");
        let targetFolder = path[path.length - 1];
        let path2 = path.slice(0, -1).join("/");
        catalog.getFilmsFromFolder(targetFolder, path2);
    }
    else {
        window.webContents.send("scan-finished");
    }
});
electron_1.ipcMain.on("toggleFavorite", (err, filmName) => {
    catalog.toggleFavorite(filmName);
    catalog.write();
});
electron_1.ipcMain.on("resetCatalog", () => {
    fs.writeFile(catalogPath, "{}", () => { });
});
electron_1.ipcMain.on("resetThumbnails", () => {
    catalog.resetThumbnails();
});
electron_1.ipcMain.on("reloadCatalog", () => {
    catalog.removeDeletedFilms();
    catalog.write(() => window === null || window === void 0 ? void 0 : window.webContents.send("scan-finished"));
});
electron_1.ipcMain.on("toggleFullscreen", () => {
    settings.fullscreen = !settings.fullscreen;
    writeSettings();
});
electron_1.ipcMain.on("quit", () => electron_1.app.quit());
