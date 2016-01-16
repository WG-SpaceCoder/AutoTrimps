# AutoTrimps  
Automation for the idle incremental game 'Trimps'  
  
~Installation~  
<b>Please backup your game via export before and during use to prevent losing your save due to corruption!  </b><br>
If you encounter a non-functional script or error in the console after changing to a recent v2 UI version, please try wiping your settings by typing the following into the console (open console with CTRL-Shift-J in chrome, CTRL-shift-k in firefox):<br>
localStorage.removeItem('autoTrimpSettings') <br>
Then refresh page/reload script and choose your settings again.

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
