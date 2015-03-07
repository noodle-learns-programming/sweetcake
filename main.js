jQuery(document).click(function(e){
	var $target = $(e.target);
	var message = {
		text : $target.text(),
		href : Helper.absoluteUrl($target.attr('href')),
	};
	console.log('chrome.runtime.sendMessage | before: ', message);
	chrome.runtime.sendMessage(message, function(response) {
		console.log('chrome.runtime.sendMessage | after:', message, response);
	});
});

Helper = {};
Helper.absoluteUrl = function(url) {
    var img = document.createElement('img');
    img.src = url;
    url 	= img.src;
    img.src = null;
    return url;
};