//iup.form.MultiselectField 


iup.form.MultiselectField = function(oCfg) {
	var sameVal = oCfg.sameVal || function(val1, val2) {return val1 === val2;}
	var converter = oCfg.converter || function(record) {return record.value();}
	
	var grid = oCfg.grid;
	
	var ok = new iup.Button({
		className 	: 'button add',
		text		: 'OK',
		icon		: 'img/icoCheckGreen16r.png'
	});
	
	var win = new iup.popup.Window({
		minWidth : 400,
		minHeight : 400,
		content	: grid,
		bbar	: ['->', ok]
	});
	
	var field = new iup.form.ButtonField({
 		name 		: oCfg.name,
 		label 		: oCfg.label,
 		width		: oCfg.width,
 		renderer	: oCfg.renderer	|| function(val) {
		//	val && console.log(val);
			if (val) {
				val = val.getData()
				var values = [];
				
				for (var i = 0; i < val.length; i++) {
					var displayVal = typeof oCfg.displayField == 'function' ? oCfg.displayField(val[i]) : val[i].get(oCfg.displayField);
					values.push(displayVal);
				}
				return values.join(', ');
			} else {
				return '';
			}
		},
 		buttons		: [
 			{
 				icon : 'img/iconList16r.png', 
 				handler : function() {
	 				win.show();
					var inputOffset = $(field.getEl()).offset();
						inputOffset.top += $(field.getEl()).outerHeight();
						$(win.getEl()).offset(inputOffset);
					var currValue = field.getField()._value.getData();
					var selected = [];
					var allRecords = grid.getStore().getData();
					for (var i = 0, n = currValue.length; i < n; i++) {
						for (var j = 0, m = allRecords.length; j < m; j++) {
							if (sameVal(currValue[i], allRecords[j])) {
								selected.push(allRecords[j]);
								
								break;
							}
						}
					}
					console.log(selected, currValue, allRecords);
					grid.selectRecords(selected || []);
				}
 			},
 			{
 				icon : 'img/ic_del.png', 
 				handler : function () {
					field.getField().set([]);
				}
 			}
 		]
 	});
 	
	ok.setHandler(function(){
		var data = [];
		var rows = grid.getSelectedRows();
		
		
		
		//field.getField()._value.clear(true);
		for (var i = 0; i < rows.length; i++) {
			data.push(converter(rows[i].record));
		}
		field.getField().set(data);
		field.refresh();
		//field.getValue().loadData(data);
		win.hide();
	});
	
	return field;
};

iup.form.MultiselectField.type = 'multiselect';


