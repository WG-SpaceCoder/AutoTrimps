var autoTrimpSettings = new Object();

automationMenuInit();
createSetting('BuyStorage', 'Buy Storage', 'Will buy storage when resource is almost full', 'boolean');
createSetting('ManualGather', 'Manual Gather', 'Will automatically gather resources and trap trimps', 'boolean');
createSetting('BuyJobs', 'Buy Jobs', 'Buys jobs based on ratios configured', 'boolean');
createSetting('BuyBuildings', 'Buy Buildings', 'Will buy non storage buildings as soon as they are available', 'boolean');
createSetting('BuyUpgrades', 'Buy Upgrades', 'autobuy non eqipment Upgrades', 'boolean');
createSetting('AutoStance', 'Auto Stance', 'I am the lord of the stance said he', 'boolean');


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
    //auto button toggle. Used for true/false values.
    html += "function autoToggleSetting(index, elem)\r\n { automationSettings[index] = !automationSettings[index];\r\n elem.setAttribute('class','settingBtn settingBtn' + automationSettings[index]); }\r\n";
    //Tool tip for entering values
    html += "function autoSetValueToolTip(index, text)\r\n ";
    html += "{ranstring=text; console.log(text);\r\n var elem = document.getElementById(\"tooltipDiv\");\r\n ";
    html += "var tooltipText = 'Type a number below. You can also use shorthand such as 2e5 or 200k. Put -1 for Infinite.';\r\n ";
    html += "tooltipText += '<br/><br/><input id=\"customNumberBox\" style=\"width: 50%\" value=' + prettify(automationSettings[index]) + '></input>';\r\n ";
    html += "var costText = '<div class=\"maxCenter\"><div class=\"btn btn-info\" onclick=\"autoSetValue('+index+')\">Apply</div><div class=\"btn btn-info\" onclick=\"cancelTooltip()\">Cancel</div></div>';\r\n ";
    html += "game.global.lockTooltip = true;\r\n "; //
    html += "elem.style.left = '32.5%';\r\n ";
    html += " elem.style.top = '25%';\r\n ";
    html += " document.getElementById('tipTitle').textContent = 'Value Input';\r\n ";
    html += " document.getElementById('tipText').innerHTML = tooltipText;\r\n ";
    html += "document.getElementById('tipCost').innerHTML = costText;\r\n ";
    html += " elem.style.display = 'block';\r\n ";
    html += "var box = document.getElementById('customNumberBox');\r\n ";
    html += "try { box.setSelectionRange(0, box.value.length); }\r\n ";
    html += " catch (e) { box.select(); }\r\n ";
    html += "box.focus(); }";
    //what happens when you hit the Apply button in the tool tip above. (another long(er) one. Soz.)

    html += "function autoSetValue(index){ var num = 0; unlockTooltip(); tooltip('hide'); var numBox = document.getElementById('customNumberBox');"; //
    html += "if (numBox){ num = numBox.value.toLowerCase(); if (num.split('e')[1])";
    html += "{ num = num.split('e');     num = Math.floor(parseFloat(num[0]) * (Math.pow(10, parseInt(num[1])))); }";
    html += "else { var letters = num.replace(/[^a-z]/gi, ''); var base = 0;";
    html += "if (letters.length){ var suffices = [ 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv', 'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tt'];";
    html += "for (var x = 0; x < suffices.length; x++){ if (suffices[x].toLowerCase() == letters){ base = x + 1; break; }";
    html += "} if (base) num = Math.round(parseFloat(num.split(letters)[0]) * Math.pow(1000, base));}";
    html += "if (!base) num = parseInt(num);} ";
    html += "} else return;";
    html += "var txtNum = (num>0)?prettify(num):'Infinite'; automationSettings[index] = num; document.getElementById('autoValue' + index).textContent = ranstring+': '+txtNum; }\r\n ";

    //buttons have to call scripts on the page. Those scripts can only access globals on the page as well.
    script.innerHTML = html;
    //inject the scripts
    document.body.appendChild(script);
}

function createSetting(id, name, description, type) {
    if (type == 'boolean') {
        // <div id="toggleautoSave" class="noselect settingBtn settingBtn1" onclick="toggleSetting(&quot;autoSave&quot;, this)" onmouseover="tooltip(&quot;Auto Saving&quot;, &quot;customText&quot;, event, &quot;Automatically save the game once per minute&quot;)" onmouseout="tooltip(&quot;hide&quot;)">Auto Saving</div>
        var btnParent = document.createElement("DIV");
        btnParent.setAttribute('class', 'optionContainer');
        var btn = document.createElement("DIV");
        btn.id = id;
        if (autoTrimpSettings[id] === undefined) {
            console.log('asdfasdfasdf');
            autoTrimpSettings[id] = {id: id, name: name, description: description, type: type, enabled: false};
        }
        btn.setAttribute('class', 'settingBtn settingBtn' + autoTrimpSettings[id].enabled);
        btn.setAttribute("onclick", 'settingChanged("'+id+'")');
        btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
        btn.setAttribute("onmouseout", 'tooltip("hide")');
        btn.textContent = name;
        btnParent.appendChild(btn)
        document.getElementById("autoSettings").appendChild(btnParent);
    }
}

function settingChanged(id) {
    console.log('ID is ' + id);
    if (autoTrimpSettings[id].type == 'boolean') {
        autoTrimpSettings[id].enabled = !autoTrimpSettings[id].enabled;
        document.getElementById(id).setAttribute('class', 'settingBtn settingBtn' + autoTrimpSettings[id].enabled);
    }
}
