iup.utils.createComponent('iup.layout.Element', undefined, 
	{
		defaults : {
			style : undefined,
			className : undefined,
			html : undefined,
			maskClassName : undefined
		},
		prototype : {
			_buildEl : function(cfg) {
				this._el = document.createElement("div");
				if (cfg.html) {
					this._el.innerHTML = cfg.html;
				}
			},
			hide : function(callback) { //@deprecated
				this._el.style.display = "none";
			},
			show : function(callback) { //@deprecated
				this._el.style.display = "";
			},
			setVisible : function(visible) {
				if (visible) {
					this.show();
				} else {
					this.hide();
				}
			},
			getEl : function() {
				return this._el;
			},
			_getStyleEl : function() {
				return this._styleEl || this._el;
			},
			mask : function(visible) {
				if (visible) {
					if (this._mask) {
						this._mask.style.display = 'block';
					} else {
						var mask = document.createElement ('div');
						mask.className = 'mask ' + this.cfg.maskClassName;
						this.getEl().appendChild(mask);
						this._mask = mask;
						mask.onclick = function(event) {
							event.cancelBubble = true;
						};
						/*if (this.cfg.maskClass) {
							
						}*/
					}
				} else {
					if (this._mask) {
						this._mask.style.display = 'none';
					}
				}
			}
		},
		construct : function(oCfg) {
			this.cfg = oCfg;
			this._buildEl(this.cfg);
			if (this.cfg.style) {
				iup.utils.appendStyle(this._getStyleEl(), this.cfg.style);
			}
				
			$(this.getEl()).addClass('element');	
				
			if (this.cfg.className) {
				$(this._getStyleEl()).addClass(this.cfg.className);
			}
		}
	});

	iup.utils.createComponent('iup.layout.Panel', iup.layout.Element, 
		{
			defaults : {
				content : [],
				controls : {} // {key : Button/function()}
			},
			prototype : {
				_buildEl : function(cfg) {
					var el = document.createElement('div');
					var s = el.style;
					s.overflow = 'auto';
					if (cfg.width) {
						s.width = cfg.width + 'px';
					}
					if (cfg.height) {
						s.height = cfg.height + 'px';
					}
						
					for (var idx in cfg.content) {
						var item = cfg.content[idx];
						if (item instanceof iup.layout.Panel) {
							//this._items.push(item);
							el.appendChild (item.getEl());
						} else if (item instanceof iup.layout.Element) {
							el.appendChild (item.getEl());
						} else if (item instanceof HTMLElement) {
							el.appendChild(item);
						}
					}
					this._el = el;
				},
				doLayout : function(width, height) {
					var el = this.getEl();
					el.style.width = width + 'px';
					el.style.height = height + 'px';
				},
				/*getItems : function() {
					return this._items;
				},*/
				addItem : function(item) {
					if (item instanceof iup.layout.Panel) {
						this.cfg.content.push(item);
						this.getEl().appendChild (item.getEl());
					} else if (item instanceof iup.layout.Element) {
						this.getEl().appendChild (item.getEl());
					} else if (item instanceof HTMLElement) {
						this.getEl().appendChild(item);
					}
				},
				removeItem : function(item) {
					if (item instanceof iup.layout.Panel) {
						//REMOVE this._items.push(item);
						var idx = this.cfg.content.indexOf(item);
						if (idx == -1) {
							console.log('Item not found');
						}
						this.cfg.content.splice(idx,1);
						this.getEl().removeChild (item.getEl());
					} else if (item instanceof iup.layout.Element) {
						this.getEl().removeChild (item.getEl());
					} else if (item instanceof HTMLElement) {
						this.getEl().removeChild(item);
					}
				},
				empty : function() {
					$(this.getEl()).empty();
					//this._items.splice(0, this._items.length);
				},
				select : function(callback) {
					if (this.cfg.passSelectionTo) {
						this.cfg.passSelectionTo.select(callback);
						return;
					}
				},
				getChildren : function() {
					return this.cfg.content;
				}
			}
		});
		
