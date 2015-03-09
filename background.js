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
TabManager.preAddATab = function(tabInfo)
{
    if( !tabInfo.openerTabId )
    {
        return;
    }
    var openerTab = this.getAnElementById(tabInfo.openerTabId);
    if( !openerTab )
    {
        return;
    }
    if( this.isMasterTab(openerTab) )
    {
        this.dictManagedTabs[tabInfo.id] = {
            tab     : tabInfo,
            role    : 'FISRT'
        };
    }
    else if ( this.isFisrtLevelTab(openerTab) )
    {
        this.dictManagedTabs[tabInfo.id] = {
            tab     : tabInfo,
            role    : 'SECOND'
        };
    }
};
TabManager.addTab = function(tab){
    this.updateTab(tab);
    if( Helper.isMasterUrl(tab.url) )
    {
        this.setRole(tab.id, 'MASTER');
    }
};
TabManager.updateTab   = function(tab)
{
    if( this.dictManagedTabs[tab.id] )
    {
        this.dictManagedTabs[tab.id].tab = tab;
        return;    
    }
    this.dictManagedTabs[tab.id] = {
        tab     : tab,
        role    : ''
    };
};
TabManager.setRole = function(tabId, ROLE)
{
    this.dictManagedTabs[tabId].role = ROLE;
}
TabManager.getAnElementById = function(tabId)
{
    return this.dictManagedTabs[tabId];
};
TabManager.isUrlFromMasterTab = function(url)
{
    return !!this.dictMasterUrls[url];
};
TabManager.isUrlFromFirstLevelTab = function(url)
{
    return !!this.dictFistLevelUrls[url];
};
TabManager.isMasterTab = function(tab)
{
    return tab.role === 'MASTER';
};
TabManager.isFisrtLevelTab = function(tab)
{
    return tab.role === 'FISRT';
};
TabManager.isExist = function(tabId)
{
    return !!this.dictManagedTabs[tabId];
};

chrome.tabs.query({}, function(results){
    var tab = null;
    for(var i = 0; i < results.length; i++)
    {
        tab = results[i];
        if( !Helper.isMasterUrl(tab.url) )
        {
            continue;
        }
        chrome.tabs.executeScript(tab.id, { file: "jquery.min.js" }, function(tab) {
            chrome.tabs.executeScript(tab.id, { file: "main.js" }, function(tab){
                TabManager.addTab(tab);
            }.bind(this, tab));
        }.bind(this, tab));
    }
});

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
    TabManager.preAddATab(tabInfo);
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