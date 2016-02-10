# AutoTrimps  
Automation for the idle incremental game 'Trimps'  
  
~Installation~  
<b>Please backup your game via export before and during use to prevent losing your save due to corruption!  </b><br>


<b>Recent changes:</b>

- Added option to include a challenge in helium per hour autoPortal setting. For example with electricity runs where your helium/hr can continue to grow after clearing the challenge, you would select Helium Per Hour as your autoportal setting, and choose Electricity from the second dropdown that appears. AutoPortal won't portal with a challenge active, so any zones prior to finishing a challenge where your he/hr dropped won't cause a portal, but any after finishing the challenge will.

- (Experimental) Added an auto-portal option that unlocks after you clear zone 80. Support for repeatable challenges, helium per hour, and custom zone portals. Electricity and crushed options will require automaps to be on.

- Added a clear data button to graphs which will clear all data, excluding the current portal.

- Made some adjustments to geneticist timer code to avoid long delays waiting for breed bar to fill after purchasing large amounts of housing.

- Nom and Toxicity breed timer now set at 15 sec when using Manage breed timer option.

- On a toxicity run, manually entering the following into the console will force the script to get max toxicity stacks on all zones 60 and above, for a max helium run for bone portal:   heliumGrowing = true


-install greasemonkey/tampermonkey  
-Open the tampermonkey dashboard and go to utilities
-in the URL box paste https://raw.githubusercontent.com/zininzinin/AutoTrimps/master/user.js and import  
-go to https://trimps.github.io  
-profit?  
  
For more info or input post on the reddit forum: https://www.reddit.com/r/Trimps/comments/3yjsyq/autotrimps/  
  
I'm going to open up my discord channel for chat. Here is the link if you would like to come hang and chat about AutoTrimps:  
https://discord.gg/0VbWe0dxB9kIfV2C  
  
V2 is now bookmark compatible. Create new bookmark and set its target to:  
javascript:with(document)(head.appendChild(createElement('script')).src='https://rawgit.com/zininzinin/AutoTrimps/master/AutoTrimps2.js')._

You can also paste V2 into the console of the page. Geez so many options :/
