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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Catalog = void 0;
const fs = __importStar(require("fs"));
const x_ray_1 = __importDefault(require("x-ray"));
const tools_1 = require("./tools");
class Catalog {
    constructor(catalogPath) {
        this.films = {};
        this.filmStack = 0;
        this.window = null;
        this.path = catalogPath;
    }
    linkWithWindow(window) {
        this.window = window;
    }
    add(filmName, path) {
        if (this.films[filmName] != undefined && this.films[filmName].thumbnail != "") {
            this.films[filmName].path = path;
        }
        else {
            this.films[filmName] = {
                path: path,
                thumbnail: "",
                isFavorite: false
            };
            this.requestFilmMiniature(filmName);
        }
    }
    load() {
        fs.exists(this.path, exist => {
            if (exist) {
                this.window.webContents.send("load-catalog");
                fs.readFile(this.path, (err, data) => {
                    this.films = JSON.parse(String(data));
                });
            }
        });
    }
    write(callback = () => { }) {
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
    toggleFavorite(filmName) {
        this.films[filmName].isFavorite = !this.films[filmName].isFavorite;
    }
    getFilmsFromFolder(directoryName, root) {
        this.window.webContents.send("exploring", `${root}/${directoryName}`);
        fs.readdir(root + "/" + directoryName, (err, files) => {
            files.forEach(file => {
                (() => __awaiter(this, void 0, void 0, function* () {
                    let path = `${root}/${directoryName}/${file}`;
                    let stat = yield fs.promises.lstat(path);
                    if (stat.isDirectory())
                        this.getFilmsFromFolder(file, `${root}/${directoryName}`);
                    else {
                        if (tools_1.isFilm(file)) {
                            this.add(tools_1.cleanName(file), path);
                            console.log(this.filmStack);
                        }
                    }
                }))().catch(console.error);
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
    requestFilmMiniature(filmName) {
        this.filmStack += 1;
        this.getNthGoogleImageResultURL(filmName, 0, (url) => {
            this.films[filmName].thumbnail = url;
            console.log(this.films[filmName]);
        });
    }
    getNthGoogleImageResultURL(q, n, callback) {
        let url = "placeholder";
        let query = (q).split(" ").join("+");
        query = query.substr(0, query.length - 1);
        let x = x_ray_1.default();
        x(`https://www.google.co.in/search?q=${query}&source=lnms&tbm=isch`, "body@html")((err, data) => {
            let body = data;
            try {
                let imageElm = body.split("img")[2 + n];
                let imageURL = imageElm.split("src=")[1].split("\"")[1];
                url = imageURL;
                callback(url);
            }
            catch (e) {
                console.error(e);
            }
            ;
            this.filmStack -= 1;
            console.log(this.filmStack);
            if (this.filmStack == 0) {
                this.write(() => this.window.webContents.send("scan-finished"));
            }
        });
    }
}
exports.Catalog = Catalog;
