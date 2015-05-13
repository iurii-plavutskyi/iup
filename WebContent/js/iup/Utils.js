if(typeof iup == "undefined") {
	iup = {};
}

if(typeof iup.utils == "undefined") {
	iup.utils = {};
}

function extend(Child, Parent) {
	var F = function() { };
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
}

iup.utils.createComponent = function(name, parent, oCfg) {
	function merge (defaults, config) {
		var ret = {};
		for (var key in defaults) {
			ret[key] = defaults[key];
		}
		for (var key in config) {
			var val = config[key];
			if (typeof val === 'object' && typeof ret[key] === 'object' && !Array.isArray(val)) {
				ret[key] = merge(ret[key], val);
			} else {
				ret[key] = config[key];
			}
		}
		return ret;
	}
	
	var cfg = {
		constants 	: oCfg.constants || {},
		defaults	: oCfg.defaults || {},
		prototype 	: oCfg.prototype || {},
		construct 	: oCfg.construct,
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
			this.cfg = merge(cfg.defaults, oCfg);
			if (pack[className].superclass) {
				pack[className].superclass.constructor.call(this, this.cfg);
			}
			
			if (cfg.events) {
				this.events = new iup.EventManager({
					events : cfg.events
				});
			}
			
			if (typeof cfg._init == 'function') {
				cfg._init.call(this);
			}
		};
	}
	for (var key in cfg.constants) {
		type[key] = cfg.constants[key];
	}
	
	if (parent) {
		extend(type, parent);
	}
	
	for (var key in cfg.prototype) {
		type.prototype[key] = cfg.prototype[key];
	}

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
}

iup.utils.isChildOf = function(myobj,ContainerObj) {	// also true if myobj == containerObj 
	var curobj = myobj;
	while(curobj != undefined && curobj != document.body)
	{
	   if(curobj == ContainerObj){
		   return true;
	   }
	   curobj = curobj.parentNode;
	}
	return false;
};

iup.utils.getParentCell = function(myobj)
{
	var curobj = myobj;
	while(curobj != undefined && curobj != document.body)
	{
	   if( curobj.tagName.toLowerCase() == "td" || curobj.tagName.toLowerCase() == "th" ){
		   return curobj;
	   }
	   curobj = curobj.parentNode;
	}
	return null;
};

iup.utils.getParentRow = function(myobj) {
	var curobj = myobj;
	while(curobj != undefined && curobj != document.body)
	{
		
	   if( curobj.tagName.toLowerCase() == "tr" ){
		   return curobj;
	   }
	   curobj = curobj.parentNode;
	}
	return null;
};

iup.utils.appendStyle = function(element, obj) {
	var el = $(element);
	for (key in obj) {
		//element.style[key] = obj[key];
		el.css(key, obj[key]);
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
	correctNumber = function(number) {
		return (number <= 9) ? '0'+number : number;
	};

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

iup.utils.createEl = function(oCfg) {
	var cfg = {
		tag : oCfg.tag,
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