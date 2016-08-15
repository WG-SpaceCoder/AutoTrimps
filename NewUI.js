if (autoTrimpSettings === undefined) {
    console.log('Huh, autoTrimpSettings was undefined in the UI script...')
    var autoTrimpSettings = new Object();
}


automationMenuInit();

//Booleans//

createSetting('ManualGather', 'Auto Gather/Build', 'Automatically gathers resources (and uses Turkimp on metal). Auto speed-builds your build queue and auto-researches science on demand.', 'boolean');
createSetting('AutoFight', 'Better Auto Fight', 'Will automatically handle fighting. It gives you autofight before you get the Battle upgrade in Zone 1.. .CAUTION: If you autoportal with BetterAutoFight disabled, the game sits there doing nothing until you click FIGHT. (not good for afk) ', 'boolean');
createSetting('AutoStance', 'Auto Stance', 'Automatically swap stances to avoid death.', 'boolean');
createSetting('TrapTrimps', 'Trap Trimps', 'Automatically trap trimps when needed, including building traps.', 'boolean');
createSetting('BuyStorage', 'Buy Storage', 'Will buy storage when resource is almost full(85%). (like AutoStorage, even anticipates Jestimp)', 'boolean');
createSetting('BuyJobs', 'Buy Jobs', 'Buys jobs based on ratios configured below. CAUTION: you cannot manually assign jobs with this. Toggle if you need to.', 'boolean');
createSetting('BuyBuildings', 'Buy Buildings', 'Will buy non storage buildings as soon as they are available', 'boolean');
createSetting('BuyUpgrades', 'Buy Upgrades', 'Autobuy non equipment Upgrades', 'boolean');
createSetting('BuyArmor', 'Buy Armor', 'Auto-Buy/Level-Up the most cost efficient armor available. ', 'boolean');
createSetting('BuyArmorUpgrades', 'Buy Armor Upgrades', '(Prestiges) & Gymystic. Will buy the most efficient armor upgrade available. ', 'boolean');
createSetting('BuyWeapons', 'Buy Weapons', 'Auto-Buy/Level-Up the most cost efficient weapon available. ', 'boolean');
createSetting('BuyWeaponUpgrades', 'Buy Weapon Upgrades', '(Prestiges) Will buy the most efficient weapon upgrade available. ', 'boolean');
createSetting('BuyShieldblock', 'Buy Shield Block', 'Will buy the shield block upgrade. CAUTION: If you are progressing past zone 60, you probably don\'t want this :)', 'boolean');
createSetting('RunMapsWhenStuck', 'Auto Maps', 'Automatically run maps to progress. Very Important.', 'boolean');
createSetting('RunUniqueMaps', 'Run Unique Maps', 'Relies on AutoMaps to choose to run Unique maps. Required for AutoPortal. Also needed for challenges: Electricity, Mapocalypse, Meditate, and Crushed (etc). Needed to auto-run The Wall and Dimension of Anger. ', 'boolean');
createSetting('AutoHeirlooms', 'Auto Heirlooms', 'Automatically evaluate and carry the best heirlooms, and recommend upgrades for equipped items. AutoHeirlooms will only change carried items when the heirlooms window is not open. Carried items will be compared and swapped with the types that are already carried. If a carry spot is empty, it will be filled with the best shield (if available). Evaluation is based ONLY on the following mods (listed in order of priority, high to low): Void Map Drop Chance/Trimp Attack, Crit Chance/Crit Damage, Miner Efficiency/Metal Drop, Gem Drop/Dragimp Efficiency, Farmer/Lumberjack Efficiency. For the purposes of carrying, rarity trumps all of the stat evaluations. Empty mod slots are valued at the average value of the best missing mod.', 'boolean');
createSetting('HireScientists', 'Hire Scientists', 'Enable or disable hiring of scientists. Math: ScientistRatio=(FarmerRatio+LumberjackRatio+MinerRatio)/25 and stops hiring scientists after 250k Farmers.', 'boolean');
createSetting('EasyMode', 'Auto Worker Ratios', 'Automatically changes worker ratios based on current progress. WARNING: overrides worker ratio settings. Settings: 1/1/1 up to 300k trimps, 3/3/5 up to 3mil trimps, then 3/1/4 thereafter.', 'boolean');
createSetting('ManageBreedtimer', 'Manage Breed Timer', 'Automatically manage the breed timer by purchasing Genetecists. Sets ideal anticpation stacks. If not using AutoStance, this will probably be undesirable... Picks appropriate times for various challenges (3.5s,11s,30s). Delays purchasing potency and nurseries if trying to raise the timer. EFFECTIVELY LOCKS THE BREED TIMER', 'boolean');
//
// createSetting('', '', '', 'boolean');
//Values
createSetting('GeneticistTimer', 'Geneticist Timer', 'Breed time in seconds to shoot for using geneticists. Disable with -1 (and Disable ManageBreedTimer) to disable the Hiring/Firing of genetecists (and potency upgrades). CANNOT CHANGE WITH MANAGE BREED TIMER OPTION ON', 'value', '30');
createSetting('FarmerRatio', 'Farmer Ratio', '', 'value', '1');
createSetting('LumberjackRatio', 'Lumberjack Ratio', '', 'value', '1');
createSetting('MinerRatio', 'Miner Ratio', '', 'value', '1');
createSetting('MaxExplorers', 'Max Explorers', 'Map the planet!!', 'value', '150');
createSetting('MaxTrainers', 'Max Trainers', 'Fist bump me bro', 'value', -1);
createSetting('MaxHut', 'Max Huts', '', 'value', '50');
createSetting('MaxHouse', 'Max Houses', '', 'value', '50');
createSetting('MaxMansion', 'Max Mansions', '', 'value', '50');
createSetting('MaxHotel', 'Max Hotels', '', 'value', '50');
createSetting('MaxResort', 'Max Resorts', '', 'value', '50');
createSetting('MaxGateway', 'Max Gateways', 'WARNING: Not recommended to raise above 25', 'value', '25');
createSetting('MaxWormhole', 'Max Wormholes', 'WARNING: Wormholes cost helium! Values below 0 do nothing.', 'value', '0');
createSetting('MaxCollector', 'Max Collectors', '', 'value', '-1');
createSetting('FirstGigastation', 'First Gigastation', 'How many warpstations to buy before your first gigastation', 'value', '20');
createSetting('DeltaGigastation', 'Delta Gigastation', 'How many extra warpstations to buy for each gigastation. Supports fractional values. For example 2.5 will buy +2/+3/+2/+3...', 'value', '2');
createSetting('MaxGym', 'Max Gyms', '', 'value', '-1');
createSetting('MaxTribute', 'Max Tributes', '', 'value', '-1');
createSetting('MaxNursery', 'Max Nurseries', '', 'value', '-1');
createSetting('VoidMaps', 'Void Maps', 'The zone at which you want all your void maps to be cleared. 0 is off', 'value', '0');
// createSetting('', '', '', 'value', '30');
//Dropdown + context sensitive
createSetting('Prestige', 'Prestige', 'Acquire prestiges through the selected item (inclusive) as soon as they are available in maps. Forces equip first mode. Automap must be enabled. THIS IS AN IMPORTANT SETTING related to speed climbing and should probably always be on something. If you find the script getting stuck somewhere, particularly where you should easily be able to kill stuff, setting this to an option lower down in the list will help ensure you are more powerful at all times, but will spend more time acquiring the prestiges in maps.', 'dropdown', 'Polierarm', ['Off', 'Supershield', 'Dagadder', 'Bootboost', 'Megamace', 'Hellishmet', 'Polierarm', 'Pantastic', 'Axeidic', 'Smoldershoulder', 'Greatersword', 'Bestplate', 'Harmbalest', 'GambesOP']);
createSetting('AutoPortal', 'Auto Portal', 'Automatically portal. Will NOT auto-portal if you have a challenge active. ', 'dropdown', 'Off', ['Off', 'Helium Per Hour', 'Balance', 'Electricity', 'Crushed', 'Nom', 'Toxicity', 'Watch', 'Lead', 'Corrupted', 'Custom']);
createSetting('HeliumHourChallenge', 'Challenge for Helium per Hour and Custom', 'Automatically portal with this challenge when using helium per hour or custom autoportal.', 'dropdown', 'None', ['None', 'Balance', 'Electricity', 'Crushed', 'Nom', 'Toxicity', 'Watch', 'Lead', 'Corrupted']);
createSetting('CustomAutoPortal', 'Custom Portal', 'Automatically portal after clearing this level', 'value', '200');

