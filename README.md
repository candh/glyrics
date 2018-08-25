# glyrics
A terminal thingy to get lyrics of a track from genius.com 

[![npm](https://img.shields.io/npm/dm/glyrics.svg)](https://www.npmjs.com/package/glyrics)
[![npm](https://img.shields.io/npm/v/glyrics.svg)](https://www.npmjs.com/package/glyrics)
[![Twitter Follow](https://img.shields.io/twitter/follow/candhforlife.svg?style=social&label=Follow)]()

## Why
It was just getting tiring looking up lyrics like... okay maybe not that much maybe I was just bored and made this to kill time.

## Install 
    $ [sudo] npm install glyrics -g
    
## Usage
    $ glyrics "track name"
and then follow onscreen instructions

<p align="center"> 
<img src="./glyrics-demo.gif?raw=true">
</p>

## TODO

* [ ] Make a GUI with all the genius.com features like viewing annotations and stuff

## Contribution 
You know what to do.. Just do any of the todos or add your own thing. Fork, make a new branch with your feature, submit a pull request!


## Changelog
Added changelog in version 1.4.0, No changelog for older versions, Sorry 😕

**1.6.0**
+ Bracket [] hightlighting for things like [Verse], [Chorus]. Makes it easier to read
+ Refactoring and stuff
+ Added LICENSE

**1.5.0**

+ Not using `node-genius` anymore.
+ Displays a more user friendly error if something goes wrong. (not dev friendly)

**1.4.0**

+ Added a scrollable box (easier to read)
+ Removed manual typing of number for selection of songs. Now using key arrows to navigate through the list of tracks
+ Some other minor UI improvements

## Notes
Works on Mac, Linux and even Android (Tested on termux). Install by `yarn global add glyrics` on Android.

## By
[@candhforlife](https://twitter.com/candhforlife) 
PS: Please follow me I'm losing followers because I don't tweet that much 😢 
