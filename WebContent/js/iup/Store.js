if(typeof iup == "undefined"){
	iup = {};
}

if(typeof iup.data == "undefined"){
	iup.data = {};
}

iup.data.Store = function(oCfg){
	var cfg = {
		paginationManager : oCfg.paginationManager, 		// pagination parameters will be automatically included into load request
		url 		: oCfg.url,								
		method 		: oCfg.method || "POST",
		params 		: oCfg.params || {},					// parameters for ajax call
		handlers 	: oCfg.handlers || {},					// handlers can be added later using .on(); 
		fields 		: oCfg.fields || null,					// not implemented, restriction of incoming data, to keep only defined fields
		autoLoad 	: typeof oCfg.autoLoad == "undefined" ? (oCfg.url ? true : false) : oCfg.autoLoad, // load on creation
		data 		: oCfg.data,
		filter 		: oCfg.filter || function(){return true;}			// NOT IMPLEMENTED here will be kept filter if any will be applied 
	};
	
	var store = this;
	var data = [];
	var latestParameters = {};
	for (var key in oCfg.params) {
		latestParameters[key] = oCfg.params[key];
	}
	var sortOrder = null;
	
	var eventManager = new iup.EventManager({
		events : ["loadStarted", "load", "dataChanged", "recordChange", 
			"recordAdd", "recordDelete"// not implemented
		]
	});
	
	function setLevels(aRecords, level){ // if not already defined, sets levels of records to enable trees
		for(var i = 0; i < aRecords.length; i++){
			var record = aRecords[i];
			if ( typeof record.level == "undefined" ) {
				record.level = level;
			}
			if ( typeof record.get("children") != "undefined" && record.get("children").length > 0){
				setLevels(record.get("children"), level + 1);
			}
		}
	}
	
	function load(oParams){
		latestParameters = {};
		
		for (var key in cfg.params) {
			latestParameters[key] = cfg.params[key];
		}
		
		if (oParams) {
			for (var key in oParams) {
				latestParameters[key] = oParams[key];
			}
		}
		
		setPagingParams();
		
		performLoad(latestParameters);
	}
	
	function setPagingParams() {
		if (typeof cfg.paginationManager != "undefined") {
			if (sortOrder) {
				latestParameters.orderBy = sortOrder.name + ":" + sortOrder.direction;
			}
			if (cfg.paginationManager.getPageSize() > 0) {
				latestParameters.limit = cfg.paginationManager.getPageSize();
				latestParameters.offset = (cfg.paginationManager.getCurrentPage() - 1) * cfg.paginationManager.getPageSize();
			}
		}
	}
	
	this.reload = function() {
		performLoad(latestParameters);
	};
	
	function performLoad(params) {
		eventManager.fireEvent("loadStarted", data);
		$.ajax({
			type: cfg.method,
			url: cfg.url,
			dataType: 'json',
			traditional: true,
			contentType: 'application/json',
			data: params,
			success: function(aData,status,xhr) {
				var totalCount = xhr.getResponseHeader('Total-Count');
				if (totalCount && cfg.paginationManager) {
					cfg.paginationManager.setTotalCount(totalCount);
				}
				data = buildData( aData);
				if (!cfg.paginationManager && sortOrder) {
					sortLocally();
				} 
				
				eventManager.fireEvent("load", data, store);
				eventManager.fireEvent("dataChanged", data, store);
			},
			error: function(data){
				data = buildData([]);
				eventManager.fireEvent("load", [], store);
				eventManager.fireEvent("dataChanged", [], store);
			}
		});
	}
	
	this.loadData = function(aData) {
		//eventManager.fireEvent("loadStarted", data, store);
	
		data = buildData( aData);
		if (sortOrder) {
			sortLocally();
		}
		
		//setTimeout(function() {
			eventManager.fireEvent("load", data, store);
		//},2000);
		
		eventManager.fireEvent("dataChanged", data, store);
	};
	
	this.addRecord = function(record, idx) {
		if (idx) {
			data.splice(idx, 0, record);
		} else {
			data.push(record);
		}
		record.on('modify', function(rec, field){
			eventManager.fireEvent('recordChange', rec);
		});
		if (sortOrder) {
			sortLocally();
		} 
		eventManager.fireEvent("load", data, store);
		eventManager.fireEvent("dataChanged", data, store);
	};
	
	this.removeRecord = function(record) {
		var idx = data.indexOf(record);
		data.splice(idx, 1);
		
		eventManager.fireEvent("load", data, store);
		eventManager.fireEvent("dataChanged", data, store);
	};
	 
	function init(){
		for(var idx in cfg.handlers){
			eventManager.addHandler(idx, cfg.handlers[idx]);
		}
		if(cfg.autoLoad){
			load();
		} else if (typeof cfg.data != "undefined") {
			data = buildData(cfg.data);
		}
		
		if (cfg.paginationManager) {
			cfg.paginationManager.on("pageChanged", function() {
//				load();
				setPagingParams();
				performLoad(latestParameters);
			});
		}
	}
	
	function buildData( aData ){	// recursively builds util.Record for each element(and it's children) 
		if (typeof aData == "undefined" || aData == null ){
			return [];
		}

		var ret = [];
		if(cfg.fields == null && aData.length > 0){
			cfg.fields = [];
			for(var i in aData[0]){
				cfg.fields.push(i);
			}
		}
		
		for(var i = 0; i < aData.length; i++){
			var record = new iup.data.Record(aData[i], cfg.fields);
			if(typeof aData[i].children != "undefined"){
				
				record.addField("children", buildData(aData[i].children), true);
			}
			record.on('modify', function(rec, field){
				eventManager.fireEvent('recordChange', rec);
			});
			ret.push( record );
		}

		return ret;
	}
	
	this.getData = function(){
		return data;
	};
	
	this.getSortOrder = function () {
		return sortOrder;
	} ;
	
	this.on = function(eventName, handler){
		eventManager.addHandler(eventName, handler);
	};
	
	this.load = function(params, url){
		if (typeof url != "undefined" && url != null ) {
			cfg.url = url;
		}
		if (typeof params != "undefined" && params != null ) {
			load(params);
		} else {
			load();
		}
	};
	
	this.sort = function(oSortOrder) {
		sortOrder = oSortOrder;
		if (cfg.url && cfg.paginationManager) {
			setPagingParams();
			performLoad(latestParameters);
		} else {
			sortLocally();
			eventManager.fireEvent("load", data, store);
			eventManager.fireEvent("dataChanged", data, store);
		}
	};
	
	function sortLocally() {
		data.sort(function comparator(a, b) {
			var sort = sortOrder;
			a = a.get(sort.name);
			b =  b.get(sort.name);
			var ret = 0;
			if (a < b) {
				ret = -1;
			} else if (a > b){
				ret = 1;
			}
			return sort.direction === "asc" ? ret : -ret;
		});
	}
	
	this.setLevels = function(){
		setLevels(data, 1);
	};
	
	this.fireRecordChange = function(record){
		eventManager.fireEvent("recordChange", record);	
	};
	
		
	this.getPaginationManager = function() {
		return cfg.paginationManager;
	};
	
	init();
};

