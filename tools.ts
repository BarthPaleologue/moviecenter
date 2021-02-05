export function cleanName(name: string) {
    let list = name.toLowerCase().split(".");
    delete list[list.length - 1];
    let step1 = list.join(" ").split(" ");
    let newList = [];
    for (let i = 0; i < step1.length; i++) {
        if (!contains(step1[i], ["-", "264", "265", "1080", "720", "(", ")", "[", "]", "vost", "webrip", "bluray", "/", "\\", "hevc", "dualaudio", "hdlight", "hdcam", "hdrip", "ac3"])) newList.push(step1[i]);
    }
    let res = newList.join(" ");

    return res;
}

export function contains(str: string, elms: string[]) {
    let flag = false;
    for (let elm of elms) {
        if (str.includes(elm)) {
            flag = true;
            break;
        }
    }
    return flag;
}

export function isFilm(fileName: string): boolean {
    let splitName = fileName.split(".");
    let extension = splitName[splitName.length - 1];

    return ["avi", "mp4", "mkv", "mpg"].includes(extension) && !contains(fileName.toLowerCase(), ["sample", "trailer"]);
}