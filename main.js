/*
 |---------------------------------------------------------------------
 | To avoid call many times
 |---------------------------------------------------------------------
 */
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
            var arrLink2s = arrLink1s[1].split('###');
            chrome.runtime.sendMessage({
                'cmd'     : 'focusTab',
                'href'    : arrLink2s[0],
                'keyword' : arrLink2s[1]
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
        chrome.runtime.sendMessage({
            'cmd'     : 'openTab',
            'href'    : Helper.absoluteUrl(link)
        }, function(response) {
            if( response.status === 0 )
            {
                alert(response.mgs);
            }
        });
        return false;
    }
});
jQuery('body').on('mouseover', 'a', function(e){
    var $target = $(this);
    var link = $target.attr('href');
    if( link && link.indexOf('@@faceseo@@') >= 0 )
    {
        return;
    } 
    var message = {
        cmd     : 'addLink',
        text    : $target.text(),
        href    : Helper.absoluteUrl($target.attr('href'))
    };
    chrome.runtime.sendMessage(message, function(response) {
    });
});
