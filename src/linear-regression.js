const fs = require("fs");
const { parse } = require("csv");
const plotly = require('plotly')("NerdolaCartola", "VzRPiXgywDW6ik1Lr8pe")

class Dot {
    constructor(data) {
        this.x = data[0];
        this.y = data[1];
        this.used = false;
    }

    f(m, b) {
        return (this.x * m) + b;
    }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
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

    const alpha = 0.00001;
    const k = 1000000;
    const trainingPercent = 0.5;
    const batchSize = 5;
    const trainingSet = [];
    const testSet = [];
    const batch = [];

    for (let i = 0; i < dataset.length; i++) {
        if (Math.random() <= trainingPercent) {
            trainingSet.push(dataset[i]);
        } else {
            testSet.push(dataset[i])
        }
    }

    while (batch.length !== batchSize) {
        const i = getRandomInt(testSet.length);
        const dot = testSet[i];

        if(dot.used) continue;

        batch.push(dot);
        dot.used = true;
    }

    let m = 0;
    let b = 0;

    for (let i = 0; i < k; i++) {
        let sumM = 0;
        let sumB = 0;

        for (let j = 0; j < batch.length; j++) {
            const dot = batch[j];
            const dif = dot.f(m, b) - dot.y;
            sumB += dif;
            sumM += dif * dot.x;
        }

        const dLossM = 2 / batch.length * sumM;
        const dLossB = 2 / batch.length * sumB;

        m -= dLossM * alpha;
        b -= dLossB * alpha;
    }

    console.log("y = " + m.toFixed(4) + "X" + " + " + b.toFixed(4));

    let absoluteError = 0;
    for (let i = 0; i < testSet.length; i++) {
        const dot = testSet[i];
        absoluteError += dot.f(m, b) - dot.y;
    }

    const averageError = absoluteError / testSet.length;

    console.log("Average Error = " + averageError.toFixed(4));

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

    const graphOptions = { filename: "linear-regression", fileopt: "overwrite" };
    plotly.plot(data, graphOptions, function (err, msg) {
        console.log(msg);
        if (err) {
            console.error(err);
        }
    });

}

main();
