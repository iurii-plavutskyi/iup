if(typeof iup == "undefined") {
	iup = {};
}

if(typeof iup.form == "undefined") {
	iup.form = {};
}

iup.utils.createComponent('iup.form.Label', iup.layout.Element, {
	defaults : {
		text : ''
	},
	prototype : {
		_buildEl : function(cfg) {
			var span = document.createElement("span");
			span.innerHTML = cfg.text;
			this._el = span;
		},
		setText : function(text) {
			span.innerHTML = text;
		}
	}
})

iup.utils.createComponent('iup.form.Field', iup.layout.Element, {	
	//var cfg = {	// [{label:String, required:boolean, name : String, validator : function(val){}, renderer : function(val){}, parser : function(val){}}..]
	defaults : {
		label	: '',
		name 		: undefined,
		readOnly	: false,
		field		: undefined,
		required 	: false,
		width 		: undefined,// || 200;
		regex		: undefined,
		placeholder : undefined,
	//	var style		= oCfg.style;
	//	var className	= oCfg.className;
		//autocomplete: oCfg.autocomplete, // {store:iup.Store(), fieldName : field}
		renderer	: function(val) {
			return (typeof val == "undefined" || val == null) ? "" : val;
		},
		parser	: function(val) {
			return val;
		},
		validator : function(val) {
			return true;
		}
	}, 
	events : ["changed"],
	prototype : {
		_buildEl : function(cfg) {
			var self = this;
			//this.field = cfg.field || new iup.Field(cfg.name, cfg.value);
			
			var ret = document.createElement("input");
			ret.type = 'text';
			ret.className = "form-field";	
			ret.style.width = cfg.width ? cfg.width + "px" : '100%';
			
			if (cfg.readOnly) {
				ret.disabled = "disabled";
			}
			
			this.events.on("changed", function(val, originalValue, bSilent) {
				self.field.set(val, bSilent);
				self.validate();
			});
			
			ret.onchange = function() {
				self.events.fireEvent("changed", cfg.parser(ret.value, self.field.get()), self.field.getOriginalValue(), true);
			};
			
			if (cfg.placeholder) {
				ret.placeholder = cfg.placeholder;
			}
			
			/*if (cfg.autocomplete) {
				var data = [];
				
				function fillData(aData) {
					for (var idx in aData) {
						var val = aData[idx].get(cfg.autocomplete.fieldName);
						if (val && val != null) {
							data.push({ value: val, data: '' });
						}
					}
				}
				
				fillData(cfg.autocomplete.store.getData());
				$(ret).autocomplete({
					lookup : data,
					onSelect: function (suggestion) {
						em.fireEvent("changed", parser(suggestion.value, field.get()), field.getOriginalValue(), true);
					}
				});

				cfg.autocomplete.store.on("load", function(aData) {
					data.splice(0, data.length);
					fillData(aData);
					$(ret).autocomplete("option", { source: data });
					
				});
				
			}*/
			
			this._el = ret;
			return ret; 
		},
		getField : function() {
			return this.field;
		},
		_updateEl :  function(el, val) {
			el.value = val;
		},
		setValue : function(val, bSilent) {
			this._updateEl(this._getInput(), this.cfg.renderer(val));
			this.events.fireEvent("changed", val, this.field.getOriginalValue(), bSilent);
		},
		validate : function() {
			var isValid = this.isValid();
			this._setValid(isValid);
			return isValid;
		},
		_setValid : function(isValid) {
			if (isValid) {
				$(this._getInput()).removeClass("invalid");
			} else {
				$(this._getInput()).addClass("invalid");
			}
		},
		setField : function(oField) {
			this.field = oField || new iup.data.Field(name);
			this._updateEl(this._getInput(), renderer(this.field.get()));
		},
		enable : function() {
			this._getInput().disabled = "";
			$(this._getInput()).addClass("disabled");
		},
		disable : function() {
			this._getInput().disabled = "disabled";
			$(this._getInput()).addClass("disabled");
		},
		clearInvalid : function() {
			$(this._getInput()).removeClass("invalid");
		},
		getName : function() {
			return this.cfg.name;
		},
		isRequired : function() {
			return this.cfg.required;
		},
		isReadOnly : function() {
			return this.cfg.readOnly;
		},
		getLabel : function() {
			return this.cfg.label;
		},
		isValid : function() {
			var val = this.field.get();
			if (this.cfg.required && (typeof val == "undefined" || val == null || val.length == 0) ) {
				return false;
			}
			
			var rawVal = this._getRawValue();
			if (this.cfg.regex && rawVal && !this.cfg.regex.test(rawVal)) {
				return false;
			}
			
			return this.cfg.validator(val, this._getRawValue());
		},
		_getRawValue : function() {
			return this.getEl().value;
		},
		setWidth : function(width) {
			if (width > 0) {
				this.getEl().style.width = width + 'px';
			}
		},
		_getInput : function() {
			if (this.getEl().tagName === 'INPUT') {
				return this.getEl();
			} 
			return $(this.getEl()).find('INPUT')[0];
		}
		
	},
	_init : function () {
		this.field = this.cfg.field || new iup.data.Field(this.cfg.name, this.cfg.value);
		this._updateEl(this._getInput(), this.cfg.renderer(this.field.get()));
	}
});



