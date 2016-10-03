"use strict";

/*if(typeof iup == "undefined"){
	iup = {};
}

if(typeof iup.popup == "undefined"){
	iup.popup = {};
}*/
iup.popup = {};
iup.popup.zIndex = 0;

iup.utils.createComponent('iup.popup.Window', undefined, function(){
	function WindowResizeManager(win) {
	   // var mouseOffset = null;
	 	var dragStartPosition = null;
	 	var prevDragPosition = null;
	 	var currentElement = null;
	    var resizeDiv = null;
		var cfg = win.cfg;
		var table = win._state.table;
	 	 
	 	function createResizeDiv() {
			var borderWidth = 2;
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.border = borderWidth + 'px solid #ccc';
			div.style.width = $(table).outerWidth() - 2*borderWidth + 'px';
			div.style.height = $(table).outerHeight() - 2*borderWidth + 'px';
			$(div).offset( $(table).offset() );
			div.style.borderRadius = '5px';
			div.style.zIndex = iup.popup.zIndex++;
			document.getElementsByTagName('body')[0].appendChild(div);
			return div;
		}
		
	 	var dragMaster = new iup.DragMaster({
	 		mouseUp		: function(e) {
	 			if (cfg.resizeModel === 'border') {
		 			$(resizeDiv).remove();
		 			var resize = calcResize(dragStartPosition, prevDragPosition, table);
		 			win.resize(resize.dX, resize.dY);
			        if (resize.hMove || resize.vMove) {
			        	win.move(resize.hMove ? -resize.dX : 0, resize.vMove ? -resize.dY : 0);
			        }
	 			}
				document.getElementsByTagName('body')[0].style.cursor = '';
	 		},
	 		
	 		mouseMove	: function (e) {
	 			if (cfg.resizeModel === 'border') {
	 				var resize = calcResize(prevDragPosition, {x : e.pageX, y : e.pageY}, resizeDiv);
			        $(resizeDiv).width($(resizeDiv).width() + resize.dX); 
			        $(resizeDiv).height($(resizeDiv).height() + resize.dY);
					//resizeDiv.style.width = resizeDiv.clientWidth + resize.dX;
	 				//resizeDiv.style.height = resizeDiv.clientHeight + resize.dY;
					
			        if (resize.hMove || resize.vMove) {
			        	var offset = $(resizeDiv).offset();
			        	offset.top += resize.vMove ? -resize.dY : 0;
			        	offset.left += resize.hMove ? -resize.dX : 0;
			        	$(resizeDiv).offset(offset);
			        }
	 			} else {
	 				var resize = calcResize(prevDragPosition, {x : e.pageX, y : e.pageY}, table);
		 			win.resize(resize.dX, resize.dY);
			        if (resize.hMove || resize.vMove) {
			        	win.move(resize.hMove ? -resize.dX : 0, resize.vMove ? -resize.dY : 0);
			        }
	 			}
	 		},
	 		mouseDown	: function(e, element) {
				//mouseOffset = getMouseOffset(element, e);
	       		dragStartPosition = {x : e.pageX, y : e.pageY};
	       		prevDragPosition = {x : e.pageX, y : e.pageY};
	       		currentElement = element;
	       		if (cfg.resizeModel === 'border') {
	       			resizeDiv = createResizeDiv();
	       		}
				document.getElementsByTagName('body')[0].style.cursor = currentElement.style.cursor;
		        return true;
	 		}
	 	});
	 	
	 	function getMouseOffset(target, e) {
	        var docPos  = iup.DragMaster.getPosition(target);
	        return {x:e.pageX - docPos.x, y:e.pageY - docPos.y};
	    }
	 	
	    this.makeDraggable = function(element){
	    	dragMaster.makeDraggable(element);
	    };
	    
	    
	    function calcResize(start, end, el) {
	   		var hMove = false;
 			var vMove = false;
 			
 			var dX = end.x - start.x;
	       
	        if (currentElement.hResize) {
	        	if (currentElement.hResize === "e") {
		        	hMove = true;
		        	dX = -dX;
	        	}
	        	var allowedWidthReduction = $(el).innerWidth() - cfg.minWidth;
		        if (allowedWidthReduction < -dX) {
		        	dX = -allowedWidthReduction;
		        	start.x += hMove ? -dX : dX;
		        } else {
		        	start.x = end.x;
		        }
		        
	        } else {
	        	dX = 0;
	        }
	        
	        var dY = end.y - start.y;
	        
	        if (currentElement.vResize) {
	        	if (currentElement.vResize === "n") {
		        	vMove = true;
		        	dY = -dY;
	        	}
	        	var allowedHeightReduction = $(el).innerHeight() - cfg.minHeight;
		        if (allowedHeightReduction < -dY) {
		        	dY = -allowedHeightReduction;
		        	start.y += vMove ? -dY : dY;
		        } else {
		        	start.y = end.y;
		        }
	        } else {
	        	dY = 0;
	        }
	        
	        return {dX : dX, dY : dY, hMove : hMove, vMove : vMove};
	    }
	}

	function WindowDragManager(win) {
	    var mouseOffset = null;
	    var windowSize = null;
	    var screenSize = null;
	 	var cfg = win.cfg;
	 	var dragMaster = new iup.DragMaster({
	 		mouseUp		: function() {
	 		},
	 		mouseMove	: function (e) {
	 			var s = win._state.table.style;
		        s.position = 'absolute';
		        if (e.pageY < mouseOffset.y) {
		        	s.top = '0px';
		        } else if (screenSize.y < (e.pageY - mouseOffset.y + windowSize.y)) {
		        	s.top = Math.max(0, screenSize.y - windowSize.y) + 'px';
		        } else {
		        	s.top = e.pageY - mouseOffset.y + 'px';
		        }
		        
		        if (e.pageX < mouseOffset.x) {
		        	s.left = '0px';
		        } else if (screenSize.x < (e.pageX - mouseOffset.x + windowSize.x)) {
		        	s.left = screenSize.x - windowSize.x  + 'px';
		        } else {
		        	s.left = e.pageX - mouseOffset.x + 'px';
		        }
	 		},
	 		mouseDown	: function(e, element) {
	 			if (e.target === win._state.closeButton._getStyleEl()) {
	 				return false;
	 			}
	       		mouseOffset = getMouseOffset(element, e);
	       		windowSize = {x : $(win._state.table).width(), y : $(win._state.table).outerHeight()};
	       		screenSize = {x : $(window).width(), y : $(window).height()};
		        return true;
	 		}
	 	});
	 	
	 	function getMouseOffset(target, e) {
	        var docPos  = iup.DragMaster.getPosition(target);
	        return {x:e.pageX - docPos.x + cfg.resizeBorder + 1, y:e.pageY - docPos.y + cfg.resizeBorder + 1};
	    }
	 	
	    this.makeDraggable = function(element){
	    	dragMaster.makeDraggable(element);
	    };
	    
	}
	
	function animatedMove(oCfg) {
		var self = this;
		var cfg = {
			start : {x : oCfg.start.x, y : oCfg.start.y},
			end : {x : oCfg.end.x, y : oCfg.end.y},
			time : oCfg.time || 300,
			callback : oCfg.callback
		};
		
		var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

	//	var start = new Date().getTime();
		var animationStartTime = window.performance.now();
		
		function step(timestamp) {
			var progress = (timestamp - animationStartTime)/ cfg.time,
				x = cfg.end.x + (( cfg.start.x - cfg.end.x ) * (1 - progress)),
				y = cfg.end.y + (( cfg.start.y - cfg.end.y ) * (1 - progress));
			
			if (progress < 1) {
				self.setPosition(x, y);
				requestAnimationFrame(step);
			} else {
				self.setPosition(cfg.end.x, cfg.end.y);
				cfg.callback();
			}
		}
		requestAnimationFrame(step);
	} 
	
	function buildThumbnail() {
		var self = this,
			thumb = self._state.thumb,
			cfg = this.cfg;
		if (!thumb) {
			thumb = document.createElement("div");
			thumb.innerHTML = cfg.title;
			thumb.className = 'window-minimized';
			
			thumb.onclick = function(){
				self.restore();
				var height = $(window).height();
				animatedMove.call(self,{
					end : {
						x : self._state.position.left,
						y : self._state.position.top
					},
					start : {
						x : 0,
						y : height
					},
					callback : function() {
						iup.popup.Window.avatarBar.removeChild(thumb);
					}
				});
			};
			
			self._state.thumb = thumb;
		}
	}
	
	var defaults = {
		title			: undefined,
		width			: undefined,
		height			: undefined,
		closable		: false,
		modal			: true,
		bbar			: [],
		content			: undefined,
		handlers		: [],
		minHeight		: 59,
		minWidth		: 100,
		resizeModel		: 'content', // 'none', 'border', 'content'
		resizeBorder	: 5,
		minimizable		: false
	};

	return {
		defaults : defaults,
		events : ['show', 'hide'],
		construct : function (cfg) {
			this.cfg = iup.utils.merge(defaults,cfg);
			this._state = {};
			this._buildEl(this.cfg);
			var self = this;
			
			this._state.closeButton = new iup.Button({
				//icon : 'svg/close.svg',
				style : {backgroundColor : 'transparent'},
				className	: 'window-close glyphicon glyphicon-remove',
				visible	: this.cfg.closable,
				handler	: function() { self.hide(); }
			});
			
			var minimizeButton = new iup.Button({
				text	: '-',
				className	: 'close',
				visible	: this.cfg.minimizable,
				handler	: function() { self.minimize(); }
			});
			
			var header = new iup.layout.StretchPanel({
				style	: {padding : '3px'},
				content	: new iup.layout.Toolbar({
					content	: [ 
						new iup.form.Label({className	: 'window-title', text : this.cfg.title}),
						'->',
						minimizeButton,
						this._state.closeButton
					]
				})
			});
			
			new WindowDragManager(this).makeDraggable(header.getEl());
			
			this._state.win = new iup.layout.BorderPanel({
				layoutConfig : {
					top : 32,
					bottom : 33
				},
				top	: header,
				bottom	: new iup.layout.StretchPanel({
					style	: {padding : '5px 0px 0px 0px'},
					content	:  new iup.layout.Toolbar({
						content	: this.cfg.bbar,
						marginBetweenItems	: 5
					})
				}),
				center	: this.cfg.content
			});
			
			this._state.tdMid.appendChild(this._state.win.getEl());
			
			//var body = /*iup.layout.ViewPort.getBody() ||	*/document.getElementsByTagName("body")[0];
			//body.appendChild(this._state.table);
			
			var id = self.cfg.id;
			if (id) {
				iup.db.userConfig.onload('win_' + id, function (config) {
					self.cfg.width = config.width;
					self.cfg.height = config.height;
				});
			}
		},
		prototype : {
			minimize : function() {
				var self = this;
				if (!iup.popup.Window.avatarBar) {
					var bar = document.createElement("div");
					
					bar.style.position = "fixed";
					bar.style.bottom = "0px";
					bar.style.left = "0px";
					document.getElementsByTagName("body")[0].appendChild(bar);
					iup.popup.Window.avatarBar = bar;
				}
				
				if (!self._state.thumb) {
					buildThumbnail.call(self);
				}
				
				self._state.position = $(self._state.table).offset();
				var height = $(window).height();
				
				animatedMove.call(self,{
					start : {
						x : self._state.position.left,
						y : self._state.position.top
					},
					end : {
						x : 0,
						y : height
					},
					callback : function() {
						self.hide();
						iup.popup.Window.avatarBar.appendChild(self._state.thumb);
					}
				});
			},
			show : function() {
				this.restore();
				var cfg = this.cfg;
				var win = this._state.win;
				if ( !cfg.width) {
					cfg.width = Math.max(cfg.minWidth, $(cfg.content.getEl()).width() + 2 * cfg.resizeBorder);
				}
				//console.log($(styleEl).innerHeight(),$(cfg.content.getEl()).height(),$(cfg.content.getEl()).outerHeight(), cfg.content.getEl().clientHeight, cfg.content.getEl().offsetHeight)

				if ( !cfg.height) {
					cfg.height = Math.max(cfg.minHeight, $(cfg.content.getEl()).height() + 2 * cfg.resizeBorder + 32 + 33 + 2);
				}

				var left = ($(window).innerWidth() - cfg.width)/2 ;
				var el = this._state.table;
				el.style.top = "50px";
				el.style.left = left + "px";
				el.style.width = cfg.width + 'px';
				el.style.height = cfg.height + 'px';
				var styleEl = this._state.tdMid;
				win.doLayout($(styleEl).innerWidth(), $(styleEl).innerHeight());
				
				iup.layout.KeyboardNavigationManager.takeSelection(this.cfg.content);/* = {
					select : this.select, removeSelection : removeSelection
				}*/
			},
			restore : function() {
				if (this.cfg.modal) {
					this._state.mask.show();
				}
				this._state.table.style.zIndex = ++iup.popup.zIndex;	
//				this._state.table.style.display = "block";
				
				var body = /*iup.layout.ViewPort.getBody() ||	*/document.getElementsByTagName("body")[0];
				body.appendChild(this._state.table);
			},
			_buildEl : function(cfg) {
				var topLeft = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : '0px',
						left : '0px',
						height : defaults.resizeBorder + 'px',
						width  : defaults.resizeBorder + 'px'
					}
				});
				
				var topMid = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : '0px',
						left : defaults.resizeBorder + 'px',
						right : defaults.resizeBorder + 'px',
						height : defaults.resizeBorder + 'px'
					}
				});
				
				var topRight = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : '0px',
						right : '0px',
						height : defaults.resizeBorder + 'px',
						width  : defaults.resizeBorder + 'px'
					}
				});
				
				var left = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : defaults.resizeBorder + 'px',
						left : '0px',
						width : defaults.resizeBorder + 'px',
						bottom : defaults.resizeBorder + 'px'
					}
				});
				
				var mid = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : defaults.resizeBorder + 'px',
						left : defaults.resizeBorder + 'px',
						right : defaults.resizeBorder + 'px',
						bottom : defaults.resizeBorder + 'px',
						overflow:'hidden'
					}
				});
				
				var right = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : defaults.resizeBorder + 'px',
						right : '0px',
						width : defaults.resizeBorder + 'px',
						bottom : defaults.resizeBorder + 'px'
					}
				});
				
				var botLeft = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						bottom : '0px',
						left : '0px',
						height : defaults.resizeBorder + 'px',
						width  : defaults.resizeBorder + 'px'
					}
				});
				
				var botMid = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						bottom : '0px',
						left : defaults.resizeBorder + 'px',
						right : defaults.resizeBorder + 'px',
						height : defaults.resizeBorder + 'px'
					}
				});
				
				var botRight = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						bottom : '0px',
						right : '0px',
						height : defaults.resizeBorder + 'px',
						width  : defaults.resizeBorder + 'px'
					}
				});
				
				var styleEl = iup.utils.createEl('div', {
					className : 'stretch',
					style : {
						backgroundColor : '#fff',
						border 			: '1px solid #111',
						borderRadius 	: '5px'
					},
					content : [topLeft, topMid, topRight, left, mid, right, botLeft, botMid, botRight]
				});
				
				var el = iup.utils.createEl('div', {
					style : {
					//	display 		: "none",
						position 		: 'absolute'
					},
					content : styleEl
				});
				
				this._state.table = el;//table;
				this._state.tdMid = mid;//tdMid;
				
				if (cfg.resizeModel !== 'none') {
					topLeft.style.cursor = 'nwse-resize';
					topMid.style.cursor = 'ns-resize';
					topRight.style.cursor = 'nesw-resize';
					left.style.cursor = 'ew-resize';
					right.style.cursor = 'ew-resize';
					botLeft.style.cursor = 'nesw-resize';
					botMid.style.cursor = 'ns-resize';
					botRight.style.cursor = 'nwse-resize';
					
					topLeft.hResize = "e";
					topLeft.vResize = "n";
					topMid.vResize = "n";
					topRight.hResize = "w";
					topRight.vResize = "n";
					left.hResize = "e";
					right.hResize = "w";
					botLeft.hResize = "e";
					botLeft.vResize = "s";
					botMid.vResize = "s";
					botRight.hResize = "w";
					botRight.vResize = "s";
					
					var windowResizeManager = new WindowResizeManager(this);
					windowResizeManager.makeDraggable(topLeft);
					windowResizeManager.makeDraggable(topMid);
					windowResizeManager.makeDraggable(topRight);
					windowResizeManager.makeDraggable(left);
					windowResizeManager.makeDraggable(right);
					windowResizeManager.makeDraggable(botLeft);
					windowResizeManager.makeDraggable(botMid);
					windowResizeManager.makeDraggable(botRight);
				}
				
				this._state.mask = new iup.popup.Mask();
			},
			setPosition : function(x, y) {
				$(this._state.table).offset( {left: x, top:y});
			},
			resize : function(dX, dY) {
				var cfg = this.cfg;
				cfg.width += dX;
				cfg.height += dY;
				var el = this._state.table;
				var styleEl = this._state.tdMid;
				el.style.width = cfg.width + 'px';
				el.style.height = cfg.height + 'px';
				this._state.win.doLayout($(styleEl).width(), $(styleEl).height());
				
				if (cfg.id) {
    				iup.db.userConfig.put('config', {
    					id : 'win_' + cfg.id, 
    					config : {
    						width : cfg.width,
    						height : cfg.height
    					}
    				});
	    		}
			},
			move : function(dX, dY) {
				var currOffset = $(this._state.table).offset();
				$(this._state.table).offset( {left: currOffset.left + dX, top: currOffset.top + dY});
			},
			hide : function() {
				this._state.mask.hide();
				//this._state.table.style.display = "none";
				
				this._state.table.parentNode.removeChild(this._state.table);
			},
			close : function() {
				$(this._state.table).remove();
				this._state.mask.remove();
			},
			getEl : function() {
				return this._state.table;
			},
			setClosable : function(val) {
				if (val) {
					this._state.closeButton.show();
				}	else {
					this._state.closeButton.hide();
				}
			}	
		}
	};
}());

