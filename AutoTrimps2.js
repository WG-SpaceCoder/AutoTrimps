// ==UserScript==
// @name         AutoTrimpsV2
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  try to take over the world!
// @author       zininzinin, spindrjr, belaith, ishakaru
// @include      *trimps.github.io*
// @grant        none
// ==/UserScript==


////////////////////////////////////////
//Variables/////////////////////////////
////////////////////////////////////////
var runInterval = 100; //How often to loop through logicc
var enableDebug = true; //Spam console?
var autoTrimpSettings = new Object();
var bestBuilding;
var scienceNeeded;
var breedFire = false;
var shouldFarm = false;
var enoughDamage = true;
var enoughHealth = true;
var newCoord = false;

var noFight = 0;




var baseDamage = 0;
var baseBlock = 0;
var baseHealth = 0;

var preBuyAmt = game.global.buyAmt;
var preBuyFiring = game.global.firing;
var preBuyTooltip = game.global.lockTooltip;

////////////////////////////////////////
//List Variables////////////////////////
////////////////////////////////////////
var equipmentList = {
    'Dagger': {
        Upgrade: 'Dagadder',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Mace': {
        Upgrade: 'Megamace',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Polearm': {
        Upgrade: 'Polierarm',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Battleaxe': {
        Upgrade: 'Axeidic',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Greatsword': {
        Upgrade: 'Greatersword',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Boots': {
        Upgrade: 'Bootboost',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Helmet': {
        Upgrade: 'Hellishmet',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Pants': {
        Upgrade: 'Pantastic',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Shoulderguards': {
        Upgrade: 'Smoldershoulder',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Breastplate': {
        Upgrade: 'Bestplate',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Arbalest': {
        Upgrade: 'Harmbalest',
        Stat: 'attack',
        Resource: 'metal',
        Equip: true
    },
    'Gambeson': {
        Upgrade: 'GambesOP',
        Stat: 'health',
        Resource: 'metal',
        Equip: true
    },
    'Shield': {
        Upgrade: 'Supershield',
        Stat: 'health',
        Resource: 'wood',
        Equip: true
    },
    'Gym': {
        Upgrade: 'Gymystic',
        Stat: 'block',
        Resource: 'wood',
        Equip: false
    }
};

var upgradeList = ['Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Megaminer', 'Megalumber', 'Megafarming', 'Megascience', 'Efficiency', 'TrainTacular', 'Miners', 'Scientists', 'Trainers', 'Explorers', 'Blockmaster', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'Anger', 'Formations', 'Dominance', 'Barrier', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm', 'Gigastation', 'Shieldblock'];
var housingList = ['Hut', 'House', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation'];


////////////////////////////////////////
//Utility Functions/////////////////////
////////////////////////////////////////
//polyfill for includes function
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

//Loads the automation settings from browser cache
function loadPageVariables() {
    var tmp = JSON.parse(localStorage.getItem('autoTrimpSettings'));
    if (tmp !== null) {
        autoTrimpSettings = tmp;
    }
}

//Saves automation settings to browser cache
function saveSettings() {
    // debug('Saved');
    localStorage.setItem('autoTrimpSettings', JSON.stringify(autoTrimpSettings));
}

//Grabs the automation settings from the page

function getPageSetting(setting) {
    if (autoTrimpSettings.hasOwnProperty(setting) == false) {
        return false;
    }
    if (autoTrimpSettings[setting].type == 'boolean') {
        // debug('found a boolean');
        return autoTrimpSettings[setting].enabled;
    } else if (autoTrimpSettings[setting].type == 'value') {
        // debug('found a value');
        return parseFloat(autoTrimpSettings[setting].value);
    }
}

//Global debug message (need to implement debugging to in game window)
function debug(message) {
    if (enableDebug)
        console.log(timeStamp() + ' ' + message);
}

//Simply returns a formatted text timestamp
function timeStamp() {
    var now = new Date();

    // Create an array with the current hour, minute and second
    var time = [now.getHours(), now.getMinutes(), now.getSeconds()];

    // If seconds and minutes are less than 10, add a zero
    for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
            time[i] = "0" + time[i];
        }
    }
    return time.join(":");
}

//Called before buying things that can be purchased in bulk
function preBuy() {
    preBuyAmt = game.global.buyAmt;
    preBuyFiring = game.global.firing;
    preBuyTooltip = game.global.lockTooltip;
}

//Called after buying things that can be purchased in bulk
function postBuy() {
    game.global.buyAmt = preBuyAmt;
    game.global.firing = preBuyFiring;
    game.global.lockTooltip = preBuyTooltip;
}

function safeBuyBuilding(building) {
    //exclude housing from 1 per queue limit?
    for (var b in game.global.buildingsQueue) {
           if (game.global.buildingsQueue[b].includes(building)) return false;
    }


    preBuy();
    game.global.buyAmt = 1;
    if (!canAffordBuilding(building)) {
        postBuy();
        return false;
    }
    game.global.firing = false;
    //avoid slow building from clamping
     //buy as many warpstations as we can afford
    if(building == 'Warpstation'){
        game.global.buyAmt = 'Max';
        setMax(1);
            buyBuilding(building, true, true);
            debug('Building ' + game.global.buyAmt + ' ' + building + 's');
            return;
    }
        debug('Building ' + building);
        buyBuilding(building, true, true);


    postBuy();
    return true;
}

//Outlines the most efficient housing based on gems (credits to Belaith)
function highlightHousing() {
    var oldBuy = game.global.buyAmt;
    game.global.buyAmt = 1;
    var allHousing = ["Mansion", "Hotel", "Resort", "Gateway", "Collector", "Warpstation"];
    var unlockedHousing = [];
    for (var house in allHousing) {
        if (game.buildings[allHousing[house]].locked === 0) {
            unlockedHousing.push(allHousing[house]);
        }
    }
    if (unlockedHousing.length) {
        var obj = {};
        for (var house in unlockedHousing) {
            var building = game.buildings[unlockedHousing[house]];
            var cost = 0;
            cost += getBuildingItemPrice(building, "gems", false, 1);
            var ratio = cost / building.increase.by;
            //don't consider Gateway if we can't afford it right now - hopefully to prevent game waiting for fragments to buy gateway when collector could be bought right now
            if(unlockedHousing[house] == "Gateway" && !canAffordBuilding('Gateway')) continue;
            obj[unlockedHousing[house]] = ratio;
            if (document.getElementById(unlockedHousing[house]).style.border = "1px solid #00CC00") {
                document.getElementById(unlockedHousing[house]).style.border = "1px solid #FFFFFF";
                // document.getElementById(unlockedHousing[house]).removeEventListener("click", update);
            }
        }
        var keysSorted = Object.keys(obj).sort(function(a, b) {
            return obj[a] - obj[b]
        });
        bestBuilding = null;
        //loop through the array and find the first one that isn't limited by max settings
        for (var best in keysSorted) {
            var max = getPageSetting('Max' + keysSorted[best]);
            if (max === false) max = -1;
            if (game.buildings[keysSorted[best]].owned < max || max == -1) {
                bestBuilding = keysSorted[best];
                break;
            }
        }
        if (bestBuilding) {
            document.getElementById(bestBuilding).style.border = "1px solid #00CC00";
        }
        // document.getElementById(bestBuilding).addEventListener('click', update, false);
    } else {
        bestBuilding = null;
    }
game.global.buyAmt = oldBuy;
}

function buyFoodEfficientHousing() {
    var houseWorth = game.buildings.House.locked ? 0 : game.buildings.House.increase.by / getBuildingItemPrice(game.buildings.House, "food", false, 1);
    var hutWorth = game.buildings.Hut.increase.by / getBuildingItemPrice(game.buildings.Hut, "food", false, 1);
    var hutAtMax = (game.buildings.Hut.owned >= autoTrimpSettings.MaxHut.value && autoTrimpSettings.MaxHut.value != -1);
    //if hutworth is more, but huts are maxed , still buy up to house max
    if ((houseWorth > hutWorth || hutAtMax) && canAffordBuilding('House') && (game.buildings.House.owned < autoTrimpSettings.MaxHouse.value || autoTrimpSettings.MaxHouse.value == -1)) {
        safeBuyBuilding('House');
    } else {
        if (!hutAtMax) {
            safeBuyBuilding('Hut');
        }
    }
}

function safeBuyJob(jobTitle, amount) {
    if (amount === undefined) amount = 1;
    if (amount === 0) return false;
    preBuy();
    if (amount < 0) {
        game.global.firing = true;
        amount = Math.abs(amount);
    } else {
            game.global.firing = false;
        if (!canAffordJob(jobTitle, false)) {
            postBuy();
            return false;
        }
    }
    //debug((game.global.firing ? 'Firing ' : 'Hiring ') + game.global.buyAmt + ' ' + jobTitle);
    game.global.buyAmt = amount;
    buyJob(jobTitle, null, true);
    postBuy();
    return true;
}

function getScienceCostToUpgrade(upgrade) {
    var upgradeObj = game.upgrades[upgrade];
    if (upgradeObj.cost.resources.science !== undefined ? upgradeObj.cost.resources.science[0] !== undefined : false) {
        return Math.floor(upgradeObj.cost.resources.science[0] * Math.pow(upgradeObj.cost.resources.science[1], (upgradeObj.done)));
    } else {
        return 0;
    }
}

var worth = {'Shield': {}, 'Staff': {}};
function sortHeirlooms(){
    worth = {'Shield': {}, 'Staff': {}};
    for (var loom in game.global.heirloomsExtra) {
        var theLoom = game.global.heirloomsExtra[loom];
        worth[theLoom.type][loom] = theLoom.rarity;
    }

    //sort high to low value, priority on rarity, followed by mod evaluation
    for (var x in worth){
        worth[x] = Object.keys(worth[x]).sort(function(a, b) {
                if(worth[x][b] == worth[x][a]) {
                    return evaluateMods(b, 'heirloomsExtra') - evaluateMods(a, 'heirloomsExtra');
                }
                else
                    return worth[x][b] - worth[x][a];
            });
    }
      // console.log(worth);
       //console.log('hat: ' + worth['Shield']);
       //console.log('staff: ' + worth['Staff']);
}



