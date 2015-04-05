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
    'UPDATE_URL': 'http://faceseo.vn/fs1.4.php',
    'MAX_TIME'  : 420,
    'MIN_TIME'  : 300,
    'MAX_LVL_1' : 5,
    'MAX_LVL_2' : 2,
    'isDebug'   : false
};
var Helper      = {};
Helper.isMasterUrl = function(url)
{
    var regex = new RegExp('https?://'+Config.HOST_URL);
    return url.search(regex) === 0;
};
Helper.isMatchedBetweenTwo = function(str1, str2)
{
    if( !str1 || !str2 )
    {
        return false;
    }
    if( str1.search(str2) >= 0 || str2.search(str1) >= 0 )
    {
        return true;
    }
    return false;
};
Helper.isMatchKeywords = function(keywords, str) {
    var isResult = false;
    if( keywords instanceof Array )
    {
        for(var i = 0; i < keywords.length; i++){
            if( this.isMatchedBetweenTwo(keywords[i], str) ){
                isResult = true;
                break;
            }
        }
    } else {
        isResult = this.isMatchedBetweenTwo(keywords, str);
    }
    return isResult;
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
        deepbacklink: options.deepbacklink ? 1 : 0,
        checkkey    : !options.deepbacklink ? 0 : (options.checkkey ? 1 : 0)

    };
    jQuery.get(Config.UPDATE_URL, params, function(response) {
        if( Config.isDebug ) {
            alert('Update server is sucess!');
        }
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

Helper.isGoogleTab = function(tab)
{
    var regex = new RegExp('https?://(www\.)?google\.com');
    return tab.url.search(regex) === 0;
};

var TabManager  = {};
TabManager.dictMasterUrls       = {};
TabManager.dictOpenedLevelUrls  = {};
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
            isActive: false,
            iNumberTabOpened : 0
        };
    }
    else if ( this.isFisrtLevelTab(openerTab) )
    {
        this.dictManagedTabs[tabInfo.id] = {
            tab     : tabInfo,
            role    : 'SECOND',
            parent  : openerTab,
            startAt : new Date(),
            arrUrls : {},
            iNumberTabOpened : 0
        };
    }
    else if ( this.isSecondLevelTab(openerTab) )
    {
        this.dictManagedTabs[tabInfo.id] = {
            tab     : tabInfo,
            role    : 'THIRD',
            parent  : openerTab,
            startAt : new Date(),
            arrUrls : {},
            iNumberTabOpened : 0
        };
    }
    if( !this.dictManagedTabs[tabInfo.id] )
    {
        console.log('Ops! Why can not get dictManagedTabs of tab:', tabInfo.id);
        return false;
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
TabManager.getFirstLevelParentTab = function(tabId)
{
    var managedTab = this.getAnElementById(tabId);
    if ( this.isThirdLevelTab(managedTab) )
    {
        return managedTab.parent.parent;
    }
    return managedTab.parent;
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
TabManager.isThirdLevelTab = function(tab)
{
    return tab.role === 'THIRD';
};
TabManager.isExist = function(tabId)
{
    return !!this.dictManagedTabs[tabId];
};
TabManager.findATabHasUrlAndFocusIn = function(request)
{
    chrome.tabs.query({}, function (results) {
        var url         = request.href;
        var managedTab  = null;
        var _tab = null;
        var tabId= null;
        for (var i = 0; i < results.length; i++)
        {
            _tab = results[i];
            tabId= _tab.id;
            managedTab = this.dictManagedTabs[tabId];
            if (TabManager.isFisrtLevelTab(managedTab) || TabManager.isSecondLevelTab(managedTab))
            {
                if (managedTab.tab.url === url)
                {
                    try {
                        chrome.tabs.update(tabId | 0, {selected: true}, function () {
                            managedTab.keyword = [];
                            var arrKeywords = request.keyword.split(',');
                            for (var i = 0; i < arrKeywords.length; i++)
                            {
                                managedTab.keyword.push(Helper.remove_unicode(arrKeywords[i]));
                            }
                            managedTab.isActive = true;
                            chrome.tabs.executeScript({
                                code: 'Helper.highlight('+JSON.stringify(managedTab.keyword)+')'
                            });
                        });
                    } catch (e) {
                        console.log('findATabHasUrlAndFocusIn | err:', e);
                    }
                    break;
                }
                for (var href in managedTab.arrUrls)
                {
                    if (href === url)
                    {
                        try {
                            chrome.tabs.update(tabId | 0, {selected: true}, function () {
                                managedTab.keyword = [];
                                var arrKeywords = request.keyword.split(',');
                                for (var i = 0; i < arrKeywords.length; i++)
                                {
                                    managedTab.keyword.push(Helper.remove_unicode(arrKeywords[i]));
                                }
                                managedTab.isActive = true;
                                chrome.tabs.executeScript({
                                    code: 'Helper.highlight('+JSON.stringify(managedTab.keyword)+')'
                                });
                            });
                        } catch (e) {
                            console.log('findATabHasUrlAndFocusIn | err:', e);
                        }
                        break;
                    }
                }
            }
        }
    }.bind(this));
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
    if( tab.url.indexOf('data:') === 0 )
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
            //console.log('------------------------------------');
            //console.log('executeScript all scripts are ok!');
            //console.log('url: ', tab.url);  
        });
    });
};
TabManager._executeScript = function(tab, script, callback)
{
    if( !callback.__loop__ === undefined) {
        callback.__loop__ = 0;
    }
    chrome.tabs.executeScript(tab.id, {file: script}, function(result) {
        if( !result && ++callback.__loop__ < 3)
        {
            setTimeout(TabManager._executeScript.bind(this, tab, script, callback), 1000);
            return;
        }
        callback();
    });
};

