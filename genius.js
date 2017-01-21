// requires and globals
const spinner = require('ora')({
    text: "Searching for tracks...",
    spinner: "arc",
    color: "cyan"
}).start();
// init the spinner
const blessed = require('blessed');
const jsdom = require('jsdom');
const process = require('process');
const Genius = require("node-genius");
// default token - you can generate your own at docs.genius.com
const geniusClient = new Genius('Wd5-iUH0HjDKBDY3PUztzeo-PiG-34FQKY9tkjH4XfLpG798We7M2blo3xGfQLAO');
const colors = require('colors')
const readline = require('readline');
const inquirer = require('inquirer');

// get the track name
let q = process.argv[2];
if (q == undefined || q == null || q == "") {
    spinner.text = "No track provided";
    spinner.fail();
    process.exit();
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function genius() {

    // search the track
    geniusClient.search(q, function(error, results) {
        if (error) {
            spinner.text = error;
            spinner.fail();
        }
        // collect the results in the hits array
        let hits = JSON.parse(results).response.hits;
        if (hits.length > 0) {
            spinner.succeed();

            // new array with just the titles (useful for looking up the index of the song in the hits array)
            // because in answer of the prompt we're not provided with the index of the song in the hits array

            arr = [];
            hits.forEach(function(element, index) {
                // format it a little bit
                arr.push(`${colors.red.bold('[')}${(element.result.full_title)}${colors.red.bold(']')}`);
            });


            // ask the user which track they want the lyrics for
            inquirer.prompt([{
                type: 'list',
                name: 'track',
                message: 'Select a track >>>',
                choices: arr,
                pageSize: arr.length
            }]).then(function(answers) {

                answer = arr.indexOf(answers.track);
                let path = hits[answer].result.path;
                let title = hits[answer].result.full_title;
                let url = `https://www.genius.com${path}`;

                spinner.clear();
                spinner.text = "Fetching lyrics..."
                spinner.start();

                // look up lyrics from the website
                jsdom.env(
                    `https://genius.com${path}`,
                    function(err, window) {
                        if (err) {
                            console.log(err);
                        }

                        spinner.succeed();

                        // formatting the output string
                        let output = `${'_'.repeat(title.length + 1)}\n\n${title}\n${url}\n${'_'.repeat(title.length + 1)}`;

                        // create a new screen
                        const screen = blessed.screen({
                            smartCSR: true
                        });

                        let lyrics = window.document.getElementsByClassName('lyrics')[0].textContent.trim();

                        // create a scrollable box
                        var box = blessed.box({
                            width: '85%',
                            height: '85%',
                            left: 'center',
                            top: 'center',
                            scrollable: true,

                            scrollbar: {
                                ch: ' ',
                                inverse: true
                            },
                            alwaysScroll: true,
                            keys: true,
                            vi: true,
                            content: `${colors.green.bold(output)}\n\n${lyrics}`
                        });

                        // Append our box to the screen.
                        screen.append(box);

                        // Focus our element.
                        box.focus();

                        // Render the screen.
                        screen.render();

                        // on screen close
                        screen.key(['escape', 'q', 'C-c'], function(ch, key) {
                            return process.exit(0);
                        });
                    }
                );
            });

        } else {
            // when no track with the provided title is found
            spinner.text = "No tracks found with this title\n".red.bold
            spinner.fail();
            process.exit();
        }
    });
}



module.exports = genius;
