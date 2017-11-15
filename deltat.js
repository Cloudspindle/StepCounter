var fs = require('fs');
var readline = require('readline');

function deltat(filename) {
    var lastTimeStamp = 0;
    var currentTimeStamp = 0;
    var results = [];
    var lines = require('fs').readFileSync(filename, 'utf-8')
        .split('\n')
        .filter(Boolean);

    for (line in lines) {
        var record = lines[line].split(',');
        if (lastTimeStamp != 0) {
            currentTimeStamp = Date.parse(record[0]);
            delta = currentTimeStamp - lastTimeStamp;
            results.push(`${lastTimeStamp}, ${delta}\n`);
        }
        lastTimeStamp = Date.parse(record[0]);
    }
    return (results);
}
module.exports = deltat;