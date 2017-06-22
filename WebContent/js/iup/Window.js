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
			cfg.container/*document.getElementsByTagName('body')[0]*/.appendChild(div);
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
				cfg.container/*document.getElementsByTagName('body')[0]*/.style.cursor = '';
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
				cfg.container/*document.getElementsByTagName('body')[0]*/.style.cursor = currentElement.style.cursor;
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
	       		screenSize = {x : $(win.cfg.container).width(), y : $(win.cfg.container).height()};
		        return true;
	 		}
	 	});
	 	
	 	function getMouseOffset(target, e) {
	        var docPos  = iup.DragMaster.getPosition(target);
	        var parentPos  = iup.DragMaster.getPosition(win.cfg.container);
	        console.log(docPos, parentPos);
	        console.log(- docPos.x + parentPos.x, target.offsetLeft);
	        console.log(- docPos.y + parentPos.y, target.offsetTop);
	        return {x:e.pageX - docPos.x + parentPos.x + cfg.resizeBorder + 1, y:e.pageY - docPos.y + parentPos.y + cfg.resizeBorder + 1};
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
	
	var defaults = /*function()*/{
		//return {
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
			minimizable		: false,
			container		: undefined//document.getElementsByTagName('body')[0]
		//}
	};

	return {
		defaults : defaults,
		events : ['show', 'hide'],
		construct : function (cfg) {
			this.cfg = iup.utils.merge(defaults,cfg);
			this.cfg.container || (this.cfg.container = document.getElementsByTagName('body')[0]);
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
					self.cfg.container/*document.getElementsByTagName("body")[0]*/.appendChild(bar);
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
		//		console.log(this.cfg.container);
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

				var left = ($(cfg.container).innerWidth() - cfg.width)/2 ;
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
				
				var body = /*iup.layout.ViewPort.getBody() ||	*/this.cfg.container;//document.getElementsByTagName("body")[0];
				this.cfg.container/*body*/.appendChild(this._state.table);
	//			console.log(this.cfg.container);
			},
			_buildEl : function(cfg) {
				var topLeft = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : '0px',
						left : '0px',
						height : cfg.resizeBorder + 'px',
						width  : cfg.resizeBorder + 'px'
					}
				});
				
				var topMid = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : '0px',
						left : cfg.resizeBorder + 'px',
						right : cfg.resizeBorder + 'px',
						height : cfg.resizeBorder + 'px'
					}
				});
				
				var topRight = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : '0px',
						right : '0px',
						height : cfg.resizeBorder + 'px',
						width  : cfg.resizeBorder + 'px'
					}
				});
				
				var left = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : cfg.resizeBorder + 'px',
						left : '0px',
						width : cfg.resizeBorder + 'px',
						bottom : cfg.resizeBorder + 'px'
					}
				});
				
				var mid = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : cfg.resizeBorder + 'px',
						left : cfg.resizeBorder + 'px',
						right : cfg.resizeBorder + 'px',
						bottom : cfg.resizeBorder + 'px',
						overflow:'hidden'
					}
				});
				
				var right = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : cfg.resizeBorder + 'px',
						right : '0px',
						width : cfg.resizeBorder + 'px',
						bottom : cfg.resizeBorder + 'px'
					}
				});
				
				var botLeft = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						bottom : '0px',
						left : '0px',
						height : cfg.resizeBorder + 'px',
						width  : cfg.resizeBorder + 'px'
					}
				});
				
				var botMid = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						bottom : '0px',
						left : cfg.resizeBorder + 'px',
						right : cfg.resizeBorder + 'px',
						height : cfg.resizeBorder + 'px'
					}
				});
				
				var botRight = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						bottom : '0px',
						right : '0px',
						height : cfg.resizeBorder + 'px',
						width  : cfg.resizeBorder + 'px'
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
				
				this._state.mask = new iup.popup.Mask({container : cfg.container});
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
		var body = /*iup.layout.ViewPort.getBody() ||*/	oCfg.container || document.getElementsByTagName("body")[0];
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

