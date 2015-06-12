iup.utils.createComponent('iup.form.Combobox', iup.form.Field, function(){
	function ComboboxList(oCfg, input, button, fireChanged) {
		var filterStr = '';
		var data = [];
		var itemIdx = -1;
		var oThis = this;
		var shown = false;
		
		var store = oCfg.store
		
		var div = document.createElement('div');
		lastList = div;
		div.className = 'combo-list';
		$(div).attr('tabindex', '-1');
		
		var ul = document.createElement('ul');
		div.appendChild(ul);
		
		loadData();
		store.on('load', loadData);
		
		document.getElementsByTagName('body')[0].appendChild(div);
		div.style.maxHeight = '300px';
		div.style.display = 'none';
		
		function loadData() {
			$(ul).empty();
			data.splice(0, data.length);
			
			if (!oCfg.required) {
				var item = {
					value : null,
					label : oCfg.nullValue
				};
				item.upper = item.label.toString().toUpperCase();
		    	data.push(item);
				
				var li = document.createElement('li');
				li.innerHTML = item.label || '&nbsp;';
				li.record = item;
				ul.appendChild(li);
			}
			
			var records = store.getData();
			for (var idx = 0; idx < records.length; idx++) {
				var item = {
					value 	: typeof oCfg.valueField === 'function' ? oCfg.valueField(records[idx]) : records[idx].get(oCfg.valueField), 
					label 	: typeof oCfg.displayField === 'function' ? oCfg.displayField(records[idx]) : records[idx].get(oCfg.displayField),
					visible : true
				};

				item.upper = item.label.toString().toUpperCase();
		    	data.push(item);
				
				var li = document.createElement('li');
				li.innerHTML = item.label;
				li.record = item;
				ul.appendChild(li);
			}
			if (filterStr) {
				doFilter();
			}
		};
		
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
		
		this.filter = function(str) {
			filterStr = str.toUpperCase();
			doFilter();
		};
		
		this.find = function(str) {
			var val = str.toUpperCase();
			
			for (var idx = 0; idx < data.length; idx ++) {
				var item = data[idx];
				if (item.upper === val) {
					return item;
				}
			}
			return null;
		};
		
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
		}
		
		$(div).on('click', function(evt) {
			if (evt.target.nodeName === 'LI') {
				var li = evt.target;
				fireChanged(li.record);
//				em.fireEvent("changed", oCfg.parser(li.record.value, parent.getField().get()), parent.getField().getOriginalValue(), true);
				input.value = li.record.label;
				oThis.hide();
				valueSelected = true;
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
			nullValue 	: ''
		},
		prototype : {
			_updateEl : function(el, val) {
				this._state.list.setValue(val);
			},
			_buildEl : function(oCfg) {
				var wrapper = document.createElement("div");
				var self = this;
				wrapper.style.position = 'relative'; 
				
				if (oCfg.width) {
					wrapper.style.width = oCfg.width + "px";
				}
				
				input = document.createElement("input");
				input.name = oCfg.name;
				input.className = "form-field";	
				input.style.width = '100%';
				input.style.paddingRight = '20px';
				
				button = document.createElement('div');
				$(button).attr('tabindex', '-1');
				button.className = 'combo-button';
				
				wrapper.appendChild(input);
				wrapper.appendChild(button);
				
				var list = new ComboboxList(oCfg, input, button, fireChanged);
				
				button.onclick = function() {
					list.filter('');
					list.toggle();
					$(input).focus();
				};
				
				input.onchange = function() {
					setTimeout(function(){
						if (!valueSelected) {
							var item = list.find(input.value);
							if (item === null) {
								input.value = oCfg.nullValue;
							} else {
								input.value = item.label;  
							}
							fireChanged(item);
						}
					},1);
				};
				
				var lastVal = '';
				var lastModification = '';
				var keyUp = true;
				
				input.onkeydown = function(evt){
		//			console.log(evt);
					if (keyUp) {
						lastVal = input.value;
						keyUp = false;
					}
					
					if (evt.keyCode === 38) {
						var item = list.selectPrevious();
						input.value =  item ? item.label : lastModification;
						lastVal = input.value;
						fireChanged(item);
					} else if (evt.keyCode === 40) {
						var item = list.selectNext();
						input.value =  item ? item.label : lastModification;
						lastVal = input.value;
						fireChanged(item);
					} else if (evt.keyCode === 13) {
						list.hide();
						lastModification = input.value;
					}
				};
				
				input.onkeyup = function(evt) {
					keyUp = true;
					var charKey = input.value !== lastVal;
		//			console.log(input.value + ' : ' + lastVal);
					if (charKey) {
						lastModification = input.value;
						valueSelected = false;

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
				
				if (oCfg.readOnly) {
					input.disabled = "disabled";
					button.style.display = 'none';
				}
				//console.log(self);
				//list.setValue(self.getField().get());
				
				this._el = wrapper;
				this._state = {
					list : list
				};
				return wrapper;
				
				function fireChanged(item) {
					var val = item ? item.value : null;
					var parsedVal = typeof oCfg.parser === 'function' ? oCfg.parser(val, self.getField().get()) : val;
					self.events.fireEvent("changed", parsedVal, self.getField().getOriginalValue(), true);
				}
			},
			_setValid : function(isValid) {
				if (isValid) {
					$(input).removeClass("invalid");
				} else {
					$(input).addClass("invalid");
				}
			},
			disable : function() {
				input.disabled = "disabled";
				button.style.display = 'none';
			},
			enable : function() {
				input.disabled = "";
				button.style.display = 'block';
			}
			
		}
	}
	
}())