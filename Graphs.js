//Import the Chart Libraries
var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://code.highcharts.com/highcharts.js';
head.appendChild(script);


//Create the graph button and div
var newItem = document.createElement("TD");
newItem.appendChild(document.createTextNode("Graphs"));
newItem.setAttribute("class", "btn btn-default");
newItem.setAttribute("onclick", "autoToggleGraph(); drawGraph();");
var settingbarRow = document.getElementById("settingsTable").firstElementChild.firstElementChild;
settingbarRow.insertBefore(newItem, settingbarRow.childNodes[10]);
document.getElementById("settingsRow").innerHTML += '<div id="graphParent" style="display: none;"><div id="graph" style="margin-bottom: 2vw;margin-top: 2vw;"></div></div>';

//Create the dropdown for what graph to show
var graphList = ['HeliumPerHour', 'Helium', 'Clear Time'];
var btn = document.createElement("select");
btn.id = 'graphSelection';
if(game.options.menu.darkTheme.enabled == 2) btn.setAttribute("style", "color: #C8C8C8");
else btn.setAttribute("style", "color:black");
btn.setAttribute("class", "settingBtn");
btn.setAttribute("onmouseover", 'tooltip(\"Graph\", \"customText\", event, \"What graph would you like to display you nerd you?\")');
btn.setAttribute("onmouseout", 'tooltip("hide")');
btn.setAttribute("onchange", "setGraphData(document.getElementById('graphSelection').value)");
for (var item in graphList) {
    var option = document.createElement("option");
    option.value = graphList[item];
    option.text = graphList[item];
    btn.appendChild(option);
}
document.getElementById('graphParent').appendChild(btn);

//refresh graph button - probably don't need different variables but I don't know what I'm doing!
var btn1 = document.createElement("button");
var u = document.createTextNode("Refresh");
btn1.appendChild(u);
btn1.setAttribute("onclick", "drawGraph()");
btn1.setAttribute("class", "settingBtn");
if(game.options.menu.darkTheme.enabled != 2) btn1.setAttribute("style", "color:black");
document.getElementById('graphParent').appendChild(btn1);

//clear data button
var btn2 = document.createElement("button");
var t = document.createTextNode("Clear All Data");
btn2.appendChild(t);
btn2.setAttribute("onclick", "clearData(); drawGraph();");
btn2.setAttribute("class", "settingBtn");
if(game.options.menu.darkTheme.enabled != 2) btn2.setAttribute("style", "color:black");
document.getElementById('graphParent').appendChild(btn2);

var tips = document.createElement('div');
tips.innerHTML = 'Tips: You can zoom by dragging a box around an area. You can turn series off by clicking them on the legend.';
document.getElementById('graphParent').appendChild(tips);

    var heHour = document.createElement("SPAN");
    heHour.setAttribute("class", "ownedArea");
    heHour.setAttribute("style", "display: block; opacity: 1; color:white;");
    heHour.setAttribute("id", "customHeHour");
    gameHe = document.getElementById('helium');
    gameHe.appendChild(heHour);


function clearData() {
    while(allSaveData[0].totalPortals < game.global.totalPortals) allSaveData.shift();
}


function autoToggleGraph() {
    if (game.options.displayed) toggleSettingsMenu();
    var aset = document.getElementById('autoSettings');
    if (aset) {
        if (aset.style.display === 'block') aset.style.display = 'none';
    }
    var item = document.getElementById('graphParent');
    if (item.style.display === 'block') item.style.display = 'none';
    else {
        item.style.display = 'block';
        setGraph();
    }
}