/*iup.form.Field = function(oCfg) {	
	//var cfg = {	// [{label:String, required:boolean, name : String, validator : function(val){}, renderer : function(val){}, parser : function(val){}}..]
	var oThis = this;
	
	var label	= oCfg.label;
	var name 		= oCfg.name;
	var readOnly	= oCfg.readOnly;
	var field		= oCfg.field || new iup.Field(oCfg.name, oCfg.value);
	var required 	= oCfg.required;
	var width 		= oCfg.width;// || 200;
	var	regex		= oCfg.regex;
	var placeholder = oCfg.placeholder;
//	var style		= oCfg.style;
//	var className	= oCfg.className;
	var autocomplete= oCfg.autocomplete; // {store:iup.Store(), fieldName : field}
	var renderer	= oCfg.renderer || function(val) {
		return (typeof val == "undefined" || val == null) ? "" : val;
	};
	var parser	= oCfg.parser || function(val) {
		return val;
	};
	var validator = oCfg.validator || function(val) {
		return true;
	};
	
	this._eventManager = new iup.EventManager({events : ["changed"]});
	
	this.getField = function() {
		return field;
	};
	
	this._updateEl = this._updateEl || function(el, val) {
		el.value = val;
	};
	
	this._buildEl = this._buildEl || function() {
		var em = this._eventManager;
		
		var ret = document.createElement("input");
		ret.type = 'text';
		ret.className = "form-field";	
		ret.style.width = width ? width + "px" : '100%';
		this._updateEl(ret, renderer(field.get()));
		
		if (readOnly) {
			ret.disabled = "disabled";
		}
		em.addHandler("changed", function(val, originalValue, bSilent) {
			field.set(val, bSilent);
			oThis.validate();
		});
		
		ret.onchange = function() {
			em.fireEvent("changed", parser(ret.value, field.get()), field.getOriginalValue(), true);
		};
		
		if (placeholder) {
			ret.placeholder = placeholder;
		}
		
		if (autocomplete) {
			var data = [];
			
			function fillData(aData) {
				for (var idx in aData) {
					var val = aData[idx].get(autocomplete.fieldName);
					if (val && val != null) {
						data.push({ value: val, data: '' });
					}
				}
			}
			
			fillData(autocomplete.store.getData());
			$(ret).autocomplete({
		    	lookup : data,
		    	onSelect: function (suggestion) {
			        em.fireEvent("changed", parser(suggestion.value, field.get()), field.getOriginalValue(), true);
			    }
			});

			autocomplete.store.on("load", function(aData) {
				data.splice(0, data.length);
				fillData(aData);
				$(ret).autocomplete("option", { source: data });
				
			});
			
		}
		
		return ret; 
	};
	
//	var input = this._buildEl();
	
//	if (style) {
//		iup.appendStyle(this.getEl(), style);
//	};
	
	iup.form.Field.superclass.constructor.call(this, oCfg);  
	
//	if (className) {
//		$(input).addClass(className);
//	};
	
	this.setValue = function(val, bSilent) {
		this._updateEl(this.getEl(), renderer(val));
		this._eventManager.fireEvent("changed", val, field.getOriginalValue(), bSilent);
	};
	
	this.validate = function() {
		var isValid = oThis.isValid();
		this._setValid(isValid);
		return isValid;
	};
	
	this._setValid = function(isValid) {
		if (isValid) {
			$(this.getEl()).removeClass("invalid");
		} else {
			$(this.getEl()).addClass("invalid");
		}
	};
	
	this.setField = function(oField) {
		field = oField || new iup.data.Field(name);
		this._updateEl(this.getEl(), renderer(field.get()));
	};
	
	this.enable = function() {
		this.getEl().disabled = "";
	};
	
	this.disable = function() {
		this.getEl().disabled = "disabled";
	};
	
	this.clearInvalid = function() {
		$(this.getEl()).removeClass("invalid");
	};
	
//	this.get = function() {
//		return input;
//	};
	
//	this.getEl = function() {
//		return input;
//	};
	
	this.getName = function() {
		return name;
	};
	
	this.isRequired = function() {
		return required;
	};
	
	this.isReadOnly = function() {
		return readOnly;
	};
	
	this.getLabel = function() {
		return label;
	};
	
	this.isValid = function() {
		var val = field.get();
		if (required && (typeof val == "undefined" || val == null || val.length == 0) ) {
			return false;
		}
		
		var rawVal = this._getRawValue();
		if (regex && rawVal && !regex.test(rawVal)) {
			return false;
		}
		
		return validator(val, this._getRawValue());
	};
	
	this._getRawValue = function() {
		return this.getEl().value;
	};
	
	this.setWidth = function(width) {
		if (width > 0) {
			this.getEl().style.width = width + 'px';
		}
	};
	
	this.on = function(eventName, handler) {
		this._eventManager.addHandler(eventName, handler);// function (eventName, handler) {}
	};
};


extend(iup.form.Field, iup.layout.Element);
*/


iup.utils.createComponent('iup.form.NumberField', iup.form.Field, {  
	defaults : {
		regex : /^[-]?\d*$/,
		parser : function(val, fieldValue) {
			var intValue = parseInt(val, 10);
			if (isNaN(intValue)) {
				intValue = null;
			}
			return intValue;
			/*if (parser) {
				return parser(intValue, fieldValue);
			} else {
				return intValue;
			}*/
		}
	}
})

