function plot(file,smooth) {
    if(!smooth){
        smooth = "";
    }
    var term = require('child_process').spawn('gnuplot');
    term.stdin.write(`gnuplot   -p\n`);
    term.stdin.write('set xdata time\n');
    term.stdin.write('set term X11\n');
    term.stdin.write('set timefmt "%Y-%m-%d %H:%M:%S"\n')
    term.stdin.write('set format x "%Y-%m-%d %H:%M:%S"\n');
    term.stdin.write('set datafile separator ","\n')
    term.stdin.write('set style line 1 lt rgb "red" lw 3\n');
    term.stdin.write('set style line 2 lt rgb "orange" lw 2\n');
    term.stdin.write('set style line 3 lt rgb "yellow" lw 3\n');
    term.stdin.write('set style line 4 lt rgb "green" lw 2\n');
    term.stdin.write('set style line 5 lt rgb "cyan" lw 3\n');
    term.stdin.write('set style line 6 lt rgb "blue" lw 2\n');
    term.stdin.write('set style line 7 lt rgb "violet" lw 3\n');
    term.stdin.write(`set title "${file}"\n`);
    
    term.stdin.write(`plot  "${file}"  using 1:2  ls 1 title "X" with lines,\
                        "${file}"  using 1:3  ls 4 title  "Y" with lines,\
                        "${file}"  using 1:4  ls 6 title  "Z" with lines,\
                        "${file}"  using 1:5  ls 2 title  "M" with lines ${smooth}\n`);
}
module.exports = plot;