function autoHeirlooms() {
    var bestUpgrade;
    if(!heirloomsShown && game.global.heirloomsExtra.length > 0){
           sortHeirlooms();
           for(var carried in game.global.heirloomsCarried) {
                   var theLoom = game.global.heirloomsCarried[carried];
                   if(worth[theLoom.type].length == 0) continue;
                   var index = worth[theLoom.type][0];
                   if(theLoom.rarity < game.global.heirloomsExtra[index].rarity || (theLoom.rarity == game.global.heirloomsExtra[index].rarity && evaluateMods(carried, 'heirloomsCarried') < evaluateMods(index, 'heirloomsExtra'))) {
                       selectHeirloom(carried, 'heirloomsCarried');
                       stopCarryHeirloom();
                       selectHeirloom(index, 'heirloomsExtra');
                       carryHeirloom();
                       sortHeirlooms();
                   }
           }
           if(game.global.heirloomsCarried.length < game.global.maxCarriedHeirlooms) {
               if(worth.Shield.length > 0)
                   selectHeirloom(worth.Shield[0], 'heirloomsExtra');
               else if(worth.Staff.length > 0)
                   selectHeirloom(worth.Staff[0], 'heirloomsExtra');
           carryHeirloom();
           }
    }
    else if(heirloomsShown && game.global.selectedHeirloom.length > 0){
        if(game.global.selectedHeirloom[1].includes('Equipped')) {
            var loom = game.global[game.global.selectedHeirloom[1]];
            bestUpgrade = evaluateMods(0, game.global.selectedHeirloom[1], true);
            if(bestUpgrade.index) {
                bestUpgrade.effect *= getModUpgradeCost(loom, bestUpgrade.index);
                bestUpgrade.effect = bestUpgrade.effect.toFixed(6);
                var styleIndex = 4 + (bestUpgrade.index * 3);
                //enclose in backtic ` for template string $ stuff
                document.getElementById('selectedHeirloom').childNodes[0].childNodes[styleIndex].style.backgroundColor = "lightblue";
                document.getElementById('selectedHeirloom').childNodes[0].childNodes[styleIndex].setAttribute("onmouseover", `tooltip(\'Heirloom\', \"customText\", event, \'<div class=\"selectedHeirloomItem heirloomRare${loom.rarity}\"> AutoTrimps recommended upgrade for this item. </div>\'         )`);
                document.getElementById('selectedHeirloom').childNodes[0].childNodes[styleIndex].setAttribute("onmouseout", 'tooltip(\'hide\')');
                //lightblue = greyish
                //swapClass("tooltipExtra", "tooltipExtraHeirloom", document.getElementById("tooltipDiv"));
                //document.getElementById("tooltipDiv");
            }
        }
    }
       //heirloomsShown
       //getModReplaceCost(heirloomObj, modIndex)
       //getModUpgradeCost(heirloomObj, modIndex)
       //document.getElementById('extraHeirloomsHere').childNodes[INDEX].childNodes[1].style.border = "1px solid #00CC00"
       //document.getElementById('selectedHeirloom').childNodes[0].childNodes[4/7/10/13].style.backgroundColor
       //advBtn.setAttribute("onmouseover", 'tooltip(\"Advanced Settings\", \"customText\", event, \"Leave off unless you know what you\'re doing with them.\")');
}

