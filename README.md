# AutoTrimps  
Automation script for the idle incremental game Trimps  

<b>Please backup your game via export before and during use to prevent losing your save due to corruption!  </b><br>

<b>Recent changes:</b>

2-16-2016
- Graphs now only update on-demand. This means when clicking the graphs button, or clicking the new refresh button while in the graphs.
- Enabled graphs zooming. Drag a box around area you wish to zoom in on. For those of you who didn't know, you can also toggle on/off series by clicking on the portal number on the right.
- Removed the resources graph and replaced it with a zone clear time graph. This graph shows your zone clear time in seconds. The x- axis value should correspond to the clear time for that zone (value at x-axis 10 is how long it took you to clear zone 10, in seconds).
- Graphs module should be able to be used stand-alone

some older date 2/10/2016?

- Added option to include a challenge in helium per hour autoPortal setting. For example with electricity runs where your helium/hr can continue to grow after clearing the challenge, you would select Helium Per Hour as your autoportal setting, and choose Electricity from the second dropdown that appears. AutoPortal won't portal with a challenge active, so any zones prior to finishing a challenge where your he/hr dropped won't cause a portal, but any after finishing the challenge will.

- (Experimental) Added an auto-portal option that unlocks after you clear zone 80. Support for repeatable challenges, helium per hour, and custom zone portals. Electricity and crushed options will require automaps to be on.

- Added a clear data button to graphs which will clear all data, excluding the current portal.

- Made some adjustments to geneticist timer code to avoid long delays waiting for breed bar to fill after purchasing large amounts of housing.

- Nom and Toxicity breed timer now set at 15 sec when using Manage breed timer option.

- On a toxicity run, manually entering the following into the console will force the script to get max toxicity stacks on all zones 60 and above, for a max helium run for bone portal:   heliumGrowing = true      Make sure to set it back to false after your long run(or reload).
  
~Installation~  
<b>Please backup your game via export before and during use to prevent losing your save due to corruption!  </b><br>

If you would like to use only the graphs module, replace AutoTrimps2.js with Graphs.js in the bookmark or your userscript.


-install greasemonkey/tampermonkey  
-Open the tampermonkey dashboard and go to utilities
-in the URL box paste https://raw.githubusercontent.com/zininzinin/AutoTrimps/gh-pages/user.js and import  
-go to https://trimps.github.io  
-profit?  
  
V2 is now bookmark compatible. Create new bookmark and set its target to:  
javascript:with(document)(head.appendChild(createElement('script')).src='https://zininzinin.github.io/AutoTrimps/AutoTrimps2.js')._

You can also paste V2 into the console of the page. Geez so many options :/

Feel free to submit any bugs/suggestions as issues here on github.
  
I'm going to open up my discord channel for chat. Here is the link if you would like to come hang and chat about AutoTrimps:  
https://discord.gg/0VbWe0dxB9kIfV2C  
