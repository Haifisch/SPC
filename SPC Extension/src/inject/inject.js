/* 
 *  Name: Skinhub Profitability Calculator (SPC)
 *  Author: Dylan "Haifisch" Laws 
 *  Description: Use this on Skinhub.com to calculate the profitability of cases using the "free test spin" 
 */

var gCaseName = "";
var gCaseImage = "";
var gCasePrice = 0.0;
var gTheoreticalSpent = 0.0;
var gTheoreticalProfit = 0.0;
var gRunTarget = 0;
var gRunCount = 0;
var gRunCountTotal = 0;
var gToggle = false;
var gSPCRating = 0;
var gTotalWin = 0;
var gTotalLoss = 0;
var gSPCIsRunning = false;
var gSPCMajorWins = 0;
var gSPCMinorWins = 0;
var gSPCLostRounds = 0;

// csv exportable dataholders for science
var dCaseNumber = 0;
var bigdata = [];

// im too lazy to write this, https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side 
function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function exportToJSON(exportName, exportObj){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
// sets the cases to open per test spin to the max available
function set_max_open() {
    var selector = document.getElementsByClassName("ember-view number-selector visible")[0];
    var subsel = selector.children[1];
    var list = subsel.children[0];
    var maxsel = list.children[4];
    maxsel.children[0].click()
}

// calculates the won ammount for a run
var won_sum = 0; 
function get_won_ammount() {
    var total = 0.0;
    var winnings = document.getElementsByClassName("ember-view winning-info-overlay")
    var didWin = false;
    var caseWon = 0;
    var temp;
    for (var i = 5 - 1; i >= 0; i--) {
        temp = winnings[i].children[0].children[0].innerText;
        total += Number(temp.replace(/[^0-9\.-]+/g,""));
        caseWon = Number(temp.replace(/[^0-9\.-]+/g,""));
        if (caseWon > gCasePrice) { didWin = true; } else { didWin = false; }
        dCaseNumber++;
        won_sum += Number(temp.replace(/[^0-9\.-]+/g,""))
        bigdata.push([dCaseNumber, gCasePrice*dCaseNumber, won_sum, didWin ? "1":"0"]);
    }
    return total;
}

// pulls the case price 
function get_case_price() {
    var sidebar = document.getElementsByClassName("ember-view case-sidebar")[0]; // grab the sidebar
    var caseDiv = sidebar.children[0];
    var content = caseDiv.getElementsByClassName("content");
    var price = content[0].getElementsByClassName("price")[0].children[0].innerHTML;
    gCasePrice = Number(price.replace(/[^0-9\.-]+/g,""));
    console.log("[SPC] case price = " + gCasePrice);
    return gCasePrice;
}

// pull the case name out
function get_case_name() {
    var casenameHolder = document.getElementsByClassName("ember-view normal-case");
    gCaseImage = casenameHolder[0].getElementsByTagName("img")[0].src;
    return casenameHolder[0].getElementsByClassName("title")[0].innerHTML;
}

// calculate ROI
function calc_roi(profit, cost) {
    var net = (profit - cost);
    var roi = (net/cost)*100;
    return Math.round(roi);
}

// calculate win rate 
function calc_winrate() {
    var t = (gTotalWin + gTotalLoss);
    return ((gTotalWin / t)*100).toFixed(0);
}
// result alert
function translated_result(score) {
    var profitable = "";
    if (score >= 10){
        profitable = "godtier"
    }else if (score >= 5) { // 5 or more
        profitable = "excellent";
    } else if (score < 5 && score > 0) { // 1 thru 4
        profitable = "good";
    } else if (score == 0) { // 0
        profitable = "fair"
    } else if (score > -5 && score < 0) { // (-1) thru (-4)
        profitable = "poor";
    } else if (score <= -5 && score >= -14) { // -5 or less
        profitable = "very poor";
    } else if (score <= -14) {
        profitable = "absolute trash";
    }
    return profitable;
}

// export to csv from button
function doExportCSV() {
    if (bigdata.length > 2) {
        var d = new Date();
        exportToCsv(gCaseName.toLowerCase().replace(/ /g,"_")+"_spc_data_"+d.getTime()+".csv", bigdata);
    } else {
        console.log("[SPC] not enough data to export!");
    }
}
// export to json from button
function doExportJSON() {
    if (bigdata.length > 2) {
        var d = new Date();
        exportToJSON(gCaseName.toLowerCase().replace(/ /g,"_")+"_spc_data_"+d.getTime()+".json", bigdata);
    } else {
        console.log("[SPC] not enough data to export!");
    }
}

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + " minutes " + (seconds < 10 ? '0' : '') + seconds + " seconds";
}

