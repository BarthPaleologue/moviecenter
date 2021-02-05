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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
let dataPath = `${process.env.APPDATA}/moviecenter/userData`;
let catalogPath = `${dataPath}/catalog.json`;
let settingsPath = `${dataPath}/settings.json`;
function loadCatalog() {
    document.getElementById("loading").style.opacity = "1";
    fs.readFile(catalogPath, (err, file) => {
        let catalog = JSON.parse(String(file));
        let container = document.getElementById("catalog");
        container.innerHTML = "";
        for (let film in catalog) {
            if (film.length > 0) {
                let filmContainer = document.createElement("div");
                filmContainer.setAttribute("class", "film-container");
                filmContainer.setAttribute("style", `background-image: url(${catalog[film].thumbnail});`);
                filmContainer.setAttribute("title", film);
                let filmUI = document.createElement("div");
                filmUI.setAttribute("class", "film-ui");
                let favButton = document.createElement("div");
                favButton.setAttribute("class", "favorite");
                if (catalog[film].isFavorite)
                    favButton.classList.add("full");
                else
                    favButton.classList.add("empty");
                favButton.addEventListener("click", () => {
                    favButton.classList.toggle("empty");
                    favButton.classList.toggle("full");
                    electron_1.ipcRenderer.send("toggleFavorite", film);
                });
                let openFolderButton = document.createElement("div");
                openFolderButton.setAttribute("class", "open");
                openFolderButton.addEventListener("click", () => {
                    electron_1.ipcRenderer.send("open-folder", catalog[film].path);
                });
                let watchButton = document.createElement("p");
                watchButton.setAttribute("class", "watch");
                watchButton.innerText = "Watch";
                watchButton.addEventListener("click", () => {
                    electron_1.ipcRenderer.send("open-film", catalog[film].path);
                });
                filmUI.appendChild(favButton);
                filmUI.appendChild(openFolderButton);
                filmUI.appendChild(watchButton);
                filmContainer.appendChild(filmUI);
                container === null || container === void 0 ? void 0 : container.appendChild(filmContainer);
            }
        }
        document.getElementById("loading").style.opacity = "0";
    });
}
function loadSettings() {
    fs.readFile(settingsPath, (err, file) => {
        let settings = JSON.parse(String(file));
        document.getElementById("fullscreen").checked = settings.fullscreen;
    });
}
loadSettings();
electron_1.ipcRenderer.on("scan-finished", () => {
    //alert("Scan terminé !");
    loadCatalog();
});
electron_1.ipcRenderer.on("load-catalog", () => {
    //alert("Chargement du catalogue");
    loadCatalog();
});
electron_1.ipcRenderer.on("exploring", (e, currentFolder) => {
    document.getElementById("loading").innerHTML = "Exploring " + currentFolder;
});
(_a = document.getElementById("scan")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    electron_1.ipcRenderer.send("scan");
});
(_b = document.getElementById("menu-icon")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    document.querySelector("nav").style.left = "0px";
    document.getElementById("anti-click").style.opacity = "1";
    document.getElementById("anti-click").style.pointerEvents = "visible";
});
document.getElementById("anti-click").addEventListener("click", () => {
    document.querySelector("nav").style.left = "-200px";
    document.getElementById("anti-click").style.opacity = "0";
    document.getElementById("anti-click").style.pointerEvents = "none";
    document.getElementById("settings").style.opacity = "0";
    document.getElementById("settings").style.pointerEvents = "none";
});
(_c = document.getElementById("showAll")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
    document.querySelectorAll(".film-container").forEach((elm, index) => {
        elm.style.display = "block";
    });
});
(_d = document.getElementById("showFavorites")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
    document.querySelectorAll(".film-container").forEach((elm, index) => {
        var _a;
        let element = elm;
        if ((_a = element.querySelector(".favorite")) === null || _a === void 0 ? void 0 : _a.classList.contains("empty")) {
            element.style.display = "none";
        }
    });
});
(_e = document.getElementById("options")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => {
    var _a;
    if (((_a = document.getElementById("settings")) === null || _a === void 0 ? void 0 : _a.style.opacity) == "1") {
        document.getElementById("settings").style.opacity = "0";
        document.getElementById("settings").style.opacity = "none";
    }
    else {
        document.getElementById("settings").style.opacity = "1";
        document.getElementById("settings").style.pointerEvents = "painted";
    }
});
(_f = document.getElementById("fullscreen")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => {
    electron_1.ipcRenderer.send("toggleFullscreen");
});
(_g = document.getElementById("resetCatalog")) === null || _g === void 0 ? void 0 : _g.addEventListener("click", () => {
    document.getElementById("loading").style.opacity = "1";
    electron_1.ipcRenderer.send("resetCatalog");
});
(_h = document.getElementById("reloadThumbnails")) === null || _h === void 0 ? void 0 : _h.addEventListener("click", () => {
    document.getElementById("loading").style.opacity = "1";
    electron_1.ipcRenderer.send("resetThumbnails");
});
(_j = document.getElementById("reloadCatalog")) === null || _j === void 0 ? void 0 : _j.addEventListener("click", () => {
    document.getElementById("loading").style.opacity = "1";
    electron_1.ipcRenderer.send("reloadCatalog");
});
(_k = document.getElementById("cross")) === null || _k === void 0 ? void 0 : _k.addEventListener("click", () => {
    document.getElementById("settings").style.opacity = "0";
    document.getElementById("settings").style.pointerEvents = "none";
});
(_l = document.getElementById("searchbar")) === null || _l === void 0 ? void 0 : _l.addEventListener("input", () => {
    var _a;
    let query = (_a = document.getElementById("searchbar")) === null || _a === void 0 ? void 0 : _a.value;
    document.querySelectorAll(".film-container").forEach((elm, index) => {
        var _a;
        let element = elm;
        if (!((_a = element.getAttribute("title")) === null || _a === void 0 ? void 0 : _a.includes(query.toLowerCase()))) {
            element.style.display = "none";
        }
        else {
            element.style.display = "block";
        }
    });
});
(_m = document.getElementById("quit")) === null || _m === void 0 ? void 0 : _m.addEventListener("click", () => {
    electron_1.ipcRenderer.send("quit");
});
