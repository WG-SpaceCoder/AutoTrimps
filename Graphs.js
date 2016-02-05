//Import the Chart Libraries
var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://github.highcharts.com/highcharts.src.js';
head.appendChild(script);

//Create the graph button and div
var newItem = document.createElement("TD");
newItem.appendChild(document.createTextNode("Graphs"));
newItem.setAttribute("class", "btn btn-default");
newItem.setAttribute("onclick", "autoToggleGraph()");
var settingbarRow = document.getElementById("settingsTable").firstElementChild.firstElementChild;
settingbarRow.insertBefore(newItem, settingbarRow.childNodes[10]);
document.getElementById("settingsRow").innerHTML += '<div id="graphParent" style="display: none;"><div id="graph" style="margin-bottom: 2vw;margin-top: 2vw;"></div></div>';

//Create the dropdown for what graph to show
var graphList = ['HeliumPerHour', 'Helium', 'Resources'];
var btn = document.createElement("select");
btn.id = 'graphSelection';
btn.setAttribute("style", "color:black");
btn.setAttribute("class", "settingBtn");
btn.setAttribute("onmouseover", 'tooltip(\"Graph\", \"customText\", event, \"What graph would you like to display you nerd you?\")');
btn.setAttribute("onmouseout", 'tooltip("hide")');
for (var item in graphList) {
    var option = document.createElement("option");
    option.value = graphList[item];
    option.text = graphList[item];
    btn.appendChild(option);
}
document.getElementById('graphParent').appendChild(btn);







function autoToggleGraph() {
    if (game.options.displayed) toggleSettingsMenu();
    if (document.getElementById('autoSettings').style.display === 'block') document.getElementById('autoSettings').style.display = 'none';
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

function setGraph(title, xTitle, yTitle, valueSuffix, series) {
    chart1 = new Highcharts.Chart({
        chart: {
            renderTo: 'graph'
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
    console.log('Pushing Data');
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

    //Test graph for food
    setGraphData(document.getElementById('graphSelection').value);

    // graphData = setColor(graphData);

    setTimeout(gatherInfo, 1000);
}

function setGraphData(graph) {
    var title, xTitle, yTitle, valueSuffix, series;
    var oldData = JSON.stringify(graphData);
    valueSuffix = '';
    switch (graph) {
        case 'Resources':
            var foodData = {
                name: 'Food',
                data: []
            };
            var woodData = {
                name: 'Wood',
                data: []
            };
            var metalData = {
                name: 'Metal',
                data: []
            };
            for (var i in allSaveData) {
                if (allSaveData[i].totalPortals == allSaveData[allSaveData.length - 1].totalPortals) {
                    foodData.data.push(allSaveData[i].resources.food.max);
                    woodData.data.push(allSaveData[i].resources.wood.max);
                    metalData.data.push(allSaveData[i].resources.metal.max);
                }
            }
            graphData = [foodData, woodData, metalData];
            title = 'Max Resources this run';
            xTitle = 'Zone';
            yTitle = 'Resources'
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









var allSaveData = [];
var graphData = [];
var tmpGraphData = JSON.parse(localStorage.getItem('allSaveData'));
if (tmpGraphData !== null) {
    console.log('Got allSaveData. Yay!');
    allSaveData = tmpGraphData;
}


setTimeout(gatherInfo, 1000);