iup.data.Record = function(oRecord, aFields){
	var oThis = this;
	var record = {};
	var data = oRecord;
	this.fields = record;
	
	if (!aFields) {
		aFields = [];
		for (var key in oRecord) {
			aFields.push(key);
		}
	}
	
	for(var i = 0; i < aFields.length; i++ ){
		var field =  new iup.data.Field(aFields[i], oRecord[aFields[i]]);
		field.on("modify", function(f){eventManager.fireEvent("modify", oThis);});
		record[ aFields[i] ] = field;
	}
	
	this.get = function(fieldName){
		if( typeof record[fieldName] == "undefined" ) {
			return record[fieldName];
		}
		return record[fieldName].get();
	};
	this.getField = function(fieldName){
		return record[fieldName];
	};

	this.set = function(fieldName, value, silent){
		record[fieldName].set(value, silent);
	};
	
	this.addField = function(fieldName, value, silent){
		if (typeof record[fieldName] == "undefined"){
			var field =  new iup.data.Field(fieldName, value);
			field.on("modify", function(f){eventManager.fireEvent("modify", oThis);});
			record[fieldName] = field;
			if (!silent){
				eventManager.fireEvent("modify", oThis);
			}
		}
	};
	
	this.hasField = function(fieldName){
		return typeof record[fieldName] != "undefined" && record[fieldName] != null;
	};
	
	this.isDirty = function(fieldName){
		if(typeof fieldName == "undefined"){
			for(var key in record){
				if(record[key].isDirty()) {return true;}
			}
			return false;
		} else {
			return record[fieldName].isDirty();
		}
	};
	
	this.commit = function( name, silent ){	// if silent then it won't fire modified event
		if ( typeof name != "undefined" && name != null ) {
			record[name].commit(silent);
		} else {
			for(var key in record){
				record[key].commit(true);	// commits silently all fields to prevent multiple modify events
			}
			if ( !silent ){
				eventManager.fireEvent('modify', oThis);
			}
		}
	};
	
	this.rollback = function( name, silent ){	// if silent then it won't fire modified event
		for(var key in record){
			record[key].set(record[key].getOriginalValue(), true);	// sets silently all fields to prevent multiple modify events
			record[key].commit(true);
		}
		if ( !silent ){
			eventManager.fireEvent('modify', oThis);
		}
	};
	
	var eventManager = new iup.EventManager({
		events : ["modify"]	
	});
	
	this.on = function(eventName, handler){
		eventManager.addHandler(eventName, handler);
	};
	
	this.getData = function() {
		return data;
	};
	
	this.getValues = function () {
		var ret = {};
		for(var key in record){
			ret[key] = record[key].get();
		}
		return ret;
	};
};

iup.data.Field = function(sName, oValue){
	var name = sName;
	var value = oValue;
	var originalValue =  (value instanceof Array ) ? value.slice() : value;
	var dirty = false;
	
	this.set = function(oValue, bSilent){
		value = oValue;
		dirty = true;
		if ( !bSilent ){ eventManager.fireEvent("modify", this); }
	};
	
	this.get = function(){
		return value;
	};
	
	this.commit = function(bSilent){
		originalValue = (value instanceof Array ) ? value.slice() : value;
		dirty = false;
		if ( !bSilent ){ eventManager.fireEvent("modify", this); }
	};
	
	this.getOriginalValue = function(){ return originalValue; };
	
	this.getName = function(){return name;};
	
	this.isDirty = function(){return dirty;};
	
	var eventManager = new iup.EventManager({
		events : ["modify"]	
	});
	
	this.on = function(eventName, handler){
		eventManager.addHandler(eventName, handler);
	};
};

