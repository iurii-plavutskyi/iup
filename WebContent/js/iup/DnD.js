/*function GridColumnModificationManager(oGrid) {
	var resize = false;
	var resizeColumnIdx;
	var resizeOffset = 0;
 	var headers;
 	var headerPositions = [];
    var dragObject;
    var originalDragObject;
    var mouseOffset;
 	var grid = oGrid;
 	
 	var dragMaster = new DragMaster({
 		mouseUp		: function() {
 			if (resize) {
	    		resize = false;
	    	} else {
	    		if (dragObject != null) {
			    	var columnPosition = 0;
			    	$.each(headers.children, function(idx, column) {
			    		if (column == originalDragObject) {
			    			columnPosition = idx;
			    		}
			    	});
			    	if (columnPosition > dragObject.position) {
			    		dragObject.position += 1;
			    	}
			    	if (columnPosition != dragObject.position) {
			    		grid.moveColumn(columnPosition, dragObject.position);
			    	}
			    	$(dragObject).remove();
			    	dragObject = null;
		    	}
		 		originalDragObject = null;
	    	}
 		},
 		mouseMove	: function (e) {
 			if (resize) {
		    	grid.resizeColumn(resizeColumnIdx, e.pageX - resizeOffset);
		    	resizeOffset = e.pageX;
	    	} else {
		        if (dragObject == null) {
		        	dragObject = document.createElement('div'); 
		        	dragObject.className = "dragged-header";
		        	dragObject.style.width = (originalDragObject.column.calculatedWidth || originalDragObject.column.width) + 'px';
		        	for (var i = 0; i < originalDragObject.children.length; i++) {
		        		dragObject.appendChild(originalDragObject.children[i].cloneNode(true));
		        	}
//		        	dragObject = originalDragObject.cloneNode(true);
//		        	dragObject.style.zIndex = '999999';
		        	document.getElementsByTagName("body")[0].appendChild(dragObject);
		        }
		 
		        with(dragObject.style) {
		            position = 'absolute';
		            top = e.pageY - mouseOffset.y + 'px';
		            left = e.pageX - mouseOffset.x + 'px';
		        }
		        calcColumnPosition(e);
	    	}
 		},
 		mouseDown	: function(e, element) {
 			calcHeaderPositions();
        
	      //  if (e.pageX < headerPositions[headerPositions.length - 1].left) { 
		        
		        mouseOffset = getMouseOffset(element, e);
		        
		        for (var i = 1; i < headerPositions.length; i++) {
		        	if ( Math.abs(headerPositions[i].left - e.pageX) < 5) {
		        		resizeColumnIdx = i - 1;
		        		resize = true;
		        		break;
		        	}
		        }
		        if (resize) {
		        	resizeOffset = e.pageX;
		        } else {
		        	originalDragObject = element;
		        }
		        
		        return true;
	     //   }
	        
	    //    return false;
 		}
 	});
 	
 	function getMouseOffset(target, e) {
        var docPos  = getPosition(target);
        return {x:e.pageX - docPos.x, y:e.pageY - docPos.y};
    }
 	
 	function calcHeaderPositions() {
		headerPositions = [];
		$.each(headers.children, function(idx, header) {
			var offset = $(header).offset();
			headerPositions.push({
				top : offset.top,
				left : offset.left,
				width : $(header).width(),
				height : $(header).height()
			});
		});
	}   
	
	function calcColumnPosition(e) {
    	dragObject.position = -1;
    	
    	for(var i = 0; i < headers.children.length; i++) {
    		if (e.pageX < headerPositions[i].left + headerPositions[i].width/2) {
    			break;
    		} else {
    			dragObject.position = i;
    		}
    	} 
    }
    
    this.makeDraggable = function(element){
    	dragMaster.makeDraggable(element);
//        element.onmousedown = mouseDown;
    };
    
    this.setHeaders = function(aTr) {
    	headers = aTr;
    };
}*/

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
        if (e.which!=1) return;
 		
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

	if ( e.pageX == null && e.clientX != null ) {
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
}

