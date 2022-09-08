import * as jpeg from "jpeg-js"
import * as fs from "fs"

const similiarity = (center, data) => {
    const quadrants = [0,0,0,0,0,0,0,0]
    let currentPixel = [0,0,0]

    for(let pixelColorIndex in data){
        if(pixelColorIndex % 3 === 0){
            currentPixel = [0,0,0]
        }
        currentPixel[pixelColorIndex % 3] = data[pixelColorIndex]
        if(pixelColorIndex % 3 === 2){
            if(currentPixel[0] >= center[0]){
                if(currentPixel[1] >= center[1]){
                    if(currentPixel[2] >= center[2]){
                        quadrants[0] += 1
                    }else{
                        quadrants[1] += 1
                    }
                }else{
                    if(currentPixel[2] >= center[2]){
                        quadrants[2] += 1
                    }else{
                        quadrants[3] += 1
                    }
                }
            }else{
                if(currentPixel[1] >= center[1]){
                    if(currentPixel[2] >= center[2]){
                        quadrants[4] += 1
                    }else{
                        quadrants[5] += 1
                    }
                }else{
                    if(currentPixel[2] >= center[2]){
                        quadrants[6] += 1
                    }else{
                        quadrants[7] += 1
                    }
                }
            }
        }
    }

    return quadrants
}

const iterations = 10
const BASE_DIR = "./assets"
const files = fs.readdirSync(BASE_DIR)
const raw_images = files.map(img => {
    return jpeg.decode(fs.readFileSync(`${BASE_DIR}/${img}`), {formatAsRGBA: false})
})

const quadrantCenterArray = (new Array(iterations))
    .fill(null)
    .map(() => [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)])
    
const similiarityIdArray = raw_images.map(rawImage => {
    let result = []
    for(const quadrantCenter of quadrantCenterArray)
        result = result.concat(similiarity(quadrantCenter, rawImage.data))
    return result
})

const similiarityMatrix = Array(similiarityIdArray.length * similiarityIdArray.length).fill(null).map(() => {
    return {
        imageLeft : "",
        imageRight : "",
        score : 0
    }
})


for(let i = 1; i < similiarityIdArray.length; i++){
    for(let j = 0; j < i; j++){
        const similiarityIdA = similiarityIdArray[i]
        const similiarityIdB = similiarityIdArray[j]
        const sumA = similiarityIdA.reduce((a,b) => a+b)
        const sumB = similiarityIdB.reduce((a,b) => a+b)
        
        let avgDeviation = 0
        for(const similiarityIndex in similiarityIdA){
            avgDeviation += Math.abs((similiarityIdA[similiarityIndex]/sumA - similiarityIdB[similiarityIndex]/sumB))
        }
        
        const imageCombination = similiarityMatrix[i * similiarityIdArray.length + j]
        imageCombination.score = avgDeviation/similiarityIdA.length
        imageCombination.imageLeft = files[i]
        imageCombination.imageRight = files[j]
    }
}

const sortedMatrix = similiarityMatrix
    .filter(a => a.imageLeft !== "")
    .sort((a,b) => a.score - b.score)

for(let i = 0; i < 20; i++)
    console.log(sortedMatrix[i])