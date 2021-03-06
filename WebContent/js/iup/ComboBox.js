"use strict";
iup.utils.createComponent('iup.form.Combobox', iup.form.Field, function(){
	function ComboboxList(oCfg, input, button, fireChanged, parent) {
		var filterStr = '';
		var data = [];
		var itemIdx = -1;
		var oThis = this;
		var shown = false;
		var dataLoaded = false;
		
		var store = oCfg.store;
		
		var ul = document.createElement('ul');
		var scrollPanel = new iup.layout.ScrollPanel({
			scroll : iup.layout.ScrollPanel.SCROLL_BOTH,
			//className : 'combo-list',
			content : ul/*new iup.layout.Panel({
				content : ul
			})*/
		});
	//	var div = scrollPanel.getEl();
	//	div.style.position = 'absolute';
		
		var div = document.createElement('div');
		//var lastList = div;
		div.className = 'combo-list';
		$(div).attr('tabindex', '-1');
		
	//	var ul = document.createElement('ul');
		div.appendChild(scrollPanel.getEl());
		
		loadData();
		store.on('load', function() {
			loadData();
			parent.refresh();
			dataLoaded = true;
			scrollPanel.doLayout();
		});
		
		document.getElementsByTagName('body')[0].appendChild(div);
		scrollPanel.getEl().style.maxHeight = '300px';
		//scrollPanel.getEl().style.maxWidth = '300px';
		div.style.display = 'none';
		
		function loadData() {
			$(ul).empty();
			data.splice(0, data.length);
			
			if (!oCfg.required) {
				var item = {
					value : null,
					label : oCfg.nullValue
				};

				buildLi(item);
			}
			
			var records = store.getData();
			for (var idx = 0; idx < records.length; idx++) {
				var item = {
					value 	: typeof oCfg.valueField === 'function' ? oCfg.valueField(records[idx]) : records[idx].get(oCfg.valueField), 
					label 	: typeof oCfg.displayField === 'function' ? oCfg.displayField(records[idx]) : records[idx].get(oCfg.displayField),
					visible : true
				};

				buildLi(item);
			}
			
			if (filterStr) {
				doFilter();
			}
			
			function buildLi(item) {
				item.upper = item.label.toString().toUpperCase();
		    	data.push(item);
				
				var li = document.createElement('li');
				li.innerHTML = item.label || '&nbsp;';
				li.record = item;
				ul.appendChild(li);
			}
		}
		
		function doFilter() {
			var list = ul.children;
			for (var idx = 0; idx < list.length; idx++) {
				var li = list[idx];
				var item = li.record;
				var startsWith = item.upper.indexOf(filterStr) === 0;
				if (item.visible !== startsWith) {
					li.style.display = startsWith ? '' : 'none';
					item.visible = startsWith;
				}
			}
			select(-1);
		}
		
		function find(str) {
			var val = str.toUpperCase();
			
			for (var idx = 0; idx < data.length; idx ++) {
				var item = data[idx];
				if (item.upper === val) {
					return item;
				}
			}
			return null;
		}
		
		this.filter = function(str) {
			filterStr = str.toUpperCase();
			doFilter();
		};
		
		this.find = find;
		
		this.selectNext = function() {
			var list = ul.children;
			var ret = null;
			
			if (!shown) {
				oThis.filter('');
				oThis.show();
			} else {
				var nextIdx = itemIdx;
				
				for (var idx = itemIdx + 1; idx < data.length; idx++) {
					if (data[idx].visible) {
						nextIdx = idx;
						break;
					}
				}
				
				select(nextIdx);
			}
				
			if (itemIdx > -1) {
				ret = list[itemIdx].record;
			}
			
			return ret;
		};
		
		this.selectPrevious = function() {
			var list = ul.children;
			var ret = null;
			
			if (!shown) {
				oThis.filter('');
				oThis.show();
			} else {
				var prevIdx = itemIdx;
				for (var idx = itemIdx - 1; idx > -1; idx--) {
					if (data[idx].visible) {
						prevIdx = idx;
						break;
					}
				}
				
				select(prevIdx);
			}
			
			if (itemIdx > -1) {
				ret = list[itemIdx].record;
			}
			
			return ret;
		};
		
		this.setValue = function(val) {
			var list = ul.children;
			
			var activeItemIdx = -1;
			for (var idx = 0; idx < data.length; idx ++) {
				var item = data[idx];
				if (item.value === val) {
					activeItemIdx = idx;
					break;
				}
			}
			
			select(activeItemIdx);
			
			input.value = activeItemIdx > -1 ? data[activeItemIdx].label : oCfg.nullValue;
		};
		
		function select(idx) {
//			console.log('select');
			var list = ul.children;
			
			if (itemIdx > -1) {
				$(list[itemIdx]).removeClass('grid-selected-row'); 
			}
			itemIdx = idx;
			if (itemIdx > -1) {
				$(list[itemIdx]).addClass('grid-selected-row');
				var top = $(list[itemIdx]).position().top;
				$(div).scrollTop(top - ($(div).height()/2));
			} 
		}
		
		this.show = function() {
			if (oCfg.deferredLoad && !dataLoaded) {
				store.load();
				dataLoaded = true;
			}
			if (!shown) {
				div.style.zIndex = ++iup.popup.zIndex;
				
				var offset = $(input).offset();
				offset.top += $(input).outerHeight();
				$(div).css({
				    top: offset.top,
				    left: offset.left
				});
				
				var inputWidth = $(input).outerWidth();
				
				ul.style.minWidth = (inputWidth - 22) + 'px';
				div.style.minWidth = inputWidth + 'px';
				div.style.display = 'block';
				scrollPanel.getEl().style.maxWidth = Math.max(300, inputWidth) + 'px';
				shown = true;
				
				if (itemIdx > -1) {
					select(-1);
				}
				//console.log(offset, inputWidth);
				var upper = input.value.toUpperCase();
				for (var idx = 0; idx < data.length; idx ++) {
					var item = data[idx];
					if (item.upper === upper) {
						select(idx);
						break;
					}
				}
			}
			scrollPanel.doLayout();
			//scrollPanel.doLayout();
		};
		
		this.hide = function() {
			div.style.display = 'none';
			shown = false;
		};
		
		this.toggle = function() {
			if (shown) {
				this.hide();
			} else {
				this.show();
			}
		};
		
		$(div).on('click', function(evt) {
			if (evt.target.nodeName === 'LI') {
				var li = evt.target;
				fireChanged(li.record);
//				em.fireEvent("changed", oCfg.parser(li.record.value, parent.getField().get()), parent.getField().getOriginalValue(), true);
				input.value = li.record.label;
				oThis.hide();
				//valueSelected = true;
			}
		});
		
		this.getEl = function() {
			return div;
		};
		
		var focusLost = true;
		
		input.onblur = function(evt) {
			focusLost = true;
			setTimeout(function() {
				if (focusLost) {
					oThis.hide();
				}
			}, 1);
		};
		
		$(div).on('focus', function(evt) {
			focusLost = false;
		});
		
		$(div).on('blur', function(evt) {
			focusLost = true;
			setTimeout(function() {
				if (focusLost) {
					oThis.hide();
				}
			}, 1);
		});
		
		$(input).on('focus', function(evt) {
			focusLost = false;
		});
		
		$(button).on('focus', function(evt) {
			focusLost = false;
		});
	}
	
	
	return {
		statics : {
			type : 'combobox'
		},
		defaults : {
			valueField 	: undefined,
			displayField: undefined,
			store 		: undefined,
			nullValue 	: '',
			deferredLoad: false
		},
		prototype : {
			_updateEl : function(el, val) {
				this._state.list.setValue(val);
		//		this._textHolder.innerHTML = val;
			},
			_buildEl : function(oCfg) {
				var lastChanged = '';
				var wrapper = document.createElement("div");
				var self = this;
				wrapper.style.position = 'relative'; 
				
				if (oCfg.width) {
					wrapper.style.width = oCfg.width + "px";
				}
				
				var input = document.createElement("input");
				input.name = oCfg.name;
				input.className = "form-field";	
				input.style.width = '100%';
				input.style.paddingRight = '20px';
				
				var button = document.createElement('div');
				$(button).attr('tabindex', '-1');
				button.className = 'combo-button';
				
				button.innerHTML = '<span class="glyphicon glyphicon-menu-down" aria-hidden="true"></span>';/*
				'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' + 
					'<title>Close</title>' +
					'<path fill="#555" d="M5,20L15,20L50,60L85,20L95,20L95,30L50,80L5,30z"/>' +
				'</svg>';//*/
				
				wrapper.appendChild(input);
				wrapper.appendChild(button);
				
				var list = new ComboboxList(oCfg, input, button, fireChanged, self);
				
				button.onclick = function() {
					list.filter('');
					list.toggle();
					$(input).focus();
				};
				
				input.onchange = function() {
//					console.log(change);
					//setTimeout(function(){
						//if (!valueSelected) {
							var item = list.find(input.value);
							if (item === null) {
								input.value = oCfg.nullValue;
							} else {
								input.value = item.label;  
							}
							fireChanged(item);
					//	}
					//},1);
				};
				
				var lastVal = '';
				var lastModification = '';
				var keyUp = true;
				
				input.onkeydown = function(evt){
					if (keyUp) {
						lastVal = input.value;
						keyUp = false;
					}
					
					if (input.getAttribute('readonly') !== 'readonly') {	
						if (evt.keyCode === 38) {
							var item = list.selectPrevious();
							input.value =  item ? item.label : lastModification;
							lastVal = input.value;
						//	fireChanged(item);
						} else if (evt.keyCode === 40) {
							var item = list.selectNext();
							input.value =  item ? item.label : lastModification;
							lastVal = input.value;
						//	fireChanged(item);
						} else if (evt.keyCode === 13) {
							list.hide();
							lastModification = input.value;
							fireChanged(list.find(input.value));
						}
					}
				};
				
				input.onkeyup = function(evt) {
					keyUp = true;
					var charKey = input.value !== lastVal;
		//			console.log(input.value + ' : ' + lastVal);
					if (charKey) {
						lastModification = input.value;
					//	valueSelected = false;

						setTimeout(function(){ 
							list.filter(lastModification);
							list.show();
						},1);
					}
				};
					
				this.events.on("changed", function(val, originalValue, bSilent) {
		//			console.log('changed %o to %o', originalValue, val);
					self.getField().set(val, bSilent);
					self.validate();
				});
				
//				if (oCfg.readOnly) {
//					input.disabled = "disabled";
//					button.style.display = 'none';
//				}
				//console.log(self);
				//list.setValue(self.getField().get());
				
				this._el = wrapper;
				this._state = {
					list : list,
					button : button
				};
				return wrapper;
				
				function fireChanged(item) {
					var val = item ? item.value : null;
					if (lastChanged != val) {
						var parsedVal = typeof oCfg.parser === 'function' ? oCfg.parser(val, self.getField().get()) : val;
						self.events.fireEvent("changed", parsedVal, self.getField().getOriginalValue(), true);
						lastChanged = val;
					}
				}
			},
			_setValid : function(isValid) {
				if (isValid) {
					$(this._getInput()).removeClass("invalid");
				} else {
					$(this._getInput()).addClass("invalid");
				}
			},
			disable : function() {
				this.constructor.superclass.disable.call(this);
				//this._getInput().disabled = "disabled";
				this._state.button.style.display = 'none';
				//$(this._getInput()).addClass("disabled");
			},
			enable : function() {
				this.constructor.superclass.enable.call(this);
				//this._getInput().disabled = "";
				this._state.button.style.display = 'block';
				//$(this._getInput()).removeClass("disabled");
			}
			
		}
	};
	
}());