//advanced settings

var advHeader = document.createElement("DIV");
var advBtn = document.createElement("DIV");
advBtn.setAttribute('class', 'btn btn-default');
advBtn.setAttribute('onclick', 'autoToggle(\'advancedSettings\')');
advBtn.innerHTML = 'Advanced Settings';
advBtn.setAttribute("onmouseover", 'tooltip(\"Advanced Settings\", \"customText\", event, \"Leave off unless you know what you\'re doing with them.\")');
advBtn.setAttribute("onmouseout", 'tooltip("hide")');
advBtn.setAttribute('style', 'margin-left: 1vw; margin-right: 1vw; margin-bottom: 1vw; font-size: 0.8vw;');
advBtn.id='advancedSettingsBTN';
advHeader.appendChild(advBtn);

document.getElementById("autoSettings").appendChild(advHeader);
var adv = document.createElement("DIV");
adv.id = 'advancedSettings';
adv.style.display = 'none';
document.getElementById("autoSettings").appendChild(adv);

//advanced settings
createSetting('LimitEquipment', 'Limit Equipment', 'Limit levels of equipment bought to:(level 11 - the prestige level).At or Above Prestige X (10), your equipment will remain at level 1. In other words, does not level equipment after ~level ~51, and only buys Prestiges. CAUTION: may reduce He/hr performance in many cases.', 'boolean', null, null, 'advancedSettings');
createSetting('BreedFire', 'Breed Fire', 'Fire Lumberjacks and Miners to speed up breeding when needed', 'boolean', null, null, 'advancedSettings');
createSetting('MaxTox', 'Max Toxicity Stacks', 'Get maximum toxicity stacks before killing the improbability in each zone 60 and above. Generally only recommended for 1 run to maximize bone portal value. This setting will revert to disabled after a successful Max-Tox run + Toxicity Autoportal.', 'boolean', null, null, 'advancedSettings');
createSetting('RunNewVoids', 'Run New Voids', 'Run new void maps acquired after the set void map zone.', 'boolean', null, null, 'advancedSettings');
createSetting('VoidCheck', 'Void Difficulty Check', 'How many hits to be able to take from a void map boss in dominance stance before we attempt the map. Higher values will get you stronger before attempting. 2 should be fine.', 'value', '2', null, 'advancedSettings');
createSetting('DisableFarm', 'Disable Farming', 'Disables the farming section of the automaps algorithm. This will cause it to always return to the zone upon reaching 10 map stacks.', 'boolean', null, null, 'advancedSettings');

