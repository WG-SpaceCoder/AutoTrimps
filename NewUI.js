if (autoTrimpSettings === undefined) {
    console.log('Huh, autoTrimpSettings was undefined in the UI script...')
    var autoTrimpSettings = new Object();
}


automationMenuInit();

//Booleans
createSetting('BuyStorage', 'Buy Storage', 'Will buy storage when resource is almost full', 'boolean');
createSetting('ManualGather', 'Auto Gather', 'Will automatically gather resources and build.', 'boolean');
createSetting('AutoFight', 'Better Auto Fight', 'Will automatically handle fighting.', 'boolean');
createSetting('BuyJobs', 'Buy Jobs', 'Buys jobs based on ratios configured', 'boolean');
createSetting('BuyBuildings', 'Buy Buildings', 'Will buy non storage buildings as soon as they are available', 'boolean');
createSetting('BuyUpgrades', 'Buy Upgrades', 'Autobuy non eqipment Upgrades', 'boolean');
createSetting('AutoStance', 'Auto Stance', 'Automatically swap stances to avoid death.', 'boolean');
createSetting('BuyArmor', 'Buy Armor', 'Will buy the most efficient armor available', 'boolean');
createSetting('BuyArmorUpgrades', 'Buy Armor Upgrades', 'Will buy the most efficient armor upgrade available', 'boolean');
createSetting('BuyWeapons', 'Buy Weapons', 'Will buy the most efficient weapon available', 'boolean');
createSetting('BuyWeaponUpgrades', 'Buy Weapon Upgrades', 'Will buy the most efficient weapon upgrade available', 'boolean');
createSetting('LimitEquipment', 'Limit Equipment', 'Limit levels of equipment bought to 11-prestige level. WARNING: may reduce He/hr performance in many cases.', 'boolean');
createSetting('BuyShieldblock', 'Buy Shield Block', 'Will buy the shield block upgrade. If you are progressing past zone 60, you probably don\'t want this', 'boolean');
createSetting('RunUniqueMaps', 'Run Unique Maps', 'Auto run unique maps', 'boolean');
createSetting('RunMapsWhenStuck', 'Auto Maps', 'Automatically run maps to progress', 'boolean');
createSetting('HireScientists', 'Hire Scientists', 'We are nerds and we like to party', 'boolean');
createSetting('BuildGyms', 'Build Gyms', 'Time for a workout', 'boolean');
createSetting('BuildTributes', 'Build Tributes', 'All praise to the Dragimp', 'boolean');
createSetting('BuildNurseries', 'Build Nurseries', 'I can smell it from the throne', 'boolean');
createSetting('EasyMode', 'Easy Mode', 'Automatically changes settings based on current progress. Just worker ratios right now. WARNING: overrides worker ratio settings.', 'boolean');
createSetting('ManageBreedtimer', 'Manage Breed Timer', 'Automatically manage the breed timer. Picks appropriate timers for various challenges. Delays purchasing potency and nurseries if trying to raise the timer. EFFECTIVELY LOCKS THE BREED TIMER', 'boolean');
createSetting('BreedFire', 'Breed Fire', 'Fire Lumberjacks and Miners to speed up breeding when needed', 'boolean');
createSetting('MaxTox', 'Max Toxicity Stacks', 'Get maximum toxicity stacks before killing the improbability in each zone 60 and above. Generally only recommended for 1 run to maximize bone portal value.', 'boolean');
// createSetting('', '', '', 'boolean');
//Values
createSetting('GeneticistTimer', 'Geneticist Timer', 'Breed time in seconds to shoot for using geneticists. CANNOT CHANGE WITH MANAGE BREED TIMER OPTION ON', 'value', '30');
createSetting('FarmerRatio', 'Farmer Ratio', '', 'value', '1');
createSetting('LumberjackRatio', 'Lumberjack Ratio', '', 'value', '1');
createSetting('MinerRatio', 'Miner Ratio', '', 'value', '1');
createSetting('MaxExplorers', 'Max Explorers', 'Map the planet!!', 'value', '150');
createSetting('MaxTrainers', 'Max Trainers', 'Fist bump me bro', 'value', -1);
createSetting('MaxHut', 'Max Huts', '', 'value', '50');
createSetting('MaxHouse', 'Max House', '', 'value', '50');
createSetting('MaxMansion', 'MaxMansion', '', 'value', '50');
createSetting('MaxHotel', 'Max Hotel', '', 'value', '50');
createSetting('MaxResort', 'Max Resort', '', 'value', '50');
createSetting('MaxGateway', 'Max Gateway', 'WARNING: Not recommended to raise above 25', 'value', '25');
createSetting('MaxWormhole', 'Max Wormhole', 'WARNING: Wormholes cost helium! Values below 0 do nothing.', 'value', '0');
createSetting('MaxCollector', 'Max Collector', '', 'value', '-1');
createSetting('FirstGigastation', 'First Gigastation', 'How many warpstations to buy before your first gigastation', 'value', '20');
createSetting('DeltaGigastation', 'Delta Gigastation', 'How many extra warpstations to buy for each gigastation. Supports fractional values. For example 2.5 will buy +2/+3/+2/+3...', 'value', '2');
createSetting('MaxGym', 'Max Gym', '', 'value', '-1');
createSetting('MaxTribute', 'Max Tribute', '', 'value', '-1');
createSetting('MaxNursery', 'Max Nursery', '', 'value', '-1');
createSetting('VoidMaps', 'Void Maps', 'The zone at which you want all your void maps to be cleared. 0 is off', 'value', '0');
// createSetting('', '', '', 'value', '30');
//Dropdown + context sensitive
createSetting('Prestige', 'Prestige', 'Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Forces equip first mode. Automap must be enabled.', 'dropdown', 'Off', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP']);
createSetting('AutoPortal', 'Auto Portal', 'Automatically portal', 'dropdown', 'Off', ['Off', 'Helium Per Hour', 'Balance', 'Electricity', 'Crushed', 'Nom', 'Toxicity', 'Custom']);
createSetting('HeliumHourChallenge', 'Challenge for Helium per Hour', 'Automatically portal with this challenge when using helium per hour autoportal.', 'dropdown', 'None', ['None', 'Balance', 'Electricity', 'Crushed', 'Nom', 'Toxicity']);
createSetting('CustomAutoPortal', 'Custom Portal', 'Automatically portal after clearing this level', 'value', '20');




function automationMenuInit() {

    var settingBtnSrch = document.getElementsByClassName("btn btn-default");
    for (var i = 0; i < settingBtnSrch.length; i++) {
        if (settingBtnSrch[i].getAttribute("onclick") === "toggleSettingsMenu()")
            settingBtnSrch[i].setAttribute("onclick", "autoPlusSettingsMenu()");
    }
    //create the button Automation button
    var newItem = document.createElement("TD");
    newItem.appendChild(document.createTextNode("Automation"));
    newItem.setAttribute("class", "btn btn-default");
    newItem.setAttribute("onclick", "autoToggle()");
    var settingbarRow = document.getElementById("settingsTable").firstElementChild.firstElementChild;
    settingbarRow.insertBefore(newItem, settingbarRow.childNodes[10]);
    //create automaps button
    var newContainer = document.createElement("DIV");
    newContainer.setAttribute("class", "battleSideBtnContainer");
    newContainer.setAttribute("style", "display: block;");
    newContainer.setAttribute("id", "autoMapBtnContainer");
    var abutton = document.createElement("SPAN");
    abutton.appendChild(document.createTextNode("Auto Maps"));
    abutton.setAttribute("class", "btn fightBtn btn-success");
    abutton.setAttribute("id", "autoMapBtn");
    abutton.setAttribute("onClick", "settingChanged('RunMapsWhenStuck')");
    abutton.setAttribute("onmouseover", 'tooltip(\"Toggle Automapping\", \"customText\", event, \"Toggle automapping on and off.\")');
    abutton.setAttribute("onmouseout", 'tooltip("hide")');
    var fightButtonCol = document.getElementById("battleBtnsColumn");
    newContainer.appendChild(abutton);
    fightButtonCol.appendChild(newContainer);

     //make timer click toggle paused mode
    document.getElementById('portalTimer').setAttribute('onclick', 'toggleSetting(\'pauseGame\')');
    document.getElementById('portalTimer').setAttribute('style', 'cursor: default');


    //create the space to place the automation settings.
    document.getElementById("settingsRow").innerHTML += '<div id="autoSettings" style="display: none;margin-bottom: 2vw;margin-top: 2vw;"></div>';
    //Scripts to be injected. elements can't call tampermonkey scripts for some reason.(assume it's the same for grease)
    var script = document.createElement('script');
    //array to hold the settings. Loading values into them should be done before UI creation.
    var html = "var automationSettings=[0,0,0];\r\n var ranstring=''; //cause I'm dumb \r\n";
    //toggles the display of the settings menu.
    html += "function autoToggle()\r\n {if (game.options.displayed)\r\n toggleSettingsMenu();\r\n if (document.getElementById('graphParent').style.display === 'block')\r\n document.getElementById('graphParent').style.display = 'none';\r\n var item = document.getElementById('autoSettings');\r\n if(item.style.display === 'block')\r\n item.style.display='none';\r\n else item.style.display = 'block'; }\r\n ";
    //overloads the settings menu button to include hiding the auto menu settings.
    html += "function autoPlusSettingsMenu(){\r\n var item = document.getElementById('autoSettings');\r\n if(item.style.display === 'block')\r\n item.style.display='none';\r\n toggleSettingsMenu();}\r\n ";

    script.innerHTML = html;
    //inject the scripts
    document.body.appendChild(script);

}

function createSetting(id, name, description, type, defaultValue, list) {
    var btnParent = document.createElement("DIV");
   // btnParent.setAttribute('class', 'optionContainer');
   btnParent.setAttribute('style', 'display: inline-block; vertical-align: top; margin-left: 1vw; margin-right: 1vw; margin-bottom: 1vw; width: 14.5vw;');
    var btn = document.createElement("DIV");
    btn.id = id;
    if (type == 'boolean') {
        if (autoTrimpSettings[id] === undefined) {
            autoTrimpSettings[id] = {
                id: id,
                name: name,
                description: description,
                type: type,
                enabled: false
            };
        }
        btn.setAttribute('class', 'settingBtn settingBtn' + autoTrimpSettings[id].enabled);
        btn.setAttribute("onclick", 'settingChanged("' + id + '")');
        btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
        btn.setAttribute("onmouseout", 'tooltip("hide")');
        btn.textContent = name;
        btnParent.appendChild(btn)
        document.getElementById("autoSettings").appendChild(btnParent);
    } else if (type == 'value') {
        if (autoTrimpSettings[id] === undefined) {
            autoTrimpSettings[id] = {
                id: id,
                name: name,
                description: description,
                type: type,
                value: defaultValue
            };
        }
        btn.setAttribute('class', 'noselect settingBtn btn-info');
        btn.setAttribute("onclick", 'autoSetValueToolTip("' + id + '", "' + name + '")');
        btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
        btn.setAttribute("onmouseout", 'tooltip("hide")');
        btn.textContent = name;
        btnParent.appendChild(btn)
        document.getElementById("autoSettings").appendChild(btnParent);
    } else if (type == 'dropdown') {
        if (autoTrimpSettings[id] === undefined) {
            autoTrimpSettings[id] = {
                id: id,
                name: name,
                description: description,
                type: type,
                selected: defaultValue,
                list: list
            };
        }
        var btn = document.createElement("select");
        btn.id = id;
        if(game.options.menu.darkTheme.enabled == 2) btn.setAttribute("style", "color: #C8C8C8");
        else btn.setAttribute("style", "color:black");
        btn.setAttribute("class", "settingBtn");
        btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
        btn.setAttribute("onmouseout", 'tooltip("hide")');
        btn.setAttribute("onchange", 'settingChanged("' + id + '")');

        for (var item in list) {
            var option = document.createElement("option");
            option.value = list[item];
            option.text = list[item];
            btn.appendChild(option);
        }
        btn.value = autoTrimpSettings[id].selected;
        btnParent.appendChild(btn)
        document.getElementById("autoSettings").appendChild(btnParent);
    }
}

function settingChanged(id) {
    if (autoTrimpSettings[id].type == 'boolean') {
        autoTrimpSettings[id].enabled = !autoTrimpSettings[id].enabled;
        document.getElementById(id).setAttribute('class', 'settingBtn settingBtn' + autoTrimpSettings[id].enabled);
        updateCustomButtons();
    }
    if (autoTrimpSettings[id].type == 'dropdown') {
    	autoTrimpSettings[id].selected = document.getElementById(id).value;
    }
}




function autoSetValueToolTip(id, text) {
    ranstring = text;
    var elem = document.getElementById("tooltipDiv");
    var tooltipText = 'Type a number below. You can also use shorthand such as 2e5 or 200k. Put -1 for Infinite.';
    tooltipText += '<br/><br/><input id="customNumberBox" style="width: 50%" onkeypress="onKeyPressSetting(event, \'' + id + '\')" value=' + autoTrimpSettings[id].value + '></input>';
    var costText = '<div class="maxCenter"><div class="btn btn-info" onclick="autoSetValue(\'' + id + '\')">Apply</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>';
    game.global.lockTooltip = true;
    elem.style.left = '32.5%';
    elem.style.top = '25%';
    document.getElementById('tipTitle').textContent = 'Value Input';
    document.getElementById('tipText').innerHTML = tooltipText;
    document.getElementById('tipCost').innerHTML = costText;
    elem.style.display = 'block';
    var box = document.getElementById('customNumberBox');
    try {
        box.setSelectionRange(0, box.value.length);
    } catch (e) {
        box.select();
    }
    box.focus();
}

function onKeyPressSetting(event, id) {
    if (event.which == 13 || event.keyCode == 13) {
        autoSetValue(id);
    }
}

function autoSetValue(id) {
    var num = 0;
    unlockTooltip();
    tooltip('hide');
    var numBox = document.getElementById('customNumberBox');
    if (numBox) {
        num = numBox.value.toLowerCase();
        if (num.split('e')[1]) {
            num = num.split('e');
            num = Math.floor(parseFloat(num[0]) * (Math.pow(10, parseInt(num[1]))));
        } else {
            var letters = num.replace(/[^a-z]/gi, '');
            var base = 0;
            if (letters.length) {
                var suffices = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv', 'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tt'];
                for (var x = 0; x < suffices.length; x++) {
                    if (suffices[x].toLowerCase() == letters) {
                        base = x + 1;
                        break;
                    }
                }
                if (base) num = Math.round(parseFloat(num.split(letters)[0]) * Math.pow(1000, base));
            }
            if (!base) num = parseFloat(num);
        }
    } else return;
    var txtNum = (num > -1) ? prettify(num) : 'Infinite';
    autoTrimpSettings[id].value = num;
    document.getElementById(id).textContent = ranstring + ': ' + txtNum;
}

function updateValueFields() {
    for (var setting in autoTrimpSettings) {
        if (autoTrimpSettings[setting].type == 'value') {
            var elem = document.getElementById(autoTrimpSettings[setting].id);
            if (elem != null) elem.textContent = autoTrimpSettings[setting].name + ': ' + ((autoTrimpSettings[setting].value > -1) ? prettify(autoTrimpSettings[setting].value) : 'Infinite');
        }
    }
}

function updateCustomButtons() {
    //automaps button
    
    if (autoTrimpSettings.RunMapsWhenStuck.enabled) document.getElementById("autoMapBtn").setAttribute("class", "btn fightBtn btn-success");
    else document.getElementById("autoMapBtn").setAttribute("class", "btn fightBtn btn-danger");
    //auto portal setting, hide until player has cleared zone 81
    if (game.global.highestLevelCleared >= 80 ) document.getElementById("AutoPortal").style.display = '';
    else document.getElementById("AutoPortal").style.display = 'none';
    //custom auto portal value
    if (autoTrimpSettings.AutoPortal.selected == "Custom") document.getElementById("CustomAutoPortal").style.display = '';
    else document.getElementById("CustomAutoPortal").style.display = 'none';
    //challenge for he/hr setting
    if (autoTrimpSettings.AutoPortal.selected == "Helium Per Hour") document.getElementById("HeliumHourChallenge").style.display = '';
    else document.getElementById("HeliumHourChallenge").style.display = 'none';
    //update dropdown selections
    document.getElementById('Prestige').value = autoTrimpSettings.Prestige.selected;
    document.getElementById('AutoPortal').value = autoTrimpSettings.AutoPortal.selected;
    document.getElementById('HeliumHourChallenge').value = autoTrimpSettings.HeliumHourChallenge.selected;

}