//iup.popup.Menu = function (oCfg) {
//	var cfg = {
//		content	: oCfg.content,
//		anchor : oCfg.anchor instanceof iup.layout.Element ? oCfg.anchor.getEl() : oCfg.anchor,
//		position : (oCfg.position || 'bottom-right').split('-')
//	}
//	this.cfg = cfg;
//	
//	var submenus = [];
//	
//	var self = this;
//	var container;
//	var shown = false;
//	
//	wrapContent();
//	
//	/*if (cfg.anchor) {
//		cfg.anchor.onclick = function(event) {
//			if (!shown){
//				show();
//				event.stopPropagation();
//			}
//			if ( typeof self.onInit === 'function') {
//				self.onInit();
//			}
//		}
//		
//	} else {
//		for (var i = 0, n = submenus.length; i < n; i++) {
//			submenus[i].onInit = function() {
//				for (var j = 0, m = submenus.length; j < m; j++) {
//					submenus[j].autoShow();
//					//submenus[j].onInit = null;
//					console.log(j);
//				}
//			}
//		}
//
//	}*/
//	
//	
//	
//	/*this.autoShow = function() {
//		cfg.anchor.onclick = null;
//		cfg.anchor.onmouseover = function(event) {
//			if (!shown){
//				if (typeof self.beforeShow == 'function') {self.beforeShow();}
//				show();
//				//event.stopPropagation();
//			}
//		}
//	}*/
//	if (cfg.anchor) {
//		cfg.anchor.onmouseover = function(event) {
//			if (!shown){
//				if (typeof self.beforeShow == 'function') {self.beforeShow();}
//				show();
//				//event.stopPropagation();
//			}
//		}
//	}
//	
//	function mouseUp(event) {
//		hide();
//	}
//	function hideSubmenus() {
//		for (var i = 0, n = submenus.length; i < n; i++) {
//			var item = submenus[i].hide();
//		}
//	};
//	
//	function wrapContent() {
//		container = iup.utils.createEl('div', {
//			style : {
//				position : 'absolute', 
//				
//				border : '1px solid black'
//			},
//			className : 'menu'/*,
//			content : cfg.content*/
//		});
//		if (cfg.anchor) {container.style.display = 'none';}
//		for (var i = 0, n = cfg.content.length; i < n; i++) {
//			var item = cfg.content[i];
//			if (item instanceof iup.popup.Menu) {
//				submenus.push(item);
//				if (cfg.anchor) {item.autoShow()};
//				item.beforeShow = hideSubmenus;
//				item = item.cfg.anchor
//			}
//			if (item instanceof iup.layout.Element) {
//				item = item.getEl();
//			}
//			container.appendChild(item);
//		}
//		//document.body.appendChild(container);
//	}
//	
//	function setPosition() {
//		var offset = $(cfg.anchor).offset();
//		if (cfg.position[0] === 'top'){
//			container.style.top = offset.top - $(container).outerHeight() + 'px';
//		} else if (cfg.position[0] === 'bottom') {
//			container.style.top = offset.top + $(cfg.anchor).outerHeight() + 'px';
//		} else if (cfg.position[0] === 'left') {
//			container.style.left = offset.left - $(container).outerWidth() + 'px';
//		} else if (cfg.position[0] === 'right') {
//			container.style.left = offset.left + $(cfg.anchor).outerWidth() + 'px';
//		} 
//		
//		if (cfg.position[1] === 'right') {
//			container.style.left = offset.left + 'px';
//		} else if (cfg.position[1] === 'left') {
//			container.style.left = offset.left + $(cfg.anchor).outerWidth() - $(container).outerWidth() + 'px';
//		} else if (cfg.position[1] === 'bottom') {
//			container.style.top = offset.top + 'px';
//		} else if (cfg.position[1] === 'top') {
//			container.style.top = offset.top  + $(cfg.anchor).outerHeight() - $(container).outerHeight() + 'px';
//		} 
//		
////		$(container).css({
////		    top: offset.top + $(cfg.anchor).outerHeight(),
////		    left: offset.left + $(cfg.anchor).outerWidth() - $(container).outerWidth()
////		});
//	}
//	
//	function show() {
////		if (!container) {
////			wrapContent();
////		}
//		document.body.appendChild(container);
//		
//		container.style.display = 'block';
//		
//		setPosition();
//		
//		document.body.addEventListener('click', mouseUp);
//		shown = true;
//	}
//	
//	function hide() {
//		if (shown) {
//			hideSubmenus();
//			document.body.removeChild(container);
//			//container = null;
//			document.body.removeEventListener('click', mouseUp);
//			shown = false;
//		}
//	}
//	this.hide = hide;
//	
//	this.getEl = function() {return container;};
//}

