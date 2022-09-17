import * as jpeg from "jpeg-js"
import * as fs from "fs"
import cluster from './cluster.json' assert {type: 'json'}
import calculateROC from "./src/roc_calculation.js"
import { find } from "./src/similarity.ts"

const iterations = 10
const BASE_DIR = "./assets"
const files = fs.readdirSync(BASE_DIR)
const raw_images = files.map(img => {
    return jpeg.decode(fs.readFileSync(`${BASE_DIR}/${img}`), { formatAsRGBA: false })
})

const pixelImages = raw_images.map(rawImage => {
    let pixelArray = []
    let currentPixel = [0, 0, 0]
    for (let pixelColorIndex in rawImage.data) {
        if (pixelColorIndex % 3 === 0) {
            currentPixel = [0, 0, 0]
        }
        currentPixel[pixelColorIndex % 3] = rawImage.data[pixelColorIndex]
        if (pixelColorIndex % 3 === 2) {
            const pixelIndex = Math.floor(pixelColorIndex / 3)
            pixelArray.push({
                x: pixelIndex % rawImage.width,
                y: Math.floor(pixelIndex / rawImage.width) % rawImage.height,
                r: currentPixel[0],
                g: currentPixel[1],
                b: currentPixel[2]
            })
        }
    }
    return {
        pixels: pixelArray,
        height: rawImage.height,
        width: rawImage.width
    }
})


let similiarityIdArray = new Array(pixelImages.length).fill(null).map(() => [])
for(let i = 0; i <= iterations; i++){
    const divider = [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]

    for (let pixelImageIndex in pixelImages) {
        const clusterDefinitons = [
            { dimension: "r", maxValue: 255, dividers: [divider[0]] },
            { dimension: "g", maxValue: 255, dividers: [divider[1]] },
            { dimension: "b", maxValue: 255, dividers: [divider[2]] },
            { dimension: "x", maxValue: pixelImages[pixelImageIndex].width, dividers: [divider[3]] },
            { dimension: "y", maxValue: pixelImages[pixelImageIndex].height, dividers: [divider[4]] }
        ]
    
        similiarityIdArray[pixelImageIndex] = similiarityIdArray[pixelImageIndex].concat(find(pixelImages[pixelImageIndex].pixels, clusterDefinitons))
    }
}




/*
const similiarityIdArray = raw_images.map(rawImage => {
    let result = []
    for (const quadrantCenter of quadrantCenterArray)
        result = result.concat(similiarity(quadrantCenter, rawImage.data))
    return result
})
*/

const similiarityMatrix = Array(similiarityIdArray.length * similiarityIdArray.length).fill(null).map(() => {
    return {
        imageLeft: "",
        imageRight: "",
        score: 0
    }
})


for (let i = 1; i < similiarityIdArray.length; i++) {
    for (let j = 0; j < i; j++) {
        const similiarityIdA = similiarityIdArray[i]
        const similiarityIdB = similiarityIdArray[j]
        const sumA = similiarityIdA.reduce((a, b) => a + b)
        const sumB = similiarityIdB.reduce((a, b) => a + b)

        let avgDeviation = 0
        for (const similiarityIndex in similiarityIdA) {
            avgDeviation += Math.abs((similiarityIdA[similiarityIndex] / sumA - similiarityIdB[similiarityIndex] / sumB))
        }

        const imageCombination = similiarityMatrix[i * similiarityIdArray.length + j]
        imageCombination.score = avgDeviation / similiarityIdA.length
        imageCombination.imageLeft = files[i]
        imageCombination.imageRight = files[j]
    }
}

const sortedMatrix = similiarityMatrix
    .filter(a => a.imageLeft !== "")
    .sort((a, b) => a.score - b.score)
    .map((result) => {
        const leftImageClusterNumber = cluster.find((point) => point.name === result.imageLeft).clusterNumber
        const rightImageClusterNumber = cluster.find((point) => point.name === result.imageRight).clusterNumber
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