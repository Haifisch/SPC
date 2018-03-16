window.onload = function () {
	const numberWithCommas = (x) => {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	var totalOpenedElement = document.getElementById("totalOpened");
	var totalProfitElement = document.getElementById("totalProfit");
	var totalSpentElement = document.getElementById("totalSpent");
  var share = document.getElementById("shareBtn");
  chrome.storage.sync.get("SPC_LIFETIME_OPENED", function(items) {
    totalOpenedElement.innerHTML = "opened cases == "+numberWithCommas(items["SPC_LIFETIME_OPENED"]);
    var str = "I've tested "+numberWithCommas(items["SPC_LIFETIME_OPENED"])+" cases using Skinhub Profitability Calculator (SPC)! #EscoSPC";
    share.href = "https://twitter.com/intent/tweet?source=https%3A%2F%2Fspc.haifisch.vip&text="+encodeURIComponent(str)+"&via=xvxPabloEscoxvx";
  });
  chrome.storage.sync.get("SPC_LIFETIME_SPENT", function(items) {
    var spent = items["SPC_LIFETIME_SPENT"].toFixed(2);
    totalSpentElement.innerHTML = "theoretical spent == $"+numberWithCommas(spent);
  });
  chrome.storage.sync.get("SPC_LIFETIME_PROFIT", function(items) {
    var profit = items["SPC_LIFETIME_PROFIT"].toFixed(2);
    totalProfitElement.innerHTML = "theoretical profit == $"+numberWithCommas(profit);
  });

};