export type Pixel = Record<Dimension, number>

export enum Dimension {
    x = "x",
    y = "y",
    r = "r",
    g = "g",
    b = "b",
    a = "a",
}

interface ClusterDefinition {
    dimension: Dimension,
    maxValue: number,
    dividers: number[],
    splitPoints?: number[]
}

export function find(pixels: Pixel[], clusterDefinitions: ClusterDefinition[]): number[] {

    clusterDefinitions.forEach((clusterDefinition) => {
        clusterDefinition.splitPoints = []
        for (let clusterDefinitionDivider of clusterDefinition.dividers) {
            clusterDefinition.splitPoints.push(Math.floor(clusterDefinitionDivider * clusterDefinition.maxValue))
        }
        // Is needed to be sorted in `split`
        clusterDefinition.splitPoints.sort((a, b) => a - b)
    })

    const imageCluster = split(pixels, clusterDefinitions)


    return imageCluster.flat(clusterDefinitions.length - 1).map((cluster) => cluster.length)
}


function split(pixels: Pixel[], clusterDefinitions: ClusterDefinition[]) {
    clusterDefinitions = JSON.parse(JSON.stringify(clusterDefinitions))

    if (clusterDefinitions.length === 0) {
        return pixels
    }

    const clusterDefinition = clusterDefinitions.pop()

    const pixelSplits = pixels.reduce((acc, pixel) => {
        for (let i = 0; i < clusterDefinition.splitPoints.length + 1; i++) {
            const left = Number(i) === 0 ? 0 : clusterDefinition.splitPoints[Number(i) - 1]
            const right = Number(i) === (clusterDefinition.splitPoints.length) ? clusterDefinition.maxValue : clusterDefinition.splitPoints[Number(i)]
            if (pixel[clusterDefinition.dimension] < right && pixel[clusterDefinition.dimension] >= left) {
                acc[Number(i)].push(pixel)
            }
        }
        return acc
    }, new Array(clusterDefinition.splitPoints.length + 1).fill(null).map(() => []))

    return pixelSplits.map((pixelSplit) => {
        return split(pixelSplit, clusterDefinitions)
    })
}