TabManager.autoCloseTabs = function() {
    chrome.tabs.query({}, function (results) {
        var dictValidTab    = {};
        var _tab  = null;
        for(var i = 0; i < results.length; i++)
        {
            _tab = results[i];
            dictValidTab[_tab.id] = _tab;
        }
        var diff        = 0;
        var timeToClose = 0;
        var now         = new Date();
        var managedTab  = null;
        for(var tabId in this.dictManagedTabs)
        {
            if( !dictValidTab[tabId] ) {
                delete this.dictManagedTabs[tabId];
                continue;
            }
            managedTab  = this.dictManagedTabs[tabId];
            if( !TabManager.isSecondLevelTab(managedTab) && !TabManager.isThirdLevelTab(managedTab) ) {
                continue;
            }
            diff        = (now - managedTab.startAt) / 1000 | 0;
            timeToClose = Math.floor(Math.random() * (Config.MAX_TIME - Config.MIN_TIME)) + Config.MIN_TIME;
            if( diff > timeToClose ) {
                try {
                    chrome.tabs.remove(tabId|0, function(){
                    });
                } catch (e) {
                    delete this.dictManagedTabs[tabId];
                }
            }
        }
    }.bind(this));
    setTimeout(TabManager.autoCloseTabs.bind(this), 5000);
};
TabManager.checkTheTabIsOpen = function(url)
{
    var managedTab = null;
    for(var tabId in this.dictManagedTabs)
    {
        managedTab = this.dictManagedTabs[tabId];
        if( !TabManager.isSecondLevelTab(managedTab) && !TabManager.isThirdLevelTab(managedTab) )
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
TabManager.pickAPirorityUrl = function(managedTab)
{
    if(managedTab.arrUrls)
    {
        var arrUrls = Object.keys(managedTab.arrUrls);
        if( arrUrls && arrUrls.length )
        {
            return arrUrls[0];
        }
    }
    if( !managedTab.tab )
    {
        return '';
    }
    return managedTab.tab.url || '';
};
TabManager.checkOpenTabTooMuch = function(openerTabId)
{
   var managedTab = this.dictManagedTabs[openerTabId];
   if( managedTab )
   {
        if( TabManager.isFisrtLevelTab(managedTab) && managedTab.iNumberTabOpened >= Config.MAX_LVL_1 )
        {
            return Config.MAX_LVL_1;
        }
        if( TabManager.isSecondLevelTab(managedTab) && managedTab.iNumberTabOpened >= Config.MAX_LVL_2)
        {
            return Config.MAX_LVL_2;
        }
   }
   return false;
};
TabManager.validateOpenFromGoogleTab = function(openerTab, request)
{
    var managedTab = this.getAnElementById(openerTab.tab.id);
    if( !managedTab ) {
        console.log('Khong tim thay openerTab! Omg!');
        return true;
    }
    var asciiLink  = Helper.remove_unicode(request.href);
    var textLink   = request.text;//It's already converted to ascii
    var arrKeyword = managedTab.arrUrls ? Object.keys(managedTab.arrUrls) : [];
        arrKeyword.push(managedTab.tab.url);
        if( managedTab.keyword instanceof Array ) {
            Array.prototype.push.apply(arrKeyword, managedTab.keyword);
        }
    var isResult    = Helper.isMatchKeywords(arrKeyword, asciiLink)
                    || Helper.isMatchKeywords(arrKeyword, textLink);
    return isResult;
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
    TabManager.updateTab(tab);
    TabManager.executeScript(tab);
    var managedTab = TabManager.getAnElementById(tab.id);
    if( !TabManager.isSecondLevelTab(managedTab) && !TabManager.isThirdLevelTab(managedTab) )
    {
        return;
    }
    //Thiet la eo le ma. Khong hieu tai sao co thang lai goi ca co /
    var message = TabManager.dictOpenedLevelUrls[tab.url] || TabManager.dictOpenedLevelUrls[tab.url+'/'];
    if( message && !managedTab.isSentOpened )
    {
        managedTab.isSentOpened = true;
        var parentTab   = TabManager.getFirstLevelParentTab(tab.id);
        var checkkey    = Helper.isMatchKeywords(parentTab.keyword, message.text);
        var parentUrl   = TabManager.pickAPirorityUrl(parentTab);
        try {
            Helper.updateServerSideWithParams({
                urlClicked  : tab.url,
                idUser      : TabManager.UIDFACESEO,
                timeOpend   : managedTab.startAt.format("hh:mm:ss dd/MM/yyyy"),
                timeClose   : 'In view',
                timeView    : 0,
                linkText    : message.text,
                parent      : parentUrl,
                deepbacklink: parentTab.isActive,
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
    var managedTab  = TabManager.getAnElementById(tabId);
    var parentTab   = TabManager.getFirstLevelParentTab(tabId);
    if( managedTab && managedTab.isSentOpened )
    {
        var tab         = managedTab.tab;
        var message     = TabManager.dictOpenedLevelUrls[tab.url];
        var now         = new Date();
        var diff        = (now - managedTab.startAt) / 1000 | 0;
        var checkkey    = Helper.isMatchKeywords(parentTab.keyword, message.text);
        var parentUrl   = TabManager.pickAPirorityUrl(parentTab);
        Helper.updateServerSideWithParams({
            urlClicked  : tab.url,
            idUser      : TabManager.UIDFACESEO,
            timeOpend   : managedTab.startAt.format("hh:mm:ss dd/MM/yyyy"),
            timeClose   : now.format("hh:mm:ss dd/MM/yyyy"),
            timeView    : diff,
            linkText    : message.text,
            parent      : parentUrl,
            deepbacklink: parentTab.isActive,
            checkkey    : checkkey
        },function()
        {
        });
        TabManager.dictManagedTabs[tabId].tab = null;
        delete TabManager.dictManagedTabs[tabId];
    }
    if( parentTab ) {
        parentTab.iNumberTabOpened--;
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
    else if( TabManager.isFisrtLevelTab(managedTab) || TabManager.isSecondLevelTab(managedTab) )
    {
        TabManager.dictOpenedLevelUrls[request.href] = request;
        if( request.cmd === 'openTab' )
        {
            var openerTab = TabManager.getAnElementById(sender.tab.id);
            //Should update keyword here for level 2! Ugly!
            /*if( TabManager.isSecondLevelTab(openerTab) ) {
                if( openerTab.parent && openerTab.parent.keyword ) {
                    openerTab.keyword = openerTab.parent.keyword;
                } else {
                    openerTab.keyword = request.text;
                }
            }*/
            if( Helper.isGoogleTab(sender) && !TabManager.validateOpenFromGoogleTab(sender, request) )
            {
                sendResponse({status: 0, mgs: 'Bạn click sai domain hoặc chưa click link nháy nháy.'});
                return;
            }
            if( TabManager.checkTheTabIsOpen(request.href) )
            {
                sendResponse({status: 0, mgs: 'Tab này đang được mở.'});
                return;
            }
            var iNumberTabOpened = TabManager.checkOpenTabTooMuch(sender.tab.id);
            if( iNumberTabOpened )
            {
                sendResponse({status: 0, mgs: 'Bạn đã mở nhiều hơn '+iNumberTabOpened+' tab.'});
                return;
            }
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
            return;
        }
    }
    if( request.cmd === 'openTab' )
    {
        chrome.tabs.create({
            url         : request.href,
            active      : true,
            openerTabId : sender.tab.id
        }, function(tab){
            //Open tab for user
        });
        return;
    }
});
