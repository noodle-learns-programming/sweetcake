var allLinks 	= document.getElementsByTagName("a");
var link 		= null;
console.log(allLinks.length);
for(var i = 0; i < allLinks.length; i++)
{
	link = allLinks[i];
	link.innerText = 'Phu test';
}
