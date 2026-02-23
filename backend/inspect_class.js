const fs = require('fs');
const pdf = require('pdf-parse');

const logFile = 'class_inspect.txt';
const log = (msg) => {
    fs.appendFileSync(logFile, msg + '\n');
    console.log(msg);
};

async function test() {
    try {
        log('--- Inspecting pdf-parse v2 ---');
        log('Keys: ' + Object.keys(pdf).join(', '));

        if (pdf.default) {
            log('default export exists. Type: ' + typeof pdf.default);
        }

        const PDFParse = pdf.PDFParse;
        if (PDFParse) {
            log('PDFParse export found. Type: ' + typeof PDFParse);
            try {
                const buffer = Buffer.from('dummy pdf content');

                // Try instantiating
                log('Attempting new PDFParse(buffer)...');
                const instance = new PDFParse(buffer);
                log('Instance created.');
                log('Instance keys: ' + Object.keys(instance).join(', '));

                const proto = Object.getPrototypeOf(instance);
                log('Prototype keys: ' + Object.getOwnPropertyNames(proto).join(', '));

                // Check if instance is a promise (weird but possible)
                if (instance instanceof Promise || typeof instance.then === 'function') {
                    log('Instance is a Promise/Thenable.');
                    const result = await instance;
                    log('Promise resolved to: ' + typeof result);
                    log('Result keys: ' + Object.keys(result || {}).join(', '));
                }

            } catch (instError) {
                log('Instantiation error: ' + instError.message);
            }
        } else {
            log('PDFParse export NOT found.');
        }
    } catch (e) {
        log('Global error: ' + e.message);
    }
}

test();