function evaluateMods(loom, location, upgrade) {
    var index = loom;
    var bestUpgrade = {
        'index': null,
        'name': '',
        'effect': 0
    };
    var tempEff;
    var steps;
    if(location.includes('Equipped'))
        loom = game.global[location];
    else
        loom = game.global[location][loom];
//    return loom.rarity;
    var eff = 0;
    for(var m in loom.mods) {
        switch(loom.mods[m][0]) {
            case 'critChance':
                tempEff = ((loom.mods[m][1]/100) * (getPlayerCritDamageMult() - game.heirlooms.Shield.critDamage.currentBonus/100))/((getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100) * (getPlayerCritDamageMult() - game.heirlooms.Shield.critDamage.currentBonus/100) + 1 - (getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100));
                eff += tempEff;
                if(upgrade){
                    if(loom.mods[m][1] >= 30) break;
                    steps = game.heirlooms.Shield.critChance.steps[loom.rarity];
                    tempEff = (steps[2]/100 * getPlayerCritDamageMult())/((getPlayerCritChance() * getPlayerCritDamageMult()) + 1 - getPlayerCritChance());
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'critChance';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'critDamage':
                tempEff = ((loom.mods[m][1]/100) * (getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100))/((getPlayerCritDamageMult() - game.heirlooms.Shield.critDamage.currentBonus/100) * (getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100) + 1 - (getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100));
                eff += tempEff;
                if(upgrade){
                    steps = game.heirlooms.Shield.critDamage.steps[loom.rarity];
                    tempEff = (getPlayerCritChance() * (steps[2]/100))/((getPlayerCritDamageMult() * getPlayerCritChance()) + 1 - getPlayerCritChance());
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'critDamage';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'trimpAttack':
                tempEff = loom.mods[m][1]/100;
                eff += tempEff;
                if(upgrade){
                    steps = game.heirlooms.Shield.trimpAttack.steps[loom.rarity];
                    tempEff = (steps[2]/100)/((game.heirlooms.Shield.trimpAttack.currentBonus/100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'trimpAttack';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'voidMaps':
                tempEff = loom.mods[m][1]/100;
                eff += tempEff;
                if(upgrade){
                    steps = game.heirlooms.Shield.voidMaps.steps[loom.rarity];
                    tempEff = (steps[2]/100)/((game.heirlooms.Shield.voidMaps.currentBonus/100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'voidMaps';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'MinerSpeed':
                tempEff = 0.75*loom.mods[m][1]/100;
                eff += tempEff;
                if(upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.75*steps[2]/100)/((game.heirlooms.Staff.MinerSpeed.currentBonus/100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'MinerSpeed';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'metalDrop':
                tempEff = 0.75*loom.mods[m][1]/100;
                eff += tempEff;
                if(upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.75*steps[2]/100)/((game.heirlooms.Staff.metalDrop.currentBonus/100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'metalDrop';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'gemsDrop':
                tempEff = 0.75*loom.mods[m][1]/100;
                eff += tempEff;
                if(upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.75*steps[2]/100)/((game.heirlooms.Staff.gemsDrop.currentBonus/100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'gemsDrop';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'FarmerSpeed':
                tempEff = 0.5*loom.mods[m][1]/100;
                eff += tempEff;
                if(upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.5*steps[2]/100)/((game.heirlooms.Staff.FarmerSpeed.currentBonus/100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'FarmerSpeed';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'LumberjackSpeed':
                tempEff = 0.5*loom.mods[m][1]/100;
                eff += tempEff;
                if(upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.5*steps[2]/100)/((game.heirlooms.Staff.LumberjackSpeed.currentBonus/100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'LumberjackSpeed';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'DragimpSpeed':
                tempEff = 0.75*loom.mods[m][1]/100;
                eff += tempEff;
                if(upgrade) {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    tempEff = (0.5*steps[2]/100)/((game.heirlooms.Staff.DragimpSpeed.currentBonus/100) + 1);
                    tempEff = tempEff / getModUpgradeCost(loom, m);
                    if(tempEff > bestUpgrade.effect) {
                        bestUpgrade.effect = tempEff;
                        bestUpgrade.name = 'DragimpSpeed';
                        bestUpgrade.index = m;
                    }
                }
                break;
            case 'empty':
                var av;
                //some other function?
                if(upgrade) break;
                //value empty mod as the average of the best mod it doesn't have. If it has all good mods, empty slot has no value
                if(loom.type == 'Shield') {
                    if(!checkForMod('trimpAttack', index, location)){
                        steps = game.heirlooms.Shield.trimpAttack.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0])/2);
                        tempEff = av/100;
                        eff += tempEff;
                    }
                    else if(!checkForMod('voidMaps', index, location)){
                        steps = game.heirlooms.Shield.voidMaps.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0])/2);
                        tempEff = (steps[2]/100);
                        eff += tempEff;
                    }
                    else if(!checkForMod('critChance', index, location)){
                        steps = game.heirlooms.Shield.critChance.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0])/2);
                        tempEff = (av * (getPlayerCritDamageMult() - game.heirlooms.Shield.critDamage.currentBonus/100))/((getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100) * (getPlayerCritDamageMult() - game.heirlooms.Shield.critDamage.currentBonus/100) + 1 - (getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100));
                        eff += tempEff;
                    }
                    else if(!checkForMod('critDamage', index, location)){
                        steps = game.heirlooms.Shield.critDamage.steps[loom.rarity];
                        av = steps[0] + ((steps[1] - steps[0])/2);
                        tempEff = (av * (getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100))/((getPlayerCritDamageMult() - game.heirlooms.Shield.critDamage.currentBonus/100) * (getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100) + 1 - (getPlayerCritChance() - game.heirlooms.Shield.critChance.currentBonus/100));
                        eff += tempEff;
                    }
                }
                if(loom.type == 'Staff') {
                    steps = game.heirlooms.defaultSteps[loom.rarity];
                    av = steps[0] + ((steps[1] - steps[0])/2);
                    if(!checkForMod('MinerSpeed', index, location) || !checkForMod('metalDrop', index, location)){
                    eff += 0.75*av/100;
                    }
                    else if(!checkForMod('LumberjackSpeed', index, location) || !checkForMod('FarmerSpeed', index, location) || !checkForMod('DragimpSpeed', index, location)){
                    eff += 0.5*av/100;
                    }
                }
                break;
            //metalDrop? trimpHealth?
        }
    }
    if(upgrade) return bestUpgrade;
    return eff;
}

function checkForMod(what, loom, location){
    var heirloom = game.global[location][loom];
    for (var mod in heirloom.mods){
        if (heirloom.mods[mod][0] == what) return true;
    }
    return false;
}



function evaluateEfficiency(equipName) {
    var equip = equipmentList[equipName];
    var gameResource = equip.Equip ? game.equipment[equipName] : game.buildings[equipName];
    if (equipName == 'Shield') {
        if (gameResource.blockNow) {
            equip.Stat = 'block';
        } else {
            equip.Stat = 'health';
        }
    }
    var Eff = Effect(gameResource, equip);
    var Cos = Cost(gameResource, equip);
    var Res = Eff / Cos;
    var Status = 'white';
    var Wall = false;

    //white - Upgrade is not available
    //yellow - Upgrade is not affordable
    //orange - Upgrade is affordable, but will lower stats
    //red - Yes, do it now!
    if (!game.upgrades[equip.Upgrade].locked) {
        //Evaluating upgrade!
        var CanAfford = canAffordTwoLevel(game.upgrades[equip.Upgrade]);
        if (equip.Equip) {
            var NextEff = PrestigeValue(equip.Upgrade);
            var NextCost = getNextPrestigeCost(equip.Upgrade) * Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.level);
            Wall = (NextEff / NextCost > Res);
        }

        if (!CanAfford) {
            Status = 'yellow';
        } else {
            if (!equip.Equip) {
                //Gymystic is always cool, fuck shield - lol
                Status = 'red';
            } else {
                var CurrEff = gameResource.level * Eff;

                var NeedLevel = Math.ceil(CurrEff / NextEff);
                var Ratio = gameResource.cost[equip.Resource][1];

                var NeedResource = NextCost * (Math.pow(Ratio, NeedLevel) - 1) / (Ratio - 1);

                if (game.resources[equip.Resource].owned > NeedResource) {
                    Status = 'red';
                } else {
                    Status = 'orange';
                }
            }
        }
    }
    //wall (don't buy any more equipment, buy prestige first) is true if the limit equipment option is on and we are past our limit
    if (gameResource.level > 10 - gameResource.prestige && getPageSetting('LimitEquipment')) {
        Wall = true;
    }
    return {
        Stat: equip.Stat,
        Factor: Res,
        Status: Status,
        Wall: Wall
    };
}

function Effect(gameResource, equip) {
    if (equip.Equip) {
        return gameResource[equip.Stat + 'Calculated'];
    } else {
        //That be Gym
        var oldBlock = gameResource.increase.by * gameResource.owned;
        var Mod = game.upgrades.Gymystic.done ? (game.upgrades.Gymystic.modifier + (0.01 * (game.upgrades.Gymystic.done - 1))) : 1;
        var newBlock = gameResource.increase.by * (gameResource.owned + 1) * Mod;
        return newBlock - oldBlock;
    }
}

function Cost(gameResource, equip) {
    preBuy();
    game.global.buyAmt = 1;
    var price = parseFloat(getBuildingItemPrice(gameResource, equip.Resource, equip.Equip, 1));
    if (equip.Equip) price = Math.ceil(price * (Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.level)));
    postBuy();
    return price;
}

function PrestigeValue(what) {
    var name = game.upgrades[what].prestiges;
    var equipment = game.equipment[name];
    var stat;
    if (equipment.blockNow) stat = "block";
    else stat = (typeof equipment.health !== 'undefined') ? "health" : "attack";
    var toReturn = Math.round(equipment[stat] * Math.pow(1.19, ((equipment.prestige) * game.global.prestige[stat]) + 1));
    return toReturn;
}

function setScienceNeeded() {
    scienceNeeded = 0;
    for (var upgrade in upgradeList) {
        upgrade = upgradeList[upgrade];
        if (game.upgrades[upgrade].allowed > game.upgrades[upgrade].done) { //If the upgrade is available
            scienceNeeded += getScienceCostToUpgrade(upgrade);
        }
    }
}
/*
function breedTime(genes) {
    var trimps = game.resources.trimps;

    if (trimps.owned - trimps.employed < 2 || game.global.challengeActive == "Trapper") {
        return 0;
    }

    var potencyMod = trimps.potency;
    potencyMod = potencyMod * (1 + game.portal.Pheromones.level * game.portal.Pheromones.modifier);

    if (game.unlocks.quickTrimps) {
        potencyMod *= 2;
    }
    if (game.global.brokenPlanet) {
        potencyMod /= 10;
    }
    if (game.jobs.Geneticist.owned > 0) {
        potencyMod *= Math.pow(0.98, game.jobs.Geneticist.owned);
    }

    var multiplier = 1;
    if (genes >= 0) {
        multiplier *= Math.pow(0.98, genes);
    } else {
        multiplier *= Math.pow((1 / 0.98), -genes);
    }

    var soldiers = game.portal.Coordinated.level ? game.portal.Coordinated.currentSend : trimps.maxSoldiers;
    var numerus = (trimps.realMax() - trimps.employed) / (trimps.realMax() - (soldiers + trimps.employed));
    var base = potencyMod * multiplier + 1;

    return Math.log(numerus) / Math.log(base);
}

function getEnemyMaxAttack(zone) {
    var amt = 0;
    var level = 30;
    var world = zone;
    amt += 50 * Math.sqrt(world * Math.pow(3.27, world));
    amt -= 10;
    if (world == 1) {
        amt *= 0.35;
        amt = (amt * 0.20) + ((amt * 0.75) * (level / 100));
    } else if (world == 2) {
        amt *= 0.5;
        amt = (amt * 0.32) + ((amt * 0.68) * (level / 100));
    } else if (world < 60) {
        amt = (amt * 0.375) + ((amt * 0.7) * (level / 100));
    } else {
        amt = (amt * 0.4) + ((amt * 0.9) * (level / 100));
        amt *= Math.pow(1.15, world - 59);
    }

    amt *= 1.1;
    amt *= game.badGuys["Snimp"].attack;
    return Math.floor(amt);
}
*/

function getEnemyMaxAttack(world, level, name, diff) {
    var amt = 0;
    var adjWorld = ((world - 1) * 100) + level;
    amt += 50 * Math.sqrt(world * Math.pow(3.27, world));
    amt -= 10;
    if (world == 1){
        amt *= 0.35;
        amt = (amt * 0.20) + ((amt * 0.75) * (level / 100));
    }
    else if (world == 2){
        amt *= 0.5;
        amt = (amt * 0.32) + ((amt * 0.68) * (level / 100));
    }
    else if (world < 60)
        amt = (amt * 0.375) + ((amt * 0.7) * (level / 100));
    else{
        amt = (amt * 0.4) + ((amt * 0.9) * (level / 100));
        amt *= Math.pow(1.15, world - 59);
    }

    if (diff) {
        amt *= 1.1;
        amt *= diff;
    }
    amt *= game.badGuys[name].attack;
    return Math.floor(amt);
}

function getEnemyMaxHealth(zone) {
    var amt = 0;
    var level = 30;
    var world = zone;
    amt += 130 * Math.sqrt(world * Math.pow(3.265, world));
    amt -= 110;
    if (world == 1 || world == 2 && level < 10) {
        amt *= 0.6;
        amt = (amt * 0.25) + ((amt * 0.72) * (level / 100));
    } else if (world < 60) {
        amt = (amt * 0.4) + ((amt * 0.4) * (level / 110));
    } else {
        amt = (amt * 0.5) + ((amt * 0.8) * (level / 100));
        amt *= Math.pow(1.1, world - 59);
    }
    amt *= 1.1;
    amt *= game.badGuys["Grimp"].health;
    amt *= 0.84;
    return Math.floor(amt);
}

function getBreedTime(remaining) {
    var trimps = game.resources.trimps;
    var breeding = trimps.owned - trimps.employed;
    var trimpsMax = trimps.realMax();

    var potencyMod = trimps.potency;
    if (game.global.brokenPlanet) breeding /= 10;

    //Pheromones
    potencyMod += (potencyMod * game.portal.Pheromones.level * game.portal.Pheromones.modifier);
    if (game.jobs.Geneticist.owned > 0) potencyMod *= Math.pow(0.98, game.jobs.Geneticist.owned);
    if (game.unlocks.quickTrimps) potencyMod *= 2;
    if (game.global.challengeActive == "Toxicity" && game.challenges.Toxicity.stacks > 0){
    potencyMod *= Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks);
    }
    if (game.global.voidBuff == "slowBreed"){
        potencyMod *= 0.2;

    }

    potencyMod = calcHeirloomBonus("Shield", "breedSpeed", potencyMod);
    breeding = breeding * potencyMod;
    updatePs(breeding, true);


    var timeRemaining = log10((trimpsMax - trimps.employed) / (trimps.owned - trimps.employed)) / log10(1 + (potencyMod / 10));
    if (!game.global.brokenPlanet) timeRemaining /= 10;
    timeRemaining = Math.floor(timeRemaining);
    if(remaining) return timeRemaining;
    var fullBreed = 0;
    var adjustedMax = (game.portal.Coordinated.level) ? game.portal.Coordinated.currentSend : trimps.maxSoldiers;
    var totalTime = log10((trimpsMax - trimps.employed) / ((trimpsMax - adjustedMax) - trimps.employed)) / log10(1 + (potencyMod / 10));
    if (!game.global.brokenPlanet) totalTime /= 10;
    fullBreed = Math.floor(totalTime) + " Secs";
    timeRemaining += " / " + fullBreed;

    // debug('Time to breed is ' +Math.floor(totalTime));
    return Math.floor(totalTime);
}


////////////////////////////////////////
//Main Functions////////////////////////
////////////////////////////////////////

function initializeAutoTrimps() {
    debug('initializeAutoTrimps');
    loadPageVariables();
    javascript: with(document)(head.appendChild(createElement('script')).src = 'https://zininzinin.github.io/AutoTrimps/NewUI.js')._;
    javascript: with(document)(head.appendChild(createElement('script')).src = 'https://zininzinin.github.io/AutoTrimps/Graphs.js')._;
    //javascript: with(document)(head.appendChild(createElement('script')).src = 'https://rawgit.com/zininzinin/AutoTrimps/spin/NewUI.js')._;
    //javascript: with(document)(head.appendChild(createElement('script')).src = 'https://rawgit.com/zininzinin/AutoTrimps/spin/Graphs.js')._;
    //why you no update, github aids
    toggleSettingsMenu();
    toggleSettingsMenu();
}

function easyMode() {
    if (game.resources.trimps.realMax() > 3000000) {
        autoTrimpSettings.FarmerRatio.value = '3';
        autoTrimpSettings.LumberjackRatio.value = '1';
        autoTrimpSettings.MinerRatio.value = '4';
    } else if (game.resources.trimps.realMax() > 300000) {
        autoTrimpSettings.FarmerRatio.value = '3';
        autoTrimpSettings.LumberjackRatio.value = '3';
        autoTrimpSettings.MinerRatio.value = '5';
    } else {
        autoTrimpSettings.FarmerRatio.value = '1';
        autoTrimpSettings.LumberjackRatio.value = '1';
        autoTrimpSettings.MinerRatio.value = '1';
    }
}

//Buys all available non-equip upgrades listed in var upgradeList
function buyUpgrades() {
    for (var upgrade in upgradeList) {
        upgrade = upgradeList[upgrade];
        var gameUpgrade = game.upgrades[upgrade];
        var available = (gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade));
        if (upgrade == 'Coordination' && !canAffordCoordinationTrimps()) continue;
        if (upgrade == 'Shieldblock' && !getPageSetting('BuyShieldblock')) continue;
        if (upgrade == 'Gigastation' && (game.global.lastWarp ? game.buildings.Warpstation.owned < (Math.floor(game.upgrades.Gigastation.done * getPageSetting('DeltaGigastation')) + getPageSetting('FirstGigastation')) : game.buildings.Warpstation.owned < getPageSetting('FirstGigastation'))) continue;
        if ((!game.upgrades.Scientists.done && upgrade != 'Battle') ? (available && upgrade == 'Scientists' && game.upgrades.Scientists.allowed) : (available)) {
            buyUpgrade(upgrade, true, true);
            if(upgrade == 'Coordination') newCoord = true;
            //debug('bought upgrade ' + upgrade);
        }
    }
}

//Buys more storage if resource is over 90% full
function buyStorage() {
    var packMod = 1 + game.portal.Packrat.level * game.portal.Packrat.modifier;
    var Bs = {
        'Barn': 'food',
        'Shed': 'wood',
        'Forge': 'metal'
    };
    for (var B in Bs) {
        var jest = 0;
        var owned = game.resources[Bs[B]].owned;
        var max = game.resources[Bs[B]].max * packMod;
        max = calcHeirloomBonus("Shield", "storageSize", max);
        if(game.global.mapsActive && game.unlocks.imps.Jestimp) {
            jest = simpleSeconds(Bs[B], 45);
            jest = scaleToCurrentMap(jest);
        }
        if (owned > max * 0.9 || owned + jest > max * 0.9) {
            // debug('Buying ' + B + '(' + Bs[B] + ') at ' + Math.floor(game.resources[Bs[B]].owned / (game.resources[Bs[B]].max * packMod * 0.99) * 100) + '%');
            if (canAffordBuilding(B)) {
                safeBuyBuilding(B);
            }
        }

    }
}

//Buy all non-storage buildings
function buyBuildings() {
    if((game.jobs.Miner.locked && game.global.challengeActive != 'Metal') || (game.jobs.Scientist.locked && game.global.challengeActive != "Scientist"))
        return;
    highlightHousing();

    //if housing is highlighted
    if (bestBuilding !== null) {
        //insert gigastation logic here ###############
        if (!safeBuyBuilding(bestBuilding)) {
            buyFoodEfficientHousing();
        }
    } else {
        buyFoodEfficientHousing();
    }

    if(getPageSetting('MaxWormhole') > 0 && game.buildings.Wormhole.owned < getPageSetting('MaxWormhole') && !game.buildings.Wormhole.locked) safeBuyBuilding('Wormhole');

    //Buy non-housing buildings
    if (!game.buildings.Gym.locked && (getPageSetting('MaxGym') > game.buildings.Gym.owned || getPageSetting('MaxGym') == -1)) {
        safeBuyBuilding('Gym');
    }
    if (!game.buildings.Tribute.locked && (getPageSetting('MaxTribute') > game.buildings.Tribute.owned || getPageSetting('MaxTribute') == -1)) {
        safeBuyBuilding('Tribute');
    }
    var targetBreed = parseInt(getPageSetting('GeneticistTimer'));
    //only buy nurseries if enabled,   and we need to lower our breed time, or our target breed time is 0, or we aren't trying to manage our breed time before geneticists, and they aren't locked
    //even if we are trying to manage breed timer pre-geneticists, start buying nurseries once geneticists are unlocked AS LONG AS we can afford a geneticist (to prevent nurseries from outpacing geneticists soon after they are unlocked)
    if ((targetBreed < getBreedTime() || targetBreed == 0 || !getPageSetting('ManageBreedtimer') || (!game.jobs.Geneticist.locked && canAffordJob('Geneticist', false))) && !game.buildings.Nursery.locked) {
        if ((getPageSetting('MaxNursery') > game.buildings.Nursery.owned || getPageSetting('MaxNursery') == -1) && (getBuildingItemPrice(game.buildings.Nursery, "gems", false, 1) < 0.05 * getBuildingItemPrice(game.buildings.Warpstation, "gems", false, 1) || game.buildings.Warpstation.locked) && (getBuildingItemPrice(game.buildings.Nursery, "gems", false, 1) < 0.05 * getBuildingItemPrice(game.buildings.Collector, "gems", false, 1) || game.buildings.Collector.locked || !game.buildings.Warpstation.locked)) {
            safeBuyBuilding('Nursery');
        }
    }
}

function setTitle() {
    document.title = '(' + game.global.world + ')' + ' Trimps ' + document.getElementById('versionNumber').innerHTML;
    //for the dummies like me who always forget to turn automaps back on after portaling
    if(getPageSetting('RunUniqueMaps') && !game.upgrades.Battle.done && autoTrimpSettings.RunMapsWhenStuck.enabled == false) {
        settingChanged("RunMapsWhenStuck");
    }
}

function buyJobs() {
    //Implement Ratio thingy
    if (game.resources.trimps.owned < game.resources.trimps.realMax() * 0.8 && !breedFire) return;
    var freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
    var totalDistributableWorkers = freeWorkers + game.jobs.Farmer.owned + game.jobs.Miner.owned + game.jobs.Lumberjack.owned;

    var farmerRatio = parseInt(getPageSetting('FarmerRatio'));
    var lumberjackRatio = parseInt(getPageSetting('LumberjackRatio'));
    var minerRatio = parseInt(getPageSetting('MinerRatio'));
    var totalRatio = farmerRatio + lumberjackRatio + minerRatio;
    var scientistRatio = totalRatio / 25;
    var oldBuy = game.global.buyAmt;


    // debug('Total farmers to add = ' + Math.floor((farmerRatio / totalRatio * totalDistributableWorkers) - game.jobs.Farmer.owned));



    //Simple buy if you can
    if (getPageSetting('MaxTrainers') > game.jobs.Trainer.owned || getPageSetting('MaxTrainers') == -1) {
        game.global.buyAmt = 1;
        if (canAffordJob('Trainer', false) && !game.jobs.Trainer.locked) {
            freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
            if (freeWorkers <= 0) safeBuyJob('Farmer', -1);
            safeBuyJob('Trainer');
        }
    }
    if (game.jobs.Explorer.owned < getPageSetting('MaxExplorers') || getPageSetting('MaxExplorers') == -1) {
        game.global.buyAmt = 1;
        if (canAffordJob('Explorer', false) && !game.jobs.Explorer.locked) {
            freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
            if (freeWorkers <= 0) safeBuyJob('Farmer', -1);
            safeBuyJob('Explorer');
        }
    }
game.global.buyAmt = oldBuy;
freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
    if (getPageSetting('HireScientists') && !game.jobs.Scientist.locked) {
    //if earlier in the game, buy a small amount of scientists
    if (game.jobs.Farmer.owned < 250000 && !breedFire) {
        var buyScientists = Math.floor((scientistRatio / totalRatio * totalDistributableWorkers) - game.jobs.Scientist.owned);
        //bandaid to prevent situation where 1 scientist is bought, causing floor calculation to drop by 1, making next calculation -1 and entering hiring/firing loop
        //proper fix is including scientists in totalDistributableWorkers and the scientist ratio in the total ratio, but then it waits for 4 jobs
        if(buyScientists > 0 && freeWorkers > 0) safeBuyJob('Scientist', buyScientists);
    }
    //once over 100k farmers, fire our scientists and rely on manual gathering of science
    else if (game.jobs.Scientist.owned > 0) safeBuyJob('Scientist', game.jobs.Scientist.owned * -1);
}
    //Distribute Farmer/Lumberjack/Miner breedfire
    if(!game.jobs.Farmer.locked && !breedFire)
    safeBuyJob('Farmer', Math.floor((farmerRatio / totalRatio * totalDistributableWorkers) - game.jobs.Farmer.owned));
   // else if(breedFire)
   // safeBuyJob('Farmer', game.jobs.Farmer.owned * -1);
    if(!game.jobs.Lumberjack.locked && !breedFire)
    safeBuyJob('Lumberjack', Math.floor((lumberjackRatio / totalRatio * totalDistributableWorkers) - game.jobs.Lumberjack.owned));
    else if(breedFire)
    safeBuyJob('Lumberjack', game.jobs.Lumberjack.owned * -1);
    if(!game.jobs.Miner.locked && !breedFire)
    safeBuyJob('Miner', Math.floor((minerRatio / totalRatio * totalDistributableWorkers) - game.jobs.Miner.owned));
    else if(breedFire)
    safeBuyJob('Miner', game.jobs.Miner.owned * -1);


}

function autoLevelEquipment() {
    if((game.jobs.Miner.locked && game.global.challengeActive != 'Metal') || (game.jobs.Scientist.locked && game.global.challengeActive != "Scientist"))
        return;
    var Best = {
        'healthwood': {
            Factor: 0,
            Name: '',
            Wall: false,
            Status: 'white'
        },
        'healthmetal': {
            Factor: 0,
            Name: '',
            Wall: false,
            Status: 'white'
        },
        'attackmetal': {
            Factor: 0,
            Name: '',
            Wall: false,
            Status: 'white'
        },
        'blockwood': {
            Factor: 0,
            Name: '',
            Wall: false,
            Status: 'white'
        }
    };
    var enemyDamage = getEnemyMaxAttack(game.global.world + 1, 30, 'Snimp', .85);
    var enemyHealth = getEnemyMaxHealth(game.global.world + 1);

    //below challenge multiplier not necessarily accurate, just fudge factors
    if(game.global.challengeActive == "Toxicity") {
        //ignore damage changes (which would effect how much health we try to buy) entirely since we die in 20 attacks anyway?
        if(game.global.world < 61)
            enemyDamage *= 2;
        enemyHealth *= 2;
    }
    if(game.global.challengeActive == 'Lead') {
        enemyDamage *= 2.5;
        enemyHealth *= 7;
    }
    //change name to make sure these are local to the function
    var enoughHealthE = (baseHealth * 4 > 30 * (enemyDamage - baseBlock / 2 > 0 ? enemyDamage - baseBlock / 2 : enemyDamage * 0.2) || baseHealth > 30 * (enemyDamage - baseBlock > 0 ? enemyDamage - baseBlock : enemyDamage * 0.2));
    var enoughDamageE = (baseDamage * 4 > enemyHealth);

    for (var equipName in equipmentList) {
        var equip = equipmentList[equipName];
        // debug('Equip: ' + equip + ' EquipIndex ' + equipName);
        var gameResource = equip.Equip ? game.equipment[equipName] : game.buildings[equipName];
        // debug('Game Resource: ' + gameResource);
        if (!gameResource.locked) {
            document.getElementById(equipName).style.color = 'white';
            var evaluation = evaluateEfficiency(equipName);
            // debug(equipName + ' evaluation ' + evaluation.Status);
            var BKey = equip.Stat + equip.Resource;
            // debug(equipName + ' bkey ' + BKey);

            if (Best[BKey].Factor === 0 || Best[BKey].Factor < evaluation.Factor) {
                Best[BKey].Factor = evaluation.Factor;
                Best[BKey].Name = equipName;
                Best[BKey].Wall = evaluation.Wall;
                Best[BKey].Status = evaluation.Status;
            }

            document.getElementById(equipName).style.borderColor = evaluation.Status;
            if (evaluation.Status != 'white' && evaluation.Status != 'yellow') {
                document.getElementById(equip.Upgrade).style.color = evaluation.Status;
            }
            if (evaluation.Status == 'yellow') {
                document.getElementById(equip.Upgrade).style.color = 'white';
            }
            if (evaluation.Wall) {
                document.getElementById(equipName).style.color = 'yellow';
            }

            if (
                evaluation.Status == 'red' &&
                (
                    (
                        getPageSetting('BuyWeaponUpgrades') &&
                        equipmentList[equipName].Stat == 'attack'
                    ) ||
                    (
                        getPageSetting('BuyArmorUpgrades') &&
                        (
                            equipmentList[equipName].Stat == 'health' ||
                            equipmentList[equipName].Stat == 'block'
                        )
                    )
                )
            ) {
                var upgrade = equipmentList[equipName].Upgrade;
                debug('Upgrading ' + upgrade);
                buyUpgrade(upgrade, true, true);
            }
        }
    }
    preBuy();
    game.global.buyAmt = 1;
    for (var stat in Best) {
        if (Best[stat].Name !== '') {
            var DaThing = equipmentList[Best[stat].Name];
            document.getElementById(Best[stat].Name).style.color = Best[stat].Wall ? 'orange' : 'red';
            //If we're considering an attack item, we want to buy weapons if we don't have enough damage, or if we don't need health (so we default to buying some damage)
            if (getPageSetting('BuyWeapons') && DaThing.Stat == 'attack' && (!enoughDamageE || enoughHealthE)) {
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(Best[stat].Name, null, null, true)) {
                    debug('Leveling equipment ' + Best[stat].Name);
                    buyEquipment(Best[stat].Name, null, true);
                }
            }
            //If we're considering a health item, buy it if we don't have enough health, otherwise we default to buying damage
            if (getPageSetting('BuyArmor') && (DaThing.Stat == 'health' || DaThing.Stat == 'block') && !enoughHealthE) {
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(Best[stat].Name, null, null, true)) {
                    debug('Leveling equipment ' + Best[stat].Name);
                    buyEquipment(Best[stat].Name, null, true);
                }
            }
        }
    }
    postBuy();
}

function manualLabor() {
    var ManualGather = 'metal';
    var breedingTrimps = game.resources.trimps.owned - game.resources.trimps.employed;

    if(breedingTrimps < 5 && game.buildings.Trap.owned == 0 && canAffordBuilding('Trap')) {
        //safeBuyBuilding returns false if item is already in queue
        if(!safeBuyBuilding('Trap'))
        setGather('buildings');
    }
    else if (breedingTrimps < 5 && game.buildings.Trap.owned > 0) {
        setGather('trimps');
    }
   else if (game.resources.science.owned < 100 && document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden') setGather('science');
    //if we have more than 2 buildings in queue, or (our modifier is real fast and trapstorm is off), build
   else if (game.global.buildingsQueue.length ? (game.global.buildingsQueue.length > 1 || game.global.autoCraftModifier == 0 || (getPlayerModifier() > 1000 && game.global.buildingsQueue[0] != 'Trap.1')) : false) {
        // debug('Gathering buildings??');
        setGather('buildings');
    }
    //if we have some upgrades sitting around which we don't have enough science for, gather science
    else if (game.resources.science.owned < scienceNeeded && document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden') {
        // debug('Science needed ' + scienceNeeded);
        setGather('science');
    }
    else if (getPageSetting('TrapTrimps') && parseInt(getPageSetting('GeneticistTimer')) < getBreedTime(true) && game.buildings.Trap.owned < 1 && canAffordBuilding('Trap')) {
                safeBuyBuilding('Trap');
                setGather('buildings');
    }
    else if (getPageSetting('TrapTrimps') && parseInt(getPageSetting('GeneticistTimer')) < getBreedTime(true) && game.buildings.Trap.owned > 0) {
        setGather('trimps');
    }

    else {
        var manualResourceList = {
            'food': 'Farmer',
            'wood': 'Lumberjack',
            'metal': 'Miner',
        };
        var lowestResource = 'food';
        var lowestResourceRate = -1;
        var haveWorkers = true;
        for (var resource in manualResourceList) {
            var job = manualResourceList[resource];
            var currentRate = game.jobs[job].owned * game.jobs[job].modifier;
            // debug('Current rate for ' + resource + ' is ' + currentRate + ' is hidden? ' + (document.getElementById(resource).style.visibility == 'hidden'));
            if (document.getElementById(resource).style.visibility != 'hidden') {
                // debug('INNERLOOP for resource ' +resource);
                if (currentRate === 0) {
                    currentRate = game.resources[resource].owned;
                    // debug('Current rate for ' + resource + ' is ' + currentRate + ' lowest ' + lowestResource + lowestResourceRate);
                    if ((haveWorkers) || (currentRate < lowestResourceRate)) {
                        // debug('New Lowest1 ' + resource + ' is ' + currentRate + ' lowest ' + lowestResource + lowestResourceRate+ ' haveworkers ' +haveWorkers);
                        haveWorkers = false;
                        lowestResource = resource;
                        lowestResourceRate = currentRate;
                    }
                }
                if ((currentRate < lowestResourceRate || lowestResourceRate == -1) && haveWorkers) {
                    // debug('New Lowest2 ' + resource + ' is ' + currentRate + ' lowest ' + lowestResource + lowestResourceRate);
                    lowestResource = resource;
                    lowestResourceRate = currentRate;
                }
            }
            // debug('Current Stats ' + resource + ' is ' + currentRate + ' lowest ' + lowestResource + lowestResourceRate+ ' haveworkers ' +haveWorkers);
        }

        if (game.global.playerGathering != lowestResource && !haveWorkers && !breedFire) {
            // debug('Set gather lowestResource');
            setGather(lowestResource);
        } else if (game.global.turkimpTimer > 0) {
            //debug('Set gather ManualGather');
            setGather('metal');
        } else  if (game.resources.science.owned < getPsString('science', true) * 60 && document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden' && game.global.turkimpTimer < 1 && haveWorkers) {
            setGather('science');
        }
        else if(getPageSetting('TrapTrimps') && game.global.trapBuildToggled == true && game.buildings.Trap.owned < 10000)
            setGather('buildings');
          else if (document.getElementById('scienceCollectBtn').style.display != 'none' && document.getElementById('science').style.visibility != 'hidden')
            setGather('science');

    }
}

//function written by Belaith
function autoStance() {
    if (game.global.gridArray.length === 0) return;
    var missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;
    var newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;


    baseDamage = game.global.soldierCurrentAttack * 2 * (1 + (game.global.achievementBonus / 100)) * ((game.global.antiStacks * game.portal.Anticipation.level * game.portal.Anticipation.modifier) + 1) * (1 + (game.global.roboTrimpLevel * 0.2));
    if (game.global.formation == 2) {
        baseDamage /= 4;
    } else if (game.global.formation != "0") {
        baseDamage *= 2;
    }

    //baseBlock
    baseBlock = game.global.soldierCurrentBlock;
    if (game.global.formation == 3) {
        baseBlock /= 4;
    } else if (game.global.formation != "0") {
        baseBlock *= 2;
    }

    //baseHealth
    baseHealth = game.global.soldierHealthMax;
    if (game.global.formation == 1) {
        baseHealth /= 4;
    } else if (game.global.formation != "0") {
        baseHealth *= 2;
    }

    if (!game.global.mapsActive && !game.global.preMapsActive) {
        var enemy;
        if (typeof game.global.gridArray[game.global.lastClearedCell + 1] === 'undefined') {
            enemy = game.global.gridArray[0];
        } else {
            enemy = game.global.gridArray[game.global.lastClearedCell + 1];
        }
        var enemyFast = game.global.challengeActive != 'Nom' && (game.badGuys[enemy.name].fast || game.global.challengeActive == 'Slow' );
        var enemyHealth = enemy.health;
        //think this is fluctuation in calculateDamage();
        var enemyDamage = enemy.attack * 1.19;
        if (game.global.challengeActive == 'Lead') {
        enemyDamage *= (1 + (game.challenges.Lead.stacks * 0.04));
        }
        if (game.global.challengeActive == 'Watch') {
            enemyDamage *= 1.25;
        }
        var pierceMod = 0;
        if (game.global.challengeActive == "Lead") pierceMod += (game.challenges.Lead.stacks * 0.001);
        var dDamage = enemyDamage - baseBlock / 2 > enemyDamage * (0.2 + pierceMod) ? enemyDamage - baseBlock / 2 : enemyDamage * (0.2 + pierceMod);
        var dHealth = baseHealth/2;
        var xDamage = enemyDamage - baseBlock > enemyDamage * (0.2 + pierceMod) ? enemyDamage - baseBlock : enemyDamage * (0.2 + pierceMod);
        var xHealth = baseHealth;
        var bDamage = enemyDamage - baseBlock * 4 > enemyDamage * (0.1 + pierceMod) ? enemyDamage - baseBlock * 4 : enemyDamage * (0.1 + pierceMod);
        var bHealth = baseHealth/2;
    } else if (game.global.mapsActive && !game.global.preMapsActive) {
        if (typeof game.global.mapGridArray[game.global.lastClearedMapCell + 1] === 'undefined') {
            var enemy = game.global.mapGridArray[0];
        } else {
            var enemy = game.global.mapGridArray[game.global.lastClearedMapCell + 1];
        }
        var enemyFast = game.global.challengeActive != 'Nom' && (game.badGuys[enemy.name].fast || game.global.challengeActive == 'Slow'|| game.global.voidBuff == 'doubleAttack');
        var enemyHealth = enemy.health;
        var enemyDamage = enemy.attack * 1.19;
        if (game.global.challengeActive == 'Lead') {
        enemyDamage *= (1 + (game.challenges.Lead.stacks * 0.04));
        }
        if (game.global.challengeActive == 'Watch') {
            enemyDamage *= 1.25;
        }
        var dDamage = enemyDamage - baseBlock / 2 > 0 ? enemyDamage - baseBlock / 2 : 0;
        var dHealth = baseHealth/2;
        var xDamage = enemyDamage - baseBlock > 0 ? enemyDamage - baseBlock : 0;
        var xHealth = baseHealth;
        var bDamage = enemyDamage - baseBlock * 4 > 0 ? enemyDamage - baseBlock * 4 : 0;
        var bHealth = baseHealth/2;

    }
        var drainChallenge = game.global.challengeActive == 'Nom' || game.global.challengeActive == "Toxicity";

        if (game.global.challengeActive == "Electricity" || game.global.challengeActive == "Mapocalypse") {
            dDamage+= dHealth * game.global.radioStacks * 0.1;
            xDamage+= xHealth * game.global.radioStacks * 0.1;
            bDamage+= bHealth * game.global.radioStacks * 0.1;
        } else if (drainChallenge) {
            dDamage += dHealth/20;
            xDamage += xHealth/20;
            bDamage += bHealth/20;
        }

        else if (game.global.challengeActive == "Crushed") {
            if(dHealth > baseBlock /2)
            dDamage = enemyDamage*5 - baseBlock / 2 > 0 ? enemyDamage*5 - baseBlock / 2 : 0;
            if(xHealth > baseBlock)
            xDamage = enemyDamage*5 - baseBlock > 0 ? enemyDamage*5 - baseBlock : 0;
        }
    if (game.global.voidBuff == "bleed") {
        dDamage += game.global.soldierHealth * 0.2;
        xDamage += game.global.soldierHealth * 0.2;
        bDamage += game.global.soldierHealth * 0.2;
    }
    //double attack is OK if the buff isn't double attack, or we will survive a double attack, or we are going to one-shot them (so they won't be able to double attack)
    var doubleAttackOK = game.global.voidBuff != 'doubleAttack' || ((newSquadRdy && dHealth > dDamage * 2) || dHealth - missingHealth > dDamage * 2) || enemyHealth < baseDamage * (game.global.titimpLeft > 0 ? 4 : 2);
    var leadDamage = game.challenges.Lead.stacks * 0.0003;
    //lead attack ok if challenge isn't lead, or we are going to one shot them, or we can survive the lead damage
    var leadAttackOK = game.global.challengeActive != 'Lead' || enemyHealth < baseDamage * (game.global.titimpLeft > 0 ? 4 : 2) || ((newSquadRdy && dHealth > dDamage + (dHealth * leadDamage)) || (dHealth - missingHealth > dDamage + (dHealth * leadDamage)));
        //add voidcrit?
        //this thing is getting too messy - any more special crap and this needs a bunch of flag variables or something
    if (!game.global.preMapsActive && game.global.soldierHealth > 0) {
        if (!enemyFast && game.upgrades.Dominance.done && enemyHealth < baseDamage * (game.global.titimpLeft > 0 ? 4 : 2) && (newSquadRdy || (dHealth - missingHealth > 0 && !drainChallenge) || (drainChallenge && dHealth - missingHealth > dHealth/20))) {
            if (game.global.formation != 2) {
                setFormation(2);
            }
            //regular checks if voidBuff isn't double attack, or we are going to one-shot. Double damage checks if voidBuff is doubleattack
        } else if (game.upgrades.Dominance.done && ((newSquadRdy && dHealth > dDamage) || dHealth - missingHealth > dDamage) && doubleAttackOK && leadAttackOK) {
            if (game.global.formation != 2) {
                setFormation(2);
            }
        } else if (game.upgrades.Formations.done && ((newSquadRdy && xHealth > xDamage) || xHealth - missingHealth > xDamage)) {
            if (game.global.formation != "0") {
                setFormation("0");
            }
        } else if (game.upgrades.Barrier.done && ((newSquadRdy && bHealth > bDamage) || bHealth - missingHealth > bDamage)) {
            if (game.global.formation != 3) {
                setFormation(3);
            }
        } else if (game.upgrades.Formations.done) {
            if (game.global.formation != 1) {
                setFormation(1);
            }
        } else {
            setFormation("0");
        }
    }
}

//core function written by Belaith
//prison/wonderland flags for use in autoPortal function
var doPrison = false;
var doWonderland = false;
var stackingTox = false;
var doVoids = false;
var needToVoid = false;
var needPrestige = false;
var voidCheckPercent = 0;

function autoMap() {
    //allow script to handle abandoning
        if(game.options.menu.alwaysAbandon.enabled == 1) toggleSetting('alwaysAbandon');

     /*   if(getPageSetting('CoordinationAbandon') && newCoord && !needPrestige && game.global.mapsUnlocked && game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) {
                mapsClicked();
                mapsClicked();
               newCoord = false;
        }
        */
        //if we should be farming, we will continue farming until attack/damage is under 10, if we shouldn't be farming, we will start if attack/damage rises above 15
        //add crit in somehow?
        if(!getPageSetting('DisableFarm')) {
            shouldFarm = shouldFarm ? getEnemyMaxHealth(game.global.world) / baseDamage > 10 : getEnemyMaxHealth(game.global.world) / baseDamage > 15;
        }

    needToVoid = getPageSetting('VoidMaps') > 0 && game.global.totalVoidMaps > 0 && ((game.global.world == getPageSetting('VoidMaps') && !getPageSetting('RunNewVoids')) || (game.global.world >= getPageSetting('VoidMaps') && getPageSetting('RunNewVoids'))) && (game.global.challengeActive != 'Lead' || game.global.lastClearedCell > 95);
    if (game.global.mapsUnlocked) {
        var enemyDamage = getEnemyMaxAttack(game.global.world + 1, 30, 'Snimp', .85);
        var enemyHealth = getEnemyMaxHealth(game.global.world + 1);

        needPrestige = (autoTrimpSettings.Prestige.selected != "Off" && game.mapUnlocks[autoTrimpSettings.Prestige.selected].last <= game.global.world - 5 && game.global.mapsUnlocked && game.global.challengeActive != "Frugal");
        if(game.global.challengeActive == "Toxicity") {
        //ignore damage changes (which would effect how much health we try to buy) entirely since we die in 20 attacks anyway?
        //enemyDamage *= 2;
        enemyHealth *= 2;
        }
        if(game.global.challengeActive == 'Lead') {
            enemyDamage *= 2.5;
            enemyHealth *= 2.5;
        }
        if(game.global.totalVoidMaps == 0 || !needToVoid)
            doVoids = false;

        enoughHealth = (baseHealth * 4 > 30 * (enemyDamage - baseBlock / 2 > 0 ? enemyDamage - baseBlock / 2 : enemyDamage * 0.2) || baseHealth > 30 * (enemyDamage - baseBlock > 0 ? enemyDamage - baseBlock : enemyDamage * 0.2));
        enoughDamage = (baseDamage * 4 > enemyHealth);
        var shouldDoMaps = !enoughHealth || !enoughDamage;
        var shouldDoMap = "world";



        //if we are at max map bonus, and we don't need to farm, don't do maps
        if(game.global.mapBonus == 10 && !shouldFarm) shouldDoMaps = false;
        //if we are prestige mapping, force equip first mode
        if(autoTrimpSettings.Prestige.selected != "Off" && game.options.menu.mapLoot.enabled != 1) toggleSetting('mapLoot');
        //if player has selected arbalest or gambeson but doesn't have them unlocked, just unselect it for them! It's magic!
        if(document.getElementById('Prestige').selectedIndex > 11 && game.global.slowDone == false) {
            document.getElementById('Prestige').selectedIndex = 11;
            autoTrimpSettings.Prestige.selected = "Bestplate";
        }




        //If on toxicity and reached the last cell, calculate if max tox stacks will give us better He/hr (assumes max agility)
        //at looting 54, I have found this only to trigger in lower zones, (20-72 or so) and not been worth it for overall he/hr. Higher looting should trigger it in progressively higher zones, but probably never worth it
        //leaving it in for now. Manually setting heliumGrowing to true in console should allow it to be used for a maximum total helium gained tox run (for bone trader)

        //stack tox stacks if heliumGrowing has been set to true, or of we need to clear our void maps
        if(game.global.challengeActive == 'Toxicity' && game.global.lastClearedCell > 93 && game.challenges.Toxicity.stacks < 1500 && ((getPageSetting('MaxTox') && game.global.world > 59) || needToVoid)) {
            shouldDoMaps = true;
            stackingTox = true;
            //force abandon army
            if(!game.global.mapsActive && !game.global.preMapsActive) {
                mapsClicked();
                mapsClicked();
            }

        }
        else stackingTox = false;

        var obj = {};
        var siphonMap = -1;
        for (var map in game.global.mapsOwnedArray) {
            if (!game.global.mapsOwnedArray[map].noRecycle) {
                obj[map] = game.global.mapsOwnedArray[map].level;
                if(game.global.mapsOwnedArray[map].level == (game.global.world - game.portal.Siphonology.level))
                    siphonMap = map;
            }
        }
        var keysSorted = Object.keys(obj).sort(function(a, b) {
            return obj[b] - obj[a]
        });
        //if there are no non-unique maps, there will be nothing in keysSorted, so set to create a map
        if (keysSorted[0]) var highestMap = keysSorted[0];
        else shouldDoMap = "create";



        for (var map in game.global.mapsOwnedArray) {
            var theMap = game.global.mapsOwnedArray[map];
                //clear void maps if we need to
            if(theMap.location == 'Void' && needToVoid) {
                    //if we are on toxicity, don't clear until we will have max stacks at the last cell.
                    if(game.global.challengeActive == 'Toxicity' && game.challenges.Toxicity.stacks < (1500 - theMap.size)) break;
                    doVoids = true;
                    //check to make sure we won't get 1-shot in nostance by boss
                    var eAttack = getEnemyMaxAttack(game.global.world, theMap.size, 'Voidsnimp', theMap.difficulty);
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
                    if(ourHealth/diff < eAttack - baseBlock) {
                        shouldFarm = true;
                        voidCheckPercent = Math.round((ourHealth/diff)/(eAttack-baseBlock)*100);
                        break;
                    }
                    else {
                        voidCheckPercent = 0;
                        if(getPageSetting('DisableFarm'))
                            shouldFarm = false;
                    }
                shouldDoMap = theMap.id;
                if(game.global.mapsActive && game.global.challengeActive == "Nom") {
                    if(game.global.mapGridArray[game.global.lastClearedMapCell + 1].nomStacks > 6) {
                        mapsClicked(true);
                    }
                }
                break;
            }


            if (theMap.noRecycle && getPageSetting('RunUniqueMaps')) {
                if (theMap.name == 'The Wall' && game.upgrades.Bounty.allowed == 0) {
                    shouldDoMap = theMap.id;
                    break;
                }
                if (theMap.name == 'Dimension of Anger' && document.getElementById("portalBtn").style.display == "none") {
                    var doaDifficulty = Math.ceil(theMap.difficulty / 2);
                    if(game.global.world < 20 + doaDifficulty) continue;
                    shouldDoMap = theMap.id;
                    break;
                }
                //run the prison only if we are 'cleared' to run level 80 + 1 level per 200% difficulty. Could do more accurate calc if needed
                if(theMap.name == 'The Prison' && (game.global.challengeActive == "Electricity" || game.global.challengeActive == "Mapocalypse")) {
                    var prisonDifficulty = Math.ceil(theMap.difficulty / 2);
                    doPrison = true;
                    if(game.global.world >= 80 + prisonDifficulty) {
                        shouldDoMap = theMap.id;
                        break;
                    }
                }
                if(theMap.name == 'The Block' && !game.upgrades.Shieldblock.allowed && (game.global.challengeActive == "Scientist" || game.global.challengeActive == "Trimp" || getPageSetting('BuyShieldblock'))) {
                    shouldDoMap = theMap.id;
                    break;
                }
                if(theMap.name == 'Trimple of Doom' && game.global.challengeActive == "Meditate") {
                    shouldDoMap = theMap.id;
                    break;
                }
                if(theMap.name == 'Bionic Wonderland' && game.global.challengeActive == "Crushed" ) {
                    var wonderlandDifficulty = Math.ceil(theMap.difficulty / 2);
                    if(game.global.world >= 125 + wonderlandDifficulty) {
                    doWonderland = true;
                        shouldDoMap = theMap.id;
                        break;
                    }
                }
                //other unique maps here
            }


        }
        //shouldFarm is true here if: regular shouldFarm check set it, or voidMap difficulty check set it
    if (shouldFarm && siphonMap == -1 && !needPrestige) shouldDoMap = "create";

        //map if we don't have health/dmg or we need to clear void maps or if we are prestige mapping, and our set item has a new prestige available
        if (shouldDoMaps || doVoids || needPrestige) {
            //shouldDoMap = world here if we haven't set it to create yet, meaning we found appropriate high level map, or siphon map
            //if shouldDoMap != world, it already has a map ID and will be run below
            if (shouldDoMap == "world") {
                //if shouldFarm is true, use a siphonology adjusted map, as long as we aren't trying to prestige
                if (shouldDoMaps && shouldFarm && !needPrestige) shouldDoMap = game.global.mapsOwnedArray[siphonMap].id;
                else if (game.global.world == game.global.mapsOwnedArray[highestMap].level) {
                    shouldDoMap = game.global.mapsOwnedArray[highestMap].id;
                } else {
                    //if we dont' have an appropriate max level map, or a siphon map, we need to make one
                    //if(!shouldDoMaps) shouldDoMap = "world";
                    shouldDoMap = "create";
                }
            }
        }

                 //don't map on even worlds if on Lead, except if person is dumb and wants to void on even
            if(game.global.challengeActive == 'Lead' && !doVoids && (game.global.world % 2 == 0 || game.global.lastClearedCell < 50)) {
                    if(game.global.preMapsActive)
                       mapsClicked();
                   return;
               }
        //repeat button management
        if (!game.global.preMapsActive) {
            if (game.global.mapsActive) {
                //if we bought a new coordination and we're in a map and have a new army ready, force abandon to get updated damage numbers
          /*      if(newCoord && game.global.repeatMap && game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) {
                    mapsClicked();
                    mapsClicked();
                    newCoord = false;
                }
                */

                //if we are doing the right map, and it's not a norecycle (unique) map, and we aren't going to hit max map bonus
                if (shouldDoMap == game.global.currentMapId && !game.global.mapsOwnedArray[getMapIndex(game.global.currentMapId)].noRecycle && (game.global.mapBonus < 9 || shouldFarm || stackingTox)) {
                    var targetPrestige = autoTrimpSettings.Prestige.selected;
                    //make sure repeat map is on
                    if (!game.global.repeatMap) {
                        repeatClicked();
                    }
                    //if we aren't here for dmg/hp, and we see the prestige we are after on the last cell of this map, and it's the last one available, turn off repeat to avoid an extra map cycle
                    if (!shouldDoMaps && (game.global.mapGridArray[game.global.mapGridArray.length - 1].special == targetPrestige && game.mapUnlocks[targetPrestige].last >= game.global.world - 9 )) {
                        repeatClicked();
                    }
                } else {
                    //otherwise, make sure repeat map is off
                    if (game.global.repeatMap) {
                        repeatClicked();
                    }
                }
            } else if (!game.global.mapsActive) {
                if (shouldDoMap != "world") {
                    //if shouldFarm, don't switch until after megafarming
                    if (!game.global.switchToMaps && ((shouldFarm && game.global.lastClearedCell > 79) || !shouldFarm)) {
                         mapsClicked();
                    }
                    //if (prestige mapping or need to do void maps or on lead in odd world) abandon army if (a new army is ready or need to void map and we're almost done with the zone)
                    if(game.global.switchToMaps && ((game.global.challengeActive == 'Lead' && game.global.world % 2 == 1) || doVoids || needPrestige) && ((shouldFarm && game.global.challengeActive == 'Lead') || game.resources.trimps.realMax() <= game.resources.trimps.owned + 1 || (doVoids && game.global.lastClearedCell > 95)))
                             mapsClicked();
                }
            }
        } else if (game.global.preMapsActive) {
            if (shouldDoMap == "world") {
                mapsClicked();
            }
            else if (shouldDoMap == "create") {
                //create a siphonology level map if not prestiging (void map diff check consideration here?)
                var mapLevel = game.global.world;
                if(shouldDoMaps && !needPrestige) {
                    mapLevel -= game.portal.Siphonology.level;
                }
                // Ensure the wanted map level is at least 6
                mapLevel = Math.max(6, mapLevel);
                document.getElementById("mapLevelInput").value = mapLevel;
                if (game.global.world > 70) {
                    sizeAdvMapsRange.value = 9;
                    adjustMap('size', 9);
                    difficultyAdvMapsRange.value = 9;
                    adjustMap('difficulty', 9);
                    lootAdvMapsRange.value = 9;
                    adjustMap('loot', 9);

                    biomeAdvMapsSelect.value = "Mountain";
                    updateMapCost();
                } else if (game.global.world < 16) {
                    sizeAdvMapsRange.value = 9;
                    adjustMap('size', 9);
                    difficultyAdvMapsRange.value = 0;
                    adjustMap('difficulty', 0);
                    lootAdvMapsRange.value = 0;
                    adjustMap('loot', 0);

                    biomeAdvMapsSelect.value = "Random";
                    updateMapCost();
                } else {
                    sizeAdvMapsRange.value = 9;
                    adjustMap('size', 9);
                    difficultyAdvMapsRange.value = 9;
                    adjustMap('difficulty', 9);
                    lootAdvMapsRange.value = 0;
                    adjustMap('loot', 0);

                    biomeAdvMapsSelect.value = "Random";
                    updateMapCost();
                }
                //if we are farming (for resources), make sure it's metal, and put low priority on size
                if(shouldFarm) {
                    biomeAdvMapsSelect.value = "Mountain";
                    while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                            sizeAdvMapsRange.value = sizeAdvMapsRange.value - 1;
                    }
                    while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                        lootAdvMapsRange.value = lootAdvMapsRange.value - 1;
                    }
                }
        else {
                    while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                        lootAdvMapsRange.value = lootAdvMapsRange.value - 1;
                    }
                    //prioritize size over difficulty? Not sure. high Helium that just wants prestige = yes.
                    //Really just trying to prevent prestige mapping from getting stuck
                    while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                        difficultyAdvMapsRange.value = difficultyAdvMapsRange.value - 1;
                    }
        }
        //if we can't afford the map we designed, pick our highest map
                if (updateMapCost(true) > game.resources.fragments.owned) {
                    selectMap(game.global.mapsOwnedArray[highestMap].id);
                    runMap();
                } else {
                    if(buyMap() == -2){
                        recycleBelow(true);
                         buyMap();
                    }
                }
                //if we already have a map picked, run it
            } else {
                selectMap(shouldDoMap);
                runMap();
            }
        }
    }
}

