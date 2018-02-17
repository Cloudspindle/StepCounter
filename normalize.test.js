normalize = require('./normalize.js');

describe("normalize",() => {
  it("should normalize 0,0,0,0 to 0,0,0,0",() => {
     let norm = [0,0,0,0];
     let normed = normalize.normalize(norm);
     expect(normed).toEqual(norm);
  })
  it("should normalize 1,1,1,1 to 0,0,0,0",() => {
    let norm = [1,1,1,1];
    let normed = normalize.normalize(norm); //array of constants should normalize to all zeros
    expect(normed).toEqual([0,0,0,0]);
 })
 it("should normalize 123,123,123,123 to 0,0,0,0",() => {
    let norm = [123,123,123,123];
    let normed = normalize.normalize(norm); //array of constants should normalize to all zeros
    expect(normed).toEqual([0,0,0,0]);
 })

 it("should normalize 1,2,3,4 to 0,0,0,0",() => {
    let norm = [1,2,3,4,5,6,7,8,9,10];
    let normed = normalize.normalize(norm); //array of constants should normalize to all zeros
    let ave_normed = normed.reduce(function(a, b) { return a + b; })/normed.length; //average of normalized sequence should be close to 0
    expect(ave_normed).toBeCloseTo(0.0);
 })


})