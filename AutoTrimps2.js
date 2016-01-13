// ==UserScript==
// @name         AutoTrimpsV2
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  try to take over the world!
// @author       zininzinin, spindrjr, belaith
// @include        *trimps.github.io*
// @grant        none
// ==/UserScript==


////////////////////////////////////////
//Variables/////////////////////////////
////////////////////////////////////////
var runInterval = 10; //How often to loop through logic
var enableDebug = true; //Spam console?
var running = false;

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

var upgradeList = ['Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Megaminer', 'Megalumber', 'Megafarming', 'Megascience', 'Efficiency', 'TrainTacular', 'Miners', 'Scientists', 'Trainers', 'Explorers', 'Blockmaster', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'Anger', 'Formations', 'Dominance', 'Barrier', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm', 'Gigastation'];
var buildingList = ['Hut', 'House', 'Gym', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation', 'Tribute', 'Nursery']; //NOTE THAT I REMOVED WORMHOLE TEMPORARILY UNTILL I FIGURE OUT WHAT TO DO WITH IT
var pageSettings = [];
var bestBuilding;
var scienceNeeded;
//pull from user setting
var managePreGenes = true;

var baseDamage = 0;
var baseBlock = 0;
var baseHealth = 0;

var preBuyAmt = game.global.buyAmt;
var preBuyFiring = game.global.firing;
var preBuyTooltip = game.global.lockTooltip;


////////////////////////////////////////
//Page Changes//////////////////////////
////////////////////////////////////////
document.getElementById("buyHere").innerHTML += '<div id="autoContainer" style="display: block; font-size: 12px;"> <div id="autoTitleDiv" class="titleDiv"> <div class="row"> <div class="col-xs-4"><span id="autoTitleSpan" class="titleSpan">Automation</span> </div> </div> </div> <br> <div class="autoBox" id="autoHere"> </div> <table style="text-align: left; vertical-align: top; width: 90%;" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td style="vertical-align: top;"> Loops <br> <input id="chkBuyStorage" title="Will buy storage when resource is almost full" type="checkbox">Buy Storage <br> <input id="chkManualStorage" title="Will automatically gather resources and trap trimps" type="checkbox">Manual Gather <br> <input id="chkBuyJobs" title="Buys jobs based on ratios configured" type="checkbox">Buy Jobs <br> <input id="chkBuyBuilding" title="Will buy non storage buildings as soon as they are available" type="checkbox">Buy Buildings <br> <input id="chkBuyUpgrades" title="autobuy non eqipment Upgrades" type="checkbox">Buy Upgrades <br>  <input id="chkAutoStance" title="automate setting stance" type="checkbox">Auto Stance</td> <td style="vertical-align: top;"> Equipment <br> <input id="chkBuyEquipH" title="Will buy the most efficient armor available" type="checkbox">Buy Armor <br> <input id="chkBuyPrestigeH" title="Will buy the most efficient armor upgrade available" type="checkbox">Buy Armor Upgrades <br> <input id="chkBuyEquipA" title="Will buy the most efficient weapon available" type="checkbox">Buy Weapons <br> <input id="chkBuyPrestigeA" title="Will buy the most efficient weapon upgrade available" type="checkbox">Buy Weapon Upgrades <br><br> Misc Settings <br> <input id="chkTrapTrimps" title="automate trapping trimps" type="checkbox">Trap Trimps<br><input id="geneticistTargetBreedTime" title="Breed time in seconds to shoot for using geneticists" style="width: 20%;color: #000000;font-size: 12px;" value="5">&nbsp;Geneticist Timer<br></td> </tr> <tr> <td style="vertical-align: middle; text-align: left;"> <br>Max Buildings to build <br> <input id="maxHut" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Hut <br> <input id="maxHouse" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; House <br> <input id="maxMansion" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Mansion <br> <input id="maxHotel" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Hotel <br> <input id="maxResort" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Resort <br> <input id="maxGateway" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Gateway <br> <input id="maxCollector" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Collector <br> <input id="maxWarpstation" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Warpstation <br> <input id="maxGym" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Gym <br> <input id="maxTribute" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Tribute <br> <input id="maxNursery" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Nursery <br> <br> </td> <td style="text-align: left; vertical-align: top;"> <br>Maps <br> <input id="chkAutoUniqueMap" title="Auto run unique maps" type="checkbox"> Auto run unique maps <br> <input id="chkAutoProgressMap" title="Runs maps when cannot defeat current level" type="checkbox">Auto map when stuck <br> <input id="maxHitsTillStuck" style="width: 10%; color: #000000;" value="10">&nbsp;Max hits to kill enemy before stuck<br><br>Ratio<br><input id="FarmerRatio" style="width: 10%; color: #000000;" value="10">&nbsp;Farmer<br><input id="LumberjackRatio" style="width: 10%; color: #000000;" value="10">&nbsp;Lumberjack<br><input id="MinerRatio" style="width: 10%; color: #000000;" value="10">&nbsp;Miner<br><input id="chkScientist" type="checkbox">&nbsp;Scientist<br><input id="chkTrainer" type="checkbox">&nbsp;Trainer<br><input id="chkExplorer" type="checkbox">&nbsp;Explorer<br><input id="chkGym" type="checkbox">&nbsp;Gym<br><input id="chkTribute" type="checkbox">&nbsp;Tribute<br><input id="chkNursery" type="checkbox">&nbsp;Nursery</td> </tr> </tbody> </table></div>';


////////////////////////////////////////
//Utility Functions/////////////////////
////////////////////////////////////////

//Loads the automation settings from browser cache
function loadPageVariables() {
    var temp = document.getElementById("autoContainer").innerHTML.split('input id="');
    temp.splice(0, 1);
    for (var i in temp) {
        pageSettings.push(temp[i].substring(0, temp[i].indexOf('"')));
    }

    //Set all the saved variables
    for (var index in pageSettings) {
        var setting = pageSettings[index];
        if (localStorage.getItem(setting) !== null) {
            // debug(setting + ' is of type ' + document.getElementById(setting).type);
            var local = localStorage.getItem(setting);
            if (document.getElementById(setting).type == 'checkbox') {
                local = (local == 'true');
                if (document.getElementById(setting).checked != local) {
                    // debug('FIRST Setting ' + setting + ' to ' + local + ' from ' + document.getElementById(setting).checked);
                    document.getElementById(setting).checked = local;
                    // debug(setting + ' is set to ' + document.getElementById(setting).checked);
                }
            } else {
                if (document.getElementById(setting).value != localStorage.getItem(setting)) {
                    // debug('FIRST Setting ' + setting + ' to ' + localStorage.getItem(setting));
                    document.getElementById(setting).value = localStorage.getItem(setting);
                    // debug(setting + ' is set to ' + document.getElementById(setting).value);
                }
            }
        }
    }
}

//Saves automation settings to browser cache
function saveSettings() {
    // debug('Saved');
    for (var index in pageSettings) {
        var setting = pageSettings[index];
        // debug('Setting is ' +setting);
        if (document.getElementById(setting).type == 'checkbox') {
            localStorage.setItem(setting, document.getElementById(setting).checked);
        } else {
            localStorage.setItem(setting, document.getElementById(setting).value);
        }
    }
}

//Grabs the automation settings from the page
function getPageSetting(setting) {
    // debug('Looking for setting ' + setting);
    if (!document.getElementById(setting)) return false;
    if (document.getElementById(setting).type == 'checkbox') {
        return document.getElementById(setting).checked;
    } else {
        return document.getElementById(setting).value;
    }
}

//Global debug message (need to implement debugging to in game window)
function debug(message) {
    if (enableDebug)
        console.log(timeStamp() + ' ' + message);
}

//Finds an element on the page and does the onClick() function
function clickButton(id) {
    debug('Trying to click button: ' + id);
    if (document.getElementById(id).style.visibility != 'hidden') {
        document.getElementById(id).click();
        setTimeout(function() {}, 10);
        return true;
    } else {
        debug('Cannot click button: ' + id);
        return false;
    }
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
    for (var b in game.global.buildingsQueue) {
        if (game.global.buildingsQueue[b].includes(building)) return false;
    }
    
    if (!canAffordBuilding(building)) return false;
    debug('Building ' + building);
    preBuy();
    game.global.buyAmt = 1;
    game.global.firing = false;
    buyBuilding(building);
    postBuy();
    tooltip("hide");
    return true;
}

//Outlines the most efficient housing based on gems (credits to Belaith)
function highlightHousing() {
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
            cost += getBuildingItemPrice(building, "gems");
            var ratio = cost / building.increase.by;
            obj[unlockedHousing[house]] = ratio;
            if (document.getElementById(unlockedHousing[house]).style.border = "1px solid #00CC00") {
                document.getElementById(unlockedHousing[house]).style.border = "1px solid #FFFFFF";
                // document.getElementById(unlockedHousing[house]).removeEventListener("click", update);
            }
        }
        var keysSorted = Object.keys(obj).sort(function(a, b) {
            return obj[a] - obj[b]
        });
        //loop through the array and find the first one that isn't limited by max settings
        for (var best in keysSorted) {
            var max = getPageSetting('max' + keysSorted[best]);
            if(max === false) max = -1;
            if(game.buildings[keysSorted[best]].owned < max || max == -1) {
                bestBuilding = keysSorted[best];
                break;
            }
        }
        if(bestBuilding){
            document.getElementById(bestBuilding).style.border = "1px solid #00CC00";
        }
        // document.getElementById(bestBuilding).addEventListener('click', update, false);
    } else {
        bestBuilding = null;
    }
}

