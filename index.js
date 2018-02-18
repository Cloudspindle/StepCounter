"use strict";
var fs = require('fs');
var glob = require('glob-fs')({
    gitignore: true
});
var sleep = require('sleep');
var plot = require('./plot.js');
var deltat = require('./deltat.js');
var dsp = require('./dsp.js');
var highpassfilter = require('./highpass.js');
var sinc = require('./sincFilter.js');
var smoother = require('./smooth.js');
var normalize = require('./normalize.js');
var files = glob.readdirSync('/10*.csv');


// // jitter plot
// var intervals = deltat(files[0]);
// fs.writeFileSync('temp.csv',intervals.join(''),'utf-8');
// var deltaPlot =  require('child_process').spawn('gnuplot');
// deltaPlot.stdin.write('gnuplot -p\n'); 
// deltaPlot.stdin.write('plot "temp.csv" using 1:2 with points pointtype 6 ps 2 lc rgb "red" \n');


for (let file in files) {
    var X = [],
        Y = [],
        Z = [],
        M = [],
        record,
        smoothed = [];
    let data = fs.readFileSync(files[file], 'utf8').split('\n').filter(Boolean);
    for (let line in data) {
        record = data[line].split(',');
        let x = parseFloat(record[1], 10);
        let y = parseFloat(record[2], 10);
        let z = parseFloat(record[3], 10);
        let m = Math.sqrt(x * x + y * y + z * z);

        X.push(x);
        Y.push(y);
        Z.push(z);
        M.push(m);
    }
    //incremental step counter;
    let steps = [];
    const weightDC = .99;
    const weightEnv = .01;

    let incremental = highpassfilter.hpf(0, 0.3, 0);
    let envelope = highpassfilter.envelope(1, weightDC, weightEnv);
    let smooth = smoother.smooth(1, 8);
    let fastAvg = smoother.expAvg(1, 0.5);
    let slowAvg = smoother.expAvg(1, 0.125);
    let fastSinc = sinc.sincFilter(8,1);
    let slowSinc = sinc.sincFilter(32,1);

    let last = 0;
    let step = 1;
    let mean = 0;
    let previousDifference = 0;
    let stepCount = 0;
    let lastEdge = 0;
    for (let magnatude in M) {
        let highpass = incremental.next(M[magnatude]);
        let smoothed = smooth.next(highpass.value);
        let fast = fastAvg.next(M[magnatude]).value;
        let slow = slowAvg.next(M[magnatude]).value;
        let sincF = fastSinc.next(M[magnatude]).value;
        let sincS = slowSinc.next(M[magnatude]).value;
        let env = envelope.next(sincS);
    
        let envThreshold = env.value / 4.0;
        let threshold = envThreshold > 0.3 ? envThreshold : 0.3;
        var difference = Math.abs(sincF - sincS);
        let isEdge = previousDifference < threshold && difference >= threshold;
        if (isEdge) {
            step = 1;
            if (lastEdge == -1) {
                stepCount++;
            }
        } else {
            step = -1;
        }
        lastEdge = step;

        previousDifference = difference

        last = smoothed.value;
        console.log(M[magnatude],smoothed.value, sincF, sincS,difference, env.value, step, stepCount);
    }


    break;

}