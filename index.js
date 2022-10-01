import * as jpeg from "jpeg-js"
import * as fs from "fs"
import cluster from './cluster.json' assert {type: 'json'}
import calculateROC from "./src/roc_calculation.js"
import { Similarity } from "./src/index.ts"

const iterations = 6
const BASE_DIR = "./assets"
const files = fs.readdirSync(BASE_DIR)
const raw_images = files.map(img => {
    return { jpeg: jpeg.decode(fs.readFileSync(`${BASE_DIR}/${img}`), { formatAsRGBA: false }), title: img }
})

const pixelImages = raw_images.map(rawImage => {
    let pixelArray = []
    let currentPixel = [0, 0, 0]
    for (let pixelColorIndex in rawImage.jpeg.data) {
        if (pixelColorIndex % 3 === 0) {
            currentPixel = [0, 0, 0]
        }
        currentPixel[pixelColorIndex % 3] = rawImage.jpeg.data[pixelColorIndex]
        if (pixelColorIndex % 3 === 2) {
            const pixelIndex = Math.floor(pixelColorIndex / 3)
            pixelArray.push({
                x: pixelIndex % rawImage.jpeg.width,
                y: Math.floor(pixelIndex / rawImage.jpeg.width) % rawImage.jpeg.height,
                r: currentPixel[0],
                g: currentPixel[1],
                b: currentPixel[2]
            })
        }
    }
    return {
        title: rawImage.title,
        pixels: pixelArray,
        height: rawImage.jpeg.height,
        width: rawImage.jpeg.width
    }
})

const similarity = new Similarity({
    iterations,
})

for (const pixelImage of pixelImages) {
    similarity.add(pixelImage)
}

console.log(similarity.clusters.filter((cluster) => cluster.length > 1))


const sortedMatrix = similarity._imagePairSimilarity
    .sort((a, b) => a.score - b.score)
    .map((result) => {
        const leftImageClusterNumber = cluster.find((point) => point.name === result.left).clusterNumber
        const rightImageClusterNumber = cluster.find((point) => point.name === result.right).clusterNumber
        if (leftImageClusterNumber == -1 || rightImageClusterNumber == -1) {
            result.truth = false
            return result
        }

        if (leftImageClusterNumber === rightImageClusterNumber) {
            result.truth = true
        } else {
            result.truth = false
        }
        return result
    })


const roc = calculateROC(sortedMatrix)

//for (let i = 0; i < 20; i++)
//    console.log(sortedMatrix[i])

//console.table([[tp,fp],[fn,tn]])

// Current false positive / true positive max should be 5% -> 185/472
// -> To get better use x / y axis
// -> Count in multiple deepness levels

const header = "1 - Specifity, Sensitivity\n"
const data = roc.map((a) => {
    return `${a.x},${a.y}\n`
})

fs.writeFileSync("roc.csv", header + data.join(""))