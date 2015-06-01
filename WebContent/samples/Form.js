return new iup.form.FieldSet({
    labelWidth : 100,
    columns : 2,
    fields : [
        {
            name : 'name',
            label : 'Label:',
            placeholder : 'input value'
        },
        {
            name : 'name',
            type : 'checkbox',
            label: 'Check:'/*,
            text : 'TEXT'*/
        },
        {
            name : 'name',
            type : 'number',
            label: 'Num:',
            required : true,
            placeholder : 'integer only'
        },
        {
            name : 'name',
            type : 'spinbox',
            maxVal : 10,
            minVal : -5,
            label: 'Spinner:'
        },
        {
            type : 'combobox',
            required:true,
            store : new iup.data.Store({
                data : [
                    {val : 'abc'},
                    {val : 'abcd'},
                    {val : 'bcd'},
                    {val : 'cde'}
                ],
                autoLoad : false
            }),
            label : 'Combo',
            valueField 	: 'val',
	    displayField: 'val'
        }
        
    ]
})