//calculate helium we will get from the end of this zone. If (stacks), return helium we will get with max tox stacks
function calculateHelium (stacks) {
    var world = game.global.world;
    var level = 100 + ((world - 1) * 100);
    var amt = 0;
    var baseAmt;

    if(world < 59) baseAmt = 1;
    else baseAmt = 5;

    level = Math.round((level - 1900) / 100);
    level *= 1.35;
    if(level < 0) level = 0;
    amt += Math.round(baseAmt * Math.pow(1.23, Math.sqrt(level)));
    amt += Math.round(baseAmt * level);

    if (game.portal.Looting.level) amt += (amt * game.portal.Looting.level * game.portal.Looting.modifier);

    if (game.global.challengeActive == "Toxicity"){
        var toxMult = (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks) / 100;
        if(toxMult > 2.25 || stacks) toxMult = 2.25;
        amt *= (1 + toxMult);
    }
    amt = Math.floor(amt);
    return amt;
}
//calculate our helium per hour including our helium for the end of this zone, assuming we finish the zone right now (and get that helium right now)
//if (stacked), calculate with maximum toxicity stacks
function calculateNextHeliumHour (stacked) {
    var timeThisPortal = new Date().getTime() - game.global.portalTime;
    timeThisPortal /= 3600000;
    var heliumNow = Math.floor((game.resources.helium.owned + calculateHelium()) / timeThisPortal);
    if(stacked) heliumNow = Math.floor((game.resources.helium.owned + calculateHelium(true)) / (timeThisPortal + (1500 - game.challenges.Toxicity.stacks) / 7200000));
    return heliumNow;
}

