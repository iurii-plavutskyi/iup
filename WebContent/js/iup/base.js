var iup = {
	utils : {}
};

//if(typeof iup.utils == "undefined") {
//	iup.utils = {};
//}

function extend(Child, Parent) {
	var F = function() { };
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}

iup.utils.merge = function (defaults, config) {
	var ret = {};
	if (typeof defaults == "function") {
		defaults = defaults(config);
	}
	for (var key in defaults) {
		if (Array.isArray(defaults[key])) {
			ret[key] = [];
		} else {
			ret[key] = defaults[key];
		}
	}
	for (var key in config) {
		var val = config[key];
		if (typeof val === 'object' && typeof ret[key] === 'object' && !Array.isArray(val)) {
			if (Array.isArray(ret[key])) {
				ret[key] = [val];
			} else {
				ret[key] = iup.utils.merge(ret[key], val);
			}
		} else {
			ret[key] = config[key];
		}
	}
	return ret;
};
iup.utils.merge.info = {
	description : 'Helper function for merging properties',
	params : {
		defaults : 'default object',
		config : 'properties'	
	},
	result : 'new object containing properties of both objects'
};

iup.utils.createComponent = function(name, parent, oCfg) {
	
	var cfg = {
		statics 	: oCfg.statics || {},
		defaults	: oCfg.defaults || {},
		prototype 	: oCfg.prototype || {},
		construct 	: oCfg.construct,
		events 		: oCfg.events,
		_init 		: oCfg._init
	};
	var path =  name.split(".");
	var pack = buildPath(path);
	var className = path[path.length - 1];
	var type;
	if (typeof cfg.construct == 'function') {
		type = cfg.construct;
	} else {
		type = function (oCfg) {
			if (this.constructor === type) {
				checkConfig(oCfg, type);
			} 
			this.cfg = iup.utils.merge(type.defaults, oCfg, true);
			
			if (cfg.events) {
				this.events = new iup.EventManager({
					events : cfg.events
				});
				if (this.cfg.handlers) {
					for (var idx in this.cfg.handlers) {
						this.events.on(idx, this.cfg.handlers[idx]);
					}
				}
			}
			
			if (pack[className].superclass) {
				pack[className].superclass.constructor.call(this, this.cfg);
			}
			
			
			
			if (typeof cfg._init == 'function') {
				cfg._init.call(this);
			}
		};
	}
	type.defaults = cfg.defaults;
	for (var key in cfg.statics) {
		type[key] = cfg.statics[key];
	}
	
	if (parent) {
		extend(type, parent);
	}
	
	for (var key in cfg.prototype) {
		type.prototype[key] = cfg.prototype[key];
	}
	
	type.fullName = name;
	//console.log(name);
	pack[className] = type;
	
	function buildPath(aPath) {
		var root = window;
		for (var i = 0; i < aPath.length - 1; i++) {
			var pathEl = aPath[i];
			if (!root[pathEl]) {
				root[pathEl] = {};
			}
			root = root[pathEl];
		}
		return root;
	}
	function checkConfig(cfg, type) {
		var defaults = getDefaults (type);
		for (var key in cfg) {
			if (!(key in defaults)) {
				console.log("WARNING! Possible typo. There's no default '" + key + "' key in " + type.fullName);
			}
		}
	}
	function getDefaults (type) {
	 //   console.log(type.defaults)
		var ret = type.defaults;
		if (type.superclass) {
		  	return iup.utils.merge(ret, getDefaults(type.superclass.constructor))
		}
	    return ret;
	}
};

iup.utils.getResource = function(url, callback) {
	$.ajax({
		url: url,
		dataType :'text',
		success : function(data,b,c) {
			callback(data);
		}
	});	
};

iup.utils.isChildOf = function(myobj,ContainerObj) {	// also true if myobj == containerObj 
	var curobj = myobj;
	while(curobj !== undefined && curobj != document.body)
	{
	   if(curobj == ContainerObj){
		   return true;
	   }
	   curobj = curobj.parentNode;
	}
	return false;
};

iup.utils.appendStyle = function(element, obj) {
	//var el = $(element);
	for (var key in obj) {
		element.style[key] = obj[key];
		//el.css(key, obj[key]);
	}
};

