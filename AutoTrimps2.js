// ==UserScript==
// @name         AutoTrimpsV2
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  try to take over the world!
// @author       zininzinin, spindrjr, belaith, ishakaru
// @include        *trimps.github.io*
// @grant        none
// ==/UserScript==


////////////////////////////////////////
//Variables/////////////////////////////
////////////////////////////////////////
var runInterval = 10; //How often to loop through logic
var enableDebug = true; //Spam console?
var autoTrimpSettings = new Object();
var bestBuilding;
var scienceNeeded;
var shouldFarm = false;



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
var buildingList = ['Hut', 'House', 'Gym', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation', 'Tribute', 'Nursery']; //NOTE THAT I REMOVED WORMHOLE TEMPORARILY UNTILL I FIGURE OUT WHAT TO DO WITH IT


////////////////////////////////////////
//Utility Functions/////////////////////
////////////////////////////////////////

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
    for (var b in game.global.buildingsQueue) {
        if (game.global.buildingsQueue[b].includes(building)) return false;
    }
    preBuy();
    game.global.buyAmt = 1;
    if (!canAffordBuilding(building)) {
        postBuy();
        return false;
    }
    debug('Building ' + building);
    game.global.firing = false;
    buyBuilding(building);
    postBuy();
    tooltip("hide");
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
    var houseWorth = game.buildings.House.locked ? 0 : game.buildings.House.increase.by / getBuildingItemPrice(game.buildings.House, "food");
    var hutWorth = game.buildings.Hut.increase.by / getBuildingItemPrice(game.buildings.Hut, "food");
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
    if (game.global.challengeActive == "Toxicity" && game.challenges.Toxicity.stacks > 0){
	potencyMod *= Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks);
	}
    breeding = breeding * potencyMod;
    updatePs(breeding, true);


    var timeRemaining = log10((trimpsMax - trimps.employed) / (trimps.owned - trimps.employed)) / log10(1 + (potencyMod / 10));
    if (!game.global.brokenPlanet) timeRemaining /= 10;
    timeRemaining = Math.floor(timeRemaining) + " Secs";
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
    javascript: with(document)(head.appendChild(createElement('script')).src = 'https://rawgit.com/zininzinin/AutoTrimps/spin/NewUI.js')._;
    javascript: with(document)(head.appendChild(createElement('script')).src = 'https://rawgit.com/zininzinin/AutoTrimps/master/Graphs.js')._;
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
            buyUpgrade(upgrade, true);
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
    if (autoTrimpSettings.BuildGyms.enabled && !game.buildings.Gym.locked) {
        safeBuyBuilding('Gym');
    }
    if (getPageSetting('BuildTributes') && !game.buildings.Tribute.locked) {
        safeBuyBuilding('Tribute');
    }
    //only buy nurseries if enabled,   and we aren't trying to manage our breed time before geneticists, and they aren't locked
    //even if we are trying to manage breed timer pre-geneticists, start buying nurseries once geneticists are unlocked AS LONG AS we can afford a geneticist (to prevent nurseries from outpacing geneticists soon after they are unlocked)
    if (getPageSetting('BuildNurseries') && (!getPageSetting('ManageBreedtimer') || (!game.jobs.Geneticist.locked && canAffordJob('Geneticist', false))) && !game.buildings.Nursery.locked) {
        if ((getPageSetting('MaxNursery') > game.buildings.Nursery.owned || getPageSetting('MaxNursery') == -1) && (getBuildingItemPrice(game.buildings.Nursery, "gems") < 0.05 * getBuildingItemPrice(game.buildings.Warpstation, "gems") || game.buildings.Warpstation.locked)) {
            safeBuyBuilding('Nursery');
        }
    }
}

function setTitle() {
    document.title = '(' + game.global.world + ')' + ' Trimps ' + document.getElementById('versionNumber').innerHTML;
    //for the dummies like me who always forget to turn automaps back on after portaling
    if(getPageSetting('RunUniqueMaps') && !game.upgrades.Battle.done && autoTrimpSettings.RunMapsWhenStuck.enabled == false) {
        settingChanged("RunMapsWhenStuck");
        updateCustomButtons();
    }
}