function buyFoodEfficientHousing() {
    var houseWorth = game.buildings.House.locked ? 0 : game.buildings.House.increase.by / getBuildingItemPrice(game.buildings.House, "food");
    var hutWorth = game.buildings.Hut.increase.by / getBuildingItemPrice(game.buildings.Hut, "food");
    var hutAtMax = (game.buildings.Hut.owned >= getPageSetting('maxHut') && getPageSetting('maxHut') != -1);
    //if hutworth is more, but huts are maxed , still buy up to house max
    if ((houseWorth > hutWorth || hutAtMax) && canAffordBuilding('House') && (game.buildings.House.owned < getPageSetting('maxHouse') || getPageSetting('maxHouse') == -1 )) {
        safeBuyBuilding('House');
    } else {
        if(!hutAtMax){
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
    }
    game.global.buyAmt = amount;
    if (!canAffordJob(jobTitle, false)) {
        postBuy();
        return false;
    }
    //debug((game.global.firing ? 'Firing ' : 'Hiring ') + game.global.buyAmt + ' ' + jobTitle);
    buyJob(jobTitle);
    postBuy();
    tooltip("hide");
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
            Wall = NextEff / NextCost > Res;
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
    var price = parseFloat(getBuildingItemPrice(gameResource, equip.Resource, equip.Equip));
    if (equip.Equip) price = Math.ceil(price * (Math.pow(1 - game.portal.Artisanistry.modifier, game.portal.Artisanistry.level)));
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

function getBreedTime() {
    var trimps = game.resources.trimps;
    var breeding = trimps.owned - trimps.employed;
    var trimpsMax = trimps.realMax();

    var potencyMod = trimps.potency;
    if (game.global.brokenPlanet) breeding /= 10;

    //Pheromones
    potencyMod += (potencyMod * game.portal.Pheromones.level * game.portal.Pheromones.modifier);
    if (game.jobs.Geneticist.owned > 0) potencyMod *= Math.pow(0.98, game.jobs.Geneticist.owned);
    if (game.unlocks.quickTrimps) potencyMod *= 2;
    breeding = breeding * potencyMod;
    updatePs(breeding, true);


    var timeRemaining = log10((trimpsMax - trimps.employed) / (trimps.owned - trimps.employed)) / log10(1 + (potencyMod / 10));
    if (!game.global.brokenPlanet) timeRemaining /= 10;
    timeRemaining = Math.floor(timeRemaining) + " Secs";
    var fullBreed = 0;
    if (game.options.menu.showFullBreed.enabled) {
        var adjustedMax = (game.portal.Coordinated.level) ? game.portal.Coordinated.currentSend : trimps.maxSoldiers;
        var totalTime = log10((trimpsMax - trimps.employed) / ((trimpsMax - adjustedMax) - trimps.employed)) / log10(1 + (potencyMod / 10));
        if (!game.global.brokenPlanet) totalTime /= 10;
        fullBreed = Math.floor(totalTime) + " Secs";
        timeRemaining += " / " + fullBreed;
    }
    // debug('Time to breed is ' +Math.floor(totalTime));
    return Math.floor(totalTime);
}


////////////////////////////////////////
//Main Functions////////////////////////
////////////////////////////////////////

function initializeAutoTrimps() {
    debug('initializeAutoTrimps');
    loadPageVariables();
}

function easyMode() {
    if (game.resources.trimps.realMax() > 3000000) {
        document.getElementById("FarmerRatio").value = 3;
        document.getElementById("LumberjackRatio").value = 1;
        document.getElementById("MinerRatio").value = 4;
    } else if (game.resources.trimps.realMax() > 300000) {
        document.getElementById("FarmerRatio").value = 3;
        document.getElementById("LumberjackRatio").value = 3;
        document.getElementById("MinerRatio").value = 5;
    } else {
        document.getElementById("FarmerRatio").value = 1;
        document.getElementById("LumberjackRatio").value = 1;
        document.getElementById("MinerRatio").value = 1;
    }
}

//Buys all available non-equip upgrades listed in var upgradeList
function buyUpgrades() {
    for (var upgrade in upgradeList) {
        upgrade = upgradeList[upgrade];
        var gameUpgrade = game.upgrades[upgrade];
        var available = (gameUpgrade.allowed > gameUpgrade.done && canAffordTwoLevel(gameUpgrade));
        if(upgrade == 'Coordination' && !canAffordCoordinationTrimps()) continue;
        //PULL INITIAL AND DELTA WARPSTATION NUMBERS HERE. 
        if(upgrade == 'Gigastation' && (game.global.lastWarp ? game.buildings.Warpstation.owned < game.global.lastWarp + 2 : game.buildings.Warpstation.owned < 20)) continue;
        if ((!game.upgrades.Scientists.done && upgrade != 'Battle') ? (available && upgrade == 'Scientists' && game.upgrades.Scientists.allowed) : (available)) {
            buyUpgrade(upgrade);
            tooltip("hide");
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
        if (game.resources[Bs[B]].owned > game.resources[Bs[B]].max * packMod * 0.9) {
            // debug('Buying ' + B + '(' + Bs[B] + ') at ' + Math.floor(game.resources[Bs[B]].owned / (game.resources[Bs[B]].max * packMod * 0.99) * 100) + '%');
            if (canAffordBuilding(B)) {
                safeBuyBuilding(B);
            }
        }
    }
}

//Buy all non-storage buildings
function buyBuildings() {
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

    //Buy non-housing buildings
    if (getPageSetting('chkGym') && !game.buildings.Gym.locked) {
        safeBuyBuilding('Gym');
    }
    if (getPageSetting('chkTribute') && !game.buildings.Tribute.locked) {
        safeBuyBuilding('Tribute');
    }
    //only buy nurseries if enabled,   and we aren't trying to manage our breed time before geneticists, and they aren't locked
    //even if we are trying to manage breed timer pre-geneticists, start buying nurseries once geneticists are unlocked AS LONG AS we can afford a geneticist (to prevent nurseries from outpacing geneticists soon after they are unlocked)
    if (getPageSetting('chkNursery') && (!managePreGenes || (!game.jobs.Geneticist.locked && canAffordJob('Geneticist', false))) && !game.buildings.Nursery.locked) {
        if(getPageSetting('maxNursery') > game.buildings.Nursery.owned || (getPageSetting('maxNursery') == -1 && getBuildingItemPrice(game.buildings.Nursery, "gems") < 0.05 * getBuildingItemPrice(game.buildings.Warpstation, "gems") && !game.buildings.Warpstation.locked)  ) {
        safeBuyBuilding('Nursery');
        }
    }
}

function setTitle() {
    document.title = '(' + game.global.world + ')' + ' Trimps ' + document.getElementById('versionNumber').innerHTML;
}

function buyJobs() {
    //Implement Ratio thingy
    if(game.resources.trimps.owned < game.resources.trimps.realMax()*0.8) return;
    var freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
    var totalDistributableWorkers = freeWorkers + game.jobs.Farmer.owned + game.jobs.Miner.owned + game.jobs.Lumberjack.owned;

    var farmerRatio = parseInt(getPageSetting('FarmerRatio'));
    var lumberjackRatio = parseInt(getPageSetting('LumberjackRatio'));
    var minerRatio = parseInt(getPageSetting('MinerRatio'));
    var totalRatio = farmerRatio + lumberjackRatio + minerRatio;
    var scientistRatio = totalRatio/50;


    // debug('Total farmers to add = ' + Math.floor((farmerRatio / totalRatio * totalDistributableWorkers) - game.jobs.Farmer.owned));



    //Simple buy if you can
    if (getPageSetting('chkTrainer')) {
        game.global.buyAmt = 1;
        while (canAffordJob('Trainer', false) && !game.jobs.Trainer.locked) {
            freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
            if (!freeWorkers) safeBuyJob('Farmer', -1);
            safeBuyJob('Trainer');
        }
    }
    if (getPageSetting('chkExplorer')) {
        game.global.buyAmt = 1;
        while (canAffordJob('Explorer', false) && !game.jobs.Explorer.locked) {
            freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
            if (!freeWorkers) safeBuyJob('Farmer', -1);
            safeBuyJob('Explorer');
        }
    }

  /*  if (getPageSetting('chkScientist') && !game.jobs.Scientist.locked) {
        // debug('Total needed science ' +scienceNeeded);
        if (game.resources.science.owned < scienceNeeded) {
            safeBuyJob('Farmer', game.jobs.Farmer.owned * -1);
            safeBuyJob('Lumberjack', game.jobs.Lumberjack.owned * -1);
            safeBuyJob('Miner', game.jobs.Miner.owned * -1);
            safeBuyJob('Scientist', Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed);
        } else {
            safeBuyJob('Scientist', game.jobs.Scientist.owned * -1);
        }
    }  
    */

    //if earlier in the game, buy a small amount of scientists
    if(game.jobs.Farmer.owned < 100000) {
        safeBuyJob('Scientist', Math.floor((scientistRatio / totalRatio * totalDistributableWorkers) - game.jobs.Scientist.owned));
    }
    //once over 100k farmers, fire our scientists and rely on manual gathering of science
    else if (game.jobs.Scientist.owned > 0) safeBuyJob('Scientist', game.jobs.Scientist.owned * -1);
    //Distribute Farmer/Lumberjack/Miner
    safeBuyJob('Farmer', Math.floor((farmerRatio / totalRatio * totalDistributableWorkers) - game.jobs.Farmer.owned));
    safeBuyJob('Lumberjack', Math.floor((lumberjackRatio / totalRatio * totalDistributableWorkers) - game.jobs.Lumberjack.owned));
    safeBuyJob('Miner', Math.floor((minerRatio / totalRatio * totalDistributableWorkers) - game.jobs.Miner.owned));
}

function autoLevelEquipment() {
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
    var enemyDamage = getEnemyMaxAttack(game.global.world + 1);
    var enemyHeath = getEnemyMaxHealth(game.global.world + 1);
    var enoughHealth = (baseHealth * 4 > 30 * (enemyDamage - baseBlock / 2 > 0 ? enemyDamage - baseBlock / 2 : 0) || baseHealth > 30 * (enemyDamage - baseBlock > 0 ? enemyDamage - baseBlock : 0));
    var enoughDamage = (baseDamage * 4 > enemyHeath);
    
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
                        getPageSetting('chkBuyPrestigeA') &&
                        equipmentList[equipName].Stat == 'attack'
                    ) ||
                    (
                        getPageSetting('chkBuyPrestigeH') &&
                        (
                            equipmentList[equipName].Stat == 'health' ||
                            equipmentList[equipName].Stat == 'block'
                        )
                    )
                )
            ) {
                var upgrade = equipmentList[equipName].Upgrade;
                debug('Upgrading ' + upgrade);
                buyUpgrade(upgrade);
                // tooltip('hide');
            }
        }
    }

    for (var stat in Best) {
        if (Best[stat].Name !== '') {
            var DaThing = equipmentList[Best[stat].Name];
            document.getElementById(Best[stat].Name).style.color = Best[stat].Wall ? 'orange' : 'red';
            //If we're considering an attack item, we want to buy weapons if we don't have enough damage, or if we don't need health (so we default to buying some damage)
            if (getPageSetting('chkBuyEquipA') && DaThing.Stat == 'attack' && (!enoughDamage || enoughHealth)) {
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(Best[stat].Name, null, null, true)) {
                    debug('Leveling equipment ' + Best[stat].Name);
                    buyEquipment(Best[stat].Name);
                    tooltip('hide');
                }
            }
            //If we're considering a health item, buy it if we don't have enough health, otherwise we default to buying damage
            if (getPageSetting('chkBuyEquipH') && (DaThing.Stat == 'health' || DaThing.Stat == 'block') && !enoughHealth){
                 if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(Best[stat].Name, null, null, true)) {
                    debug('Leveling equipment ' + Best[stat].Name);
                    buyEquipment(Best[stat].Name);
                    tooltip('hide');
                }
            }
        }
    }
}

