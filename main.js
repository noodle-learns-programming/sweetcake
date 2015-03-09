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
    jQuery(document).click(function(e){
        var $target = $(e.target);
        var message = {
            text : $target.text(),
            href : Helper.absoluteUrl($target.attr('href')),
        };
        chrome.runtime.sendMessage(message, function(response) {
        });
    });
});
