"use strict";
exports.__esModule = true;
var fs = require("fs");
var BASE_DIR = "./assets";
var files = fs.readdirSync(BASE_DIR);
var clusterArray = files.map(function (file) {
    return {
        name: file,
        clusterNumber: -1
    };
});
fs.writeFileSync("./cluster.json", JSON.stringify(clusterArray, undefined, 2));
//# sourceMappingURL=clusterCreate.js.map