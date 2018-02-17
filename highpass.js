// let sample = 0;
// let last_sample = 0;
// let radians = 0;
// const EMA_a = 0.3; //exponential moving average
// let EMA_S = 0;
// let highpass = 0;
// let filteredValue = 0;
// let incrementalHighPass = 0;

function* hpf(sample, EMA_a, EMA_s) {
    let last_sample = sample;
    let local_EMA_a = EMA_a;
    let local_EMA_s = EMA_s;
    let EMA_S = 0;

    while (true) {
        last_sample = sample;
        EMA_S = (local_EMA_a * sample) + ((1 - local_EMA_a) * EMA_S); //run the EMA
        highpass = sample - EMA_S; //calculate the high-pass signal
        sample = yield(highpass);
    }
}

// let incremental = hpf(1, EMA_a, EMS_A);
// for (radians = Math.PI; radians < Math.PI * 2 * 10; radians += Math.PI / 10) {

//     //	Generate a test signal
//     last_sample = sample;
//     sample = 1 + Math.sin(radians) / 2;
//     EMA_S = (EMA_a * sample) + ((1 - EMA_a) * EMA_S); //run the EMA
//     highpass = sample - EMA_S; //calculate the high-pass signal
//     incrementalHighPass = incremental.next(sample);
//     console.log(sample, highpass, incrementalHighPass);
// }
//http://sam-koblenski.blogspot.com/search/label/DSP
function* removeDC(sample, w) {
    let weight = w;
    let avg = sample;
    while (true) {
        avg = weight * sample + (1 - weight) * avg
        sample = yield(sample - avg);
    }
}

function* envelope(sample, w_dc, w_env) {
    let wieghtDC = w_dc;
    let wieghtENV = w_env;
    let avg_env = sample;
    while (true) {
        let pos_sample = Math.abs(sample)
        avg_env = w_env * pos_sample + (1 - wieghtENV) * avg_env
        sample = yield(avg_env)
    }
}


module.exports = {
    hpf,
    envelope
};