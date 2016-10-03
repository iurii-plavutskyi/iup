iup.utils.createComponent('iup.form.DateField', iup.form.Field, function() {
	function DatePicker(dateField, onSelect) {
		var cfg = dateField.cfg;
		var selectedDate;
		var today;
		
		var record = new iup.data.Record({}, {fields : [{name : 'date'}]});
		var weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		var months = [{value : 0, label : 'January'}, {value : 1, label : 'February'}, {value : 2, label : 'March'}, 
						{value : 3, label : 'April'}, {value : 4, label : 'May'}, {value : 5, label : 'June'}, 
						{value : 6, label : 'July'}, {value : 7, label : 'August'}, {value : 8, label : 'September'}, 
						{value : 9, label : 'October'}, {value : 10, label : 'November'}, {value : 11, label : 'December'}];
		
						
		var cal = document.createElement('div');
		cal.className = 'calendar';
		
		var table = document.createElement('table');
		cal.appendChild(table);
		var tHead = document.createElement('thead');
		table.appendChild(tHead);
		var tBody = document.createElement('tbody');
		table.appendChild(tBody);
		
		tBody.onclick = function(e) {
			var target = e.target ? e.target : e.srcElement;
			if (target.tagName === 'TD') {
				if (target.innerHTML) {
					selectDate(parseInt(target.innerHTML,10));
				}
			}
		};
		
		function selectDate(date) {
			var oDate = record.get('date');
			oDate.setDate(date);
			
			selectedDate.setFullYear(oDate.getFullYear());
			selectedDate.setMonth(oDate.getMonth());
			selectedDate.setDate(date);
			
			buildCal(oDate.getFullYear(), oDate.getMonth());
			
			if (!cfg.showTime) {
//				var date = record.get('date');
				if (typeof onSelect === 'function') {
					onSelect(record.get('date').getTime());
				}
				win.hide();
			}
		}
		
		var headersHTML = [];
		headersHTML.push('<tr>');
		for (var i = 0; i < weekDays.length; i++) {
			headersHTML.push('<th>' + weekDays[i] + '</th>');
		}
		headersHTML.push('</tr>');
		tHead.innerHTML = headersHTML.join('');
		
		var monthField = new iup.form.Combobox({
			name 		: 'date',
			store		: new iup.data.Store({
				data		: months,
				autoLoad	: false
			}),
			displayField: 'label',
			valueField	: 'value',
			width 		: 90,
			renderer	: function(val) {
				return val ? val.getMonth() : null;
			},
			required	: true,
			parser 		: function(val, date) {
				date.setMonth(val);
				return date;
			}
		});
		
		var yearField = new iup.form.Spinbox({
			name 	: 'date',
//			type 	: 'spinbox',
			width 	: 50,
			renderer: function(val) {
				return val ? val.getFullYear() : null;
			},
			parser 	: function(val, date) {
				date.setFullYear(val);
				return date;
			}
		});
		
		var timePanel = new iup.layout.Panel({
//					style	: {paddingTop : '5px'},
			content	: [
				new iup.form.FieldSet({
					fieldWidth  : 40,
					labelWidth  : 0,
					style		: {cssFloat:'right', styleFloat : 'right'},
					fields 		: [{
						name 	: 'date',
						type 	: 'spinbox',
//								style	: {cssFloat:'right', styleFloat : 'right'},
						minVal	: 0,
						maxVal	: 59,
						width	: 35,
						renderer: function(val) {
							return val ? (val.getSeconds() < 10 ? '0' : '') + val.getSeconds() : null;
						},
						parser 	: function(val, date) {
							date.setSeconds(val);
							return date;
						}
					}]
				}), 
				new iup.form.Label({text : ':', style	: {cssFloat:'right', styleFloat : 'right', paddingLeft : '3px', paddingRight : '3px'}}),
				new iup.form.FieldSet({
					fieldWidth  : 40,
					labelWidth  : 0,
					style		: {cssFloat:'right', styleFloat : 'right'},
					fields 		: [{
						name 	: 'date',
						type 	: 'spinbox',
//								style	: {cssFloat:'right', styleFloat : 'right'},
						minVal	: 0,
						maxVal	: 59,
						width	: 35,
						renderer: function(val) {
							return val ? (val.getMinutes() < 10 ? '0' : '') + val.getMinutes() : null;
						},
						parser 	: function(val, date) {
							date.setMinutes(val);
							return date;
						}
					}]
				}), 
//						minutesField, 
				new iup.form.Label({text : ':', style	: {cssFloat:'right', styleFloat : 'right', paddingLeft : '3px', paddingRight : '3px'}}),
				new iup.form.FieldSet({
					fieldWidth  : 40,
					labelWidth  : 0,
					style		: {cssFloat:'right', styleFloat : 'right'},
					fields 		: [{
						name 	: 'date',
						type 	: 'spinbox',
						minVal	: 0,
						maxVal	: 23,
						width	: 35,
						renderer: function(val) {
							return val ? (val.getHours() < 10 ? '0' : '') + val.getHours() : null;
						},
						parser 	: function(val, date) {
							date.setHours(val);
							return date;
						}
					}]
				}),
				new iup.form.Label({text : 'Time: ', style	: {cssFloat:'right', styleFloat : 'right', paddingRight : '30px'}})
//						secondsField
			]
		});
		
		var form = new iup.form.Form({
			content : new iup.layout.BorderPanel({
				layoutConfig	: {top: 25, bottom : cfg.showTime ? 25 : 0},
				top	: new iup.layout.Panel({
					content	: [
						new iup.form.FieldSet({
							fieldWidth  : 50,
							labelWidth  : 0,
							style		: {cssFloat:'right', styleFloat : 'right'},
							fields : [
								yearField
							]
						}),
						new iup.form.FieldSet({
							fieldWidth  : 70,
							labelWidth  : 0,
							style		: {cssFloat:'right', styleFloat : 'right', marginRight : '15px'},
							fields : [
								monthField
							]
						})
					]
				}),
				bottom	: cfg.showTime ? timePanel : undefined,
				center	: new iup.layout.Panel({
//					style : {border : '1px solid #ddd'},
					content : [cal]
				})
			})
		});
		
		var ok = new iup.Button({
			text		: 'OK',
			className	: 'action-button',
			//icon		: 'img/ic_add.png',
			visible		: cfg.showTime,
			handler		: function() {
				var date = record.get('date');
				if (selectedDate.getFullYear() !== date.getFullYear()
						|| selectedDate.getMonth() !== date.getMonth()) {
					iup.popup.Notification.notify({
						type	: 'error',
						message	: 'Date is not selected.'
					});
				} else {
					if (typeof onSelect === 'function') {
						onSelect(date.getTime());
					}
					win.hide();
				}
			}
		});
		
		var win = new iup.popup.Window({
			title 		: cfg.label || '',
			width 		: 270,
			height		: cfg.showTime ? 320 : 295,
			resizeModel : 'none',
			content		: form,
			bbar		: ['->', ok]
		});
		
		function loadDate(timestamp) {
			var date = new Date(timestamp);
			record.set('date', date);
			form.loadRecord(record);
			buildCal(date.getFullYear(), date.getMonth());
		}
		
		monthField.events.on('changed', function() {
			var date = record.get('date');
			buildCal(date.getFullYear(), date.getMonth());
		}); 
		
		yearField.events.on('changed', function() {
			var date = record.get('date');
			buildCal(date.getFullYear(), date.getMonth());
		}); 
		
		function buildCal(year, month) {
			var date = new Date(year, month + 1, 0);
			var daysCount = date.getDate();
			var lastDay = (date.getDay() + 1) % 7;
			var weekOverlap = daysCount % 7;
			var firstDay = (lastDay) - weekOverlap;  // + 1 if count from Sunday
			if (firstDay < 0) {firstDay += 7;}
			
			var html = [];
			html.push('<tr>');
			for (var i = 0; i < firstDay; i++) {
				html.push('<td></td>');
			}
			var selectedDay = 0;
			if (selectedDate.getMonth() === month && selectedDate.getFullYear() === year) {
				selectedDay = selectedDate.getDate();
			}
			
			var currentDay = 0;
			if (today.getMonth() === month && today.getFullYear() === year) {
				currentDay = today.getDate();
			}
			
			var weekDay = firstDay;
			var day = 1;
			while (day <= daysCount) {
				html.push('<td class="calendar-day' 
									+ (day === selectedDay ? ' selected-day' : '') 
									+ (day === currentDay ? ' today' : '') + '">' + day + '</td>');
				if ( ++weekDay === 7) {
					weekDay = 0;
					html.push('</tr>');
					if (day < daysCount) {
						html.push('<tr>');
					}
				}
				day++;
			}
			if (weekDay !== 0) {
				for (var i = lastDay + 1; i < 7; i++) {
					html.push('<td></td>');
				}
				
				html.push('</tr>');
			}
			
			tBody.innerHTML = html.join('');
		}
		
		this.show = function() {
			var val = dateField.getField().get();
			today = new Date();
			if (val) {
				selectedDate = new Date(val);
				loadDate(val);
			} else {
				selectedDate = new Date();
				if (!cfg.showTime) {
					selectedDate.setHours(0);
					selectedDate.setMinutes(0);
					selectedDate.setSeconds(0);
					selectedDate.setMilliseconds(0);
				}
				loadDate(selectedDate.getTime());
			}
			
			win.show();
			var input = dateField._getInput();
			var inputOffset = $(input).offset();
			inputOffset.top += $(input).outerHeight();
			$(win.getEl()).offset(inputOffset);
		};
	}
	
	var defaults = function(cfg) {
		return {
			showTime : false,
			regex : cfg. showTime ? /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/ : /^\d{2}\/\d{2}\/\d{4}$/,
			renderer : function(val) {
				return iup.utils.convertDate(val, cfg.showTime || false);
			},
			parser :  function(val, fieldValue) {
				return new Date(val).toISOString();
			}
		};
	};
	return {
		statics : {
			type : 'date'
		},
		defaults : defaults,
		prototype : {
			_buildEl : function(oCfg) {
			//console.log(oCfg);
				//var em = this._eventManager;
				var self = this;
				
				var wrapper = document.createElement('div');
				wrapper.style.position = 'relative';
				wrapper.style.width = oCfg.width ? oCfg.width + "px" : '100%';
				
				var input = document.createElement("input");
				input.type = 'text';
				input.className = "form-field";	
				input.style.width = '100%';
				
				input.style.paddingRight = '20px';
				
				
				var datePicker =  new DatePicker(this, function(val) {
					self._updateEl(input, typeof oCfg.renderer === 'function' ? oCfg.renderer(val) : val);
					self.events.fireEvent("changed", oCfg.parser(input.value, self.getField().get()), self.getField().getOriginalValue(), true);
				});
				
				this.events.on("changed", function(val, originalValue, bSilent) {
					self.getField().set(val, bSilent);
					self.validate();
				});
				
				input.onchange = function() {
					self.events.fireEvent("changed", oCfg.parser(input.value, self.getField().get()), self.getField().getOriginalValue(), true);
				};
				
				wrapper.appendChild(input);
				
				var button = document.createElement('div');
				button.className = 'datepicker-button';
				
				button.onclick = function() {
					datePicker.show();
				};
				
				wrapper.appendChild(button);
				
//				if (oCfg.readOnly) {
//					input.disabled = "disabled";
//					button.style.display = 'none';
//				}
				
				//return wrapper; 
				this._el = wrapper;
			}
		}/*, 
		_init : function() {
			
			//this._updateEl(input, typeof this.cfg.renderer === 'function' ? this.cfg.renderer(oThis.getField().get()) : this.getField().get());
		}*/
	};
	/*var oThis = this;
	var input;
	var button;
	
	var datePicker;*/

	/*
	this.disable = function() {
		input.disabled = "disabled";
		button.style.display = 'none';
	};
	
	this.enable = function() {
		input.disabled = "";
		button.style.display = 'block';
	};
	
	*/
}());
