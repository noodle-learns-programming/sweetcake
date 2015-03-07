chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    //alert('Tab is updated');//worked
});

chrome.tabs.onCreated.addListener(function(tabId, changeInfo, tab) {         
   //alert('Tab is open');//worked
});