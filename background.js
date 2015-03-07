var TabManager = {};
TabManager.arrManagedTabs = [];
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	/**
	 |---------------------------------------------------------------------
	 | There are two state: ["upding", "complete"] when the tab is reloaded
	 |---------------------------------------------------------------------
	 */
    if( changeInfo.status === "complete" )
    {
    	console.log('chrome.tabs.onUpdated | tabId: ', tabId);
		console.log('chrome.tabs.onUpdated | changeInfo: ', changeInfo);
		console.log('chrome.tabs.onUpdated | tab: ', tab, tab.url);
    	chrome.tabs.executeScript(tabId, { file: "jquery.min.js" }, function() {
		    chrome.tabs.executeScript(tabId, { file: "main.js" }, function(){
		    	console.log('Everything is ok', arguments);
		    	TabManager.arrManagedTabs[tabId] = tab;
		    });
		});
	}
});
chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {
	console.log('chrome.tabs.onCreated: ', changeInfo, tab);
});

chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
	console.log('chrome.tabs.onRemoved | tabId: ', tabId);
	console.log('chrome.tabs.onRemoved | changeInfo: ', changeInfo);
	console.log('chrome.tabs.onRemoved | tab: ', tab, tab.url);
	delete TabManager.arrManagedTabs[tabId];
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log('chrome.runtime.onMessage | sender.tab: ', sender.tab)
    console.log('chrome.runtime.onMessage | request: ', request)
});