function autoPlusGraphMenu() {
    var item = document.getElementById('graphParent');
    if (item.style.display === 'block') item.style.display = 'none';
    toggleSettingsMenu();
}
var chart1;
function setGraph(title, xTitle, yTitle, valueSuffix, series) {
    chart1 = new Highcharts.Chart({
        chart: {
            renderTo: 'graph',
            zoomType: 'xy'
        },
        title: {
            text: title,
            x: -20 //center
        },
        plotOptions: {
            series: {
                lineWidth: 1,
                animation: false,
                marker: {
                    enabled: false
                }
            }
        },
        xAxis: {
            floor: 1,
            title: {
                text: xTitle
            },
        },
        yAxis: {
            title: {
                text: yTitle
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: valueSuffix
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: series
    });
}

function setColor(tmp) {
    for (var i in tmp) {
        if (i == tmp.length - 1) {
            tmp[i].color = '#FF0000' //Current run is in red
        } else {
            tmp[i].color = '#90C3D4' //Old runs are in blue
        }
    }
    return tmp;
}

function pushData() {
    console.log('Starting Zone ' + game.global.world);
    allSaveData.push({
        totalPortals: game.global.totalPortals,
        heliumOwned: game.resources.helium.owned,
        currentTime: new Date().getTime(),
        portalTime: game.global.portalTime,
        resources: game.resources,
        world: game.global.world
    });
    localStorage.setItem('allSaveData', JSON.stringify(allSaveData));
}


function gatherInfo() {
    if (allSaveData === null) {
        allSaveData = [];
    }

    if (allSaveData.length === 0) {
        pushData();
    } else if (allSaveData[allSaveData.length - 1].world != game.global.world) {
        pushData();
    }


    // graphData = setColor(graphData);


}

function drawGraph() {
        setGraphData(document.getElementById('graphSelection').value);
}

function setGraphData(graph) {
    var title, xTitle, yTitle, valueSuffix, series;
    var oldData = JSON.stringify(graphData);
    valueSuffix = '';
    switch (graph) {
        case 'Clear Time':
            var graphData = [];
            var currentPortal = -1;
            var currentZone = -1;
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals != currentPortal) {
                    graphData.push({
                        name: 'Portal number ' + allSaveData[i].totalPortals,
                        data: []
                    })
                    currentPortal = allSaveData[i].totalPortals;
                    //push a 0 to index 0 so that clear times line up with x-axis numbers
                    graphData[graphData.length -1].data.push(0);
                }
                if(currentZone < allSaveData[i].world && currentZone != -1) {
                    graphData[graphData.length - 1].data.push(Math.round((allSaveData[i].currentTime - allSaveData[i-1].currentTime) / 1000));
                }
                
                //first time through, push 0s to zones we don't have data for. Probably only occurs if script is loaded in the middle of a run where it was previously not loaded (haven't tested this)
                //this functionality could fix some of the weirdness in graphs from using bone portal?
                if(currentZone == -1) {
                    var loop = allSaveData[i].world - 1;
                    while (loop > 0) {
                        graphData[graphData.length -1].data.push(0);
                        loop--;
                    }
                }
                currentZone = allSaveData[i].world;

            }
            title = 'Time to clear zone';
            xTitle = 'Zone';
            yTitle = 'Clear Time'
            break;
        case 'Helium':
            var currentPortal = -1;
            graphData = [];
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals != currentPortal) {
                    graphData.push({
                        name: 'Portal number ' + allSaveData[i].totalPortals,
                        data: []
                    })
                    currentPortal = allSaveData[i].totalPortals;
                }
                graphData[graphData.length - 1].data.push(allSaveData[i].heliumOwned);
            }
            title = 'Helium';
            xTitle = 'Zone';
            yTitle = 'Helium'
            break;
        case 'HeliumPerHour':
            var currentPortal = -1;
            graphData = [];
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals != currentPortal) {
                    graphData.push({
                        name: 'Portal number ' + allSaveData[i].totalPortals,
                        data: []
                    })
                    currentPortal = allSaveData[i].totalPortals;
                }
                graphData[graphData.length - 1].data.push(Math.floor(allSaveData[i].heliumOwned / ((allSaveData[i].currentTime - allSaveData[i].portalTime) / 3600000)));
            }
            title = 'Helium/Hour';
            xTitle = 'Zone';
            yTitle = 'Helium'
            break;
    }
    if (oldData != JSON.stringify(graphData)) {
        setGraph(title, xTitle, yTitle, valueSuffix, graphData);
    }
}


function updateCustomStats() {
    var timeThisPortal = new Date().getTime() - game.global.portalTime;
    timeThisPortal /= 3600000;
    var resToUse = game.resources.helium.owned;
    var heHr = prettify(Math.floor(game.resources.helium.owned / timeThisPortal));
    document.getElementById('customHeHour').innerHTML = heHr + "/Hr";
}






var allSaveData = [];
var graphData = [];
var tmpGraphData = JSON.parse(localStorage.getItem('allSaveData'));
if (tmpGraphData !== null) {
    console.log('Got allSaveData. Yay!');
    allSaveData = tmpGraphData;
}


setInterval(gatherInfo, 1000);
setInterval(updateCustomStats, 1000);