// console out round result
function print_round(won, spent, didWin) {
    console.log("[================================]");
    if (!didWin) { console.log("[SPC]%c lost round!","color:red;"); gTotalLoss++; }
    if (didWin) { console.log("[SPC]%c won round!","color:green;"); gTotalWin++; }
    console.log("[SPC] round cost == $" + spent.toFixed(2));
    console.log("[SPC] round won == $" + won.toFixed(2));
    if (won > spent) {
        console.log("[SPC] profit == %c$"+(won-spent).toFixed(2),"color:green;")
    } else {
        console.log("[SPC] loss == %c$"+(spent-won).toFixed(2),"color:red;")
    }
    var roi = calc_roi(won, spent);
    if (roi < 0) { 
        console.log("[SPC] round ROI == %c"+roi+"%", "color:red;");
    } else {
        console.log("[SPC] round ROI == %c"+roi+"%", "color:green;");
    }
    console.log("[SPC] Wins == %c"+gTotalWin+"%c Losses == %c"+gTotalLoss+"%c ("+calc_winrate()+"%)", "color:green;", "color:black;", "color:red;", "color:black;");
    console.log("[SPC] Major wins == "+gSPCMajorWins);
    console.log("[SPC] Minor wins == "+gSPCMinorWins);
    // print rating
    if (gSPCRating < 0) { 
        console.log("[SPC] ongoing case rating == %c" + gSPCRating, "color:red;"); 
    } else {
        console.log("[SPC] ongoing case rating == %c" + gSPCRating, "color:green;");
    }
    console.log("[================================]");
}

function sync_lifetime_stats() {
    // sync lifetime opened
    chrome.storage.sync.get('SPC_LIFETIME_OPENED', function(items) {
        var lifetime = 0;
        if (items['SPC_LIFETIME_OPENED'] != undefined) { lifetime = items['SPC_LIFETIME_OPENED']; }
        lifetime += (gRunCountTotal*5);
        chrome.storage.sync.set({'SPC_LIFETIME_OPENED':lifetime}, function() {
            console.log("[SPC] Lifetime opened "+lifetime.toFixed(2));
        });
    });
    // sync lifetime spent
    chrome.storage.sync.get('SPC_LIFETIME_SPENT', function(items) {
        var lifetime = 0;
        if (items['SPC_LIFETIME_SPENT'] != undefined) { lifetime = items['SPC_LIFETIME_SPENT']; }
        lifetime += gTheoreticalSpent;
        chrome.storage.sync.set({'SPC_LIFETIME_SPENT':lifetime}, function() {
            console.log("[SPC] Lifetime spent "+lifetime.toFixed(2));
        });
    });
     // sync lifetime profit
    chrome.storage.sync.get('SPC_LIFETIME_PROFIT', function(items) {
        var lifetime = 0;
        if (items['SPC_LIFETIME_PROFIT'] != undefined) { lifetime = items['SPC_LIFETIME_PROFIT']; }
        lifetime += gTheoreticalProfit;
        chrome.storage.sync.set({'SPC_LIFETIME_PROFIT':lifetime}, function() {
            console.log("[SPC] Lifetime profit "+lifetime.toFixed(2));
        });
    });
}

