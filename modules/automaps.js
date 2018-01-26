MODULES["automaps"] = {};
//These can be changed (in the console) if you know what you're doing:
MODULES["automaps"].enoughDamageCutoff = 4; //above this the game will do maps for map bonus stacks
MODULES["automaps"].farmingCutoff = 16;     //above this the game will farm.
MODULES["automaps"].numHitsSurvived = 8;    //survive X hits in D stance or not enough Health.
MODULES["automaps"].LeadfarmingCutoff = 10; //lead has its own farmingCutoff
MODULES["automaps"].NomfarmingCutoff = 10;  //nom has its own farmingCutoff
MODULES["automaps"].NurseryMapLevel = 50;   //with blacksmithery, run map for nursery on this level
//if FarmWhenNomStacks7 setting is on   = [x, y, z];
MODULES["automaps"].NomFarmStacksCutoff = [7,30,100];
//[x] get maxMapBonus (10) if we go above (7) stacks on Improbability (boss)
//[y] go into maps on (30) stacks on Improbability (boss), farm until we fall under the 'NomfarmingCutoff' (10)
//[z] restarts your voidmap if you hit (100) stacks
MODULES["automaps"].MapTierZone = [70,47,16];    //descending order for these.
//                 .MapTier?Sliders = [size,difficulty,loot,biome];
MODULES["automaps"].MapTier0Sliders = [9,9,9,'Mountain'];   //Zone 70+ (9/9/9 Metal)
MODULES["automaps"].MapTier1Sliders = [9,9,4,'Mountain']; //Zone 47-70 (9/9/4 Metal)
MODULES["automaps"].MapTier2Sliders = [9,9,0,'Random'];   //Zone 16-47 (9/9/0 Random)
MODULES["automaps"].MapTier3Sliders = [9,0,0,'Random'];    //Zone 6-16 (9/0/0 Random)
MODULES["automaps"].preferGardens = true;   //prefer run Garden maps instead of ^^ if we have Decay done
MODULES["automaps"].maxMapBonus = 10;       //cap how many maps are run during Want More Damage mode
MODULES["automaps"].wantHealthMapBonus = 1; //cap how many maps are run during Want More Health mode
MODULES["automaps"].SpireFarm199Maps = true;   //this will farm spire on 199 maps instead of 200 maps when Map Reducer is bought
MODULES["automaps"].watchChallengeMaps = [15, 25, 35, 50];  //during 'watch' challenge, run maps on these levels:
MODULES["automaps"].shouldFarmCell = 59;
MODULES["automaps"].SkipNumUnboughtPrestiges = 2;   //exceeding this number of unbought prestiges will trigger a skip of prestige mode.


//Initialize Global Vars (dont mess with these ones, nothing good can come from it).
var stackingTox = false;
var doVoids = false;
var needToVoid = false;
var needPrestige = false;
var voidCheckPercent = 0;
var HDratio = 0;
var ourBaseDamage = 0;
var ourBaseDamage2 = 0;
var scryerStuck = false;
var shouldDoMaps = false;
var mapTimeEstimate = 0;
var lastMapWeWereIn = null;

