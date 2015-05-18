
iup.utils.createComponent("iup.layout.Grid", iup.layout.Panel, 
	function () {
		function _buildBody() {
			var cfg = this.cfg;
			$(this._body).empty();
			var data = cfg.store.getData();

			if (data.length > 0){
				var striped = false;
				for(var rowIdx = 0; rowIdx < data.length; rowIdx++){
					var record = data[rowIdx];
					if (cfg.filter(record)) {
						var tr = _buildRow.apply(this, [record] );
						if (cfg.stripedRows && striped) {
							$(tr).addClass("striped-row");
						}
						striped = !striped;
						this._body.appendChild(tr);
					}
				};
			} else {
				if (this._body.innerHTML == "") {
					var trHtml = "<tr>" +
							"<td colspan='" + cfg.columns.length + "' >" + 
								"<div style='minHeight:17px;' >" +
									(cfg.emptyText || "&nbsp;") +
								"</div>" +
							"</td>" +
						"</tr>";
					$(this._body).html(trHtml);
				}
			}
		}
		function _buildRow(record ){ 
			var cfg = this.cfg;
			var tr = document.createElement("tr");
			if (cfg.selectionModel != iup.layout.Grid.SELECTION_NONE) {
				$(tr).addClass("selectable");
			}
			tr.record = record;
	
			for (var i = 0; i < cfg.columns.length; i++){
				var column = cfg.columns[i];
				var td = document.createElement("td");
				td.type = "cell";
				td.column = column;
				td.record = record;
				$(td).addClass("grid-td");
				
				var className = "grid-cell";
							
				var value = typeof column.renderer == "function" 
							? column.renderer(record.get(column.key), record, column, td) 
									: record.get(column.key);
						
				var dirty = record.hasField(column.key) && record.isDirty(column.key);
				var cell = _buildCell.apply(this, [value, className]);
				
				td.appendChild(cell);
				if (dirty) { $(td).addClass(' grid-dirty-value'); }
				tr.appendChild(td);
			};
			return tr;
		}
		function _buildCell(value, className, dirty) { 		//builds td/th contents
			var val = (typeof value == "undefined" || value == null) ? "" : value;
			
			var marginDiv = document.createElement("div");	
			$(marginDiv).addClass(className);
	
			marginDiv.innerHTML = val;
			return marginDiv;
		}
		function _buildHeader(){
			var cfg = this.cfg;
			var tr = document.createElement("tr");
			this._header.appendChild(tr);

			for( var i = 0; i < cfg.columns.length; i++){
				var column = cfg.columns[i];
				var th = document.createElement("th");
				th.type = "header";
				th.column = column;
				th.className = "grid-th";
				
				var className = "grid-header";
				
				var cell = _buildCell.apply(this, [column.header, className]);

				th.appendChild(cell);
				tr.appendChild(th);
			};
		}
		
		function _updateWidth(width) {
			var cfg = this.cfg;
			_calcWidth.apply(this);
			var headCols = this._headerColGroup.children;
			var bodyCols = this._bodyColGroup.children;
			$.each(cfg.columns, function(index, column) {
				headCols[index].style.width = column.calculatedWidth + 'px';
				bodyCols[index].style.width = column.calculatedWidth + 'px';
			});
			
		}
		function _calcWidth() {	
			var cfg = this.cfg;
			$.each(cfg.columns, function(index, column) {		// set default width
				column.width || (column.width = cfg.defaultColumnWidth);
				column.calculatedWidth = column.width;
			});
			
			var width = cfg.width;			 	// available space 
			var resizableColumnsWidth = 0;		// summary width of not fixed columns 
			var fixedWidth = 0;					// summary width of fixed columns to calculate what space can be separated between resizable columns
			var allocatedWidth = 0;				// summary recalculated width of not fixed column (is used to set last column's width to ensure that summary width of all columns will be equall to all available space)
			
			$.each(cfg.columns, function(index, column) {
				if(column.fixed){
					fixedWidth += column.width;
				} else {
					resizableColumnsWidth += column.width;
				}
			});
			
			var lastResizableColumn;
			
			$.each(cfg.columns, function(index, column) {
				if (!column.fixed){
					column.calculatedWidth = Math.round(column.width / resizableColumnsWidth * (width - fixedWidth));
					allocatedWidth += column.calculatedWidth;
					lastResizableColumn = column;
				}
			});
			
			lastResizableColumn.calculatedWidth = width - fixedWidth - allocatedWidth + lastResizableColumn.calculatedWidth;
		}

		var constants = {
			SELECTION_NONE : "none",
			SELECTION_SINGLE : "single",
			SELECTION_MULTI : "multi"
		}, 
		defaults = {
			store					: undefined,					// REQUIRED iup.data.Store 
			columns 				: undefined,					// REQUIRED [{header:"REQUIRED",key : "REQUIRED", width : num, fixed : bool, renderer : function(value, record, column, td), root:bool, rootLevel : num (REQUIRED if root == true) }...]		
			fixedColumns			: undefined,					// disables column resizing and reordering 
			handlers				: {},							// event handlers: sort(column, "asc/desc"); cellClick(td, column, record) rowClick(tr, record) headerClick(th, column) cellDblClick(td, column, record) rowDblClick(tr, record)
			emptyText				: undefined,					// text to display in case there's no data
			selectionModel			: constants.SELECTION_NONE,		// "none", "single", "multi"
			defaultColumnWidth		: 100,							// if you don't specify width for column -> it will be set to 100
			scrollWidth				: 10,							// space left for scroll
			resizeColumnAreaWidth	: 3,							// width of the area(that allows column resizing) on the left and right side of the column header 
			filter					: function() {return true;},
			style					: undefined,
			stripedRows				: true
		},
		events = ['sort', 'cellClick', 'rowClick', 'headerClick', 'cellDblClick', 'rowDblClick', 'select'],
		prototype = {
			_buildEl : function(cfg) {
				this._headerColGroup = buildColGroup();
				
				this._header = iup.utils.createEl({
					tag:"thead", 
					style : {cursor : "default"}
				});
				
				var headerTable = iup.utils.createEl({
					tag : "table", 
					style : {
						position : "relative", 
						tableLayout : 'fixed'
					}, 
					content : [this._headerColGroup, this._header]
				});
				
				var headerDiv = iup.utils.createEl({
					tag:"div", 
					className : 'grid-header-panel', 
					content:headerTable
				});
				
				this._bodyColGroup = buildColGroup();
				
				this._body = iup.utils.createEl({ 
					tag : "tbody"		
				});
				
				var bodyTable = iup.utils.createEl({ 
					tag : "table", 
					style : {tableLayout : 'fixed'},
					content : [this._bodyColGroup, this._body]
				});
				
				this._bodyWraper = new iup.layout.ScrollPanel({
					items : [bodyTable]
				});
				
				var container = iup.utils.createEl({
					tag : "div", 
					className : "grid",
					content : [headerDiv, this._bodyWraper.getEl()]
				});
				
				_buildHeader.apply(this);
				_buildBody.apply(this);
				function buildColGroup() {
					var columns = cfg.columns;
					var colGroup = document.createElement('colgroup');
					
					var len = columns.length;
					colGroup.setAttribute('span', len);
					
					for (var i = 0; i < len; i++) {
						var col = document.createElement('col');
						col.style.width = (columns[i].calculatedWidth || columns[i].width || cfg.defaultColumnWidth) + 'px';
						colGroup.appendChild(col);
					}
					return colGroup;
				}
				
				var wrapper = iup.utils.createEl({
					tag : "div", 
					style : {
						position : "relative"
					},
					content : [container]
				});
				
				this._el = wrapper;
				this._styleEl = container;
			},
			doLayout : function(width, height) {
				iup.layout.Grid.superclass.doLayout.call(this, width, height);
				
				this.cfg.width = width;
				_updateWidth.call(this, width);
				
				var headerHeight = $(this._header).outerHeight();
				this._bodyWraper.getEl().style.top = headerHeight + "px";
				
				this._bodyWraper.doLayout(width , height - headerHeight);
				
				if(this._bodyWraper.scrollData.vScrollVisible) {
					this.cfg.width = width - iup.layout.ScrollPanel.SCROLLBAR_WIDTH;
					_updateWidth.call(this, width - iup.layout.ScrollPanel.SCROLLBAR_WIDTH);
					
					var updatedHeaderHeight = $(this._header).outerHeight();
					if (updatedHeaderHeight !== headerHeight) {
						this._bodyWraper.getEl().style.top = updatedHeaderHeight + "px";
						this._bodyWraper.doLayout(width , height - updatedHeaderHeight);
					}
				}
			}
		};
		
		return {
			constants : constants, 
			defaults : defaults,
			prototype : prototype,
			events : events
		};
		
	}()
);