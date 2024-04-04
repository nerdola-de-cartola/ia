const fs = require("fs");
const { parse } = require("csv");
const plotly = require('plotly')("NerdolaCartola", "VzRPiXgywDW6ik1Lr8pe")

class Dot {
    constructor(data) {
        this.x = Number(data[0]);
        this.y = Number(data[1]);
        this.used = false;
    }

    f(m, b) {
        return (this.x * m) + b;
    }
}

class LinearRegression {
    constructor() {
        this.src = "./data/linear-regression2.csv"
        this.learningRate = 0.000001;
        this.learningSteps = 10000000;
        this.trainingPercent = 0.5;
        this.dataSet = [];
        this.trainingSet = [];
        this.testSet = [];
        this.batches = [];
        this.m = 0;
        this.b = 0;
        this.batchSize = 5;
    }

    getBatchSize(desiredBatchSize) {
        return Math.max(0, Math.min(desiredBatchSize, this.trainingSet.length));
    }

    async readData() {
        await new Promise((resolve, reject) => {
            fs
                .createReadStream(this.src)
                .pipe(parse({ delimiter: ",", from_line: 2 }))
                .on("data", (row) => {
                    this.dataSet.push(new Dot(row))
                })
                .on("end", resolve)
                .on("error", reject)
        })
    }

    separateTrainingAndTesting() {
        const {trainingPercent, dataSet, trainingSet, testSet} = this;

        for (let i = 0; i < dataSet.length; i++) {
            if (Math.random() <= trainingPercent) {
                trainingSet.push(dataSet[i]);
            } else {
                testSet.push(dataSet[i])
            }
        }
    }

    separateBatches() {
        const {trainingSet, batchSize, batches} = this;

        for (let i = 0; i < trainingSet.length / batchSize; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, trainingSet.length);
            batches[i] = trainingSet.slice(start, end);
        }
    }

    training() {
        const {learningSteps, learningRate, batches, testSet, batchSize} = this;

        for (let i = 0; i < learningSteps; i++) {
            let sumM = 0;
            let sumB = 0;

            const batch = batches[i % batches.length];
            for (let j = 0; j < batch.length; j++) {
                const dot = batch[j];
                const dif = dot.f(this.m, this.b) - dot.y;
                sumB += dif;
                sumM += dif * dot.x;
            }

            const dLossM = 2 / batch.length * sumM;
            const dLossB = 2 / batch.length * sumB;

            this.m -= dLossM * learningRate;
            this.b -= dLossB * learningRate;
        }
    }

    error() {
        let absoluteError = 0;
        for (let i = 0; i < this.testSet.length; i++) {
            const dot = this.testSet[i];
            absoluteError += dot.f(this.m, this.b) - dot.y;
        }
        return absoluteError / this.testSet.length;
    }

    plotGraph() {
        const {trainingSet, testSet, dataSet, m, b} = this;

        const trainingTrace = {
            x: trainingSet.map(dot => dot.x),
            y: trainingSet.map(dot => dot.y),
            mode: "markers",
            marker: {
                color: "red"
            },
            name: "training data"
        };

        const testTrace = {
            x: testSet.map(dot => dot.x),
            y: testSet.map(dot => dot.y),
            mode: "markers",
            marker: {
                color: "blue"
            },
            name: "test data"
        };

        const model = {
            x: dataSet.map(dot => dot.x),
            y: dataSet.map(dot => dot.f(m, b)),
            name: "model"
        };

        const data = [trainingTrace, testTrace, model];

        const graphOptions = { filename: "linear-regression", fileopt: "overwrite" };
        plotly.plot(data, graphOptions, function (err, msg) {
            console.log(msg);
            if (err) {
                console.error(err);
            }
        });
    }

}

async function main() {
    const LR = new LinearRegression();
    await LR.readData();
    LR.separateTrainingAndTesting();
    LR.separateBatches();
    const start = performance.now();
    LR.training();
    const end = performance.now()
    console.log(end - start);
    console.log("m =", LR.m);
    console.log("b =", LR.b);
    console.log("L =", LR.error());
    LR.plotGraph();
}

main();
