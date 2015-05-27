var store = new iup.data.Store({
	data : [
		{id : 0, name : 'Name0', date : new Date(), field1 : 'f01', field2 : 'f02'},
		{id : 1, name : 'Name1', date : new Date(), field1 : 'f11', field2 : 'f12'},
		{id : 2, name : 'Name2', date : new Date(), field1 : 'f21', field2 : 'f22'},
		{id : 3, name : 'Name3', date : new Date(), field1 : 'f31', field2 : 'f32'},
		{id : 4, name : 'Name4', date : new Date(), field1 : 'f41', field2 : 'f42'},
		{id : 5, name : 'Name5', date : new Date(), field1 : 'f51', field2 : 'f52'},
		{id : 6, name : 'Name6', date : new Date(), field1 : 'f61', field2 : 'f62'},
		{id : 7, name : 'Name7', date : new Date(), field1 : 'f71', field2 : 'f72'},
		{id : 8, name : 'Name8', date : new Date(), field1 : 'f81', field2 : 'f82'},
		{id : 9, name : 'Name9', date : new Date(), field1 : 'f91', field2 : 'f92'}
	],
	autoLoad : false
});

return new iup.layout.Grid({
	store : store,
	columns : [
		{key : 'id', header : '#', width : 40, fixed : true, sortable : true},
		{key : 'name', header : 'Name', sortable : true},
		{key : 'date', header : 'Date', renderer : function(val){return iup.utils.convertDate(val);}},
		{key : 'field1', header : 'Some other field'},
	]
})
