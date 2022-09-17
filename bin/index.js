"use strict";
exports.__esModule = true;
var jpeg = require("jpeg-js");
var fs = require("fs");
var cluster_json_1 = require("./cluster.json");
var roc_calculation_js_1 = require("./src/roc_calculation.js");
var similiarity = function (center, data) {
    var quadrants = [0, 0, 0, 0, 0, 0, 0, 0];
    var currentPixel = [0, 0, 0];
    for (var pixelColorIndex in data) {
        if (pixelColorIndex % 3 === 0) {
            currentPixel = [0, 0, 0];
        }
        currentPixel[pixelColorIndex % 3] = data[pixelColorIndex];
        if (pixelColorIndex % 3 === 2) {
            if (currentPixel[0] >= center[0]) {
                if (currentPixel[1] >= center[1]) {
                    if (currentPixel[2] >= center[2]) {
                        quadrants[0] += 1;
                    }
                    else {
                        quadrants[1] += 1;
                    }
                }
                else {
                    if (currentPixel[2] >= center[2]) {
                        quadrants[2] += 1;
                    }
                    else {
                        quadrants[3] += 1;
                    }
                }
            }
            else {
                if (currentPixel[1] >= center[1]) {
                    if (currentPixel[2] >= center[2]) {
                        quadrants[4] += 1;
                    }
                    else {
                        quadrants[5] += 1;
                    }
                }
                else {
                    if (currentPixel[2] >= center[2]) {
                        quadrants[6] += 1;
                    }
                    else {
                        quadrants[7] += 1;
                    }
                }
            }
        }
    }
    return quadrants;
};
var iterations = 10;
var BASE_DIR = "./assets";
var files = fs.readdirSync(BASE_DIR);
var raw_images = files.map(function (img) {
    return jpeg.decode(fs.readFileSync("".concat(BASE_DIR, "/").concat(img)), { formatAsRGBA: false });
});
var quadrantCenterArray = (new Array(iterations))
    .fill(null)
    .map(function () { return [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]; });
var similiarityIdArray = raw_images.map(function (rawImage) {
    var result = [];
    for (var _i = 0, quadrantCenterArray_1 = quadrantCenterArray; _i < quadrantCenterArray_1.length; _i++) {
        var quadrantCenter = quadrantCenterArray_1[_i];
        result = result.concat(similiarity(quadrantCenter, rawImage.data));
    }
    return result;
});
var similiarityMatrix = Array(similiarityIdArray.length * similiarityIdArray.length).fill(null).map(function () {
    return {
        imageLeft: "",
        imageRight: "",
        score: 0
    };
});
for (var i = 1; i < similiarityIdArray.length; i++) {
    for (var j = 0; j < i; j++) {
        var similiarityIdA = similiarityIdArray[i];
        var similiarityIdB = similiarityIdArray[j];
        var sumA = similiarityIdA.reduce(function (a, b) { return a + b; });
        var sumB = similiarityIdB.reduce(function (a, b) { return a + b; });
        var avgDeviation = 0;
        for (var similiarityIndex in similiarityIdA) {
            avgDeviation += Math.abs((similiarityIdA[similiarityIndex] / sumA - similiarityIdB[similiarityIndex] / sumB));
        }
        var imageCombination = similiarityMatrix[i * similiarityIdArray.length + j];
        imageCombination.score = avgDeviation / similiarityIdA.length;
        imageCombination.imageLeft = files[i];
        imageCombination.imageRight = files[j];
    }
}
var sortedMatrix = similiarityMatrix
    .filter(function (a) { return a.imageLeft !== ""; })
    .sort(function (a, b) { return a.score - b.score; })
    .map(function (result) {
    var leftImageClusterNumber = cluster_json_1["default"].find(function (point) { return point.name === result.imageLeft; }).clusterNumber;
    var rightImageClusterNumber = cluster_json_1["default"].find(function (point) { return point.name === result.imageRight; }).clusterNumber;
    if (leftImageClusterNumber == -1 || rightImageClusterNumber == -1) {
        result.truth = false;
        return result;
    }
    if (leftImageClusterNumber === rightImageClusterNumber) {
        result.truth = true;
    }
    else {
        result.truth = false;
    }
    return result;
});
var roc = (0, roc_calculation_js_1["default"])(sortedMatrix);
//for (let i = 0; i < 20; i++)
//    console.log(sortedMatrix[i])
//console.table([[tp,fp],[fn,tn]])
// Current false positive / true positive max should be 5% -> 185/472
// -> To get better use x / y axis
// -> Count in multiple deepness levels
var header = "1 - Specifity, Sensitivity\n";
var data = roc.map(function (a) {
    return "".concat(a.x, ",").concat(a.y, "\n");
});
fs.writeFileSync("roc.csv", header + data.join(""));
//# sourceMappingURL=index.js.map