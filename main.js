jQuery('a').css('color', 'red');

jQuery('a').click(function(e){
	var message = {
		text : $(this).text(),
		href : $(this).attr('href'),
	};
	console.log('chrome.runtime.sendMessage | before: ', message);
	chrome.runtime.sendMessage(message, function(response) {
		console.log('chrome.runtime.sendMessage | after:', message, response);
	});
});
