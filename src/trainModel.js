const { LinearRegression } = require('./LinearRegression')

async function main() {
    const alpha = 1*(10**-4);
    const n = 1*(10**4);
    const LR = new LinearRegression(alpha, n, 0.25, 5);
    await LR.readData("./data/linear-regression2.csv");
    // LR.loadFile()
    const start = performance.now();
    LR.separateTrainingAndTesting();
    LR.separateBatches();
    LR.training();
    const end = performance.now()
    console.log("Training time = ", end - start);
    console.log("W =", LR.W);
    console.log("b =", LR.b);
    console.log("L =", LR.error());
    LR.saveFile()
}

main();
