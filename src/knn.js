const fs = require("fs");
const { parse } = require("csv");

class Patient {
    constructor(data) {
        this.id = data[0]; // Integer
        this.diagnosis = data[1]; // 'M' or 'B'
        this.radius = data[2];
        this.texture = data[3];
        this.perimeter = data[4];
        this.area = data[5];
        this.smoothness = data[6];
        this.compactness = data[7];
        this.concavity = data[8];
        this.concave = data[9];
    }

    calculateDistance(patient) {
        let sum = 0;
        const start = 2;
        const end = 10;
        const patient1 = Object.values(this);
        const patient2 = Object.values(patient);

        for (let i = start; i < end; i++) {
            sum += Math.abs(patient1[i] - patient2[i]);
        }

        return sum / (end - start);
    }
}

async function main() {
    const dataset = []

    await new Promise((resolve, reject) => {
        fs
            .createReadStream("./data/breast-cancer.csv")
            .pipe(parse({ delimiter: ",", from_line: 2 }))
            .on("data", (row) => {
                dataset.push(new Patient(row))
            })
            .on("end", resolve)
            .on("error", reject)
    })


    const k = 10;
    const n = 300;
    const trainingSet = dataset.slice(0, n);
    const testSet = dataset.slice(n, dataset.length);

    let errors = 0;
    for (const patient of testSet) {
        trainingSet.forEach(dataPatient => dataPatient.distance = dataPatient.calculateDistance(patient))
        trainingSet.sort((firstPatient, secondPatient) => firstPatient.distance - secondPatient.distance)
        const kMin = trainingSet.slice(0, k);
        const ym = kMin.reduce((accumulator, patient) => {
            const diagnosis = patient.diagnosis === 'B' ? 1 : -1;
            return accumulator + diagnosis;
        }, 0)
        patient.testDiagnosis = ym >= 0 ? 'B' : 'M';

        if (patient.testDiagnosis !== patient.diagnosis) {
            errors++
            console.log(`Prediction = ${patient.testDiagnosis} || Expected = ${patient.diagnosis}`)
        };
    }

    const precision = (testSet.length - errors) / testSet.length * 100;

    console.log("Errors = " + errors)
    console.log("Precision = " + precision.toFixed(2) + '%')
}

main();