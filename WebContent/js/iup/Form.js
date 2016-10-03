'use strict';

iup.utils.createComponent('iup.form.Label', iup.layout.Element, {
	defaults : {
		text : ''
	},
	prototype : {
		_buildEl : function(cfg) {
			var span = document.createElement("span");
			span.innerHTML = cfg.text || "";
			this._el = span;
		},
		setText : function(text) {
			this._el.innerHTML = text;
		}
	}
});

iup.utils.createComponent('iup.form.Field', iup.layout.Element, function() {
	function Tooltip(oCfg) {
		var cfg = {
			position : oCfg.position || 'right',
			bindTo : oCfg.bindTo,
			title : oCfg.title
		};
		var el;
		
		initTooltip();
		
		function buildTooltip() {
			return iup.utils.createEl("div", {
		//		className : 'tooltip'
			});
		}
		
		function initTooltip() {
			el || (el = buildTooltip());
			
			var type = cfg.validationMessage ? 'error' : 'info';
			var message = cfg.validationMessage || cfg.title;
			el.className = type === 'error' ? 'tooltip-error' : 'tooltip-info';
			el.innerHTML = message;
			if (message) {
				cfg.bindTo.onmouseenter = function() {
					showTooltip();
				};
				cfg.bindTo.onmouseleave = function() {
					hideTooltip();
				};
			} else {
				hideTooltip();
				cfg.bindTo.onmouseenter = null;
				cfg.bindTo.onmouseleave = null;
			}
		}
		
		function showTooltip() {
			var offset = $(cfg.bindTo).offset();
			el.style.top = offset.top + 'px';
			el.style.left = offset.left + $(cfg.bindTo).width() + 12 + 'px';
			
			document.getElementsByTagName('body')[0].appendChild(el);
		}
		
		function hideTooltip() {
			if (el.parentNode) {
				el.parentNode.removeChild(el);
			}
		}
		
		this.setValidationMessage = function(message) {
			cfg.validationMessage = message;
			initTooltip();
		};
	}
	
return {	
	/*
	 
	 */
	
	
	//var cfg = {	// [{label:String, required:boolean, name : String, validator : function(val){}, renderer : function(val){}, parser : function(val){}}..]
	/*statics : {
		type : 'field',
	},*/
	defaults : {
		label	: '',
		name 		: undefined,
		readOnly	: false,
		field		: undefined,
		required 	: undefined,
		width 		: undefined,// || 200;
		regex		: undefined,
		placeholder : undefined,
		detached	: undefined,
		value		: undefined,
	//	var style		= oCfg.style;
	//	var className	= oCfg.className;
		//autocomplete: oCfg.autocomplete, // {store:iup.Store(), fieldName : field}
		renderer	: function(val) {
			return (typeof val === "undefined" || val === null) ? "" : val;
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
			
			var ret = document.createElement("input");
			ret.type = 'text';
			ret.className = "form-field";	
			ret.style.width = cfg.width ? cfg.width + "px" : '100%';

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
			
			this._el = ret;
			return ret; 
		},
		select : function(callback) {
			var self = this,
				cfg = this.cfg,
				el = this._getInput();
			
			var LEFT = 37,
				UP = 38,
				RIGHT = 39,
				DOWN = 40,
				ENTER = 13,
				ESC = 27;
			
								
			
			
			function init() {
				$(el).addClass('field-selected');
				//el.setAttribute('tabIndex', '-1');
				el.focus();
				el.onblur = removeSelection;
				el.onkeyup = handler;
			}
			
			function removeSelection () {
				$(el).removeClass('field-selected');
				//el.removeAttribute('tabIndex');
				el.onkeyup = undefined;
				el.onblur = undefined;
				//$(marked).removeClass('field-marked');
			}

			init();
			
			function handler(evt) {
				if (evt.keyCode === ESC) {
					removeSelection ();
					if (typeof callback == "function") {
						setTimeout(function() {
							callback();
						},5);
						
					}
				} else if (evt.keyCode === ENTER) {
					removeSelection ();
					if (typeof callback == "function") {
						setTimeout(function() {
							callback();
						},5);
						
					}
					/*var target = self.cfg.content[currentItem].content;
					if (target) {
						removeSelection ();
						target.select(function(){init();});
					}*/
				}
				
				/*var rows = Math.ceil(cfg.fields.length / cfg.columns);
				var target;
				if (evt.keyCode === LEFT && position.col > 0) {
					position.col--;
				} else if (evt.keyCode === UP && position.row > 0) {
					position.row--;
				} else if (evt.keyCode === RIGHT && position.col < self.cfg.columns - 1) {
					position.col++;
				} else if (evt.keyCode === DOWN && position.row < rows - 1) {
					position.row++;
				}
				
				itemToMark = items[position.row].children[position.col * 2 + 1];
				if (marked !== itemToMark) {
					$(marked).removeClass('field-marked');
					marked = itemToMark;
					$(marked).addClass('field-marked');
				}*/
			}
		},
		getField : function() {
			return this.field;
		},
		focus : function() {
			this._getInput().focus();
		},
		_updateEl :  function(el, val) {
			el.value = val;
		//	this._textHolder.innerHTML = val;
		},
		setValue : function(val, bSilent) {
			this._updateEl(this._getInput(), this.cfg.renderer(val));
//			this._textHolder.innerHTML =  this.cfg.renderer(val);
			this.events.fireEvent("changed", val, this.field.getOriginalValue(), bSilent);
		},
		getValue : function() {
			return this.getField().get();
		},
		validate : function() {
			var isValid = this.isValid();
			this._setValid(isValid);
			return isValid;
		},
		_setValid : function(isValid) {
			if (isValid) {
				this.clearInvalid();
				//$(this._getInput()).removeClass("invalid");
			} else {
				$(this._getInput()).addClass("invalid");
			}
		},
		setField : function(oField) {
			this.field = oField || new iup.data.Field(name);
			this.refresh();
		},
		refresh : function() {
			this._updateEl(this._getInput(), this.cfg.renderer(this.field.get()));
//			this._textHolder.innerHTML =  this.cfg.renderer(this.field.get());
		}, 
		enable : function() {
			//this._textHolder.style.display = 'none';
			//this._getInput().style.display = 'inline';
			this._getInput().removeAttribute("readonly");//disabled = "";
			$(this._getInput()).removeClass("disabled");
			this.cfg.disabled = false;
		},
		disable : function() {
			//this._textHolder.innerHTML = this._getInput().value;
			//this._textHolder.style.display = 'block';
		//	this._getInput().style.display = 'none';
			
			this._getInput().setAttribute("readonly", "readonly");
			$(this._getInput()).addClass("disabled");
			this.cfg.disabled = true;
		},
		clearInvalid : function() {
			$(this._getInput()).removeClass("invalid");
			this._tooltip.setValidationMessage.call(null);
		},
		getName : function() {
			return this.cfg.name;
		},
		isRequired : function() {
			return this.cfg.required;
		},
		setRequired : function(required) {
			this.cfg.required = required;
		},
		isReadOnly : function() {
			return this.cfg.readOnly;
		},
		getLabel : function() {
			return this.cfg.label;
		},
		isValid : function() {
			var val = this.field.get();
			
			var required = this.cfg.required && !this.cfg.disabled && !this.cfg.readOnly;
			if (required && (typeof val === "undefined" || val === null || val.length === 0) ) {
				//showTooltip.call(this, {type : "error", message : "This field is Required"}, 3000);
				//setValidationMessage.call(this, "This field is Required");
				this._tooltip.setValidationMessage("This field is Required");
				return false;
			}
			
			var rawVal = this._getRawValue();
			if (this.cfg.regex && rawVal && !this.cfg.regex.test(rawVal)) {
				//showTooltip.call(this, {type : "error", message : "Wrong format"}, 3000);
				//setValidationMessage.call(this, "Wrong format");
				this._tooltip.setValidationMessage("Wrong format");
				return false;
			}
			
			var valid = this.cfg.validator(val, this._getRawValue());
			if (typeof valid === "string") {
				//setValidationMessage.call(this, valid);
				this._tooltip.setValidationMessage(valid);
				valid = false;
			}
			return valid;
		},
		_getRawValue : function() {
			return this._getInput().value;
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
		var cfg = this.cfg;
		var self = this;
		//var wrapper = document.createElement('div');
		//wrapper.appendChild(this._el);
		//this._el = wrapper;
		
		//this._textHolder = iup.utils.createEl('div', {style : {display : 'none'}});
		//wrapper.appendChild(this._textHolder);
		
		this.field = cfg.field || new iup.data.Field({
			name : cfg.name,
			value : cfg.value
		});
		
		this._updateEl(this._getInput(), cfg.renderer(this.field.get()));
		//this._textHolder.innerHTML =  cfg.renderer(this.field.get());
		
		
		if (cfg.readOnly) {
			this.disable();
		}
		
		this._tooltip = new Tooltip({
			bindTo : this._el,
			title : cfg.title
		});
//		if (this.cfg.value) {
//			console.log(this.cfg.value, this.field.get(), this._getInput().value);
//		}
		
		/*if (cfg.title) {
			var mouseEnter = false;
			
			self._el.onmouseenter = function() {
				showTooltip.call(self, {message : cfg.title});
			}
			self._el.onmouseleave = function() {
				hideTooltip.call(self);
			}
		}*/
	}
};}());

iup.utils.createComponent('iup.form.TextArea', iup.form.Field, { 
	statics : {
		type : 'textarea'
	},
	prototype : {
		_buildEl : function(cfg) {
			var self = this;
			
			var ret = document.createElement("textarea");
			//ret.type = 'password';
			ret.className = "form-field";	
			ret.style.width = cfg.width ? cfg.width + "px" : '100%';

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
			
			this._el = ret;
			return ret; 
		},
		_getInput : function() {
			//console.log(this.getEl());
			//return $(this.getEl()).find('TEXTAREA')[0];
			return this.getEl();
			/*if (this.getEl().tagName === 'TEXTAREA') {
				return this.getEl();
			} 
			return $(this.getEl()).find('TEXTAREA')[0];*/
		}
	}
});

iup.utils.createComponent('iup.form.NumberField', iup.form.Field, {  
	statics : {
		type : 'number'
	},
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
});

iup.utils.createComponent('iup.form.Password', iup.form.Field, { 
	statics : {
		type : 'password'
	},
	prototype : {
		_buildEl : function(cfg) {
			var self = this;
			
			var ret = document.createElement("input");
			ret.type = 'password';
			ret.className = "form-field";	
			ret.style.width = cfg.width ? cfg.width + "px" : '100%';

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
			
			this._el = ret;
			return ret; 
		}
	}
});

iup.utils.createComponent('iup.form.Spinbox', iup.form.NumberField, { 
	statics : {
		type : 'spinbox'
	},
	prototype : {
		_buildEl : function(oCfg) {
			var self = this;
			
			var wrapper = document.createElement('div');
			wrapper.style.position = 'relative';
			wrapper.style.width = oCfg.width ? oCfg.width + "px" : '100%';
			
			var input = document.createElement("input");
			input.type = 'text';
			input.className = "form-field spin-box";	
			
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
			inc.innerHTML = '<span class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span>';
			buttonsDiv.appendChild(inc);
			
			var dec = document.createElement('div');
			dec.className = 'number-dec';
			dec.innerHTML = '<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>';
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
			this._state = {
				buttonsDiv : buttonsDiv
			};
			this._el = wrapper;
			return wrapper; 
		},
		disable : function () {
			this.constructor.superclass.disable.call(this);
			this._state.buttonsDiv.style.display = 'none';
		},
		enable : function () {
			this.constructor.superclass.enable.call(this);
			this._state.buttonsDiv.style.display = 'block';
		}
	}
});

iup.utils.createComponent('iup.form.CheckboxField', iup.form.Field, {
	statics : {
		type : 'checkbox'
	},
	prototype : {
		_updateEl : function(el, val) {
			if (val) {
				el.checked = "checked";
			} else {
				el.checked = "";
			}
		//	this._textHolder.className = val ? "checkbox-checked" : "checkbox-unchecked";
		},
		_buildEl : function(cfg) {
			var self = this;
			
			var ret = document.createElement("input");
			ret.type = 'checkbox';
			ret.className = "form-field";	
			
			if (cfg.field) {
				this._updateEl(cfg.field.get());
			}
			
			this.events.on("changed", function(val, originalValue, bSilent) {
				self.getField().set(val, bSilent);
			});
			
			
			ret.onchange = function() {
				var val = ret.checked;
				self.events.fireEvent("changed", val, self.getField().getOriginalValue(), true);
			};
			
//			var wrapper = document.createElement("div");
//			wrapper.appendChild(ret);
//			var text = document.createElement("span");
//			text.style.marginLeft = "10px";
//			text.innerHTML = cfg.text || "";
//			wrapper.appendChild(text);
//			wrapper.checkbox = ret;
//			wrapper.style.display = 'inline';
			this._el = ret;
//			return wrapper;//ret; 
		},
		_getRawValue : function() {
			return this._getInput().checked == "checked";
		},
		/*enable : function() {
			this.getEl().checkbox.disabled = "";
		},
		disable : function() {
			this.getEl().checkbox.disabled = "disabled";
		},*/
		updateEl : function(el, val) {
			el.value = val;
		},
		enable : function() {
			//this._textHolder.style.display = 'none';
			//this._getInput().style.display = 'inline';
			this._getInput().removeAttribute("disabled");//disabled = "";
			$(this._getInput()).removeClass("disabled");
			this.cfg.disabled = false;
		},
		disable : function() {
			//this._textHolder.innerHTML = this._getInput().value;
			//this._textHolder.style.display = 'block';
		//	this._getInput().style.display = 'none';
			
			this._getInput().setAttribute("disabled", "disabled");
			$(this._getInput()).addClass("disabled");
			this.cfg.disabled = true;
		}
	}

});


iup.utils.createComponent("iup.form.ButtonField", iup.form.Field, {
	statics : {
		type : 'buttonfield'
	},
	defaults : {
		buttons : []
	},
	prototype : {
		_buildEl : function(cfg) {
			var self = this;
		
			var wrapper = document.createElement('div');
			wrapper.style.position = 'relative'; 
			
			if (cfg.width) {
				wrapper.style.width = cfg.width + 'px';
			}
			
			var input = document.createElement('input');
			input.name = cfg.name;
			input.className = 'form-field';	
			input.style.width = '100%';
			input.setAttribute('readonly', 'readonly');
			
			var buttonsPanel = document.createElement('div');
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
				
				//buttons.push(button);
				buttonsPanel.appendChild(button);
				
				buttonsWidth += buttonCfg.width || 20;
			}
			input.style.paddingRight = buttonsWidth + 'px';
			
			wrapper.appendChild(input);
			wrapper.appendChild(buttonsPanel);
			
			input.onchange = function() {
				var val = input.value;
				var parsedVal = typeof cfg.parser === 'function' ? cfg.parser(val, self.getField().get()) : val;
				self.events.fireEvent("changed", parsedVal, self.getField().getOriginalValue(), true);
			};
			
			self.events.on("changed", function(val, originalValue, bSilent) {
				self.getField().set(val, bSilent);
				self.validate();
			});
			
//			if (cfg.readOnly) {
//				self.disable();
//			}
			this._buttonsPanel = buttonsPanel;
			//this._updateEl(self.getField().get());
			
			this._el = wrapper;
		},
		disable : function() {
//			input.disabled = "disabled";
			this.constructor.prototype.disable.call(this);
			this._buttonsPanel.style.display = 'none';
		},
		enable : function() {
//			input.disabled = "";
			this.constructor.prototype.enable.call(this);
			this._buttonsPanel.style.display = 'block';
		}
	}

});



