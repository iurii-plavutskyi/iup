iup.utils.createComponent('iup.layout.Element', undefined, 
	{
		prototype : {
			_buildEl : function(cfg) {
				this._el = document.createElement("div");
			},
			hide : function(callback) {
				this._el.style.display = "none";
			},
			show : function(callback) {
				this._el.style.display = "";
			},
			getEl : function() {
				return this._el;
			},
			_getStyleEl : function() {
				return this._styleEl || this._el;
			}
		},
		construct : function(oCfg) {
			this.cfg = oCfg;
			this._buildEl(this.cfg);
			if (this.cfg.style) {
				iup.utils.appendStyle(this._getStyleEl(), this.cfg.style);
			};
				
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
				_items : [],
			
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
							this._items.push(item);
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
				getItems : function() {
					return this._items;
				},
				addItem : function(item) {
					if (item instanceof iup.layout.Panel) {
						this._items.push(item);
						this.getEl().appendChild (item.getEl());
					} else if (item instanceof iup.layout.Element) {
						this.getEl().appendChild (item.getEl());
					} else if (item instanceof HTMLElement) {
						this.getEl().appendChild(item);
					}
				},
				empty : function() {
					$(this.getEl()).empty();
					this._items.splice(0, this._items.length);
				}
			}
		});

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
					this._items.push(cfg.content);
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
						this._items.push(cfg.top);
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
						this._items.push(cfg.left);
						left.appendChild(cfg.left.getEl());
					}
				}
					
				var center = document.createElement('td');
					center.style.verticalAlign = 'top';
					trMid.appendChild(center);
				
				if (cfg.center instanceof iup.layout.Panel) {
					this._items.push(cfg.center);
					center.appendChild(cfg.center.getEl());
				}
				
				if (cfg.right && cfg.layoutConfig.right > 0) {
					var right = document.createElement('td');
						right.style.verticalAlign = 'top';
						trMid.appendChild(right);
						right.style.width = cfg.layoutConfig.right + 'px';
					if (cfg.right instanceof iup.layout.Panel) {
						this._items.push(cfg.right);
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
						this._items.push(cfg.bottom);
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
	{
		defaults : {
			buttonsPanelHeight : 20
		},
		prototype : {
			_buildEl : function(cfg) {
				var container = document.createElement("div");
				
				var tabButtonsPanel = document.createElement("div");
				tabButtonsPanel.style.height = cfg.buttonsPanelHeight + 'px';
				
				var contentSizeWrapper = document.createElement("div");
				contentSizeWrapper.style.position = 'relative';
				var content = document.createElement("div");
				
				content.className = 'tab-panel-content-wrapper stretch';
				
				container.appendChild(tabButtonsPanel);
				contentSizeWrapper.appendChild(content);
				container.appendChild(contentSizeWrapper);
				
				var self = this;
				for (var idx in cfg.items) {
					var item = cfg.items[idx];
					var tabContent = item.content.getEl();
					
					var button = new iup.Button({
						text : item.title,
						className : "tab-button",
						style	: {
							height 	: cfg.buttonsPanelHeight + 'px'
						},
						handler : function () {
							self.discloseItem(this.itemIndex);
						}
					});
					button.getEl().itemIndex = idx;
					
					tabButtonsPanel.appendChild(button.getEl());
					content.appendChild(tabContent);
					tabContent.style.display = "none";
				}
				
				this._el = container;
				this.tabButtonsPanel = tabButtonsPanel;
				this.contentSizeWrapper = contentSizeWrapper;
				this.content = content;
			},
			doLayout : function(width, height) {
				iup.layout.TabPanel.superclass.doLayout.call(this, width, height);
				
				var contentHeight = height - this.cfg.buttonsPanelHeight;
				this.contentSizeWrapper.style.height = contentHeight + "px";
				this.contentSizeWrapper.style.width = width + "px";
				
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
					$(buttons[i]).removeClass("tab-button-selected");
				};
				$(buttons[idx]).addClass("tab-button-selected");
				
				var item = this.cfg.items[idx];
				if (typeof item.onDisclose === "function") {
					item.onDisclose(true);
				}
				
				this.disclosedItem = item;
				item.content.doLayout($(this.content).width(), $(this.content).height());
			}
			
		}
	});

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
