const fs = require('fs');
const http = require('http');
const path = require('path');

// Create a dummy text file
const filePath = path.join(__dirname, 'test.txt');
fs.writeFileSync(filePath, 'Hello world testing upload');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

const postDataHead = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test.txt"\r\nContent-Type: text/plain\r\n\r\n`;
const postDataTail = `\r\n--${boundary}--\r\n`;

const fileContent = fs.readFileSync(filePath);

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/upload',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(postDataHead) + fileContent.length + Buffer.byteLength(postDataTail)
    }
};

console.log("Sending request to localhost:5000/api/upload...");

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log('BODY: ' + rawData);
        try {
            const parsed = JSON.parse(rawData);
            console.log("JSON Parsed Successfully:", parsed);
        } catch (e) {
            console.log("Response is NOT valid JSON.");
        }
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(postDataHead);
req.write(fileContent);
req.write(postDataTail);
req.end();
