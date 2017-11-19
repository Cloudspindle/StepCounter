var fs = require('fs');
var glob = require('glob-fs')({
    gitignore: true
});
var sleep = require('sleep');
var plot = require('./plot.js');
var deltat = require('./deltat.js');
var dsp = require('./dsp.js');
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


for (file in files) {
    console.log(files[file]);
    var X = [],
        Y = [],
        Z = [],
        M = [],
        record,
        smoothed = [];
    let data = fs.readFileSync(files[file], 'utf8').split('\n').filter(Boolean);
    for (line in data) {
        record = data[line].split(',');
        let x = parseFloat(record[1], 10);
        let y = parseFloat(record[2], 10);
        let z = parseFloat(record[3], 10);
        let m = Math.sqrt(x*x+y*y+z*z);
        
        X.push(x);
        Y.push(y);
        Z.push(z);
        M.push(m);
    }

    var filter = new dsp.IIRFilter(dsp.LP12, 3,3, 100);
    X=normalize.normalize(X);
    Y=normalize.normalize(Y);
    Z=normalize.normalize(Z);
    M=normalize.normalize(M);
    
    filter.process(X);
    filter.process(Y);
    filter.process(Z);
    filter.process(M);
    
    smoothed = data.map((val, index, arr) => {
        let result = [val.split(',')[0], X[index], Y[index], Z[index],M[index]];
        return (result);
    });

    let cleaned = smoothed.filter(function (element, i, smoothed) {
        return (!isNaN(element[1])); //don't keep NaNs
    });

    cleaned = cleaned.map((val, index, arr) => {
        return (val + '\n');
    });

    fs.writeFileSync(`smooth_${files[file]}.csv`, cleaned.join(''), 'utf-8');


    let raw4 = data.map((val, index, arr) => {
        let x = parseFloat(val.split(',')[1], 10);
        let y = parseFloat(val.split(',')[2], 10);
        let z = parseFloat(val.split(',')[3], 10);
        let m = Math.sqrt(x*x+y*y+z*z);
        let ts = new Date(Date.parse(val.split(',')[0])).toISOString();
        ts = ts.substring(0, ts.length - 1).replace("T"," ");
        return (`"${ts}",${x},${y},${z},${m}\n`);
    });
    fs.writeFileSync(`raw4_${files[file]}.csv`, raw4.join(''), 'utf-8');
    
    // plot(`smooth_${files[file]}.csv`);
   // plot(`raw4_${files[file]}.csv`);

    let mean =  M.reduce((a,b) => a+b,0)/M.length;
    let steps = M.map((val,index,arr) => {
         let ts = new Date(Date.parse(raw4[index].split(',')[0])).toISOString();
         ts = ts.substring(0, ts.length - 1).replace("T"," ");
         let step = (val > mean) ? 2:0;
           return(`"${ts}",${val},${step}\n`);
    });
    fs.writeFileSync(`steps.csv`, steps.join(''), 'utf-8');
    plot('steps.csv');


    break;

}
