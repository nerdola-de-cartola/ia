const fs = require("fs");
const { parse } = require("csv");
const plotly = require('plotly')("NerdolaCartola", "VzRPiXgywDW6ik1Lr8pe")

class Dot {
    constructor(data) {
        this.x = data[0];
        this.y = data[1];
    }

    f(m, b) {
        return (this.x * m) + b;
    }
}

async function main() {
    const dataset = []

    await new Promise((resolve, reject) => {
        fs
            .createReadStream("./data/linear-regression.csv")
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", (row) => {
                dataset.push(new Dot(row))
            })
            .on("end", resolve)
            .on("error", reject)
    })


    const alpha = 0.0001;
    const n = 0.5 * dataset.length;
    const k = 100000;
    const trainingSet = dataset.slice(0, n);
    const testSet = dataset.slice(n, dataset.length);
    let m = 0;
    let b = 0;

    for (let i = 0; i < k; i++) {

        let sumM = 0;
        let sumB = 0;
        for (const dot of trainingSet) {
            const dif = dot.f(m, b) - dot.y; 
            sumB += dif;
            sumM += dif * dot.x;
        }

        const dLossM = 2 / trainingSet.length * sumM;
        const dLossB = 2 / trainingSet.length * sumB;

        m -= dLossM * alpha;
        b -= dLossB * alpha;
    }

    console.log("y = " + m.toFixed(4) + "X" + " + " + b.toFixed(4));

    let absoluteError = 0;
    for (const dot of testSet) {
        absoluteError += dot.f(m, b) - dot.y;
    }

    const averageError = absoluteError / testSet.length;

    console.log("Average Error = " + averageError.toFixed(2));

    const trace1 = {
        x: dataset.map(dot => dot.x),
        y: dataset.map(dot => dot.y),
        mode: "markers"
    };

    const trace2 = {
        x: dataset.map(dot => dot.x),
        y: dataset.map(dot => dot.f(m, b)),
    };

    const data = [trace1, trace2];

    const graphOptions = {filename: "linear-regression", fileopt: "overwrite" };
    plotly.plot(data, graphOptions, function (err, msg) {
        console.log(msg);
        if(err) {
            console.error(err);
        }
    });

}

main();