/*iup.utils.createComponent('iup.form.TextArea', iup.form.Field, {
	statics : {
		type : 'textarea'
	},
	prototype : {
		_buildEl : function(cfg) {
			var self = this;
			
			var input = iup.utils.createEl("textarea", {
				className : "form-field"
			});
			//input.className = "form-field"; 
			
//			em.addHandler("changed", function(val, originalValue, bSilent) {
//				oThis.getField().set(val, bSilent);
//				oThis.validate();
//			});
//			
//			
			input.onchange = function() {
				var val = ret.checked;
				self.events.fireEvent("changed", val, self.getField().getOriginalValue(), true);
			};
			
			this._el = input;
		},
		_getInput : function() {
			var area = $(this.getEl()).find('TEXTAREA')[0];
			console.log(area);
			return area;
		}
	}

});*/

iup.utils.createComponent('iup.form.SelectMany', iup.form.Field, function() {
	function updateTables() {
		var _this = this, 
			cfg = _this.cfg,
			availableItems = _this._getStyleEl().children[0], 
			selectedItems = _this._getStyleEl().children[1];
		availableItems.innerHTML = '';
		selectedItems.innerHTML = '';
		var data = cfg.store.getData();
		var selectedValues = _this.getField() && _this.getValue();
		if (selectedValues instanceof iup.data.Store) {
			selectedValues = selectedValues.getRawData();
		}
		for (var i = 0, n = data.length; i < n; i++) {
			
			var div = iup.utils.createEl('div', {
				content : getLabel(data[i])
			});
			
			div.ondblclick = dblClickHandler;
			div.value = getValue(data[i]);
			
			if (recordSelected(data[i], selectedValues)) {
				selectedItems.appendChild(div);
				div.isSelected = true;
			} else {
				availableItems.appendChild(div);
				div.isSelected = false;
			}
		}
		
		function dblClickHandler(evt) {
			var div = this;

			var selectedValues = _this.getValue() || [];
		//	console.log(selectedValues);
			if (div.isSelected) {
				if (selectedValues instanceof iup.data.Store) {
					var rawData = selectedValues.getRawData();
					
					selectedValues.removeRecord(selectedValues.getData()[indexOf(rawData, div.value)]);
				} else {
					selectedValues.splice(indexOf(selectedValues, div.value), 1);
				}
			} else {
		//		selectedItems.appendChild(div);
				if (selectedValues instanceof iup.data.Store) {
					selectedValues.addRecord(div.value);
				} else {
					selectedValues.push(div.value);
				}
			}
		//	console.log(_this.getValue().getRawData(), _this.getField().getOriginalValue());
			if ( ! (selectedValues instanceof iup.data.Store)) {
				_this.setValue(selectedValues);
			}
			
			updateTables.call(_this);
			
			function indexOf(collection, item) {
				for (var i = 0, n = collection.length; i < n; i++) {
					if ( _this.cfg.sameObject(collection[i], item)) {
						return i;
					}
				}
				return -1;
			}
 		}
		
		function recordSelected(record, selectedValues) {
			var convertedVal = getValue(record);

			if (!selectedValues) {
				return false;
			}
			for (var i = 0, n = selectedValues.length; i < n; i++) {
				if (cfg.sameObject(convertedVal, selectedValues[i])) {
					return true;
				}
			}
			return false;
		}
		
		function getValue(record) {
			if (typeof cfg.valueField === 'function') {
				return cfg.valueField(record);
			} 
			return record.get(cfg.valueField);
		}
		
		function getLabel(record) {
			if (typeof cfg.displayField === 'function') {
				return cfg.displayField(record);
			} 
			return record.get(cfg.displayField);
		}
	}
	
	return {
		statics : {
			type : 'selectmany'
		},
		defaults : {
			store : undefined,
			areEqual : undefined,
			//converter : undefined,
			displayField : undefined,
			valueField : undefined,
			sameObject : function(available, selected) {
				return available === selected;
			}
		},
		prototype : {
			_buildEl : function() {
				var _this = this;
				var container = iup.utils.createEl('div', {
					style : {
					    position : 'relative',
					   // width : '400px',
					    height : '150px',
					    bachgroundColor : '#579'
					}
				});
	
				var availableItems = iup.utils.createEl('div', {
					style : {
					    position : 'absolute',
					    right : '50%',
					    left : '0px',
					    top : '0px',
					    bottom : '0px',
					    border : '1px solid green',
					    marginRight:'20px',
					    overflowX : 'hidden',
					    overflowY : 'auto'
					}
				});
				container.appendChild(availableItems);
	
				var selectedItems = iup.utils.createEl('div', {
				    style : {
					    position : 'absolute',
					    left : '50%',
					    right : '0px',
					    top : '0px',
					    bottom : '0px',
					    border : '1px solid red',
					    marginLeft:'20px',
					    overflowX : 'hidden',
					    overflowY : 'auto'
					}
			    });
				container.appendChild(selectedItems);
	
				var buttonsContainer = iup.utils.createEl('div', {
					style : {
					    position : 'absolute',
					    top : '0px',
					    bottom : '0px',
					    left : '50%',
					    width : '30px',
					    marginLeft:'-15px'
					}
				});
				container.appendChild(buttonsContainer);
				
				function createButton(text, className, handler){
					return iup.utils.createEl('div', {
					    style : {
						    marginTop : '10px',
						    height : '25px',
						    border : '1px solid blue',
						    textAlign : 'center',
						    fontWeight : 'bold',
						    color : '#579',
						    cursor : 'pointer'
						},
						content : text
					});
				}
				buttonsContainer.appendChild(createButton('>>'));
				buttonsContainer.appendChild(createButton('>'));
				buttonsContainer.appendChild(createButton('<'));
				buttonsContainer.appendChild(createButton('<<'));
				
				//this._styleEl = container;
				this._el = container;
				
				updateTables.call(_this, availableItems, selectedItems);
				this.cfg.store.events.on('load', function() {
					updateTables.call(_this, availableItems, selectedItems);
				});
				
				/*var em = this._eventManager;
				
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
	
				return table;*/
			},
			_updateEl :  function(el, val) {
				updateTables.call(this);
			}
		}	
	};
}());