function manualLabor() {
    var ManualGather = 'metal';
    //If you can autofight - set autofight to true
    if (game.upgrades.Bloodlust.done == 1 && game.global.pauseFight) {
        pauseFight();
    }
    //if we have more than 2 buildings in queue, or our modifier is real fast, build
    if (game.global.buildingsQueue.length ? (game.global.buildingsQueue[0].startsWith("Trap") ? (game.global.buildingsQueue.length > 1) : true) : false) {
        // debug('Gathering buildings??');
        setGather('buildings');
    }
    //if we have some upgrades sitting around which we don't have enough science for, gather science
    else if (game.resources.science.owned < scienceNeeded) {
        // debug('Science needed ' + scienceNeeded);
        setGather('science');
    } else {
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

        if (game.global.playerGathering != lowestResource && !haveWorkers) {
            // debug('Set gather lowestResource');
            setGather(lowestResource);
        } else if (game.global.playerGathering != ManualGather) {
            // debug('Set gather ManualGather');
            setGather(ManualGather);
        }
    }
}

//function written by Belaith
function autoStance() {
    if(game.global.gridArray.length === 0) return;
    var missingHealth = game.global.soldierHealthMax - game.global.soldierHealth;
    var newSquadRdy = game.resources.trimps.realMax() <= game.resources.trimps.owned + 1;

    //baseDamage - *2 = relentlessness fudge factor? (add check?)
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
        var enemyFast = game.badGuys[enemy.name].fast || game.global.challengeActive == 'Slow';
        var enemyHealth = enemy.health;
        var enemyDamage = enemy.attack * 1.19;
        var dDamage = enemyDamage - baseBlock / 2 > enemyDamage * 0.2 ? enemyDamage - baseBlock / 2 : enemyDamage * 0.2;
        var xDamage = enemyDamage - baseBlock > enemyDamage * 0.2 ? enemyDamage - baseBlock : enemyDamage * 0.2;
        var bDamage = enemyDamage - baseBlock * 4 > enemyDamage * 0.1 ? enemyDamage - baseBlock * 4 : enemyDamage * 0.1;
    } else if (game.global.mapsActive && !game.global.preMapsActive) {
        if (typeof game.global.mapGridArray[game.global.lastClearedMapCell + 1] === 'undefined') {
            var enemy = game.global.mapGridArray[0];
        } else {
            var enemy = game.global.mapGridArray[game.global.lastClearedMapCell + 1];
        }
        var enemyFast = game.badGuys[enemy.name].fast || game.global.challengeActive == 'Slow';
        var enemyHealth = enemy.health;
        var enemyDamage = enemy.attack * 1.19;
        var dDamage = enemyDamage - baseBlock / 2 > 0 ? enemyDamage - baseBlock / 2 : 0;
        var xDamage = enemyDamage - baseBlock > 0 ? enemyDamage - baseBlock : 0;
        var bDamage = enemyDamage - baseBlock * 4 > 0 ? enemyDamage - baseBlock * 4 : 0;
    }

    if (!game.global.preMapsActive) {
        if (!enemyFast && game.upgrades.Dominance.done && enemyHealth < baseDamage * (game.global.titimpLeft > 0 ? 4 : 2) && (newSquadRdy || baseHealth / 2 - missingHealth > 0)) {
            if (game.global.formation != 2) {
                setFormation(2);
            }
        } else if (game.upgrades.Dominance.done && ((newSquadRdy && baseHealth / 2 > dDamage) || baseHealth / 2 - missingHealth > dDamage)) {
            if (game.global.formation != 2) {
                setFormation(2);
            }
        } else if (game.upgrades.Formations.done && ((newSquadRdy && baseHealth > xDamage) || baseHealth - missingHealth > xDamage)) {
            if (game.global.formation != "0") {
                setFormation("0");
            }
        } else if (game.upgrades.Barrier.done && ((newSquadRdy && baseHealth / 2 > bDamage) || baseHealth / 2 - missingHealth > bDamage)) {
            if (game.global.formation != 3) {
                setFormation(3);
            }
        } else {
            if (game.upgrades.Formations.done && game.global.formation != 1) {
                setFormation(1);
            }
        }
    }
}

