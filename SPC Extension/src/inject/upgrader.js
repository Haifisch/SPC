/* 
 *  Name: Skinhub Profitability Calculator (SPC)
 *  Author: Dylan "Haifisch" Laws 
 *  Description: Use this on Skinhub.com to calculate the profitability of the upgrade feature. 
 *  This is all really hacky. It's a JS extension, what else would you expect?
 */

var gWins = 0;
var gLosses = 0;
var gRunTarget = 0;
var gRunCount = 0;
var	gSPCIsRunning = false;
var gSpent = 0;
var gProfit = 0;
var gBigDataContainer = [];
var gBigData = [];
// performance timing
var runTimeA, runTimeB = 0;

// export to json from button
function doExportJSON() {
    if (gBigData.length > 2) {
        var d = new Date();
        gBigDataContainer.push({"results":{"Profit":parseFloat(gProfit.toFixed(2)),"Spent":parseFloat(gSpent.toFixed(2)), "Win rate":parseFloat(((gWins/(gWins+gLosses))*100).toFixed(2)), "rounds":gBigData}});
        exportToJSON("upgrader_spc_data_"+d.getTime()+".json", gBigDataContainer);
    } else {
        console.log("[SPC] not enough data to export!");
    }
}

function getBetBalance() {
	var targetUpgrade = document.getElementsByClassName("upgrade-body")[0].children[0].getElementsByClassName("price")[0];
	var price = targetUpgrade.innerHTML.replace(/\s/g, '');
	return parseFloat(price);
}
function getUpgradeToPrice() {
	var targetUpgrade = document.getElementsByClassName("upgrade-body")[0].getElementsByClassName("right")[0].getElementsByClassName("price")[0];
	var price = targetUpgrade.innerHTML.replace(/\s/g, '');
	return parseFloat(price);
}

function getBetPercentage() {
	var bettingDiv = document.getElementsByClassName("betting-on")[0].getElementsByClassName("right-text")[0];
	var percentage = bettingDiv.innerHTML.replace(/\s/g, '').replace('%','');
	return parseFloat(percentage);
}

function print_report(wins, losses, percentage) {
	function millisToMinutesAndSeconds(millis) {
	  var minutes = Math.floor(millis / 60000);
	  var seconds = ((millis % 60000) / 1000).toFixed(0);
	  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
	}
	var balance = getBetBalance();
	var upgraded = getUpgradeToPrice();
	var timePassed = performance.now();
	console.log("[===============("+gRunCount+"/"+gRunTarget+")===============]");
	console.log("[SPC] Runtime === "+millisToMinutesAndSeconds((timePassed - runTimeA)));
	console.log("[SPC] Ideal ROI "+calc_roi(upgraded, balance)+"%");
	console.log("[SPC] Skinhub percentage "+percentage+"%");
	console.log("[SPC] Wins === "+wins+" ~~~ Losses === "+losses);
	console.log("[SPC] Spent === "+gSpent.toFixed(2)+" ~~~ Profit === "+gProfit.toFixed(2));
	console.log("[SPC] Running ROI "+calc_roi(gProfit, gSpent)+"%");
	console.log("[SPC] Running winrate "+((wins/(wins+losses))*100).toFixed(2)+"%");
	console.log("[====================================]");
}

function run_tests() {
	function checkClickable() {
		var buttonClasses = document.getElementsByClassName("test-upgrade")[0].classList;
		for (var className of buttonClasses) {
			if (className == "disabled") {
				return false;
			} else if (buttonClasses.length == 1) {
				return true;
			}
		}
	}
	if (gRunCount == 0 && gSPCIsRunning == false) { // first run check
		if (!checkClickable()) { console.log("[SPC] %cPlease select an item before testing!", "color:red;"); return; }
        console.log("[--------------[SPC TESTING "+(gRunTarget)+" UPGRADES]--------------]"); 
        gBigDataContainer.push({"Upgrade Target":getUpgradeToPrice(), "Balance Bet":getBetBalance(),"Skinhub Percentage":getBetPercentage()});
        runTimeA = performance.now();
        gSPCIsRunning = true; 
    }
    console.log("[SPC] %crunning test upgrade "+(gRunCount+1)+"/"+gRunTarget, "color:blue;");
    if (checkClickable()) {
    	document.getElementsByClassName("test-upgrade")[0].click();
    	gSpent += getBetBalance();
    	gRunCount++;
    }
    setTimeout(function () { 
		print_report(gWins, gLosses, getBetPercentage());
    	setTimeout(function () {
    		if (gRunCount < gRunTarget) { run_tests(); } else { 
    			SPC_showresults();
				print_report(gWins, gLosses, getBetPercentage());
	            gRunCount = 0; 
	            gSPCIsRunning = false;
	            console.log("[------------------[SPC FINISHED]------------------]");
	        }
    	},1000);
       
    }, 5000);
}

