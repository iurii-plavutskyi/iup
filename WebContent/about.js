function AboutPanel() {
	var panel = new iup.layout.Panel({
		style : {backgroundColor : '#ffa'},
		items : [
			new iup.form.Label ({
				text : 'ABOUT!'
			})
		]
	});
	
	this.getPanel = function () {return panel;}
}