//AutoMap - function originally created by Belaith (in 1971)
//anything/everything to do with maps.
function autoMap() {
    var customVars = MODULES["automaps"];
    //allow script to handle abandoning
    if(game.options.menu.alwaysAbandon.enabled == 1) toggleSetting('alwaysAbandon');
    //if we are prestige mapping, force equip first mode
    var prestige = autoTrimpSettings.Prestige.selected;
    if(prestige != "Off" && game.options.menu.mapLoot.enabled != 1) toggleSetting('mapLoot');
    //Control in-map right-side-buttons for people who can't control themselves. If you wish to use these buttons manually, turn off autoMaps temporarily.
    if(game.options.menu.repeatUntil.enabled == 2) toggleSetting('repeatUntil');
    if(game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
    if(game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');
    //exit and do nothing if we are prior to zone 6 (maps haven't been unlocked):
    if (!game.global.mapsUnlocked || !(baseDamage > 0)) {   //if we have no damage, why bother running anything? (this fixes weird bugs)
        enoughDamage = true; enoughHealth = true; shouldFarm = false;
        updateAutoMapsStatus();    //refresh the UI status (10x per second)
        return;
    }
    
    var AutoStance = getPageSetting('AutoStance');
    //if we are in mapology and we have no credits, exit
    if (game.global.challengeActive == "Mapology" && game.challenges.Mapology.credits < 1) return;
    //FIND VOID MAPS LEVEL:
    var voidMapLevelSetting = getPageSetting('VoidMaps');
    //decimal void maps are possible, using string function to avoid false float precision (0.29999999992). javascript can compare ints to strings anyway.
    var voidMapLevelSettingZone = (voidMapLevelSetting+"").split(".")[0];
    var voidMapLevelSettingMap = (voidMapLevelSetting+"").split(".")[1];
    if (voidMapLevelSettingMap === undefined || game.global.challengeActive == 'Lead')
        voidMapLevelSettingMap = 93;
    if (voidMapLevelSettingMap.length == 1) voidMapLevelSettingMap += "0";  //entering 187.70 becomes 187.7, this will bring it back to 187.70
    var voidsuntil = getPageSetting('RunNewVoidsUntil');
    needToVoid = voidMapLevelSetting > 0 && game.global.totalVoidMaps > 0 && game.global.lastClearedCell + 1 >= voidMapLevelSettingMap &&
                                    (game.global.world == voidMapLevelSettingZone ||
                                 (game.global.world >= voidMapLevelSettingZone && getPageSetting('RunNewVoids') && (voidsuntil == -1 || game.global.world <= voidsuntil)));
    if(game.global.totalVoidMaps == 0 || !needToVoid)
        doVoids = false;
    //calculate if we are behind on unlocking prestiges
    needPrestige = prestige != "Off" && game.mapUnlocks[prestige].last <= game.global.world - 5 && game.global.challengeActive != "Frugal";
    //dont need prestige if we are caught up, and have (2) unbought prestiges:
    if (getPageSetting('PrestigeSkipMode')) {
        var prestigeList = ['Dagadder','Megamace','Polierarm','Axeidic','Greatersword','Harmbalest','Bootboost','Hellishmet','Pantastic','Smoldershoulder','Bestplate','GambesOP'];
        var numUnbought = 0;
        for (var i=0,len=prestigeList.length; i < len; i++) {
            var p = prestigeList[i];
            if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
                numUnbought++;
        }
        if (numUnbought >= customVars.SkipNumUnboughtPrestiges) needPrestige = false;
    }

//START CALCULATING DAMAGES:
    //calculate crits (baseDamage was calced in function autoStance)    this is a weighted average of nonCrit + Crit. (somewhere in the middle)
    ourBaseDamage = (baseDamage * (1-getPlayerCritChance()) + (baseDamage * getPlayerCritChance() * getPlayerCritDamageMult()));
    //calculate with map bonus
    var mapbonusmulti = 1 + (0.20*game.global.mapBonus);
    //(autostance2 has mapbonusmulti built in)
    ourBaseDamage2 = ourBaseDamage; //keep a version without mapbonus
    ourBaseDamage *= mapbonusmulti;

    //get average enemyhealth and damage for the next zone, cell 50, snimp type and multiply it by a max range fluctuation of 1.2
    var enemyDamage;
    var enemyHealth;
    if (AutoStance<=1) {
        enemyDamage = getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.2);
        enemyDamage = calcDailyAttackMod(enemyDamage); //daily mods: badStrength,badMapStrength,bloodthirst
    } else {
        enemyDamage = calcBadGuyDmg(null,getEnemyMaxAttack(game.global.world + 1, 50, 'Snimp', 1.0),true,true); //(enemy,attack,daily,maxormin,[disableFlucts])
    }
    enemyHealth = getEnemyMaxHealth(game.global.world + 1,50);
    if(game.global.challengeActive == "Toxicity") {
        enemyHealth *= 2;
    }
    //Corruption Zone Proportionality Farming Calculator:
    var corrupt = game.global.world >= mutations.Corruption.start(true);
    if (getPageSetting('CorruptionCalc') && corrupt) {
        var cptnum = getCorruptedCellsNum();     //count corrupted cells
        var cpthlth = getCorruptScale("health"); //get corrupted health mod
        var cptpct = cptnum / 100;               //percentage of zone which is corrupted.
        var hlthprop = cptpct * cpthlth;         //Proportion of cells corrupted * health of a corrupted cell
        if (hlthprop >= 1)                       //dont allow sub-1 numbers to make the number less
            enemyHealth *= hlthprop;
        var cptatk = getCorruptScale("attack");  //get corrupted attack mod
        var atkprop = cptpct * cptatk;           //Proportion of cells corrupted * attack of a corrupted cell
        if (atkprop >= 1)
            enemyDamage *= atkprop;
        //console.log("enemy dmg:" + enemyDamage + " enemy hp:" + enemyHealth + " base dmg: " + ourBaseDamage);
    }
    // enter farming if it takes over 4 hits in D stance (16) (and exit if under.)
    if(!getPageSetting('DisableFarm')) {
        shouldFarm = enemyHealth > (ourBaseDamage * customVars.farmingCutoff);
        if(game.options.menu.repeatUntil.enabled == 1) toggleSetting('repeatUntil');    //turn repeat forever on if farming is on.
    }

    //Lead specific farming calcuation section:
    if(game.global.challengeActive == 'Lead') {
        ourBaseDamage /= mapbonusmulti;
        if (AutoStance<=1)
            enemyDamage *= (1 + (game.challenges.Lead.stacks * 0.04));
        enemyHealth *= (1 + (game.challenges.Lead.stacks * 0.04));
        //if the zone is odd:   (skip the +2 calc for the last level.
        if (game.global.world % 2 == 1 && game.global.world != 179){
             //calculate for the next level in advance (since we only farm on odd, and evens are very tough)
            enemyDamage = getEnemyMaxAttack(game.global.world + 2, 50, 'Chimp', 1.2);
            enemyHealth = getEnemyMaxHealth(game.global.world + 2, 50);
            ourBaseDamage /= 1.5; //subtract the odd-zone bonus.
        }
        //let people disable this if they want.
        if(!getPageSetting('DisableFarm')) {
            shouldFarm = enemyHealth > (ourBaseDamage * customVars.LeadfarmingCutoff);
        }
    }
    //Enough Health and Damage calculations:
    var pierceMod = (game.global.brokenPlanet && !game.global.mapsActive) ? getPierceAmt() : 0;
    const FORMATION_MOD_1 = game.upgrades.Dominance.done ? 2 : 1;
    //const FORMATION_MOD_2 = game.upgrades.Dominance.done ? 4 : 1;
    //asks if we can survive x number of hits in either D stance or X stance.
    enoughHealth = (baseHealth/FORMATION_MOD_1 > customVars.numHitsSurvived * (enemyDamage - baseBlock/FORMATION_MOD_1 > 0 ? enemyDamage - baseBlock/FORMATION_MOD_1 : enemyDamage * pierceMod));
    enoughDamage = (ourBaseDamage * customVars.enoughDamageCutoff > enemyHealth);

    //remove this in the meantime until it works for everyone.
/*     if (!wantToScry) {
        //enough health if we can survive 8 hits in D stance (health/2 and block/2)
        enoughHealth = (baseHealth/2 > 8 * (enemyDamage - baseBlock/2 > 0 ? enemyDamage - baseBlock/2 : enemyDamage * pierceMod));
        //enough damage if we can one-shot the enemy in D (ourBaseDamage*4)
        enoughDamage = (ourBaseDamage * 4) > enemyHealth;
        scryerStuck = false;
    } else {
        //enough health if we can pass all the tests in autostance2 under the best of the worst conditions.
        //enough damage if we can one-shot the enemy in S (ourBaseDamage/2)
        var result = autoStance2(true);
        enoughHealth = result[0];
        enoughDamage = result[1];
        scryerStuck = !enoughHealth;
    } */

    //Health:Damage ratio: (status)
    HDratio = enemyHealth / ourBaseDamage;
    updateAutoMapsStatus();    //refresh the UI status (10x per second)
    //var enoughHealth2enoughDamage2 = autoStanceCheck(false);

//BEGIN AUTOMAPS DECISIONS:
    //variables for doing maps
    var selectedMap = "world";
    var shouldFarmLowerZone = false;
    shouldDoMaps = false;
    //prevents map-screen from flickering on and off during startup when base damage is 0.
    if (ourBaseDamage > 0){
        shouldDoMaps = !enoughDamage || shouldFarm || scryerStuck;// || !enoughHealth2enoughDamage2[0];
    }

    if (mapTimeEstimate == 0) {
        var lastzone = lookUpZoneData(game.global.world-1);
    }

    var shouldDoHealthMaps = false;
    //if we are at max map bonus (10), and we don't need to farm, don't do maps
    if (game.global.mapBonus >= customVars.maxMapBonus && !shouldFarm)
        shouldDoMaps = false;
    else if (game.global.mapBonus >= customVars.maxMapBonus && shouldFarm)
        shouldFarmLowerZone = getPageSetting('LowerFarmingZone');
    //do (1) map if we dont have enough health
    else if (game.global.mapBonus < customVars.wantHealthMapBonus && !enoughHealth && !shouldDoMaps && !needPrestige) {
        shouldDoMaps = true;
        shouldDoHealthMaps = true;
    }

    //FarmWhenNomStacks7
    var restartVoidMap = false;
    if(game.global.challengeActive == 'Nom' && getPageSetting('FarmWhenNomStacks7')) {
        //Get maxMapBonus (10) if we go above (7) stacks on Improbability (boss)
        if (game.global.gridArray[99].nomStacks > customVars.NomFarmStacksCutoff[0]){
            if (game.global.mapBonus != customVars.maxMapBonus)
                shouldDoMaps = true;
        }
        //Go into maps on (30) stacks on Improbability (boss), farm until we fall under (10) H:D ratio
        if (game.global.gridArray[99].nomStacks == customVars.NomFarmStacksCutoff[1]){
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
        }
        //If we ever hit (100) nomstacks in the world, farm.
        if(!game.global.mapsActive && game.global.gridArray[game.global.lastClearedCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
        }
        //If we ever hit (100) nomstacks in a map (likely a voidmap), farm, (exit the voidmap and prevent void from running, until situation is clear)
        if(game.global.mapsActive && game.global.mapGridArray[game.global.lastClearedMapCell + 1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
            shouldFarm = (HDratio > customVars.NomfarmingCutoff);
            shouldDoMaps = true;
            restartVoidMap = true;
        }
    }
    
    //Disable Farm mode if we have nothing left to farm for (prevent infinite farming)
    if (shouldFarm && !needPrestige) {
        //check if we have cap to 10 equip on, and we are capped for all attack weapons
        var capped = areWeAttackLevelCapped();
        //check if we have any additional prestiges available to unlock:
        var prestigeitemsleft;
        if (game.global.mapsActive) {
            prestigeitemsleft = addSpecials(true, true, getCurrentMapObject());
        }
        else if (lastMapWeWereIn) {
            prestigeitemsleft = addSpecials(true, true, lastMapWeWereIn);
        }
        //check if we have unbought+available prestiges
        var prestigeList = ['Dagadder','Megamace','Polierarm','Axeidic','Greatersword','Harmbalest'];
        var numUnbought = 0;
        for (var i=0,len=prestigeList.length; i < len; i++) {
            var p = prestigeList[i];
            if (game.upgrades[p].allowed - game.upgrades[p].done > 0)
                numUnbought++;
        }
        //Disable farm mode, only do up to mapbonus.
        if (capped && prestigeitemsleft == 0 && numUnbought == 0) {
            shouldFarm = false;
            if (game.global.mapBonus >= customVars.maxMapBonus && !shouldFarm)
                shouldDoMaps = false;
        }
    }

    //stack tox stacks if we are doing max tox, or if we need to clear our void maps
    if(game.global.challengeActive == 'Toxicity' && game.global.lastClearedCell > 93 && game.challenges.Toxicity.stacks < 1500 && ((getPageSetting('MaxTox') && game.global.world > 59) || needToVoid)) {
        shouldDoMaps = true;
        //we will get at least 85 toxstacks from the 1st voidmap (unless we have overkill)
//            if (!game.portal.Overkill.locked && game.stats.cellsOverkilled.value)

        stackingTox = !(needToVoid && game.challenges.Toxicity.stacks > 1415);
        //force abandon army
        if(!game.global.mapsActive && !game.global.preMapsActive) {
            mapsClicked();
            mapsClicked();
        }
    }
    else stackingTox = false;

    //during 'watch' challenge, run maps on these levels:
    var watchmaps = customVars.watchChallengeMaps;
    var shouldDoWatchMaps = false;
    if (game.global.challengeActive == 'Watch' && watchmaps.indexOf(game.global.world) > -1 && game.global.mapBonus < 1){
        shouldDoMaps = true;
        shouldDoWatchMaps = true;
    }
    //Farm X Minutes Before Spire:
    var shouldDoSpireMaps = false;
    var needFarmSpire = game.global.world == 200 && game.global.spireActive && (((new Date().getTime() - game.global.zoneStarted) / 1000 / 60) < getPageSetting('MinutestoFarmBeforeSpire'));
    if (needFarmSpire) {
        shouldDoMaps = true;
        shouldDoSpireMaps = true;
    }
    //Run a single map to get nurseries when blacksmithery is purchased
    if (game.talents.blacksmith.purchased && game.buildings.Nursery.locked && game.global.world >= customVars.NurseryMapLevel) {
        shouldDoMaps = true;
        shouldDoWatchMaps = true;
    }

    //Dynamic Siphonology section (when necessary)
    //Lower Farming Zone = Lowers the zone used during Farming mode. Starts 10 zones below current and Finds the minimum map level you can successfully one-shot
    var siphlvl = shouldFarmLowerZone ? game.global.world - 10 : game.global.world - game.portal.Siphonology.level;
    var maxlvl = game.talents.mapLoot.purchased ? game.global.world - 1 : game.global.world;
    if (getPageSetting('DynamicSiphonology') || shouldFarmLowerZone){
        for (siphlvl; siphlvl < maxlvl; siphlvl++) {
            //check HP vs damage and find how many siphonology levels we need.
            var maphp = getEnemyMaxHealth(siphlvl) * 1.1;   // 1.1 mod is for all maps (taken out of the function)
            var cpthlth = getCorruptScale("health")/2; //get corrupted health mod
            if (mutations.Magma.active())
                maphp *= cpthlth;
            var mapdmg = ourBaseDamage2 * (game.unlocks.imps.Titimp ? 2 :  1); // *2 for titimp. (ourBaseDamage2 has no mapbonus in it)
            if (game.upgrades.Dominance.done && !getPageSetting('ScryerUseinMaps2'))
                mapdmg*=4;  //dominance stance and not-scryer stance in maps.
            if (mapdmg < maphp){
                break;
            }
        }
    }
    var obj = {};
    var siphonMap = -1;
    for (var map in game.global.mapsOwnedArray) {
        if (!game.global.mapsOwnedArray[map].noRecycle) {
            obj[map] = game.global.mapsOwnedArray[map].level;
            if(game.global.mapsOwnedArray[map].level == siphlvl)
                siphonMap = map;
        }
    }
    var keysSorted = Object.keys(obj).sort(function(a, b) {
        return obj[b] - obj[a];
    });
    //if there are no non-unique maps, there will be nothing in keysSorted, so set to create a map
    var highestMap;
    if (keysSorted[0])
        highestMap = keysSorted[0];
    else
        selectedMap = "create";

    //Look through all the maps we have - find Uniques and figure out if we need to run them.
    for (var map in game.global.mapsOwnedArray) {
        var theMap = game.global.mapsOwnedArray[map];
        if (theMap.noRecycle && getPageSetting('RunUniqueMaps')) {
            if (theMap.name == 'The Wall' && game.upgrades.Bounty.allowed == 0 && !game.talents.bounty.purchased) {
                (theMap.name == 'Trimple Of Doom' && (game.global.challengeActive == "Meditate" || game.global.challengeActive == "Trapper"))
                var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                if(game.global.world < 15 + theMapDifficulty) continue;
                selectedMap = theMap.id;
                break;
            }
            if (theMap.name == 'Dimension of Anger' && document.getElementById("portalBtn").style.display == "none" && !game.talents.portal.purchased) {
                var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                if(game.global.world < 20 + theMapDifficulty) continue;
                selectedMap = theMap.id;
                break;
            }
            //run the prison only if we are 'cleared' to run level 80 + 1 level per 200% difficulty. Could do more accurate calc if needed
            if(theMap.name == 'The Prison' && (game.global.challengeActive == "Electricity" || game.global.challengeActive == "Mapocalypse")) {
                var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                if(game.global.world < 80 + theMapDifficulty) continue;
                selectedMap = theMap.id;
                break;
            }
            if(theMap.name == 'The Block' && !game.upgrades.Shieldblock.allowed && (game.global.challengeActive == "Scientist" || game.global.challengeActive == "Trimp" || getPageSetting('BuyShieldblock'))) {
                var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                if(game.global.world < 11 + theMapDifficulty) continue;
                selectedMap = theMap.id;
                break;
            }
            if(theMap.name == 'Trimple Of Doom' && game.global.challengeActive == "Meditate") {
                var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                if(game.global.world < 33 + theMapDifficulty) continue;
                selectedMap = theMap.id;
                break;
            }
            if(theMap.name == 'Bionic Wonderland' && game.global.challengeActive == "Crushed" ) {
                var theMapDifficulty = Math.ceil(theMap.difficulty / 2);
                if(game.global.world < 125 + theMapDifficulty) continue;
                selectedMap = theMap.id;
                break;
            }
            //run Bionics before spire to farm.
            if (getPageSetting('RunBionicBeforeSpire') && (game.global.world == 200) && theMap.name.includes('Bionic Wonderland')){
                //this is how to check if a bionic is green or not.
                var bionicnumber = 1 + ((theMap.level - 125) / 15);
                //if numbers match, map is green, so run it. (do the pre-requisite bionics one at a time in order)
                if (bionicnumber == game.global.bionicOwned && bionicnumber < 6){
                    selectedMap = theMap.id;
                    break;
                }
                if (shouldDoSpireMaps && theMap.name == 'Bionic Wonderland VI'){
                    selectedMap = theMap.id;
                    break;
                }
            }
            //other unique maps here
        }
    }
//VOIDMAPS:
    //voidArray: make an array with all our voidmaps, so we can sort them by real-world difficulty level
    var voidArray = [];
    //values are easiest to hardest. (hardest has the highest value)
    var prefixlist = {'Deadly':10, 'Heinous':11, 'Poisonous':20, 'Destructive':30};
    var prefixkeys = Object.keys(prefixlist);
    var suffixlist = {'Descent':7.077, 'Void':8.822, 'Nightmare':9.436, 'Pit':10.6};
    var suffixkeys = Object.keys(suffixlist);
    for (var map in game.global.mapsOwnedArray) {
        var theMap = game.global.mapsOwnedArray[map];
        if(theMap.location == 'Void') {
            for (var pre in prefixkeys) {
                if (theMap.name.includes(prefixkeys[pre]))
                    theMap.sortByDiff = 1 * prefixlist[prefixkeys[pre]];
            }
            for (var suf in suffixkeys) {
                if (theMap.name.includes(suffixkeys[suf]))
                    theMap.sortByDiff += 1 * suffixlist[suffixkeys[suf]];
            }
            voidArray.push(theMap);
        }
    }
    //sort the array (harder/highvalue last):
    var voidArraySorted = voidArray.sort(function(a, b) {
        return a.sortByDiff - b.sortByDiff;
    });
    for (var map in voidArraySorted) {
        var theMap = voidArraySorted[map];
        //Only proceed if we needToVoid right now.
        if(needToVoid) {
            //if we are on toxicity, don't clear until we will have max stacks at the last cell.
            if(game.global.challengeActive == 'Toxicity' && game.challenges.Toxicity.stacks < (1500 - theMap.size)) break;
            doVoids = true;
            //check to make sure we won't get 1-shot in nostance by boss
            var eAttack = getEnemyMaxAttack(game.global.world, theMap.size, 'Voidsnimp', theMap.difficulty);
            if (game.global.world >= 181 || (game.global.challengeActive == "Corrupted" && game.global.world >= 60))
                eAttack *= (getCorruptScale("attack") / 2).toFixed(1);
            //TODO: Account for magmated voidmaps. (not /2)
            //TODO: Account for daily.
            var ourHealth = baseHealth;
            if(game.global.challengeActive == 'Balance') {
                var stacks = game.challenges.Balance.balanceStacks ? (game.challenges.Balance.balanceStacks > theMap.size) ? theMap.size : game.challenges.Balance.balanceStacks : false;
                eAttack *= 2;
                if(stacks) {
                    for (i = 0; i < stacks; i++ ) {
                        ourHealth *= 1.01;
                    }
                }
            }
            if(game.global.challengeActive == 'Toxicity') eAttack *= 5;
            //break to prevent finishing map to finish a challenge?
            //continue to check for doable map?
            var diff = parseInt(getPageSetting('VoidCheck')) > 0 ? parseInt(getPageSetting('VoidCheck')) : 2;
            var ourBlock = getBattleStats("block", true);   //use block tooltip (after death block) instead of current army block.
            if(ourHealth/diff < eAttack - ourBlock) {
                shouldFarm = true;
                voidCheckPercent = Math.round((ourHealth/diff)/(eAttack-ourBlock)*100);
                abandonVoidMap();   //exit/restart if below <95% health, we have ForceAbandon on, and its not due to randomly losing anti stacks
                break;
            }
            else {
                voidCheckPercent = 0;
                if(getPageSetting('DisableFarm'))
                    shouldFarm = shouldFarm || false;
            }
            //only go into the voidmap if we need to.
            if (!restartVoidMap)
                selectedMap = theMap.id;
            //Restart the voidmap if we hit (100) nomstacks on the final boss
            if(game.global.mapsActive && getCurrentMapObject().location == "Void" && game.global.challengeActive == "Nom" && getPageSetting('FarmWhenNomStacks7')) {
                if(game.global.mapGridArray[theMap.size-1].nomStacks >= customVars.NomFarmStacksCutoff[2]) {
                    mapsClicked(true);
                }
            }
            break;
        }
    }
//MAPS CREATION pt1:
    //map if we don't have health/dmg or we need to clear void maps or if we are prestige mapping, and our set item has a new prestige available
    if (shouldDoMaps || doVoids || needPrestige) {
        //selectedMap = world here if we haven't set it to create yet, meaning we found appropriate high level map, or siphon map
        if (selectedMap == "world") {
            //if needFarmSpire x minutes is true, switch over from wood maps to metal maps.
            if (needFarmSpire) {
                var spiremaplvl = (game.talents.mapLoot.purchased && MODULES["automaps"].SpireFarm199Maps) ? 199 : 200;
                if (game.global.mapsOwnedArray[highestMap].level >= spiremaplvl && game.global.mapsOwnedArray[highestMap].location == ((customVars.preferGardens && game.global.decayDone) ? 'Plentiful' : 'Mountain'))
                    selectedMap = game.global.mapsOwnedArray[highestMap].id;
                else
                    selectedMap = "create";
            //if needPrestige, TRY to find current level map as the highest level map we own.
            } else if (needPrestige) {
                if (game.global.world == game.global.mapsOwnedArray[highestMap].level)
                    selectedMap = game.global.mapsOwnedArray[highestMap].id;
                else
                    selectedMap = "create";
            //if shouldFarm is true, use a siphonology adjusted map, as long as we aren't trying to prestige
            } else if (siphonMap != -1)
                selectedMap = game.global.mapsOwnedArray[siphonMap].id;
            //if we dont' have an appropriate max level map, or a siphon map, we need to make one
            else
                selectedMap = "create";
        }
        //if selectedMap != world, it already has a map ID and will be run below
    }
//LEAD EVEN ZONE EXIT
    //don't map on even worlds if on Lead Challenge, except if person is dumb and wants to void on even
    if(game.global.challengeActive == 'Lead' && !doVoids && (game.global.world % 2 == 0 || game.global.lastClearedCell < customVars.shouldFarmCell)) {
        if(game.global.preMapsActive)
            mapsClicked();
        return; //exit
    }
//REPEAT BUTTON:
    //Repeat Button Management (inside a map):
    if (!game.global.preMapsActive && game.global.mapsActive) {
        //Set the repeatBionics flag (farm bionics before spire), for the repeat button management code.
        var repeatBionics = getPageSetting('RunBionicBeforeSpire') && game.global.bionicOwned >= 6;
        //if we are doing the right map, and it's not a norecycle (unique) map, and we aren't going to hit max map bonus
        //or repeatbionics is true and there are still prestige items available to get
        if (selectedMap == game.global.currentMapId && (!getCurrentMapObject().noRecycle && (game.global.mapBonus < customVars.maxMapBonus-1 || shouldFarm || stackingTox || needPrestige || shouldDoSpireMaps) || repeatBionics)) {
            var targetPrestige = autoTrimpSettings.Prestige.selected;
            //make sure repeat map is on
            if (!game.global.repeatMap) {
                repeatClicked();
            }
            //if we aren't here for dmg/hp, and we see the prestige we are after on the last cell of this map, and it's the last one available, turn off repeat to avoid an extra map cycle
            if (!shouldDoMaps && (game.global.mapGridArray[game.global.mapGridArray.length - 1].special == targetPrestige && game.mapUnlocks[targetPrestige].last >= game.global.world - 9 )) {
                repeatClicked();
            }
            //avoid another map cycle due to having the amount of tox stacks we need.
            if (stackingTox && (game.challenges.Toxicity.stacks + game.global.mapGridArray.length - (game.global.lastClearedMapCell + 1) >= 1500)){
                repeatClicked();
            }
            //turn off repeat maps if we doing Watch maps.
            if (shouldDoWatchMaps)
                repeatClicked();
            //turn repeat off on the last WantHealth map.
            if (shouldDoHealthMaps && game.global.mapBonus >= customVars.wantHealthMapBonus - 1)
                repeatClicked();
        } else {
            //otherwise, make sure repeat map is off
            if (game.global.repeatMap) {
                repeatClicked();
            }
            if (restartVoidMap) {
                mapsClicked(true);
            }
        }
//FORCE EXIT WORLD->MAPS
    //clicks the maps button, once or twice (inside the world):
    } else if (!game.global.preMapsActive && !game.global.mapsActive) {
        if (selectedMap != "world") {
            //if we should not be in the world, and the button is not already clicked, click map button once (and wait patiently until death)
            if (!game.global.switchToMaps){
                mapsClicked();
            }
            //Get Impatient/Abandon if: (need prestige / _NEED_ to do void maps / on lead in odd world.) AND (a new army is ready, OR _need_ to void map OR lead farming and we're almost done with the zone) (handle shouldDoWatchMaps elsewhere below)
            if (game.global.switchToMaps && !shouldDoWatchMaps &&
                (needPrestige || doVoids ||
                (game.global.challengeActive == 'Lead' && game.global.world % 2 == 1) ||
                (!enoughDamage && enoughHealth && game.global.lastClearedCell < 9) ||
                (shouldFarm && game.global.lastClearedCell >= customVars.shouldFarmCell) ||
                (scryerStuck))
                &&
                    (
                    (game.resources.trimps.realMax() <= game.resources.trimps.owned + 1)
                    || (game.global.challengeActive == 'Lead' && game.global.lastClearedCell > 93)
                    || (doVoids && game.global.lastClearedCell > 93)
                    )
                ){
                //output stuck message
                if (scryerStuck) {
                    debug("Got perma-stuck on cell " + (game.global.lastClearedCell+2) + " during scryer stance. Are your scryer settings correct? Entering map to farm to fix it.");
                }
                mapsClicked();
            }
        }
        //forcibly run watch maps (or click to restart voidmap?)
        if (shouldDoWatchMaps) {
            mapsClicked();
        }
//MAPS CREATION pt2:        
    } else if (game.global.preMapsActive) {
        if (selectedMap == "world") {
            mapsClicked();  //go back
        }
        else if (selectedMap == "create") {
            document.getElementById("mapLevelInput").value = needPrestige ? game.global.world : siphlvl;                        
            var decrement;  //['size','diff','loot']
            if (game.global.world >= customVars.MapTierZone[0]) {
                //Zone 70+ (9/9/9 Metal):
                //instead of normal map locations, use Plentiful (Gardens) if the Decay challenge has been completed. (for +25% better loot)
                biomeAdvMapsSelect.value = (customVars.preferGardens && game.global.decayDone) ? "Plentiful" : customVars.MapTier0Sliders[3];  //metal is the current meta
                decrement = [];
            } else if (game.global.world >= customVars.MapTierZone[1]) {
                //Zone 47-70 (9/9/4 Metal):
                biomeAdvMapsSelect.value = (customVars.preferGardens && game.global.decayDone) ? "Plentiful" : customVars.MapTier1Sliders[3];  //metal is the current meta
                decrement = ['loot'];
            } else if (game.global.world >= customVars.MapTierZone[2]) {
                //Zone 16-47 (9/9/0 Random):
                biomeAdvMapsSelect.value = (customVars.preferGardens && game.global.decayDone) ? "Plentiful" : customVars.MapTier2Sliders[3];
                decrement = ['loot'];
            } else {
                //Zone 6-16 (9/0/0 Random):
                biomeAdvMapsSelect.value = (customVars.preferGardens && game.global.decayDone) ? "Plentiful" : customVars.MapTier3Sliders[3];
                decrement = ['diff','loot'];
            }
            //start all maps off on 9/9/9 sliders and decrement from there.
            sizeAdvMapsRange.value = 9
            adjustMap('size', 9);
            difficultyAdvMapsRange.value = 9;
            adjustMap('difficulty', 9);
            lootAdvMapsRange.value = 9;
            adjustMap('loot', 9);
            //choose spire level 199 or 200
            if (needFarmSpire && MODULES["automaps"].SpireFarm199Maps)
                document.getElementById("mapLevelInput").value = game.talents.mapLoot.purchased ? 199 : 200;
            //recalculate cost.
            advSpecialSelect.value = fa;
            updateMapCost();
            //if we are "Farming" for resources, make sure it's Plentiful OR metal (and always aim for lowest difficulty)
            if(shouldFarm || !enoughDamage || !enoughHealth || game.global.challengeActive == 'Metal') {
                biomeAdvMapsSelect.value = (customVars.preferGardens && game.global.decayDone) ? "Plentiful" : "Mountain";
                updateMapCost();
            }
            //set up various priorities for various situations
            if (updateMapCost(true) > game.resources.fragments.owned) {
                if (needPrestige && HDratio < MODULES["automaps"].enoughDamageCutoff) decrement.push('diff');
                if (shouldFarm) decrement.push('size');
                if (HDratio >= MODULES["automaps"].enoughDamageCutoff) decrement.push('loot');                
            }
        //Decrement 1 - use priorities first:
            //if we STILL cant afford the map, lower the loot slider (less loot)
            while (decrement.indexOf('loot') > -1 && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                lootAdvMapsRange.value -= 1;
            }
            //default: if we can't afford the map:
            //Put a priority on small size, and increase the difficulty? for high Helium that just wants prestige = yes.
            //Really just trying to prevent prestige mapping from getting stuck            
            while (decrement.indexOf('diff') > -1 && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                difficultyAdvMapsRange.value -= 1;
            }
            //if we still cant afford the map, lower the size slider (make it larger) (doesn't matter much for farming.)
            while (decrement.indexOf('size') > -1 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                sizeAdvMapsRange.value -= 1;
            }
        //Decrement 2 - if its still too expensive:
            //if we STILL cant afford the map, lower the loot slider (less loot)
            while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                lootAdvMapsRange.value -= 1;
            }
            //default: if we can't afford the map:
            //Put a priority on small size, and increase the difficulty? for high Helium that just wants prestige = yes.
            //Really just trying to prevent prestige mapping from getting stuck            
            while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                difficultyAdvMapsRange.value -= 1;
            }
            //if we still cant afford the map, lower the size slider (make it larger) (doesn't matter much for farming.)
            while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                sizeAdvMapsRange.value -= 1;
            }            

        //if we can't afford the map we designed, pick our highest existing map
            var maplvlpicked = document.getElementById("mapLevelInput").value;
            if (updateMapCost(true) > game.resources.fragments.owned) {
                selectMap(game.global.mapsOwnedArray[highestMap].id);
                debug("Can't afford the map we designed, #" + maplvlpicked , "maps", '*crying2');
                debug("..picking our highest map:# " + game.global.mapsOwnedArray[highestMap].id + " Level: " + game.global.mapsOwnedArray[highestMap].level, "maps", '*happy2');
                runMap();
                lastMapWeWereIn = getCurrentMapObject();
            } else {
                debug("BUYING a Map, level: #" + maplvlpicked, "maps", 'th-large');
                var result = buyMap();
                if(result == -2){
                    debug("Too many maps, recycling now: ", "maps", 'th-large');
                    recycleBelow(true);
                    debug("Retrying BUYING a Map, level: #" + maplvlpicked, "maps", 'th-large');
                    buyMap();
                }
            }
        //if we already have a map picked, run it
        } else {
            selectMap(selectedMap);
            var themapobj = game.global.mapsOwnedArray[getMapIndex(selectedMap)];
            var levelText = " Level: " + themapobj.level;
            var voidorLevelText = themapobj.location == "Void" ? " Void: " : levelText;
            debug("Already have a map picked: Running map: " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
            runMap();
            lastMapWeWereIn = getCurrentMapObject();
        }
    }
}

//update the UI with stuff from automaps.
function updateAutoMapsStatus() {
    //automaps status
    var status = document.getElementById('autoMapStatus');
    if(!autoTrimpSettings.AutoMaps.enabled) status.innerHTML = 'Off';
    else if (!game.global.mapsUnlocked) status.innerHTML = '&nbsp;';
    else if (needPrestige && !doVoids) status.innerHTML = 'Prestige';
    else if (doVoids && voidCheckPercent == 0) status.innerHTML = 'Void Maps: ' + game.global.totalVoidMaps + ' remaining';
    else if (needToVoid && !doVoids && game.global.totalVoidMaps > 0 && !stackingTox) status.innerHTML = 'Prepping for Voids';
    else if (doVoids && voidCheckPercent > 0) status.innerHTML = 'Farming to do Voids: ' + voidCheckPercent + '%';
    else if (shouldFarm && !doVoids) status.innerHTML = 'Farming: ' + HDratio.toFixed(4) + 'x';
    else if (stackingTox) status.innerHTML = 'Getting Tox Stacks';
    else if (scryerStuck) status.innerHTML = 'Scryer Got Stuck, Farming';
    else if (!enoughHealth && !enoughDamage) status.innerHTML = 'Want Health & Damage';
    else if (!enoughDamage) status.innerHTML = 'Want ' + HDratio.toFixed(4) + 'x &nbspmore damage';
    else if (!enoughHealth) status.innerHTML = 'Want more health';
    else if (enoughHealth && enoughDamage) status.innerHTML = 'Advancing';

    //hider he/hr% status
    var area51 = document.getElementById('hiderStatus');
    var getPercent = (game.stats.heliumHour.value() / (game.global.totalHeliumEarned - (game.global.heliumLeftover + game.resources.helium.owned)))*100;
    var lifetime = (game.resources.helium.owned / (game.global.totalHeliumEarned-game.resources.helium.owned))*100;
    area51.innerHTML = 'He/hr: ' + getPercent.toFixed(3) + '%<br>&nbsp;&nbsp;&nbsp;He: ' + lifetime.toFixed(3) +'%';
}