var heliumGrowing = false;
var strikes = 0;
var heliumWatch= 0;
/*
function watchHelium (init) {
    var he = calculateNextHeliumHour();
    if(init) {
        heliumGrowing = true;
        strikes = 0;
        heliumWatch = he;
    }
    if (he > heliumWatch) {
        heliumGrowing = true;
        strikes = 0;
        debug('helium growing! ' + he + ' vs: ' + heliumWatch);
    }
    else if (he < heliumWatch) {
    strikes ++;
    }
    if(strikes > 2) {
        heliumGrowing = false;
        debug ('urrrrrrrrr OUT!');
    }
    heliumWatch = he;

}
    setInterval(watchHelium, 10000);
    */



var lastHelium = 0;
var lastZone = 0;
function autoPortal() {
    switch (autoTrimpSettings.AutoPortal.selected) {
        //portal if we have lower He/hr than the previous zone
        case "Helium Per Hour":
            if(game.global.world > lastZone) {
                lastZone = game.global.world;
                var timeThisPortal = new Date().getTime() - game.global.portalTime;
                    timeThisPortal /= 3600000;
                    var myHelium = Math.floor(game.resources.helium.owned / timeThisPortal);
                    if(myHelium < lastHelium && !game.global.challengeActive) {
                        pushData();
                        if(autoTrimpSettings.HeliumHourChallenge.selected != 'None') doPortal(autoTrimpSettings.HeliumHourChallenge.selected);
                        else doPortal();
                    }
                    else lastHelium = myHelium;
            }
            break;
        case "Balance":
            if(game.global.world > 40 && !game.global.challengeActive) {
                pushData();
                doPortal('Balance');
            }
            break;
        case "Electricity":
            //if doPrison is true, autoMaps sent us in there because of electricity
            if(doPrison && !game.global.challengeActive) {
                pushData();
                doPortal('Electricity');
                doPrison = false;
            }
            break;
        case "Crushed":
            //if doWonderland is true, autoMaps sent us in there because of crushed
            if(doWonderland && !game.global.challengeActive) {
                pushData();
                doPortal('Crushed');
                doWonderland = false;
            }
            break;
        case "Nom":
            if(game.global.world > 145 && !game.global.challengeActive) {
                pushData();
                doPortal('Nom');
            }
            break;
        case "Toxicity":
            if(game.global.world > 165 && !game.global.challengeActive) {
                pushData();
                doPortal('Toxicity');
            }
            break;
        case "Watch":
            if(game.global.world > 180 && !game.global.challengeActive) {
                pushData();
                doPortal('Watch');
            }
            break;
        case "Lead":
            if(game.global.world > 180 && !game.global.challengeActive) {
                pushData();
                doPortal('Lead');
            }
            break;
        case "Custom":
            if(game.global.world > getPageSetting('CustomAutoPortal') && !game.global.challengeActive) {
                pushData();
                    if(autoTrimpSettings.HeliumHourChallenge.selected != 'None') doPortal(autoTrimpSettings.HeliumHourChallenge.selected);
                    else doPortal();
            }
            break;
        default:
            break;

    }

}

