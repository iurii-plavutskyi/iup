if (typeof iup == "undefined") {
	iup = {};
}	
	
iup.EventManager = function(oCfg){
	var events = oCfg.events;
	
	for (var idx in events) {
		this[events[idx]] = [];
	} 

	this.addHandler = function(eventName, handler) {
		if (typeof this[eventName] != "undefined" && typeof handler == "function" ){
			this[eventName].push(handler);
		}
	};
	this.fireEvent = function(eventName, p1, p2, p3, p4){
		if(typeof this[eventName] != "undefined"){
			$.each(this[eventName], function(index, handler){
				handler(p1, p2, p3, p4);
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