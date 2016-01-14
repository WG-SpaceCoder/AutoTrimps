if (autoTrimpSettings === undefined) {
    var autoTrimpSettings = new Object();
}

automationMenuInit();

//Booleans
createSetting('BuyStorage', 'Buy Storage', 'Will buy storage when resource is almost full', 'boolean');
createSetting('ManualGather', 'Manual Gather', 'Will automatically gather resources and trap trimps', 'boolean');
createSetting('BuyJobs', 'Buy Jobs', 'Buys jobs based on ratios configured', 'boolean');
createSetting('BuyBuildings', 'Buy Buildings', 'Will buy non storage buildings as soon as they are available', 'boolean');
createSetting('BuyUpgrades', 'Buy Upgrades', 'autobuy non eqipment Upgrades', 'boolean');
createSetting('AutoStance', 'Auto Stance', 'I am the lord of the stance said he', 'boolean');
createSetting('BuyArmor', 'Buy Armor', 'Will buy the most efficient armor available', 'boolean');
createSetting('BuyArmorUpgrades', 'Buy Armor Upgrades', 'Will buy the most efficient armor upgrade available', 'boolean');
createSetting('BuyWeapons', 'Buy Weapons', 'Will buy the most efficient weapon available', 'boolean');
createSetting('BuyWeaponUpgrades', 'Buy Weapon Upgrades', 'Will buy the most efficient weapon upgrade available', 'boolean');
createSetting('RunUniqueMaps', 'Run Unique Maps', 'Auto run unique maps', 'boolean');
createSetting('RunMapsWhenStuck', 'Run Maps When Stuck', 'Functionality has changed and needs a new description :D', 'boolean');
createSetting('HireScientists', 'Hire Scientists', 'We are nerds and we like to party', 'boolean');
createSetting('HireTrainers', 'Hire Trainers', 'Fist bump me bro', 'boolean');
createSetting('HireExplorers', 'Hire Explorers', 'Map the planet!!', 'boolean');
createSetting('BuildGyms', 'Build Gyms', 'Time for a workout', 'boolean');
createSetting('BuildTributes', 'Build Tributes', 'All praise to the Dragimp', 'boolean');
createSetting('BuildNurseries', 'Build Nurseries', 'I can smell it from the throne', 'boolean');
// createSetting('', '', '', 'boolean');
//Values
createSetting('GeneticistTimer', 'Geneticist Timer', 'Breed time in seconds to shoot for using geneticists', 'value', '30');
createSetting('FarmerRatio', 'Farmer Ratio', '', 'value', '1');
createSetting('LumberjackRatio', 'Lumberjack Ratio', '', 'value', '1');
createSetting('MinerRatio', 'Miner Ratio', '', 'value', '1');
createSetting('MaxHuts', 'Max Huts', '', 'value', '200');
// createSetting('', '', '', 'value', '30');


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
    //create the space to place the automation settings.
    document.getElementById("settingsRow").innerHTML += '<div id="autoSettings" style="display: none;margin-bottom: 2vw;margin-top: 2vw;"></div>';
    //Scripts to be injected. elements can't call tampermonkey scripts for some reason.(assume it's the same for grease)
    var script = document.createElement('script');
    //array to hold the settings. Loading values into them should be done before UI creation.
    var html = "var automationSettings=[0,0,0];\r\n var ranstring=''; //cause I'm dumb \r\n";
    //toggles the display of the settings menu.
    html += "function autoToggle()\r\n {if (game.options.displayed)\r\n toggleSettingsMenu();\r\n var item = document.getElementById('autoSettings');\r\n if(item.style.display === 'block')\r\n item.style.display='none';\r\n else item.style.display = 'block'; }\r\n ";
    //overloads the settings menu button to include hiding the auto menu settings.
    html += "function autoPlusSettingsMenu(){\r\n var item = document.getElementById('autoSettings');\r\n if(item.style.display === 'block')\r\n item.style.display='none';\r\n toggleSettingsMenu();}\r\n ";

    script.innerHTML = html;
    //inject the scripts
    document.body.appendChild(script);
}

function createSetting(id, name, description, type, defaultValue) {
    if (type == 'boolean') {
        // <div id="toggleautoSave" class="noselect settingBtn settingBtn1" onclick="toggleSetting(&quot;autoSave&quot;, this)" onmouseover="tooltip(&quot;Auto Saving&quot;, &quot;customText&quot;, event, &quot;Automatically save the game once per minute&quot;)" onmouseout="tooltip(&quot;hide&quot;)">Auto Saving</div>
        var btnParent = document.createElement("DIV");
        btnParent.setAttribute('class', 'optionContainer');
        var btn = document.createElement("DIV");
        btn.id = id;
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
        var btnParent = document.createElement("DIV");
        btnParent.setAttribute('class', 'optionContainer');
        var btn = document.createElement("DIV");
        btn.id = id;
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
    }
}

function settingChanged(id) {
    if (autoTrimpSettings[id].type == 'boolean') {
        autoTrimpSettings[id].enabled = !autoTrimpSettings[id].enabled;
        document.getElementById(id).setAttribute('class', 'settingBtn settingBtn' + autoTrimpSettings[id].enabled);
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
            if (!base) num = parseInt(num);
        }
    } else return;
    var txtNum = (num > 0) ? prettify(num) : 'Infinite';
    autoTrimpSettings[id].value = num;
    document.getElementById(id).textContent = ranstring + ': ' + txtNum;
}