function doRuns(runTargetNumber) {
	if (gSPCIsRunning) { console.log("[SPC] %calready running tests!", "color:red;"); return; }
	gRunTarget = runTargetNumber;
	gRunCount = 0;
	gWins = 0;
	gLosses = 0;
	gSpent = 0;
	gProfit = 0;
	gBigDataContainer = [];
	gBigData = [];
	run_tests();
}

function SPC_showresults() {
	// remove the SPC testing row
	document.getElementsByClassName("row spcUpgradeMain")[0].remove();
	// re-setup essentially the same as makerow
	var SPCRow = document.createElement("div");
	SPCRow.className = "row spcUpgradeMainStats";
	SPCRow.style.height = "280px";
	SPCRow.style.marginBottom = "50px";
	// SPC Title
	var title =  document.createElement("p");
	title.className = "spcTitle";
	title.innerHTML = "&#9752; SPC &#9752;";
	// SPC Run Tests Title
	var subtitle = document.createElement("p");
	subtitle.className = "spcSmallTitle";
	subtitle.innerHTML = "Upgrade Theoretical Stats";
	// styled seperator
    var spcSeperator = document.createElement("hr");
    spcSeperator.style.border = "0";
    spcSeperator.style.height = "1px";
    spcSeperator.style.backgroundImage = "linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0))";
    // upgrade stats div
	var caseStats = document.createElement("div");
	caseStats.className = "case-winning-stats";
	caseStats.style.backgroundColor = "#6f7290";

	// wins container
	var statWins = document.createElement("div");
	statWins.className = "stat";
	statWins.style.width = "auto";
	// title
	var statBigLabelWins = document.createElement("h5");
	statBigLabelWins.innerHTML = "Wins";
	// value
	var statSmallLabelWins = document.createElement("h3");
	statSmallLabelWins.innerHTML = gWins;
	// glue together stat
	statWins.appendChild(statBigLabelWins);
	statWins.appendChild(statSmallLabelWins);
	caseStats.appendChild(statWins);

	// losses container
	var statLosses = document.createElement("div");
	statLosses.className = "stat";
	statLosses.style.width = "auto";
	// title
	var statBigLabelLosses = document.createElement("h5");
	statBigLabelLosses.innerHTML = "Losses";
	// value
	var statSmallLabelLosses = document.createElement("h3");
	statSmallLabelLosses.innerHTML = gLosses;
	// glue together stat
	statLosses.appendChild(statBigLabelLosses);
	statLosses.appendChild(statSmallLabelLosses);
	caseStats.appendChild(statLosses);

	// winrate container
	var statWinrate = document.createElement("div");
	statWinrate.className = "stat";
	statWinrate.style.width = "auto";
	// title
	var statBigLabelWinrate = document.createElement("h5");
	statBigLabelWinrate.innerHTML = "Win rate";
	// value
	var statSmallLabelWinrate = document.createElement("h3");
	statSmallLabelWinrate.innerHTML = ((gWins/(gWins+gLosses))*100).toFixed(0)+"%";
	// glue together stat
	statWinrate.appendChild(statBigLabelWinrate);
	statWinrate.appendChild(statSmallLabelWinrate);
	caseStats.appendChild(statWinrate);

	// profit container
	var statProfit = document.createElement("div");
	statProfit.className = "stat";
	statProfit.style.width = "auto";
	// title
	var statBigLabelProfit = document.createElement("h5");
	statBigLabelProfit.innerHTML = "Profit";
	// value
	var statSmallLabelProfit = document.createElement("h3");
	statSmallLabelProfit.innerHTML = "$"+gProfit.toFixed(0);
	// glue together stat
	statProfit.appendChild(statBigLabelProfit);
	statProfit.appendChild(statSmallLabelProfit);
	caseStats.appendChild(statProfit);

	// spent container
	var statSpent = document.createElement("div");
	statSpent.className = "stat";
	statSpent.style.width = "auto";
	// title
	var statBigLabelSpent = document.createElement("h5");
	statBigLabelSpent.innerHTML = "Spent";
	// value
	var statSmallLabelSpent = document.createElement("h3");
	statSmallLabelSpent.innerHTML = "$"+gSpent.toFixed(0);
	// glue together stat
	statSpent.appendChild(statBigLabelSpent);
	statSpent.appendChild(statSmallLabelSpent);
	caseStats.appendChild(statSpent);

	// reset SPC
	var resetBtn = document.createElement("div");
	resetBtn.className = "spcResetButton";
	resetBtn.innerHTML = "Reset";
	resetBtn.style.backgroundColor = "#E94C4F";
	resetBtn.onclick = function () {
		gRunTarget = 0;
		gRunCount = 0;
		gWins = 0;
		gLosses = 0;
		gSpent = 0;
		gProfit = 0;
		gBigDataContainer = [];
		gBigData = [];
		document.getElementsByClassName("row spcUpgradeMainStats")[0].remove();
		SPC_makerow();
	};

	// glue the new row in
	SPCRow.appendChild(title);
	SPCRow.appendChild(spcSeperator);
	SPCRow.appendChild(subtitle);
	SPCRow.appendChild(caseStats);
	SPCRow.appendChild(document.createElement("br"));
	SPCRow.appendChild(resetBtn);
	document.getElementsByClassName("upgrade-body")[0].getElementsByClassName("row actions")[0].appendChild(SPCRow);
}

