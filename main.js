/*
 |---------------------------------------------------------------------
 | To avoid call many times
 |---------------------------------------------------------------------
 */
if( window.__FACE_SEO__ ) return;
window.__FACE_SEO__ = true;
/*
 |---------------------------------------------------------------------
 | Start embeded code
 |---------------------------------------------------------------------
 */
Helper   = {};
Helper.absoluteUrl = function(url) {
    var img = document.createElement('img');
    img.src = url;
    url     = img.src;
    img.src = null;
    return url;
};
jQuery('a').css('color', 'green');
jQuery('a').attr('target', '_blank');
jQuery(document).ready(function(e){
    jQuery('a').css('color', 'red');
});

jQuery('body').on('click', 'a', function(e){
    var $target = $(this);
    var link = $target.attr('href');
    if( link && link.indexOf('@@faceseo@@') !== -1) 
    {
        var arrLink1s = link.split('@@faceseo@@');
        if( arrLink1s[1] )
        {
            var arrLink2s = arrLink1s[1].split('###');
            chrome.runtime.sendMessage({
                'cmd'     : 'focusTab',
                'href'    : arrLink2s[0]
            }, function(response) {
                //Return here
            });
        }
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
        href    : Helper.absoluteUrl($target.attr('href')),
    };
    chrome.runtime.sendMessage(message, function(response) {
    });
});
