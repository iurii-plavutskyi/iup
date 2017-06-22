'use strict';
iup.data = {};

iup.data.Store = function(oCfg){
	
    var cfg = iup.utils.merge(iup.data.Store.defaults, oCfg);/* {
        paginationManager : oCfg.paginationManager,         // pagination parameters will be automatically included into load request
        url          : oCfg.url,
        method       : oCfg.method || "POST",
        params       : oCfg.params || {},                    // parameters for ajax call
        handlers     : oCfg.handlers || {},                    // handlers can be added later using .on();
        fields       : oCfg.fields || null,                    // not implemented, restriction of incoming data, to keep only defined fields
        autoLoad     : typeof oCfg.autoLoad == "undefined" ? (oCfg.url ? true : false) : oCfg.autoLoad, // load on creation
        data         : oCfg.data,
        filter       : oCfg.filter || function(){return true;},            // NOT IMPLEMENTED here will be kept filter if any is applied
        root         : oCfg.root,
        model        : oCfg.model,
        requestMaker : oCfg.requestMaker || function (params) {return params;},
        totalCount   : oCfg.totalCount
    };*/

    if (cfg.entity) {
        cfg.fields = [];
        for (var i = 0, n = cfg.entity.fields.length; i < n; i++) {
            cfg.fields.push (cfg.entity.fields[i].name);
        } 
    }

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
            /*if (sortOrder) {
                latestParameters.orderBy = sortOrder.name + ":" + sortOrder.direction;
            }
            if (cfg.paginationManager.getPageSize() > 0) {
                latestParameters.limit = cfg.paginationManager.getPageSize();
                latestParameters.offset = (cfg.paginationManager.getCurrentPage() - 1) * cfg.paginationManager.getPageSize();
            }*/
            var paging = cfg.paginationManager.getPagingParameters();
            for (var key in paging) {
                latestParameters[key] = paging[key];
            }
            //latestParameters.pagingParameters = JSON.stringify(paging);
        }
    }

    this.reload = function() {
        performLoad(latestParameters);
    };
	
    function updateTotalCount (data) {
    	if (cfg.paginationManager && cfg.totalCount) {
            var totalCount;// = data.response.pagingInfo.recordSetTotal;
            if (cfg.totalCount.indexOf('.') > -1) {
	            var split = cfg.totalCount.split('.');
	            var root = data;
	            for (var i = 0; i < split.length - 1 ; i++) {
	                root = root[split[i]];
	            }
	            totalCount = root[split[split.length - 1]];
	        } else {
	        	totalCount = data[cfg.totalCount];
	        }
            cfg.paginationManager.setTotalCount(totalCount/* + 500*/);
        
        }
         
    }
    
    function performLoad(params) {
        eventManager.fireEvent("loadStarted", data);
        $.ajax({
            type: cfg.method,
            url: cfg.url,
        //    dataType: 'json',
            traditional: true,
        //    contentType: 'application/json',
            data: cfg.requestMaker(params),
            success: function(aData,status,xhr) {
            	if (aData.status === 'success') {
	            	updateTotalCount (aData);
	                
	                if (cfg.root) {
	                    var split = cfg.root.split('.');
	                    var val = aData;
	                    for (var i = 0; i < split.length; i++) {
	                        val = val[split[i]];
	                    }
	                    aData = val;
	                }
	                
	                if (typeof cfg.map === 'function' && aData) {
	            		aData = aData.map(cfg.map);
	            	}
	            	
	                data = buildData( aData);
	                if (!cfg.paginationManager && sortOrder) {
	                    sortLocally();
	                } 
	                
	                
            	} else {
            		data = buildData([]);
            		iup.popup.Notification.notify({
						title 		: 'Error', 
						message 	: (aData.response.errorText ? aData.response.errorText : aData.response).replace(/</g,'&lt;'), 
						type 		: 'error'
					});
            	}
            	eventManager.fireEvent("load", data, store);
                eventManager.fireEvent("dataChanged", data, store);
            },
            error: function(data){
                data = buildData([]);
                eventManager.fireEvent("load", [], store);
                eventManager.fireEvent("dataChanged", [], store);
                iup.popup.Notification.notify({
					title 		: 'Error', 
					message 	: data.replace(/</g,'&lt;'), 
					type 		: 'error'
				});
            }
        });
    }
    
    this.loadData = function(aData) {
        data = buildData(aData);
        if (sortOrder) {
            sortLocally();
        }
        
        eventManager.fireEvent("load", data, store);
        
        eventManager.fireEvent("dataChanged", data, store);
    };
    
    this.addRecord = function(record, idx, silent) {
        var alreadyAddedIdx = data.indexOf(record);

        if (alreadyAddedIdx < 0) {
        	if (! (record instanceof iup.data.Record)) {
        		record = new iup.data.Record(record, cfg.model);
        	}
            if (idx) {
                data.splice(idx, 0, record);
            } else {
                data.push(record);
            }
            record.on('modify', function(rec, field){
                eventManager.fireEvent('recordChange', rec);
                eventManager.fireEvent("dataChanged", data, store);
            });
            if (sortOrder) {
                sortLocally();
            } 
			if (!silent) {
				eventManager.fireEvent("load", data, store);
				eventManager.fireEvent("dataChanged", data, store);
			}
        }
    };
    
    this.removeRecord = function(record) {
        var idx = data.indexOf(record);
        data.splice(idx, 1);
        
        eventManager.fireEvent("load", data, store);
        eventManager.fireEvent("dataChanged", data, store);
    };
	
	this.clear = function(silent) {
        var idx = data.indexOf(record);
        data.splice(0, data.length);
		
        if (!silent) {
			eventManager.fireEvent("load", data, store);
			eventManager.fireEvent("dataChanged", data, store);
		}
    };
	
     
    function init(){
        for(var idx in cfg.handlers){
            eventManager.addHandler(idx, cfg.handlers[idx]);
        }
        if (cfg.autoLoad && cfg.url) {
            load();
        } else if (typeof cfg.data != "undefined") {
            data = buildData(cfg.data);
        }
        
        if (cfg.paginationManager) {
            cfg.paginationManager.events.on("pageChanged", function() {
                setPagingParams();
                performLoad(latestParameters);
            });
        }
    }
    
    function buildData(aData){    // recursively builds util.Record for each element(and it's children) 
        if (!aData){
            return [];
        }
        var ret = [];
        if(!cfg.model && aData.length > 0){
            cfg.model = {
                fields : []    
            };
            if (cfg.simpleData) {
            	 cfg.model.fields.push({name : 'element'});
            } else {
	            for(var i in aData[0]){
	                cfg.model.fields.push({name : i});
	            }
            }
        }
        
        for(var i = 0; i < aData.length; i++){
            var data = aData[i];
            if (cfg.simpleData) {
            	data = {element : data};
            }
            var record = new iup.data.Record(data, cfg.model);
            record.on('modify', function(rec, field) {
                eventManager.fireEvent('recordChange', rec);
                eventManager.fireEvent("dataChanged", data, store);
            });
            ret.push( record );
        }

        return ret;
    }
    
    this.getData = function(){
        return data;
    };
    
    this.getRawData = function() {
        var ret = [];
        for (var i = 0; i < data.length; i++) {
            ret.push(data[i].value());
        }
        return ret;
    };
    
    this.getSortOrder = function () {
        return cfg.paginationManager ? cfg.paginationManager.getSortOrder() : sortOrder;
    } ;
    
    this.on = function(eventName, handler){
        eventManager.addHandler(eventName, handler);
    };
    
    this.load = function(params, url){
        if (url ) {
            cfg.url = url;
        }
        if (params) {
            load(params);
        } else {
            load();
        }
    };
    
    this.sort = function(oSortOrder) {
        sortOrder = oSortOrder;
        if (cfg.url && cfg.paginationManager) {
            cfg.paginationManager.setSortOrder(oSortOrder);
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
           // console.log(sort);
            return sort.descending ? -ret : ret;
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
    
    this.isDirty = function() {
        for (var i = 0; i < data.length; i++) {
            if (data[i].isDirty()) {
                return true;
            }
        }
        return false;
    };
    
    this.get = function(idx) {
        return data[idx];
    };
    
    this.value = function(idx) {
        return this.getRawData();
    };
    
    this.events = eventManager;
    
    init();
};
iup.data.Store.defaults = {
	paginationManager : undefined,         // pagination parameters will be automatically included into load request
    url          : undefined,
    method       : "POST",
    params       : {},                    // parameters for ajax call
    handlers     : {},                    // handlers can be added later using .on();
    fields       : null,                    // not implemented, restriction of incoming data, to keep only defined fields
    autoLoad     : true, // load on creation
    data         : undefined,
    filter       : function(){return true;},            // NOT IMPLEMENTED here will be kept filter if any is applied
    root         : undefined,
    model        : undefined,
    requestMaker : function (params) {return params;},
    totalCount	 : undefined,
    simpleData	 : false,
    map			 : undefined
};

iup.data.Record = function(obj, model) {
    var self = this;
    var record = {};
//    var data = obj;
    if (! model.fields) {
        model = window[model];
    } 
    
    for (var i = 0; i < model.fields.length; i++ ) {
        var type = model.fields[i].type;
        var field;
        if (type == 'string' || type == 'number' || type == 'boolean' || type == 'decimal' || type == 'date' || model.fields[i].isEnum || type === undefined) {
            field = new iup.data.Field({
                name : model.fields[i].name,
                value : obj[model.fields[i].name]
            });
        } else if (model.fields[i].isArray) {
            field = new iup.data.StoreField({
                name : model.fields[i].name,
                value : obj[model.fields[i].name],
                type : type
            });
        } else {
            field = new iup.data.RecordField({
                name : model.fields[i].name,
                value : obj[model.fields[i].name],
                type : type
            });
        }
        
        field.on("modify", function(f){self.events.fireEvent("modify", self);});
        record[model.fields[i].name] = field;
    }
    
    this.events = new iup.EventManager({
        events : ["modify"]
    });
    
    this.on = function(eventName, handler) {
        this.events.on(eventName, handler);
    };
    this.commit = function (bSilent) {
        for(var key in record){
            record[key].commit(true);    // commits silently all fields to prevent multiple modify events
        }
        if ( !bSilent ) {
            self.events.fireEvent('modify', self);
        }
    };
    this.rollback = function (bSilent) {
        for (var key in record) {
            record[key].rollback(true);    // commits silently all fields to prevent multiple modify events
        }
        if ( !bSilent ) {
            self.events.fireEvent('modify', self);
        }
    };
    this.value = function () {
        var ret = {};
        for(var key in record){
            ret[key] = record[key].value();
        }
        return ret;
    };
    this.isDirty = function() {
        for(var key in record) {
            if(record[key].isDirty()) {return true;}
        }
        return false;
    };
    this.getFields = function() {return record;};
    this.get = function(key) {
        if (key.indexOf('.') > -1) {
            return findValue(this, key.split('.'));
        }
        
        return this.getField(key).get();
        
        function findValue(record, path, idx) {
            idx || (idx = 0);
            var keyName = path[idx];
            var field = record.getField(keyName);
            if (! field) {
            	throw 'Failed to retrieve field ' + keyName;
            }
            var val = field.get();//data[keyName];
            if (val === null || val === undefined) {
                return null;
            } 
            if (idx === path.length - 1) {
                return val;//.value();
            } 
            return findValue(val, path, ++idx);
        }
        
    };
    this.set = function(fieldName, value, bSilent) {
        this.getField(fieldName).set(value, bSilent);
    };
    
    this.getField = function(key) {
        if (record[key]) {
            return record[key];
        }
        
        if (key.indexOf('.') > -1) {
            var split = key.split('.');
            var rec = this;
            for (var i = 0; i < split.length - 1 ; i++) {
                rec = rec.getField(split[i]).get();
            }
            return rec.getField(split[split.length - 1]);
        }
        throw 'Field not present: ' + key;
    };
};

iup.utils.createComponent('iup.data.Field', undefined, 
{
    defaults : {
        name : undefined,
        value : undefined,
        type : undefined
    },
    events : ["modify"],
    prototype : {
        set : function(oValue, bSilent) {
            this._wrapValue(oValue);
            this._dirty = true;
            if (!bSilent) { this.events.fireEvent("modify", this); }
        },
        get : function() {
            return this._value;
        },
        value : function() {
            return this._value;
        },
        commit : function(bSilent) {
            this._originalValue = this.value();
            this._dirty = false;
            if (!bSilent) { this.events.fireEvent("modify", this); }
        },
        rollback : function (bSilent) {
            this._wrapValue(this._originalValue);
            this._dirty = false;
            if (!bSilent) { this.events.fireEvent("modify", this); }
        } ,
        getOriginalValue : function() { 
            return this._originalValue; 
        },
        getName : function() {
            return this._name;
        },
        isDirty : function() {
            return this._dirty;
        },
        on : function(eventName, handler) {
            this.events.on(eventName, handler);
        },
        _wrapValue : function (value) {
            this._value = value;
        }
    },
    _init : function() {
        var cfg = this.cfg;
        this._type = cfg.type;
        this._name = cfg.name;
        this._originalValue = Array.isArray(cfg.value) ? Array.from(cfg.value) : cfg.value;
        this._dirty = false;
        this._wrapValue(cfg.value);
    }
});

iup.utils.createComponent('iup.data.RecordField', iup.data.Field, 
{
    prototype : {
        value : function() {
            return this._value ? this._value.value() : undefined;
        },
        commit : function(bSilent) {
            this._originalValue = this.value();
            this._value.commit(bSilent);
        },
        rollback : function(bSilent) {
            this._value.rollback(bSilent);
        },
        _wrapValue : function (value) {
            var self = this;
            if (value) {
                this._value = new iup.data.Record(value, this._type);
                this._value.on('modify', function () {
                    self.events.fireEvent("modify");
                });
            } else {
                this._value = undefined;
            }
            
            
        },
        isDirty : function() {
            return this._value.isDirty();
        },
        get : function() {
            if (!this._value) {
                this._value = new iup.data.Record({}, this._type);
            }
            return this._value;
        }
    }
});

iup.utils.createComponent('iup.data.StoreField', iup.data.Field, 
{
    prototype : {
        value : function() {
            return this._value.getRawData();
        },
        commit : function(bSilent) {
            this._originalValue = this.value();
            this._dirty = false;
            
            var data = this._value.getData();
            for (var i = 0; i < data.legth; i++) {
                data[i].commit(true);
            }
            
            if (!bSilent) {
                this.events.fireEvent("modify");
            }
        },
        rollback : function(bSilent) {
		console.log(this._originalValue);
            this._value.loadData(this._originalValue);
            this._dirty = false;
            if (!bSilent) {
                this.events.fireEvent("modify");
            }
        },
        _wrapValue : function (value) {
            var self = this;
            this._value = new iup.data.Store({
                data : value || [],
                model : self._type,
                autoLoad : false
            });
            this._value.on('dataChanged', function () {
                self._dirty = true;
                self.events.fireEvent("modify");
            });
        },
        isDirty : function() {
            return this._dirty; 
        }
    }
});