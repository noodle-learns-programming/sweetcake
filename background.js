chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	/**
	 |---------------------------------------------------------------------
	 | There are two state: ["upding", "complete"] when the tab is reloaded
	 |---------------------------------------------------------------------
	 */
    if( changeInfo.status === "complete" )
    {
    	chrome.tabs.executeScript(tabId, { file: "jquery.min.js" }, function() {
		    chrome.tabs.executeScript(tabId, { file: "main.js" }, function(){
		    	console.log('Everything is ok', arguments);
		    });
		});
	}
});
chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
	console.log('chrome.tabs.onCreated: ', changeInfo, tab);
});

chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
	console.log('chrome.tabs.onRemoved: ', changeInfo, tab);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(
		sender.tab
		? "tab:" + sender.tab
        : "tab: undefined"
    );
    console.log(request);
});