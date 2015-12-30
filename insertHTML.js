<div id="autoContainer" style="display: block;">
  <div id="autoTitleDiv" class="titleDiv">
    <div class="row">
      <div class="col-xs-4"><span id="autoTitleSpan" class="titleSpan">Automation</span> </div>
    </div>
  </div>
  <div class="autoBox" id="autoHere"> </div>
  <table style="text-align: left; vertical-align: top; width: 600px;" border="0" cellpadding="0" cellspacing="0">
    <tbody>
      <tr>
        <td style="width: 200px;"> Loops
          <br>
          <input id="chkBuyStorage" title="Will buy storage when resource is almost full" checked="checked" type="checkbox">Buy Storage
          <br>
          <input id="chkManualStorage" title="Will automatically gather resources and trap trimps" checked="checked" type="checkbox">Manual Gather
          <br>
          <input id="chkBuyJobs" title="Buys jobs based on ratios configured" checked="checked" type="checkbox">Buy Jobs
          <br>
          <input id="chkBuyBuilding" title="Will buy non storage buildings as soon as they are available" checked="checked" type="checkbox">Buy Buildings
          <br>
          <input id="chkBuyUpgrades" title="autobuy non eqipment Upgrades" checked="checked" type="checkbox">Autobuy other Upgrades
          <br>
        </td>
        <td style="width: 400px; vertical-align: top;">
          <table style="text-align: left; vertical-align: middle; width: 100%;" border="0" cellpadding="0" cellspacing="0">
            <tbody>
              <tr>
                <td style="width: 120px;">
                  <input id="chkBuyEquipH" title="Will buy the most efficient armor available" checked="checked" type="checkbox">Buy Armor</td>
                <td>
                  <input id="chkBuyPrestigeH" title="Will buy the most efficient armor upgrade available" checked="checked" type="checkbox">Buy Armor Upgrades</td>
              </tr>
              <tr>
                <td>
                  <input id="chkBuyEquipA" title="Will buy the most efficient weapon available" checked="checked" type="checkbox">Buy Weapons</td>
                <td>
                  <input id="chkBuyPrestigeA" title="Will buy the most efficient weapon upgrade available" checked="checked" type="checkbox">Buy Weapon Upgrades</td>
              </tr>
            </tbody>
          </table>
          Maps
          <br>
          <input id="chkAutoUniqueMap" title="Auto run unique maps" checked="checked" type="checkbox">Auto run unique maps
          <br>
          <input id="chkAutoProgressMap" title="Runs maps when cannot defeat current level" checked="checked" type="checkbox">Auto map when stuck
          <br>
          <input id="maxHitsTillStuck" style="width: 10%; color: rgb(0, 0, 0);" value="10">Max hits to kill enemy before stuck
        </td>
      </tr>
      <tr>
        <td style="vertical-align: middle; text-align: left;">
          <br>
        </td>
        <td style="text-align: left; vertical-align: top;"></td>
      </tr>
    </tbody>
  </table>
</div>