/*
iup.form.MultiselectField.Picker = function(oCfg) {
	var cfg = {
		columns	: oCfg.columns,
		title	: oCfg.title,
		url		: oCfg.url,
		height 	: oCfg.height || 400,
		width 	: oCfg.width || 400
	};
	
	var eventManager = new iup.EventManager({events : ['select']});

	var selectedRecords = [];
	var store = new iup.data.Store({
		params				: {orderBy : 'name:asc'},
		url 				: cfg.url,
		method				: 'GET',
		autoLoad			: false
	});

	var oGrid = new iup.layout.Grid({
		store 			: store,
		emptyText 		: 'No data loaded',
		selectionModel 	: 'multi',
		filter			: function (record) {
			var found = false;
			$.each(selectedRecords, function(idx, selected) {
				if (selected.id == record.get('id')) {
					found = true;
				}
			});	
			return !found;
		},
		handlers 		: { 
			rowDblClick : function(row) {
				eventManager.fireEvent('select', [row.record.getData()]);
				win.hide();
			}
		},
		columns 		: cfg.columns
	});
	
	store.load();
	
	var button = new iup.Button({
		text		: 'OK',
		className	: 'button add',
		icon		: 'img/icoCheckGreen16r.png',
		handler 	: function() {
			var rows = oGrid.getSelectedRows();
			var values = [];
			
			for (var i = 0; i < rows.length; i++) {
				values.push(rows[i].record.getData());
			}
			
			eventManager.fireEvent('select', values);
			win.hide();
		}
	});
	
	var win = new iup.popup.Window({
		title 		: cfg.title,
		width 		: cfg.width,
		height		: cfg.height,
		minWidth	: 400,
		minHeight	: 300,
		resizeModel : 'border',
		content		: oGrid,
		bbar		: ['->', button]
	});
	
	this.getStore = function() {
		return store;
	};
	
	this.show = function(aSelected) {
		selectedRecords = aSelected || []; 
		win.show();
		oGrid.rebuildBody();// grids should update after window.show(), otherwise it's impossible to detect scroll on hidden grid;
	};
	
	this.on = function (eventName, handler) {
		eventManager.addHandler(eventName, handler);
	};
};

iup.form.MultiselectField.Grid = function(oCfg) {
	var cfg = {
		columns 		: oCfg.columns,
		picker			: oCfg.picker,
		field			: oCfg.field,
		title			: oCfg.title || '',
		additionalButtons : oCfg.additionalButtons || []
	};
	
	var store = new iup.data.Store({
		autoLoad	: false,
		data		: []
	});
	
	cfg.picker.on('select', function(records) {
		if (records.length > 0) {
			var items = cfg.field.get();
			cfg.field.set(items.concat(records), true);
			store.loadData(cfg.field.get());
		}
	});
	
	var add = new iup.Button({
		text 		: 'Add',
		className	: 'button add',
		textClass 	: 'xf9',
		icon		: 'img/ic_add.png',
		handler		: function() {
			cfg.picker.show(cfg.field.get());
		}
	});
	
	var remove = new iup.Button({
		text 		: 'Delete',
		className	: 'button delete',
		textClass 	: 'xf9',
		icon		: 'img/ic_del.png',
		disabledIcon: 'img/ic_del_tr.png',
		disabled	: true,
		handler		: function() {
			new iup.popup.ConfirmationWindow({
				title				: 'Confirm',
				message				: 'Are you sure you want to remove selected items?',
				confirmButtonText	: 'Yes',
				cancelButtonText	: 'No',
				onconfirm			: function() {
					var rows = grid.getSelectedRows();
					var items = cfg.field.get();
					var row;
					while (row = rows.shift()) {
						var id = row.record.get('id');
						var idx = -1;
						for (var i in items) {
							if (items[i].id == id) {
								idx = i;
								break;
							}
						}
						items.splice(idx, 1);
					}
					cfg.field.set(items, true);
					store.loadData(cfg.field.get());
				}
			});
		}
	});
	
	var buttons	= [add, remove].concat(cfg.additionalButtons);
	
	var buttonPanel = new iup.layout.Toolbar({
		items	: [
			new iup.form.Label({text : cfg.title, className : 'grid-title'}), 
			'->'
		].concat(buttons),
		marginBetweenItems	: 5
	});
	
	store.on('load', function() {
		remove.disable();		
	});
	
	var grid = new iup.layout.Grid({
		store			: store,
		emptyText 		: 'No data loaded',
		selectionModel 	: 'multi',
		handlers		: {
			select	: function() {
				if (grid.getSelectedRows().length > 0) {
					remove.enable();
				} else {
					remove.disable();
				}
			}
		},
		columns 		: cfg.columns
		
	});
	
	this.setField = function(field) {
		cfg.field = field;
		store.loadData(field.get());
	};
	
	this.buildPanel = function() {
		return new util.layout.BorderPanel({
			layoutConfig : {
				top	: 27
			},
			top : buttonPanel,
			center : grid
		});
	};
	
	this.hideButtons = function () {
		for (var idx in buttons) {
			buttons[idx].hide();
		}
	};
	
	this.showButtons = function () {
		for (var idx in buttons) {
			buttons[idx].show();
		}
	};
};

*/
