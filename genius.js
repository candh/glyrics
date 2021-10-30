#!/usr/bin/env node
const blessed = require("blessed");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const process = require("process");
const request = require("request");
const colors = require("colors");
const inquirer = require("inquirer");

const spinner = require("ora")({
  text: "Searching for tracks...",
  spinner: "arc",
  color: "cyan",
});

// get the track name
const query = process.argv[2];
if (!query) {
  spinner.text = "No track provided";
  console.log("Usage: glyrics 'track name'");
  spinner.fail();
  process.exit(1);
}

const options = {
  method: "GET",
  url: "https://api.genius.com/search",
  qs: {
    q: query,
    access_token:
      "UARllo5N6CLQYVlqFwolyauSlYiyU_07YTg7HGHkWRbimN4GWPJehPP5fzu9lXeO",
  },
};

(function () {
  // start the spinner
  spinner.start();

  // search the track
  request(options, (error, response, body) => {
    if (error) {
      spinner.text = "Something went wrong 😢";
      spinner.fail();
      return;
    }
    // collect the results in the hits array
    const hits = JSON.parse(body).response.hits;

    if (hits.length) {
      spinner.succeed();

      // formatting all the results
      const results = hits.map(
        (element) =>
          // prettier-ignore
          `${colors.red.bold("[")}${element.result.full_title}${colors.red.bold("]")}`
      );

      // ask the user which track they want the lyrics for
      inquirer
        .prompt([
          {
            type: "list",
            name: "track",
            message: "Select a track >>>",
            choices: results,
            pageSize: results.length,
          },
        ])
        .then((answers) => {
          const answer = results.indexOf(answers.track);
          const path = hits[answer].result.path;
          const title = hits[answer].result.full_title;
          const url = `https://genius.com${path}`;

          spinner.clear();
          spinner.text = "Fetching lyrics...";
          spinner.start();

          const resources = new jsdom.ResourceLoader({
            userAgent:
              "Mozilla/5.0 (iPhone; CPU iPhone OS 10_3 like Mac OS X) AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75 Mobile/14E5239e Safari/602.1"
          });

          JSDOM.fromURL(url, { resources })
            .then((dom) => {
              // stop the spinner
              spinner.succeed();

              // formatting the output header
              // prettier-ignore
              const output = `${"_".repeat(title.length + 1)}\n\n${title}\n${url}\n${"_".repeat(title.length + 1)}`;

              // create a new screen
              const screen = blessed.screen({
                smartCSR: true,
              });

              const doc = dom.window.document;
              const scripts = doc.getElementsByTagName("script");

              let preloaded_state;
              for (const script of scripts) {
                if (script.innerHTML.trim().startsWith("window.__PRELOADED_STATE__")) {
                  preloaded_state = script.outerHTML;
                  break;
                }
              }

              let lyrics;
              try {
                if (!preloaded_state) throw new Error();
                const dom = new JSDOM(preloaded_state, { runScripts: "dangerously" });
                const lyrics_html = dom.window.__PRELOADED_STATE__.songPage.lyricsData.body.html
                if (!lyrics_html) throw new Error();
                const lyrics_tag = dom.window.document.createElement("div");
                lyrics_tag.innerHTML = lyrics_html;
                lyrics = lyrics_tag.textContent.trim().split("\n")
              } catch (e) {
                spinner.text = `Couldn't get lyrics. Sorry!\nPlease visit ${url} in your browser.`.red.bold;
                spinner.fail();
                process.exit();
              }

              // highlighting things like [Verse], [Chorus] etc
              const pattern = /^\[(.*?)\]$/g;
              lyrics = lyrics
                .map((el) => (el.match(pattern) ? colors.green.bold(el) : el))
                .join("\n");

              // create a scrollable box
              const box = blessed.box({
                width: "70%",
                height: "80%",
                left: "center",
                top: "center",
                scrollable: true,
                scrollbar: {
                  ch: " ",
                  inverse: true,
                },
                alwaysScroll: true,
                keys: true,
                vi: true,
                content: `${colors.green.bold(output)}\n\n${lyrics}`,
              });

              // Append our box to the screen.
              screen.append(box);

              // Focus our element.
              box.focus();

              // Render the screen.
              screen.render();

              // on screen close
              screen.key(["escape", "q", "C-c"], function (ch, key) {
                return process.exit(0);
              });
            })
            .catch((err) => {
              spinner.stop();
              console.log(err);
            });
        });
    } else {
      // when no track with the provided title is found
      spinner.text = "No tracks found with this title\n".red.bold;
      spinner.fail();
      process.exit();
    }
  });
})();
