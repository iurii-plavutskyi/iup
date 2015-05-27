var tabA = new iup.layout.Panel({ 
    style: {backgroundColor:'#aaf'} 
}); 

var tabB = new iup.layout.Panel({ 
    style: {backgroundColor:'#65a'} 
}); 
var tabC = new iup.layout.Panel({ 
    style: {backgroundColor:'#ff5'} 
}); 
		 
return new iup.layout.TabPanel({
    style: { 
        backgroundColor:'#ffa' 
    }, 
    items : [ 
        {title : 'Tab A', content : tabA}, 
        {title : 'Tab B', content : tabB}, 
        {title : 'Tab C', closable: true, content : tabC}  
    ] 
});