function checkSettings() {
    var portalLevel = -1;
    var leadCheck = false;
    switch(autoTrimpSettings.AutoPortal.selected) {
        case "Off":
        break;
        case "Custom":
        portalLevel = autoTrimpSettings.CustomAutoPortal.value + 1;
        leadCheck = autoTrimpSettings.HeliumHourChallenge.selected == "Lead" ? true:false;
        break;
        case "Balance":
        portalLevel = 41;
        break;
        case "Electricity":
        portalLevel = 82;
        break;
        case "Crushed":
        portalLevel = 126;
        break;
        case "Nom":
        portalLevel = 146;
        break;
        case "Toxicity":
        portalLevel = 166;
        break;
        case "Lead":
        portalLevel = 181;
        break;
        case "Watch":
        portalLevel = 181;
        break;
    }
    if(portalLevel == -1)
        return;
    if(autoTrimpSettings.VoidMaps.value >= portalLevel) {
        tooltip('confirm', null, 'update', 'It looks like your void maps may be set to complete after your autoPortal. Your void maps may not be done at all in this case. Please verify your settings. Remember you can choose \'Custom\' autoPortal along with challenges for complete control over when you portal. <br><br> Estimated autoPortal level: ' + portalLevel , 'cancelTooltip()', 'Void Maps Conflict');
        return;
    }
    if((leadCheck || game.global.challengeActive == 'Lead') && (autoTrimpSettings.VoidMaps.value % 2 == 0 && portalLevel < 182))
        tooltip('confirm', null, 'update', 'It looks like you may be on the Lead challenge or planning to run it and your void maps are set to complete on an even zone. You will receive double helium for completeing them in an odd numbered zone. Consider changing this.', 'cancelTooltip()', 'Lead Challenge Void Maps');
}

