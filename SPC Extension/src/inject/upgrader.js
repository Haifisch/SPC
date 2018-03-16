/* 
 *  Name: Skinhub Profitability Calculator (SPC)
 *  Author: Dylan "Haifisch" Laws 
 *  Description: Use this on Skinhub.com to calculate the profitability of the upgrade feature. 
 */

var gWins = 0;
var gLosses = 0;
var gRunTarget = 0;
var gRunCount = 0;
var	gSPCIsRunning = false;
var gSpent = 0;
var gProfit = 0;

// performance
var runTimeA, runTimeB = 0;

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
	var percentage = bettingDiv.innerHTML.replace(/\s/g, '');
	return percentage;
}

var messageTimer = null;
function showMessage(message) {
	var messageBox = document.getElementsByClassName("ember-view hero-bar no-animation hero-bar no-animation side-notification error normal")[0];
	messageBox.className = "ember-view hero-bar no-animation hero-bar no-animation side-notification active success normal";
	var messageText = messageBox.getElementsByClassName("left")[0];
	messageText.innerHTML = message;
	setTimeout(function() { 
		messageBox.className = "ember-view hero-bar no-animation hero-bar no-animation side-notification error normal";
		messageText.innerHTML = "";
	}, 6000);
}

// calculate ROI
function calc_roi(profit, cost) {
    var net = (profit - cost);
    var roi = (net/cost)*100;
    return Math.round(roi);
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
	console.log("[SPC] Skinhub percentage "+percentage);
	console.log("[SPC] Wins === "+wins+" ~~~ Losses === "+losses);
	console.log("[SPC] Spent === "+gSpent.toFixed(2)+" ~~~ Profit === "+gProfit.toFixed(2));
	console.log("[SPC] Running ROI "+calc_roi(gProfit, gSpent)+"%");
	console.log("[SPC] Running winrate "+((wins/(wins+losses))*100).toFixed(0)+"%");
	console.log("[====================================]");
}

function run_tests() {
	try {
		getUpgradeToPrice();
	} catch (e) {
		showMessage("[SPC] Please select an item before testing!");
		return;
	}
	if (gRunCount == 0 && gSPCIsRunning == false) { // presumption is first run
        console.log("[--------------[SPC TESTING "+(gRunTarget)+" UPGRADES]--------------]"); 
        runTimeA = performance.now();
        gSPCIsRunning = true; 
    }
    console.log("[SPC] %crunning test upgrade "+(gRunCount+1)+"/"+gRunTarget, "color:blue;");
    document.getElementsByClassName("test-upgrade")[0].click()
    gSpent += getBetBalance();
    gRunCount++;
    setTimeout(function () { // check our run count and spin again if needed, else stop and branch to result routine
		print_report(gWins, gLosses, getBetPercentage());
    	setTimeout(function () {
    		if (gRunCount < gRunTarget) { run_tests(); } else { 
	            gRunCount = 0; 
	            gSPCIsRunning = false;
	            console.log("[------------------[SPC FINISHED]------------------]");
	        }
    	},1000);
       
    }, 5000);
}

function doRuns(runTargetNumber) {
	gRunTarget = runTargetNumber;
	gRunCount = 0;
	run_tests();
}

function SPC_makerow() {
	var upgradebody = document.getElementsByClassName("upgrade-body")[0];
	// setup the SPC div 
	var SPCRow = document.createElement("div");
	SPCRow.className = "row spcUpgradeMain";
	SPCRow.style.height = "200px";
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
		gRunTarget = 5;
		gRunCount = 0;
		run_tests();
	};
	// SPC 10 
	var test10 = document.createElement("div");
	test10.className = "spcmediumbutton";
	test10.innerHTML = "10X";
	test10.style.backgroundColor = "#8847FF";
	test10.onclick = function () {
		gRunTarget = 10;
		gRunCount = 0;
		run_tests();
	};
	// SPC 25 
	var test25 = document.createElement("div");
	test25.className = "spcmediumbutton";
	test25.innerHTML = "20X";
	test25.style.backgroundColor = "#D139E3";
	test25.onclick = function () {
		gRunTarget = 25;
		gRunCount = 0;
		run_tests();
	};
	// SPC 50 
	var test50 = document.createElement("div");
	test50.className = "spcmediumbutton";
	test50.innerHTML = "50X";
	test50.style.backgroundColor = "#E94C4F";
	test50.onclick = function () {
		gRunTarget = 50;
		gRunCount = 0;
		run_tests();
	};
	// SPC 100 
	var test100 = document.createElement("div");
	test100.className = "spcmediumbutton";
	test100.innerHTML = "100X";
	test100.style.backgroundColor = "#FFCD00";
	test100.onclick = function () {
		gRunTarget = 100;
		gRunCount = 0;
		run_tests();
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
	upgradebody.appendChild(SPCRow);
}

function SPC_startup() {
	var animationContainer = document.getElementsByClassName("animation-container")[0];
	var const_subchild = animationContainer.children[0];

	// failed class name == fa fa-times 
	// sucess class name == fa fa-check
	var config = { attributes: true, childList: true };
	var resultCallback = function(mutationsList) {
		mutationLoop:
	    for(var mutation of mutationsList) {
	      	if (mutation.previousSibling.nodeName == "I") {
	      		for (var className of mutation.previousSibling.classList) {
	      			if (className == "fa-check") {
	      				console.log("[SPC] %cWIN!", "color:green;");
	      				if (gSPCIsRunning) {
	      					gProfit += (getUpgradeToPrice()-getBetBalance());
	      					gWins++;
	      				}
	      				break mutationLoop;
	      			} else if (className == "fa-times"){
	      				console.log("[SPC] %cLOSS!", "color:red;");
	      				if (gSPCIsRunning) {
	      					gLosses++;
	      				}	
	      				break mutationLoop;
	      			}
	      		}
	      	}
	    }
	};

	var observer = new MutationObserver(resultCallback);
	observer.observe(animationContainer, config);
	console.log("We're observing now!");
}

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
            SPC_makerow();
            SPC_startup();
        }, 1000);
	}
	}, 10);
});