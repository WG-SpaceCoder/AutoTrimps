    // ==UserScript==
    // @name         AutoTrimps
    // @namespace    http://tampermonkey.net/
    // @version      0.1
    // @description  try to take over the world!
    // @author       zininzinin
    // @include        *trimps.github.io*
    // @grant        none
    // ==/UserScript==


    (function() {
        "use strict";

        //Variables//
        var runInterval = 200; //How often to loop through logic
        var enableDebug = true; //Spam console?
        var startAllSelected = false;

        //List Variables//
        var jobList = [{
            name: 'Explorer',
            max: -1,
            ratio: 10
        }, {
            name: 'Trainer',
            max: -1,
            ratio: 99
        }, {
            name: 'Geneticist',
            max: 5,
            ratio: 10
        }, {
            name: 'Miner',
            max: -1,
            ratio: 10
        }, {
            name: 'Farmer',
            max: -1,
            ratio: 10
        }, {
            name: 'Lumberjack',
            max: -1,
            ratio: 10
        }, {
            name: 'Scientist',
            max: -1,
            ratio: 1
        }];

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



        var upgradeList = ['Coordination', 'Speedminer', 'Speedlumber', 'Speedfarming', 'Speedscience', 'Megaminer', 'Megalumber', 'Megafarming', 'Megascience', 'Efficiency', 'Potency', 'TrainTacular', 'Miners', 'Scientists', 'Trainers', 'Explorers', 'Blockmaster', 'Battle', 'Bloodlust', 'Bounty', 'Egg', 'Anger', 'Formations', 'Dominance', 'Barrier', 'UberHut', 'UberHouse', 'UberMansion', 'UberHotel', 'UberResort', 'Trapstorm'];
        var buildingList = ['Hut', 'House', 'Gym', 'Mansion', 'Hotel', 'Resort', 'Gateway', 'Collector', 'Warpstation', 'Tribute', 'Nursery']; //NOTE THAT I REMOVED WORMHOLE TEMPORARILY UNTILL I FIGURE OUT WHAT TO DO WITH IT

        //Intervals//
        setInterval(buyJobs, runInterval);
        setInterval(buyBuildings, runInterval);
        setInterval(buyEquipment, runInterval);
        setInterval(buyUpgrades, runInterval);
        setInterval(buyStorage, runInterval);
        setInterval(manualLabor, runInterval);
        setInterval(newAutoMap, runInterval * 10);
        // setInterval(printGame, runInterval);

        //Page Changes//
        document.getElementById("buyHere").innerHTML += '<div id="autoContainer" style="display: block; font-size: 12px;"> <div id="autoTitleDiv" class="titleDiv"> <div class="row"> <div class="col-xs-4"><span id="autoTitleSpan" class="titleSpan">Automation</span> </div> </div> </div> <br> <div class="autoBox" id="autoHere"> </div> <table style="text-align: left; vertical-align: top; width: 90%;" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td style="vertical-align: top;"> Loops <br> <input id="chkBuyStorage" title="Will buy storage when resource is almost full" checked="checked" type="checkbox">Buy Storage <br> <input id="chkManualStorage" title="Will automatically gather resources and trap trimps" checked="checked" type="checkbox">Manual Gather <br> <input id="chkBuyJobs" title="Buys jobs based on ratios configured" checked="checked" type="checkbox">Buy Jobs <br> <input id="chkBuyBuilding" title="Will buy non storage buildings as soon as they are available" checked="checked" type="checkbox">Buy Buildings <br> <input id="chkBuyUpgrades" title="autobuy non eqipment Upgrades" checked="checked" type="checkbox">Buy Upgrades <br> <input id="chkTrapTrimps" title="automate trapping trimps" checked="checked" type="checkbox">Trap Trimps</td> <td style="vertical-align: top;"> Equipment <br> <input id="chkBuyEquipH" title="Will buy the most efficient armor available" checked="checked" type="checkbox">Buy Armor <br> <input id="chkBuyPrestigeH" title="Will buy the most efficient armor upgrade available" checked="checked" type="checkbox">Buy Armor Upgrades <br> <input id="chkBuyEquipA" title="Will buy the most efficient weapon available" checked="checked" type="checkbox">Buy Weapons <br> <input id="chkBuyPrestigeA" title="Will buy the most efficient weapon upgrade available" checked="checked" type="checkbox">Buy Weapon Upgrades Maps <br> </td> </tr> <tr> <td style="vertical-align: middle; text-align: left;"> <br>Max Buildings to build <br> <input id="maxHut" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Hut <br> <input id="maxHouse" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; House <br> <input id="maxMansion" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Mansion <br> <input id="maxHotel" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Hotel <br> <input id="maxResort" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Resort <br> <input id="maxGateway" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Gateway <br> <input id="maxCollector" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Collector <br> <input id="maxWarpstation" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Warpstation <br> <input id="maxGym" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Gym <br> <input id="maxTribute" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Tribute <br> <input id="maxNursery" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Nursery <br> <br> </td> <td style="text-align: left; vertical-align: top;"> <br>Maps <br> <input id="chkAutoUniqueMap" title="Auto run unique maps" checked="checked" type="checkbox"> Auto run unique maps <br> <input id="chkAutoProgressMap" title="Runs maps when cannot defeat current level" checked="checked" type="checkbox">Auto map when stuck <br> <input id="maxHitsTillStuck" style="width: 10%; color: #000000;" value="10">&nbsp;Max hits to kill enemy before stuck</td> </tr> </tbody> </table></div>';

        function AutoBuyStorage() {
            return document.getElementById("chkBuyStorage").checked;
        }

        function AutoManualLabor() {
            return document.getElementById("chkManualStorage").checked;
        }

        function autoBuyJobs() {
            return document.getElementById("chkBuyJobs").checked;
        }

        function AutoBuyBuilding() {
            return document.getElementById("chkBuyBuilding").checked;
        }

        function AutoBuyEquipH() {
            return document.getElementById("chkBuyEquipH").checked;
        }

        function AutoBuyPrestigeH() {
            return document.getElementById("chkBuyPrestigeH").checked;
        }

        function AutoBuyEquipA() {
            return document.getElementById("chkBuyEquipA").checked;
        }

        function AutoBuyPrestigeA() {
            return document.getElementById("chkBuyPrestigeA").checked;
        }

        function AutoBuyUpgrades() {
            return document.getElementById("chkBuyUpgrades").checked;
        }

        function AutoUniqueMap() {
            return document.getElementById("chkAutoUniqueMap").checked;
        }

        function AutoProgressMap() {
            return document.getElementById("chkAutoProgressMap").checked;
        }

        function maxHitsTillStuck() {
            return document.getElementById("maxHitsTillStuck").value;
        }
        function trapTrimps() {
            return document.getElementById("chkTrapTrimps").checked;
        }

        fixMap();

        //I honestly have no idea why I have to do this >.>
        document.getElementById("wood").style.opacity = "1";
        document.getElementById("science").style.opacity = "1";
        document.getElementById("jobsTab").style.opacity = "1";
        document.getElementById("upgradesTab").style.opacity = "1";
        document.getElementById("equipmentTab").style.opacity = "1";
        document.getElementById("buyTabsUl").innerHTML += '<li role="presentation" id="autoTab" onclick="filterTabs(\'auto\')" class="buyTab"><a id="autoA" href="#">Automation</a></li>';

        if (!startAllSelected) {
            //WIP
        }

        window.mapsClicked();

        //Functions//
        function debug(message) {
            if (enableDebug)
                console.log(message);
        }

        function canPurchaseWorkers() {
            for (var j in jobList) {
                if (window.canAffordJob(jobList[j].name, false, 1)) {
                    return true;
                }
            }
            return false;
        }

        function freeWorkers() {
            if (!canPurchaseWorkers() || Math.floor(window.game.resources.trimps.owned - window.game.resources.trimps.employed) === 0) return 0;
            return Math.ceil(window.game.resources.trimps.realMax() / 2) - window.game.resources.trimps.employed;
        }

        function canAffordJob(jobName) {
            if (freeWorkers() === 0) {
                return false;
            }
            for (var costItem in window.game.jobs[jobName].cost) {
                // debug('Checking cost for ' +costItem+ ' and ' +jobName+ ': ' + window.checkJobItem(jobName, false, costItem, null, 1));
                if (!window.checkJobItem(jobName, false, costItem, null, 1)) return false;
            }
            return true;
        }

        function determineJobWant(jobIndex) { //Wow this needs to be cleaned up :P
            if (!window.game.jobs[jobList[jobIndex].name].locked) {
                if (!canAffordJob(jobList[jobIndex].name)) {
                    return 0;
                } else if (jobList[jobIndex].max >= 0) {
                    if (jobList[jobIndex].max <= window.game.jobs[jobList[jobIndex].name].owned) {
                        return 0;
                    } else {
                        return 1 / (Math.min(jobList[jobIndex].max, window.game.jobs[jobList[jobIndex].name].owned / jobList[jobIndex].ratio));
                    }
                } else {
                    return 1 / (window.game.jobs[jobList[jobIndex].name].owned / jobList[jobIndex].ratio);
                }
                // debug('Job: ' +jobList[jobIndex].name+ '. Want: ' +jobList[j].want);
            }
            return 0;
        }

        function buyJobs() {
            if (autoBuyJobs()) {
                // debug('AutoBuyJobs = ' + autoBuyJobs());
                var i = 0;
                var amountToBuy = Math.ceil(freeWorkers() * 0.001);
                while (freeWorkers() > 0 && i < 100) {
                    i++;
                    // debug('Job loop');
                    var greatestWant = 0;
                    var jobToHire = '';
                    for (var j in jobList) {
                        // debug('Job: ' +jobList[j].name+ '. Is unlocked? ' +window.game.jobs[jobList[j].name].locked);
                        var want = determineJobWant(j);
                        // debug('Job: ' +jobList[j].name+ '. Want: ' +want);
                        if (want > greatestWant) {
                            greatestWant = want;
                            jobToHire = jobList[j].name;
                        }
                    }
                    if (jobToHire === '') {
                        // debug('No job to hire :(');
                    } else {
                        // debug('owned ' + window.game.resources.trimps.owned + ' employed ' + window.game.resources.trimps.employed + ' amountToBuy ' + amountToBuy);
                        if (Math.floor(window.game.resources.trimps.owned - window.game.resources.trimps.employed) - amountToBuy <= 2) return;
                        var oldAmount = window.game.global.buyAmt;
                        window.game.global.buyAmt = amountToBuy;
                        var added = window.canAffordJob(jobToHire, true, Math.ceil(window.game.resources.trimps.realMax() / 2) - window.game.resources.trimps.employed);
                        // debug('Hiring ' + added + ' ' + jobToHire);
                        window.game.jobs[jobToHire].owned += added;
                        window.game.resources.trimps.employed += added;
                        window.game.global.buyAmt = oldAmount;
                        window.tooltip('hide');
                    }
                }
            }
        }

        function buildingAtMax(buildingName) {
            var buildingMax = document.getElementById('max' + buildingName).value;
            if (buildingMax < 0) return false;
            return buildingMax <= window.game.buildings[buildingName].owned;
        }

        function buyBuildings() {
            if (AutoBuyBuilding()) {
                for (var buildingIndex in buildingList) {
                    var building = buildingList[buildingIndex];
                    // debug('Checking building ' +building+ ' buildingMax ' +document.getElementById('max' + building).value);
                    if (window.canAffordBuilding(building, false) && !window.game.buildings[building].locked && !buildingAtMax(building)) {
                        debug('Attempting to build: ' + building);
                        window.buyBuilding(building);
                        window.tooltip('hide');
                    }
                }
            }
        }

        function evaluateEfficiency(equipName) {
            var equip = equipmentList[equipName];
            var gameResource = equip.Equip ? window.game.equipment[equipName] : window.game.buildings[equipName];
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
            if (!window.game.upgrades[equip.Upgrade].locked) {
                //Evaluating upgrade!
                var CanAfford = window.canAffordTwoLevel(window.game.upgrades[equip.Upgrade]);
                if (equip.Equip) {
                    var NextEff = PrestigeValue(equip.Upgrade);
                    var NextCost = getNextPrestigeCost(equip.Upgrade) * Math.pow(1 - window.game.portal.Artisanistry.modifier, window.game.portal.Artisanistry.level);
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

                        if (window.game.resources[equip.Resource].owned > NeedResource) {
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
            var name = window.game.upgrades[what].prestiges;
            var equipment = window.game.equipment[name];
            var stat;
            if (equipment.blockNow) stat = "block";
            else stat = (typeof equipment.health !== 'undefined') ? "health" : "attack";
            var toReturn = Math.round(equipment[stat] * Math.pow(1.19, ((equipment.prestige) * game.global.prestige[stat]) + 1));
            return toReturn;
        }

        function buyEquipment() {
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
            for (var equipName in equipmentList) {
                var equip = equipmentList[equipName];
                // debug('Equip: ' + equip + ' EquipIndex ' + equipName);
                var gameResource = equip.Equip ? window.game.equipment[equipName] : window.game.buildings[equipName];
                // debug('Game Resource: ' + gameResource);
                if (!gameResource.locked) {
                    document.getElementById(equipName).style.color = 'white';
                    var evaluation = evaluateEfficiency(equipName);
                    // debug(equipName + ' evaluation ' + evaluation.Status);
                    var BKey = equip.Stat + equip.Resource;
                    // debug(equipName + ' bkey ' + BKey);

                    if (Best[BKey].Factor == 0 || Best[BKey].Factor < evaluation.Factor) {
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
                                AutoBuyPrestigeA() &&
                                equipmentList[equipName].Stat == 'attack'
                            ) ||
                            (
                                AutoBuyPrestigeH() &&
                                (
                                    equipmentList[equipName].Stat == 'health' ||
                                    equipmentList[equipName].Stat == 'block'
                                )
                            )
                        )
                    ) {
                        var upgrade = equipmentList[equipName].Upgrade;
                        debug('Upgrading ' + upgrade);
                        window.buyUpgrade(upgrade);
                        // window.tooltip('hide');
                    }
                }
            }

            for (var stat in Best) {
                if (Best[stat].Name != '') {
                    var DaThing = equipmentList[Best[stat].Name];
                    document.getElementById(Best[stat].Name).style.color = Best[stat].Wall ? 'orange' : 'red';
                    if ((AutoBuyEquipA() && DaThing.Stat == 'attack') || (AutoBuyEquipH() && (DaThing.Stat == 'health' || DaThing.Stat == 'block'))) {
                        if (DaThing.Equip && !Best[stat].Wall && window.canAffordBuilding(Best[stat].Name, null, null, true)) {
                            debug('Leveling equipment ' + Best[stat].Name);
                            window.buyEquipment(Best[stat].Name);
                            window.tooltip('hide');
                        }
                    }
                }
            }
        }

        function buyUpgrades() {
            for (var upgrade in upgradeList) {
                upgrade = upgradeList[upgrade];
                var gameUpgrade = window.game.upgrades[upgrade];
                if (AutoBuyUpgrades() && gameUpgrade.allowed > gameUpgrade.done && window.canAffordTwoLevel(upgrade)) {
                    window.buyUpgrade(upgrade);
                    // window.tooltip('hide');
                    document.getElementById("upgradesAlert").innerHTML = '';
                }
            }
        }

        function buyStorage() {
            if (AutoBuyStorage()) {
                var packMod = 1 + window.game.portal.Packrat.level * window.game.portal.Packrat.modifier;
                var Bs = {
                    'Barn': 'food',
                    'Shed': 'wood',
                    'Forge': 'metal'
                };
                for (var B in Bs) {
                    if (window.game.resources[Bs[B]].owned > window.game.resources[Bs[B]].max * packMod * 0.9) {
                        debug('Buying ' +B+ '(' + Bs[B] + ') at ' + ((window.game.resources[Bs[B]].max * packMod * 0.99) / window.game.resources[Bs[B]].owned * 100)+ '%');
                        if (AutoBuyStorage() && window.canAffordBuilding(B)) {
                            debug('Wanna buy ' + B);
                            buyBuilding(B);
                            window.tooltip('hide');
                        }
                    }
                }
            }
        }

        function manualLabor() {
            if (AutoManualLabor()) {
                if ((window.game.resources.trimps.owned - window.game.resources.trimps.employed) < 2 && window.canAffordBuilding('Trap') && window.game.global.buildingsQueue.length == 0 && trapTrimps()) {
                    debug('Wanna buy Trap');
                    buyBuilding('Trap');
                    // window.tooltip('hide');
                }

                if (window.game.upgrades.Bloodlust.done == 0 && (window.game.resources.trimps.owned - window.game.resources.trimps.employed) > 3 && !window.game.global.fighting && window.game.upgrades.Battle.done == 1) {
                    window.fightManual();
                }
                if (window.game.upgrades.Bloodlust.done == 1 && window.game.global.pauseFight) {
                    window.pauseFight();
                }

                if (window.game.buildings.Trap.owned > 0 && (window.game.resources.trimps.max - window.game.resources.trimps.owned) > 2 && window.game.upgrades.Trapstorm.done != 1 && trapTrimps()) {
                    window.setGather('trimps');
                } else if (window.game.global.buildingsQueue.length > 2) {
                    window.setGather('buildings');
                } else if (window.game.global.autoCraftModifier == 0 && window.game.global.buildingsQueue.length > 0) {
                    window.setGather('buildings');
                } else {
                    //Do something here :/ 
                    var manualResourceList = {
                        'food': 'Farmer',
                        'wood': 'Lumberjack',
                        'metal': 'Miner',
                        'science': 'Scientist'
                    };
                    var lowestResource = 'food';
                    var lowestResourceRate = -1;
                    var haveWorkers = true;
                    for (var resource in manualResourceList) {
                        var job = manualResourceList[resource];
                        var currentRate = window.game.jobs[job].owned * window.game.jobs[job].modifier;
                        // debug('Current rate for ' + resource + ' is ' + currentRate + ' is hidden? ' + (document.getElementById(resource).style.visibility == 'hidden'));
                        if (document.getElementById(resource).style.visibility != 'hidden') {
                            // debug('INNERLOOP for resource ' +resource);
                            if (currentRate == 0) {
                                currentRate = window.game.resources[resource].owned;
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

                    if (window.game.upgrades.Trapstorm.done == 1 && trapTrimps()) {
                        if (!window.game.global.trapBuildToggled) {
                            window.toggleAutoTrap();
                        }
                        if (window.game.resources.trimps.realMax() == window.game.resources.trimps.owned || window.game.buildings.Trap.owned < 100) {
                            window.setGather('buildings')
                        } else {
                            window.setGather('trimps')
                        }
                    } else if (window.game.global.playerGathering != lowestResource) {
                        // debug('Changing gather to ' + lowestResource);
                        window.setGather(lowestResource);
                        // window.tooltip('hide');
                    }
                }



            }
        }

        function objectToArray(obj, key) {
            var result = [];
            for (var i in obj) {
                if ((typeof x === 'object') && (x !== null)) {
                    if (key.length > 0) key += '.';
                    result.push
                }
            }
        }

        function flattenObject(ob) {
            var toReturn = {};

            for (var i in ob) {
                if (!ob.hasOwnProperty(i)) continue;

                if ((typeof ob[i]) == 'object') {
                    var flatObject = flattenObject(ob[i]);
                    for (var x in flatObject) {
                        if (!flatObject.hasOwnProperty(x)) continue;

                        toReturn[i + '.' + x] = flatObject[x];
                    }
                } else {
                    toReturn[i] = ob[i];
                }
            }
            return toReturn;
        };

        function isNumber(obj) {
            return !isNaN(parseFloat(obj))
        }

        function printGame() {
            var flatGame = flattenObject(window.game);
            var statArray = [];
            for (var item in flatGame) {
                if (isNumber(flatGame[item])) {
                    // debug(item + flatGame[item]);
                }
            }
            // debug(result);
        }

        function getCurrentMap() {
            var gridArray = window.game.global.gridArray;
            for (var cell in gridArray) {
                // debug('cell: ' + cell);
                if (gridArray[cell].health > 0) {
                    return gridArray[cell];
                }
            }
            return gridArray[0];
        }

        function buildMap(mapID) {
            try {
                window.buildMapGrid(mapID);
            } catch (e) {
                //Handle the error if you wish.
            }
        }

        function canBeatMap(map) {
            return true; //Logic below really broke things... oops... temp fix x.x
            window.selectMap(map.id);
            buildMap(map.id);
            var cell = window.game.global.mapGridArray[window.game.global.mapGridArray.length - 1];
            // debug('Build map ' + map.name + ' maxAttack ' + maxAttack + ' soldierDefence ' + getTotalDefence() + '');
            return canBeatCell(cell);
        }

        function canBeatCell(cell) {
            // debug('Running canBeatCell - Enemy Health: ' + window.game.global.getEnemyHealth(cell.level, cell.name)+ ' My damage ' +window.calculateDamage(window.game.global.soldierCurrentAttack, true, true, true)+ ' and max hits: ' +maxHitsTillStuck());
            return window.game.global.getEnemyAttack(cell.level, cell.name) < (getTotalDefence() * 0.75) && window.game.global.getEnemyHealth(cell.level, cell.name) < (window.calculateDamage(window.game.global.soldierCurrentAttack, true, true, true) * maxHitsTillStuck());
        }

        function canBeatWorld(level) {
            if (level == undefined) {
                level = window.game.global.gridArray.length - 1;
            }
            return canBeatCell(window.game.global.gridArray[level]);
        }

        function getTotalDefence() {
            return window.game.global.soldierHealthMax + window.game.global.soldierCurrentBlock;
        }

        function canAffordMap() {
            // debug('canaffordmap ' + window.updateMapCost(true) + ' ' + window.game.resources.fragments.owned);
            return window.updateMapCost(true) < window.game.resources.fragments.owned;
        }

        function canAffordNewMap() {
            document.getElementById('sizeAdvMapsRange').value = 0;
            document.getElementById('difficultyAdvMapsRange').value = 0;
            document.getElementById('lootAdvMapsRange').value = 0;

            if (!canAffordMap()) {
                return false;
            }
            return true;
        }

        function createNewMap() {
            // debug('Creating a new map');
            document.getElementById('sizeAdvMapsRange').value = 0;
            document.getElementById('difficultyAdvMapsRange').value = 0;
            document.getElementById('lootAdvMapsRange').value = 0;

            if (!canAffordMap()) {
                return false;
            }
            //size loop
            for (var i = 1; i < 10; i++) {
                document.getElementById('difficultyAdvMapsRange').value = i;
                if (!canAffordMap()) {
                    document.getElementById('difficultyAdvMapsRange').value = i - 1;
                    i = 10;
                }
            }
            //difficulty loop
            for (var i = 1; i < 10; i++) {
                document.getElementById('sizeAdvMapsRange').value = i;
                if (!canAffordMap()) {
                    document.getElementById('sizeAdvMapsRange').value = i - 1;
                    i = 10;
                }
            }
            //loot loop 
            for (var i = 1; i < 10; i++) {
                document.getElementById('lootAdvMapsRange').value = i;
                if (!canAffordMap()) {
                    document.getElementById('lootAdvMapsRange').value = i - 1;
                    i = 10;
                }
            }
            window.recycleMap();
            window.buyMap();
            return true;
        }

        function getUniqueMap() {
            for (var map in window.game.global.mapsOwnedArray) {
                map = window.game.global.mapsOwnedArray[map];
                if (map.noRecycle && window.getUniqueColor(map) != ' noRecycleDone' && canBeatMap(map)) {
                    // debug('Found good map: ' + map.id + ' ' + map.name);
                    return map;
                }
            }
        }

        function getBattleScreen() {
            if (window.game.global.preMapsActive) {
                return 'premap';
            } else if (window.game.global.mapsActive) {
                return 'map';
            }
            return 'world';
        }

        function goToMap(map) {
            // debug('Going to map ' + map.name + ' ' + map.id + ' looking at ' + window.game.global.lookingAtMap + ' battle screen ' + getBattleScreen());
            if (getBattleScreen() == 'world') {
                debug('BattleScreen is world');
                window.mapsClicked();
            }
            if (window.game.global.lookingAtMap == map.id && getBattleScreen() == 'map') {
                // debug('Already in this map silly');
                return;
            }
            if (window.game.global.lookingAtMap != map.id) {
                if (getBattleScreen() == 'map') {
                    debug('In the wring map ~ oops');
                    window.mapsClicked();
                }
                debug('Need to switch to map ' + map.name);
                window.selectMap(map.id, true);
            }
            debug('Run Map');
            window.runMap();
        }

        function goToCurrentLevelMap() {
            // debug('goToCurrentLevelMap');
            var currentSelectedMap = window.game.global.mapsOwnedArray[window.getMapIndex(window.game.global.lookingAtMap)];
            if (getBattleScreen() == 'map' && currentSelectedMap.level == window.game.global.world) {
                // debug('Already in the right map');
                return;
            }
            if ((getBattleScreen() == 'map' && currentSelectedMap.level != window.game.global.world) || (getBattleScreen() == 'world')) {
                debug('Moving to premap screen');
                window.mapsClicked();
            }
            var currentLevelMap;
            for (var map in window.game.global.mapsOwnedArray) {
                map = window.game.global.mapsOwnedArray[map];
                if (map.level == window.game.global.world && !map.noRecycle) {
                    // debug('Found current level map' + map.name);
                    currentLevelMap = map;
                }
            }
            if (currentLevelMap == undefined) {
                debug('Need to make a new map');
                createNewMap();
                goToMap(window.game.global.mapsOwnedArray[window.game.global.mapsOwnedArray.length - 1]);
            } else {
                debug('Running non-unique map ' + currentLevelMap.name);
                goToMap(currentLevelMap);
            }
        }

        function goToWorld() {
            if (getBattleScreen() == 'map') {
                window.mapsClicked();
            }
            if (getBattleScreen() == 'premap') {
                window.mapsClicked();
            }
        }

        function fixMap() { //Not sure why this happens, but slapping a bandaid on it till I figure it out
            while (window.game.global.currentMapId === "" && window.game.global.mapsActive) {
                debug('Fixing maps???');
                window.mapsClicked();
            }
        }

        function newAutoMap() {
            if (window.game.global.mapsUnlocked) {
                fixMap();
                //Check for unique maps
                var unique = getUniqueMap();
                if (unique != undefined && canAffordNewMap() && AutoUniqueMap()) {
                    // debug('Mapping Unique');
                    goToMap(unique);
                    return;
                }
                //Check if upgrades can be unlocked (need to work through logic here)

                //Check if stuck in world
                if (AutoProgressMap()) {
                    // debug('canBeatWorld(window.game.global.lastClearedCell + 1)' + (window.game.global.lastClearedCell + 1) + canBeatWorld(window.game.global.lastClearedCell + 1) + ' canAffordNewMap ' + canAffordNewMap());
                    if (!canBeatWorld(window.game.global.lastClearedCell + 1) && canAffordNewMap()) {
                        // debug('Mapping Non-Unique');
                        goToCurrentLevelMap();
                        return;
                    } else {
                        goToWorld();
                    }
                }
            }
        }

        function autoMap() { //Depricated because it was horrible
            // return; //just for testing
            if (window.game.global.mapsUnlocked) {
                // debug('MapsUnlocked');
                //window.game.resources.fragments.owned
                if (!canBeatWorld()) {
                    debug('Cantbeatworld');
                    if (!window.game.global.preMapsActive && !window.game.global.mapsActive) {
                        window.mapsClicked();
                    } else {
                        // debug('MapsActive');
                        //Find unique maps
                        var currentLevelMap;
                        for (var map in window.game.global.mapsOwnedArray) {
                            map = window.game.global.mapsOwnedArray[map];
                            if (map.noRecycle && window.getUniqueColor(map) != ' noRecycleDone' && canBeatMap(map)) {
                                debug('Found good map: ' + map.id + ' ' + map.name);
                                window.recycleMap();
                                window.selectMap(map.id);
                                window.runMap();
                                return;
                            } else if (map.level == window.game.global.world) {
                                debug('Found current level map' + map.name);
                                currentLevelMap = map;
                            }
                        }
                        //NonUnique map
                        if (currentLevelMap == undefined) {
                            // var newMap = createNewMap();
                            debug('Need to make a new map');
                            createNewMap();
                        } else {
                            debug('Running non-unique map ' + map.name);
                            window.selectMap(map.id);
                            window.runMap();
                        }
                    }
                } else if (window.game.global.preMapsActive || window.game.global.mapsActive) {
                    //Go back to world
                    debug('Need to go back to world'); //should only do this is not on world map
                    if (!window.game.global.preMapsActive && window.game.global.mapsActive) {
                        window.mapsClicked();
                    }
                    if (window.game.global.preMapsActive && window.game.global.mapsActive) {
                        window.mapsClicked();
                    }
                }
            }
        }
    })();