//genBTC advanced settings - Create button.
var genbtcBtn = document.createElement("DIV");
genbtcBtn.setAttribute('class', 'btn btn-default');
genbtcBtn.setAttribute('onclick', 'autoToggle(\'genbtcadvancedSettings\')');
genbtcBtn.innerHTML = 'genBTC Settings';
genbtcBtn.setAttribute("onmouseover", 'tooltip(\"genBTC Settings\", \"customText\", event, \"Leave off unless you know what you\'re doing with them.\")');
genbtcBtn.setAttribute("onmouseout", 'tooltip("hide")');
genbtcBtn.setAttribute('style', 'margin-left: 1vw; margin-right: 1vw; margin-bottom: 1vw; font-size: 0.8vw;');
genbtcBtn.id='genbtcadvancedSettingsBTN';
advHeader.appendChild(genbtcBtn);
//
var genbtcadv = document.createElement("DIV");
genbtcadv.id = 'genbtcadvancedSettings';
genbtcadv.style.display = 'none';
document.getElementById("autoSettings").appendChild(genbtcadv);

//Page 2 - New settings - option buttons.
createSetting('AutoRoboTrimp', 'AutoRoboTrimp', 'Use RoboTrimps ability starting at this level, and every 5 levels thereafter. (set to 0 to disable)', 'value', '0', null, 'genbtcadvancedSettings');
createSetting('AutoGoldenUpgrades', 'AutoGoldenUpgrades', 'Automatically Buy the specified Golden Upgrades as they become available.', 'dropdown', 'Off', ["Off","Helium", "Battle", "Void"], 'genbtcadvancedSettings');
var AGULabel = document.createElement("Label");
AGULabel.id = 'AutoGoldenUpgradesLabel';
AGULabel.innerHTML = "Golden Upgrades:";
AGULabel.setAttribute('style', 'margin-right: 0.4vw; font-size: 0.8vw;');
document.getElementById("AutoGoldenUpgrades").parentNode.insertBefore(AGULabel,document.getElementById("AutoGoldenUpgrades"))
createSetting('WarpstationCap', 'Warpstation Cap', 'Do not level Warpstations past Basewarp+DeltaGiga. Without this, if a Giga wasnt available, it would level infinitely. ', 'boolean', null, null, 'genbtcadvancedSettings');
createSetting('HeliumHrBuffer', 'He/Hr Portal Buffer %', 'When using the He/Hr Autoportal, it will portal if your He/Hr drops by this amount of % lower than your best for current run, default is 0% (ie: set to 5 to portal at 95% of your best)', 'value', '0', null, 'genbtcadvancedSettings');
createSetting('TrainerCaptoTributes', 'Cap Trainers to a % of Tributes', 'Only Buy a Trainer when its cost is LESS than X% of cost of a tribute. This setting can work in combination with the other one, or set the other one to -1 and this will take full control. Default: -1 (Disabled). 50% is close to the point where the cap does nothing. You can go as low as you want but recommended is 10% to 1%. (example: Trainer cost of 5001, Tribute cost of 100000, @ 5%, it would NOT buy the trainer.)', 'value', '-1', null, 'genbtcadvancedSettings');
createSetting('ExitSpireCell', 'Exit Spire After Cell', 'Exits the Spire after completing cell X. example: 40 for Row 4. (0 to disable)', 'value', '0', null, 'genbtcadvancedSettings');