function buyJobs() {
    //Implement Ratio thingy
    if (game.resources.trimps.owned < game.resources.trimps.realMax() * 0.8) return;
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
        while (canAffordJob('Trainer', false) && !game.jobs.Trainer.locked) {
            freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
            if (!freeWorkers) safeBuyJob('Farmer', -1);
            safeBuyJob('Trainer');
        }
    }
    if (game.jobs.Explorer.owned < getPageSetting('MaxExplorers') || getPageSetting('MaxExplorers') == -1) {
        game.global.buyAmt = 1;
        while (canAffordJob('Explorer', false) && !game.jobs.Explorer.locked) {
            freeWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
            if (!freeWorkers) safeBuyJob('Farmer', -1);
            safeBuyJob('Explorer');
        }
    }
game.global.buyAmt = oldBuy;
if (getPageSetting('HireScientists') && !game.jobs.Scientist.locked) {
    //if earlier in the game, buy a small amount of scientists
    if (game.jobs.Farmer.owned < 250000) {
        var buyScientists = Math.floor((scientistRatio / totalRatio * totalDistributableWorkers) - game.jobs.Scientist.owned);
        //bandaid to prevent situation where 1 scientist is bought, causing floor calculation to drop by 1, making next calculation -1 and entering hiring/firing loop
        //proper fix is including scientists in totalDistributableWorkers and the scientist ratio in the total ratio, but then it waits for 4 jobs
        if(buyScientists > 0) safeBuyJob('Scientist', buyScientists);
    }
    //once over 100k farmers, fire our scientists and rely on manual gathering of science
    else if (game.jobs.Scientist.owned > 0) safeBuyJob('Scientist', game.jobs.Scientist.owned * -1);
}
    //Distribute Farmer/Lumberjack/Miner
    if(!game.jobs.Farmer.locked) 
    safeBuyJob('Farmer', Math.floor((farmerRatio / totalRatio * totalDistributableWorkers) - game.jobs.Farmer.owned));
    if(!game.jobs.Lumberjack.locked) 
    safeBuyJob('Lumberjack', Math.floor((lumberjackRatio / totalRatio * totalDistributableWorkers) - game.jobs.Lumberjack.owned));
    if(!game.jobs.Miner.locked) 
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
    //enemyHeath sic but too lazy to change
    var enemyHeath = getEnemyMaxHealth(game.global.world + 1);
    if(game.global.challengeActive == "Toxicity") {
    	//ignore damage changes (which would effect how much health we try to buy) entirely since we die in 20 attacks anyway?
    	//enemyDamage *= 2;
    	enemyHeath *= 2;
    }
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
                buyUpgrade(upgrade);
                cancelTooltip();
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
            if (getPageSetting('BuyWeapons') && DaThing.Stat == 'attack' && (!enoughDamage || enoughHealth)) {
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(Best[stat].Name, null, null, true)) {
                    debug('Leveling equipment ' + Best[stat].Name);
                    buyEquipment(Best[stat].Name);
                    tooltip('hide');
                }
            }
            //If we're considering a health item, buy it if we don't have enough health, otherwise we default to buying damage
            if (getPageSetting('BuyArmor') && (DaThing.Stat == 'health' || DaThing.Stat == 'block') && !enoughHealth) {
                if (DaThing.Equip && !Best[stat].Wall && canAffordBuilding(Best[stat].Name, null, null, true)) {
                    debug('Leveling equipment ' + Best[stat].Name);
                    buyEquipment(Best[stat].Name);
                    tooltip('hide');
                }
            }
        }
    }
    postBuy();
}

function manualLabor() {
    var ManualGather = 'metal';

    //if we have more than 2 buildings in queue, or (our modifier is real fast and trapstorm is off), build
    if (game.global.buildingsQueue.length ? (game.global.buildingsQueue.length > 1 || (game.global.playerModifier > 1000 && game.global.trapBuildToggled == false)) : false) {
        // debug('Gathering buildings??');
        setGather('buildings');
    }
    //if we have some upgrades sitting around which we don't have enough science for, gather science
    else if (game.resources.science.owned < scienceNeeded && document.getElementById('scienceCollectBtn').style.display == 'block') {
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
        } else if (game.global.playerGathering != 'metal' && game.global.turkimpTimer > 0) {
            //debug('Set gather ManualGather');
            setGather('metal');
        } else  if (document.getElementById('scienceCollectBtn').style.display == 'block' && game.global.turkimpTimer < 1 && haveWorkers) {
            setGather('science');
        }
        
    }
}

