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
            name : 'active',
            type : 'checkbox',
            label: 'Check:',
            text : 'TEXT'
        },
        {
            name : 'age',
            type : 'number',
            label: 'Num:',
            required : true,
            placeholder : 'integer only'
        },
        {
            name : 'spinerValue',
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
                ]
            }),
            label : 'Combo',
	    name: 'combo.value',
            valueField 	: 'val',
	    displayField: 'val'
        }
        
    ]
})