iup.utils.createComponent('iup.form.Spinbox', iup.form.NumberField, { 
	prototype : {
		_buildEl : function(oCfg) {
			var self = this;
			
			var wrapper = document.createElement('div');
			wrapper.style.position = 'relative';
			wrapper.style.width = oCfg.width ? oCfg.width + "px" : '100%';
			
			var input = document.createElement("input");
			input.type = 'text';
			input.className = "form-field spin-box";	
			
			if (oCfg.readOnly) {
				input.disabled = "disabled";
			}
			self.events.on("changed", function(val, originalValue, bSilent) {
				self.getField().set(val, bSilent);
				self.validate();
			});
			
			input.onchange = function() {
				var intVal = parseInt(input.value);
				if (isNaN(intVal)) {
					intVal = 0;
					input.value = 0;
				}
				if (typeof oCfg.maxVal !== 'undefined' && intVal > oCfg.maxVal) {
					input.value = oCfg.maxVal;
				} else if (typeof oCfg.minVal !== 'undefined' && intVal < oCfg.minVal){
					input.value = oCfg.minVal;
				}
				self.events.fireEvent("changed", oCfg.parser(input.value, self.getField().get()), self.getField().getOriginalValue(), true);
			};
			
			wrapper.appendChild(input);
			
			var buttonsDiv = document.createElement('div');
			buttonsDiv.className = 'number-spin';
			var s = buttonsDiv.style;
			
			var inc = document.createElement('div');
			inc.className = 'number-inc';
			buttonsDiv.appendChild(inc);
			
			var dec = document.createElement('div');
			dec.className = 'number-dec';
			buttonsDiv.appendChild(dec);
			
			inc.onclick = function() {
				var val = input.value;
				if (val) {
					var currentVal = parseInt(input.value);
					if (typeof oCfg.maxVal === 'undefined' || currentVal + 1 <= oCfg.maxVal) {
						val =currentVal + 1;
					}
				} else {
					val = oCfg.minVal || 0;
				}
				val = oCfg.parser(val, self.getField().get());
				
				input.value = typeof oCfg.renderer === 'function' ? oCfg.renderer(val) : val;
				self.events.fireEvent("changed", val, self.getField().getOriginalValue(), true);
			};
				
			dec.onclick = function() {
				var val = input.value;
				if (val) {
					var currentVal = parseInt(val);
					if (typeof oCfg.minVal === 'undefined' || currentVal - 1 >= oCfg.minVal) {
						val = currentVal - 1;
					}
				} else  {
					val = oCfg.maxVal || 0;
				}
				
				val = oCfg.parser(val, self.getField().get());
				input.value = typeof oCfg.renderer === 'function' ? oCfg.renderer(val) : val; 
				self.events.fireEvent("changed", val, self.getField().getOriginalValue(), true);
			};
			
			wrapper.appendChild(buttonsDiv);
			this._el = wrapper;
			return wrapper; 
		}
	}
});

