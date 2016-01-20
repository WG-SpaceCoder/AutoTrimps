var newItem = document.createElement("TD");
newItem.appendChild(document.createTextNode("Graphs"));
newItem.setAttribute("class", "btn btn-default");
newItem.setAttribute("onclick", "autoToggleGraph()");
var settingbarRow = document.getElementById("settingsTable").firstElementChild.firstElementChild;
settingbarRow.insertBefore(newItem, settingbarRow.childNodes[10]);
document.getElementById("settingsRow").innerHTML += '<div id="graph" style="display: none;margin-bottom: 2vw;margin-top: 2vw;"></div>';

var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://code.highcharts.com/highcharts.js';
head.appendChild(script);
script.src = 'https://code.highcharts.com/modules/exporting.js';
head.appendChild(script);


function autoToggleGraph() {
    if (game.options.displayed) toggleSettingsMenu();
    var item = document.getElementById('graph');
    if (item.style.display === 'block') item.style.display = 'none';
    else {
        item.style.display = 'block';
        setGraph();
    }
}

function autoPlusGraphMenu() {
    var item = document.getElementById('graph');
    if (item.style.display === 'block') item.style.display = 'none';
    toggleSettingsMenu();
}

function setGraph() {
    chart1 = new Highcharts.Chart({
        chart: {
            renderTo: 'graph'
        },
        title: {
            text: 'Helium per Hour',
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
                text: 'Zone'
            },
        },
        yAxis: {
            title: {
                text: 'Helium/Hour'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: ' Helium/Hour'
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        series: graphData,
        loading: {
            showDuration: 0
        }
    });
}

function setColor(tmp) {
	for (var i in tmp) {
		if (i == tmp.length-1) {
			tmp[i].color = '#FF0000' //Current run is in red
		} else {
			tmp[i].color = '#90C3D4' //Old runs are in blue
		}
	}
	return tmp;
}

function addNewWorldToData() {
    var tmpData = [];
    var timeThisPortal = new Date().getTime() - game.global.portalTime;
    timeThisPortal /= 3600000;

    for (var i = 0; i <= game.global.world; i++) {
        if (i == game.global.world) {
            tmpData.push(Math.floor(game.resources.helium.owned / timeThisPortal));
        } else {
            tmpData.push(0);
        }
    }
    graphData.push({
        name: ('world ' + game.global.totalPortals),
        data: tmpData
    });
}

function gatherInfo() {
    var oldData = JSON.stringify(graphData);
    var timeThisPortal = new Date().getTime() - game.global.portalTime;
    timeThisPortal /= 3600000;

    if (graphData === null) {
    	graphData = [];
    }

    if (graphData.length === 0) {
        addNewWorldToData();
    } else if (graphData[graphData.length - 1].name != ('world ' + game.global.totalPortals)) {
        addNewWorldToData();
    } else if (currentZone != game.global.world) {
        graphData[graphData.length - 1].data.push(Math.floor(game.resources.helium.owned / timeThisPortal));
        currentZone = game.global.world;
    }

    if (oldData != JSON.stringify(graphData)) {
        setGraph();
    }

    graphData = setColor(graphData);
    localStorage.setItem('graphData', JSON.stringify(graphData));
    setTimeout(gatherInfo, 1000);
}









var worldZones = [];
while (worldZones.length < 100) {
    worldZones.push(worldZones.length);
}
var graphData = [];
var tmpGraphData = JSON.parse(localStorage.getItem('graphData'));
if (tmpGraphData !== null) {
	console.log('got graphData yay');
    graphData = tmpGraphData;
}
var currentZone = game.global.world;

setTimeout(gatherInfo, 1000);
