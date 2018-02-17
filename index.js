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

// //raw data plot
//  for(file in files){
//       plot(files[file]);
//  }   



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
    let incremental = highpassfilter.hpf(0, 0.3, 0);
    const weightDC = .9;
    const weightEnv = .1;
    let envelope = highpassfilter.envelope(0, weightDC, weightEnv);
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
        let env = envelope.next(M[magnatude]);
        let envThreshold = env.value / 4.0;
        let threshold = envThreshold > 0.2 ? envThreshold : 0.2;
        let fast = fastAvg.next(M[magnatude]).value;
        let slow = slowAvg.next(M[magnatude]).value;
        let sincF = fastSinc.next(M[magnatude]).value;
        let sincS = slowSinc.next(M[magnatude]).value;
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


    //     var filter = new dsp.IIRFilter(dsp.LP12, 3,3, 100);
    //     X=normalize.normalize(X);
    //     Y=normalize.normalize(Y);
    //     Z=normalize.normalize(Z);
    //     M=normalize.normalize(M);

    //     filter.process(X);
    //     filter.process(Y);
    //     filter.process(Z);
    //     filter.process(M);

    //     smoothed = data.map((val, index, arr) => {
    //         let result = [val.split(',')[0], X[index], Y[index], Z[index],M[index]];
    //         return (result);
    //     });

    //     let cleaned = smoothed.filter(function (element, i, smoothed) {
    //         return (!isNaN(element[1])); //don't keep NaNs
    //     });

    //     cleaned = cleaned.map((val, index, arr) => {
    //         return (val + '\n');
    //     });

    //     fs.writeFileSync(`smooth_${files[file]}.csv`, cleaned.join(''), 'utf-8');


    //     let raw4 = data.map((val, index, arr) => {
    //         let x = parseFloat(val.split(',')[1], 10);
    //         let y = parseFloat(val.split(',')[2], 10);
    //         let z = parseFloat(val.split(',')[3], 10);
    //         let m = Math.sqrt(x*x+y*y+z*z);
    //         let ts = new Date(Date.parse(val.split(',')[0])).toISOString();
    //         ts = ts.substring(0, ts.length - 1).replace("T"," ");
    //         return (`"${ts}",${x},${y},${z},${m}\n`);
    //     });
    //     fs.writeFileSync(`raw4_${files[file]}.csv`, raw4.join(''), 'utf-8');


    //     // plot(`smooth_${files[file]}.csv`);
    //    // plot(`raw4_${files[file]}.csv`);


    //     let mean =  M.reduce((a,b) => a+b,0)/M.length;
    //     var lastStep = 0;
    //     var stepCount = 0;
    //     let steps = M.map((val,index,arr) => {
    //          let ts = new Date(Date.parse(raw4[index].split(',')[0])).toISOString();
    //          ts = ts.substring(0, ts.length - 1).replace("T"," ");
    //          let step = (val > mean) ? 2:0;
    //            if((lastStep == 0) && step == 2 ){
    //               stepCount ++;
    //            }
    //            lastStep = step;
    //            return(`"${ts}",${val},${step}\n`);
    //     });
    // fs.writeFileSync(`steps.csv`, steps.join('\n'), 'utf-8');
    // // console.log(files[file],stepCount);



  //      plot('steps.csv');

    break;

}