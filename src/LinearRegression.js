const fs = require("fs");
const { parse } = require("csv");
const { shuffle } = require("./helpers");
const { SubArray } = require("./SubArray");
const { Console } = require("console");

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
        this.W = [];
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

        if(!this.W.length) {
            this.W = batches[0].at(0).x.map(() => 0);
        }

        for (let i = 0; i < learningSteps; i++) {
            let sumW = this.W.map(() => 0);
            let sumB = 0;

            const batch = batches[i % batches.length];

            for (let j = 0; j < batch.length; j++) {
                const dot = batch.at(j);
                const dif = dot.f(this.W, this.b) - dot.y;
                sumB += dif;
                
                for(let k = 0; k < sumW.length; k++) {
                    sumW[k] += dif * dot.x[k];
                }
            }

            const dLossB = 2 / batch.length * sumB;
            const dLossW = sumW.map((sum) => 2 / batch.length * sum);

            this.b -= dLossB * learningRate;
            
            for(let j = 0; j < this.W.length; j++) {
                this.W[j] -= dLossW[j] * learningRate
            }            
        }
    }

    error() {
        const {testSet, W, b} = this;

        if(!testSet.length) throw "Test set was not defined yet";

        let absoluteError = 0;
        for (let i = 0; i < testSet.length; i++) {
            const dot = testSet.at(i);
            absoluteError += Math.abs(dot.f(W, b) - dot.y);
        }
        return absoluteError / testSet.length;
    }

    saveFile(filename="model/lr.json") {
        const modelObj = {
            type: "linear",
            W: this.W,
            b: this.b,
        }
        const jsonStr = JSON.stringify(modelObj);
        fs.writeFileSync(filename, jsonStr);
    }

    loadFile(filename="model/lr.json") {
        const data = JSON.parse(fs.readFileSync(filename));
        this.W =  data.W;
        this.b =  data.b;
    }
}

class Dot {
    constructor(data) {
        this.x = [];
        this.y = 0;
        
        if(data.length < 2) throw "A dot needs at least 2 dimensions got " + data.length;

        for(let i = 0; i < data.length - 1; i++) {
            this.x.push(Number(data[i]))
        }

        this.y = data[data.length-1];
    }

    f(W, b) {
        let y = b;

        if(W.length !== this.x.length)
            throw "Weight and parameters needs to have the same dimensions, got " + W.length + " and " + this.x.length;

        for(let i = 0; i < this.x.length; i++) {
            y += (this.x[i] * W[i]);
        }

        return y;
    }
}

module.exports  =  { LinearRegression }