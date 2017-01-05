MODULES["magmite"] = {};
//These can be changed (in the console) if you know what you're doing:
MODULES["magmite"].algorithm = 2;   //2 is advanced cost/benefit calculation between capacity/efficiency. 1 is buy-cheapest-upgrade.

//Activate Robo Trimp
function autoRoboTrimp() {
    //exit if the cooldown is active, or we havent unlocked robotrimp.
    if (game.global.roboTrimpCooldown > 0 || !game.global.roboTrimpLevel) return;
    var robotrimpzone = parseInt(getPageSetting('AutoRoboTrimp'));
    //exit if we have the setting set to 0
    if (robotrimpzone == 0) return;
    //activate the button when we are above the cutoff zone, and we are out of cooldown (and the button is inactive)
    if (game.global.world >= robotrimpzone && !game.global.useShriek){
        magnetoShriek();
        debug("Activated Robotrimp MagnetoShriek Ability", "other", '*podcast');
    }
}

//Version 3.6 Golden Upgrades
function autoGoldenUpgrades() {
    //get the numerical value of the selected index of the dropdown box
    try {
        var setting = document.getElementById('AutoGoldenUpgrades').value;
        if (setting == "Off") return;   //if disabled, exit.
        var num = getAvailableGoldenUpgrades();
        if (num == 0) return;       //if we have nothing to buy, exit.
        //buy one upgrade per loop.
        buyGoldenUpgrade(setting);
    } catch(err) { debug("Error in autoGoldenUpgrades: " + err.message); }
}

//Exits the Spire after completing the specified cell.
function exitSpireCell() {
    if(game.global.world == 200 && game.global.spireActive && game.global.lastClearedCell >= getPageSetting('ExitSpireCell')-1)
        endSpire();
}

//Auto Dimensional Generator
function autoDimensionalGenerator() {
    //prepare vars.
    var genmode = game.global.generatorMode;
    var fuel = game.global.magmaFuel;
    var maxFuel = getGeneratorFuelCap();
    var storageCap = getGeneratorFuelCap(true);
    var burnRate = getFuelBurnRate();
    var tickamt = getGeneratorTickAmount();
    var ticktime = getGeneratorTickTime();
    // changeGeneratorState(0 || 1 || 2);
}

//Auto Magmite spender before portal
function autoMagmiteSpender() {
    var didSpend = false;
    //Part #1:
    //list of available permanent one-and-done upgrades
    var permanames = ["Slowburn","Shielding","Storage","Hybridization"];
    //cycle through:
    for (var i=0; i < permanames.length; i++) {
        var item = permanames[i];
        var upgrade = game.permanentGeneratorUpgrades[item];
        if (typeof upgrade === 'undefined')
            return; //error-resistant
        //skip owned perma-upgrades
        if (upgrade.owned)
            continue;
        var cost = upgrade.cost;
        //if we can afford anything, buy it:
        if (game.global.magmite >= cost) {
            buyPermanentGeneratorUpgrade(item);
            debug("Auto Spending " + cost + " Magmite on: " + item, "general");
            didSpend = true;
        }
    }
    //Part #2
 
    var repeat = true;
    while (repeat) {
        try {
            if (MODULES["magmite"].algorithm == 2) {
                //Method 2:
                //calculate cost-efficiency of "Efficiency"&"Capacity"
                var eff = game.generatorUpgrades["Efficiency"];
                var cap = game.generatorUpgrades["Capacity"];
                var sup = game.generatorUpgrades["Supply"];
                var ovclock = game.generatorUpgrades["Overclocker"];
                if ((typeof eff === 'undefined')||(typeof cap === 'undefined')||(typeof sup === 'undefined'))
                    return; //error-resistant
                var EffObj = {};
                    EffObj.name= "Efficiency";
                    EffObj.lvl = eff.upgrades + 1;  //Calc for next level
                    EffObj.cost= eff.cost();    //EffObj.lvl*8;    //cost= 8mi/lvl
                    EffObj.benefit= EffObj.lvl*0.1;   //benefit= +10%/lvl
                    EffObj.effInc= (((1+EffObj.benefit)/(1+((EffObj.lvl-1)*0.1))-1)*100); //eff. % inc.
                    EffObj.miCostPerPct= EffObj.cost /  EffObj.effInc;
                var CapObj = {};
                    CapObj.name= "Capacity";
                    CapObj.lvl = cap.upgrades + 1;  //Calc for next level
                    CapObj.cost= cap.cost();    //CapObj.lvl*32;    //cost= 32mi/lvl
                    CapObj.totalCap= 3+(0.4*CapObj.lvl);
                    CapObj.benefit= Math.sqrt(CapObj.totalCap);
                    CapObj.effInc= ((CapObj.benefit/Math.sqrt(3+(0.4*(CapObj.lvl-1)))-1)*100); //eff. % inc.
                    CapObj.miCostPerPct= CapObj.cost / CapObj.effInc;
                var upgrade,item;
                //(try to) Buy Efficiency if its cheaper than Capacity in terms of Magmite cost per percent.
                if (EffObj.miCostPerPct <= CapObj.miCostPerPct)
                    item = EffObj.name;
                //if not, (try to) Buy Capacity if its cheaper than the cost of Supply.
                else if (CapObj.cost <= sup.cost())
                    item = CapObj.name;
                //if not, (try to) Buy Supply.
                else
                    item = "Supply"
                upgrade = game.generatorUpgrades[item];
                //IF we can afford anything, buy it:
                if (game.global.magmite >= upgrade.cost()) {
                    debug("Auto Spending " + upgrade.cost() + " Magmite on: " + item + " #" + (game.generatorUpgrades[item].upgrades+1), "general");
                    buyGeneratorUpgrade(item);                
                    didSpend = true;
                }
                //if we can't, exit the loop
                else
                    repeat = false;
            }
            else if (MODULES["magmite"].algorithm == 1) {
                //Method 1(old):
                //list of available multi upgrades
                var names = ["Efficiency","Capacity","Supply"];
                var lowest = [null,null];   //keep track of cheapest one
                //cycle through:
                for (var i=0; i < names.length; i++) {
                    var item = names[i];
                    var upgrade = game.generatorUpgrades[item];
                    if (typeof upgrade === 'undefined')
                        return; //error-resistant
                    var cost = upgrade.cost();
                    //store the first upgrade once
                    if (lowest[1] == null)
                        lowest = [item,cost];
                    //always load cheapest one in.
                    else if (cost < lowest[1])
                        lowest = [item,cost];
                }
                //if we can afford anything, buy it:
                if (game.global.magmite >= lowest[1]) {
                    buyGeneratorUpgrade(lowest[0]);
                    debug("Auto Spending " + lowest[1] + " Magmite on: " + lowest[0] + " #" + game.generatorUpgrades[lowest[0]].upgrades, "general");
                    didSpend = true;
                }
                //if we can't, exit the loop
                else
                    repeat = false;
            }
        }
        //dont get trapped in a while loop cause something stupid happened.
        catch (err) {
            debug("AutoSpendMagmite Error encountered: " + err.message,"general");
            repeat = false;
        }
    }
    //print the result
    if (didSpend)
        debug("Leftover magmite: " + game.global.magmite,"general");
    return;
}