// run test spin
var start = null;
var end = null;
function run_spins() {
    if (gRunCount == 0) { // presumption is first run
        console.log("[--------------[SPC TESTING "+(gRunTarget*5)+" CASES]--------------]"); 
        start = window.performance.now(); 
        gSPCIsRunning = true; 
    }
    console.log("[SPC] %crunning test spin "+(gRunCount+1)+"/"+gRunTarget, "color:blue;");
    set_max_open();
    var theoSpentLabel = document.getElementsByClassName("theospent")[0];
    var theoProfitLabel = document.getElementsByClassName("theoprofit")[0];
    var casesOpened = document.getElementsByClassName("casecounter")[0];
    var counter = document.getElementsByClassName("runcounter")[0];
    var winrate = document.getElementsByClassName("winrate")[0];
    var roi = document.getElementsByClassName("roicalc")[0];
    var tdiv = document.getElementsByClassName("ember-view free-spin visible")[0];
    var result = document.getElementsByClassName("profitresult")[0];
    var majorWinsLbl = document.getElementsByClassName("majorWinsResult")[0];
    var minorWinsLbl = document.getElementsByClassName("minorWinsResult")[0];
    var spent = (gCasePrice*5);
    /*  
        this gets convoluted from here. 
        we trigger the test spin then we stall for time waiting for the roll animation to finish up.
        once the animation stops (for 5x cases its ~9 seconds, 10x cases or more are way too glitchy to predict) we can scan for our profit values
        once we take into account our theo. profit we loop back into this function 
    */
    tdiv.children[0].click()
    gTheoreticalSpent += spent;
    theoSpentLabel.innerHTML = "theo. spent &#9871; $" + gTheoreticalSpent.toFixed(2);
    counter.innerHTML = "test spin #" + (gRunCountTotal + (gRunCount+1));

    setTimeout(function () {
        var won = get_won_ammount(); // collect our profit 
        var didWin = false; // optimistic 
        gTheoreticalProfit += won;
        // calc our round roi
        var calc = calc_roi(won, spent);
        if (won >= (spent*2)) {
            console.log("[SPC] Major win!");
            gSPCRating++;
            gSPCRating++;
            gSPCMajorWins++;
            didWin = true;
        } else if (won >= spent) { // if the spent ammount is less than won, add 1 to the ongoing rating
            console.log("[SPC] Minor win!");
            gSPCRating++;
            gSPCMinorWins++;
            didWin = true;
        } else  if (won < spent) { // if the spent ammount is greater than won, subtract 1 from the ongoing rating
            gSPCRating--;
            gSPCLostRounds++;
            didWin = false;
        }
        majorWinsLbl.innerHTML = "Major Wins &#9871; "+gSPCMajorWins;
        minorWinsLbl.innerHTML = "Wins &#9871; "+gSPCMinorWins+" / Losses &#9871; "+gSPCLostRounds;

        // spit out some info to console
        print_round(won, spent, didWin);
        // calc our roi total
        calc = calc_roi(gTheoreticalProfit, gTheoreticalSpent);
        if (calc < 0) {
            roi.style.color = "#e74c3c";
        } else if (calc > 0) {
            roi.style.color = "#2ecc71";
        }
        if (gSPCRating >= 0) {
            result.style.color = "#2ecc71";
        } else if (gSPCRating < 0) {
            result.style.color = "#e74c3c";
        }
        // set labels
        theoProfitLabel.innerHTML = "theo. profit &#9871; $" + gTheoreticalProfit.toFixed(2);
        casesOpened.innerHTML = "cases rolled &#9871; " + ((gRunCountTotal + (gRunCount+1)) * 5);
        roi.innerHTML = "ROI &#9871; " + calc + "%";
        var rate = calc_winrate();
        if (rate >= 50) {
            winrate.style.color = "#2ecc71";
        } else if (rate < 50) {
            winrate.style.color = "#e74c3c";
        }
        winrate.innerHTML = "Win rate &#9871; "+rate+"%";
        result.innerHTML = "Rating &#9871; " + translated_result(gSPCRating);
        gRunCount++;
        // finalize
        setTimeout(function () { // check our run count and spin again if needed, else stop and branch to result routine
            if (gRunCount < gRunTarget) { run_spins(); } else { 
                end = window.performance.now();
                var time = end - start;
                console.log("[SPC] runtime == "+millisToMinutesAndSeconds(time));
                gSPCRating = 0;
                gRunCountTotal += gRunCount; 
                gRunCount = 0; 
                gSPCIsRunning = false;
                sync_lifetime_stats();
                console.log("[------------------[SPC FINISHED]------------------]");
            }
        }, 1000);
    }, 9000);
}

// test 5 cases
function run_5() {
    if (gSPCIsRunning) { console.log("[SPC] %calready running tests!", "color:red;"); return; }
    gRunTarget = 1;
    run_spins();
}

// test 10 cases
function run_10() {
    if (gSPCIsRunning) { console.log("[SPC] %calready running tests!", "color:red;"); return; }
    gRunTarget = 2; 
    run_spins();
}

// test 25 cases
function run_25() {
    if (gSPCIsRunning) { console.log("[SPC] %calready running tests!", "color:red;"); return; }
    gRunTarget = 5; 
    run_spins();
}

// test 50 cases
function run_50() {
    if (gSPCIsRunning) { console.log("[SPC] %calready running tests!", "color:red;"); return; }
    gRunTarget = 10; 
    run_spins();
}

// test 100 cases
function run_100() {
    if (gSPCIsRunning) { console.log("[SPC] %calready running tests!", "color:red;"); return; }
    gRunTarget = 20; 
    run_spins();
}

// test 1000 cases (not in UI yet)
function run_1000() {
    if (gSPCIsRunning) { console.log("[SPC] %calready running tests!", "color:red;"); return; }
    gRunTarget = 200; 
    run_spins();
}

