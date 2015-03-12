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
        this.addTab(tab);
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
    this.updateRole(tab);
};
TabManager.updateTab   = function(tab)
{
    if( this.dictManagedTabs[tab.id] )
    {
        this.dictManagedTabs[tab.id].tab = tab;
        this.updateRole(tab);
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
TabManager.updateRole = function(tab)
{
    if( Helper.isMasterUrl(tab.url) )
    {
        this.setRole(tab.id, 'MASTER');
    }
};
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
TabManager.isSecondLevelTab = function(tab)
{
    return tab.role === 'SECOND';
};
TabManager.isExist = function(tabId)
{
    return !!this.dictManagedTabs[tabId];
};
TabManager.findATabHasUrlAndFocusIn = function(url)
{
    var managedTab = null;
    for(var tabId in this.dictManagedTabs)
    {
        managedTab = this.dictManagedTabs[tabId];
        if( TabManager.isFisrtLevelTab(managedTab) )
        {
            if( managedTab.tab.url === url )
            {
                chrome.tabs.update(tabId|0, {selected: true}, function(){
                    
                });
                break;
            }
        }
    }
};
TabManager.executeScript = function(tab)
{
    chrome.tabs.executeScript(tab.id, { file: "jquery.min.js" }, function(tab) {
        chrome.tabs.executeScript(tab.id, { file: "main.js" }, function(tab){

        }.bind(this, tab));
    }.bind(this, tab));
};

chrome.tabs.query({}, function(results){
    var tab = null;
    for(var i = 0; i < results.length; i++)
    {
        tab = results[i];
        TabManager.addTab(tab);
        TabManager.executeScript(tab);
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    TabManager.updateTab(tab);
    TabManager.executeScript(tab);
    var managedTab = TabManager.getAnElementById(tab.id);
    if( TabManager.isSecondLevelTab(managedTab) )
    {
        var message = TabManager.dictFistLevelUrls[tab.url];
        if( message )
        {
            alert(tab.url + '|' + message.text);
        }
    }
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
    var managedTab = TabManager.getAnElementById(tab.id);
    if( !managedTab )
    {
        return;
    }
    if( TabManager.isMasterTab(managedTab) )
    {
        if( request.cmd === 'focusTab' )
        {
            TabManager.findATabHasUrlAndFocusIn(request.href);
            return;
        }
        TabManager.dictMasterUrls[request.href] = request;
    }
    else if( TabManager.isFisrtLevelTab(managedTab) )
    {
        TabManager.dictFistLevelUrls[request.href] = request;   
    }
});