//Manage importexport Settings - Create button.
var importexportBtn = document.createElement("DIV");
importexportBtn.setAttribute('class', 'btn btn-default');
importexportBtn.setAttribute('onclick', 'autoToggle(\'importexportSettings\')');
importexportBtn.innerHTML = 'Import/Export Settings';
importexportBtn.setAttribute("onmouseover", 'tooltip(\"Import/Export Settings\", \"customText\", event, \"Expand the Import/Export/Reset Autotrimps section.\")');
importexportBtn.setAttribute("onmouseout", 'tooltip("hide")');
importexportBtn.setAttribute('style', 'margin-left: 1vw; margin-right: 1vw; margin-bottom: 1vw; font-size: 0.8vw;');
importexportBtn.id='importexportSettingsBTN';
advHeader.appendChild(importexportBtn);
//
var importexportadv = document.createElement("DIV");
importexportadv.id = 'importexportSettings';
importexportadv.style.display = 'none';
document.getElementById("autoSettings").appendChild(importexportadv);
//Manage settings - option buttons - Export/Import/Default
createSetting('ExportAutoTrimps', 'Export AutoTrimps', 'Export your Settings.', 'infoclick', 'ExportAutoTrimps', null, 'importexportSettings');
createSetting('ImportAutoTrimps', 'Import AutoTrimps', 'Import your Settings.', 'infoclick', 'ImportAutoTrimps', null, 'importexportSettings');
createSetting('DefaultAutoTrimps', 'Reset to Default', 'Reset everything to the way it was when you first installed the script.', 'infoclick', 'DefaultAutoTrimps', null, 'importexportSettings');

