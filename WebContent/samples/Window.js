new iup.popup.Window({
	title : "someTitle",
	width: 300,
	height : 150,
	modal : false,
	minHeight: 100,
	minWidth : 200,
	minimizable : true
	
}).show();

new iup.popup.Window({
	title : "Modal Window",
	width: 200,
	height : 150,
	minimizable : true,
	resizeModel : 'border'
}).show();

