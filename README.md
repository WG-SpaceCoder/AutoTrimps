# AutoTrimps
Automation script for the idle incremental game Trimps  


<b> UPDATED URL - see instructions below - scripts are now served from zininzinin.github.io/AutoTrimps/ </b>

<b>Please backup your game via export before and during use to prevent losing your save due to corruption!  </b><br>

<b>Recent changes:</b>
2/22/2016 - Update 2
- (Experimental) added siphonology logic. You should see lower level maps being used when you are pushing through more difficult content if you have the siphonology perk.
- (Experimental) added a failsafe difficulty check to void maps. If the boss of a void map can 1-shot you in nostance, it should not be attempted.
- Added UI option for max toxicity stacks. When this mode is on, during a toxicity run the script will get max tox stacks before killing an improbability (so zones 60 and above only). You generally only turn this on for one run to get a very large total helium value for purchasing bone portals. The helium per hour will be terrible and the run itself will take over 24 hours minimum.
- Clicking on the zone timer will now toggle the paused mode.
- Script will no longer continue to run the block trying to get shieldblock.
- Removed the while loop that fired geneticists to speed breed time in case it was related to game freezing issue

2/22/2016
- Nursery purchases will now be limited by cost of collectors before warpstations are unlocked
- Couple of nursery purchase bugs fixed
- Fixed a bug with wormholes being purchased before they were unlocked
- Fixed a bug where autostance was using dominance before it was available

2/21/2016
 - Void maps option. For now just a manual entry of what zone you want all your void maps completed. If you are on a tox run, it will get max tox stacks first.
 - New option for number of wormholes to purchase
 - New option for breed firing (see below)
 - Tooltips are no longer spam closed on buying upgrades or buildings.
 - Fix for gateway/collector housing issues. Building logic will no longer consider purchasing gateways if they cannot be afforded right now. This will hopefully prevent the suspension of all housing purchases to collect fragments to buy a gateway.
 - (Experimental)Several logic changes to improve helium per hour, mostly focused around avoiding pauses to wait for breeding to fill the bar. Included in this is a new option that will fire all lumberjacks and miners to get them breeding when needed. 
 - Adjusted Automation settings sizes to be slightly smaller, 6 per row
 - Adjusted colors for dark theme. Must reload while dark theme is active.
 - Misc bugfixes


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
```
javascript:with(document)(head.appendChild(createElement('script')).src='https://zininzinin.github.io/AutoTrimps/AutoTrimps2.js')._
```
You can also paste V2 into the console of the page. Geez so many options :/

Feel free to submit any bugs/suggestions as issues here on github.
  
I'm going to open up my discord channel for chat. Here is the link if you would like to come hang and chat about AutoTrimps:  
https://discord.gg/0VbWe0dxB9kIfV2C  
