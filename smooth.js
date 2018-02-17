 "use strict";

 function* smooth(sample, run) {
     let samples = [];
     samples.push(sample);
     while (true) {
         samples.push(sample)
         let length = samples.length;
         let sum = samples.reduce((a, b) => a + b, 0);
         let smoothed = sum / length;
         sample = yield(smoothed);
         if (length >= run) {
             samples.shift();
         }
     }
 }

 //  fastAvg = ExpAvg(sample, fastAvg, 0.25)
 //     slowAvg = ExpAvg(sample, slowAvg, 0.0625)
 //     var difference = Math.abs(fastAvg - slowAvg)
 //     isEdge = prevDifference < threshold && difference >= threshold
 //     edges.push(isEdge)


 function* expAvg(sample, w) {
     let avg = 0;
     let weight = w;
     while (true) {
         avg = weight * sample + (1 - weight) * avg;
         sample = yield(avg);
     }
 }

 module.exports = {
     smooth,
     expAvg
 }