function doPortal(challenge) {
    if(!game.global.portalActive) return;
    portalClicked();
    if(challenge) selectChallenge(challenge);
        activateClicked();
        activatePortal();
        lastHelium = 0;
        lastZone = 0;
}

//adjust geneticists to reach desired breed timer
function manageGenes() {
    var fWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
    if(getPageSetting('ManageBreedtimer')) {
        if(game.options.menu.showFullBreed.enabled != 1) toggleSetting("showFullBreed");

        if(game.portal.Anticipation.level == 0) autoTrimpSettings.GeneticistTimer.value = '0';
        else if(game.global.challengeActive == 'Electricity' || game.global.challengeActive == 'Mapocalypse') autoTrimpSettings.GeneticistTimer.value = '3.5';
        else if(game.global.challengeActive == 'Nom' || game.global.challengeActive == 'Toxicity') {
            //intent of below if is to push through past megafarming with 30 anti stacks if we need to farm,
            //but raising to 30 antistacks often turns shouldfarm off. Would need a separate shouldFarmNom variable that approximates at 10 stacks? Don't care enough to do now
            //if(shouldFarm && !game.global.mapsActive) autoTrimpSettings.GeneticistTimer.value = '30';
            autoTrimpSettings.GeneticistTimer.value = '11';
        }
        else autoTrimpSettings.GeneticistTimer.value = '30';
    }
    var inDamageStance = game.upgrades.Dominance.done ? game.global.formation == 2 : game.global.formation == 0;
    var targetBreed = parseInt(getPageSetting('GeneticistTimer'));
    //if we need to hire geneticists
    //Don't hire geneticists if total breed time remaining is greater than our target breed time
    //Don't hire geneticists if we have already reached 30 anti stacks (put off further delay to next trimp group)
    if (targetBreed > getBreedTime() && !game.jobs.Geneticist.locked && targetBreed > getBreedTime(true) && (game.global.lastBreedTime/1000 + getBreedTime(true) < 30) && game.resources.trimps.soldiers > 0 && inDamageStance && !breedFire) {
        //insert 10% of total food limit here? or cost vs tribute?
        //if there's no free worker spots, fire a farmer
        if (fWorkers < 1 && canAffordJob('Geneticist', false)) {
            safeBuyJob('Farmer', -1);
        }
        //hire a geneticist
        safeBuyJob('Geneticist');
    }
    //if we need to speed up our breeding
    //if we have potency upgrades available, buy them. If geneticists are unlocked, or we aren't managing the breed timer, just buy them
    if ((targetBreed < getBreedTime() || !game.jobs.Geneticist.locked || !getPageSetting('ManageBreedtimer')) && game.upgrades.Potency.allowed > game.upgrades.Potency.done && canAffordTwoLevel('Potency') && getPageSetting('BuyUpgrades')) {
        buyUpgrade('Potency');
    }
    //otherwise, if we have some geneticists, start firing them
    else if ((targetBreed < getBreedTime() || targetBreed < getBreedTime(true)) && !game.jobs.Geneticist.locked && game.jobs.Geneticist.owned > 10) {
            safeBuyJob('Geneticist', -10);
            //debug('fired a geneticist');

    }
        //if our time remaining to full trimps is still too high, fire some jobs to get-er-done
        //needs option to toggle? advanced options?
        else if ((targetBreed < getBreedTime(true) || (game.resources.trimps.soldiers == 0 && getBreedTime(true) > 6)) && breedFire == false && getPageSetting('BreedFire') && game.global.world > 10) {
                breedFire = true;
    }
/*
    //really should be integrated with the buyBuildings routine instead of here, but I think it's mostly harmless here
    else if (targetBreed < getBreedTime() && getPageSetting('ManageBreedtimer') && !game.buildings.Nursery.locked) {
        safeBuyBuilding('Nursery');
    }
*/

    //reset breedFire once we have less than 2 seconds remaining
    if(getBreedTime(true) < 2) breedFire = false;

}



