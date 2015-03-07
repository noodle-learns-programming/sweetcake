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
	console.log('chrome.tabs.onCreated.addListener: ', changeInfo);
});