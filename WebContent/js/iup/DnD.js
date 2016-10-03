iup.DragMaster = function(oCfg) {
	var cfg = {
		mouseUp		: oCfg.mouseUp,
		mouseDown	: oCfg.mouseDown,
		mouseMove	: oCfg.mouseMove
	};
	
	var moveStart = false;

    function mouseUp() {
    	cfg.mouseUp();

    	document.onmousemove = null;
        document.onmouseup = null;
        document.ondragstart = null;
        document.body.onselectstart = null;
        
    }
 
    function mouseMove(e) {
    	e = fixEvent(e);
    	
    	cfg.mouseMove(e);
    	
    	if (moveStart) {
//    		document.body.onselectstart = function() { return false; };
    		if (window.getSelection) { window.getSelection().removeAllRanges();
    		} else if (document.selection) {document.selection.empty();}
    		moveStart = false;
    	}
        return false;
    }
    
    function mouseDown(e) {
        e = fixEvent(e);
        if (e.which!=1) {return;}
 		
        if (cfg.mouseDown(e, this)) {
        	document.ondragstart = function() { return false; };
        	document.body.onselectstart = function() { return false; };
	        document.onmousemove = mouseMove;
	        document.onmouseup = mouseUp;
        }
        moveStart = true;
       // return false;
    }
 
    this.makeDraggable = function(element){
        element.onmousedown = mouseDown;
    };
	
	function fixEvent(e) {
	e = e || window.event;

	if ( !e.pageX && e.clientX ) {
		var html = document.documentElement;
		var body = document.body;
		e.pageX = e.clientX + (html && html.scrollLeft || body && body.scrollLeft || 0) - (html.clientLeft || 0);
		e.pageY = e.clientY + (html && html.scrollTop || body && body.scrollTop || 0) - (html.clientTop || 0);
	}

	if (!e.which && e.button) {
		e.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );
	}

	return e;
}
};


iup.DragMaster.getPosition = function(e) {
	var left = 0;
	var top = 0;
 
	while (e.offsetParent){
		left += e.offsetLeft;
		top += e.offsetTop;
		e = e.offsetParent;
	}
 
	left += e.offsetLeft;
	top += e.offsetTop;
 
	return {x:left, y:top};
};

