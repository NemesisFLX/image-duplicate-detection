import * as fs from "fs"

const BASE_DIR = "./assets"
const files = fs.readdirSync(BASE_DIR)
const clusterArray = files.map((file) => {
    return {
        name: file,
        clusterNumber: -1,
    }
})

fs.writeFileSync("./cluster.json", JSON.stringify(clusterArray, undefined, 2))