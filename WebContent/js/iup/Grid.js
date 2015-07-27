
iup.utils.createComponent("iup.layout.Grid", iup.layout.Panel, 
	function () {
		function selectRow(row) {
			var selectedRows = this._selectedRows;
			if (this.cfg.selectionModel == statics.SELECTION_SINGLE) {
				$.each(selectedRows, function(idx, selection){
					$(selection).removeClass("grid-selected-row");
				});
				selectedRows.splice(0, selectedRows.length);
				$(row).addClass("grid-selected-row");
				selectedRows.push(row);
			}
		
			this.events.fireEvent("select", selectedRows);
		}
		function registerEvents(){
			var self = this,
				cfg = self.cfg;
			self._body.onclick = function(event){

				if (window.getSelection) { 
					window.getSelection().removeAllRanges();
				} else if (document.selection) {
					document.selection.empty();
				}
				
				var target = event.target || event.srcElement;
				if (! $(target).hasClass('grid-expander')){
					var cell = iup.utils.getParentCell(target);
					self.events.fireEvent('cellClick', cell, cell.column, cell.record);
											
					var row = iup.utils.getParentRow(cell);
					self.events.fireEvent('rowClick', row, row.record);
					
					var selectedRows = self._selectedRows;
					if (cfg.selectionModel != statics.SELECTION_NONE && row.record) {
						if (cfg.selectionModel == statics.SELECTION_SINGLE) {
							/*$.each(selectedRows, function(idx, selection){
								$(selection).removeClass("grid-selected-row");
							});
							selectedRows.splice(0, selectedRows.length);
							$(row).addClass("grid-selected-row");
							selectedRows.push(row);*/
							selectRow.call(self,row);
						}
						
						if (cfg.selectionModel == statics.SELECTION_MULTI) {
							if (event.ctrlKey) {
								if($(row).hasClass("grid-selected-row")) {
									selectedRows.splice(selectedRows.indexOf(row), 1);
									$(row).removeClass("grid-selected-row");
								} else {
									$(row).addClass("grid-selected-row");
									selectedRows.push(row);
								}
							} else if (event.shiftKey) {
								
								if (selectedRows.length == 0) {
									$(row).addClass("grid-selected-row");
									selectedRows.push(row);
								} else {
									if (selectedRows.length > 1) {
										for (var i = 1; i < selectedRows.length; i++) {
											$(selectedRows[i]).removeClass("grid-selected-row");
										}
										selectedRows.splice(1, selectedRows.length - 1);
									}
									var nextRow = selectedRows[0];
									if (nextRow != row) {
										var data = cfg.store.getData();
										var moveDown = data.indexOf(selectedRows[0].record) < data.indexOf(row.record);
										do {
											nextRow = moveDown ? nextRow.nextSibling : nextRow.previousSibling;
										
											$(nextRow).addClass("grid-selected-row");
											selectedRows.push(nextRow);
										} while (nextRow != row);
									}
								}
							} else {
								$.each(selectedRows, function(idx, selection){
									$(selection).removeClass("grid-selected-row");
								});
								selectedRows.splice(0, selectedRows.length);
								
								$(row).addClass("grid-selected-row");
								selectedRows.push(row);
							}
							
								
						}
					
						self.events.fireEvent("select", selectedRows);
					}
				}
				
				
			}

			self._body.ondblclick = function(event){
				var target = event.target != null ? event.target : event.srcElement;
				if (!$(target).hasClass('grid-expander')){
					var cell = iup.utils.getParentCell(target);
					self.events.fireEvent('cellDblClick', cell, cell.column, cell.record);
											
					var row = iup.utils.getParentRow(cell);
					self.events.fireEvent('rowDblClick', row, row.record);
				}
			}

			self._header.onclick = function(event){
				var target = event.target != null ? event.target : event.srcElement;
				var cell = iup.utils.getParentCell(target);
				if (!$(cell.parentNode).hasClass("scroll-header")){
					self.events.fireEvent('headerClick', 
											cell, 
											cell.column);
				}
			}
		}
		
		function buildSort(head) { 
			var sortContainer = document.createElement("div");
			sortContainer.style.float = "right";
			sortContainer.style.position = "relative";
			var sortDiv = document.createElement("div");
			$(sortDiv).addClass("sort");
			
			var sort = document.createElement("table");
			
			var tBody = document.createElement("thead");
			sort.appendChild(tBody);
			
			var tr = document.createElement("tr");
			tBody.appendChild(tr);
			
			var asc = document.createElement("th");
			tr.appendChild(asc);
			
			var desc = document.createElement("th");
			tr.appendChild(desc);
			
			$(asc).addClass("sort_asc_ena");
			$(desc).addClass("sort_desc_ena");
			
			
			sortDiv.appendChild(sort);
			sortContainer.appendChild(sortDiv);
			head.appendChild(sortContainer);
			
			head.sort = sortDiv;
			sortDiv.asc = asc;
			sortDiv.desc = desc;
			
			var self = this;
			asc.onclick = function(evt) {
				var sortName = head.column.sortName || head.column.key; 
				self.cfg.store.sort({name : sortName, descending : false});
				self.events.fireEvent("sort", sortName, "asc");
			};
			
			desc.onclick = function(evt) {
				var sortName = head.column.sortName || head.column.key; 
				self.cfg.store.sort({name : sortName, descending : true});
				self.events.fireEvent("sort", sortName, "desc");
			};
			
		}
	
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
				
				var rawValue = iup.utils.getValue(record, column.key);
				
				var value = typeof column.renderer == "function" 
							? column.renderer(rawValue, record, column, td) 
									: rawValue;
						
			//	var dirty = record.hasField(column.key) && record.isDirty(column.key);
				var cell = _buildCell.apply(this, [value, className]);
				
				td.appendChild(cell);
			//	if (dirty) { $(td).addClass(' grid-dirty-value'); }
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
				
				if (column.sortable) {
					buildSort.call(this, th);
				}
				
				var cell = _buildCell.apply(this, [column.header, className]);

				th.appendChild(cell);
				tr.appendChild(th);
			};
		}
		
		function updateSortInfo() {
			var sortOrder = this.cfg.store.getSortOrder();
			
			if (sortOrder) {
				if (typeof sortOrder != "undefined") {
					$.each(this._header.children[0].children, function(index, th) {
						if (th.column && th.column.sortable) {
							$(th.sort.asc).removeClass("sort_asc_selected");
							$(th.sort.desc).removeClass("sort_desc_selected");
							th.sort.style.display = "";
							var sortName = th.column.sortName || th.column.key;
							if (sortOrder.name == sortName) {
								th.sort.style.display = "block";
								if (sortOrder.descending) {
									$(th.sort.desc).addClass("sort_desc_selected");
								} else {
									$(th.sort.asc).addClass("sort_asc_selected");
								}
							}
						}
					});
				}
			}
		}
		
		function _updateWidth() {
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
			
			var width = cfg.width - (this._bodyWraper.scrollData.vScrollVisible ? iup.layout.ScrollPanel.SCROLLBAR_WIDTH : 0);			 	// available space 
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

		var statics = {
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
			selectionModel			: statics.SELECTION_NONE,		// "none", "single", "multi"
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
				
				this._header = iup.utils.createEl("thead", {
					style : {cursor : "default"}
				});
				
				var headerTable = iup.utils.createEl("table", {
					style : {
						position : "relative", 
						tableLayout : 'fixed'
					}, 
					content : [this._headerColGroup, this._header]
				});
				
				var headerDiv = iup.utils.createEl("div", {
					className : 'grid-header-panel', 
					content:headerTable
				});
				
				this._bodyColGroup = buildColGroup();
				
				this._body = iup.utils.createEl("tbody");
				
				var bodyTable = iup.utils.createEl("table", { 
					style : {tableLayout : 'fixed'},
					content : [this._bodyColGroup, this._body]
				});
				
				this._bodyWraper = new iup.layout.ScrollPanel({
					maskClassName : 'busy-mask',
					content : [bodyTable]
				});
				
				var container = iup.utils.createEl("div", {
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
				
				var wrapper = iup.utils.createEl("div", {
					style : {
						position : "relative"
					},
					content : [container]
				});
				
				this._el = wrapper;
				this._styleEl = container;
			},
			doLayout : function(width, height) {
				this.cfg.height = height || this.cfg.height;
				this.cfg.width = width || this.cfg.width;
				
				iup.layout.Grid.superclass.doLayout.call(this, this.cfg.width, this.cfg.height);
				
				var scrolled = this._bodyWraper.scrollData.vScrollVisible || false;
				
				_updateWidth.call(this);
				
				var headerHeight = $(this._header).outerHeight();
				this._bodyWraper.getEl().style.top = headerHeight + "px";
				
				this._bodyWraper.doLayout(width , height - headerHeight);
				
				var scrollStateChanged = scrolled !== this._bodyWraper.scrollData.vScrollVisible
				if(scrollStateChanged) {
					_updateWidth.call(this);
					
					var updatedHeaderHeight = $(this._header).outerHeight();
					if (updatedHeaderHeight !== headerHeight) {
						this._bodyWraper.getEl().style.top = updatedHeaderHeight + "px";
						this._bodyWraper.doLayout(width , height - updatedHeaderHeight);
					}
				}
			},
			select : function(callback) {
				var self = this,
					cfg = this.cfg,
					el = this.getEl(),
					items = this._body.children;
				
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
					el.onkeypress = handler;
					//$(marked).addClass('field-marked');
					selectRow.call(self,marked);
				}
				
				function removeSelection () {
					$(el).removeClass('panel-selected');
					el.removeAttribute('tabIndex');
					el.onkeypress = undefined;
					el.onblur = undefined;
					//$(marked).removeClass('field-marked');
				}

				var position = 0,
					marked = items[position];
				init();
				
				function handler(evt) {
					if (evt.keyCode === ESC) {
						removeSelection ()
						if (typeof callback == "function") {
							setTimeout(function() {
								callback();
							},5);
							
						}
					} else if (evt.keyCode === ENTER) {
						self.events.fireEvent('rowactivate', marked);
						var fieldIdx = position.col + position.row * self.cfg.columns;
						//console.log (fieldIdx);
						
						removeSelection ();
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
					
					
					var target;
					if (evt.keyCode === UP && position> 0) {
						position--;
					} else if (evt.keyCode === DOWN && position < items.length - 1) {
						position++;
					}
					
					marked = items[position];
					/*if (marked !== itemToMark) {
						$(marked).removeClass('field-marked');
						marked = itemToMark;
						$(marked).addClass('field-marked');
					}*/
					
					selectRow.call(self,marked);
				}
				
			},
			selectRecords : function(records, additive) {
				var self = this;
				if (!additive) {
					$.each(self._selectedRows, function(idx, selection){
						$(selection).removeClass("grid-selected-row");
					});
					self._selectedRows.splice(0, self._selectedRows.length);
				}
				
				var rows = this._body.getElementsByTagName("tr");
				for (var j = 0; j < records.length; j++) {
					for (var i = 0; i < rows.length; i++ ) {
						if (rows[i].record === records[j]) {
							var row = rows[i];
							if (! $(row).hasClass("grid-selected-row")) {
								$(row).addClass("grid-selected-row");
								self._selectedRows.push(row);
							}
							break;
						}
					}
				};
				
				self.events.fireEvent("select", self._selectedRows);
			},
			getSelectedRows : function() {
				return this._selectedRows;
			}
			
		};
		
		return {
			statics : statics, 
			defaults : defaults,
			prototype : prototype,
			events : events,
			_init : function() {
				var self = this;
				this._selectedRows = [];
				registerEvents.call(this);
				
				this.cfg.store.on('loadStarted', function() {
					self._bodyWraper.mask(true);
				});
				
				this.cfg.store.on('load', function() {
					self._bodyWraper.mask(false);
					_buildBody.apply(self);
					updateSortInfo.call(self);
					self.doLayout();
				});
				
				this.cfg.store.on("recordChange", function(record){
//					console.log(record);
					//updateRow(record);
					_buildBody.apply(self);
					updateSortInfo.call(self);
					self.doLayout();
				});
				
				/*if (!cfg.fixedColumns) {
					addColumnResizability();
				}*/
			}
		};
		
	}()
);