//core function written by Belaith
function autoMap() {
    if (game.global.mapsUnlocked) {
        var enemyDamage = getEnemyMaxAttack(game.global.world + 1);
        var enemyHeath = getEnemyMaxHealth(game.global.world + 1);
        var enoughHealth = (baseHealth * 4 > 30 * (enemyDamage - baseBlock / 2 > 0 ? enemyDamage - baseBlock / 2 : 0) || baseHealth > 30 * (enemyDamage - baseBlock > 0 ? enemyDamage - baseBlock : 0));
        var enoughDamage = (baseDamage * 4 > enemyHeath);
        var shouldDoMaps = !enoughHealth || !enoughDamage;
        var shouldDoMap = "world";
        
        var obj = {};
        for (var map in game.global.mapsOwnedArray) {
            if (!game.global.mapsOwnedArray[map].noRecycle) {
                obj[map] = game.global.mapsOwnedArray[map].level;
            }
        }
        var keysSorted = Object.keys(obj).sort(function(a, b) {
            return obj[b] - obj[a]
        });
        //if there are no non-unique maps, there will be nothing in keysSorted, so set to create a map
        if(keysSorted[0]) var highestMap = keysSorted[0];
        else shouldDoMap = "create";
        

        
        for (var map in game.global.mapsOwnedArray) {
            var theMap = game.global.mapsOwnedArray[map];
            if (theMap.noRecycle) {
                if(theMap.name == 'The Wall' && game.upgrades.Bounty.done == 0) {
                    shouldDoMap = theMap.id;
                    break;
                }
                //other unique maps here
            }
        }

        if (shouldDoMaps) {
            if (shouldDoMap == "world") {
                if (game.global.world == game.global.mapsOwnedArray[highestMap].level) {
                    shouldDoMap = game.global.mapsOwnedArray[highestMap].id;
                } else {
                    shouldDoMap = "create";
                }
            }
        }

        if (!game.global.preMapsActive) {
            if (game.global.mapsActive) {
                if (shouldDoMap == game.global.currentMapId && !game.global.mapsOwnedArray[getMapIndex(game.global.currentMapId)].noRecycle) {
                    if (!game.global.repeatMap) {
                        repeatClicked();
                    }
                } else {
                    if (game.global.repeatMap) {
                        repeatClicked();
                    }
                }
            } else if (!game.global.mapsActive) {
                if (shouldDoMap != "world") {
                    if (!game.global.switchToMaps) {
                        mapsClicked();
                    }
                }
            }
        } else if (game.global.preMapsActive) {
            if (shouldDoMap == "world") {
                mapsClicked();
            } else if (shouldDoMap == "create") {
                //TODO optimize buying
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
                    sizeAdvMapsRange.value = 0;
                    adjustMap('size', 0);
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

                while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                    lootAdvMapsRange.value = lootAdvMapsRange.value - 1;
                }

                if (updateMapCost(true) > game.resources.fragments.owned) {
                    selectMap(game.global.mapsOwnedArray[highestMap].id);
                    runMap();
                } else {
                    buyMap();
                }
            } else {
                selectMap(shouldDoMap);
                runMap();
            }
        }
    }
}