iup.utils.createComponent('iup.layout.ScrollPanel', iup.layout.Panel, 
	function () {
		var statics = {
			SCROLL_VERTICAL : 'vertical',
			SCROLL_HORIZONTAL : 'horizontal',
			SCROLL_BOTH : 'both',
			SCROLLBAR_WIDTH : 10
		};
		
		function getLineHeight(elem) {
           /* var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }*/
            return /*parseInt($parent.css('fontSize'), 10) || */parseInt($(elem).css('fontSize'), 10) || 16;
        }

        function getPageHeight(elem) {
            return $(elem).height();
        }
		
		function fixEvent(evt, el) {
			if (evt.wheelDelta) {
				evt.dX = 0;
				evt.dY = this.cfg.step ? (evt.wheelDelta > 0 ? -this.cfg.step : this.cfg.step) : -evt.wheelDelta;
			} else {
				if (this.cfg.step) {
					evt.dX = evt.deltaX > 0 ? this.cfg.step : (evt.deltaX < 0 ? -this.cfg.step : 0);
					evt.dY = evt.deltaY > 0 ? this.cfg.step : (evt.deltaY < 0 ? -this.cfg.step : 0);
				} else {
					var scale = 1;
					if (evt.deltaMode === 1) {
						scale = getLineHeight(el);
					} else if (evt.deltaMode === 2) {
						scale = getPageHeight(el);
					}
					
					evt.dX = evt.deltaX * scale;
					evt.dY = evt.deltaY * scale;
				}
			}
		}
		
		function makeScrollDraggable() {
			var self = this;
			new ScrollDragManager('X').makeDraggable(this.hScroll.children[0]);
			new ScrollDragManager('Y').makeDraggable(this.vScroll.children[0]);
			//windowDragManager.makeDraggable(header.getEl());
			
			
			
			function ScrollDragManager(axis) {
//				var mouseOffset;
				var prevDragPosition;
				//var axis = axis;
				
				var dragMaster = new iup.DragMaster({
					mouseUp		: function() {
					},
					mouseMove	: function (e) {
						if (axis === 'Y') {
							var delta = prevDragPosition.y - e.pageY;
							var total = self.scrollData.bodyHeight-self.scrollData.vScrollerSize;
							var scale = (self.scrollData.contentHeight - self.scrollData.bodyHeight)/total;
							var scrollAmount = - scale * delta;
							var scrolled = scroll.call(self,0, scrollAmount).y / scale;

							prevDragPosition.y += Math.round(scrolled);
						}
						
						if (axis === 'X') {
							var delta = prevDragPosition.x - e.pageX;
							var total = self.scrollData.bodyWidth-self.scrollData.hScrollerSize;
							var scale = (self.scrollData.contentWidth - self.scrollData.bodyWidth)/total;
						//	var scrollAmount = - scale * delta;
							var scrolled = scroll.call(self, - scale * delta, 0).x / scale;
							prevDragPosition.x += Math.round(scrolled);
						}
					},
					mouseDown	: function(e, element) {
						//mouseOffset = getMouseOffset(element, e);
						prevDragPosition = {x : e.pageX, y : e.pageY};
						return true;
					}
				});
				
				function getMouseOffset(target, e) {
					var docPos  = iup.DragMaster.getPosition(target);
					return {x:e.pageX - docPos.x , y:e.pageY - docPos.y};
				}
				
				this.makeDraggable = function(element){
					dragMaster.makeDraggable(element);

				};
				
			}
		}
		
		function scroll(dX, dY) {
			var s = this.scrollData;
			s.offsetX || (s.offsetX = 0);
			s.offsetY || (s.offsetY = 0);
			var prevOffset = {x : s.offsetX, y : s.offsetY};
			s.offsetX = s.offsetX + dX;
			s.offsetY = s.offsetY + dY;
			
			var maxOffsetY = s.contentHeight - s.bodyHeight; 
			if (s.offsetY > maxOffsetY) {
				s.offsetY = maxOffsetY;
			}
			if (s.offsetY < 0) {
				s.offsetY = 0;
			}
			
			var maxOffsetX = s.contentWidth - s.bodyWidth; 
			if (s.offsetX > maxOffsetX) {
				s.offsetX = maxOffsetX;
			}
			if (s.offsetX < 0) {
				s.offsetX = 0;
			}
			
			this._getStyleEl().style.top = -s.offsetY + 'px';
			this._getStyleEl().style.left = -s.offsetX + 'px';
//			if (prevOffset.x != s.offsetX ||  prevOffset.y != s.offsetY) {
//				smoothScroll.call(this,prevOffset, {x : s.offsetX, y : s.offsetY});
//			}
			
			var bothScrolls = this.cfg.scroll === statics.SCROLL_BOTH && (s.contentHeight > s.bodyHeight && s.contentWidth > s.bodyWidth);
			var vScrollerOffset = (s.bodyHeight - s.vScrollerSize - (bothScrolls ? statics.SCROLLBAR_WIDTH : 0)) * s.offsetY / (s.contentHeight - s.bodyHeight);
			this.vScroll.children[0].style.top = vScrollerOffset + 'px';
			
			var hScrollerOffset = (s.bodyWidth - s.hScrollerSize - (bothScrolls ? statics.SCROLLBAR_WIDTH : 0)) * s.offsetX / (s.contentWidth - s.bodyWidth);
			this.hScroll.children[0].style.left = hScrollerOffset + 'px';
			this.events.fireEvent('scroll', s.offsetX - prevOffset.x, s.offsetY - prevOffset.y, s.offsetX, s.offsetY);
			return {x : s.offsetX - prevOffset.x, y : s.offsetY - prevOffset.y};
		}
		
		function smoothScroll(prevOffset, offset) {
			var duration = 1000;
			var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

		//	var start = new Date().getTime();
		//	var animationStartTime = window.performance.now();
			var self = this;
			
			if (this._scrollProcess) {
				//var currentTime = window.performance.now();
				
				this._scrollProcess.start = this._scrollProcess.current || prevOffset;
				this._scrollProcess.end = offset;
				
				this._scrollProcess.duration = duration + window.performance.now() - this._scrollProcess.animationStartTime;
				
				
			} else {
				this._scrollProcess = {
					start : prevOffset,
					current : prevOffset,
					end : offset,
					animationStartTime : window.performance.now(),
					duration : duration
				};
				requestAnimationFrame(step);
			}
			var p = this._scrollProcess;
			
			function progressFunc(linearVal) {
				return (1 - (1 + Math.sin(Math.PI/2 * (linearVal * 2 - 1))) / 2 );
			}
			
			function step(timestamp) {
				var progress = (timestamp - p.animationStartTime)/ p.duration,
					x = p.end.x + (( p.start.x - p.end.x ) * progressFunc(progress)),
					y = p.end.y + (( p.start.y - p.end.y ) * progressFunc(progress));
				console.log(progress, 1 - progressFunc(progress)/*, p.end.x - x, p.end.y - y*/);
				if (progress < 1) {
					self._getStyleEl().style.top = -y + 'px';
					self._getStyleEl().style.left = -x + 'px';
					requestAnimationFrame(step);
					
					self.events.fireEvent('scroll', x - p.current.x, y - p.current.y, p.current.x, p.current.y);
					p.current = {x : x, y : y};
				} else {
					self.events.fireEvent('scroll', p.end.x - p.current.x, p.end.y - p.current.y, p.end.x, p.end.y);
					p.current = p.end;
					self._getStyleEl().style.top = -p.end.y + 'px';
					self._getStyleEl().style.left = -p.end.x + 'px';
					
					delete self._scrollProcess;
				}
			}
		} 
		
		function bothScrolls() {
			var self = this;
			var el = this.getEl();
			var styleEl = this._getStyleEl();
			var bodyHeight = $(el).height();
			var contentHeight = $(styleEl).height();
			
			var bodyWidth = $(el).width();
			var contentWidth = $(styleEl).width();
			
			var high = contentHeight > bodyHeight;
			var wide = contentWidth > bodyWidth;
			
			if (!(high || wide)) {
				hideScroll();	
			} else if (high && wide) {
				scrollX();
				scrollY();
				incMaxScroll();
			} else if (high) {
				scrollY();
				marginRight();
				recalcHeight();
				recalcWidth();
				if (contentWidth > bodyWidth - statics.SCROLLBAR_WIDTH ) {
					scrollX();
					incMaxScroll();
				} else {
					hideScrollX();
				}
			} else if (wide) {
				marginBottom();
				scrollX();
				if (contentHeight > bodyHeight - statics.SCROLLBAR_WIDTH) {
					scrollY();
					incMaxScroll();
				} else {
					hideScrollY();
				}
			}
			
			                        
			
			function incMaxScroll() {
				self.vScroll.style.bottom = '10px';
				self.hScroll.style.right = '10px';
			}
			
			function marginRight() {
				styleEl.style.marginRight = statics.SCROLLBAR_WIDTH + 'px';
			}
			
			function marginBottom() {
				styleEl.style.marginBottom = statics.SCROLLBAR_WIDTH + 'px';
			}
			
			function recalcHeight() {
				bodyHeight = $(el).height();
				contentHeight = $(styleEl).height();
			}
			
			function recalcWidth() {
				bodyWidth = $(el).width();
				contentWidth = $(styleEl).width();
			}
			
			function scrollX() {
				self.vScroll.style.display = "block";
				self.scrollData.vScrollVisible = true;
				
				contentHeight = $(this._getStyleEl()).height();
				
				self.scrollData.vScrollerSize = Math.max(bodyHeight * bodyHeight / contentHeight - (bothScrolls ? statics.SCROLLBAR_WIDTH : 0), 8);
				self.vScroll.children[0].style.height = this.scrollData.vScrollerSize + "px";
			}
			
			function scrollY() {
				this.hScroll.style.display = "block";
				this.scrollData.hScrollVisible = true;
				
				this.scrollData.hScrollerSize = Math.max(bodyWidth * bodyWidth / contentWidth - (bothScrolls ? statics.SCROLLBAR_WIDTH : 0), 8);
				this.hScroll.children[0].style.width = this.scrollData.hScrollerSize + "px";
			}
			
			function hideScroll() {
				hideScrollY();
				hideScrollX();
			}
			
			function hideScrollY() {
				self.scrollData.vScrollVisible = false;
				self.vScroll.style.display = "none";
				styleEl.style.marginRight = '0px';
			};
			function hideScrollX() {
				self.hScroll.style.display = "none";
				self.scrollData.hScrollVisible = false;
				styleEl.style.marginBottom = '0px';
			};
		}
		
		function displayScroll() {
			//bothScrolls()
			
			var bodyHeight = $(this.getEl()).height();
			var contentHeight = $(this._getStyleEl()).height();
			
			var bodyWidth = $(this.getEl()).width();
			var contentWidth = $(this._getStyleEl()).width();
		//	console.log(bodyHeight,contentHeight,bodyWidth,contentWidth);
			
			if (this.cfg.scroll === statics.SCROLL_BOTH && (contentHeight > bodyHeight || contentWidth > bodyWidth)) {
				if (contentHeight + statics.SCROLLBAR_WIDTH > bodyHeight) {
					this._getStyleEl().style.marginRight = statics.SCROLLBAR_WIDTH + 'px';
					contentWidth = $(this._getStyleEl()).width();
					contentWidth += statics.SCROLLBAR_WIDTH;
				} 
				if (contentWidth > bodyWidth) {
					contentHeight += statics.SCROLLBAR_WIDTH;
				}
			}
		//	console.log(bodyHeight,contentHeight,bodyWidth,contentWidth);
			var bothScrolls = this.cfg.scroll === statics.SCROLL_BOTH &&(contentHeight > bodyHeight && contentWidth > bodyWidth);
			//console.log(bothScrolls);
			
			if (bothScrolls) {
				this.vScroll.style.bottom = '10px';
				this.hScroll.style.right = '10px';
			} else {
				this.vScroll.style.bottom = '0px';
				this.hScroll.style.right = '0px';
			}
			
			if (contentHeight > bodyHeight && this.cfg.scroll !== statics.SCROLL_HORIZONTAL) {
				this.vScroll.style.display = "block";
				this.scrollData.vScrollVisible = true;
				
//					this._getStyleEl().style.marginRight = '10px';
					contentHeight = $(this._getStyleEl()).height();
				
				this.scrollData.vScrollerSize = Math.max(bodyHeight * bodyHeight / contentHeight - (bothScrolls ? statics.SCROLLBAR_WIDTH : 0), 8);
				this.vScroll.children[0].style.height = this.scrollData.vScrollerSize + "px";
			} else {
				this.scrollData.vScrollVisible = false;
				this.vScroll.style.display = "none";
//				this._getStyleEl().style.marginRight = '0px';
			}
			
			if (contentWidth > bodyWidth && this.cfg.scroll !== statics.SCROLL_VERTICAL) {
				this.hScroll.style.display = "block";
				this.scrollData.hScrollVisible = true;
				//if (this.cfg.scroll === statics.SCROLL_HORIZONTAL) {
					this._getStyleEl().style.marginBottom = '10px';
				//	contentWidth = $(this._getStyleEl()).width();
				//}
				
				this.scrollData.hScrollerSize = Math.max(bodyWidth * bodyWidth / contentWidth - (bothScrolls ? statics.SCROLLBAR_WIDTH : 0), 8);
				this.hScroll.children[0].style.width = this.scrollData.hScrollerSize + "px";
			} else {
				this.hScroll.style.display = "none";
				this.scrollData.hScrollVisible = false;
				//this._getStyleEl().style.marginBottom = '0px';
			}
			
			this.scrollData.bodyHeight = bodyHeight;
			this.scrollData.contentHeight = contentHeight;
			this.scrollData.bodyWidth = bodyWidth;
			this.scrollData.contentWidth = contentWidth;
			
			scroll.call(this, 0, 0);
		}
		
		/*
		function displayScroll() {
			var bodyHeight = $(this.getEl()).height();
			var contentHeight = $(this._getStyleEl()).height();
			
			var bodyWidth = $(this.getEl()).width();
			var contentWidth = $(this._getStyleEl()).width();
			console.log(bodyHeight,contentHeight,bodyWidth,contentWidth);
			
			if (this.cfg.scroll === statics.SCROLL_BOTH && (contentHeight > bodyHeight || contentWidth > bodyWidth)) {
				if (contentHeight + statics.SCROLLBAR_WIDTH > bodyHeight) {
					contentWidth += statics.SCROLLBAR_WIDTH;
				} 
				if (contentWidth > bodyWidth) {
					contentHeight += statics.SCROLLBAR_WIDTH;
				}
			}
			console.log(bodyHeight,contentHeight,bodyWidth,contentWidth);
			var bothScrolls = this.cfg.scroll === statics.SCROLL_BOTH &&(contentHeight > bodyHeight && contentWidth > bodyWidth);
			console.log(bothScrolls);
			
			if (bothScrolls) {
				this.vScroll.style.bottom = '10px';
				this.hScroll.style.right = '10px';
			} else {
				this.vScroll.style.bottom = '0px';
				this.hScroll.style.right = '0px';
			}
			
			if (contentHeight > bodyHeight && this.cfg.scroll !== statics.SCROLL_HORIZONTAL) {
				this.vScroll.style.display = "block";
				this.scrollData.vScrollVisible = true;
				
				//if (this.cfg.scroll === statics.SCROLL_VERTICAL) {
					this._getStyleEl().style.marginRight = '10px';
					contentHeight = $(this._getStyleEl()).height();
				//}
				
				this.scrollData.vScrollerSize = Math.max(bodyHeight * bodyHeight / contentHeight - (bothScrolls ? statics.SCROLLBAR_WIDTH : 0), 8);
				this.vScroll.children[0].style.height = this.scrollData.vScrollerSize + "px";
			} else {
				this.scrollData.vScrollVisible = false;
				this.vScroll.style.display = "none";
				this._getStyleEl().style.marginRight = '0px';
			}
			
			if (contentWidth > bodyWidth && this.cfg.scroll !== statics.SCROLL_VERTICAL) {
				this.hScroll.style.display = "block";
				this.scrollData.hScrollVisible = true;
				//if (this.cfg.scroll === statics.SCROLL_HORIZONTAL) {
					this._getStyleEl().style.marginBottom = '10px';
				//	contentWidth = $(this._getStyleEl()).width();
				//}
				
				this.scrollData.hScrollerSize = Math.max(bodyWidth * bodyWidth / contentWidth - (bothScrolls ? statics.SCROLLBAR_WIDTH : 0), 8);
				this.hScroll.children[0].style.width = this.scrollData.hScrollerSize + "px";
			} else {
				this.hScroll.style.display = "none";
				this.scrollData.hScrollVisible = false;
				//this._getStyleEl().style.marginBottom = '0px';
			}
			
			this.scrollData.bodyHeight = bodyHeight;
			this.scrollData.contentHeight = contentHeight;
			this.scrollData.bodyWidth = bodyWidth;
			this.scrollData.contentWidth = contentWidth;
			
			scroll.call(this, 0, 0);
		}*/
		
		
		
		return {
			statics : statics,
			defaults : {
				scroll  : statics.SCROLL_VERTICAL, // 'horizontal', 'both'
				step : undefined
			},
			events : ['scroll'],
			prototype : {
				_buildEl : function(cfg) {
					var self = this;
					var wrapper = document.createElement('div');
					wrapper.style.position = 'relative';
					wrapper.style.overflow = "hidden";
					
					var el = document.createElement('div');
					var s = el.style;
					s.position = 'absolute';
					
					for (var idx in cfg.content) {
						var item = cfg.content[idx];
						if (item instanceof iup.layout.Panel) {
							el.appendChild(item.getEl());
						} else if (item instanceof iup.layout.Element) {
							el.appendChild(item.getEl());
						} else if (item instanceof HTMLElement) {
							el.appendChild(item);
						}
					}
					
					wrapper.onwheel = function (evt) {
						fixEvent.call(self, evt, wrapper);
						var scrolled = scroll.call(self, evt.dX, evt.dY);
						if (scrolled.x !== 0 || scrolled.y !== 0) {
							evt.stopPropagation();	
						}
					};
					
					wrapper.onmousewheel = function(evt) {
						fixEvent.call(self, evt, wrapper);
						scroll.call(self, evt.dX, evt.dY);
					};
					
					var vScroller = document.createElement("div");
					this.vScroll = iup.utils.createEl("div", {className:"scrollbar v-scrollbar", style : {display:"none"}, content:vScroller});
					var hScroller = document.createElement("div");
					this.hScroll = iup.utils.createEl("div", {className:"scrollbar h-scrollbar", style : {display:"none"}, content:hScroller});
					this.scrollData = {};
					
					wrapper.appendChild(el);
					wrapper.appendChild(this.vScroll);
					wrapper.appendChild(this.hScroll);
					
					makeScrollDraggable.call(this);
					
					this._el = wrapper;
					this._styleEl = el;
				},
				doLayout : function(width, height) {
					//if (height) {
					this._styleEl.style.position = height ? 'absolute' : 'relative';
					//}
					
					iup.layout.ScrollPanel.superclass.doLayout.call(this, width, height);
					
					displayScroll.call(this);
				},
				select : function(callback) {
					if (this.cfg.passSelectionTo) {
						this.cfg.passSelectionTo.select(callback);
						return;
					}
				}
			}
		};
	}());		
	
	iup.utils.createComponent('iup.layout.HtmlPanel', iup.layout.Panel, {
		defaults : {
			url : undefined,
			html : undefined
		},
		prototype : {
			loadContent : function(url) {
				var self = this;
				iup.utils.getResource(url, function(data) {
					self._getStyleEl().innerHTML = data;
				});
			}
		},
		_init : function () {
			if (this.cfg.html) {
				this._getStyleEl().innerHTML = this.cfg.html;
			}
			if (this.cfg.url) {
				this.loadContent(this.cfg.url);
			}
		}
	});

