Helper = {};
Helper.absoluteUrl = function(url) {
    var img = document.createElement('img');
    img.src = url;
    url     = img.src;
    img.src = null;
    return url;
};
jQuery(document).ready(function(e){
    jQuery('a').css('color', 'red');
});

jQuery(document).click(function(e){
    var $target = $(e.target);
    var link = $target.attr('href');
    if( link.indexOf('@@faceseo@@') !== -1) 
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