iup.utils.createComponent('iup.form.FieldSet', iup.layout.Panel, {
	defaults : {
		fields 		: [], 	
		labelWidth 	: 150,
		fieldWidth	: undefined,
		rowSpace	: 5,
		columns 	: 1,
		model 		: undefined,
		root 		: undefined
	},

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
						
						if (fieldCfg instanceof iup.form.Field) {
							oField = fieldCfg;
							if (typeof oField.isRequired() == 'undefined') { 
								oField.setRequired(isRequired(cfg.model, oField.cfg.name.split('.'), 0));
							}
						} else {
							fieldCfg.width = fieldCfg.width || cfg.fieldWidth;
							if (typeof fieldCfg.required == 'undefined') {
								fieldCfg.required = isRequired(cfg.model, fieldCfg.name.split('.'), 0);
							}
									
							if (fieldCfg.type) {
								for (var key in iup.form) {
									var construct = iup.form[key];
									if (construct.type === fieldCfg.type) {
										oField = new construct(fieldCfg);
									}
								}
								
							}
							if (!oField) {
								oField = new iup.form.Field(fieldCfg);
							}
						}
					}
					
					var labelTd = document.createElement("td");
					tr.appendChild(labelTd);
					labelTd.style.width = cfg.labelWidth + "px";
					if (oField && oField.getLabel()) {
						labelTd.innerHTML = (oField.isRequired() && !oField.isReadOnly() ? "*" : "") + oField.getLabel();
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
			var wrapper = document.createElement('div');
			wrapper.appendChild(table);
			this._el = wrapper;
			
			/*function isRequired(fieldName) {
				if (cfg.model) {
					var fieldDefs = cfg.model.fields;
					for (var i = 0; i < fieldDefs.length; i++) {
						var fieldDef = fieldDefs[i];
						if (fieldDef.name === fieldName) {
							return fieldDef.required && fieldDef.type != 'boolean';
						}
					}
				}
				return undefined;
			} */
			
			function isRequired(model, path, idx) {
				if (model) {
					if (!model.fields) {
				//		console.log(model);
						model = window[model];
					}
					var fieldDefs = model.fields;
					for (var i = 0; i < fieldDefs.length; i++) {
						var fieldDef = fieldDefs[i];
						if (fieldDef.name === path[idx]) {
							if (!fieldDef.required) {
								return false;
							} else if (path.length - 1 === idx) {
								return fieldDef.type != 'boolean';
							} else {
								return isRequired(fieldDef.type, path, ++idx);
							}
						}
					}
				}
				return undefined;
			} 
		},
		select : function(callback) {
			var self = this,
				cfg = this.cfg,
				el = this.getEl(),
				items = el.children[0].children[0].children;
			
			var rows = Math.ceil(cfg.fields.length / cfg.columns);
			
			var LEFT = 37,
				UP = 38,
				RIGHT = 39,
				DOWN = 40,
				ENTER = 13,
				ESC = 27;
			
			
			function init() {
				$(el).addClass('panel-selected');
				el.setAttribute('tabIndex', '-1');
				el.focus();
				el.onblur = removeSelection;
				el.onkeyup = handler;
				$(marked).addClass('field-marked');
			}
			
			function removeSelection () {
				$(el).removeClass('panel-selected');
				el.removeAttribute('tabIndex');
				el.onkeyup = undefined;
				el.onblur = undefined;
				$(marked).removeClass('field-marked');
			}

			var position = {row : 0, col : 0},
				marked = items[position.row].children[position.col * 2 + 1];
			init();
			
			function handler(evt) {
				var target;
				if (evt.keyCode === ESC) {
					removeSelection ();
					if (typeof callback == "function") {
						setTimeout(function() {
							callback();
						},5);
						
					}
				} else if (evt.keyCode === ENTER) {
					var fieldIdx = position.col + position.row * self.cfg.columns;
					target = self.fields[fieldIdx];
					
					if (target) {
						removeSelection ();
						target.select(function(){init();});
					} 
				} else if (evt.altKey) {
					var key = evt.key;
					if (self.cfg.controls) {
						var action = self.cfg.controls[key];
						if (action) {
							if (action instanceof iup.Button) {
								action.cfg.handler();
							} else if (typeof action === "function") {
								action();
							}
						}
						evt.cancelBubble = true;
					}
				}
				
				
				if (evt.keyCode === LEFT && position.col > 0) {
					position.col--;
				} else if (evt.keyCode === UP && position.row > 0) {
					position.row--;
				} else if (evt.keyCode === RIGHT && position.col < self.cfg.columns - 1) {
					position.col++;
				} else if (evt.keyCode === DOWN && position.row < rows - 1) {
					position.row++;
				}
				
				var itemToMark = items[position.row].children[position.col * 2 + 1];
				if (marked !== itemToMark) {
					$(marked).removeClass('field-marked');
					marked = itemToMark;
					$(marked).addClass('field-marked');
				}
			}
			
		},
		_eachField : function (action) {
			for (var idx in this.fields) {
				var field = this.fields[idx];
				if (field && !field.cfg.detached) {
					action(field);
				}
			}
		},
		doLayout : function(width, height) {
			//skip for now
		},
		loadRecord : function(rec) {
			this._record = rec;
			
			if (this.cfg.root) {
				rec = rec.get(this.cfg.root);
			}
			this._eachField(function(field) {
				field.setField(rec.getField(field.getName()));
			});
			this.clearInvalid();
			//this._record = rec;
		},
		enable : function() {
			this._eachField(function(field) {
				if (!field.isReadOnly()) {
					field.enable();
				}
			});
		},		
		disable : function() {
			this._eachField(function(field) {
				field.disable();
			});
		},	
		setDisabled : function(disable) {
			if (disable) {
				this.disable();
			} else {
				this.enable();
			}
		},
		clearInvalid : function() {
			this._eachField(function(field) {
				field.clearInvalid();
			});
		},
		getRecord : function() {
			if (!this._record) {
				this._record = new iup.data.Record(this.getValues());
			}
			return this._record;
		},
		getValues : function() {
			var ret = {};
			this._eachField(function(field) {
				ret[field.getName()] = field.getField().get();
			});
			return ret;
		},
		validate : function() {
			var ret = true;
			this._eachField(function(field) {
				ret &= field.validate();
			});
			return ret;
			
		},
		reset : function() {
			this._eachField(function(field) {
				field.setValue(field.getField().getOriginalValue());
			});
		}/*,	
		loadData : function(data) {
			this._data = data;
			var value = data;
			if (this.cfg.root) {
				value = findData(data, this.cfg.root.split('.'), 0);
			}
			
			var record = new iup.data.Record(value, this.cfg.model);
			this.loadRecord(record);
			
			function findData(root, path, idx) {
				if (idx == path.length - 1) {
					return root[path[idx]] || {};
				} else {
					var next = root[path[idx]];
					if (next) {
						return findData(next, path, ++idx);
					}
					return {};
				}
			}
		},
		isDirty : function() {
			return this.getRecord().isDirty();
		},
		applyChanges : function() {
			var root = this.cfg.root ? getRoot(this._data, this.cfg.root.split('.'), 0) : this._data;
			
			this.getRecord().applyChanges(root);
			
			function getRoot(root, path, idx) {
				var newRoot = root[path[idx]] || (root[path[idx]] = {});
				
				if (idx == path.length - 1) {
					return newRoot;
				} else {
					return getRoot(newRoot, path, ++idx);
				}
			}
		},
		revertChanges : function() {
			var root = this.cfg.root ? getRoot(this._data, this.cfg.root.split('.'), 0) : this._data;
			
			this.getRecord().revertChanges(root);
			
			function getRoot(root, path, idx) {
				var newRoot = root[path[idx]] || (root[path[idx]] = {});
				
				if (idx == path.length - 1) {
					return newRoot;
				} else {
					return getRoot(newRoot, path, ++idx);
				}
			}
		}*/
		
	}
});