iup.utils.createComponent('iup.layout.StretchPanel', iup.layout.Panel, 
	{
		prototype : {
			_buildEl : function(cfg) {

				var wrapper = document.createElement('div');
				wrapper.style.position = 'relative';
				var el = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : '0px',
						bottom : '0px',
						left : '0px',
						right : '0px',
						overflow : "hidden"
					}
				});
				
				if (cfg.content[0] instanceof iup.layout.Panel) {
					//this.cfg.items.push(cfg.content);
					el.appendChild (cfg.content[0].getEl());
				}
				
				wrapper.appendChild(el);
				
				this._el = wrapper;
				this._styleEl = el;
			},
			select : function(callback) {
				this.cfg.content[0].select(callback);
			},
			doLayout : function(width, height) {
				iup.layout.StretchPanel.superclass.doLayout.call(this, width, height);
				
				var styleEl = this._getStyleEl();
				
				if (this.cfg.content[0] instanceof iup.layout.Panel) {
					this.cfg.content[0].doLayout($(styleEl).width(), $(styleEl).height());
				}
			},
			setContent : function(item) {
				this.cfg.content[0] = item;
				$(this._getStyleEl()).empty();
				this._getStyleEl().appendChild (item.getEl());
				
				var styleEl = this._getStyleEl();
				
				if (this.cfg.content[0] instanceof iup.layout.Panel) {
					this.cfg.content[0].doLayout($(styleEl).width(), $(styleEl).height());
				}
			}
		}
	});

