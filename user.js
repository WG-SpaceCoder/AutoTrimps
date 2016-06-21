// ==UserScript==
// @name         AutoTrimps
// @namespace    https://github.com/zininzinin/AutoTrimps
// @version      2.1
// @description  Automate all the trimps!
// @author       zininzinin, spindrjr, Ishkaru
// @include        *trimps.github.io*
// @include        *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==

var script = document.createElement('script');
script.id = 'AutoTrimps-script';
script.src = 'https://zininzinin.github.io/AutoTrimps/AutoTrimps2.js';
document.head.appendChild(script);
