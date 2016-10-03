

iup.utils.PaginationManager = function(oCfg) {
	
	var cfg = iup.utils.merge(iup.utils.PaginationManager.defaults, oCfg);
	
	var eventManager = new iup.EventManager({
		events : ["pageChanged", "totalCountChanged"]
	});
	
	if (typeof oCfg != "undefined") {
		cfg.pageSize = oCfg.pageSize || cfg.pageSize;
		if (typeof oCfg.paramsConverter == "function") {
			cfg.paramsConverter = oCfg.paramsConverter;
		}
	}
	
	this.setSortOrder = function(sortOrder) {
		cfg.sortOrder = sortOrder;
	};
	
	this.getSortOrder = function() {
		return cfg.sortOrder;
	};
	
	this.getPagingParameters = function() {
		return cfg.paramsConverter(cfg);
	};
	
	this.getPageCount = function () {
		return Math.ceil(cfg.totalCount / cfg.pageSize);
	};
	
	this.getCurrentPage = function () {
		return cfg.currentPage;
	};
	
	this.getTotalCount = function() {
		return cfg.totalCount;
	};
	
	this.getPageSize = function() {
		return cfg.pageSize;
	};
	
	this.setPageSize = function (val, bSilent) {
		cfg.currentPage = 1;
		cfg.pageSize = val;
		if (! bSilent) {
			eventManager.fireEvent("pageChanged", 1);
		}
	};
	
	this.setCurrentPage = function (val, bSilent) {
		cfg.currentPage = val;
		if (! bSilent) {
			eventManager.fireEvent("pageChanged", val);
		}
	};
	
	this.setTotalCount = function(val) {
		cfg.totalCount = val;
		eventManager.fireEvent("totalCountChanged", val);
	};
	
	/*this.on = function(eventName, handler) {
		eventManager.addHandler(eventName, handler);
	};*/
	this.events = eventManager;
};

iup.utils.PaginationManager.defaults = {
	pageSize : 20,
	//currentPage : 0,
	totalCount  : 0,
	currentPage : 1,
	filter : {},
	paramsConverter : function (config) {
		return {
			fetchStart : config.pageSize * (config.currentPage - 1), 
			fetchSize : config.pageSize,
			sortOrder : [config.sortOrder]
		};
	},
	sortOrder : undefined
};