/*
iup.form.TextArea = function(oCfg)  {  
	this._updateEl = function(el, val) {
		el.value = val;
	};
	var cfg = {
		parser		: oCfg.parser || function(val) {return val;}
	};
	
	this._buildEl = function() {
		var em = this._eventManager;
		var oThis = this;
		
		var input = document.createElement("textarea");
		input.style.width = oCfg.width ? oCfg.width + "px" : '100%';
		input.style.height = oCfg.height + "px";
		input.className = "form-field"; 
		
		if (oCfg.readOnly) {
			input.disabled = "disabled";
		}
		
		em.addHandler("changed", function(val, originalValue, bSilent) {
			oThis.getField().set(val, bSilent);
			oThis.validate();
		});
		
		
		input.onchange = function() {
			var val = input.value;
			em.fireEvent("changed", val == null ? null : cfg.parser(val), oThis.getField().getOriginalValue(), true);
		};
		
		return input;
	};
	
	iup.form.TextArea.superclass.constructor.call(this, oCfg);  
};

extend(iup.form.TextArea, iup.form.Field);

iup.form.CheckboxField = function(oCfg)  {  
	this._updateEl = function(el, val) {
		if (val) {
			el.checkbox.checked = "checked";
		} else {
			el.checkbox.checked = "";
		}
	};
	this._buildEl = function() {
		var em = this._eventManager;
		var oThis = this;
		
		var ret = document.createElement("input");
		ret.type = 'checkbox';
		ret.className = "form-field";	
		
		if (oCfg.field) {
			this._updateEl(oCfg.field.get());
		}
		
		if (oCfg.readOnly) {
			ret.disabled = "disabled";
		}
		
		em.addHandler("changed", function(val, originalValue, bSilent) {
			oThis.getField().set(val, bSilent);
		});
		
		
		ret.onchange = function() {
			var val = ret.checked;
			em.fireEvent("changed", val, oThis.getField().getOriginalValue(), true);
		};
		
		var wrapper = document.createElement("div");
		wrapper.appendChild(ret);
		var text = document.createElement("span");
		text.style.marginLeft = "10px";
		text.innerHTML = oCfg.text || "";
		wrapper.appendChild(text);
		wrapper.checkbox = ret;
		return wrapper;//ret; 
	};
	
	iup.form.CheckboxField.superclass.constructor.call(this, oCfg);  
	
	this._getRawValue = function() {
		return this.getEl().checkbox.checked == "checked";
	};
	
	this.enable = function() {
		this.getEl().checkbox.disabled = "";
	};
	
	this.disable = function() {
		this.getEl().checkbox.disabled = "disabled";
	};
};
extend(iup.form.CheckboxField, iup.form.Field);

iup.form.CheckboxField.prototype.updateEl = function(el, val) {
	el.value = val;
};

iup.form.Combobox = function(oCfg) {
	var oThis = this;
	var valueField = oCfg.valueField;
	var displayField = oCfg.displayField;
	var store = oCfg.store;
	var nullValue = oCfg.nullValue || '';
	
	var valueSelected = true;
	
	var input;
	
	var button;
	
	var list;
	
	this._updateEl = function(el, val) {
//		val = val;// || '';
		list.setValue(val);
	},
	
	this._buildEl = function() {
		var em = this._eventManager;
		
		var wrapper = document.createElement("div");
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
		
		list = new ComboboxList(input, button, store, em);
		
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
						input.value = nullValue;
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
			
		em.addHandler("changed", function(val, originalValue, bSilent) {
//			console.log('changed %o to %o', originalValue, val);
			oThis.getField().set(val, bSilent);
			oThis.validate();
		});
		
		if (oCfg.readOnly) {
			input.disabled = "disabled";
			button.style.display = 'none';
		}
		
		list.setValue(oThis.getField().get());
		
		return wrapper;
	};
	
	iup.form.Combobox.superclass.constructor.call(this, oCfg);  
	
	this._setValid = function(isValid) {
		if (isValid) {
			$(input).removeClass("invalid");
		} else {
			$(input).addClass("invalid");
		}
	};
	
	this.disable = function() {
		input.disabled = "disabled";
		button.style.display = 'none';
	};
	
	this.enable = function() {
		input.disabled = "";
		button.style.display = 'block';
	};
	
	function fireChanged(item) {
		var val = item ? item.value : null;
		var parsedVal = typeof oCfg.parser === 'function' ? oCfg.parser(val, oThis.getField().get()) : val;
		oThis._eventManager.fireEvent("changed", parsedVal, oThis.getField().getOriginalValue(), true);
	}
	
	function ComboboxList(input, button, store, em) {
		var filterStr = '';
		var data = [];
		var itemIdx = -1;
		var oThis = this;
		var shown = false;
		
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
					label : nullValue
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
					value 	: typeof valueField === 'function' ? valueField(records[idx]) : records[idx].get(valueField), 
					label 	: typeof displayField === 'function' ? displayField(records[idx]) : records[idx].get(displayField),
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
			
			input.value = activeItemIdx > -1 ? data[activeItemIdx].label : nullValue;
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
				div.style.zIndex = ++iup.zIndex;
				
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
		
//		var inputFocused = false;
//		var listFocused = false;
		
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
};

extend(iup.form.Combobox, iup.form.Field);

iup.form.ButtonField = function(oCfg) {
	var cfg = {
		buttons : oCfg.buttons || []		// [{icon : "url", handler : function(){} }]
		
	};
	
	var oThis = this;
	
	var input;
	var buttonsPanel;
	var buttons = [];
	
	this._updateEl = function(el, val) {
		input.value = val || '';
	};
	
	this._buildEl = function() {
		var em = this._eventManager;
		
		var wrapper = document.createElement('div');
		wrapper.style.position = 'relative'; 
		
		if (oCfg.width) {
			wrapper.style.width = oCfg.width + 'px';
		}
		
		input = document.createElement('input');
		input.name = oCfg.name;
		input.className = 'form-field';	
		input.style.width = '100%';
		input.setAttribute('readonly', 'readonly');
		
		buttonsPanel = document.createElement('div');
		buttonsPanel.style.position = 'absolute';
		buttonsPanel.style.right = '1px';
		buttonsPanel.style.top = '1px';
		
		var buttonsWidth = 0;
		for (var idx = 0; idx < cfg.buttons.length; idx++) {
			var buttonCfg = cfg.buttons[idx];
			
			var button = document.createElement('div');
			$(button).attr('tabindex', '-1');
			button.className = 'field-button ';
			button.style.backgroundImage = 'url(' + buttonCfg.icon + ')';
			button.onclick = buttonCfg.handler;
			
			buttons.push(button);
			buttonsPanel.appendChild(button);
			
			buttonsWidth += buttonCfg.width || 20;
		}
		input.style.paddingRight = buttonsWidth + 'px';
		
		wrapper.appendChild(input);
		wrapper.appendChild(buttonsPanel);
		
		input.onchange = function() {
			var val = input.value;
			var parsedVal = typeof oCfg.parser === 'function' ? oCfg.parser(val, oThis.getField().get()) : val;
			oThis._eventManager.fireEvent("changed", parsedVal, oThis.getField().getOriginalValue(), true);
		};
		
		em.addHandler("changed", function(val, originalValue, bSilent) {
			oThis.getField().set(val, bSilent);
			oThis.validate();
		});
		
		if (oCfg.readOnly) {
			oThis.disable();
		}
		
		this._updateEl(oThis.getField().get());
		
		return wrapper;
	};
	
	iup.form.ButtonField.superclass.constructor.call(this, oCfg);  
	
	this._setValid = function(isValid) {
		if (isValid) {
			$(input).removeClass("invalid");
		} else {
			$(input).addClass("invalid");
		}
	};
	
	this.disable = function() {
		input.disabled = "disabled";
		buttonsPanel.style.display = 'none';
	};
	
	this.enable = function() {
		input.disabled = "";
		buttonsPanel.style.display = 'block';
	};
};

extend(iup.form.ButtonField, iup.form.Field);

//iup.form.Combobox = function(oCfg) {
//	var valueField = oCfg.valueField;
//	var displayField = oCfg.displayField;
//	var store = oCfg.store;
//	var nullValue = oCfg.nullValue;
//	
//	var renderer = oCfg.renderer;
//	oCfg.renderer = function(val) {
//		return (typeof val == "undefined") 
//				? "" 
//				: (typeof renderer == "function" ? renderer(val) : val);
//	}; 
//	var parser = oCfg.parser;
//	oCfg.parser = function(val, field) {
//		return (val == "" )
//				? undefined 
//				: (typeof parser == "function" ? parser(val, field) : val);
//	};
//	
//	this._updateEl = function(el, val) {
//		if ( typeof val == "udefined" || val == null) {
//			el.value = "";	
//		} else {
//			var data = store.getData();
//			var found = false;
//			for (var idx in data) {
//				if (data[idx].get(valueField) === val) {
//					found = true;
//					break;
//				}
//			}
//			if (found) {
//				el.value = val;
//			} else {
//				el.value = "";
//			}
//		}
//	},
//	
//	this._buildEl = function() {
//		var em = this._eventManager;
//		var oThis = this;
//		
//		var input = document.createElement("select");
//		input.name = oCfg.name;
//		input.className = "form-field";	
//		input.style.width = oCfg.width ? oCfg.width + "px" : '100%';
//		
//		if (oCfg.readOnly) {
//			input.disabled = "disabled";
//		}
//		
//		var option = document.createElement("option");
//		option.value = "";
//		option.innerHTML = nullValue || "&nbsp;";
//		if (oCfg.required && !nullValue) {
//			option.style.display = "none";
//		}
//		
//		input.appendChild(option);
//		input.value = "";
//		
//		var aRecords = store.getData();
//		appendOptions(input, aRecords);
//		em.addHandler("changed", function(val, originalValue, bSilent) {
//			oThis.getField().set(val, bSilent);
//		});
//		
//		input.onchange = function() {
//			em.fireEvent("changed", oCfg.parser(input.value, oThis.getField().get()), oThis.getField().getOriginalValue(), true);
//		};
//		
//		oCfg.store.on ("load", function(aData) {
//			appendOptions(input, aData);
//		});
//		
//		return input;
//	};
//	
//	function appendOptions(select, aRecords) {
//		for(var idx in aRecords) {
//			var record = aRecords[idx];
//			
//			var option = document.createElement("option");
//			var val = typeof valueField == "function" ? valueField(record) : record.get(valueField);
//			option.value = val;
//			var text = typeof displayField == "function" ? displayField(record) : record.get(displayField);
//			option.innerHTML = text;
//			
//			select.appendChild(option);
//		}
//	}
//	
//	iup.form.Combobox.superclass.constructor.call(this, oCfg);  
//};



iup.form.SelectMany = function(oCfg) {
	var store = oCfg.store;
	var areEqual = oCfg.areEqual;
	var converter = oCfg.converter;
	var displayField = oCfg.displayField;
	var oThis = this;
	var columnWidth = (oCfg.width - 30) / 2;
	
	this._updateEl = function(el, val) {
		
	};
	this._buildEl = function() {
		var em = this._eventManager;
		
		var table = document.createElement("table");
		table.style.width = oCfg.width + "px;";
		var tableBody = document.createElement("tbody");
		table.appendChild(tableBody);
		var tr = document.createElement("tr");
		tableBody.appendChild(tr);
		
		var availableItemsTd = document.createElement("td");
		tr.appendChild(availableItemsTd);
		var buttonsPanel = document.createElement("td");
		tr.appendChild(buttonsPanel);
		var selectedItemsTd = document.createElement("td");
		tr.appendChild(selectedItemsTd);
		
		addButtons(buttonsPanel);
		
		var availableItems = createTable();
		availableItemsTd.appendChild(availableItems);
		var selectedItems = createTable();
		selectedItemsTd.appendChild(selectedItems);
		
		updateTables(availableItems.body, selectedItems.body);
		
		store.on("load", function() {
			updateTables(availableItems.body, selectedItems.body);
		});

		return table;
	};
	
	function addButtons(td) {
		var selectAll = createButton(">>");
		var selectMarked = createButton(">");
		var removeMarked = createButton("<");
		var removeAll = createButton("<<");
		
		td.style.verticalAlign = "middle";
		
		var table = document.createElement("table");
		td.appendChild(table);
		
		var body = document.createElement("tbody");
		table.appendChild(body);
		body.appendChild(selectAll);
		body.appendChild(selectMarked);
		body.appendChild(removeMarked);
		body.appendChild(removeAll);
	}
	
	function createButton(html) {
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		tr.appendChild(td);
		
		var button = document.createElement("button");
		button.style.width = "25px";
		button.innerHTML = html;
		
		td.appendChild(button);
		return tr;
	}
	
	function createTable() {
		var wrapper = document.createElement("div");
		with (wrapper.style) {
			height = oCfg.height + "px";
			border = "1px solid #9cf";
			width = columnWidth + "px";
			overflow = "auto";
		}
		var table = document.createElement("table");
		wrapper.appendChild(table);
		
		var body = document.createElement("tbody");
		table.appendChild(body);
		wrapper.body = body;
		return wrapper;
	}
	
	function updateTables(availableItemsTable, selectedItemsTable) {
		availableItemsTable.innerHTML = "";
		selectedItemsTable.innerHTML = "";
		var itemsWidth = columnWidth - 17;
		var aRecords = store.getData();
		var selectedRecords = [];
		for (var i in aRecords) {
			var selected = false;
			var record = aRecords[i];
			for (var j in selectedRecords) {
				if (areEqual(record, selectedRecords[j])) {
					selected = true;
					break;
				}
			}
			
			var tr = createTr(record, itemsWidth);
			if (selected) {
				selectedItemsTable.appendChild(tr);
			} else {
				availableItemsTable.appendChild(tr);
			}
		}
	}
	
	function createTr(record, width) {
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		tr.appendChild(td);
		var div = document.createElement("td");
		td.appendChild(div);
		div.style.width = width + "px";
		div.style.overflow = "hidden";
		var text = typeof displayField == "function" ? displayField(record) : record.get(displayField);
		div.innerHTML = text;
		return tr;
	}
	
	iup.form.SelectMany.superclass.constructor.call(this, oCfg);  
	
};

extend(iup.form.SelectMany, iup.form.Field);

iup.form.FieldSet = function(oCfg) {
	var cfg = {
		fields 		: oCfg.fields, 	
		labelWidth 	: oCfg.labelWidth,
		fieldWidth	: oCfg.fieldWidth,
		rowSpace	: oCfg.rowSpace || 5
		
	};
	var self = this;
	
	var record = null;
	
	this.fields = [];
	
	this._buildEl = function() {
		var table = document.createElement("table");
		if (!cfg.fieldWidth) {
			table.style.width = '100%';
		}
		table.className = "form";
		var tbody = document.createElement("tbody");
		table.appendChild(tbody);
		var tr = document.createElement("tr");
		tbody.appendChild(tr);
		
		$.each(cfg.fields, function(idx, fieldSet) {
			var td = document.createElement("td");
			td.style.width = 100/cfg.fields.length + '%';
			td.style.verticalAlign = "top";
			tr.appendChild(td);
			var fieldSetTable = document.createElement("table");
			fieldSetTable.style.width = '100%';
			fieldSetTable.className = "field-set";
			td.appendChild(fieldSetTable);
			var fieldSetTbody = document.createElement("tbody");
			fieldSetTable.appendChild(fieldSetTbody);
			
			$.each(fieldSet, function(idx, field) {
				field.width = field.width || cfg.fieldWidth;
				var oField;
				if (field instanceof iup.form.Field) {
					oField = field;
				} else {
					if (field.type == "number") {
						oField = new iup.form.NumberField(field);
					} else if (field.type == "date") {
						oField = new iup.form.DateField(field);
					} else if (field.type == "checkbox") {
						oField = new iup.form.CheckboxField(field);
					} else if (field.type == "combobox") {
						oField = new iup.form.Combobox(field);
					} else if (field.type == "textarea") {
						oField = new iup.form.TextArea(field);
					} else if (field.type == "spinbox") {
						oField = new iup.form.Spinbox(field);
					} else {
						oField = new iup.form.Field(field);
					}
				}
				
				var fieldSetTr = document.createElement("tr");
				fieldSetTr.className = "form-row";
				var labelTd = document.createElement("td");
				fieldSetTr.appendChild(labelTd);
				labelTd.style.width = cfg.labelWidth + "px";
				if (oField.getLabel()) {
					labelTd.innerHTML = (oField.isRequired() ? "*" : "") + oField.getLabel();
					labelTd.className = "form-label";
				}
				
				var fieldTd = document.createElement("td");
				fieldSetTr.appendChild(fieldTd);
			//	fieldTd.style.width = cfg.fieldWidth + "px";
				fieldTd.style.textAlign = "left";
				fieldTd.appendChild(oField.getEl());
				
				if (idx > 0) {
					labelTd.style.paddingTop = cfg.rowSpace + "px";
					fieldTd.style.paddingTop = cfg.rowSpace + "px";
				}
				
				self.fields.push(oField);
				fieldSetTbody.appendChild(fieldSetTr);
			});
		});
		return table;
	};
	
	iup.form.FieldSet.superclass.constructor.call(this, oCfg);  
	
	this.doLayout = function(width, height) {
		// skip for now
//		var el = this.getEl();
//		el.style.width = width + 'px';
//		el.style.height = height + 'px';
		
//		var fieldWidth = width / cfg.fields.length - cfg.labelWidth;
//		for (var idx in this.fields) {
//			var field = this.fields[idx];
//			field.setWidth(fieldWidth);
//		}
	};
	
	this.loadRecord = function(rec) {
		for (var idx in this.fields) {
			var field = this.fields[idx];
			field.setField(rec.getField(field.getName()));
		}
		this.clearInvalid();
		record = rec;
	};
	
	this.enable = function() {
		for (var idx in this.fields) {
			if (!this.fields[idx].isReadOnly()) {
				this.fields[idx].enable();
			}
		}
	};
	
	this.clearInvalid = function() {
		for (var idx in this.fields) {
			this.fields[idx].clearInvalid();
		}
	};
	
	this.disable = function() {
		for (var idx in this.fields) {
			this.fields[idx].disable();
		}
	};
	
	this.getRecord = function() {
		if (record === null) {
			record = new iup.data.Record(this.getValues());
		}
		return record;
	};
	
	this.getValues = function() {
		var ret = {};
		for (var idx in this.fields) {
			var field = this.fields[idx];
			ret[field.getName()] = field.getField().get();
		}
		return ret;
	};
	
	this.validate = function() {
		var ret = true;
		for (var idx in this.fields) {
			var field = this.fields[idx];
			ret &= field.validate();
		}
		return ret;
		
	};
	
	this.reset = function() {
		for (var idx in this.fields) {
			var field = this.fields[idx];
			field.setValue(field.getField().getOriginalValue());
		}
	};
};

extend(iup.form.FieldSet, iup.layout.Panel);

iup.form.ComplexForm = function(oCfg) {
	var cfg = {
		fields 		: oCfg.fields, 	
		labelWidth 	: oCfg.labelWidth,
		fieldWidth	: oCfg.fieldWidth,
		rowSpace	: oCfg.rowSpace,
		content		: oCfg.content
	};
	
	var record = null;
	
	var fieldSets = [];
	
	this._buildEl = function() {
		this._items.push(cfg.content);
		getFieldSets(cfg.content);
		return cfg.content.getEl();
	};
	
	function getFieldSets(panel) {
		if (panel instanceof iup.form.FieldSet) {
			fieldSets.push(panel);
		} else {
			var items = panel.getItems();
			for (var i in items) {
				getFieldSets(items[i]);
			}
		}
	}
	
	iup.form.FieldSet.superclass.constructor.call(this, oCfg);  
	
	this.doLayout = function(width, height) {
		cfg.content.doLayout(width, height);
	};
	
	this.loadRecord = function(rec) {
		for (var idx in fieldSets) {
			fieldSets[idx].loadRecord(rec);
		}
		record = rec;
	};
	
	this.enable = function() {
		for (var idx in fieldSets) {
			fieldSets[idx].enable();
		}
	};
	
	this.clearInvalid = function() {
		for (var idx in fieldSets) {
			fieldSets[idx].clearInvalid();
		}
	};
	
	this.disable = function() {
		for (var idx in fieldSets) {
			fieldSets[idx].disable();
		}
	};
	
	this.getValues = function() {
		var ret = {};
		for (var idx in fieldSets) {
			var values = fieldSets[idx].getValues();
			for (var key in values) {
				ret[key] = values[key];
			}
		}
		
		return ret;
	};
	
	this.getRecord = function() {
		if (record === null) {
			record = new iup.data.Record(this.getValues());
		}
		return record;
	};
	
	this.validate = function() {
		var ret = true;
		for (var idx in fieldSets) {
			ret &= fieldSets[idx].validate();
		}
		return ret;
	};
	
	this.reset = function() {
		for (var idx in fieldSets) {
			fieldSets[idx].reset();
		}
	};
	
};

extend(iup.form.ComplexForm, iup.form.FieldSet);
*/

