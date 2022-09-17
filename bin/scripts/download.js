"use strict";
exports.__esModule = true;
var img_urls_json_1 = require("../img_urls.json");
var fs = require("fs");
var _loop_1 = function (i) {
    var data = await fetch(img_urls_json_1["default"][i]);
    var imageNumber = "000000000" + i;
    imageNumber = imageNumber.substr(imageNumber.length - 6);
    var path = "./assets/";
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    var fileWriteStream = fs.createWriteStream("".concat(path, "img").concat(imageNumber, ".jpg"));
    var stream = new WritableStream({
        write: function (chunk) {
            fileWriteStream.write(chunk);
        }
    });
    data.body.pipeTo(stream);
    console.clear();
    console.log("Downloading" + (new Array((Math.floor(i / 10) % 3) + 1)).fill(".").join("") + "\t" + "".concat(Number(i) + 1, "/").concat(img_urls_json_1["default"].length));
};
for (var i in img_urls_json_1["default"]) {
    _loop_1(i);
}
//# sourceMappingURL=download.js.map