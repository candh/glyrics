const jsdom = require('jsdom');
const process = require('process');
const Genius = require("node-genius");
// default token - you can generate your own at docs.genius.com
const geniusClient = new Genius('Wd5-iUH0HjDKBDY3PUztzeo-PiG-34FQKY9tkjH4XfLpG798We7M2blo3xGfQLAO');
const colors = require('colors')
const term = require('terminal-kit').terminal;
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let q = process.argv[2];
if (q == undefined || q == null || q == ""){
	console.log('\nNo song provided\n'.red.bold);
	process.exit();
}
function genius() {
    geniusClient.search(q, function(error, results) {
        let hits = JSON.parse(results).response.hits;
        hits.forEach(function(element, index) {
            console.log(`${index} >>`.green.bold, element.result.full_title)
        });

        rl.setPrompt("\nEnter track number >>> ".green)
        rl.prompt();

        rl.on('line', (line) => {
            line = parseInt(line)
          
            if (Array.apply(null, { length: hits.length }).map(Number.call, Number).indexOf(line) === -1) {
                console.log(`Not a valid track number, Please try again`.red);
                rl.prompt();
            } else {
            	let answer = line;
                console.log(`\nTrack Selected: ${answer}`);
                let path = hits[answer].result.path;
                let title = hits[answer].result.full_title;
                let url = `https://www.genius.com${path}`;

                jsdom.env(
                    `https://genius.com${path}`,
                    function(err, window) {
                        let output = `${'_'.repeat(title.length + 1)}\n\n${title}\n${url}\n${'_'.repeat(title.length + 1)}`
                        term.eraseDisplay();
                        term.bell();
                        console.log(output.green.bold);
                        let lyrics = window.document.getElementsByClassName('lyrics')[0].textContent.trim();

                        console.log(`\n${lyrics}\n`);
                        process.exit();
                    }
                );
            }
        }).on('close', () => {
            console.log('Bye 😘\n');
            process.exit(0);
        });
    });
}



module.exports = genius;