iup.utils.createComponent('iup.form.Form', iup.form.FieldSet, function() {
	function getFieldSets(el) {
		if (el instanceof iup.form.FieldSet) {
			this._fieldSets.push(el);
		} else if (el instanceof iup.form.Field) {
			this._fields.push(el);
		} /*else if (el instanceof iup.layout.TabPanel) { 
			var items = el.cfg.content;
			for (var i in items) {
				getFieldSets.call(this, items[i].content);
			}
		}*/ else if (el instanceof iup.layout.Panel) {
			var items = el.getChildren();//cfg.content;
			for (var i in items) {
				getFieldSets.call(this, items[i]);
			}
		}
	}

	return {
		defaults : {
		
		},
		prototype : {
			_buildEl : function(cfg) {
				this._fieldSets = [];
				this._fields = [];
				getFieldSets.call(this, cfg.content[0]);
				this._el = cfg.content[0].getEl();
			},
			doLayout : function(width, height) {
				this.cfg.content[0].doLayout(width, height);
			},
			loadRecord : function(rec) {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].loadRecord(rec);
				}
				this._record = rec;
			},
			enable : function() {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].enable();
				}
			},
			disable : function() {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].disable();
				}
			},
			setDisabled : function(disable) {
				if (disable) {
					this.disable();
				} else {
					this.enable();
				}
			},
			clearInvalid : function() {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].clearInvalid();
				}
			},
			getValues : function() {
				var ret = {};
				for (var idx in this._fieldSets) {
					var values = this._fieldSets[idx].getValues();
					for (var key in values) {
						ret[key] = values[key];
					}
				}
				
				return ret;
			},
			getRecord : function() {
				if (!this._record) {
					this._record = new iup.data.Record(this.getValues());
				}
				return this._record;
			},
			validate : function() {
				var ret = true;
				for (var idx in this._fieldSets) {
					ret &= this._fieldSets[idx].validate();
				}
				return ret;
			},
			reset : function() {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].reset();
				}
			}/*,
			loadData : function(data) {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].loadData(data);
				}
				this._data = data;
			},
			isDirty : function() {
				for (var idx in this._fieldSets) {
					if (this._fieldSets[idx].isDirty()) {
						return true;
					}
				}
				return false;
			},
			applyChanges : function () {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].applyChanges();
				}
			}*/
		}
	};
}());