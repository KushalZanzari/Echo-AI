const fs = require('fs');
const util = require('util');

const logPath = 'pdf_debug_log.txt';
const logFile = fs.createWriteStream(logPath, { flags: 'w' });

function log(msg) {
    fs.appendFileSync(logPath, msg + '\n');
    console.log(msg);
}

try {
    log('--- Starting Inspection ---');
    const pdf = require('pdf-parse');
    log('Typeof pdf: ' + typeof pdf);

    if (typeof pdf === 'object') {
        log('Keys: ' + JSON.stringify(Object.keys(pdf)));
        log('Constructor name: ' + (pdf.constructor ? pdf.constructor.name : 'N/A'));

        // checking for common default patterns
        if (pdf.default) {
            log('pdf.default type: ' + typeof pdf.default);
        }
    } else {
        log('Is function? ' + (typeof pdf === 'function'));
    }

} catch (e) {
    log('Error: ' + e.message);
    log('Stack: ' + e.stack);
}
