    // ==UserScript==
    // @name         AutoTrimps
    // @namespace    http://tampermonkey.net/
    // @version      0.1
    // @description  try to take over the world!
    // @author       zininzinin, spindrjr
    // @include        *trimps.github.io*
    // @grant        none
    // ==/UserScript==


    (function() {
        "use strict";

        //Variables//
        var runInterval = 200; //How often to loop through logic
        var enableDebug = true; //Spam console?
        var startAllSelected = false;
        var avoidFast = false; //switch to heap when encountering a fast enemy?

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


        // setInterval(printGame, runInterval);

        //Page Changes//
        document.getElementById("buyHere").innerHTML += '<div id="autoContainer" style="display: block; font-size: 12px;"> <div id="autoTitleDiv" class="titleDiv"> <div class="row"> <div class="col-xs-4"><span id="autoTitleSpan" class="titleSpan">Automation</span> </div> </div> </div> <br> <div class="autoBox" id="autoHere"> </div> <table style="text-align: left; vertical-align: top; width: 90%;" border="0" cellpadding="0" cellspacing="0"> <tbody> <tr> <td style="vertical-align: top;"> Loops <br> <input id="chkBuyStorage" title="Will buy storage when resource is almost full" type="checkbox">Buy Storage <br> <input id="chkManualStorage" title="Will automatically gather resources and trap trimps" type="checkbox">Manual Gather <br> <input id="chkBuyJobs" title="Buys jobs based on ratios configured" type="checkbox">Buy Jobs <br> <input id="chkBuyBuilding" title="Will buy non storage buildings as soon as they are available" type="checkbox">Buy Buildings <br> <input id="chkBuyUpgrades" title="autobuy non eqipment Upgrades" type="checkbox">Buy Upgrades <br>  <input id="chkAutoStance" title="automate setting stance" type="checkbox">Auto Stance</td> <td style="vertical-align: top;"> Equipment <br> <input id="chkBuyEquipH" title="Will buy the most efficient armor available" type="checkbox">Buy Armor <br> <input id="chkBuyPrestigeH" title="Will buy the most efficient armor upgrade available" type="checkbox">Buy Armor Upgrades <br> <input id="chkBuyEquipA" title="Will buy the most efficient weapon available" type="checkbox">Buy Weapons <br> <input id="chkBuyPrestigeA" title="Will buy the most efficient weapon upgrade available" type="checkbox">Buy Weapon Upgrades <br><br> Misc Settings <br> <input id="chkTrapTrimps" title="automate trapping trimps" type="checkbox">Trap Trimps<br><input id="geneticistTargetBreedTime" title="Breed time in seconds to shoot for using geneticists" style="width: 20%;color: #000000;font-size: 12px;" value="5">&nbsp;Geneticist Timer<br></td> </tr> <tr> <td style="vertical-align: middle; text-align: left;"> <br>Max Buildings to build <br> <input id="maxHut" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Hut <br> <input id="maxHouse" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; House <br> <input id="maxMansion" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Mansion <br> <input id="maxHotel" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Hotel <br> <input id="maxResort" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Resort <br> <input id="maxGateway" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Gateway <br> <input id="maxCollector" style="width: 20%;color: #000000;font-size: 12px;" value="100">&nbsp; Collector <br> <input id="maxWarpstation" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Warpstation <br> <input id="maxGym" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Gym <br> <input id="maxTribute" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Tribute <br> <input id="maxNursery" style="width: 20%;color: #000000;font-size: 12px;" value="-1">&nbsp; Nursery <br> <br> </td> <td style="text-align: left; vertical-align: top;"> <br>Maps <br> <input id="chkAutoUniqueMap" title="Auto run unique maps" type="checkbox"> Auto run unique maps <br> <input id="chkAutoProgressMap" title="Runs maps when cannot defeat current level" type="checkbox">Auto map when stuck <br> <input id="maxHitsTillStuck" style="width: 10%; color: #000000;" value="10">&nbsp;Max hits to kill enemy before stuck<br><br>Ratios&nbsp&nbsp;Max<br><input id="FarmerRatio" style="width: 10%; color: #000000;" value="10"><input id="FarmerMax" style="width: 10%; color: #000000;" value="-1">&nbsp;Farmer<br><input id="LumberjackRatio" style="width: 10%; color: #000000;" value="10"><input id="LumberjackMax" style="width: 10%; color: #000000;" value="-1">&nbsp;Lumberjack<br><input id="MinerRatio" style="width: 10%; color: #000000;" value="10"><input id="MinerMax" style="width: 10%; color: #000000;" value="-1">&nbsp;Miner<br><input id="ScientistRatio" style="width: 10%; color: #000000;" value="10"><input id="ScientistMax" style="width: 10%; color: #000000;" value="-1">&nbsp;Scientist<br><input id="TrainerRatio" style="width: 10%; color: #000000;" value="10"><input id="TrainerMax" style="width: 10%; color: #000000;" value="-1">&nbsp;Trainer<br><input id="ExplorerRatio" style="width: 10%; color: #000000;" value="10"><input id="ExplorerMax" style="width: 10%; color: #000000;" value="-1">&nbsp;Explorer</td> </tr> </tbody> </table></div>';

        var temp = document.getElementById("autoContainer").innerHTML.split('input id="');
        temp.splice(0, 1);
        var pageSettings = [];
        for (var i in temp) {
            pageSettings.push(temp[i].substring(0, temp[i].indexOf('"')));
        }

        //Set all the saved variables
        for (var index in pageSettings) {
            var setting = pageSettings[index];
            if (localStorage.getItem(setting) != null) {
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

        function autoStanceChecked() {
            return document.getElementById("chkAutoStance").checked;
        }

        function getTargetBreedTime() {
            return document.getElementById("geneticistTargetBreedTime").value;
        }

        //I honestly have no idea why I have to do this >.>
        document.getElementById("wood").style.opacity = "1";
        document.getElementById("science").style.opacity = "1";
        document.getElementById("jobsTab").style.opacity = "1";
        document.getElementById("upgradesTab").style.opacity = "1";
        document.getElementById("equipmentTab").style.opacity = "1";
        document.getElementById("buyTabsUl").innerHTML += '<li role="presentation" id="autoTab" onclick="filterTabs(\'auto\')" class="buyTab"><a id="autoA" href="#">Automation</a></li>';

        window.mapsClicked();
        window.mapsClicked();
        window.mapsClicked();

        //Functions//
        function debug(message) {
            if (enableDebug)
                console.log(message);
        }

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

        function buyJob(jobTitle, amount, fire) {
            //debug('Hiring ' + amount + ' ' + jobTitle);
            if (amount == undefined || !canAffordJob(jobTitle, amount)){
               amount = 1; 
            } 
            var oldAmount = window.game.global.buyAmt;
            var oldFire = window.game.global.firing;
            window.game.global.firing = fire == true ? true : false;
            window.game.global.buyAmt = amount;
            window.buyJob(jobTitle);
            window.game.global.buyAmt = oldAmount;
            window.game.global.firing = oldFire;
            window.tooltip('hide');

        }

        //adjust geneticists to reach desired breed timer
        function manageGenes() {
            var fWorkers = Math.ceil(window.game.resources.trimps.realMax() / 2) - window.game.resources.trimps.employed;
            //if we need to hire geneticists
            if (getTargetBreedTime() >= 0 && getTargetBreedTime() > getBreedTime() && !window.game.jobs.Geneticist.locked) {
                //if there's no free worker spots, fire a scientist
                if (fWorkers < 1 && window.canAffordJob('Geneticist', false, fWorkers)) {
                    buyJob('Scientist', 1, true);
                    fWorkers = Math.ceil(window.game.resources.trimps.realMax() / 2) - window.game.resources.trimps.employed;
                }
                //hire a geneticist
                buyJob('Geneticist');
            }
            //if we need to fire geneticists
            if (getTargetBreedTime() >= 0 && getTargetBreedTime() < getBreedTime() && !window.game.jobs.Geneticist.locked) {
                buyJob('Geneticist', 1, true);
            }
        }

        function jobMax(jobName) {
            return document.getElementById(jobName + 'Max').value;
        }

        function jobRatio(jobName) {
            return document.getElementById(jobName + 'Ratio').value;
        }

        function determineJobWant(j) {
            var jobName = jobList[j].name;
            var max = jobMax(jobName);
            var ratio = jobRatio(jobName);
            if (!window.game.jobs[jobName].locked) {
                if (!canAffordJob(jobName, 1)) {
                    return 0;
                } else if (max >= 0) {
                    if (max <= window.game.jobs[jobName].owned) {
                        return 0;
                    } else {
                        return 1 / Math.min(max, window.game.jobs[jobName].owned / ratio);
                    }
                } else {
                    return 1 / (window.game.jobs[jobName].owned / ratio);
                }
                // debug('Job: ' +jobList[jobIndex].name+ '. Want: ' +jobList[j].want);
            }
            return 0;
        }

        function getBreedTime() {
            var trimps = window.game.resources.trimps;
            var breeding = trimps.owned - trimps.employed;
            var trimpsMax = trimps.realMax();

            var potencyMod = trimps.potency;
            if (window.game.global.brokenPlanet) breeding /= 10;

            //Pheromones
            potencyMod += (potencyMod * window.game.portal.Pheromones.level * window.game.portal.Pheromones.modifier);
            if (window.game.jobs.Geneticist.owned > 0) potencyMod *= Math.pow(.98, window.game.jobs.Geneticist.owned);
            if (window.game.unlocks.quickTrimps) potencyMod *= 2;
            breeding = breeding * potencyMod;
            updatePs(breeding, true);


            var timeRemaining = log10((trimpsMax - trimps.employed) / (trimps.owned - trimps.employed)) / log10(1 + (potencyMod / 10));
            if (!window.game.global.brokenPlanet) timeRemaining /= 10;
            timeRemaining = Math.floor(timeRemaining) + " Secs";
            var fullBreed = 0;
            if (window.game.options.menu.showFullBreed.enabled) {
                var adjustedMax = (window.game.portal.Coordinated.level) ? window.game.portal.Coordinated.currentSend : trimps.maxSoldiers;
                var totalTime = log10((trimpsMax - trimps.employed) / ((trimpsMax - adjustedMax) - trimps.employed)) / log10(1 + (potencyMod / 10));
                if (!window.game.global.brokenPlanet) totalTime /= 10;
                fullBreed = Math.floor(totalTime) + " Secs";
                timeRemaining += " / " + fullBreed;
            }
            // debug('Time to breed is ' +Math.floor(totalTime));
            return Math.floor(totalTime);
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

        function canAffordJob(jobName, amount) {
            var workspaces = Math.ceil(game.resources.trimps.realMax() / 2) - game.resources.trimps.employed;
            if (workspaces <= 0) return false;
            if (!window.canAffordJob(jobName, false, workspaces)) return false;
            if (freeWorkers() === 0) return false;
            if (amount == undefined) amount = 1;

            for (var costItem in window.game.jobs[jobName].cost) {
                // debug('Checking cost for ' +costItem+ ' and ' +jobName+ ': ' + window.checkJobItem(jobName, false, costItem, null, 1));
                if (!window.checkJobItem(jobName, false, costItem, null, amount)) return false;
            }
            return true;
        }

        function buyJobs() {
            if (autoBuyJobs()) { //don't buy jobs if total trimps has dropped below 80%, to prevent dropping to 0 breeding during large population cap purchase (gigastation)                                                          
                if ((window.game.resources.trimps.employed === 0 && window.game.resources.trimps.realMax() != window.game.resources.trimps.owned) || window.game.resources.trimps.owned / window.game.resources.trimps.realMax() < .8) {
                    return;
                }
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
                        //debug ('entering buy. jobtohire:' + jobToHire);
                        //why does this instantly break the game?!
                        /*     if (amountToBuy > jobMax(jobToHire) && jobMax(jobToHire) > 0) {
                      debug('buy over max amt:' + amountToBuy +'jobmax:' + jobMax(jobToHire) + 'for job:' +jobToHire);
                      amountToBuy = jobMax(jobToHire);
                    }*/
                        // debug('owned ' + window.game.resources.trimps.owned + ' employed ' + window.game.resources.trimps.employed + ' amountToBuy ' + amountToBuy);
                        if (Math.floor(window.game.resources.trimps.owned - window.game.resources.trimps.employed) - amountToBuy <= 2) return;
                        var oldAmount = window.game.global.buyAmt;
                        if (jobMax(jobToHire) > 0) {
                            buyJob(jobToHire, Math.min(jobMax(jobToHire)-window.game.jobs[jobToHire].owned, amountToBuy), false);
                        } else {
                            buyJob(jobToHire, amountToBuy, false);
                        }
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
            if (AutoBuyBuilding() && window.game.global.buildingsQueue.length < 5) {
                var oldAmount = window.game.global.buyAmt;
                window.game.global.buyAmt = 1;
                for (var buildingIndex in buildingList) {
                    var building = buildingList[buildingIndex];
                    // debug('Checking building ' +building+ ' buildingMax ' +document.getElementById('max' + building).value);
                    if (window.canAffordBuilding(building, false) && !window.game.buildings[building].locked && !buildingAtMax(building)) {
                        // debug('Attempting to build: ' + building);
                        window.buyBuilding(building);
                        window.tooltip('hide');
                    }
                }
                window.game.global.buyAmt = oldAmount;
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
        //add way to buy scientists upgrade before bloodlust and miners?
        function buyUpgrades() {
            for (var upgrade in upgradeList) {
                upgrade = upgradeList[upgrade];
                var gameUpgrade = window.game.upgrades[upgrade];
                if (AutoBuyUpgrades() && gameUpgrade.allowed > gameUpgrade.done && window.canAffordTwoLevel(upgrade) /*&& !window.jobs.Scientist.locked*/ ) {
                    window.buyUpgrade(upgrade);
                    // window.tooltip('hide');
                    document.getElementById("upgradesAlert").innerHTML = '';
                }

            }
        }
        //spams buys of storage in early game but oh well. Just get rid of console spam
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
                        // debug('Buying ' + B + '(' + Bs[B] + ') at ' + Math.floor(window.game.resources[Bs[B]].owned / (window.game.resources[Bs[B]].max * packMod * 0.99) * 100) + '%');
                        if (AutoBuyStorage() && window.canAffordBuilding(B)) {
                            debug('Wanna buy ' + B);
                            window.buyBuilding(B);
                            window.tooltip('hide');
                        }
                    }
                }
            }
        }

        function manualLabor() {
            var ManualGather = 'metal';
            //if science perk level is none, dont turn on auto labor until scientists are unlocked
            if (AutoManualLabor() && (window.game.global.sLevel > 0 || !window.game.jobs.Scientist.locked)) {
                //If you don't have autofight and you have enough trimps, manual fight
                if (((window.game.resources.trimps.owned - window.game.resources.trimps.employed) > (window.game.resources.trimps.realMax())/8 && window.game.global.world < 5) && !window.game.global.fighting && window.game.upgrades.Battle.done == 1) {
                    window.fightManual();
                }
                //If you can autofight - set autofight to true
                if (window.game.upgrades.Bloodlust.done == 1 && window.game.global.pauseFight) {
                    window.pauseFight();
                }
                //set gather to whatever player has clicked. Will be nothing on fresh portal
                if (game.global.playerGathering != 'buildings' && game.global.playerGathering != 'science') {
                    ManualGather = game.global.playerGathering;
                }
                //if we have more than 2 buildings in queue, or our modifier is real fast, build
                if ((game.global.buildingsQueue.length > 2) || (game.global.buildingsQueue.length > 0 && game.global.playerModifier > 1000) && game.global.playerGathering != 'buildings') {
                    setGather('buildings');
                }
                //if we can gather more science in 1 min by ourselves than we currently have, get some science
                else if (game.global.playerModifier * 60 > game.resources.science.owned) {
                    setGather('science');
                }
                //otherwise gather what the player chose
                else {
                    setGather(ManualGather);
                }
                //trap trimps if option is checked
                if (window.game.upgrades.Trapstorm.done == 1 && trapTrimps()) {
                    if (!window.game.global.trapBuildToggled) {
                        window.toggleAutoTrap();
                    }
                    if (window.game.resources.trimps.realMax() == window.game.resources.trimps.owned || window.game.buildings.Trap.owned < 100) {
                        window.setGather('buildings');
                    } else {
                        window.setGather('trimps');
                    }
                }
            }
        }

        // function manualLabor() {
        //     if (AutoManualLabor()) {
        //         if ((window.game.resources.trimps.owned - window.game.resources.trimps.employed) < 2 && window.canAffordBuilding('Trap') && window.game.global.buildingsQueue.length == 0 && (trapTrimps() || (window.game.resources.trimps.realMax() / window.game.resources.trimps.owned > 2))) {
        //             debug('Wanna buy Trap');
        //             buyBuilding('Trap');
        //             // window.tooltip('hide');
        //         }

        //         //If you don't have autofight and you have enough trimps, manual fight
        //         if (window.game.upgrades.Bloodlust.done == 0 && (window.game.resources.trimps.owned - window.game.resources.trimps.employed) > 3 && !window.game.global.fighting && window.game.upgrades.Battle.done == 1) {
        //             window.fightManual();
        //         }
        //         //If you can autofight - set autofight to true
        //         if (window.game.upgrades.Bloodlust.done == 1 && window.game.global.pauseFight) {
        //             window.pauseFight();
        //         }

        //         //TrapTrimps - if need trimps and have trapstorm will autotrap trimps
        //         //Overrides trap trimps option if total trimps is below half (presumeably at start of game)
        //         if (window.game.buildings.Trap.owned > 0 && (window.game.resources.trimps.realMax() - window.game.resources.trimps.owned) > 2 && window.game.upgrades.Trapstorm.done != 1 && (trapTrimps() || (window.game.resources.trimps.realMax() / window.game.resources.trimps.owned > 2))) {
        //             window.setGather('trimps');
        //             //if scientists are still locked, don't give building priority
        //         } else if (window.game.global.buildingsQueue.length > 2 && !window.game.jobs.Scientist.locked) {
        //             window.setGather('buildings');
        //         } else if (window.game.global.autoCraftModifier == 0 && window.game.global.buildingsQueue.length > 0 && window.game.upgrades.Scientists.allowed == 0) {
        //             window.setGather('buildings');
        //         } else {
        //             //Do something here :/ 
        //             var manualResourceList = {
        //                 'food': 'Farmer',
        //                 'wood': 'Lumberjack',
        //                 'metal': 'Miner',
        //                 'science': 'Scientist'
        //             };
        //             var lowestResource = 'food';
        //             var lowestResourceRate = -1;
        //             var haveWorkers = true;
        //             for (var resource in manualResourceList) {
        //                 var job = manualResourceList[resource];
        //                 var currentRate = window.game.jobs[job].owned * window.game.jobs[job].modifier;
        //                 // debug('Current rate for ' + resource + ' is ' + currentRate + ' is hidden? ' + (document.getElementById(resource).style.visibility == 'hidden'));
        //                 if (document.getElementById(resource).style.visibility != 'hidden') {
        //                     // debug('INNERLOOP for resource ' +resource);
        //                     if (currentRate == 0) {
        //                         currentRate = window.game.resources[resource].owned;
        //                         // debug('Current rate for ' + resource + ' is ' + currentRate + ' lowest ' + lowestResource + lowestResourceRate);
        //                         if ((haveWorkers) || (currentRate < lowestResourceRate)) {
        //                             // debug('New Lowest1 ' + resource + ' is ' + currentRate + ' lowest ' + lowestResource + lowestResourceRate+ ' haveworkers ' +haveWorkers);
        //                             haveWorkers = false;
        //                             lowestResource = resource;
        //                             lowestResourceRate = currentRate;
        //                         }
        //                     }
        //                     if ((currentRate < lowestResourceRate || lowestResourceRate == -1) && haveWorkers) {
        //                         // debug('New Lowest2 ' + resource + ' is ' + currentRate + ' lowest ' + lowestResource + lowestResourceRate);
        //                         lowestResource = resource;
        //                         lowestResourceRate = currentRate;
        //                     }
        //                 }
        //                 // debug('Current Stats ' + resource + ' is ' + currentRate + ' lowest ' + lowestResource + lowestResourceRate+ ' haveworkers ' +haveWorkers);
        //             }

        //             if (window.game.upgrades.Trapstorm.done == 1 && trapTrimps()) {
        //                 if (!window.game.global.trapBuildToggled) {
        //                     window.toggleAutoTrap();
        //                 }
        //                 if (window.game.resources.trimps.realMax() == window.game.resources.trimps.owned || window.game.buildings.Trap.owned < 100) {
        //                     window.setGather('buildings')
        //                 } else {
        //                     window.setGather('trimps')
        //                 }
        //             } else if (window.game.global.playerGathering != lowestResource) {
        //                 // debug('Changing gather to ' + lowestResource);
        //                 window.setGather(lowestResource);
        //                 // window.tooltip('hide');
        //             }
        //         }



        //     }
        // }



        function autoStance() {
            if (window.game.global.gridArray.length != 0 && window.game.global.challengeActive != "Electricity" && window.game.global.challengeActive != "Nom" && autoStanceChecked()) {
                if (avoidFast) {
                    var badguyMinAtt = window.game.global.gridArray[window.game.global.lastClearedCell + 1].attack * .805; //fudge factor
                    var badguyMaxAtt = window.game.global.gridArray[window.game.global.lastClearedCell + 1].attack * 1.19;
                    var badguyFast = window.game.badGuys[window.game.global.gridArray[window.game.global.lastClearedCell + 1].name].fast;

                    if (window.game.global.mapsActive && !window.game.global.preMapsActive) {
                        badguyMinAtt = window.game.global.mapGridArray[window.game.global.lastClearedMapCell + 1].attack * .805;
                        badguyMaxAtt = window.game.global.mapGridArray[window.game.global.lastClearedMapCell + 1].attack * 1.19;
                        badguyFast = window.game.badGuys[window.game.global.mapGridArray[window.game.global.lastClearedMapCell + 1].name].fast;
                    }
                    var mysoldiers = (window.game.portal.Coordinated.level) ? window.game.portal.Coordinated.currentSend : window.game.resources.trimps.maxSoldiers;
                    var myblock = window.game.global.soldierCurrentBlock;
                    var myhealth = window.game.global.soldierHealthMax;
                }

                //Switch Formations
                if (window.game.upgrades.Formations.done == 1 && window.game.upgrades.Dominance.done == 0) {
                    var healthFraction = window.game.global.soldierHealth / window.game.global.soldierHealthMax;
                    // If trimps are plenty, go to nostance
                    if (window.game.resources.trimps.owned >= window.game.resources.trimps.realMax()) {
                        window.setFormation('0');
                    } else if (healthFraction < 0.2 && window.game.global.formation == 0) {
                        window.setFormation('1');
                        // If the army is strong, switch to nostance
                    } else if ((healthFraction > 0.8 && window.game.global.formation == 1)) {
                        window.setFormation('0');
                    }
                } else if (window.game.upgrades.Dominance.done == 1) {
                    healthFraction = window.game.global.soldierHealth / window.game.global.soldierHealthMax;
                    if (window.game.global.mapsActive && !window.game.global.preMapsActive) {
                        if (window.game.badGuys[window.game.global.mapGridArray[window.game.global.lastClearedMapCell + 1].name].fast && avoidFast) {
                            if (window.game.global.formation == 2 && myblock < badguyMaxAtt && !(window.game.resources.trimps.owned >= window.game.resources.trimps.realMax())) {
                                window.setFormation(1);
                            }
                        } else {
                            // If trimps are plenty, go to Dominance
                            if (window.game.resources.trimps.owned >= window.game.resources.trimps.realMax()) {
                                window.setFormation('2');
                                // If Dominance is failing, switch to None
                            } else if (healthFraction < 0.2 && window.game.global.formation == 2) {
                                window.setFormation('0');
                                // If None is failing, switch to Heap
                            } else if (healthFraction < 0.2 && window.game.global.formation == 0) {
                                window.setFormation('1');
                                // If the army is strong, switch to Dominance
                            } else if ((healthFraction > 0.9 && window.game.global.formation == 1) || (healthFraction > 0.6 && window.game.global.formation == 0)) {
                                window.setFormation('2');
                            } else if ((healthFraction > .8 && healthFraction < .9) && window.game.global.formation == 1) {
                                window.setFormation('0');
                            }
                        }
                    } else {
                        if (window.game.badGuys[window.game.global.gridArray[window.game.global.lastClearedCell + 1].name].fast && avoidFast) {
                            if (window.game.global.formation == 2 && !(window.game.resources.trimps.owned >= window.game.resources.trimps.realMax())) {
                                window.setFormation(1);
                            }
                        } else {
                            // If trimps are plenty, go to Dominance
                            if (window.game.resources.trimps.owned >= window.game.resources.trimps.realMax()) {
                                window.setFormation('2');
                                // If Dominance is failing, switch to None
                            } else if (healthFraction < 0.2 && window.game.global.formation == 2) {
                                window.setFormation('0');
                                // If None is failing, switch to Heap
                            } else if (healthFraction < 0.2 && window.game.global.formation == 0) {
                                window.setFormation('1');
                                // If the army is strong, switch to Dominance
                            } else if ((healthFraction > 0.9 && window.game.global.formation == 1) || (healthFraction > 0.6 && window.game.global.formation == 0)) {
                                window.setFormation('2');
                            }

                        }
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
                level = window.game.global.gridArray.length - 1; //Checks zone boss
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
            clickButton('mapCreateBtn');
            if (window.game.global.currentMapId === '') {
                clickButton('recycleMapBtn');
            }
            clickButton(window.game.global.mapsOwnedArray[window.game.global.mapsOwnedArray.length - 1].id);
            clickButton('selectMapBtn');
            // window.recycleMap();
            // window.buyMap();
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
            while (getBattleScreen() == 'world') {
                // debug('BattleScreen is world');
                window.mapsClicked();
            }
            if (window.game.global.lookingAtMap == map.id && getBattleScreen() == 'map') {
                // debug('Already in this map silly');
                return;
            }
            if (window.game.global.lookingAtMap != map.id) {
                while (getBattleScreen() == 'map') {
                    debug('In the wrong map ~ oops');
                    window.mapsClicked();
                }
                debug('Need to switch to map ' + map.name);
                window.selectMap(map.id, true);
            }
            debug('Running Map ' + window.game.global.mapsOwnedArray[window.getMapIndex(window.game.global.lookingAtMap)].name + ' Level: ' + window.game.global.mapsOwnedArray[window.getMapIndex(window.game.global.lookingAtMap)].level);
            clickButton(map.id);
            clickButton('selectMapBtn');
        }

        function goToCurrentLevelMap() {
            // debug('goToCurrentLevelMap');
            for (var map in window.game.global.mapsOwnedArray) {
                // debug('test ' + map+ ' ' +window.game.global.mapsOwnedArray[map]);
                map = window.game.global.mapsOwnedArray[map];
                if (map.level == window.game.global.world && !map.noRecycle) {
                    // debug('Found current level map' + map.name);
                    goToMap(map);
                    return;
                }
            }


            debug('Need to make a new map');
            createNewMap();
            goToMap(window.game.global.mapsOwnedArray[window.game.global.mapsOwnedArray.length - 1]);

        }

        function goToWorld() {
            // debug('Moving back to World');
            while (getBattleScreen() != 'world') {
                debug('Moving back to World');
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
                if (AutoUniqueMap()) {
                    var unique = getUniqueMap();
                    if (unique != undefined && canAffordNewMap()) {
                        // debug('Mapping Unique');
                        goToMap(unique);
                        return;
                    }
                }
            }
            //Check if upgrades can be unlocked (need to work through logic here)

            //Check if stuck in world
            if (AutoProgressMap()) {
                // debug('canBeatWorld(window.game.global.lastClearedCell + 1)' + (window.game.global.lastClearedCell + 1) + canBeatWorld(window.game.global.lastClearedCell + 1) + ' canAffordNewMap ' + canAffordNewMap());
                // if (!canBeatWorld(window.game.global.lastClearedCell + 1) && canAffordNewMap()) { //Checks current zone
                if (!canBeatWorld() && canAffordNewMap()) { //Checks zone boss
                    // debug('Mapping Non-Unique');
                    goToCurrentLevelMap();
                    return;
                } else {
                    // debug('Need to go to world');
                    goToWorld();
                }
            }
        }

        function setTitle() {
            document.title = '(' + window.game.global.world + ')' + ' Trimps ' + document.getElementById('versionNumber').innerHTML;
        }


        //Intervals//
        setInterval(buyJobs, runInterval);
        setInterval(buyBuildings, runInterval);
        setInterval(buyEquipment, runInterval);
        setInterval(buyUpgrades, runInterval);
        setInterval(buyStorage, runInterval);
        setInterval(manualLabor, runInterval);
        setInterval(manageGenes, runInterval);
        setInterval(autoStance, runInterval);
        setInterval(newAutoMap, runInterval * 10);
        setInterval(saveSettings, 1000);
        setInterval(getBreedTime, 1000);
        setInterval(setTitle, 1000);
        setInterval(manageGenes, 1000);

    })();
