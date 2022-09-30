import { find, Pixel, Dimension } from "./similarity.js"

interface SimilarityCreate {
    iterations?: number,
    chunckSize?: number,
    chunckOverlap?: number,
    seeds?: number[][],
    amount?: number
}

interface Image {
    title: string,
    pixels: Pixel[],
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
    readonly _chunckOverlap: number
    readonly _seeds: number[][]
    readonly _amount?: number

    private _onChunckCallback : (clusters: string[][]) => void
    private _imageIdentities : ImageIdentity[]
    private _imagePairSimilarity : ImagePairSimilarity[]

    constructor(similarityCreate: SimilarityCreate) {
        this._iterations = similarityCreate.iterations ?? 3
        this._chunckOverlap = similarityCreate.chunckOverlap ?? 100
        this._chunckSize = similarityCreate.chunckSize ?? 200
        this._seeds = similarityCreate.seeds ?? new Array(this._iterations)
            .fill(null)
            .map(() => new Array(5)
                .fill(null)
                .map(() => Math.random()))
        this._amount = similarityCreate.amount
        this._imagePairSimilarity = Array()
        this._imageIdentities = new Array()
        if (this._chunckOverlap >= this._chunckSize) {
            throw new Error("Overlap bigger then chunck.")
        }
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

    public onChunck(chunckCallback: (clusters: string[][]) => void): void {
        this._onChunckCallback = chunckCallback
    }

    public add(image: Image): void {
        let identity : number[] = []
        for(let i = 0; i < this._iterations; i++){
            const divider = this._seeds.at(i)
        
            const clusterDefinitons = [
                { dimension: Dimension.r, maxValue: 255, dividers: [divider[0]] },
                { dimension: Dimension.g, maxValue: 255, dividers: [divider[1]] },
                { dimension: Dimension.b, maxValue: 255, dividers: [divider[2]] },
                { dimension: Dimension.x, maxValue: image.width, dividers: [divider[3]] },
                { dimension: Dimension.y, maxValue: image.height, dividers: [divider[4]] }
            ]
            
            identity = identity.concat(find(image.pixels, clusterDefinitons))
        }
        const imageIdentiyNew = {
            identity,
            title: image.title
        }

        for(const imageIdentiy of this._imageIdentities){
            const score = this.calculateDistanceOfImagePair(imageIdentiy, imageIdentiyNew)
            this._imagePairSimilarity.push({
                left: imageIdentiy.title,
                right: imageIdentiyNew.title,
                score
            })
        }

        this._imageIdentities.push(imageIdentiyNew)

        if(this._imageIdentities.length >= this._chunckOverlap){
            this.clearSimilarityPairs()
        }
    }

    public flush(): string[][] {
        return []
    }

    private clearSimilarityPairs() {
        this._imagePairSimilarity = Array(this._chunckSize ** 2).fill(null).map(() => {
            return {
                left: "",
                right: "",
                score: 0
            }
        })
    }

    private calculateDistanceOfImagePair(left: ImageIdentity, right: ImageIdentity) : number{
        const leftSum = left.identity.reduce((a,b) => a+b)
        const rightSum = right.identity.reduce((a,b) => a+b)

        let sum = 0
        for (const i in left.identity) {
            sum += Math.pow((left.identity[i]/leftSum) - (right.identity[i]/rightSum), 2)
        }
        return Math.sqrt(sum)
    }

}

export class Converter {

}