// Our initial SPC testing row
function SPC_makerow() {
	// setup the SPC div 
	var SPCRow = document.createElement("div");
	SPCRow.className = "row spcUpgradeMain";
	SPCRow.style.height = "200px";
	SPCRow.style.marginBottom = "50px";
	// SPC Title
	var title =  document.createElement("p");
	title.className = "spcTitle";
	title.innerHTML = "&#9752; SPC &#9752;";
	// SPC Run Tests Title
	var subtitle = document.createElement("p");
	subtitle.className = "spcSmallTitle";
	subtitle.innerHTML = "start testing desired upgrade";
	// SPC 5 Times
	var test5 = document.createElement("div");
	test5.className = "spcmediumbutton";
	test5.innerHTML = "5X";
	test5.style.backgroundColor = "#4469FF";
	test5.onclick = function () {
		doRuns(5);
	};
	// SPC 10 
	var test10 = document.createElement("div");
	test10.className = "spcmediumbutton";
	test10.innerHTML = "10X";
	test10.style.backgroundColor = "#8847FF";
	test10.onclick = function () {
		doRuns(10);
	};
	// SPC 25 
	var test25 = document.createElement("div");
	test25.className = "spcmediumbutton";
	test25.innerHTML = "25X";
	test25.style.backgroundColor = "#D139E3";
	test25.onclick = function () {
		doRuns(25);
	};
	// SPC 50 
	var test50 = document.createElement("div");
	test50.className = "spcmediumbutton";
	test50.innerHTML = "50X";
	test50.style.backgroundColor = "#E94C4F";
	test50.onclick = function () {
		doRuns(50);
	};
	// SPC 100 
	var test100 = document.createElement("div");
	test100.className = "spcmediumbutton";
	test100.innerHTML = "100X";
	test100.style.backgroundColor = "#FFCD00";
	test100.onclick = function () {
		doRuns(100);
	};
	// styled seperator
    var spcSeperator = document.createElement("hr");
    spcSeperator.style.border = "0";
    spcSeperator.style.height = "1px";
    spcSeperator.style.backgroundImage = "linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0))";

	// glue it all together
	SPCRow.appendChild(title);
	SPCRow.appendChild(spcSeperator);
	SPCRow.appendChild(subtitle);
	SPCRow.appendChild(test5);
	SPCRow.appendChild(test10);
	SPCRow.appendChild(test25);
	SPCRow.appendChild(test50);
	SPCRow.appendChild(test100);
	// final append
	document.getElementsByClassName("upgrade-body")[0].getElementsByClassName("row actions")[0].appendChild(SPCRow);
	console.log("[SPC] Row injected!");
}

function SPC_startup() {
	// For the upgrader, we observe and wait for the check mark mutation for our win/loss check. 
	// AFAIK it's the cleanest way to do this.
	var config = { attributes: true, childList: true };
	var resultCallback = function(mutationsList) {
		mutationLoop:
	    for(var mutation of mutationsList) {
	      	if (mutation.previousSibling.nodeName == "I") {
	      		for (var className of mutation.previousSibling.classList) {
	      			if (className == "fa-check") {
	      				console.log("[SPC] %cWIN!", "color:green;");
	      				if (gSPCIsRunning) {
	      					gBigData.push(true);
	      					gProfit += (getUpgradeToPrice()-getBetBalance());
	      					gWins++;
	      				}
	      				break mutationLoop;
	      			} else if (className == "fa-times"){
	      				console.log("[SPC] %cLOSS!", "color:red;");
	      				if (gSPCIsRunning) {
	      					gBigData.push(false);
	      					gLosses++;
	      				}	
	      				break mutationLoop;
	      			}
	      		}
	      	}
	    }
	};

	var observer = new MutationObserver(resultCallback);
	observer.observe(document.getElementsByClassName("animation-container")[0], config);
	console.log("[SPC] We're observing results now!");
	SPC_makerow();
}

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		spc_welcome();
        setTimeout(function () {
            SPC_startup();
        }, 1000);
	}
	}, 10);
});