iup.utils.createComponent('iup.form.FieldSet', iup.layout.Panel, {
	defaults : {
		fields 		: [], 	
		labelWidth 	: undefined,
		fieldWidth	: undefined,
		rowSpace	: 5,
		columns 	: 1
	},
	/*var self = this;
	
	var record = null;
	
	this.fields = [];*/
	prototype : {
		_buildEl : function(cfg) {
			this.fields = [];
			
			var rows = Math.ceil(cfg.fields.length / cfg.columns);
			
			var table = document.createElement("table");
			if (!cfg.fieldWidth) {
				table.style.width = '100%';
			}
			table.className = "form";
			var tbody = document.createElement("tbody");
			table.appendChild(tbody);
			
			for (var i = 0; i < rows; i++) {
				var tr = document.createElement("tr");
				tr.className = "form-row";
				tbody.appendChild(tr);
				
				for (var j = 0; j < cfg.columns; j++) {
					var idx = i + j * rows;
					var	fieldCfg = idx < cfg.fields.length ? cfg.fields[idx] : null;
					
					var oField = null;
					if (fieldCfg !== null) {
						fieldCfg.width = fieldCfg.width || cfg.fieldWidth;
						if (fieldCfg instanceof iup.form.Field) {
							oField = fieldCfg;
						} else {
							if (fieldCfg.type == "number") {
								oField = new iup.form.NumberField(fieldCfg);
							/*} else if (field.type == "date") {
								oField = new iup.form.DateField(fieldCfg);
							} else if (field.type == "checkbox") {
								oField = new iup.form.CheckboxField(fieldCfg);
							} else if (field.type == "combobox") {
								oField = new iup.form.Combobox(fieldCfg);
							} else if (field.type == "textarea") {
								oField = new iup.form.TextArea(fieldCfg);*/
							} else if (fieldCfg.type == "spinbox") {
								oField = new iup.form.Spinbox(fieldCfg);
							} else {
								oField = new iup.form.Field(fieldCfg);
							}
						}
					}
					
					var labelTd = document.createElement("td");
					tr.appendChild(labelTd);
					labelTd.style.width = cfg.labelWidth + "px";
					if (oField && oField.getLabel()) {
						labelTd.innerHTML = (oField.isRequired() ? "*" : "") + oField.getLabel();
						labelTd.className = "form-label";
					}
					
					var fieldTd = document.createElement("td");
					tr.appendChild(fieldTd);
				//	fieldTd.style.width = cfg.fieldWidth + "px";
					fieldTd.style.textAlign = "left";
					if (oField){
						fieldTd.appendChild( oField.getEl() );
					}
					
					if (i > 0) {
						labelTd.style.paddingTop = cfg.rowSpace + "px";
						fieldTd.style.paddingTop = cfg.rowSpace + "px";
					}
					this.fields.push(oField);
				}
			}
			
			/*var table = document.createElement("table");
			if (!cfg.fieldWidth) {
				table.style.width = '100%';
			}
			table.className = "form";
			var tbody = document.createElement("tbody");
			table.appendChild(tbody);
			var tr = document.createElement("tr");
			tbody.appendChild(tr);
			
			$.each(cfg.fields, function(idx, fieldSet) {
				var td = document.createElement("td");
				td.style.width = 100/cfg.fields.length + '%';
				td.style.verticalAlign = "top";
				tr.appendChild(td);
				var fieldSetTable = document.createElement("table");
				fieldSetTable.style.width = '100%';
				fieldSetTable.className = "field-set";
				td.appendChild(fieldSetTable);
				var fieldSetTbody = document.createElement("tbody");
				fieldSetTable.appendChild(fieldSetTbody);
				
				$.each(fieldSet, function(idx, field) {
					field.width = field.width || cfg.fieldWidth;
					var oField;
					if (field instanceof iup.form.Field) {
						oField = field;
					} else {
						if (field.type == "number") {
							oField = new iup.form.NumberField(field);
						} else if (field.type == "date") {
							oField = new iup.form.DateField(field);
						} else if (field.type == "checkbox") {
							oField = new iup.form.CheckboxField(field);
						} else if (field.type == "combobox") {
							oField = new iup.form.Combobox(field);
						} else if (field.type == "textarea") {
							oField = new iup.form.TextArea(field);
						} else if (field.type == "spinbox") {
							oField = new iup.form.Spinbox(field);
						} else {
							oField = new iup.form.Field(field);
						}
					}
					
					var fieldSetTr = document.createElement("tr");
					fieldSetTr.className = "form-row";
					var labelTd = document.createElement("td");
					fieldSetTr.appendChild(labelTd);
					labelTd.style.width = cfg.labelWidth + "px";
					if (oField.getLabel()) {
						labelTd.innerHTML = (oField.isRequired() ? "*" : "") + oField.getLabel();
						labelTd.className = "form-label";
					}
					
					var fieldTd = document.createElement("td");
					fieldSetTr.appendChild(fieldTd);
				//	fieldTd.style.width = cfg.fieldWidth + "px";
					fieldTd.style.textAlign = "left";
					fieldTd.appendChild(oField.getEl());
					
					if (idx > 0) {
						labelTd.style.paddingTop = cfg.rowSpace + "px";
						fieldTd.style.paddingTop = cfg.rowSpace + "px";
					}
					
					self.fields.push(oField);
					fieldSetTbody.appendChild(fieldSetTr);
				});
			});*/
			this._el = table;
			return table;
		},
		doLayout : function(width, height) {
			//skip for now
		},
	
	/*this.doLayout = function(width, height) {
		// skip for now
//		var el = this.getEl();
//		el.style.width = width + 'px';
//		el.style.height = height + 'px';
		
//		var fieldWidth = width / cfg.fields.length - cfg.labelWidth;
//		for (var idx in this.fields) {
//			var field = this.fields[idx];
//			field.setWidth(fieldWidth);
//		}
	};*/
	
		loadRecord : function(rec) {
			for (var idx in this.fields) {
				var field = this.fields[idx];
				field.setField(rec.getField(field.getName()));
			}
			this.clearInvalid();
			this._record = rec;
		},		
		enable : function() {
			for (var idx in this.fields) {
				if (!this.fields[idx].isReadOnly()) {
					this.fields[idx].enable();
				}
			}
		},		
		clearInvalid : function() {
			for (var idx in this.fields) {
				this.fields[idx].clearInvalid();
			}
		},
		disable : function() {
			for (var idx in this.fields) {
				this.fields[idx].disable();
			}
		},		
		getRecord : function() {
			if (!this._record) {
				this._record = new iup.data.Record(this.getValues());
			}
			return this._record;
		},
		getValues : function() {
			var ret = {};
			for (var idx in this.fields) {
				var field = this.fields[idx];
				ret[field.getName()] = field.getField().get();
			}
			return ret;
		},
		validate : function() {
			var ret = true;
			for (var idx in this.fields) {
				var field = this.fields[idx];
				ret &= field.validate();
			}
			return ret;
			
		},
		reset : function() {
			for (var idx in this.fields) {
				var field = this.fields[idx];
				field.setValue(field.getField().getOriginalValue());
			}
		}
	}
});
