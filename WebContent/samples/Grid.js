const gen = function*(num){
	for (let i = 0; i < num; i++) {
		yield {id : i, name : 'Name'+i, date : new Date(), field1 : 'f'+i}
	}
}

var store = new iup.data.Store({
	data : [...gen(15)],
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
