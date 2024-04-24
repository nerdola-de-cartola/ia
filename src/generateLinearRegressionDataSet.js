const { writeToCSV } = require("./helpers");
const fs = require("fs");

function generateRandomArray(n, bias, mod) {
    const r = [];

    for(let i = 0; i < n; i++) {
        const el = (Math.random() - bias) * mod;
        r.push(el);
    }

    return r;
}

function linearEquation(x, W, b) {
    if(x.length !== W.length) throw "Input and weigths have different size";

    let y = b;
    for(let i = 0; i < x.length; i++) {
        y += x[i]*W[i];
    }

    return y;
}

function generateLinearRegressionDataSet(W, b, n, noise) {
    const MAX_INTERVAL = 10**1;
    const BIAS = 0.5;
    const X = [];
    const Y = [];

    for(let i = 0; i < n; i++) {
        const x = generateRandomArray(W.length, BIAS, MAX_INTERVAL);
        const y = linearEquation(x, W, b) + (Math.random() - 0.5) * noise;
        X.push(x);
        Y.push(y);
    }

    return [X, Y];
}

function main() {
    const W = [1, 1];
    const b = 0;
    const noise = 0.5;

    const [X, Y] = generateLinearRegressionDataSet(W, b, 300, noise);
    
    const data = X.map((x, i) => [...x, Y[i]])

    writeToCSV(data, ["x0", "x1", "y"]);

    const modelObj = {
        type: "linear",
        W,
        b,
    }
    const jsonStr = JSON.stringify(modelObj);
    fs.writeFileSync('model/lr.json', jsonStr);
}

main()