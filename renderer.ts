import { ipcRenderer } from "electron";
import * as fs from "fs";

let dataPath = "";
if (process.platform == "win32") dataPath = `${process.env.APPDATA}/moviecenter/userData`;
else if (process.platform == "linux") dataPath = `${process.env.HOME}/.config/moviecenter/userData`;

let catalogPath = `${dataPath}/catalog.json`;
let settingsPath = `${dataPath}/settings.json`;

function loadCatalog() {
    document.getElementById("loading")!.style.opacity = "1";
    fs.readFile(catalogPath, (err, file) => {
        let catalog = JSON.parse(String(file));
        let container = document.getElementById("catalog");
        container!.innerHTML = "";
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
                if (catalog[film].isFavorite) favButton.classList.add("full");
                else favButton.classList.add("empty");
                favButton.addEventListener("click", () => {
                    favButton.classList.toggle("empty");
                    favButton.classList.toggle("full");
                    ipcRenderer.send("toggleFavorite", film);
                });

                let openFolderButton = document.createElement("div");
                openFolderButton.setAttribute("class", "open");
                openFolderButton.addEventListener("click", () => {
                    ipcRenderer.send("open-folder", catalog[film].path);
                });

                let watchButton = document.createElement("p");
                watchButton.setAttribute("class", "watch");
                watchButton.innerText = "Watch";
                watchButton.addEventListener("click", () => {
                    ipcRenderer.send("open-film", catalog[film].path);
                });

                filmUI.appendChild(favButton);
                filmUI.appendChild(openFolderButton);
                filmUI.appendChild(watchButton);

                filmContainer.appendChild(filmUI);

                container?.appendChild(filmContainer);
            }
        }
        document.getElementById("loading")!.style.opacity = "0";
    });
}

function loadSettings() {
    fs.readFile(settingsPath, (err, file) => {
        let settings = JSON.parse(String(file));
        (<HTMLFormElement>document.getElementById("fullscreen")).checked = settings.fullscreen;
    });
}
loadSettings();

ipcRenderer.on("scan-finished", () => {
    //alert("Scan terminé !");
    loadCatalog();
});

ipcRenderer.on("load-catalog", () => {
    //alert("Chargement du catalogue");
    loadCatalog();
});

ipcRenderer.on("exploring", (e, currentFolder: string) => {
    document.getElementById("loading")!.innerHTML = "Exploring " + currentFolder;
});

document.getElementById("scan")?.addEventListener("click", () => {
    ipcRenderer.send("scan");
});

document.getElementById("menu-icon")?.addEventListener("click", () => {
    document.querySelector("nav")!.style.left = "0px";
    document.getElementById("anti-click")!.style.opacity = "1";
    document.getElementById("anti-click")!.style.pointerEvents = "visible";
});

document.getElementById("anti-click")!.addEventListener("click", () => {
    document.querySelector("nav")!.style.left = "-200px";
    document.getElementById("anti-click")!.style.opacity = "0";
    document.getElementById("anti-click")!.style.pointerEvents = "none";
    document.getElementById("settings")!.style.opacity = "0";
    document.getElementById("settings")!.style.pointerEvents = "none";
});

document.getElementById("showAll")?.addEventListener("click", () => {
    document.querySelectorAll(".film-container").forEach((elm, index) => {
        (<HTMLElement>elm).style.display = "block";
    });
});

document.getElementById("showFavorites")?.addEventListener("click", () => {
    document.querySelectorAll(".film-container").forEach((elm, index) => {
        let element = <HTMLElement>elm;
        if (element.querySelector(".favorite")?.classList.contains("empty")) {
            element.style.display = "none";
        }
    });
});

document.getElementById("options")?.addEventListener("click", () => {
    if (document.getElementById("settings")?.style.opacity == "1") {
        document.getElementById("settings")!.style.opacity = "0";
        document.getElementById("settings")!.style.opacity = "none";
    } else {
        document.getElementById("settings")!.style.opacity = "1";
        document.getElementById("settings")!.style.pointerEvents = "painted";
    }
});

document.getElementById("fullscreen")?.addEventListener("click", () => {
    ipcRenderer.send("toggleFullscreen");
});

document.getElementById("resetCatalog")?.addEventListener("click", () => {
    document.getElementById("loading")!.style.opacity = "1";
    ipcRenderer.send("resetCatalog");
});
document.getElementById("reloadThumbnails")?.addEventListener("click", () => {
    document.getElementById("loading")!.style.opacity = "1";
    ipcRenderer.send("resetThumbnails");
});
document.getElementById("reloadCatalog")?.addEventListener("click", () => {
    document.getElementById("loading")!.style.opacity = "1";
    ipcRenderer.send("reloadCatalog");
});
document.getElementById("cross")?.addEventListener("click", () => {
    document.getElementById("settings")!.style.opacity = "0";
    document.getElementById("settings")!.style.pointerEvents = "none";
});

document.getElementById("searchbar")?.addEventListener("input", () => {
    let query = (<HTMLInputElement>document.getElementById("searchbar"))?.value;
    document.querySelectorAll(".film-container").forEach((elm, index) => {
        let element = <HTMLElement>elm;
        if (!element.getAttribute("title")?.includes(query.toLowerCase())) {
            element.style.display = "none";
        } else {
            element.style.display = "block";
        }
    });
});

document.getElementById("quit")?.addEventListener("click", () => {
    ipcRenderer.send("quit");
});