//Manage Scryer Stance Settings - Create button.
var scryerSettingsBtn = document.createElement("DIV");
scryerSettingsBtn.setAttribute('class', 'btn btn-default');
scryerSettingsBtn.setAttribute('onclick', 'autoToggle(\'scryerSettings\')');
scryerSettingsBtn.innerHTML = 'Scryer Stance Settings';
scryerSettingsBtn.setAttribute("onmouseover", 'tooltip(\"Scryer Stance Settings\", \"customText\", event, \"Expand the Scryer Stance settings section.\")');
scryerSettingsBtn.setAttribute("onmouseout", 'tooltip("hide")');
scryerSettingsBtn.setAttribute('style', 'margin-left: 1vw; margin-right: 1vw; margin-bottom: 1vw; font-size: 0.8vw;');
scryerSettingsBtn.id='scryerSettingsBTN';
advHeader.appendChild(scryerSettingsBtn);
//
var scryerSettingsadv = document.createElement("DIV");
scryerSettingsadv.id = 'scryerSettings';
scryerSettingsadv.style.display = 'none';
document.getElementById("autoSettings").appendChild(scryerSettingsadv);
//Manage settings - option buttons - Scryer settings
createSetting('UseScryerStance', 'Use Scryer Stance', 'Stay in Scryer stance in z181 and above (Overrides Autostance). Falls back to regular Autostance when not in use (so leave that on). Current point is to get Dark Essence. EXPERIMENTAL. This is the Master button. All other buttons have no effect if this one is off.', 'boolean',true,null,'scryerSettings');
createSetting('ScryerUseinMaps', 'Use in Maps', 'Use in Maps.', 'boolean', null,null, 'scryerSettings');
createSetting('ScryerUseinVoidMaps', 'Use in Void Maps', 'Use in Void Maps.', 'boolean', false,null, 'scryerSettings');
createSetting('ScryerUseinSpire', 'Use in Spire(All)', 'Use in Spire (all cells).', 'boolean', false,null, 'scryerSettings');
createSetting('ScryerSkipBossPastVoids', 'Skip Cell 100 above VoidLevel', 'Skips all world Improbabilities/Bosses on cell 100 if you are past the level you have your voidmaps set to run at.', 'boolean', false,null, 'scryerSettings');
createSetting('ScryerSkipCorrupteds', 'Skip Corrupted Cells', 'Skip all corrupted cells unless you can overkill them.', 'boolean', false,null, 'scryerSettings');
//createSetting('ScryerUseinSpireSafes', 'Use in Spire(Safes)', 'Use on Spire cells marked with the safe icons - high loot *50 metal reward.', 'boolean', false,null, 'scryerSettings');
createSetting('ScryerMinZone', 'Min Zone', 'Minimum zone to start using scryer in.(inclusive) rec:(60 or 181)', 'value', '181', null, 'scryerSettings');
createSetting('ScryerMaxZone', 'Max Zone', 'Zone to STOP using scryer at.(not inclusive) Use at your own discretion. rec: (0 or -1 to disable.)', 'value', '-1',null, 'scryerSettings');
createSetting('ScryerUseWhenOverkill', 'Use When Overkill', 'Use pre-181 when we can Overkill in S stance, for double loot with no speed penalty. NOTE: Overrides zone settings.', 'boolean', false,null, 'scryerSettings');