iup.popup.Mask = function(oCfg) {
	oCfg = oCfg || {};
	
	var mask = iup.utils.createEl('div', {
		style : {
			width : "100%",
			height : "100%"/*,
			display : "none"*/
		},
		className : oCfg.className || "mask"
	});
		
//		document.createElement("div");
//	$(mask).addClass(oCfg.className || "mask");
//	
//	var s = mask.style;
//		s.width = "100%";
//		s.height = "100%";
//		s.display = "none";

	
	
	this.show = function() {
		mask.style.zIndex = ++iup.popup.zIndex;	
//		mask.style.display = "block";
		var body = iup.layout.ViewPort.getBody() ||	document.getElementsByTagName("body")[0];
		body.appendChild(mask);
	};
	
	this.hide = function() {
		mask.parentNode.removeChild(mask);
//		mask.style.display = "none";
	};
	
	this.remove = function() {
		$(mask).remove();
	};
};

iup.popup.ConfirmationWindow = function(oCfg) {
	var confirmButtonText = oCfg.confirmButtonText || 'Yes';
	var cancelButtonText = oCfg.cancelButtonText || 'No';
	var onconfirm	= oCfg.onconfirm;
	var title = oCfg.title;
	var message = oCfg.message;
	var width = oCfg.width || 300;
	var height = oCfg.height;
	
	var confirm = new iup.Button({
		className : 'button', 
		text 		: confirmButtonText
	});
	
	var cancel = new iup.Button({
		className : 'button', 
		text 		: cancelButtonText
	});
	
	var win = new iup.popup.Window({
		title	: title,
		closable: false,
		height : height,
		minWidth: 200,
		minHeight: 80,
		content	: new iup.layout.Panel({
			width : width,
			content : [ 
				new iup.layout.Element({html : message})
			]
		}),
		bbar	: ["->", confirm.getEl(), cancel.getEl()]
	});
	
	confirm.setHandler(function() {
		win.close();
		onconfirm();
	});
	
	cancel.setHandler(function() {
		win.close();
	});
	win.show();
};

