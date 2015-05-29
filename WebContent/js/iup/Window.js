if(typeof iup == "undefined"){
	iup = {};
}

if(typeof iup.popup == "undefined"){
	iup.popup = {};
}

iup.popup.zIndex = 0;

iup.utils.createComponent('iup.popup.Window', undefined, function(){
	function WindowResizeManager(win) {
	    var mouseOffset;
	 	var dragStartPosition;
	 	var prevDragPosition;
	 	var currentElement;
	    var resizeDiv = null;
		var cfg = win.cfg;
		var table = win._state.table;
	 	 
	 	function createResizeDiv() {
			var borderWidth = 2;
			var div = document.createElement('div');
			div.style.position = 'absolute';
			div.style.border = borderWidth + 'px solid #ccc';
			div.style.width = $(table).outerWidth() - 2*borderWidth + 'px';
			div.style.height =  $(table).outerHeight() - 2*borderWidth + 'px';
			$(div).offset($(table).offset());
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
	 		},
	 		
	 		mouseMove	: function (e) {
	 			if (cfg.resizeModel === 'border') {
	 				var resize = calcResize(prevDragPosition, {x : e.pageX, y : e.pageY}, resizeDiv);
			        $(resizeDiv).width($(resizeDiv).width() + resize.dX); 
			        $(resizeDiv).height($(resizeDiv).height() + resize.dY);
	 				
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
				mouseOffset = getMouseOffset(element, e);
	       		dragStartPosition = {x : e.pageX, y : e.pageY};
	       		prevDragPosition = {x : e.pageX, y : e.pageY};
	       		currentElement = element;
	       		if (cfg.resizeModel === 'border') {
	       			resizeDiv = createResizeDiv();
	       		}
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
	    var mouseOffset;
	    var windowSize;
	    var screenSize;
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
		        	s.top = screenSize.y - windowSize.y + 'px';
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
		}
		
		var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

		var start = new Date().getTime();
		var animationStartTime = window.performance.now();
		
		function step(timestamp) {
			var progress = (timestamp - animationStartTime)/ cfg.time,
				x = cfg.end.x + (( cfg.start.x - cfg.end.x ) * (1 - progress));
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
		closable		: true,
		modal			: true,
		bbar			: [],
		content			: undefined,
		handlers		: [],
		minHeight		: 0,
		minWidth		: 0,
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
				icon : 'svg/close.svg',
				className	: 'window-close',
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
					items	: [ 
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
					bottom : 27
				},
				top	: header,
				bottom	: new iup.layout.StretchPanel({
					style	: {padding : '5px 0px 0px 0px'},
					content	:  new iup.layout.Toolbar({
						items	: this.cfg.bbar,
						marginBetweenItems	: 5
					})
				}),
				center	: this.cfg.content
			});
			
			this._state.tdMid.appendChild(this._state.win.getEl());
			
			document.getElementsByTagName("body")[0].appendChild(this._state.table);
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
					cfg.width = Math.max(cfg.minWidth, $(win.getEl()).width() + 2 * cfg.resizeBorder);
				}
				
				if ( !cfg.height) {
					cfg.height = Math.max(cfg.minHeight, $(win.getEl()).height() + 2 * cfg.resizeBorder);
				}
				win.doLayout(cfg.width - 2 * cfg.resizeBorder, cfg.height - 2 * cfg.resizeBorder);
				
				this._state.table.style.top = "50px";
				var left = ($(window).innerWidth() - cfg.width)/2 ;
				$(this._state.table).css('left', left + "px");
			},
			restore : function() {
				if (this.cfg.modal) {
					this._state.mask.show();
				}
				this._state.table.style.zIndex = ++iup.popup.zIndex;	
				this._state.table.style.display = "block";
				
			},
			_buildEl : function(cfg) {
				var table = document.createElement('table');
				table.style.display = "none";
				table.style.position = 'absolute';
				table.style.backgroundColor = '#fff';
				table.style.border = '1px solid #369';
				table.style.borderRadius = '5px';
				
				var tbody = document.createElement('tbody');
				table.appendChild(tbody);
				var trTop = document.createElement('tr');
				trTop.style.height = cfg.resizeBorder + 'px';
				tbody.appendChild(trTop);
				var trMid = document.createElement('tr');
				tbody.appendChild(trMid);
				var trBot = document.createElement('tr');
				trBot.style.height = cfg.resizeBorder + 'px';
				tbody.appendChild(trBot);
				
				var tdTopLeft = document.createElement('td');
				tdTopLeft.style.width = cfg.resizeBorder + 'px';
				tdTopLeft.hResize = "e";
				tdTopLeft.vResize = "n";
				trTop.appendChild(tdTopLeft);
				
				var tdTopMid = document.createElement('td');
				tdTopMid.vResize = "n";
				trTop.appendChild(tdTopMid);
				
				var tdTopRight = document.createElement('td');
				tdTopRight.style.width = cfg.resizeBorder + 'px';
				tdTopRight.hResize = "w";
				tdTopRight.vResize = "n";
				trTop.appendChild(tdTopRight);
				
				var tdMidLeft = document.createElement('td');
				tdMidLeft.hResize = "e";
				trMid.appendChild(tdMidLeft);
				var tdMid = document.createElement('td');
				tdMid.style.overflow = 'hidden';
				trMid.appendChild(tdMid);
				var tdMidRight = document.createElement('td');
				tdMidRight.hResize = "w";
				trMid.appendChild(tdMidRight);
				
				var tdBotLeft = document.createElement('td');
				tdBotLeft.hResize = "e";
				tdBotLeft.vResize = "s";
				trBot.appendChild(tdBotLeft);
				var tdBotMid = document.createElement('td');
				tdBotMid.vResize = "s";
				trBot.appendChild(tdBotMid);
				var tdBotRight = document.createElement('td');
				tdBotRight.hResize = "w";
				tdBotRight.vResize = "s";
				trBot.appendChild(tdBotRight);
				
				if (cfg.resizeModel !== 'none') {
					tdTopLeft.style.cursor = 'nwse-resize';
					tdTopMid.style.cursor = 'ns-resize';
					tdTopRight.style.cursor = 'nesw-resize';
					tdMidLeft.style.cursor = 'ew-resize';
					tdMidRight.style.cursor = 'ew-resize';
					tdBotLeft.style.cursor = 'nesw-resize';
					tdBotMid.style.cursor = 'ns-resize';
					tdBotRight.style.cursor = 'nwse-resize';
				}
				
				this._state.table = table;
				this._state.tdMid = tdMid;
				
				if (cfg.resizeModel !== 'none') {
					var windowResizeManager = new WindowResizeManager(this);
					windowResizeManager.makeDraggable(tdTopLeft);
					windowResizeManager.makeDraggable(tdTopRight);
					windowResizeManager.makeDraggable(tdTopMid);
					windowResizeManager.makeDraggable(tdMidLeft);
					windowResizeManager.makeDraggable(tdMidRight);
					windowResizeManager.makeDraggable(tdBotLeft);
					windowResizeManager.makeDraggable(tdBotMid);
					windowResizeManager.makeDraggable(tdBotRight);
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
					this._state.win.doLayout(cfg.width - 2 * cfg.resizeBorder, cfg.height - 2 * cfg.resizeBorder);
			},
			move : function(dX, dY) {
				var currOffset = $(this._state.table).offset();
				$(this._state.table).offset( {left: currOffset.left + dX, top: currOffset.top + dY});
			},
			hide : function() {
				this._state.mask.hide();
				this._state.table.style.display = "none";
			},
			close : function() {
				$(table).remove();
				this._state.mask.remove();
			},
			getEl : function() {
				return table;
			},
			setClosable : function(val) {
				if (val) {
					this._state.closeButton.show();
				}	else {
					this._state.closeButton.hide();
				}
			}/*,
			mask : function() {
				loadingMask.show();
			},
			unmask : function() {
				loadingMask.hide();
			}	*/		
		}
	}
}())

