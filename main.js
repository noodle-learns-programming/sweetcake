jQuery(document).click(function(e){
	var $target = $(e.target);
	var message = {
		text : $target.text(),
		href : $target.attr('href'),
	};
	console.log('chrome.runtime.sendMessage | before: ', message);
	chrome.runtime.sendMessage(message, function(response) {
		console.log('chrome.runtime.sendMessage | after:', message, response);
	});
});
