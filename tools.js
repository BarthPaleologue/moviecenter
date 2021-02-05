"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFilm = exports.contains = exports.cleanName = void 0;
function cleanName(name) {
    let list = name.toLowerCase().split(".");
    delete list[list.length - 1];
    let step1 = list.join(" ").split(" ");
    let newList = [];
    for (let i = 0; i < step1.length; i++) {
        if (!contains(step1[i], ["-", "264", "265", "1080", "720", "(", ")", "[", "]", "vost", "webrip", "bluray", "/", "\\", "hevc", "dualaudio", "hdlight", "hdcam", "hdrip", "ac3"]))
            newList.push(step1[i]);
    }
    let res = newList.join(" ");
    return res;
}
exports.cleanName = cleanName;
function contains(str, elms) {
    let flag = false;
    for (let elm of elms) {
        if (str.includes(elm)) {
            flag = true;
            break;
        }
    }
    return flag;
}
exports.contains = contains;
function isFilm(fileName) {
    let splitName = fileName.split(".");
    let extension = splitName[splitName.length - 1];
    return ["avi", "mp4", "mkv", "mpg"].includes(extension) && !contains(fileName.toLowerCase(), ["sample", "trailer"]);
}
exports.isFilm = isFilm;
