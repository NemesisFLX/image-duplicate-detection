import urls from './img_urls.json' assert {type: 'json'}
import * as fs from "fs"



for (const i in urls) {
    let data = await fetch(urls[i])

    const fileWriteStream = fs.createWriteStream(`./assets/img${i}.jpg`)

    const stream = new WritableStream({
        write(chunk) {
            fileWriteStream.write(chunk);
        },
    });

    data.body.pipeTo(stream)
}
