const fs = require("fs");
const { parse } = require("csv");
const { exit } = require("process");
const plotly = require('plotly')("NerdolaCartola", "VzRPiXgywDW6ik1Lr8pe")

const shuffle = (array) => { 
    return array.sort(() => Math.random() - 0.5); 
}; 

class SubArray {
    constructor(arr, start, end) {
        if(start < 0 || start > arr.length) throw "Start index must be between 0 and array size";
        if(end < start || end > arr.length) throw "End index must be between start and array size";

        this.arr = arr;
        this.start = start;
        this.end = end;
        this.length = this.end - this.start;
    }

    at(index) {
        const trueIndex= index + this.start;
        if(index < 0 || index > this.length || trueIndex >= this.arr.length) throw "Invalid index";
        return this.arr.at(trueIndex);
    }

    print() {
        console.log("[")
        for(let i = 0; i < this.length; i++) {
            console.log("   ", this.at(i));
        }
        console.log("]")
    }

    map(f) {
        const result = [];
        for(let i = 0; i < this.length; i++) {
            const element = this.at(i);
            result.push(f(element, i, result));
        }
        return result;
    }
}

class Dot {
    constructor(data) {
        this.x = Number(data[0]);
        this.y = Number(data[1]);
    }

    f(m, b) {
        return (this.x * m) + b;
    }
}

class LinearRegression {
    constructor(lr, ls, tp, bs) {
        if(bs < 1) throw "Batch size must be at least 1"
        if(lr <= 0) throw "Learning rate must be grater than zero"
        if(ls <= 0) throw "Learning steps must be grater than zero"
        if(tp <= 0 || tp >= 1) throw "Training percentage must be  between zero and one exclusively"

        this.learningRate = lr;
        this.learningSteps = Math.floor(ls);
        this.trainingPercent = tp;
        this.batchSize = bs;
        this.dataSet = [];
        this.trainingSet = null;
        this.testSet = null;
        this.batches = [];
        this.m = 0;
        this.b = 0;
    }

    getBatchSize(desiredBatchSize) {
        return Math.max(0, Math.min(desiredBatchSize, this.trainingSet.length));
    }

    async readData(src) {
        await new Promise((resolve, reject) => {
            fs
                .createReadStream(src)
                .pipe(parse({ delimiter: ",", from_line: 2 }))
                .on("data", (row) => {
                    this.dataSet.push(new Dot(row))
                })
                .on("end", resolve)
                .on("error", reject)
        })
    }

    separateTrainingAndTesting() {
        const {trainingPercent, dataSet} = this;

        if(!dataSet.length) throw "Data set was not provided yet"

        shuffle(dataSet);
        const trainingIndex = Math.round(trainingPercent*dataSet.length);
        this.trainingSet = new SubArray(dataSet, 0, trainingIndex); 
        this.testSet = new SubArray(dataSet, trainingIndex, dataSet.length); 
    }

    separateBatches() {
        const {trainingSet, batchSize, batches} = this;

        if(!trainingSet.length) throw "Training set was not defined yet"

        for (let i = 0; i < trainingSet.length / batchSize; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, trainingSet.length);
            batches[i] = new SubArray(trainingSet, start, end);
        }
    }

    training() {
        const {learningSteps, learningRate, batches} = this;

        if(!batches.length) throw "Batches was not defined yet"

        for (let i = 0; i < learningSteps; i++) {
            let sumM = 0;
            let sumB = 0;

            const batch = batches[i % batches.length];
            for (let j = 0; j < batch.length; j++) {
                const dot = batch.at(j);
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
        const {testSet, m, b} = this;

        if(!testSet.length) throw "Test set was not defined yet";

        let absoluteError = 0;
        for (let i = 0; i < testSet.length; i++) {
            const dot = testSet.at(i);
            absoluteError += dot.f(m, b) - dot.y;
        }
        return absoluteError / testSet.length;
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
        plotly.plot(data, graphOptions, msg => console.log(msg));
    }

}

async function main() {
    try {
        const alpha = 1*(10**-4);
        const n = 1*(10**5);
        const LR = new LinearRegression(alpha, n, 0.25, 5);
        await LR.readData("./data/linear-regression2.csv");
        const start = performance.now();
        LR.separateTrainingAndTesting();
        LR.separateBatches();
        LR.training();
        const end = performance.now()
        console.log(end - start);
        console.log("m =", LR.m);
        console.log("b =", LR.b);
        console.log("L =", LR.error());
        // LR.plotGraph();
    } catch(e) {
        console.error(e);
        exit(1);
    }
}

main();
