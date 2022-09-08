import urls from '../img_urls.json' assert {type: 'json'}
import * as fs from "fs"



for (const i in urls) {
    let data = await fetch(urls[i])
    let imageNumber = "000000000" + i
    imageNumber = imageNumber.substr(imageNumber.length - 6)
    const fileWriteStream = fs.createWriteStream(`./assets/img${imageNumber}.jpg`)

    const stream = new WritableStream({
        write(chunk) {
            fileWriteStream.write(chunk);
        },
    });

    data.body.pipeTo(stream)
    console.clear()
    console.log("Downloading" + (new Array((Math.floor(i/10) % 3) + 1)).fill(".").join("") + "\t" + `${i + 1}/${urls.length}`)
}
