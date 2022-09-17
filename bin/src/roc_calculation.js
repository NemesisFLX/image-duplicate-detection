"use strict";
exports.__esModule = true;
var STEP_SIZE = 0.0001;
function calculateROC(resultArray, stepSize) {
    if (stepSize === void 0) { stepSize = STEP_SIZE; }
    var p = 0;
    var n = 0;
    for (var _i = 0, resultArray_1 = resultArray; _i < resultArray_1.length; _i++) {
        var result = resultArray_1[_i];
        result.truth ? p++ : n++;
    }
    var rocArray = [];
    var _loop_1 = function (cutOff) {
        resultArray.map(function (result) {
            if (result.score < cutOff) {
                result.prediction = true;
            }
            else {
                result.prediction = false;
            }
        });
        var tp = resultArray
            .map(function (result) { return result.prediction === result.truth && result.truth === true; })
            .reduce(function (a, b) { return a += b; }, 0);
        var fp = resultArray
            .map(function (result) { return result.prediction !== result.truth && result.truth === false; })
            .reduce(function (a, b) { return a += b; }, 0);
        var tn = resultArray
            .map(function (result) { return result.prediction === result.truth && result.truth === false; })
            .reduce(function (a, b) { return a += b; }, 0);
        //const fn = resultArray
        //    .map((result) => result.prediction !== result.truth && result.truth === true)
        //    .reduce((a,b) => a += b, 0)
        rocArray.push({
            cutOff: cutOff,
            fp: fp,
            tp: tp,
            "fp/tp": fp / tp,
            x: 1 - (tn / n),
            y: (tp / p)
        });
    };
    for (var cutOff = 0; cutOff < 0.25; cutOff += STEP_SIZE) {
        _loop_1(cutOff);
    }
    return rocArray;
}
exports["default"] = calculateROC;
//# sourceMappingURL=roc_calculation.js.map