// setup our UI sidebar 
function setup_sidebar() {
    var sidebar = document.getElementsByClassName("ember-view case-sidebar")[0]; // grab the sidebar
    sidebar.id = "case-sidebar";
    // remove the name bonus div to free up some vertical space
    var bonusDiv = document.getElementsByClassName("ember-view username-check code-claim")[0];
    bonusDiv.parentNode.removeChild(bonusDiv);

    // setup div
    var spcbar = document.createElement("div");
    spcbar.className = "spcmain";
    spcbar.id = "spcSidebar";
    spcbar.style.height = "563px";

    // setup div title
    var spcTitlelbl = document.createElement("div"); 
    spcTitlelbl.setAttribute("data-html2canvas-ignore","true");
    spcTitlelbl.innerHTML = "&#9752; SPC &#9752;";
    spcTitlelbl.className = "spctitle";

    // div titles
    var spcBtnsLbl = document.createElement("p");
    spcBtnsLbl.className = "spcsmalltitle";
    spcBtnsLbl.innerHTML = "select number of cases to test";
    var spcExportLbl = document.createElement("p");
    spcExportLbl.className = "spcsmalltitle";
    spcExportLbl.innerHTML = "download session data";
    var spcCaseDataLbl = document.createElement("p");
    spcCaseDataLbl.className = "spcsmalltitle";
    spcCaseDataLbl.innerHTML = "case statistics";
    spcCaseDataLbl.style.marginTop = "10px";
    spcCaseDataLbl.style.paddingBottom = "0px";
    var spcSessionLbl = document.createElement("p");
    spcSessionLbl.className = "spcsmalltitle";
    spcSessionLbl.innerHTML = "session statistics";
    spcSessionLbl.style.marginTop = "10px";
    spcSessionLbl.style.paddingBottom = "0px";
    // buttons
    var spcBtnsBottom = document.createElement("div");
    var spcBtnsTop = document.createElement("div");
    spcBtnsTop.className = "spcbtnholder";
    spcBtnsBottom.className = "spcbtnholder";
    // test 5 cases 
    var run5 = document.createElement("a");
    run5.innerHTML = "5x";
    run5.className = "spcsmallbutton";
    run5.style.backgroundColor = "#4469FF";
    run5.onclick = run_5;
    // test 10 cases 
    var run10 = document.createElement("a");
    run10.innerHTML = "10x";
    run10.className = "spcsmallbutton";
    run10.style.backgroundColor = "#8847FF";
    run10.onclick = run_10;
    // test 25 cases 
    var run25 = document.createElement("a");
    run25.innerHTML = "25x";
    run25.className = "spcsmallbutton";
    run25.style.backgroundColor = "#D139E3";
    run25.onclick = run_25;
    // test 50 cases 
    var run50 = document.createElement("a");
    run50.innerHTML = "50x";
    run50.style.backgroundColor = "#E94C4F";
    run50.className = "spcmediumbutton";
    run50.onclick = run_50;
    // test 100 cases 
    var run100 = document.createElement("a");
    run100.innerHTML = "100x";
    run100.className = "spcmediumbutton";
    run100.style.backgroundColor = "#FFCD00";
    run100.onclick = run_100;
    // export csv data
    var spcExportCSVBtn = document.createElement("a");
    spcExportCSVBtn.className = "spcbutton";
    spcExportCSVBtn.innerHTML = "csv";
    spcExportCSVBtn.onclick = doExportCSV;
    // export json data
    var spcExportJSONBtn = document.createElement("a");
    spcExportJSONBtn.className = "spcbutton";
    spcExportJSONBtn.innerHTML = "json";
    spcExportJSONBtn.onclick = doExportJSON;
    spcExportJSONBtn.style.marginTop = "10px";
    // append into our button div
    spcBtnsBottom.appendChild(run5);
    spcBtnsBottom.appendChild(run10);
    spcBtnsBottom.appendChild(run25);
    spcBtnsTop.appendChild(run50);  
    spcBtnsTop.appendChild(run100); 

    // SPC Labels
    var spcLbls = document.createElement("div");
    spcLbls.className = "spcStatsDiv";
    // case price label
    var casePrice = document.createElement("p");
    var price = get_case_price();
    gCaseName = get_case_name();
    var d = new Date();
    bigdata.push(["Casename", "Case Price", "URL", "IMG", "Date"]);
    bigdata.push([gCaseName, price, window.location.href, gCaseImage, d.getTime()]);
    bigdata.push(["Case #", "Total Spent", "Profit", "didWin"]);
    casePrice.innerHTML = "5x price &#9871; $" + (price*5).toFixed(2);
    casePrice.className = "spclabel";
    // theoretical spent 
    var theoSpent = document.createElement("p");
    theoSpent.innerHTML = "theo. spent &#9871; $0.00";
    theoSpent.className = "theospent spclabel";
    // theoretical profit 
    var theoProfit = document.createElement("p");
    theoProfit.innerHTML = "theo. profit &#9871; $0.00";
    theoProfit.className = "theoprofit spclabel";
    // number of observed runs
    var runCount = document.createElement("p");
    runCount.innerHTML = "test spin #1";
    runCount.className = "runcounter spclabel";
    // number of cases opened
    var casesCount = document.createElement("p");
    casesCount.innerHTML = "cases rolled &#9871; 0";
    casesCount.className = "casecounter spclabel";
    // win rate 
    var winRate = document.createElement("p");
    winRate.innerHTML = "Win rate &#9871; 0%";
    winRate.className = "winrate spclabel";
    // roi
    var roiLbl = document.createElement("p");
    roiLbl.innerHTML = "ROI &#9871; 0%";
    roiLbl.className = "roicalc spclabel";
    // rating result
    var ratingResult = document.createElement("p");
    ratingResult.innerHTML = "Rating &#9871; none";
    ratingResult.className = "profitresult spclabel";
    // major wins 
    var majorWins = document.createElement("p");
    majorWins.innerHTML = "Major Wins &#9871; 0";
    majorWins.className = "majorWinsResult spclabel";
    // major wins 
    var minorWins = document.createElement("p");
    minorWins.innerHTML = "Wins &#9871; 0 / Losses &#9871; 0";
    minorWins.className = "minorWinsResult spclabel";

    // styled seperator
    var spcSeperator = document.createElement("hr");
    spcSeperator.style.border = "0";
    spcSeperator.style.height = "1px";
    spcSeperator.style.backgroundImage = "linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0))";

    // append into our label div
    spcLbls.appendChild(spcSeperator);
    spcLbls.appendChild(spcSessionLbl);
    spcLbls.appendChild(runCount); // append run count
    spcLbls.appendChild(casesCount); // append cases count
    spcLbls.appendChild(theoSpent); // append theoretical spent
    spcLbls.appendChild(theoProfit); // append theoretical profit
    spcLbls.appendChild(spcSeperator.cloneNode(true));
    spcLbls.appendChild(spcCaseDataLbl);
    spcLbls.appendChild(casePrice); // append case price
    spcLbls.appendChild(majorWins); // major wins
    spcLbls.appendChild(minorWins); // minor wins
    spcLbls.appendChild(winRate);
    spcLbls.appendChild(roiLbl); // roi
    spcLbls.appendChild(ratingResult); // rating result
    
    // put together the divs in order
    spcbar.appendChild(spcTitlelbl);
    spcbar.appendChild(spcLbls);
    spcbar.appendChild(spcSeperator.cloneNode(true));
    spcbar.appendChild(spcBtnsLbl);
    spcbar.appendChild(spcBtnsTop);
    spcbar.appendChild(spcBtnsBottom);
    spcbar.appendChild(spcSeperator.cloneNode(true));
    spcbar.appendChild(spcExportLbl);
    spcbar.appendChild(spcExportCSVBtn);
    spcbar.appendChild(spcExportJSONBtn);

    // finally, append our spc element
    sidebar.insertBefore(spcbar, sidebar.children[2]); 
    console.log("[SPC] sidebar injected"); 
    console.log("[SPC] syncing lifetime stats"); 
    sync_lifetime_stats();
}
function testExportPNG() {
    html2canvas(document.querySelector(".spcStatsDiv"),  {
                foreignObjectRendering:true,
                useCORS:true,
                imageTimeout: 0
            }).then(canvas => {
        // save image as png
        var link = document.createElement('a');
        link.download = gCaseName+".png";
        link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");;
        link.click();
    });
}

// Init
chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
    	if (document.readyState === "complete") {
    		clearInterval(readyStateCheckInterval);
    		console.log("[SPC] extension injected!");
            console.log("[SPC] Skinhub Profitability Calculator v1.0");
            console.log("[SPC] written by Haifisch (haifisch@hbang.ws)");
            console.log("%c!!! GAMBLE WITH CARE !!!", "color:red;");
            console.log("SPC makes no gaurantee of profit.\nSkinhub is high risk vs high reward just like any other CS:GO skin website.");
            console.log("%c!!! GAMBLE WITH CARE !!!", "color:red;");
            setTimeout(function () {
                setup_sidebar();
            }, 1000);
    	}
	}, 1);
});