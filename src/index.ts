import * as Identity from "./identity.js"

interface SimilarityCreate {
    iterations?: number,
    chunckSize?: number,
    chunckOverlap?: number,
    seeds?: number[][],
    amount?: number,
    threshold?: number,
}

interface Image {
    title: string,
    pixels: Identity.Pixel[],
    height: number,
    width: number
}

interface ImageIdentity {
    title: string,
    identity: number[]
}

interface ImagePairSimilarity {
    left: string,
    right: string,
    score: number
}

export class Similarity {
    readonly _iterations: number
    readonly _chunckSize: number
    readonly _seeds: number[][]
    readonly _threshold: number

    private _imageIdentities: ImageIdentity[]
    private _imagePairSimilarity: ImagePairSimilarity[]
    private _titleToClusterMap: Record<string, number> = {}
    private _currentHighestCluster = 0

    private _clusters: string[][] = [];
    public get clusters(): string[][] {
        return this._clusters;
    }

    private set clusters(val: string[][]) {
        this._clusters = val;
    }

    constructor(similarityCreate: SimilarityCreate) {
        this._iterations = similarityCreate.iterations ?? 3
        this._chunckSize = similarityCreate.chunckSize ?? 200
        this._threshold = similarityCreate.threshold ?? 0.068
        this._seeds = similarityCreate.seeds ?? new Array(this._iterations)
            .fill(null)
            .map(() => new Array(5)
                .fill(null)
                .map(() => Math.random()))
        this._imagePairSimilarity = Array()
        this._imageIdentities = new Array()
        if (this._chunckSize < 2) {
            throw new Error("Chuncksize too small.")
        }
        if (this._seeds.length !== this._iterations) {
            throw new Error("Not all iterations seeded.")
        }
        if (this._seeds.some((seed) => seed.length !== 5)) {
            throw new Error("Seeds not fully filled.")
        }
    }

    public add(image: Image): void {
        const dividers = new Array(this._iterations - 1).fill(null).map((_, index) => (index + 1) / this._iterations)
        const clusterDefinitons = [
            { dimension: Identity.Dimension.r, maxValue: 255, dividers },
            { dimension: Identity.Dimension.g, maxValue: 255, dividers },
            { dimension: Identity.Dimension.b, maxValue: 255, dividers },
            { dimension: Identity.Dimension.x, maxValue: image.width, dividers },
            { dimension: Identity.Dimension.y, maxValue: image.height, dividers }
        ]

        const identity = Identity.find(image.pixels, clusterDefinitons)

        const imageIdentiyNew = {
            identity,
            title: image.title
        }

        let scoringImageIdentities: (ImageIdentity & { score: number })[] = []
        for (const imageIdentiy of this._imageIdentities) {
            const score = this.calculateDistanceOfImagePair(imageIdentiy, imageIdentiyNew)
            this._imagePairSimilarity.push({
                left: imageIdentiy.title,
                right: imageIdentiyNew.title,
                score
            })
            if (this._threshold > score) {
                scoringImageIdentities.push({
                    score,
                    identity: imageIdentiy.identity,
                    title: imageIdentiy.title
                })
            }
        }

        const minScoringImageIdentity = scoringImageIdentities.sort((a, b) => b.score - a.score).pop()
        if (!minScoringImageIdentity) {
            this._titleToClusterMap[imageIdentiyNew.title] = this._currentHighestCluster
            this.clusters[this._currentHighestCluster] = [imageIdentiyNew.title]
            this._currentHighestCluster++
        } else {
            const clusterNumber = this._titleToClusterMap[minScoringImageIdentity.title]
            this._titleToClusterMap[imageIdentiyNew.title] = clusterNumber
            this.clusters[clusterNumber].push(imageIdentiyNew.title)
        }

        for (const scoringImageIdentitiy of scoringImageIdentities) {
            const clusterAIndex = this._titleToClusterMap[scoringImageIdentitiy.title]
            const clusterBIndex = this._titleToClusterMap[imageIdentiyNew.title]
            if (clusterAIndex !== clusterBIndex) {
                const clusterB = this._clusters.at(clusterBIndex)
                this._clusters[clusterAIndex] = this._clusters.at(clusterAIndex).concat(clusterB)
                this._clusters.splice(clusterBIndex, 1)
                for (const title of clusterB) {
                    this._titleToClusterMap[title] = clusterAIndex
                }
                for (const [title, clusterIndex] of Object.entries(this._titleToClusterMap)) {
                    if (clusterIndex > clusterBIndex)
                        this._titleToClusterMap[title]--
                }
            }
        }

        this._imageIdentities.push(imageIdentiyNew)

        while (this._imageIdentities.length >= this._chunckSize) {
            this._imageIdentities.shift()
        }
    }

    private calculateDistanceOfImagePair(left: ImageIdentity, right: ImageIdentity): number {
        const leftSum = left.identity.reduce((a, b) => a + b)
        const rightSum = right.identity.reduce((a, b) => a + b)

        let sum = 0
        for (const i in left.identity) {
            sum += Math.pow((left.identity[i] / leftSum) - (right.identity[i] / rightSum), 2)
        }
        return Math.sqrt(sum)
    }
}

export class Converter {

}