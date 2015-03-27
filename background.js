Date.prototype.format = function(format) 
{
    var o = {
        "M+" : this.getMonth()+1, 
        "d+" : this.getDate(),    
        "h+" : this.getHours(),   
        "m+" : this.getMinutes(), 
        "s+" : this.getSeconds(), 
        "q+" : Math.floor((this.getMonth()+3)/3),  
        "S" : this.getMilliseconds() 
    };
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length==1 ? o[k] :
            ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
};
var Config      = {
    'HOST_URL'  : 'faceseo.vn',
    'UPDATE_URL': 'http://faceseo.vn/fs1.3.php',
    'MAX_TIME'  : 420,
    'MIN_TIME'  : 300
};
var Helper      = {};
Helper.isMasterUrl = function(url)
{
    var regex = new RegExp('https?://'+Config.HOST_URL);
    return url.search(regex) === 0;
};
Helper.updateServerSideWithParams = function(options, callback) {
    var params = {
        urlClicked  : options.urlClicked,
        idUser      : options.idUser,
        timeOpend   : options.timeOpend,
        timeClose   : options.timeClose,
        timeView    : options.timeView,
        linkText    : options.linkText,
        parent      : options.parent,
        deepbacklink: options.deepbacklink || 0,
        checkkey    : options.checkkey || 0

    };
    jQuery.get(Config.UPDATE_URL, params, function(response) {
       alert('Update server is sucess!');
    });
};