//adjust geneticists to reach desired breed timer
function manageGenes() {
    var fWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
    var targetBreed = parseInt(getPageSetting('geneticistTargetBreedTime'));
    //if we need to hire geneticists
    if (targetBreed > getBreedTime() && !game.jobs.Geneticist.locked) {
        //if there's no free worker spots, fire a farmer
        if (fWorkers < 1 && canAffordJob('Geneticist', false)) {
            safeBuyJob('Farmer', -1);
        }
        //hire a geneticist
        safeBuyJob('Geneticist');
    }
//if we need to speed up our breeding
    //if we have potency upgrades available, buy them. If geneticists are unlocked, or we aren't managing pre-genes, just buy them
    if ((targetBreed < getBreedTime() || !game.jobs.Geneticist.locked || !managePreGenes) && game.upgrades.Potency.allowed > game.upgrades.Potency.done && canAffordTwoLevel('Potency')) {
        buyUpgrade('Potency');
    }
    //otherwise, if we have some geneticists, start firing them
    else if (targetBreed < getBreedTime() && !game.jobs.Geneticist.locked && game.jobs.Geneticist.owned > 0) {
        safeBuyJob('Geneticist', -1);
    }
    //really should be integrated with the buyBuildings routine instead of here, but I think it's mostly harmless here
    else if (targetBreed < getBreedTime() && managePreGenes && !game.buildings.Nursery.locked) {
        safeBuyBuilding('Nursery');
    }
    
    
}