//moved pause-button to be more visible. has its own logic down in createSetting.
createSetting('PauseScript', 'Pause AutoTrimps', 'Pause AutoTrimps (not including the graphs module)', 'boolean', null, null, 'pause');

function loadAutoTrimps() {
    var thestring = document.getElementById("importBox").value.replace(/(\r\n|\n|\r|\s)/gm,"");
    var tmpset = JSON.parse(thestring);
    if (tmpset == null)
        return;
    //should have done more error checking with at least an error message.
    autoTrimpSettings = tmpset;
    checkSettings();
    saveSettings();
    updateValueFields();
    updateCustomButtons();
    for (var setting in autoTrimpSettings) {
        if (autoTrimpSettings[setting].type == 'boolean')
            //refresh boolean buttons.
            document.getElementById(setting).setAttribute('class', 'settingsBtn settingBtn' + autoTrimpSettings[setting].enabled);
    }
}

function AutoTrimpsTooltip(what, isItIn, event) {
	if (game.global.lockTooltip) 
        return;
	var elem = document.getElementById("tooltipDiv");
	swapClass("tooltipExtra", "tooltipExtraNone", elem);
	var ondisplay = null; // if non-null, called after the tooltip is displayed
	var tooltipText;
	var costText = "";
	if (what == "ExportAutoTrimps"){
		tooltipText = "This is your AUTOTRIMPS save string. There are many like it but this one is yours. Save this save somewhere safe so you can save time next time. <br/><br/><textarea id='exportArea' style='width: 100%' rows='5'>" + JSON.stringify(autoTrimpSettings) + "</textarea>";
        costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
		if (document.queryCommandSupported('copy')){
			costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
			ondisplay = function(){
				document.getElementById('exportArea').select();
				document.getElementById('clipBoardBtn').addEventListener('click', function(event) {
				    document.getElementById('exportArea').select();
					  try {
						document.execCommand('copy');
					  } catch (err) {
						document.getElementById('clipBoardBtn').innerHTML = "Error, not copied";
					  }
				});
            };
		}
        else {
            ondisplay = function(){
                document.getElementById('exportArea').select();
            };
		}
		costText += "</div>";
	}
	if (what == "ImportAutoTrimps"){
        //runs the loadAutoTrimps() function.
		tooltipText = "Import your AUTOTRIMPS save string! It'll be fine, I promise.<br/><br/><textarea id='importBox' style='width: 100%' rows='5'></textarea>";
		costText="<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); loadAutoTrimps();'>Import</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		ondisplay = function () {
			document.getElementById('importBox').focus();
        };
    }
    if (what == "DefaultAutoTrimps"){
        localStorage.removeItem('autoTrimpSettings');
        tooltipText = "Please Save your game and reload your browser now, for Autotrimps to reset to defaults.";
    }
    game.global.lockTooltip = true;
    elem.style.left = "33.75%";
    elem.style.top = "25%";
	document.getElementById("tipTitle").innerHTML = what;
	document.getElementById("tipText").innerHTML = tooltipText;
	document.getElementById("tipCost").innerHTML = costText;
	elem.style.display = "block";
	if (ondisplay !== null)
		ondisplay();
}

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
    
    //create automaps status
    newContainer = document.createElement("DIV");
    newContainer.setAttribute("style", "display: block; font-size: 1.1vw; text-align: center; background-color: rgba(0,0,0,0.3);");
    abutton = document.createElement("SPAN");
    abutton.id = 'autoMapStatus';
    newContainer.appendChild(abutton);
    fightButtonCol.appendChild(newContainer);

     //make timer click toggle paused mode
    document.getElementById('portalTimer').setAttribute('onclick', 'toggleSetting(\'pauseGame\')');
    document.getElementById('portalTimer').setAttribute('style', 'cursor: default');


    //create container for settings buttons
    document.getElementById("settingsRow").innerHTML += '<div id="autoSettings" style="display: none;margin-bottom: 2vw;margin-top: 2vw;"></div>';
   //shrink padding for fight buttons to help fit automaps button/status
   	var btns = document.getElementsByClassName("fightBtn");
		for (var x = 0; x < btns.length; x++){
        	btns[x].style.padding = "0.01vw 0.01vw";
		}

}


