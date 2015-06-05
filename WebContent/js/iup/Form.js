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
			span.innerHTML = cfg.text || "";
			this._el = span;
		},
		setText : function(text) {
			span.innerHTML = text;
		}
	}
})

iup.utils.createComponent('iup.form.Field', iup.layout.Element, {	
	//var cfg = {	// [{label:String, required:boolean, name : String, validator : function(val){}, renderer : function(val){}, parser : function(val){}}..]
	/*statics : {
		type : 'field',
	},*/
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
			this.refresh();
		},
		refresh : function() {
			this._updateEl(this._getInput(), this.cfg.renderer(this.field.get()));
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
				//console.log()
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
	statics : {
		type : 'number',
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
})

iup.utils.createComponent('iup.form.Spinbox', iup.form.NumberField, { 
	statics : {
		type : 'spinbox',
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

iup.utils.createComponent('iup.form.CheckboxField', iup.form.Field, {
	statics : {
		type : 'checkbox',
	},
	prototype : {
		_updateEl : function(el, val) {
			if (val) {
				el.checked = "checked";
			} else {
				el.checked = "";
			}
		},
		_buildEl : function(cfg) {
			//var em = this._eventManager;
			var self = this;
			
			var ret = document.createElement("input");
			ret.type = 'checkbox';
			ret.className = "form-field";	
			
			if (cfg.field) {
				this._updateEl(cfg.field.get());
			}
			
			if (cfg.readOnly) {
				ret.disabled = "disabled";
			}
			
			this.events.on("changed", function(val, originalValue, bSilent) {
				self.getField().set(val, bSilent);
			});
			
			
			ret.onchange = function() {
				var val = ret.checked;
				self.events.fireEvent("changed", val, self.getField().getOriginalValue(), true);
			};
			
			var wrapper = document.createElement("div");
			wrapper.appendChild(ret);
			var text = document.createElement("span");
			text.style.marginLeft = "10px";
			text.innerHTML = cfg.text || "";
			wrapper.appendChild(text);
			wrapper.checkbox = ret;
			this._el = wrapper;
			return wrapper;//ret; 
		},
		_getRawValue : function() {
			return this.getEl().checkbox.checked == "checked";
		},
		enable : function() {
			this.getEl().checkbox.disabled = "";
		},
		disable : function() {
			this.getEl().checkbox.disabled = "disabled";
		},
		updateEl : function(el, val) {
			el.value = val;
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


*/

iup.utils.createComponent('iup.form.FieldSet', iup.layout.Panel, {
	defaults : {
		fields 		: [], 	
		labelWidth 	: 100,
		fieldWidth	: undefined,
		rowSpace	: 5,
		columns 	: 1
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
						fieldCfg.width = fieldCfg.width || cfg.fieldWidth;
						if (fieldCfg instanceof iup.form.Field) {
							oField = fieldCfg;
						} else {
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
						
			this._el = table;
		},
		doLayout : function(width, height) {
			//skip for now
		},
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

/*
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
	
	
	
	iup.form.FieldSet.superclass.constructor.call(this, oCfg);  
	
	this.;
	
};*/

iup.utils.createComponent('iup.form.Form', iup.form.FieldSet, function(){
	function getFieldSets(el) {
		if (el instanceof iup.form.FieldSet) {
			this._fieldSets.push(el);
		} else if (el instanceof iup.form.Field) {
			this._fields.push(el);
		} else if (el instanceof iup.layout.Panel){
			var items = el.cfg.content;
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
				//this._items.push(cfg.content);
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
			clearInvalid : function() {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].clearInvalid();
				}
			},
			disable : function() {
				for (var idx in this._fieldSets) {
					this._fieldSets[idx].disable();
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
			}
		}
	}
}());