////////////////////////////////////////
//Logic Loop////////////////////////////
////////////////////////////////////////

initializeAutoTrimps();

//This is totally cheating Only use for debugging
// game.settings.speed = 1;
// game.settings.speedTemp = 1;
// setTimeout(function() {
//     game.settings.speed = 2;
// }, 1000);

setTimeout(mainLoop, runInterval);

function mainLoop() {
    setTitle();
    setScienceNeeded();

    easyMode(); //This needs a UI input

    if (getPageSetting('chkBuyUpgrades')) buyUpgrades();
    if (getPageSetting('chkBuyStorage')) buyStorage();
    if (getPageSetting('chkBuyBuilding')) buyBuildings();
    if (getPageSetting('chkBuyJobs')) buyJobs();
    if (getPageSetting('chkManualStorage')) manualLabor();
    if (getPageSetting('chkAutoStance')) autoStance();
    if (getPageSetting('chkAutoProgressMap')) autoMap();
    if (parseInt(getPageSetting('geneticistTargetBreedTime')) >= 0) manageGenes();



    autoLevelEquipment();

    //Manually fight instead of using builtin auto-fight
    if (game.global.autoBattle) {
        if (!game.global.pauseFight) {
            pauseFight(); //Disable autofight
        }
    }
    if (game.upgrades.Battle.done && !game.global.fighting && game.global.gridArray.length !== 0 && !game.global.preMapsActive && (game.resources.trimps.realMax() <= game.resources.trimps.owned + 1 || game.global.soldierHealth > 0)) {
        fightManual();
       // debug('triggered fight');
    }

    saveSettings();
    setTimeout(mainLoop, runInterval);
}