iup.popup.Mask = function(oCfg) {
	oCfg = oCfg || {};
	
	var mask = document.createElement("div");
	$(mask).addClass(oCfg.className || "mask");
	document.getElementsByTagName("body")[0].appendChild(mask);
	with(mask.style) {
		width = "100%";
		height = "100%";
		display = "none";
	}
	
	this.show = function() {
		mask.style.zIndex = ++iup.popup.zIndex;	
		mask.style.display = "block";
	};
	
	this.hide = function() {
		mask.style.display = "none";
	};
	
	this.remove = function() {
		$(mask).remove();
	};
};

iup.popup.ConfirmationWindow = function(oCfg) {
	var confirmButtonText = oCfg.confirmButtonText;
	var cancelButtonText = oCfg.cancelButtonText;
	var onconfirm	= oCfg.onconfirm;
	var title = oCfg.title;
	var message = oCfg.message;
	var width = oCfg.width || 300;
	
	var confirm = new iup.Button({
		className	: "button save",
		icon		: "img/icoCheckGreen16r.png",
		text 		: confirmButtonText
	});
	
	var cancel = new iup.Button({
		className	: "button cancel",
		icon		: "img/ic_cancel.png",
		text 		: cancelButtonText
	});
	
	var win = new iup.popup.Window({
		title	: title,
		closable: false,
		minWidth: 200,
		minHeight: 70,
		content	: new iup.layout.Panel({
			width : width,
			items : [ 
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

iup.popup.Notification = {
	shown : false,
	items : [],
	show	: function() {
		var oThis = this;
		oThis.shown = true;
		var item = this.items.shift();
		var title = item.title;
		var message	= item.message;
		var type = item.type || "info";
		
		var div = document.createElement("div");
		with (div.style) {
			display	= "none";
			position = "absolute";
			top = "20px";
			padding = "10px";
			zIndex	=  ++iup.popup.zIndex;
			backgroundColor = "#fff";
			border = "1px solid #BAC5DC";
			minWidth = "200px";
			
		}
		
		var img ="";
		switch (type) {
			case "info" : img = "img/notification/info.png"; break;
			case "warning" : img = "img/notification/warning.png"; break;
			case "error" : img = "img/notification/error.png"; break;
		}
		img = "<img src='" + img + "'/>";
			
		div.innerHTML = "<div><table><tbody><tr><td>" + img + "</td><td style='color: #105285;font-size: 11px;font-weight: bold;margin-top: 2px;white-space: nowrap;'>"+ title + "</td></tr></tbody></table></div>" +
				"<div style='margin-top:5px;margin-bottom:5px;color:#333;text-align:center;'>" + message + "</div>";
		
		document.getElementsByTagName("body")[0].appendChild (div);
		
		$(div).css('left', (window.innerWidth - $(div).width() ) / 2 + "px");
		
		$(div).fadeIn(1000);
		
		setTimeout(function(){
		  $(div).fadeOut(1000, function() {
		  	$(div).remove();
		  	
		  	if (oThis.items.length > 0) {
		  		oThis.show();
		  	} else {
		  		oThis.shown = false;
		  	}
		  });
		  
		}, 2000);
	},
	notify : function(oCfg) {
		this.items.push(oCfg);
		if (!this.shown) {
			this.show();
		}
	}
}