//function written by Belaith
function autoStance() {
    if (game.global.gridArray.length === 0) return;
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
        var enemyFast = game.global.challengeActive != 'Nom' && (game.badGuys[enemy.name].fast || game.global.challengeActive == 'Slow');
        var enemyHealth = enemy.health;
        var enemyDamage = enemy.attack * 1.19;
        var dDamage = enemyDamage - baseBlock / 2 > enemyDamage * 0.2 ? enemyDamage - baseBlock / 2 : enemyDamage * 0.2;
        var dHealth = baseHealth/2;
        var xDamage = enemyDamage - baseBlock > enemyDamage * 0.2 ? enemyDamage - baseBlock : enemyDamage * 0.2;
        var xHealth = baseHealth;
        var bDamage = enemyDamage - baseBlock * 4 > enemyDamage * 0.1 ? enemyDamage - baseBlock * 4 : enemyDamage * 0.1;
        var bHealth = baseHealth/2;
    } else if (game.global.mapsActive && !game.global.preMapsActive) {
        if (typeof game.global.mapGridArray[game.global.lastClearedMapCell + 1] === 'undefined') {
            var enemy = game.global.mapGridArray[0];
        } else {
            var enemy = game.global.mapGridArray[game.global.lastClearedMapCell + 1];
        }
        var enemyFast = game.global.challengeActive != 'Nom' && (game.badGuys[enemy.name].fast || game.global.challengeActive == 'Slow');
        var enemyHealth = enemy.health;
        var enemyDamage = enemy.attack * 1.19;
        var dDamage = enemyDamage - baseBlock / 2 > 0 ? enemyDamage - baseBlock / 2 : 0;
        var dHealth = baseHealth/2;
        var xDamage = enemyDamage - baseBlock > 0 ? enemyDamage - baseBlock : 0;
        var xHealth = baseHealth;
        var bDamage = enemyDamage - baseBlock * 4 > 0 ? enemyDamage - baseBlock * 4 : 0;
        var bHealth = baseHealth/2;
    }
    
    	if (game.global.challengeActive == "Electricity" || game.global.challengeActive == "Mapocalypse") {
			dDamage+= dHealth * game.global.radioStacks * 0.1;
			xDamage+= xHealth * game.global.radioStacks * 0.1;
			bDamage+= bHealth * game.global.radioStacks * 0.1;
		} else if (game.global.challengeActive == "Nom" || game.global.challengeActive == "Toxicity") {
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


	if (!game.global.preMapsActive) {
		if (!enemyFast && game.upgrades.Dominance.done && enemyHealth < baseDamage * (game.global.titimpLeft > 0 ? 4 : 2) && (newSquadRdy || (dHealth - missingHealth > 0 && (game.global.challengeActive != 'Nom' && game.global.challengeActive != "Toxicity")) || ((game.global.challengeActive == 'Nom' || game.global.challengeActive == "Toxicity") && dHealth - missingHealth > dHealth/20))) {
			if (game.global.formation != 2) {
				setFormation(2);
			}
		} else if (game.upgrades.Dominance.done && ((newSquadRdy && dHealth > dDamage) || dHealth - missingHealth > dDamage)) {
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
var doPrison = false;
var doWonderland = false;
function autoMap() {
    if (game.global.mapsUnlocked) {
        var enemyDamage = getEnemyMaxAttack(game.global.world + 1);
        var enemyHeath = getEnemyMaxHealth(game.global.world + 1);
        if(game.global.challengeActive == "Toxicity") {
    	//ignore damage changes (which would effect how much health we try to buy) entirely since we die in 20 attacks anyway?
    	//enemyDamage *= 2;
    	enemyHeath *= 2;
    	}
    	
        var enoughHealth = (baseHealth * 4 > 30 * (enemyDamage - baseBlock / 2 > 0 ? enemyDamage - baseBlock / 2 : 0) || baseHealth > 30 * (enemyDamage - baseBlock > 0 ? enemyDamage - baseBlock : 0));
        var enoughDamage = (baseDamage * 4 > enemyHeath);
        var shouldDoMaps = !enoughHealth || !enoughDamage;
        var shouldDoMap = "world";
        
        //if we should be farming, we will continue farming until attack/damage is under 10, if we shouldn't be farming, we will start if attack/damage rises above 16
        shouldFarm = shouldFarm ? getEnemyMaxHealth(game.global.world) / baseDamage > 10 : getEnemyMaxHealth(game.global.world) / baseDamage > 15
        
        //if we are at max map bonus, and we don't need to farm, don't do maps
        if(game.global.mapBonus == 10 && !shouldFarm) shouldDoMaps = false;
        //if we are prestige mapping, force equip first mode
        if(autoTrimpSettings.Prestige.selected != "Off" && game.options.menu.mapLoot.enabled != 1) game.options.menu.mapLoot.enabled = 1;
        //if player has selected arbalest or gambeson but doesn't have them unlocked, just unselect it for them! It's magic!
        if(document.getElementById('Prestige').selectedIndex > 11 && game.global.slowDone == false) {
            document.getElementById('Prestige').selectedIndex = 11;
            autoTrimpSettings.Prestige.selected = "Bestplate";
        }
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
        if (keysSorted[0]) var highestMap = keysSorted[0];
        else shouldDoMap = "create";



        for (var map in game.global.mapsOwnedArray) {
            var theMap = game.global.mapsOwnedArray[map];
            if (theMap.noRecycle && getPageSetting('RunUniqueMaps')) {
                if (theMap.name == 'The Wall' && game.upgrades.Bounty.done == 0) {
                    shouldDoMap = theMap.id;
                    break;
                }
                if (theMap.name == 'Dimension of Anger' && document.getElementById("portalBtn").style.display == "none") {
                    var doaDifficulty = Math.ceil(theMap.difficulty / 2);
                    if(game.global.challengeActive == "Mapocalypse" && game.global.world < 20 + doaDifficulty) continue; 
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
                if(theMap.name == 'The Block' && !game.upgrades.Shieldblock.done && (game.global.challengeActive == ("Scientist I" || "Scientist II" || "Scientist III" || "Trimp") || getPageSetting('BuyShieldblock'))) {
                    shouldDoMap = theMap.id;
                    break;
                }
                if(theMap.name == 'Trimple of Doom' && game.global.challengeActive == "Meditate") {
                    shouldDoMap = theMap.id;
                    break;
                }
                if(theMap.name == 'Bionic Wonderland' && game.global.challengeActive == "Crushed" ) {
                	var wonderlandDifficulty = Math.ceil(theMap.difficulty / 2);
                	doWonderland = true;
                	if(game.global.world >= 125 + wonderlandDifficulty) {
                        shouldDoMap = theMap.id;
                        break;
                    }
                }
                //other unique maps here
            }
        }

        //map if we don't have health/dmg or if we are prestige mapping, and our set item has a new prestige available 
        if (shouldDoMaps || (autoTrimpSettings.Prestige.selected != "Off" && game.mapUnlocks[autoTrimpSettings.Prestige.selected].last <= game.global.world - 5)) {
            if (shouldDoMap == "world") {
                if (game.global.world == game.global.mapsOwnedArray[highestMap].level) {
                    shouldDoMap = game.global.mapsOwnedArray[highestMap].id;
                } else {
                    //if we aren't here because of needing damage or health, then we must be here because of prestige mapping.
                    //If we aren't prestige mapping on a max level map, we shouldn't be prestige mapping
                    if(!shouldDoMaps) shouldDoMap = "world";
                    shouldDoMap = "create";
                }
            }
        }
        //repeat button management
        if (!game.global.preMapsActive) {
            if (game.global.mapsActive) {
                //if we are doing the right map, and it's not a norecycle (unique) map, and we aren't going to hit max map bonus
                if (shouldDoMap == game.global.currentMapId && !game.global.mapsOwnedArray[getMapIndex(game.global.currentMapId)].noRecycle && (game.global.mapBonus < 9 || shouldFarm)) {
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
                    if (!game.global.switchToMaps && (shouldFarm && game.global.lastClearedCell > 79 || !shouldFarm)) {
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

                while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                    lootAdvMapsRange.value = lootAdvMapsRange.value - 1;
                }
                //prioritize size over difficulty? Not sure. high Helium that just wants prestige = yes.
                //Really just trying to prevent prestige mapping from getting stuck
                while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                    difficultyAdvMapsRange.value = difficultyAdvMapsRange.value - 1;
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


var lastHelium = 0;
function autoPortal() {
	switch (autoTrimpSettings.AutoPortal.selected) {
		case "Helium Per Hour":
			var timeThisPortal = new Date().getTime() - game.global.portalTime;
    			timeThisPortal /= 3600000;
    			var myHelium = Math.floor(game.resources.helium.owned / timeThisPortal);
    			if(myHelium < lastHelium) {
				doPortal();
    			}
			break;
		case "Balance":
			if(game.global.world > 40 && !game.global.challengeActive)
				doPortal('Balance');
			break;
		case "Electricity":
			if(doPrison && !game.global.challengeActive) {
				doPortal('Electricity');
				doPrison = false;
			}
			break;
		case "Crushed":
			if(doWonderland && !game.global.challengeActive) {
				doPortal('Crushed');
				doWonderland = false;
			}
			break;
		case "Nom":
			if(game.global.world > 145 && !game.global.challengeActive)
				doPortal('Nom');
			break;
		case "Toxicity":
			if(game.global.world > 165 && !game.global.challengeActive)
				doPortal('Toxicity');
			break;
		case "Custom":
			if(game.global.world > getPageSetting('CustomAutoPortal') && !game.global.challengeActive)
				doPortal();
			break;
		default:
			break;
			
	}
	
}

function doPortal(challenge) {
	portalClicked();
	if(challenge) selectChallenge(challenge);
    	activateClicked();
    	activatePortal();
    	lastHelium = 0;
}

//adjust geneticists to reach desired breed timer
function manageGenes() {
    var fWorkers = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
    if(getPageSetting('ManageBreedtimer')) {
        if(game.portal.Anticipation.level == 0) autoTrimpSettings.GeneticistTimer.value = '0';
        else if(game.global.challengeActive == ('Electricity' || 'Mapocalypse')) autoTrimpSettings.GeneticistTimer.value = '3.5';
        else if(game.global.challengeActive == 'Nom' || game.global.challengeActive == 'Toxicity') {
        	//intent of below if is to push through past megafarming with 30 anti stacks if we need to farm, 
        	//but raising to 30 antistacks often turns shouldfarm off. Would need a separate shouldFarmNom variable that approximates at 10 stacks? Don't care enough to do now
        	//if(shouldFarm && !game.global.mapsActive) autoTrimpSettings.GeneticistTimer.value = '30';
        	autoTrimpSettings.GeneticistTimer.value = '16';
        }
        else autoTrimpSettings.GeneticistTimer.value = '30.5';
    }
    var targetBreed = parseInt(getPageSetting('GeneticistTimer'));
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
    //if we have potency upgrades available, buy them. If geneticists are unlocked, or we aren't managing the breed timer, just buy them
    if ((targetBreed < getBreedTime() || !game.jobs.Geneticist.locked || !getPageSetting('ManageBreedtimer')) && game.upgrades.Potency.allowed > game.upgrades.Potency.done && canAffordTwoLevel('Potency')) {
        buyUpgrade('Potency');
    }
    //otherwise, if we have some geneticists, start firing them
    else if (targetBreed < getBreedTime() && !game.jobs.Geneticist.locked && game.jobs.Geneticist.owned > 0) {
        safeBuyJob('Geneticist', -1);
    }
    //really should be integrated with the buyBuildings routine instead of here, but I think it's mostly harmless here
    else if (targetBreed < getBreedTime() && getPageSetting('ManageBreedtimer') && !game.buildings.Nursery.locked) {
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

setTimeout(mainLoop, 2000);

function mainLoop() {
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
    if (getPageSetting('AutoStance')) autoStance();
    if (autoTrimpSettings.AutoPortal.selected != "Off") autoPortal();
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
    if(document.getElementById('extraGridInfo').style.display == 'block') restoreGrid();
    autoLevelEquipment();
    updateCustomStats();
    updateCustomButtons();

    if (getPageSetting('AutoFight')) {
        //Manually fight instead of using builtin auto-fight
        if (game.global.autoBattle) {
            if (!game.global.pauseFight) {
                pauseFight(); //Disable autofight
            }
        }
        lowLevelFight = game.resources.trimps.maxSoldiers < (game.resources.trimps.owned - game.resources.trimps.employed) * 0.5 && (game.resources.trimps.owned - game.resources.trimps.employed) > game.resources.trimps.realMax() * 0.1 && game.global.world < 5;
        if (game.upgrades.Battle.done && !game.global.fighting && game.global.gridArray.length !== 0 && !game.global.preMapsActive && (game.resources.trimps.realMax() <= game.resources.trimps.owned + 1 || game.global.soldierHealth > 0 || lowLevelFight )) {
            fightManual();
            // debug('triggered fight');
        }
    }

    saveSettings();
    setTimeout(mainLoop, runInterval);
}