iup.utils.convertDate = function(timestamp, showTime) {
	if (typeof showTime === 'undefined') {
		showTime = true;		
	}
	
	if (!timestamp) {
		return "";
	}
	
	Date.prototype.getMonthName = function() {
		var month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		return month[this.getMonth()];
	};
	function correctNumber(number) {
		return (number <= 9) ? '0'+number : number;
	}

	var date = new Date(timestamp),
		year = date.getFullYear(),
		month = correctNumber(date.getMonth() + 1),
		day = correctNumber(date.getDate()),
		hour = correctNumber(date.getHours()),
		minute = correctNumber(date.getMinutes()),
		second = correctNumber(date.getSeconds());

	return month + '/' + day + '/' + year + (showTime ? (' ' + hour + ':' + minute + ':' + second) : '');
};

iup.utils.format = function() {
    var str = arguments[0];
  		for (var i = 1; i < arguments.length; i++) {       
    	var reg = new RegExp("\\{" + (i - 1) + "\\}", "gm");             
    	str = str.replace(reg, arguments[i]);
  	}
  	return str;
};

iup.utils.clone = function (obj) {
	var ret = {};
	
	for (var key in obj) {
		ret[key] = obj[key];
	}
	
	return ret;
};

iup.utils.Profiler = {
	executions : {},
	start : function (actionName) {
		var executions = this.executions;
		if ( !executions[actionName]) {
			executions[actionName] = new iup.utils.Execution(); 
		}
		executions[actionName].start();
	},
	
	finish : function (actionName) {
		this.executions[actionName].finish();
	}
};

iup.utils.Execution = function () {
	this.callQuantity = 0;
	this.longestCall = 0;
	this.shortestCall = Number.MAX_VALUE;
	this.total = 0;
	this.calls = [];
	var startTime = 0;
	this.start = function() {
		startTime = Date.now();
	};
	this.finish = function() {
		var duration = Date.now() - startTime;
		this.total += duration;
		this.callQuantity++;
		this.longestCall = Math.max(this.longestCall, duration);
		this.shortestCall = Math.min(this.shortestCall, duration);
		this.calls.push(duration);
	};
};

iup.utils.createEl = function(tag, oCfg) {
	oCfg || (oCfg = {});
	var cfg = {
		tag : tag,
		style : oCfg.style || {},
		attributes : oCfg.attributes || {},
		className : oCfg.className,
		content : oCfg.content ? (Array.isArray(oCfg.content) ? oCfg.content : [oCfg.content]) : []
	};
	
	var el = document.createElement(cfg.tag);
	for (var key in cfg.style) {
		el.style[key] = cfg.style[key];
	}
	
	for (var key in cfg.attributes) {
		el.setAttribute(key, cfg.attributes[key]);
	}
	
	if (cfg.className) {
		el.className = cfg.className;
	}
	
	for (var i = 0; i < cfg.content.length; i++) {
		var item = cfg.content[i];
		if (item instanceof HTMLElement) {
			el.appendChild(item);
		} else {
			el.innerHTML = el.innerHTML + item;
		}
	}
	return el;
};

iup.EventManager = function(oCfg){
	var events = oCfg.events;
	
	for (var idx in events) {
		this[events[idx]] = [];
	} 

	this.addHandler = function(eventName, handler) {
		if (typeof this[eventName] != "undefined" && typeof handler == "function" ){
			this[eventName].push(handler);
			if (this[eventName].latest) {
				handler.apply(this, this[eventName].latest);
			}
		}
	};
	
	this.fireEvent = function (eventName, p1, p2, p3, p4) {
		
		if(typeof this[eventName] != "undefined"){
			var params = new Array(arguments.length - 1);
			for (var i = 1, n = arguments.length; i < n; i++ ) {
				params[i - 1] = arguments[i];
			}

			this[eventName].latest = params;

			$.each(this[eventName], function(index, handler){
				handler.apply(this, params);
			});
		}
	};
	
	this.addHandlers = function(oHandlers) { 
		for (var idx in oHandlers){
			this.addHandler(idx, oHandlers[idx]);
		}
	};
	this.removeHandler = function (eventName, handler) {
		var idx = this[eventName].indexOf(handler);
		if (idx > -1) {
			this[eventName].splice(idx,1);
		} 
	};
	this.on = this.addHandler;
};

