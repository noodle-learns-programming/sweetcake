var Config      = {
    'FACESEO_HOST_URL'  : 'faceseo.vn'
};
var Helper      = {};
Helper.isMasterUrl = function(url)
{
    var regex = new RegExp('https?://'+Config.FACESEO_HOST_URL);
    return url.search(regex) === 0;
};

var TabManager  = {};
TabManager.dictMasterUrls      = {};
TabManager.dictFistLevelUrls    = {};
TabManager.dictManagedTabs      = {};
TabManager.addTab = function(tab){
    if( this.dictManagedTabs[tab.id] ) {
        return;
    }
    if( this.isUrlFromMasterTab(tab.url) )
    {
        this.initTab(tab);
        this.markAsFirstLevelTab(tab);
    }
    else if( this.isUrlFromFirstLevelTab(tab.url) )
    {
        this.initTab(tab);
        this.markAsSecondLevelTab(tab);
    }
};
TabManager.initTab   = function(tab)
{
    this.dictManagedTabs[tab.id] = {
        tab             : tab,
        isMasterLevel   : false,
        isFirstLevel    : false
    };
};
TabManager.isUrlFromMasterTab = function(url)
{
    return !!this.dictMasterUrls[url];
};
TabManager.isUrlFromFirstLevelTab = function(url)
{
    return !!this.dictFistLevelUrls[url];
}
TabManager.markAsFirstLevelTab  = function(tab)
{
    this.dictManagedTabs[tab.id].isFirstLevel = true;
};
TabManager.markAsSecondLevelTab  = function(tab)
{
    this.dictManagedTabs[tab.id].isMasterLevel = true;
};
TabManager.isFromFirstLevel = function(tab)
{
    return this.dictManagedTabs[tab.id].isFirstLevel;
};
TabManager.isExist = function(tabId)
{
    return !!this.dictManagedTabs[tabId];
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    /**
     |---------------------------------------------------------------------
     | There are two state: ["upding", "complete"] when the tab is reloaded
     |---------------------------------------------------------------------
     */
    if( TabManager.isExist(tabId) )
    {
        return;
    }
    chrome.tabs.executeScript(tabId, { file: "jquery.min.js" }, function() {
        chrome.tabs.executeScript(tabId, { file: "main.js" }, function(){
            TabManager.addTab(tab);
        });
    });
});
chrome.tabs.onCreated.addListener(function(tabInfo) {
    console.log('chrome.tabs.onCreated: ', tabInfo);
});

chrome.tabs.onRemoved.addListener(function(tabId, changeInfo, tab) {
    if( !TabManager.dictManagedTabs[tabId] )
    {
        return;
    }
    TabManager.dictManagedTabs[tabId].tab = null;
    delete TabManager.dictManagedTabs[tabId];
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if( !sender.tab ){
        return;
    }
    var tab = sender.tab;
    if( Helper.isMasterUrl(tab.url) )
    {
        TabManager.dictMasterUrls[tab.url] = request;
    }
    else if ( TabManager.isUrlFromFirstLevelTab(tab) )
    {
        TabManager.dictFistLevelUrls[tab.url] = request;
    }
});