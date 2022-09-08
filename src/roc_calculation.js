const STEP_SIZE = 0.0001

export default function calculateROC(resultArray, stepSize = STEP_SIZE) {
    let p = 0
    let n = 0
    for(let result of resultArray)
        result.truth ? p++ : n++

    let rocArray = []
    for(let cutOff = 0; cutOff < 0.25; cutOff += STEP_SIZE){
        resultArray.map((result) => {
            if (result.score < cutOff) {
                result.prediction = true
            }else {
                result.prediction = false
            }
        })
        
        const tp = resultArray
            .map((result) => result.prediction === result.truth && result.truth === true)
            .reduce((a,b) => a += b, 0)
    
        const fp = resultArray
            .map((result) => result.prediction !== result.truth && result.truth === false)
            .reduce((a,b) => a += b, 0)
    
        const tn = resultArray
            .map((result) => result.prediction === result.truth && result.truth === false)
            .reduce((a,b) => a += b, 0)
    
        //const fn = resultArray
        //    .map((result) => result.prediction !== result.truth && result.truth === true)
        //    .reduce((a,b) => a += b, 0)

        rocArray.push({
            cutOff,
            fp,
            tp,
            "fp/tp": fp/tp,
            x: 1 - (tn/n),
            y: (tp/p)
        })
    }
    return rocArray
}