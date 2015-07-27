function ExamplesPanel() {
	
	
	var store = new iup.data.Store({
		entity : Entities.Parent,
		model : Entities.Parent,
		data : [
			{id : 1, name:"Name1", lastName:"LastName1", creation : Date.parse('06/05/2005')},
			{id : 2, name:"Name2", lastName:"LastName2", creation : Date.parse('06/05/1985')},
			{id : 3, name:"Name3", lastName:"LastName3", creation : Date.parse('06/05/1995')},
			{id : 4, name:"Name4", lastName:"LastName4", creation : Date.parse('06/05/2000')}
		]
	});
	var grid = new iup.layout.Grid({
		columns : [
			{header : "#", key : "id", sortable : true, width : 50, fixed : true},
			{header : "Name", key : "name", sortable : true},
			//{header : "Last Name", key : "lastName", width : 150},
			{
				header : "Age", 
				key : "creation", 
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
	
	var apply = new iup.Button({
		text : 'Apply',
		handler : function(){editor.getRecord().commit();}
	})
	var reset = new iup.Button({
		text : 'Cancel',
		handler : function(){
			editor.reset();
		}
	})
	
	var editor = new iup.form.FieldSet({
		model : Entities.Parent,
		fields : [
			{name : 'id', label : "ID:", readonly : true},
			{name : 'name', label : "Name:", required : true},
			{name : 'creation', type : 'date', label : 'Creation:', showTime : true},
			{
				type : 'multiselect',
				grid		: new iup.layout.Grid({
					store : new iup.data.Store({
						data  :[
							{name : 'aaa'},
							{name : 'bbb'},
							{name : 'ccc'}
						]
					}),
					columns : [{key : 'name'}],
					selectionModel : iup.layout.Grid.SELECTION_MULTI
				}),
				name 		: 'children',
				label 	 	: 'Children',
				displayField: 'name'
			}
		],
		controls : {
			'r' : reset,
			'a' : apply
		}
	});
	
	grid.events.on('select', function(selection){
		editor.loadData(selection[0].record);
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
					apply,
					'->',
					reset
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