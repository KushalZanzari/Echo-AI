const fs = require('fs');
try {
    const pdf = require('pdf-parse');
    const out = fs.createWriteStream('keys.txt');
    out.write('Type: ' + typeof pdf + '\n');
    out.write('Keys: ' + JSON.stringify(Object.keys(pdf)) + '\n');
    if (pdf.default) {
        out.write('Default Type: ' + typeof pdf.default + '\n');
        if (typeof pdf.default === 'object') {
            out.write('Default Keys: ' + JSON.stringify(Object.keys(pdf.default)) + '\n');
        }
    }
    out.end();
} catch (e) {
    fs.writeFileSync('keys.txt', 'Error: ' + e.message);
}
