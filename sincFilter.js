"use strict";

function GenFilter(k) {
    var taps = []
    for (var i = 0.5-k/2.0; i < k/2.0; i+=1.0) {
      let t = Math.sin(2*Math.PI*i/k) / (2*Math.PI*i/k);
      taps.push(t);
    }
    var gain = taps.reduce(function(a, b) { return a + b; })
    taps = taps.map(function(a) { return a / gain })
    return taps
  }

  function Filter(ary, taps) {
    if (ary.length < taps.length) {
      var gain = taps.slice(0, ary.length).reduce(function(a, b) { return a + b; })
      taps = taps.map(function(a) { return a / gain })
    }
    return ary.reduce(function(a, b, i) { return a + b*taps[i] }, 0)
  }

  function *sincFilter(k,sample){
      let taps = GenFilter(k);
      let ary=[];
      ary.push(sample);
      while(true){
        if (ary.length < taps.length) {
            var gain = taps.slice(0, ary.length).reduce(function(a, b) { return a + b; })
            taps = taps.map(function(a) { return a / gain })
          }
          let result = ary.reduce(function(a, b, i) { return a + b*taps[i] }, 0);
          sample = yield(result);
          ary.push(sample);
          if(ary.length > taps.length){
          ary.shift();
          }
      }
  }

  module.exports.sincFilter = sincFilter;