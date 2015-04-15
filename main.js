/*
 |---------------------------------------------------------------------
 | To avoid call many times
 |---------------------------------------------------------------------
 */
/* global chrome */

//if( window.__FACE_SEO__ ) return false;
window.__FACE_SEO__ = true;
/*
 |---------------------------------------------------------------------
 | Start embeded code
 |---------------------------------------------------------------------
 */
Config   = {};
Config.isDebug = false;
Helper   = {};
Helper.absoluteUrl = function(url) {
    var img = document.createElement('img');
    img.src = url;
    url     = img.src;
    img.src = null;
    return url;
};
Helper.isMasterTab = function()
{
    if( location.href && location.href.indexOf('//faceseo.vn') >= 3 )
    {
        return true;
    }
    return false;
};
Helper.checkIsImageLink = function($element)
{
    if ($element.is('a')
        && $element.find('>img').length
        && !$.trim($element.text())
    )
    {
        return true;
    }
    return false;
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
    str= str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_/g,"-"); 
    str= str.replace(/-+-/g,"-");
    str= str.replace(/^\-+|\-+$»/g,"");
    str= $.trim(str);
    return str;
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
Helper.arrColors = ['#153436','#fdbd9d','#43b84d','#548751','#424392','#75444f'];
Helper.iCurrentColor = 0;
Helper.highlight = function(keywords)
{
    jQuery('a').each(function(){
        var text = $(this).text();
        if( !text )
        {
            return;
        }
        if( location.host.search('www.google.com') !== -1 )
        {
            if( $(this).data('href') )
            {
                text += (',' + $(this).data('href'));
            }
        }
        text = Helper.remove_unicode(text);
        text = text.replace(/\s+/g, ' ');
        text = $.trim(text);
        if( Helper.isMatchKeywords(keywords, text) )
        {
            $(this).css('color', 'white');
            $(this).css('backgroundColor', Helper.arrColors[Helper.iCurrentColor % Helper.arrColors.length]);
        }
    });
    Helper.iCurrentColor++;
    setTimeout(Helper.highlight.bind(this, keywords), 250);
};
Helper.getText = function($element)
{
    var text        = $element.text();
    if( location.host.search('www.google.com') !== -1 )
    {
        if( $(this).data('href') )
        {
            text += (',' + $(this).data('href'));
        }
    }
    if( !text && location.host.search('facebook.com') !== -1 )
    {
        var $realElements = $element
            .parents('.userContentWrapper')
            .not('.userContent')
            .find('a[href*="l.facebook.com"]');
        text = $realElements.last().text();
    }
    if( Helper.checkIsImageLink($element) )
    {
        text = 'View image';
    }
    return text;
};
if( Config.isDebug ) {
    jQuery('a').css('color', 'green');
}
if( !Helper.isMasterTab() )
{
    jQuery('a').attr('target', '_blank');
}
jQuery(document).ready(function(e){
    if( Config.isDebug ) {
        jQuery('a').css('color', 'red');
    }
    $('#numpoint').css('color', 'red');
});

jQuery('body').on('click', 'a', function(e){
    var $target = $(this);
    var link = $target.attr('href');
    if( !link )
    {
        return;
    }
    if( link.indexOf('@@faceseo@@') !== -1) 
    {
        var arrLink1s = link.split('@@faceseo@@');
        if( arrLink1s[1] )
        {
            var arrLink2s   = arrLink1s[1].split('###');
            var keyword     = arrLink2s[1].replace('!!!', '');
            chrome.runtime.sendMessage({
                'cmd'     : 'focusTab',
                'href'    : arrLink2s[0],
                'keyword' : keyword
            }, function(response) {
                //Return here
            });
        }
        return;
    }
    if( !Helper.isMasterTab() )
    {
        e.preventDefault();
        e.stopImmediatePropagation();
        var text        = Helper.getText($target);
        var originMgs   = text;
        chrome.runtime.sendMessage({
            'cmd'       : 'openTab',
            'text'      : text,
            'originMgs' : originMgs,
            'href'      : Helper.absoluteUrl(link)
        }, function(response) {
            if( response.status === 0 )
            {
                alert(response.mgs);
            }
        });
        return false;
    }
    return true;
});
jQuery('body').on('mouseover', 'a', function(e){
    var $target = $(this);
    var link = $target.attr('href');
    if( link && link.indexOf('@@faceseo@@') >= 0 )
    {
        return;
    }
    var text        = Helper.getText($target);
    var originMgs   = text;
    var message = {
        cmd         : 'addLink',
        text        : text,
        originMgs   : originMgs,
        href        : Helper.absoluteUrl($target.attr('href'))
    };
    chrome.runtime.sendMessage(message, function(response) {
    });
});
