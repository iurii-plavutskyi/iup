var Entities = {

	Parent : {
		name : 'Parent',
		fields : [
			{name : 'id', type : 'number'},
			{name : 'name', type : 'string'},
			{name : 'creation', type : 'date'},
			{name : 'children', type : 'Child[]'}
		]
	},
	Child : {
		name : 'Child',
		fields : [
			{name : 'id', type : 'number'},
			{name : 'name', type : 'string'},
			{name : 'start', type : 'number'},
			{name : 'end', type : 'number'},
			{name : 'creation', type : 'date'}
		]
	}
}
