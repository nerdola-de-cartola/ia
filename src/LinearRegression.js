const fs = require("fs");
const { parse } = require("csv");
const { shuffle } = require("./helpers");
const { SubArray } = require("./SubArray");

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
            absoluteError += Math.abs(dot.f(m, b) - dot.y);
        }
        return absoluteError / testSet.length;
    }

    saveFile(filename="model/lr.json") {
        const modelObj = {
            type: "linear",
            W: this.m,
            b: this.b,
        }
        const jsonStr = JSON.stringify(modelObj);
        fs.writeFileSync(filename, jsonStr);
    }

    loadFile(filename="model/lr.json") {
        const data = JSON.parse(fs.readFileSync(filename));
        this.m =  data.W;
        this.b =  data.b;
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

module.exports  =  { LinearRegression }