Helper.remove_unicode = function(str) 
{  
    str= str.toLowerCase();  
    str= str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a");  
    str= str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e");  
    str= str.replace(/ì|í|ị|ỉ|ĩ/g,"i");  
    str= str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o");  
    str= str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u");  
    str= str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y");  
    str= str.replace(/đ/g,"d");  
    str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|$|_/g,"-"); 
    str= str.replace(/-+-/g,"-");
    str= str.replace(/^\-+|\-+$/g,""); 
    return str;  
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
        this.addTab(tabInfo);
        return;
    }
    if( this.isMasterTab(openerTab) )
    {
        this.dictManagedTabs[tabInfo.id] = {
            tab     : tabInfo,
            role    : 'FISRT',
            parent  : openerTab,
            startAt : new Date(),
            arrUrls : {},
            iNumberTabOpened : 0
        };
    }
    else if ( this.isFisrtLevelTab(openerTab) )
    {
        this.dictManagedTabs[tabInfo.id] = {
            tab     : tabInfo,
            role    : 'SECOND',
            isValid : openerTab.isActive,
            parent  : openerTab,
            startAt : new Date(),
            arrUrls : {},
            iNumberTabOpened : 0
        };
    }
    if( !this.dictManagedTabs[tabInfo.id].arrUrls )
    {
        this.dictManagedTabs[tabInfo.id].arrUrls = {};
    }
    if( this.latestUrl )
    {
        this.dictManagedTabs[tabInfo.id].arrUrls[this.latestUrl.href] = this.latestUrl.text;
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
        role    : '',
        arrUrls : {}
    };
};
TabManager.setLatestUrl = function(request)
{
    this.latestUrl = request;
};
TabManager.setRole = function(tabId, ROLE)
{
    this.dictManagedTabs[tabId].role = ROLE;
};
TabManager.updateRole = function(tab)
{
    if( Helper.isMasterUrl(tab.url) )
    {
        chrome.cookies.get({url : 'http://'+Config.HOST_URL, name : 'UIDFACESEO'}, function(cookie){
            TabManager.UIDFACESEO = cookie.value;
        });
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
TabManager.findATabHasUrlAndFocusIn = function(request)
{
    var url         = request.url;
    var managedTab  = null;
    for(var tabId in this.dictManagedTabs)
    {
        managedTab = this.dictManagedTabs[tabId];
        if( TabManager.isFisrtLevelTab(managedTab) )
        {
            if( managedTab.tab.url === url )
            {
                chrome.tabs.update(tabId|0, {selected: true}, function(){
                    managedTab.keyword  = request.keyword;
                    managedTab.isActive = true;
                });
                break;
            }
            for(href in managedTab.arrUrls )
            {
                if( href === url )
                {
                    chrome.tabs.update(tabId|0, {selected: true}, function(){
                        managedTab.keyword  = request.keyword;
                        managedTab.isActive = true;
                    });
                    break;
                }
            }
        }
    }
};
TabManager.canExecuteScript = function(tab)
{
    if( !tab.url )
    {
        return false;
    }
    if( tab.url.indexOf('chrome://') === 0 )
    {
        return false;
    }
    if( tab.url.indexOf('chrome-devtools://') === 0 )
    {
        return false;
    }
    return true;
};

TabManager.executeScript = function(tab)
{
    if( !TabManager.canExecuteScript(tab) )
    {
        return;
    }
    TabManager._executeScript(tab, "jquery.min.js", function(){
        TabManager._executeScript(tab, "main.js", function(){
            console.log('------------------------------------');
            console.log('executeScript all scripts are ok!');
            console.log('url: ', tab.url);  
        });
    });
};
TabManager._executeScript = function(tab, script, callback)
{
    chrome.tabs.executeScript(tab.id, {file: script}, function(result) {
        if( !result )
        {
            setTimeout(TabManager._executeScript.bind(this, tab, script, callback), 1000);
            return;
        }
        callback();
    });
};

TabManager.autoCloseTabs = function() {
    var diff        = 0;
    var timeToClose = 0;
    var now         = new Date();
    var managedTab  = null;
    for(var tabId in this.dictManagedTabs)
    {
        managedTab  = this.dictManagedTabs[tabId];
        if( !TabManager.isSecondLevelTab(managedTab) )
        {
            continue;
        }
        diff        = (now - managedTab.startAt) / 1000 | 0;
        timeToClose = Math.floor(Math.random() * (Config.MAX_TIME - Config.MIN_TIME)) + Config.MIN_TIME;
        if( diff > timeToClose )
        {
            chrome.tabs.remove(tabId|0, function(){

            });
        }
    }
    setTimeout(TabManager.autoCloseTabs.bind(this), 2000);
};
TabManager.checkTheTabIsOpen = function(url)
{
    var managedTab = null;
    for(var tabId in this.dictManagedTabs)
    {
        managedTab = this.dictManagedTabs[tabId];
        if( !TabManager.isSecondLevelTab(managedTab) )
        {
            continue;
        }
        if( managedTab.tab.url === url )
        {
            return true;
        }
        for(href in managedTab.arrUrls )
        {
            if( href === url )
            {
               return true;
            }
        }
    }
    return false;
};
TabManager.checkOpenTabTooMuch = function(openerTabId)
{
   var managedTab = this.dictManagedTabs[openerTabId];
   if( managedTab && managedTab.iNumberTabOpened >= 5)
   {
        return true;
   }
   return false;
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
TabManager.autoCloseTabs();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log('-------------------------------');
    console.log(tab.url);
    console.log(changeInfo.url);
    TabManager.updateTab(tab);
    TabManager.executeScript(tab);
    var managedTab = TabManager.getAnElementById(tab.id);
    if( !TabManager.isSecondLevelTab(managedTab) )
    {
        return;
    }
    var message = TabManager.dictFistLevelUrls[tab.url];
    if( message && !managedTab.isSentOpened )
    {
        managedTab.isSentOpened = true;
        var parentTab   = managedTab.parent;
        var checkkey    = (parentTab.keyword || '').search(message.text) >= 0 ? 1 : 0;
        try {
            Helper.updateServerSideWithParams({
                urlClicked  : tab.url,
                idUser      : TabManager.UIDFACESEO,
                timeOpend   : managedTab.startAt.format("hh:mm:ss dd/MM/yyyy"),
                timeClose   : 'In view',
                timeView    : 0,
                linkText    : message.text,
                parent      : parentTab.tab.url,
                deepbacklink: managedTab.isValid,
                checkkey    : checkkey
            },function()
            {
                //managedTab.isSentOpened = false;
            });
        } catch (e ) {
            console.log('updateServerSideWithParams | error: ', e);
        }
    }
});
chrome.tabs.onCreated.addListener(function(tabInfo) {
    console.log('chrome.tabs.onCreated: ', tabInfo);
    if( !tabInfo.openerTabId )
    {
        tabInfo.openerTabId = TabManager.openerTabId;
        TabManager.openerTabId = 0;
    }
    TabManager.preAddATab(tabInfo);
});

chrome.tabs.onRemoved.addListener(function(tabId, changeInfo) {
    if( !TabManager.dictManagedTabs[tabId] )
    {
        return;
    }
    var managedTab = TabManager.getAnElementById(tabId);
    if( managedTab && managedTab.isSentOpened )
    {
        var tab         = managedTab.tab;
        var message     = TabManager.dictFistLevelUrls[tab.url];
        var now         = new Date();
        var diff        = (now - managedTab.startAt) / 1000 | 0;
        var parentTab   = managedTab.parent;
        var checkkey    = (parentTab.keyword || '').search(message.text) >= 0 ? 1 : 0;
        Helper.updateServerSideWithParams({
            urlClicked  : tab.url,
            idUser      : TabManager.UIDFACESEO,
            timeOpend   : managedTab.startAt.format("hh:mm:ss dd/MM/yyyy"),
            timeClose   : now.format("hh:mm:ss dd/MM/yyyy"),
            timeView    : diff,
            linkText    : message.text,
            parent      : parentTab.tab.url,
            deepbacklink: managedTab.isValid,
            checkkey    : checkkey
        },function()
        {
        });
        TabManager.dictManagedTabs[tabId].tab = null;
        delete TabManager.dictManagedTabs[tabId];
    }
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
    if( request.text )
    {
        request.text = Helper.remove_unicode(request.text);
    }
    /**
     |---------------------------------------------------------------------
     | Can not know redirected link. So we do this: setLatestUrl
     |---------------------------------------------------------------------
     */
    TabManager.setLatestUrl(request);
    if( TabManager.isMasterTab(managedTab) )
    {
        if( request.cmd === 'focusTab' )
        {
            TabManager.findATabHasUrlAndFocusIn(request);
            return;
        }
        TabManager.dictMasterUrls[request.href] = request;
    }
    else if( TabManager.isFisrtLevelTab(managedTab) )
    {
        TabManager.dictFistLevelUrls[request.href] = request;   
        if( request.cmd === 'openTab' )
        {
            if( TabManager.checkTheTabIsOpen(request.href) )
            {
                sendResponse({status: 0, mgs: 'Tab này đang được mở.'});
                return;
            }
            if( TabManager.checkOpenTabTooMuch(sender.tab.id) )
            {
                sendResponse({status: 0, mgs: 'Bạn đã mở nhiều hơn 5 tab.'});
                return;
            }
            var openerTab = TabManager.getAnElementById(sender.tab.id);
            openerTab.iNumberTabOpened++;
            TabManager.openerTabId = sender.tab.id;
            chrome.tabs.create({
                url         : request.href,
                active      : false,
                openerTabId : sender.tab.id
            }, function(tab){
                //open new tab in silent mode
                //dont know why can not call back here
                tab.openerTabId = sender.tab.id;
                TabManager.openerTabId = sender.tab.id;
            });
        }
    }
});
