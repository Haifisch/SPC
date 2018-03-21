// welcome message spit out to console
function spc_welcome() {
	console.log("[SPC] extension injected!");
    console.log("[SPC] Skinhub Profitability Calculator v1.0.3");
    console.log("[SPC] written by Haifisch (haifisch@hbang.ws)");
    console.log("%c!!! GAMBLE WITH CARE !!!", "color:red;");
    console.log("SPC makes no gaurantee of profit.\nSkinhub is high risk vs high reward just like any other CS:GO skin website.");
    console.log("%c!!! GAMBLE WITH CARE !!!", "color:red;");
}

// calculate ROI
function calc_roi(profit, cost) {
    var net = (profit - cost);
    var roi = (net/cost)*100;
    return Math.round(roi);
}

// export object to json file
function exportToJSON(exportName, exportObj){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}