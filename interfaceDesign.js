import { Similarity, Converter } from "Goldenford";

const similarity = new Similarity({
    chunckSize: 200,
    chunckOverlap: 100,
    seed: [0,0,0,0,0],
    amount: 9500
})

similarity.onChunck((clusters) => {
    let cluster = [
        "img/000001.jpg",
        "img/000002.jpg",
    ]
})

const pixelImage = Converter.JPEGtoPixels(image)

similarity.add(pixelImage)

similarity.add([{
    title: "img/000001.jpg",
    pixels: [{
        x: 1,
        y: 2,
        r: 120,
        g: 240,
        b: 134
    }],
    height: 34,
    width: 45
}])


similiarty.flush()