iup.popup.ContextMenu = function( oCfg ){
	var cfg = {
		target		: oCfg.target, 		// REQUIRED element to override the context menu for  
		menuBuilder : oCfg.menuBuilder  // REQUIRED util.MenuBuilder or util.GridMenuBuilder
	}
	
	var _replaceContext = false;		// replace the system context menu?
	var _mouseOverContext = false;		// is the mouse over the context menu?
	var _menu = null;					// makes my life easier

	InitContext();

	function InitContext()
	{
		document.body.onmousedown = ContextMouseDown;
		document.body.oncontextmenu = ContextShow;
	}

	// call from the onMouseDown event, passing the event if standards compliant
	function ContextMouseDown(event)
	{
		if (_mouseOverContext) {
			return;
		} else {
			clearMenu();
		}

		// IE is evil and doesn't pass the event object
		if (event == null)
			event = window.event;

		// we assume we have a standards compliant browser, but check if we have IE
		var target = event.target != null ? event.target : event.srcElement;
//console.log(event.button == 2 , iup.utils.isChildOf(target, cfg.target), target);
		if (event.button == 2 && iup.utils.isChildOf(target, cfg.target))
			_replaceContext = true;
		else if (!_mouseOverContext)
			clearMenu();
	}

	function clearMenu(){
		if ( _menu != null){
//			Element.remove(_menu);
			document.body.removeChild(_menu);
			_menu = null;
		}
	}
	
	// call from the onContextMenu event, passing the event
	// if this function returns false, the browser's context menu will not show up
	function ContextShow(event)
	{
		if (_mouseOverContext)
			return false;

		// IE is evil and doesn't pass the event object
		if (event == null)
			event = window.event;

		// we assume we have a standards compliant browser, but check if we have IE
		var target = event.target != null ? event.target : event.srcElement;
		
		if (_replaceContext)
		{
			_menu = cfg.menuBuilder.build(event, target);
			if ( _menu != null ) {
				_menu.onmouseover = function() { _mouseOverContext = true; };
				_menu.onmouseout = function() { _mouseOverContext = false; };
				
				var scrollTop = document.body.scrollTop ? document.body.scrollTop :
					document.documentElement.scrollTop;
				var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft :
					document.documentElement.scrollLeft;
				
				_menu.style.display = "hidden";//hide(_menu);
				document.body/*cfg.target*/.appendChild(_menu);
				_menu.style.position = "absolute"; 
				_menu.style.left = event.clientX + scrollLeft + "px"; 
				_menu.style.top = event.clientY + scrollTop + "px";
				_menu.style.display = "box";
//				Element.setStyle(_menu,{
//					position	:"absolute", 
//					left 		: event.clientX + scrollLeft + "px", 
//					top 		: event.clientY + scrollTop + "px"
//				});
//				Element.show(_menu);
			}
			_replaceContext = false;

			return false;
		}
	}
}

iup.popup.MenuBuilder = function(oCfg){
	var cfg = {
		build : oCfg.build		//	REQUIRED function(event, target){return element;}
	};
	
	iup.popup.MenuBuilder.addMenuOption = function(menu, option, cell){	// static void
		var menuOption = document.createElement("div");
		menuOption.innerHTML = typeof option.text == "function" ? option.text(cell) : option.text;
//		Element.update(menuOption, typeof option.text == "function" ? option.text(cell) : option.text);
		$(menuOption).addClass(option.label ? "menu-label" : "menu-option");
//		Element.addClassName(menuOption, option.label ? "menu-label" : "menu-option");
		if ( !option.label && typeof option.action == "function"){
			$(menuOption).bind("click" , function(){ option.action(option, cell);});
//			Element.observe(menuOption, "click" , function(){ option.action(option, cell);});
		}
		menu.appendChild(menuOption);
	}
	
	this.build = cfg.build;
}

iup.popup.GridMenuBuilder = function(oCfg){
	var cfg = {
		headerOptions	: oCfg.headerOptions,	//	[{text : str/func(cell), label : true/false, action : func(option, cell)}...] or function(cell){return options}
		cellOptions		: oCfg.cellOptions,		//	[{text : str/func(cell), label : true/false, action : func(option, cell)}...] or function(cell){return options}
		title			: oCfg.title			// 	str/function(cell){return string}	
	}
	
	var menuBuilder = new iup.popup.MenuBuilder({
		build : function (event, target){
			var cell = getParentCell(target);
			if ($(cell).hasClass("scroll-header")){
				return null;
			}
			if (cell != null ){
				var menu = document.createElement("div");
				$(menu).addClass("menu");
				if ( typeof cfg.title != "undefined") {
					var header = document.createElement("div");
					var title = typeof cfg.title == "function" ? cfg.title(cell) : cfg.title;
					header.innerHTML = title;
					$(header).addClass(header, "menu-header");
					menu.appendChild(header);
				}

				var options = [];
				if (cell.type == "header"){
					if (typeof cfg.headerOptions == "function"){
						options = cfg.headerOptions(cell);
					} else {
						options = cfg.headerOptions;
					}
				} else {
					if (typeof cfg.cellOptions == "function"){
						options = cfg.cellOptions(cell);
					} else {
						options = cfg.cellOptions;
					}
				}
				
				for (var i = 0; i < options.length; i++){
					iup.popup.MenuBuilder.addMenuOption(menu, options[i], cell);
				}
				return menu;
			}

			return null;
		}
	})
	this.build = menuBuilder.build;
	
	function getParentCell(myobj) {
		var curobj = myobj;
		while(curobj !== undefined && curobj != document.body)
		{
		   if( curobj.tagName.toLowerCase() == "td" || curobj.tagName.toLowerCase() == "th" ){
			   return curobj;
		   }
		   curobj = curobj.parentNode;
		}
		return null;
	}
}