iup.utils.PaginationBar = function(oCfg) {
	var cfg = iup.utils.merge(iup.utils.PaginationBar.defaults, oCfg);
	
	cfg.buttonsCount = cfg.buttonsNearCurrent * 2 + 1;
	
	this._buildEl = function() {
		var el = document.createElement("div");
		    el.className = "pagination-bar";
		    
	    var buttonsDiv = iup.utils.createEl("div", {
	    	style : {
	    		cssFloat : 'left',
		    	styleFloat : 'left',
		    	width : '100%',
		    	height : '100%',
		    	textAlign : "center"
	    	}
	    });
	    
	    el.appendChild(buttonsDiv);
	    
	    var relDiv = document.createElement("div");
	    el.appendChild(relDiv);
	    
	    relDiv.style.position = 'relative';
	    relDiv.style.cssFloat = 'right';
	    relDiv.style.styleFloat = 'right';
	    
	    var absDiv = document.createElement("div");
	    relDiv.appendChild(absDiv);
	    absDiv.style.position = 'absolute';
	    absDiv.style.right = '0px';
	    absDiv.style.top = '0px';
	    absDiv.style.width = '400px';
	    
	    var pageSizeL = new iup.form.Label({text : 'Page Size:', style : {cssFloat : 'right', styleFloat : 'right', marginRight: '20px'} });
	    var pageSize = new iup.form.NumberField({
	    	style 		: {cssFloat : 'right', styleFloat : 'right', marginRight: '20px'},
			name 		: 'pageSize',
			width		: 30,
			validator	: function(val) {return val > 0;},
			value		: cfg.paginationManager.getPageSize()
		});
	    var totalL = new iup.form.Label({text : 'Total Records:', style : {cssFloat : 'right', styleFloat : 'right', marginRight: '20px'} });
	    
	    var total = new iup.form.Label({
	    	style 		: {cssFloat : 'right', styleFloat : 'right', marginRight: '20px', minWidth : '50px'},
			//name 		: 'total',
			//readOnly	: true,
			//width		: cfg.fieldWidth,
			text		: cfg.paginationManager.getTotalCount()
		});
		
		absDiv.appendChild(total.getEl());
		absDiv.appendChild(totalL.getEl());
		absDiv.appendChild(pageSize.getEl());
		absDiv.appendChild(pageSizeL.getEl());
	    
		pageSize.events.on('changed', function(value) {
			if (pageSize.validate()) {
				cfg.paginationManager.setPageSize(value);
			}
		});
		
		cfg.paginationManager.events.on("totalCountChanged", function(val) {
	    	appendButtons(buttonsDiv);
	    	total.setText(cfg.paginationManager.getTotalCount());
	    });
	    
	    cfg.paginationManager.events.on("pageChanged", function() {
	    	appendButtons(buttonsDiv);
	    });
	    this._el = el;
	    //return el;
	};
	
	iup.utils.PaginationBar.superclass.constructor.call(this, oCfg);  
    
	this.doLayout = function (width, height) {
		var el = this.getEl();
		el.style.width = width + 'px';
		el.style.height = height + 'px';
	};
	
    function pageChangeHandler() {
    	cfg.paginationManager.setCurrentPage(this.page);
    }
    
	function appendButtons(buttonsDiv) {
    	$(buttonsDiv).empty();
    	
    	var pageCount = cfg.paginationManager.getPageCount();
		var currentPage = cfg.paginationManager.getCurrentPage();
	    
	    var firstButtonIndex = Math.max(1, Math.min(pageCount - cfg.buttonsCount + 1, currentPage - cfg.buttonsNearCurrent));
	    var lastButtonIndex = Math.min(pageCount, Math.max(cfg.buttonsCount, currentPage + cfg.buttonsNearCurrent)); 
	    var showGoToFirstPage = firstButtonIndex != 1;
	    var showGoToLastPage = lastButtonIndex != pageCount;
	    firstButtonIndex = firstButtonIndex + (showGoToFirstPage ? 1 : 0);
	    lastButtonIndex = lastButtonIndex - (showGoToLastPage ? 1 : 0);
	    var button;
	    
	    if (showGoToFirstPage) {
	    	button = document.createElement("button");
	    	button.className = "pag-button";
	    	button.innerHTML = '<span  class="glyphicon glyphicon-backward"></span>';
	    	button.page = 1;
	    	buttonsDiv.appendChild(button);
	    	button.onclick = pageChangeHandler;
	    }

	    if (firstButtonIndex != lastButtonIndex) {
		    for (var idx=firstButtonIndex; idx <= lastButtonIndex; idx++) {
		    	button = document.createElement("button");
		    	button.className = "pag-button";
		    	button.innerHTML = idx;
		    	button.page = idx;
		    	buttonsDiv.appendChild(button);
		    	button.onclick = pageChangeHandler;
		    	if (idx == currentPage) {
		    		button.disabled = "disabled";
		    		button.className += ' pag-button-active';
		    	}
		    }
	    }
	    
	    if (showGoToLastPage) {
	    	button = document.createElement("button");
	    	button.className = "pag-button";
	    	button.innerHTML = '<span  class="glyphicon glyphicon-forward"></span>';
	    	button.page = pageCount;
	    	buttonsDiv.appendChild(button);
	    	button.onclick = pageChangeHandler;
	    }
    }
};
iup.utils.PaginationBar.defaults = {
	paginationManager 	: undefined, 
	buttonsNearCurrent 	: 5,
	fieldWidth			: 40,
	labelWidth			: 100
};
extend(iup.utils.PaginationBar, iup.layout.Panel);