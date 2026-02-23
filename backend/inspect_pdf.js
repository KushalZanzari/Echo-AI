const fs = require('fs');
const util = require('util');

const logFile = fs.createWriteStream('inspect_output.txt', { flags: 'w' });
const logStdout = process.stdout;

console.log = function () {
    logFile.write(util.format.apply(null, arguments) + '\n');
    logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;

try {
    console.log('Requiring pdf-parse...');
    const pdf = require('pdf-parse');
    console.log('Type:', typeof pdf);
    if (typeof pdf === 'object') {
        console.log('Keys:', Object.keys(pdf));
        if (pdf.default) {
            console.log('Type of default:', typeof pdf.default);
        }
    } else {
        console.log('It is a function/primitive');
    }
} catch (e) {
    console.error('Error:', e);
}
