iup.utils.createComponent('iup.layout.Element', undefined, 
	{
		prototype : {
			_buildEl : function(cfg) {
				this._el = document.createElement("div");
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
						}
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
			};
				
			$(this.getEl()).addClass('element');	
				
			if (this.cfg.className) {
				$(this._getStyleEl()).addClass(this.cfg.className);
			};
		}
	});

	iup.utils.createComponent('iup.layout.Panel', iup.layout.Element, 
		{
			defaults : {
				items  :[]
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
						
					for (var idx in cfg.items) {
						var item = cfg.items[idx];
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
						//this._items.push(item);
						this.getEl().appendChild (item.getEl());
					} else if (item instanceof iup.layout.Element) {
						this.getEl().appendChild (item.getEl());
					} else if (item instanceof HTMLElement) {
						this.getEl().appendChild(item);
					}
				},
				empty : function() {
					$(this.getEl()).empty();
					//this._items.splice(0, this._items.length);
				}
			}
		});
		
iup.utils.createComponent('iup.layout.ScrollPanel', iup.layout.Panel, 
	function () {
	
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
			new ScrollDragManager('X').makeDraggable(this.hScroll.children[0]);
			new ScrollDragManager('Y').makeDraggable(this.vScroll.children[0]);
			//windowDragManager.makeDraggable(header.getEl());
			
			var self = this;
			
			function ScrollDragManager(axis) {
				var mouseOffset;
				var prevDragPosition;
				var axis = axis;
				
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
							var scrollAmount = - scale * delta;
							var scrolled = scroll.call(self, - scale * delta, 0).x / scale;
							prevDragPosition.x += Math.round(scrolled);
						}
					},
					mouseDown	: function(e, element) {
						mouseOffset = getMouseOffset(element, e);
						prevDragPosition = {x : e.pageX, y : e.pageY}
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
			
			var bothScrolls = this.cfg.scroll === constants.SCROLL_BOTH && (s.contentHeight > s.bodyHeight && s.contentWidth > s.bodyWidth);
			var vScrollerOffset = (s.bodyHeight - s.vScrollerSize - (bothScrolls ? constants.SCROLLBAR_WIDTH : 0)) * s.offsetY / (s.contentHeight - s.bodyHeight);
			this.vScroll.children[0].style.top = vScrollerOffset + 'px';
			
			var hScrollerOffset = (s.bodyWidth - s.hScrollerSize - (bothScrolls ? constants.SCROLLBAR_WIDTH : 0)) * s.offsetX / (s.contentWidth - s.bodyWidth);
			this.hScroll.children[0].style.left = hScrollerOffset + 'px';
			
			return {x : s.offsetX - prevOffset.x, y : s.offsetY - prevOffset.y};
		}
		
		function displayScroll() {
			var bodyHeight = $(this.getEl()).height();
			var contentHeight = $(this._getStyleEl()).height();
			
			var bodyWidth = $(this.getEl()).width();
			var contentWidth = $(this._getStyleEl()).width();
			
			if (this.cfg.scroll === constants.SCROLL_BOTH && (contentHeight > bodyHeight || contentWidth > bodyWidth)) {
				if (contentHeight + constants.SCROLLBAR_WIDTH > bodyHeight) {
					contentWidth += constants.SCROLLBAR_WIDTH;
				} 
				if (contentWidth > bodyWidth) {
					contentHeight += constants.SCROLLBAR_WIDTH;
				}
			}
			var bothScrolls = this.cfg.scroll === constants.SCROLL_BOTH &&(contentHeight > bodyHeight && contentWidth > bodyWidth);
			
			if (bothScrolls) {
				this.vScroll.style.bottom = '10px';
				this.hScroll.style.right = '10px';
			} else {
				this.vScroll.style.bottom = '0px';
				this.hScroll.style.right = '0px';
			}
			
			if (contentHeight > bodyHeight && this.cfg.scroll !== constants.SCROLL_HORIZONTAL) {
				this.vScroll.style.display = "block";
				this.scrollData.vScrollVisible = true;
				
				if (this.cfg.scroll === constants.SCROLL_VERTICAL) {
					this._getStyleEl().style.marginRight = '10px';
					contentHeight = $(this._getStyleEl()).height();
				}
				
				this.scrollData.vScrollerSize = Math.max(bodyHeight * bodyHeight / contentHeight - (bothScrolls ? constants.SCROLLBAR_WIDTH : 0), 8);
				this.vScroll.children[0].style.height = this.scrollData.vScrollerSize + "px";
			} else {
				this.scrollData.vScrollVisible = false;
				this.vScroll.style.display = "none";
				this._getStyleEl().style.marginRight = '0px';
			}
			
			if (contentWidth > bodyWidth && this.cfg.scroll !== constants.SCROLL_VERTICAL) {
				this.hScroll.style.display = "block";
				this.scrollData.hScrollVisible = true;
				/*if (this.cfg.scroll === constants.SCROLL_HORIZONTAL) {
					this._getStyleEl().style.marginBottom = '10px';
					contentWidth = $(this._getStyleEl()).width();
				}*/
				
				this.scrollData.hScrollerSize = Math.max(bodyWidth * bodyWidth / contentWidth - (bothScrolls ? constants.SCROLLBAR_WIDTH : 0), 8);
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
		
		var constants = {
			SCROLL_VERTICAL : 'vertical',
			SCROLL_HORIZONTAL : 'horizontal',
			SCROLL_BOTH : 'both',
			SCROLLBAR_WIDTH : 10
		}
		
		return {
			constants : constants,
			defaults : {
				scroll  : constants.SCROLL_VERTICAL, // 'horizontal', 'both'
				step : undefined
			},
			prototype : {
				_buildEl : function(cfg) {
					var self = this;
					var wrapper = document.createElement('div');
					wrapper.style.position = 'relative';
					wrapper.style.overflow = "hidden";
					
					var el = document.createElement('div');
					var s = el.style;
					s.position = 'relative';
					
					for (var idx in cfg.items) {
						var item = cfg.items[idx];
						if (item instanceof iup.layout.Panel) {
							//this._items.push(item);
							el.appendChild (item.getEl());
						} else if (item instanceof iup.layout.Element) {
							el.appendChild (item.getEl());
						} else if (item instanceof HTMLElement) {
							el.appendChild(item);
						}
					}
					
					wrapper.onwheel = function (evt) {
						fixEvent.call(self, evt, wrapper);
						scroll.call(self, evt.dX, evt.dY);
					}
					
					wrapper.onmousewheel = function(evt) {
						fixEvent.call(self, evt, wrapper);
						scroll.call(self, evt.dX, evt.dY);
						console.log(evt);
					}
					
					var vScroller = document.createElement("div");
					this.vScroll = iup.utils.createEl({tag:"div", className:"scrollbar v-scrollbar", style : {display:"none"}, content:vScroller});
					var hScroller = document.createElement("div");
					this.hScroll = iup.utils.createEl({tag:"div", className:"scrollbar h-scrollbar", style : {display:"none"}, content:hScroller});
					this.scrollData = {};
					
					wrapper.appendChild(el);
					wrapper.appendChild(this.vScroll);
					wrapper.appendChild(this.hScroll);
					
					makeScrollDraggable.call(this);
					
					this._el = wrapper;
					this._styleEl = el;
				},
				doLayout : function(width, height) {
					iup.layout.ScrollPanel.superclass.doLayout.call(this, width, height);
					
					displayScroll.call(this);
					
					/*var styleEl = this._getStyleEl();
					
					if (this.cfg.content instanceof iup.layout.Panel) {
						this.cfg.content.doLayout($(styleEl).width(), $(styleEl).height());
					}*/
					}
				}
			}
		}()
	);		

iup.utils.createComponent('iup.layout.StretchPanel', iup.layout.Panel, 
	{
	
		prototype : {
			_buildEl : function(cfg) {

				var wrapper = document.createElement('div');
				wrapper.style.position = 'relative';
				var el = document.createElement('div');
				with (el.style) {
					position = 'absolute';
					top = '0px';
					bottom = '0px';
					left = '0px';
					right = '0px';
					overflow = "hidden";
				}
				
				if (cfg.content instanceof iup.layout.Panel) {
					//this.cfg.items.push(cfg.content);
					el.appendChild (cfg.content.getEl());
				}
				
				wrapper.appendChild(el);
				
				this._el = wrapper;
				this._styleEl = el;
			},
			doLayout : function(width, height) {
				iup.layout.StretchPanel.superclass.doLayout.call(this, width, height);
				
				var styleEl = this._getStyleEl();
				
				if (this.cfg.content instanceof iup.layout.Panel) {
					this.cfg.content.doLayout($(styleEl).width(), $(styleEl).height());
				}
			}
		}
	});
	
iup.utils.createComponent('iup.layout.BorderPanel', iup.layout.Panel, 
	{	
	 	defaults : {
	 		layoutConfig : {
	 			top : 0,
				bottom : 0,
				left : 0,
				right : 0
	 		}
	 	},
		prototype : {
			_buildEl : function(cfg) {
				var el = document.createElement('table');
				el.style.width = "100%";
				el.style.height = "100%";
				
				var columns = 1;
				if (cfg.left && cfg.layoutConfig.left > 0) {columns++;} 
				if (cfg.right && cfg.layoutConfig.right > 0) {columns++;} 
				
				var tbody = document.createElement('tbody');
					el.appendChild(tbody);
				
				if (cfg.top && cfg.layoutConfig.top > 0) {
					var trTop = document.createElement('tr');
						tbody.appendChild(trTop);	
					var top = document.createElement('td');
						top.style.verticalAlign = 'top';
						$(top).attr('colspan', columns);
						trTop.appendChild(top);
						top.style.height = cfg.layoutConfig.top + 'px';
					if (cfg.top instanceof iup.layout.Panel) {
						//this._items.push(cfg.top);
						top.appendChild(cfg.top.getEl());
					}
				}
				
				var trMid = document.createElement('tr');
					tbody.appendChild(trMid);
				
				if (cfg.left && cfg.layoutConfig.left > 0) {
					var left = document.createElement('td');
						left.style.verticalAlign = 'top';
						trMid.appendChild(left);
						left.style.width = cfg.layoutConfig.left + 'px';	
					if (cfg.left instanceof iup.layout.Panel) {
						//this._items.push(cfg.left);
						left.appendChild(cfg.left.getEl());
					}
				}
					
				var center = document.createElement('td');
					center.style.verticalAlign = 'top';
					trMid.appendChild(center);
				
				if (cfg.center instanceof iup.layout.Panel) {
					//this._items.push(cfg.center);
					center.appendChild(cfg.center.getEl());
				}
				
				if (cfg.right && cfg.layoutConfig.right > 0) {
					var right = document.createElement('td');
						right.style.verticalAlign = 'top';
						trMid.appendChild(right);
						right.style.width = cfg.layoutConfig.right + 'px';
					if (cfg.right instanceof iup.layout.Panel) {
						//this._items.push(cfg.right);
						right.appendChild(cfg.right.getEl());
					}	
				}
					
				if (cfg.bottom && cfg.layoutConfig.bottom > 0) {
					var trBottom = document.createElement('tr');
						tbody.appendChild(trBottom);
					var bottom = document.createElement('td');
						bottom.style.verticalAlign = 'top';
						$(bottom).attr('colspan', columns);
						trBottom.appendChild(bottom);
						bottom.style.height = cfg.layoutConfig.bottom + 'px';
					if (cfg.bottom instanceof iup.layout.Panel) {
						//this._items.push(cfg.bottom);
						bottom.appendChild(cfg.bottom.getEl());
					}
				}
				
				this._el = el;
			},
			doLayout : function(width, height) {
				iup.layout.BorderPanel.superclass.doLayout.call(this, width, height);
				
				var cfg = this.cfg;
				var midWidth = width - cfg.layoutConfig.left - cfg.layoutConfig.right;
				var midHeight = height - cfg.layoutConfig.top - cfg.layoutConfig.bottom;
				
				if (cfg.center instanceof iup.layout.Panel) {
					cfg.center.doLayout(midWidth, midHeight);
				}
				
				if (cfg.top instanceof iup.layout.Panel) {
					cfg.top.doLayout(width, cfg.layoutConfig.top);
				}
				
				if (cfg.bottom instanceof iup.layout.Panel) {
					cfg.bottom.doLayout(width, cfg.layoutConfig.bottom);
				}
				
				if (cfg.left instanceof iup.layout.Panel) {
					cfg.left.doLayout(cfg.layoutConfig.left, midHeight);
				}
				
				if (cfg.right instanceof iup.layout.Panel) {
					cfg.right.doLayout(cfg.layoutConfig.right, midHeight);
				}
			}
		}
	});
	
iup.utils.createComponent('iup.layout.TabPanel', iup.layout.Panel, 
	function () {
		function buildTab(item, idx) {
			var tabContent = item.content.getEl();
				
			var cfg = this.cfg,
				self = this;
			
			var style = cfg.buttonsPosition === 'top'
						? {height : cfg.buttonsSize + 'px'}
						: {width : cfg.buttonsSize + 'px'}
			
			var button = new iup.Button({
				text : item.title,
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
			
			if (item.closable) {
				var closeButton = document.createElement('div');
				button._getStyleEl().appendChild(closeButton);
				closeButton.className = 'close-tab-button'
				closeButton.onclick = function(event) {
					
					var buttons = self.tabButtonsPanel.children;
					for (var i=0; i < buttons.length; i++) {
						if (buttons[i] === button.getEl()) {
							self.removeItem(i);
						}
					}
					event.cancelBubble = true;
				}
				closeButton.innerHTML = '<img height="10" width="10" style="fill:#f00" src="svg/close.svg" />';
				//closeButton.innerHTML = '<svg role="img" style="fill:#00f;" height="10" width="10"><use xlink:href="svg/close-icon.svg"></use></svg>';
			}
			
			this.tabButtonsPanel.appendChild(button.getEl());
			this.content.appendChild(tabContent);
			tabContent.style.display = "none";
		}
	
		return {
			defaults : {
				buttonsPosition : 'top',
				buttonsSize : 20
			},
			prototype : {
				_buildEl : function(cfg) {
					var container = document.createElement("div");
					
					var tabButtonsPanel = document.createElement("div");
					tabButtonsPanel.style.position = 'absolute';
					tabButtonsPanel.style.top = '0px';
					tabButtonsPanel.style.left = '0px';
					if (cfg.buttonsPosition === 'top') {
						tabButtonsPanel.style.height = cfg.buttonsSize + 'px';
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
						content.style.top = cfg.buttonsSize + 'px';
					} else {
						content.style.left = cfg.buttonsSize + 'px';
						content.style.top = '0px';
					}
					
					content.className = 'tab-panel-content-wrapper';
					
					container.appendChild(tabButtonsPanel);
					container.appendChild(content);
					
					this._el = container;
					this.tabButtonsPanel = tabButtonsPanel;
					this.content = content;
					
					var self = this;
					for (var idx in cfg.items) {
						var item = cfg.items[idx];
						buildTab.call(this, item);
					}
				},
				addItem : function(item, idx) {
					this.cfg.items.push(item);
					
					buildTab.call(this, item, idx);
					
					if (this.cfg.items.length === 1) {
						this.discloseItem(0);
					}
				},
				removeItem : function(idx) {
					var cfg = this.cfg;
					var contents = this.content.children;
					this.content.removeChild(contents[idx]);
				
					var buttons = this.tabButtonsPanel.children;
					this.tabButtonsPanel.removeChild(buttons[idx]);
					
					var item = this.cfg.items[idx];
					this.cfg.items.splice(idx, 1);
					if (this.disclosedItem === item) {
						if (buttons.length > idx) {
							this.discloseItem(idx);
						} else if (idx > 0){
							this.discloseItem(idx-1);
						}
					}
				},
				doLayout : function(width, height) {
					iup.layout.TabPanel.superclass.doLayout.call(this, width, height);

					if (this.disclosedItem) {
						this.disclosedItem.content.doLayout($(this.content).width(), $(this.content).height());
					} else {
						this.discloseItem(0);
					}
				},
				discloseItem : function(idx) {
					var contents = this.content.children;
					for (var i = 0; i < contents.length; i++) {
						contents[i].style.display = "none";
					};
					contents[idx].style.display = "block";
					
					var buttons = this.tabButtonsPanel.children;
					for (var i = 0; i < buttons.length; i++) {
						$(buttons[i]).removeClass("selected");
					};
					$(buttons[idx]).addClass("selected");
					console.log(this.cfg.items);
					var item = this.cfg.items[idx];
					if (typeof item.onDisclose === "function") {
						item.onDisclose(true);
					}
					
					this.disclosedItem = item;
					item.content.doLayout($(this.content).width(), $(this.content).height());
				}
			}
		}
	}());

iup.utils.createComponent('iup.layout.Toolbar', iup.layout.Panel, 
	{
		prototype : {
			_buildEl : function(cfg) {
				var sizeWrapper = document.createElement("div");
				sizeWrapper.style.position = 'relative';
				var wrapper = document.createElement("div");
				sizeWrapper.appendChild(wrapper);
				table = document.createElement("table");
				var tbody = document.createElement("tbody");
				table.appendChild(tbody);
				
				with (wrapper.style) {
					position = 'absolute';
					top = '0px';
					bottom = '0px';
					left = '0px';
					right = '0px';
				}
				
				with(table.style) {
					width = "100%";
				}
			//		$(table).attr('cellpadding', '0');
				var tr = document.createElement("tr");
				tbody.appendChild(tr);
				var leftTd = document.createElement("td");
				tr.appendChild(leftTd);
				
				var rightTd = document.createElement("td");
				rightTd.style.textAlign = "right";
				tr.appendChild(rightTd);
				
				var left = true;
				for (var i = 0; i < cfg.items.length; i++) {
					var item = cfg.items[i];
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

iup.utils.createComponent('iup.layout.ViewPort', iup.layout.StretchPanel, {
	_init : function(oCfg) {
		var self = this;

		var w = window,
		    d = document,
		    e = d.documentElement,
		    b = d.body || d.getElementsByTagName('body')[0];
		    
		b.style.overflow = "hidden";
		b.appendChild(this.getEl());
		
		window.onresize = function(event) {
			var x = w.innerWidth || e.clientWidth || b.clientWidth,
		    	y = w.innerHeight|| e.clientHeight|| b.clientHeight;
			self.doLayout(x, y);
		};
		
		window.onresize();
	}
});