iup.utils.createComponent('iup.layout.TablePanel', iup.layout.Panel, 
	{
		defaults : {
			columns : undefined,
			rows	: undefined
		},
		prototype : {
			_buildEl : function(cfg) {
				var wrapper = document.createElement('div');
				wrapper.style.position = 'relative';
				var el = iup.utils.createEl('div', {
					style : {
						position : 'absolute',
						top : '0px',
						bottom : '0px',
						left : '0px',
						right : '0px',
						overflow : "hidden"
					}
				});
				
				cfg.columns = cfg.columns || cfg.rows ? Math.ceil(cfg.content.length / cfg.rows) : cfg.content.length;
				cfg.rows = Math.ceil(cfg.content.length / cfg.columns);
				
				for (var i = 0, n = cfg.content.length; i < n; i++) {
					var cell = document.createElement('div');
					cell.style.position = 'absolute';
//					console.log(cfg.content[i]);
					if (cfg.content[i] instanceof iup.layout.Panel) {
						cell.appendChild (cfg.content[i].getEl());
					}
					el.appendChild(cell);
				}
				
				/*if (cfg.content[0] instanceof iup.layout.Panel) {
					el.appendChild (cfg.content[0].getEl());
				}*/
				
				wrapper.appendChild(el);
				
				this._el = wrapper;
				this._styleEl = el;
			},
			select : function(callback) {
				this.cfg.content[0].select(callback);
			},
			doLayout : function(width, height) {
				iup.layout.StretchPanel.superclass.doLayout.call(this, width, height);
				
				var styleEl = this._getStyleEl();
				var cfg = this.cfg;
				
//				if (this.cfg.content[0] instanceof iup.layout.Panel) {
//					this.cfg.content[0].doLayout($(styleEl).width(), $(styleEl).height());
//				}
				var childContainers = styleEl.children;
				
				var elWidth = $(styleEl).width();
				var elHeight = $(styleEl).height();
				var childWidth = Math.floor(elWidth / cfg.columns);
				var childHeigth = Math.floor(elHeight / cfg.rows);
				var lastColumnWidth = elWidth - (cfg.columns - 1) * childWidth;
//				console.log()
				for (var j = 0; j < cfg.rows; j++) {
					for (var i = 0; i < cfg.columns; i++) {
						var lastCol = i === cfg.columns - 1;
						
						var idx = j * cfg.columns + i; 
						
						if (cfg.content[idx] instanceof iup.layout.Panel) {
							cfg.content[idx].doLayout(lastCol ? lastColumnWidth : childWidth, childHeigth);
						}
						
						var s = childContainers[idx].style;
						s.width = (lastCol ? lastColumnWidth : childWidth) + 'px';
						s.height = childHeigth + 'px';
						s.left = i * childWidth + 'px';
						s.top = j * childHeigth + 'px';
					}
				}
			}/*,
			setContent : function(item) {
				this.cfg.content[0] = item;
				$(this._getStyleEl()).empty();
				this._getStyleEl().appendChild (item.getEl());
				
				var styleEl = this._getStyleEl();
				
				if (this.cfg.content[0] instanceof iup.layout.Panel) {
					this.cfg.content[0].doLayout($(styleEl).width(), $(styleEl).height());
				}
			}*/
		}
	});
	