//toggles the display of the settings menu.
function autoToggle(what){ 
    if(what) {
        whatobj = document.getElementById(what);
        if(whatobj.style.display === 'block'){
            whatobj.style.display = 'none';
            document.getElementById(what+'BTN').style.border = '';
        }
        else {
            whatobj.style.display = 'block';
            document.getElementById(what+'BTN').style.border = '4px solid green';
        }
    }
    else {
        if (game.options.displayed)
            toggleSettingsMenu();
        if (document.getElementById('graphParent').style.display === 'block')
            document.getElementById('graphParent').style.display = 'none';
        var item = document.getElementById('autoSettings');
        if(item.style.display === 'block')
            item.style.display='none';
        else item.style.display = 'block'; 
    }
}

//overloads the settings menu button to include hiding the auto menu settings.
function autoPlusSettingsMenu() {
    var item = document.getElementById('autoSettings');
    if(item.style.display === 'block')
        item.style.display='none';
    item = document.getElementById('graphParent');
    if(item.style.display === 'block')
        item.style.display='none';
    toggleSettingsMenu();
}
    
  
function createSetting(id, name, description, type, defaultValue, list, container) {
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
                enabled: defaultValue ? defaultValue : false
            };
        }
        btn.setAttribute('class', 'settingsBtn settingBtn' + autoTrimpSettings[id].enabled);
        btn.setAttribute("onclick", 'settingChanged("' + id + '")');
        btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
        btn.setAttribute("onmouseout", 'tooltip("hide")');
        btn.textContent = name;
        //special case for Pause button.
        if (container == 'pause'){
            btn.setAttribute('style', 'inline-block');
            btnParent.style.float = 'right';
            btnParent.style.marginBottom = '';
            btnParent.style.marginRight = '2vw';
            btnParent.appendChild(btn);
            advHeader.appendChild(btnParent);
            return;
        }
        btnParent.appendChild(btn);
        if(container) document.getElementById(container).appendChild(btnParent);
        else document.getElementById("autoSettings").appendChild(btnParent);
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
        btn.setAttribute('class', 'noselect settingsBtn btn-info');
        btn.setAttribute("onclick", 'autoSetValueToolTip("' + id + '", "' + name + '")');
        btn.setAttribute("onmouseover", 'tooltip(\"' + name + '\", \"customText\", event, \"' + description + '\")');
        btn.setAttribute("onmouseout", 'tooltip("hide")');
        btn.textContent = name;
        btnParent.appendChild(btn);
        if(container) document.getElementById(container).appendChild(btnParent);
        else document.getElementById("autoSettings").appendChild(btnParent);
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
        btn.setAttribute("class", "settingsBtn");
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
        btnParent.appendChild(btn);
        
        if(container) document.getElementById(container).appendChild(btnParent);
        else document.getElementById("autoSettings").appendChild(btnParent);
    } else if (type == 'infoclick') {
        btn.setAttribute('class', 'btn btn-info');
        btn.setAttribute("onclick", 'AutoTrimpsTooltip(\'' + defaultValue + '\', null, \'update\')');
        btn.setAttribute("style", "display: block; font-size: 0.8vw;");
        btn.textContent = name;
        btnParent.style.width = '';
        btnParent.appendChild(btn);
        if(container) document.getElementById(container).appendChild(btnParent);
        else document.getElementById("autoSettings").appendChild(btnParent);
        return;
    }
    //make sure names/descriptions match what we have stored.
    if (autoTrimpSettings[id].name != name)
        autoTrimpSettings[id].name = name;
    if (autoTrimpSettings[id].description != description)
        autoTrimpSettings[id].description = description;    
}

