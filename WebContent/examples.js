function ExamplesPanel() {
	
	
	var store = new iup.data.Store({
		data : [
			{name:"Name1", lastName:"LastName1", birthDate : Date.parse('06/05/2005')},
			{name:"Name2", lastName:"LastName2", birthDate : Date.parse('06/05/1985')},
			{name:"Name3", lastName:"LastName3", birthDate : Date.parse('06/05/1995')},
			{name:"Name4", lastName:"LastName4", birthDate : Date.parse('06/05/2000')}
		]
	});
	var grid = new iup.layout.Grid({
		columns : [
			{header : "Name", key : "name", sortable : true},
			{header : "Last Name", key : "lastName", width : 150},
			{
				header : "Age", 
				key : "birthDate", 
				width : 50, 
				fixed : true, 
				sortable : true,
				renderer : function(val) {
					var now = new Date();
					var val = new Date(val);
					var month = (now.getDate() >= val.getDate()) ? 1 : 0;
					var year = (now.getMonth() + month > val.getMonth()) ? 1 : 0;
					return now.getFullYear() - val.getFullYear() + year;
				}
			}       
		],
		emptyText : "no data",
		store : store,
		selectionModel : iup.layout.Grid.SELECTION_SINGLE
	});
	
	var editor = new iup.form.FieldSet({
		fields : [
			{name : 'name', label : "Name:", required : true},
			{name : 'lastName'},
			{name : 'birthDate', type : 'date', label : 'Birth:', showTime : true}
		]
	});
	
	grid.events.on('select', function(selection){
		editor.loadRecord(selection[0].record);
	});
	
	var contentManagement = new iup.layout.BorderPanel({
		splitter : ['left'],
		layoutConfig : {left : 400},
		left : grid,
		center : new iup.layout.BorderPanel({
			layoutConfig : {bottom : 30},
			center : editor,
			bottom : new iup.layout.Toolbar({
				content : [
					new iup.Button({
						text : 'Apply',
						handler : function(){editor.getRecord().commit();}
					}),
					'->',
					new iup.Button({
						text : 'Cancel',
						handler : function(){
							//editor.getRecord().rollback();
							editor.reset();
						}
					})
				]
			})
		})
	})
	
	var panel = new iup.layout.TabPanel({
		buttonsPosition : 'left',
		content : [
			{title : 'Content Management', content : contentManagement},
			{title : 'HTML', content : new iup.layout.Panel({style : {backgroundColor : '#aaa'}})}
		]
	})
	
	this.getPanel = function () {return panel;}
}