iup.utils.createComponent('iup.layout.BorderPanel', iup.layout.Panel, function () {
	var statics = {
		SPLITTER_TOP : 'top',
		SPLITTER_BOTTOM : 'bottom',
		SPLITTER_LEFT : 'left',
		SPLITTER_RIGHT : 'right'
	};
	function splitter(position, cfg) {
		return cfg.splitter.indexOf(position) > -1 ? 5 : 0;
	}
	function getPanelEl(item) {
		return item instanceof iup.layout.Panel ? item.getEl() : undefined;
	}
	
	function DragManager(panel) {
	    var //mouseOffset,
			currentElement = null,
			prevDragPosition = null;
//			var updates;
	//		var startTime;
	 	var cfg = panel.cfg;
	 	var dragMaster = new iup.DragMaster({
	 		mouseUp		: function() {
				document.getElementsByTagName("body")[0].style.cursor = '';
				if (cfg.id) {
    				iup.db.userConfig.put('config', {
    					id : 'borderpanel_' + cfg.id, 
    					config : cfg.layoutConfig
    				});
	    		}
			},
	 		mouseMove	: function (e) {
				var delta = { 
					x : e.pageX - prevDragPosition.x, 
					y : e.pageY - prevDragPosition.y
				};
				
				var maxDeltaX = cfg.width - cfg.layoutConfig.left - cfg.layoutConfig.right - splitter(statics.SPLITTER_LEFT, cfg) - splitter(statics.SPLITTER_RIGHT, cfg);
				var maxDeltaY = cfg.height - cfg.layoutConfig.top - cfg.layoutConfig.bottom - splitter(statics.SPLITTER_TOP, cfg) - splitter(statics.SPLITTER_BOTTOM, cfg);
				
				switch (currentElement.position) {
					case statics.SPLITTER_TOP : 
						if (cfg.layoutConfig.top < -delta.y) {
							delta.y = -cfg.layoutConfig.top;
						}
						if (delta.y > maxDeltaY) {
							delta.y = maxDeltaY;
						}
						cfg.layoutConfig.top += delta.y;
						break;
					case statics.SPLITTER_BOTTOM : 
						if (cfg.layoutConfig.bottom < delta.y) {
							delta.y = cfg.layoutConfig.bottom;
						}
						if (-delta.y > maxDeltaY) {
							delta.y = -maxDeltaY;
						}
						cfg.layoutConfig.bottom -= delta.y; 
						break;
					case statics.SPLITTER_LEFT : 
						if (cfg.layoutConfig.left < -delta.x) {
							delta.x = -cfg.layoutConfig.left;
						} 
						if (delta.x > maxDeltaX) {
							delta.x = maxDeltaX;
						}
						cfg.layoutConfig.left += delta.x; 
						break;
					case statics.SPLITTER_RIGHT : 
						if (cfg.layoutConfig.right < delta.x) {
							delta.x = cfg.layoutConfig.right;
						}
						if (-delta.x > maxDeltaX) {
							delta.x = -maxDeltaX;
						}
						
						cfg.layoutConfig.right -= delta.x; 
						break;
				}
//				updates++;
				requestAnimationFrame(function() {
					panel.applyLayoutConfig();
				});
				
				prevDragPosition.x += delta.x;
				prevDragPosition.y += delta.y;
				//= {x : e.pageX, y : e.pageY};
			},
			mouseDown	: function(e, element) {
//				updates = 0;
				//startTime = new Date().getTime();
				//mouseOffset = getMouseOffset(element, e);
				prevDragPosition = {x : e.pageX, y : e.pageY};
				currentElement = element;
				document.getElementsByTagName("body")[0].style.cursor = element.style.cursor;
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
	
	return {	
		statics : statics,
	 	defaults : {
	 		center : undefined,
	 		top	: undefined,
	 		left : undefined,
	 		bottom : undefined,
	 		right : undefined,
	 		layoutConfig : {
	 			top : 0,
				bottom : 0,
				left : 0,
				right : 0
	 		},
	 		
			splitter : []
	 	},
		prototype : {
			_buildEl : function(cfg) {
				var self = this;				
				var top = iup.utils.createEl("div", {
					style : {
						position : 'absolute',
						top : '0px',
						left : '0px',
						right : '0px',
						overflow : 'hidden'
					},
					content : getPanelEl(cfg.top)
				});
				
				var left = iup.utils.createEl("div", {
					style : {
						position : 'absolute',
						top : '0px',
						left : '0px',
						bottom : '0px',
						overflow : 'hidden'
					},
					content : getPanelEl(cfg.left)
				});
				
				var leftSplitter = iup.utils.createEl("div", {
					className : 'splitter v-splitter',
					style : {
						left : '-5px',
						display : splitter(statics.SPLITTER_LEFT, cfg) ? 'block' : 'none'
					}
				});
				leftSplitter.position = statics.SPLITTER_LEFT;
				
				var rightSplitter = iup.utils.createEl("div", {
					className : 'splitter v-splitter',
					style : {
						right : '-5px',
						display : splitter(statics.SPLITTER_RIGHT, cfg) ? 'block' : 'none'
					}
				});
				rightSplitter.position = statics.SPLITTER_RIGHT;
				
				var midWrapper = iup.utils.createEl("div", {
					className : 'stretch',
					style : {
						overflow : 'hidden'
					},
					content : getPanelEl(cfg.center)
				});
				
				var center = iup.utils.createEl("div", {
					style : {
						position : 'absolute',
						top : '0px',
						bottom : '0px'
					},
					content : [leftSplitter, midWrapper/*getPanelEl(cfg.center)*/, rightSplitter]
				});
						
				var right = iup.utils.createEl("div", {
					style : {
						position : 'absolute',
						top : '0px',
						right : '0px',
						bottom : '0px',
						overflow : 'hidden'
					},
					content : getPanelEl(cfg.right)
				});
				
				var bottom = iup.utils.createEl("div", {
					style : {
						position : 'absolute',
						left : '0px',
						right : '0px',
						bottom : '0px',
						overflow : 'hidden'
					},
					content : getPanelEl(cfg.bottom)
				});
				
				var topSplitter = iup.utils.createEl("div", {
					className : 'splitter h-splitter',
					style : {
						top : '-5px',
						display : splitter(statics.SPLITTER_TOP, cfg) ? 'block' : 'none'
					}
				});
				topSplitter.position = statics.SPLITTER_TOP;
				
				var bottomSplitter = iup.utils.createEl("div", {
					className : 'splitter h-splitter',
					style : {
						bottom : '-5px',
						display : splitter(statics.SPLITTER_BOTTOM, cfg) ? 'block' : 'none'
					}
				});
				bottomSplitter.position = statics.SPLITTER_BOTTOM;
				
				var mid = iup.utils.createEl("div", {
					style : {
						position : 'absolute',
						left : '0px',
						right : '0px'
					},
					content : [topSplitter, left, center, right, bottomSplitter]
				});
				
				
				
				this._el = iup.utils.createEl("div", {
					//className : "stretch",
					content : [top, mid, bottom]
				});
				
				this.applyLayoutConfig();
				
				var dragManager = new DragManager(this);
				dragManager.makeDraggable(topSplitter);
				dragManager.makeDraggable(bottomSplitter);
				dragManager.makeDraggable(leftSplitter);
				dragManager.makeDraggable(rightSplitter);
				
				if (cfg.top instanceof iup.layout.Panel) {
					cfg.content.push(cfg.top);
				}
				if (cfg.right instanceof iup.layout.Panel) {
					cfg.content.push(cfg.right);
				}
				if (cfg.bottom instanceof iup.layout.Panel) {
					cfg.content.push(cfg.bottom);
				}
				if (cfg.left instanceof iup.layout.Panel) {
					cfg.content.push(cfg.left);
				}
				if (cfg.center instanceof iup.layout.Panel) {
					cfg.content.push(cfg.center);
				}
				
				var id = cfg.id;
				if (id) {
					iup.db.userConfig.onload('borderpanel_' + id, function (config) {
						cfg.layoutConfig = config;
						self.applyLayoutConfig();
					});
				}
			},
			applyLayoutConfig : function(){
				var cfg = this.cfg,
					el = this.getEl(),
					top = el.children[0],
					mid = el.children[1],
					bottom = el.children[2],
					left = mid.children[1],
					center = mid.children[2],
					right = mid.children[3];
				top.style.height = cfg.layoutConfig.top + 'px';
				bottom.style.height = cfg.layoutConfig.bottom + 'px';
				left.style.width = cfg.layoutConfig.left + 'px';
				right.style.width = cfg.layoutConfig.right + 'px';
				mid.style.top = cfg.layoutConfig.top + splitter(statics.SPLITTER_TOP, cfg) + 'px';
				mid.style.bottom = cfg.layoutConfig.bottom + splitter(statics.SPLITTER_BOTTOM, cfg) + 'px';
				center.style.left = cfg.layoutConfig.left + splitter(statics.SPLITTER_LEFT, cfg) + 'px';
				center.style.right = cfg.layoutConfig.right + splitter(statics.SPLITTER_RIGHT, cfg) + 'px';
				
				this.doLayout();
			},
			select : function(callback) {
				if (this.cfg.passSelectionTo) {
					console.log('passSelectionTo');
					this.cfg.passSelectionTo.select(callback);
					return;
				}
				
				iup.layout.KeyboardNavigationManager.currentTarget = {
					target : this, parentCallback : callback,removeSelection : removeSelection
				}
				
				var self = this,
					cfg = this.cfg,
					el = this.getEl(),
					top = el.children[0],
					mid = el.children[1],
					bottom = el.children[2],
					left = mid.children[1],
					center = mid.children[2],
					right = mid.children[3];
				
				var LEFT = 37,
					UP = 38,
					RIGHT = 39,
					BOTTOM = 40,
					ENTER = 13,
					ESC = 27;
				
				var transitions = {
					top : {
						40 : center
					},
					left : {
						38 : top,
						39 : center,
						40 : bottom
					},
					center : {
						37 : left,
						38 : top,
						39 : right,
						40 : bottom
					},
					right : {
						37 : center,
						38 : top,
						40 : bottom
					},
					bottom : {
						38 : center
					},
					get : function (panel) {
						if (panel === top) {
							return this.top;
						}
						if (panel === left) {
							return this.left;
						}
						if (panel === center) {
							return this.center;
						}
						if (panel === right) {
							return this.right;
						}
						if (panel === bottom) {
							return this.bottom;
						}
						
					}
				};
				
				var marked;
				
				function init() {
					$(el).addClass('panel-selected');
					el.setAttribute('tabIndex', '-1');
					el.focus();
					el.onblur = removeSelection;
					el.onkeyup = handler;
					
					$(marked).addClass('panel-marked');
				}
				
				function removeSelection () {
					$(el).removeClass('panel-selected');
					el.removeAttribute('tabIndex');
					el.onkeyup = undefined;
					el.onblur = undefined;
					$(marked).removeClass('panel-marked');
				}
				
				marked = center;
				init();
				
				function getContent(panel) {
					if (panel === top) {
						return self.cfg.top;
					}
					if (panel === left) {
						return self.cfg.left;
					}
					if (panel === center) {
						return self.cfg.center;
					}
					if (panel === right) {
						return self.cfg.right;
					}
					if (panel === bottom) {
						return self.cfg.bottom;
					}
				}
				
				function handler(evt) {
					if (evt.keyCode === ESC) {
						removeSelection ();
						if (typeof callback == "function") {
							setTimeout(function() {
								callback();
							},5);
							
						}
					} else if (evt.keyCode === ENTER) {
						var target = getContent(marked);
						if (target) {
							removeSelection ();
							target.select(init);
						}
					}
					var target = transitions.get(marked)[evt.keyCode];
					if (target && getContent(target)) {
						$(marked).removeClass('panel-marked');
						marked = target;
						$(marked).addClass('panel-marked');
					}
				}
				
			},
			doLayout : function(width, height) {
				if (width) {
					this.cfg.width = width;
				}
				if (height) {
					this.cfg.height = height;
				}
				if (width || height) {
					iup.layout.BorderPanel.superclass.doLayout.call(this, this.cfg.width, this.cfg.height);
				}
				
				var cfg = this.cfg;
				var top = cfg.layoutConfig.top + splitter(statics.SPLITTER_TOP, this.cfg),
					bottom = cfg.layoutConfig.bottom + splitter(statics.SPLITTER_BOTTOM, this.cfg),
					left = cfg.layoutConfig.left + splitter(statics.SPLITTER_LEFT, this.cfg),
					right = cfg.layoutConfig.right + splitter(statics.SPLITTER_RIGHT, this.cfg);
				var midWidth = this.cfg.width - left - right;
				var midHeight = this.cfg.height - top - bottom;
				
				if (cfg.center instanceof iup.layout.Panel) {
					cfg.center.doLayout(midWidth, midHeight);
				}
				
				if (cfg.top instanceof iup.layout.Panel) {
					cfg.top.doLayout(this.cfg.width, cfg.layoutConfig.top);
				}
				
				if (cfg.bottom instanceof iup.layout.Panel) {
					cfg.bottom.doLayout(this.cfg.width, cfg.layoutConfig.bottom);
				}
				
				if (cfg.left instanceof iup.layout.Panel) {
					cfg.left.doLayout(cfg.layoutConfig.left, midHeight);
				}
				
				if (cfg.right instanceof iup.layout.Panel) {
					cfg.right.doLayout(cfg.layoutConfig.right, midHeight);
				}
			}
		}
	};
}());
	
iup.utils.createComponent('iup.layout.TabPanel', iup.layout.Panel, 
	function () {
		function buildTab(item, idx) {
			var tabContent = item.content.getEl();
				
			var cfg = this.cfg,
				self = this;
			
			var style = cfg.buttonsPosition === 'top'
						? {height : cfg.buttonsSize + 'px'}
						: {width : cfg.buttonsSize + 'px'};
			
			var button = new iup.Button({
				text : item.title,
				icon : item.icon,
				className : "tab-button" + (cfg.buttonsPosition === 'top' ? " htab-button" : " vtab-button"),
				style	: style,
				handler : function () {
					var buttons = self.tabButtonsPanel.children;
					for (var i=0; i < buttons.length; i++) {
						if (buttons[i] === this) {
							self.discloseItem(i);
						}
					}
				}
			});
			
			var shift = cfg.buttonsPosition === 'top' ? 'bottom' : 'right';
			button.getEl().style[shift] = -1;
			
			if (item.closable) {
				var closeButton = document.createElement('div');
				button.getEl().appendChild(closeButton);
				closeButton.className = 'close-tab-button';
				closeButton.onclick = function(event) {
					
					var buttons = self.tabButtonsPanel.children;
					for (var i=0; i < buttons.length; i++) {
						if (buttons[i] === button.getEl()) {
							self.removeItem(i);
						}
					}
					event.cancelBubble = true;
				};
				closeButton.innerHTML = '<span class="glyphicon glyphicon-remove" style="font-size:11px;"></span>';
//				'<img height="10" width="10" style="fill:#f00" src="svg/close.svg" />';
			}
			
			this.tabButtonsPanel.appendChild(button.getEl());
			this.content.appendChild(tabContent);
			tabContent.style.display = "none";
		}
	
		return {
			defaults : function (cfg) {
				return {
					buttonsPosition : 'top',
					buttonsSize : !cfg.buttonsPosition || cfg.buttonsPosition === 'top' ? 20 : 100
				};
			},
			prototype : {
				_buildEl : function(cfg) {
					var container = document.createElement("div");
					
					var tabButtonsPanel = document.createElement("div");
					tabButtonsPanel.className = "tab-panel-buttons-wrapper";
					if (cfg.buttonsPosition === 'top') {
						tabButtonsPanel.style.right = '0px';
					} else {
						tabButtonsPanel.style.bottom = '0px';
						tabButtonsPanel.style.width = cfg.buttonsSize + 'px';
					}
					
					var content = document.createElement("div");
					content.style.position = 'absolute';
					content.style.bottom = '0px';
					content.style.right = '0px';
					
					if (cfg.buttonsPosition === 'top') {
						content.style.left = '0px';
					} else {
						content.style.left = cfg.buttonsSize + 'px';
						content.style.top = '0px';
					}
					
					content.className = 'tab-panel-content-wrapper';
					
					
					container.appendChild(content);
					container.appendChild(tabButtonsPanel);
					
					this._el = container;
					this.tabButtonsPanel = tabButtonsPanel;
					this.content = content;
					
//					var self = this;
					for (var idx in cfg.content) {
						var item = cfg.content[idx];
						buildTab.call(this, item);
					}
				},
				addItem : function(item, idx) {
					this.cfg.content.push(item);
					
					buildTab.call(this, item, idx);
					
					if (this.cfg.content.length === 1) {
						this.discloseItem(0);
					}
					
					if (this.cfg.buttonsPosition === 'top') {
						this.content.style.top = $(this.tabButtonsPanel).outerHeight();
						if (this.disclosedItem) {
							this.disclosedItem.content.doLayout($(this.content).width(), $(this.content).height());
						}
					}
				},
				removeItem : function(idx) {
//					var proceed = true;
					var item = this.cfg.content[idx];
					if (typeof item.beforeclose == "function") {
						if (item.beforeclose() === false) {
							return;
						}
					}
//					var cfg = this.cfg;
					var contents = this.content.children;
					this.content.removeChild(contents[idx]);
				
					var buttons = this.tabButtonsPanel.children;
					this.tabButtonsPanel.removeChild(buttons[idx]);
					
					this.cfg.content.splice(idx, 1);
					if (this.disclosedItem === item) {
						if (buttons.length > idx) {
							this.discloseItem(idx);
						} else if (idx > 0){
							this.discloseItem(idx-1);
						}
					}
					
					if (this.cfg.buttonsPosition === 'top') {
						this.content.style.top = $(this.tabButtonsPanel).outerHeight();
						if (this.disclosedItem) {
							this.disclosedItem.content.doLayout($(this.content).width(), $(this.content).height());
						}
					}
				},
				doLayout : function(width, height) {
					iup.layout.TabPanel.superclass.doLayout.call(this, width, height);
					
					if (this.cfg.buttonsPosition === 'top') {
						this.content.style.top = $(this.tabButtonsPanel).outerHeight() + 'px';
						//console.log(this.content.style.top, $(this.tabButtonsPanel).outerHeight(), $(this.content).height());
					}
					
					if (this.disclosedItem) {
						this.disclosedItem.content.doLayout($(this.content).width(), $(this.content).height());
					} else {
						this.discloseItem(0);
					}
				},
				select : function(callback) {
					var self = this,
//						cfg = this.cfg,
						el = this.getEl(),
						buttons = this.tabButtonsPanel.children;
					
					iup.layout.KeyboardNavigationManager.currentTarget = {
						target : this, parentCallback : callback, removeSelection : removeSelection
					}
						
					var LEFT = 37,
						UP = 38,
						RIGHT = 39,
						DOWN = 40,
						ENTER = 13,
						ESC = 27;
					
										
					//var marked = null;
					
					var currentItem = 0;
					for (var i = 0 ; i < self.content.children.length; i++) {
						if (self.content.children[i] === self.disclosedItem.content.getEl()) {
							currentItem = i;
							break;
						}
					}
					
					var marked = buttons[currentItem];						
					
					init();
					
					function init() {
						$(el).addClass('panel-selected');
						el.setAttribute('tabIndex', '-1');
						el.focus();
						el.onblur = removeSelection;
						el.onkeyup = handler;
						$(marked).addClass('panel-marked');
					}
					
					function removeSelection () {
						$(el).removeClass('panel-selected');
						el.removeAttribute('tabIndex');
						el.onkeyup = undefined;
						el.onblur = undefined;
						$(marked).removeClass('panel-marked');
					}
					
					function handler(evt) {
						if (evt.keyCode === ESC) {
							removeSelection ();
							if (typeof callback == "function") {
								setTimeout(function() {
									callback();
								},5);
								
							}
						} else if (evt.keyCode === ENTER) {
							var target = self.cfg.content[currentItem].content;
							if (target) {
								removeSelection ();
								target.select(function(){init();});
							}
						}
//						var target;
						if (((evt.keyCode === LEFT && self.cfg.buttonsPosition !=='left') || evt.keyCode === UP && self.cfg.buttonsPosition ==='left') && currentItem > 0) {
							currentItem --;
						} else if (((evt.keyCode === RIGHT && self.cfg.buttonsPosition !=='left') || evt.keyCode === DOWN && self.cfg.buttonsPosition ==='left') && currentItem < buttons.length - 1) {
							currentItem ++;
						}
						if (marked !== buttons[currentItem]) {
							self.discloseItem(currentItem);
							$(marked).removeClass('panel-marked');
							marked = buttons[currentItem];
							$(marked).addClass('panel-marked');
						}
					}
					
				},
				
				discloseItem : function(idx) {
					var contents = this.content.children;
					if (contents.length > 0) {
						for (var i = 0; i < contents.length; i++) {
							contents[i].style.display = "none";
						}
						contents[idx].style.display = "block";
						
						var buttons = this.tabButtonsPanel.children;
						for (var i = 0; i < buttons.length; i++) {
							$(buttons[i]).find('button').removeClass("selected");
						}
						$(buttons[idx]).find('button').addClass("selected");
						var item = this.cfg.content[idx];
						if (typeof item.onDisclose === "function") {
							item.onDisclose(true);
						}
						
						this.disclosedItem = item;
						item.content.doLayout($(this.content).width(), $(this.content).height());
					}
				},
				getChildren : function() {
					var ret = [];
					var tabs = this.cfg.content;
					for (var i = 0; i < tabs.length; i++) {
						ret.push(tabs[i].content);
					}
					return ret;
				}
			}
		};
	}());

iup.utils.createComponent('iup.layout.Toolbar', iup.layout.Panel, 
	{
		defaults : {
			marginBetweenItems : 5
		},
		prototype : {
			_buildEl : function(cfg) {
				var sizeWrapper = document.createElement("div");
				sizeWrapper.style.position = 'relative';
				var wrapper = iup.utils.createEl("div", {
					style : {
						position : 'absolute',
						top : '0px',
						bottom : '0px',
						left : '0px',
						right : '0px'
					}
				});
				
				sizeWrapper.appendChild(wrapper);
				var table = document.createElement("table");
				var tbody = document.createElement("tbody");
				table.appendChild(tbody);
				
				table.style.width = "100%";
				
				var tr = document.createElement("tr");
				tbody.appendChild(tr);
				var leftTd = document.createElement("td");
				tr.appendChild(leftTd);
				
				var rightTd = document.createElement("td");
				rightTd.style.textAlign = "right";
				tr.appendChild(rightTd);
				
				var left = true;
				for (var i = 0; i < cfg.content.length; i++) {
					var item = cfg.content[i];
					if (item instanceof iup.layout.Element) {
						item = item.getEl();
					} 
					
					if (left) {
						if (item == "->") {
							left = false;
						} else {
							if (cfg.marginBetweenItems) {
								item.style.marginRight = cfg.marginBetweenItems + 'px';
							}
							leftTd.appendChild(item);
						}
					} else {
						if (cfg.marginBetweenItems) {
							item.style.marginLeft = cfg.marginBetweenItems + 'px';
						}
						rightTd.appendChild(item);
					}
				}
				
				wrapper.appendChild(table);
				this._el = sizeWrapper;
				this._styleEl = wrapper;
			}
		}
	});

	
/*iup.utils.createComponent('iup.layout.ViewPort', iup.layout.StretchPanel, {
	_init : function(oCfg) {
		var self = this;

		var w = window,
		    d = document,
		    e = d.documentElement,
		    b = d.body || d.getElementsByTagName('body')[0];
		    
		//b.style.overflow = "hidden";
		b.appendChild(this.getEl());
		
		window.onresize = function(event) {
			var x = w.innerWidth || e.clientWidth || b.clientWidth,
		    	y = w.innerHeight|| e.clientHeight|| b.clientHeight;
			self.doLayout(x, y);
		};
		
		window.onkeyup = function (evt) {
			if (evt.keyCode === 13 && evt.altKey) {
				self.cfg.content[0].select();
			}
		};
		
		window.onresize();
	}
});*/