////////////////////////////////////////
//Logic Loop////////////////////////////
////////////////////////////////////////



//This is totally cheating Only use for debugging
// game.settings.speed = 1;
// game.settings.speedTemp = 1;
// setTimeout(function() {
//     game.settings.speed = 2;
// }, 1000);

setTimeout(delayStart, 2000);

function mainLoop() {
    game.global.addonUser = true;
    if(getPageSetting('PauseScript')) return;
    if(game.global.viewingUpgrades) return;
    setTitle();
    setScienceNeeded();
    updateValueFields();

    if (getPageSetting('EasyMode')) easyMode(); //This needs a UI input
    if (getPageSetting('BuyUpgrades')) buyUpgrades();
    if (getPageSetting('BuyStorage')) buyStorage();
    if (getPageSetting('BuyBuildings')) buyBuildings();
    if (getPageSetting('BuyJobs')) buyJobs();
    if (getPageSetting('ManualGather')) manualLabor();
    if (getPageSetting('RunMapsWhenStuck')) autoMap();
    if (getPageSetting('GeneticistTimer') >= 0) manageGenes();
    if (autoTrimpSettings.AutoPortal.selected != "Off") autoPortal();
    if (getPageSetting('AutoHeirlooms')) autoHeirlooms();
    if (getPageSetting('TrapTrimps') && game.global.trapBuildAllowed && game.global.trapBuildToggled == false) toggleAutoTrap();


    if (getPageSetting('AutoStance')) autoStance();
    //if autostance is not on, we should do base calculations here so stuff like automaps still works
    else {
        baseDamage = game.global.soldierCurrentAttack * 2 * (1 + (game.global.achievementBonus / 100)) * ((game.global.antiStacks * game.portal.Anticipation.level * game.portal.Anticipation.modifier) + 1) * (1 + (game.global.roboTrimpLevel * 0.2));
        if (game.global.formation == 2) {
            baseDamage /= 4;
        } else if (game.global.formation != "0") {
            baseDamage *= 2;
        }
        //baseBlock
        baseBlock = game.global.soldierCurrentBlock;
        if (game.global.formation == 3) {
            baseBlock /= 4;
        } else if (game.global.formation != "0") {
            baseBlock *= 2;
        }
        //baseHealth
        baseHealth = game.global.soldierHealthMax;
        if (game.global.formation == 1) {
            baseHealth /= 4;
        } else if (game.global.formation != "0") {
            baseHealth *= 2;
        }
    }
    //auto-close breaking the world textbox
    if(document.getElementById('tipTitle').innerHTML == 'The Improbability') cancelTooltip();
    autoLevelEquipment();

    if (getPageSetting('AutoFight')) {
        //Manually fight instead of using builtin auto-fight
        if (game.global.autoBattle) {
            if (!game.global.pauseFight) {
                pauseFight(); //Disable autofight
            }
        }
        lowLevelFight = game.resources.trimps.maxSoldiers < (game.resources.trimps.owned - game.resources.trimps.employed) * 0.5 && (game.resources.trimps.owned - game.resources.trimps.employed) > game.resources.trimps.realMax() * 0.1 && game.global.world < 5 && game.global.sLevel > 0;
        if (game.upgrades.Battle.done && !game.global.fighting && game.global.gridArray.length !== 0 && !game.global.preMapsActive && (game.resources.trimps.realMax() <= game.resources.trimps.owned + 1 || game.global.soldierHealth > 0 || lowLevelFight )) {
            fightManual();
            newCoord = false;
            // debug('triggered fight');
        }
    }
    if(game.resources.trimps.soldiers == 0) noFight ++;

}

function delayStart() {
    initializeAutoTrimps();
    setTimeout(delayStartAgain, 2000);
}
function delayStartAgain(){
     setInterval(mainLoop, runInterval);
     updateCustomButtons();
     //setInterval(updateCustomButtons, 10000);
}
