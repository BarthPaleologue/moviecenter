import * as fs from "fs";
import XRay from "x-ray";
import { isFilm, cleanName } from "./tools";
import { BrowserWindow } from "electron";

interface Film {
    path: string,
    thumbnail: string,
    isFavorite: boolean;
}

export class Catalog {
    films: { [name: string]: Film; } = {};
    path: string;
    filmStack = 0;
    window: BrowserWindow | null = null;
    constructor(catalogPath: string) {
        this.path = catalogPath;
    }
    linkWithWindow(window: BrowserWindow) {
        this.window = window;
    }
    add(filmName: string, path: string) {
        if (this.films[filmName] != undefined && this.films[filmName].thumbnail != "") {
            this.films[filmName].path = path;
        } else {
            this.films[filmName] = {
                path: path,
                thumbnail: "",
                isFavorite: false
            };
            this.requestFilmMiniature(filmName);
        }
    }
    load() {
        console.log("Loading catalog...");
        fs.access(this.path, error => {
            if (error == null) {
                this.window!.webContents.send("load-catalog");
                fs.readFile(this.path, (err, data) => {
                    this.films = JSON.parse(String(data));
                });
                console.log("Catalog loaded");
            } else {
                console.log("No catalog found");
            }
        });
    }
    write(callback: Function = () => { }) {
        let str = "{";
        for (let film in this.films) {
            console.log(film);
            str += `"${film}": {
            "path": "${this.films[film].path}",
            "thumbnail": "${this.films[film].thumbnail}",
            "isFavorite": ${this.films[film].isFavorite}
        },\n`;
        }
        str = str.slice(0, -2);
        str += "}";
        fs.writeFile(this.path, str, err => {
            console.log(err);
            callback();
        });
    }
    toggleFavorite(filmName: string) {
        this.films[filmName].isFavorite = !this.films[filmName].isFavorite;
    }
    getFilmsFromFolder(directoryName: string, root: string) {
        this.window!.webContents.send("exploring", `${root}/${directoryName}`);
        fs.readdir(`${root}/${directoryName}`, (err, files) => {
            files.forEach(file => {
                (async () => {
                    let path = `${root}/${directoryName}/${file}`;
                    let stat = await fs.promises.lstat(path);
                    if (stat.isDirectory()) this.getFilmsFromFolder(file, `${root}/${directoryName}`);
                    else {
                        if (isFilm(file)) {
                            this.add(cleanName(file), path);
                            console.log(this.filmStack);
                        }
                    }
                })().catch(console.error);
            });
            /*if (this.filmStack == 0) {
                this.write(() => this.window!.webContents.send("scan-finished"));
            }*/
        });
    }
    removeDeletedFilms() {
        for (let film in this.films) {
            if (!fs.existsSync(this.films[film].path)) {
                delete this.films[film];
            }
        }
    }
    resetThumbnails() {
        for (let film in this.films) {
            this.requestFilmMiniature(film);
        }
    }
    requestFilmMiniature(filmName: string) {
        this.filmStack += 1;
        this.getNthGoogleImageResultURL(filmName, 0, (url: string) => {
            this.films[filmName].thumbnail = url;
            console.log(this.films[filmName]);
        });
    }
    getNthGoogleImageResultURL(q: string, n: number, callback: Function) {
        let url = "placeholder";
        let query = (q).split(" ").join("+");
        query = query.substr(0, query.length - 1);
        let x = XRay();

        x(`https://www.google.co.in/search?q=${query}&source=lnms&tbm=isch`, "body@html")((err, data) => {
            let body = data;
            try {
                let imageElm = body.split("img")[2 + n];

                let imageURL = imageElm.split("src=")[1].split("\"")[1];
                url = imageURL;
                callback(url);
            } catch (e) { console.error(e); };
            this.filmStack -= 1;
            console.log(this.filmStack);
            if (this.filmStack == 0) {
                this.write(() => this.window!.webContents.send("scan-finished"));
            }
        });
    }
}