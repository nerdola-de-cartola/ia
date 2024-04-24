const { stringify } = require("csv");
const fs = require("fs");


function shuffle(array) { 
    return array.sort(() => Math.random() - 0.5); 
};

function writeToCSV(matrix, header, filename="data/data.csv") {
    const writableStream = fs.createWriteStream(filename);

    const stringifier = stringify({ header: true, columns: header });
    matrix.forEach(row => stringifier.write(row));
    stringifier.pipe(writableStream);
    console.log("Finished writing data");
}

module.exports = { shuffle, writeToCSV }