function settingChanged(id) {
    if (autoTrimpSettings[id].type == 'boolean') {
        autoTrimpSettings[id].enabled = !autoTrimpSettings[id].enabled;
        document.getElementById(id).setAttribute('class', 'settingsBtn settingBtn' + autoTrimpSettings[id].enabled);
        updateCustomButtons();
    }
    if (autoTrimpSettings[id].type == 'dropdown') {
    	autoTrimpSettings[id].selected = document.getElementById(id).value;
    }
    updateCustomButtons();
    saveSettings();
    checkSettings();
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
    saveSettings();
    checkSettings();
}

function updateValueFields() {
    for (var setting in autoTrimpSettings) {
        if (autoTrimpSettings[setting].type == 'value') {
            var elem = document.getElementById(autoTrimpSettings[setting].id);
            if (elem != null) elem.textContent = autoTrimpSettings[setting].name + ': ' + ((autoTrimpSettings[setting].value > -1) ? prettify(autoTrimpSettings[setting].value) : 'Infinite');
        }
    }
    //automaps status
        var status = document.getElementById('autoMapStatus');
    if(!autoTrimpSettings.RunMapsWhenStuck.enabled) status.innerHTML = 'Off';
   else if(needPrestige && !doVoids) status.innerHTML = 'Prestige';
   else if(doVoids && voidCheckPercent == 0) status.innerHTML = 'Void Maps: ' + game.global.totalVoidMaps + ' remaining';
   else if(needToVoid && !doVoids && game.global.totalVoidMaps > 0 && !stackingTox) status.innerHTML = 'Prepping for Voids';
   else if(doVoids && voidCheckPercent > 0) status.innerHTML = 'Farming to do Voids: ' + voidCheckPercent + '%';
   else if(shouldFarm && !doVoids) status.innerHTML = 'Farming';
   else if(stackingTox) status.innerHTML = 'Getting Tox Stacks';
   else if(!enoughDamage) status.innerHTML = 'Want more damage';
   else if (!enoughHealth) status.innerHTML = 'Want more health';
   else if (enoughHealth && enoughDamage) status.innerHTML = 'Advancing';
}

function updateCustomButtons() {
    //automaps button
    
    if (autoTrimpSettings.RunMapsWhenStuck.enabled) document.getElementById("autoMapBtn").setAttribute("class", "btn fightBtn btn-success");
    else document.getElementById("autoMapBtn").setAttribute("class", "btn fightBtn btn-danger");
    //auto portal setting, hide until player has cleared zone 59
    if (game.global.highestLevelCleared >= 59 ) document.getElementById("AutoPortal").style.display = '';
    else document.getElementById("AutoPortal").style.display = 'none';
    //custom auto portal value
    if (autoTrimpSettings.AutoPortal.selected == "Custom") document.getElementById("CustomAutoPortal").style.display = '';
    else document.getElementById("CustomAutoPortal").style.display = 'none';
    //challenge for he/hr setting
    if (autoTrimpSettings.AutoPortal.selected == "Helium Per Hour" || autoTrimpSettings.AutoPortal.selected == "Custom") document.getElementById("HeliumHourChallenge").style.display = '';
    else document.getElementById("HeliumHourChallenge").style.display = 'none';
    
    //update dropdown selections
    document.getElementById('Prestige').value = autoTrimpSettings.Prestige.selected;
    document.getElementById('AutoPortal').value = autoTrimpSettings.AutoPortal.selected;
    document.getElementById('HeliumHourChallenge').value = autoTrimpSettings.HeliumHourChallenge.selected;
    document.getElementById('CustomAutoPortal').value = autoTrimpSettings.CustomAutoPortal.selected;
    document.getElementById('AutoGoldenUpgrades').value = autoTrimpSettings.AutoGoldenUpgrades.selected;
    

}


