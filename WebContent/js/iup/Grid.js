
iup.utils.createComponent("iup.layout.Grid", iup.layout.Panel, 
	function () {
		
		function getParentCell(myobj) {
			var curobj = myobj;
			while(curobj !== undefined && curobj != document.body)
			{
			   if( curobj.tagName.toLowerCase() == "td" || curobj.tagName.toLowerCase() == "th" ){
				   return curobj;
			   }
			   curobj = curobj.parentNode;
			}
			return null;
		}
		
		function getParentRow(myobj) {
			var curobj = myobj;
			while(curobj !== undefined && curobj != document.body)
			{
				
			   if( curobj.tagName.toLowerCase() == "tr" ){
				   return curobj;
			   }
			   curobj = curobj.parentNode;
			}
			return null;
		}
		
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
			
			var bodyMove = false;
			self._body.onmousedown = function(event){
				bodyMove = false;
				self._body.onmousemove = function(){
					bodyMove = true;
				};
			};
			self._body.onmouseup = function(event) {
				if (!bodyMove) {
			
					if (window.getSelection) { 
						window.getSelection().removeAllRanges();
					} else if (document.selection) {
						document.selection.empty();
					}
					
					var target = event.target || event.srcElement;
					if (! $(target).hasClass('grid-expander')){
						var cell = getParentCell(target);
						self.events.fireEvent('cellClick', cell, cell.column, cell.record);
												
						var row = getParentRow(cell);
						self.events.fireEvent('rowClick', row, row.record);
						
						var selectedRows = self._selectedRows;
						if (cfg.selectionModel != statics.SELECTION_NONE && row.record) {
							if (cfg.selectionModel == statics.SELECTION_SINGLE) {
								if (selectedRows.length === 0 || selectedRows[0] !== row) {
									selectRow.call(self,row);
								}
							} else if (cfg.selectionModel == statics.SELECTION_MULTI) {
								if (event.ctrlKey) {
									if($(row).hasClass("grid-selected-row")) {
										selectedRows.splice(selectedRows.indexOf(row), 1);
										$(row).removeClass("grid-selected-row");
									} else {
										$(row).addClass("grid-selected-row");
										selectedRows.push(row);
									}
								} else if (event.shiftKey) {
									
									if (selectedRows.length === 0) {
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
								
								self.events.fireEvent("select", selectedRows);	
							}
						}
					}
				
				}
			};

			self._body.ondblclick = function(event){
				var target = event.target ? event.target : event.srcElement;
				if (!$(target).hasClass('grid-expander')){
					var cell = getParentCell(target);
					self.events.fireEvent('cellDblClick', cell, cell.column, cell.record);
											
					var row = getParentRow(cell);
					self.events.fireEvent('rowDblClick', row, row.record);
				}
			};

			
			
//			self._header.onclick = function(event){
//				var target = event.target != null ? event.target : event.srcElement;
//				var cell = iup.utils.getParentCell(target);
//				if (!$(cell.parentNode).hasClass("scroll-header")){
//					self.events.fireEvent('headerClick', cell, cell.column);
//				}
//			}
			var headerMove = false;
			self._header.onmousedown = function(event){
				headerMove = false;
				self._header.onmousemove = function(){
					headerMove = true;
				};
			};
			self._header.onmouseup = function(event) {
				if (!headerMove) {
					var target = event.target ? event.target : event.srcElement;
					var cell = getParentCell(target);
					if (!$(cell.parentNode).hasClass("scroll-header")){
						self.events.fireEvent('headerClick', cell, cell.column);
					}
				}
				self._header.onmousemove = null;
			};
		}
		
		function buildSort(head) { 
			var sortContainer = document.createElement("div");
			sortContainer.style.cssFloat = "right";
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
			var data = cfg.store ? cfg.store.getData() : [];

			if (data.length > 0){
				var striped = false;
				//var index = 0;
				for(var rowIdx = 0; rowIdx < data.length; rowIdx++){
					var record = data[rowIdx];
					if (cfg.filter(record)) {
						var tr = _buildRow.apply(this, [record, rowIdx]);
						if (cfg.stripedRows && striped) {
							$(tr).addClass("striped-row");
						}
						striped = !striped;
						this._body.appendChild(tr);
					}
				}
			} else {
				if (!this._body.innerHTML) {
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
		function _buildRow(record, index){ 
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
				
				var rawValue = column.key ? record.get(column.key) : undefined;
				
				var value = typeof column.renderer == "function" 
							? column.renderer(rawValue, record, column, td, index) 
									: rawValue;
						
				var cell = _buildCell.apply(this, [value, className]);
				
				td.appendChild(cell);
				
				var dirty = false;
				if (column.key) {
					dirty = record.getField(column.key).isDirty();
					if (dirty) { $(td).addClass(' grid-dirty-value'); }
				}
				
				tr.appendChild(td);
			}
			return tr;
		}
		function setCellContent(cell, content) {
			if (Array.isArray(content)) {
				for (var i = 0, n = content.length; i < n; i++) {
					appendItem(content[i]);
				}
			} else {
				appendItem(content);
			}
			function appendItem(item){
				var el;
				if (item instanceof iup.layout.Element) {
					el = item.getEl();
				} else if (item instanceof HTMLElement) {
					el = item;
				} else {
					el = document.createElement("span");
					el.innerHTML = (typeof item === "undefined" || item === null) ? "" : item;
					//el = document.createTextNode();
				}
				cell.appendChild (el);
			}
		}
		
		function _buildCell(value, className, dirty) { 		//builds td/th contents
			var marginDiv = document.createElement("div");	
			$(marginDiv).addClass(className);
			
			setCellContent(marginDiv, value);
			return marginDiv;
		}
		function _buildHeader(){
			var cfg = this.cfg;
			var dragMaster = new iup.layout.Grid.ColumnModificationManager(this);
			
			var tr = document.createElement("tr");
			this._header.appendChild(tr);
			dragMaster.setHeaders(tr);

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
				dragMaster.makeDraggable(th);
			}
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
			var width = _calcWidth.apply(this);
			var headCols = this._headerColGroup.children;
			var bodyCols = this._bodyColGroup.children;
			$.each(cfg.columns, function(index, column) {
				headCols[index].style.width = column.calculatedWidth + 'px';
				bodyCols[index].style.width = column.calculatedWidth + 'px';
			});
			this._bodyTable.style.width = width + 'px';
			this._headerTable.style.width = width + 'px';
		}
		
		function _calcWidth() {	
			var cfg = this.cfg;
			$.each(cfg.columns, function(index, column) {		// set default width
				column.width || (column.width = cfg.defaultColumnWidth);
				column.calculatedWidth = column.width;
			});
			
			var width =$(this._styleEl).innerWidth()/*cfg.width*/ - (this._bodyWraper.scrollData.vScrollVisible ? iup.layout.ScrollPanel.SCROLLBAR_WIDTH : 0);	
			if (this.cfg.minWidth && width < this.cfg.minWidth) {
				width = this.cfg.minWidth;
			}// available space 
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
			return width;
		}
		
		function setPaginationBar() {
			$(this._footer).empty();
			var paginationManager = this.cfg.store ? this.cfg.store.getPaginationManager() : null;
			if (paginationManager && paginationManager.getPageSize() > 0) {
				var paginationBar = new iup.utils.PaginationBar({
					paginationManager : paginationManager
				});
				
				this._footer.appendChild(paginationBar.getEl());
				this._bodyWraper.getEl().style.bottom = 40 + "px";
				this._footer.style.display = 'block';
			} else {
				this._footer.style.display = 'none';
				this._bodyWraper.getEl().style.bottom = 0 + "px";
			}
		}
		
		function setStore(store) {
			var self = this;
			//if (this.cfg.store !== store) {	
				if (this.cfg.store) {
					//remove events
					this.cfg.store.events.removeHandler('loadStarted', loadStartHandler);
					this.cfg.store.events.removeHandler('load', loadHandler);
					this.cfg.store.events.removeHandler("recordChange", recordChangeHandler);
				}
				this.cfg.store = store;
				
				if (store) {
					store.on('loadStarted', loadStartHandler);
					store.on('load', loadHandler);
					store.on("recordChange", recordChangeHandler);
				}
			
			setPaginationBar.call(this);
				
		//	}
			//_buildBody.apply(this);
			
			function loadStartHandler() {
				self._bodyWraper.mask(true);
			}
			function loadHandler() {
				self._bodyWraper.mask(false);
				_buildBody.apply(self);
				updateSortInfo.call(self);
				self.doLayout();
			}
			function recordChangeHandler(record){
				//updateRow(record);
				_buildBody.apply(self);
				updateSortInfo.call(self);
				self.doLayout();
			}
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
			stripedRows				: true,
			minWidth				: undefined,
			id 						: undefined,
			menu					: []
		},
		events = ['sort', 'cellClick', 'rowClick', 'headerClick', 'cellDblClick', 'rowDblClick', 'select', 'rowactivate'],
		prototype = {
			_buildEl : function(cfg) {
				var self = this;
				this._headerColGroup = buildColGroup();
				
				this._header = iup.utils.createEl("thead", {
					style : {cursor : "default"}
				});
				
				this._headerTable = iup.utils.createEl("table", {
					style : {
						position : "relative", 
						tableLayout : 'fixed'
					}, 
					content : [this._headerColGroup, this._header]
				});
				
				var headerDiv = iup.utils.createEl("div", {
					className : 'grid-header-panel', 
					content:this._headerTable
				});
				
				this._bodyColGroup = buildColGroup();
				
				this._body = iup.utils.createEl("tbody");
				
				this._bodyTable = iup.utils.createEl("table", { 
					style : {tableLayout : 'fixed'},
					content : [this._bodyColGroup, this._body]
				});
				
				this._bodyWraper = new iup.layout.ScrollPanel({
					scroll : iup.layout.ScrollPanel.SCROLL_BOTH,
					maskClassName : 'busy-mask',
					content : [this._bodyTable]
				});
				this._bodyWraper.events.on('scroll', function(x,y,x1,y1) {
					if (x !== 0) {
						self._headerTable.style.left = -x1 + 'px';
					}
				});
				
				this._footer = iup.utils.createEl("div", {
					className : 'grid-footer-panel',
					style : {
						//display : 'none'
					}
				});
				
				var container = iup.utils.createEl("div", {
					className : "grid",
					content : [headerDiv, this._bodyWraper.getEl(), this._footer]
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
				
				/*    border : '1px solid ddd',
				    borderRadius : '0px 0px 0px 5px',
				    width : '20px',
				    height : '14px',
				    backgroundColor : '#fff',
				    zIndex : 10,
				    color : '#999',
				    fontSize : '12px',
				    textAlign : 'center'
			  	}*/
				
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
				
				var innerHeight = $(this._styleEl).innerHeight();
				
				var scrolled = this._bodyWraper.scrollData.vScrollVisible || false;
				
				_updateWidth.call(this);
				
				var headerHeight = $(this._header).outerHeight();
				this._bodyWraper.getEl().style.top = headerHeight + "px";
				
				var footerHeight = this.cfg.store 
							&& this.cfg.store.getPaginationManager() 
							&& this.cfg.store.getPaginationManager().getPageSize() > 0
						? 33
						: 0;
				this._bodyWraper.doLayout(width , innerHeight - headerHeight - footerHeight);
				
				var scrollStateChanged = scrolled !== this._bodyWraper.scrollData.vScrollVisible;
				if(scrollStateChanged) {
					_updateWidth.call(this);
					
					var updatedHeaderHeight = $(this._header).outerHeight();
					//if (updatedHeaderHeight !== headerHeight) {
						this._bodyWraper.getEl().style.top = updatedHeaderHeight + "px";
						this._bodyWraper.doLayout(width , innerHeight - updatedHeaderHeight - footerHeight);
					//}
				}
			},
			select : function(callback) {
				var self = this,
					cfg = this.cfg,
					el = this.getEl(),
					items = this._body.children;
				
				iup.layout.KeyboardNavigationManager.currentTarget = {
					target : this, parentCallback : callback, removeSelection : removeSelection
				}
					
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
					el.onkeyup/*onkeypress*/ = handler;
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
						removeSelection ();
						if (typeof callback == "function") {
							setTimeout(function() {
								callback();
							},5);
							
						}
					} else if (evt.keyCode === ENTER) {
						self.events.fireEvent('rowDblClick', marked, marked.record);
						self.events.fireEvent('rowactivate', marked, function(){init();});
						var fieldIdx = position.col + position.row * self.cfg.columns;
						
						removeSelection ();
					} else if (evt.altKey) {
						var key = evt.key;
						if (self.cfg.controls) {
							var action = self.cfg.controls[key];
							if (action) {
								if (action instanceof iup.Button) {
									action.cfg.handler();
								} else if (typeof action === "function") {
									action(function(){init();});
								}
							}
							evt.cancelBubble = true;
						}
					}
					
					
					var target;
					if (evt.keyCode === UP && position> 0) {
						step(-1);//position--;
					} else if (evt.keyCode === DOWN && position < items.length - 1) {
						step(1);//position++;
					}
					
					function step(inc) {
						position += inc;
						marked = items[position];
						selectRow.call(self,marked);
					}
					step(0);
					/*if (marked !== itemToMark) {
						$(marked).removeClass('field-marked');
						marked = itemToMark;
						$(marked).addClass('field-marked');
					}*/
					
					
				}
				
			},
			selectRecords : function(selected, additive) {
				var self = this;
				if (!additive) {
					$.each(self._selectedRows, function(idx, selection){
						$(selection).removeClass("grid-selected-row");
					});
					self._selectedRows.splice(0, self._selectedRows.length);
				}
				
				var rows = this._body.getElementsByTagName("tr");
				if (typeof selected == 'function') {
					for (var i = 0; i < rows.length; i++ ) {
						if (selected(rows[i].record)) {
							select(rows[i]);
						}
					}
				} else {
					for (var j = 0; j < selected.length; j++) {
						for (var i = 0; i < rows.length; i++ ) {
							if (rows[i].record === selected[j]) {
								select(rows[i]);
								break;
							}
						}
					}
				}
				
				self.events.fireEvent("select", self._selectedRows);
				
				function select(row) {

					if (! $(row).hasClass("grid-selected-row")) {
						$(row).addClass("grid-selected-row");
						self._selectedRows.push(row);
					}
					
				}
			},
			getSelectedRows : function() {
				return this._selectedRows;
			},
			setStore : function(store) {
				setStore.call(this, store);
			},
			getStore : function() {
				return this.cfg.store;
			},
			resizeColumn : function(columnIdx, modifier) {
				var cfg = this.cfg;
				changeColumnWidth(cfg.columns[columnIdx], modifier);
				changeColumnWidth(cfg.columns[columnIdx + 1], -modifier);
				_updateWidth.call(this);
				function changeColumnWidth(column, modifier) {
					if (column.fixed) {
						column.width += modifier;
					} else {
						column.width = 	column.width / column.calculatedWidth * (column.calculatedWidth + modifier);
					}
					column.calculatedWidth += modifier;
				}
			}, 
			moveColumn : function(columnIdx, moveTo) {
				var cfg = this.cfg;
				if (moveTo >= cfg.columns.length) {
					moveTo = cfg.columns.length - 1;
				}
				
				var head = this._header.children[0].children;
				if (moveTo > columnIdx) {
					$(head[columnIdx]).insertAfter(head[moveTo]);
					
					if (cfg.store.getData().length > 0) {
						$.each(this._body.children, function(rowIdx, row) {
							$(row.children[columnIdx]).insertAfter(row.children[moveTo]);
						});
					}
				} else if (moveTo < columnIdx) {
					$(head[columnIdx]).insertBefore(head[moveTo]);
					
					if (cfg.store.getData().length > 0) {
						$.each(this._body.children, function(rowIdx, row) {
							$(row.children[columnIdx]).insertBefore(row.children[moveTo]);
						});
					}
				}
				
				var column = cfg.columns[columnIdx];
				cfg.columns.splice(columnIdx,1);
				cfg.columns.splice(moveTo, 0, column);
				_updateWidth.call(this);
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
				var start = new Date().getTime();
				setStore.call(this, this.cfg.store);
				
				var id = self.cfg.id;
				if (id) {
					iup.db.userConfig.onload('grid_' + id, function (config) {
						applyColumnWidth(config);
					});
				}
				
				function applyColumnWidth(config) {
					var columns = self.cfg.columns;
					for (var i = 0, n = columns.length; i < n; i++) {
						var col = columns[i], key = col.id || col.key;
						config[key] && (col.width = config[key]);
					} 
					_updateWidth.call(self);
				} 
				/*if (!cfg.fixedColumns) {
					addColumnResizability();
				}*/
			}
		};
		
	}()
);

iup.layout.Grid.ColumnModificationManager = function (oGrid) {
	var resize = false;
	var resizeColumnIdx;
	var resizeOffset = 0;
 	var headers;
 	var headerPositions = [];
    var dragObject;
    var originalDragObject;
    var mouseOffset;
 	var grid = oGrid;
 	
 	var dragMaster = new iup.DragMaster({
 		mouseUp		: function() {
 			if (resize) {
	    		resize = false;
	    		if (grid.cfg.id) {
    				var gridColumns = grid.cfg.columns;
    				var cfg = {};
    				var col;
    				for (var i = 0, n = gridColumns.length; i < n; i++) {
    					col = gridColumns[i];
    					cfg[col.id || col.key] = col.width;
    				}
    				
    				iup.db.userConfig.put('config', {id : 'grid_' + grid.cfg.id, config : cfg});
	    		}
	    	} else {
	    		if (dragObject) {
			    	var columnPosition = 0;
			    	$.each(headers.children, function(idx, column) {
			    		if (column == originalDragObject) {
			    			columnPosition = idx;
			    		}
			    	});
			    	if (columnPosition > dragObject.position) {
			    		dragObject.position += 1;
			    	}
			    	if (columnPosition != dragObject.position) {
			    		grid.moveColumn(columnPosition, dragObject.position);
			    	}
			    	$(dragObject).remove();
			    	dragObject = null;
		    	}
		 		originalDragObject = null;
	    	}
 		},
 		mouseMove	: function (e) {
 			if (resize) {
		    	grid.resizeColumn(resizeColumnIdx, e.pageX - resizeOffset);
		    	resizeOffset = e.pageX;
	    	} else {
		        if (!dragObject) {
		        	dragObject = document.createElement('div'); 
		        	dragObject.className = "dragged-header";
		        	dragObject.style.width = (originalDragObject.column.calculatedWidth || originalDragObject.column.width) + 'px';
		        	for (var i = 0; i < originalDragObject.children.length; i++) {
		        		dragObject.appendChild(originalDragObject.children[i].cloneNode(true));
		        	}
//		        	dragObject = originalDragObject.cloneNode(true);
//		        	dragObject.style.zIndex = '999999';
		        	document.getElementsByTagName("body")[0].appendChild(dragObject);
		        }
		 
	        	dragObject.style.position = 'absolute';
	        	dragObject.style.top = e.pageY - mouseOffset.y + 'px';
	        	dragObject.style.left = e.pageX - mouseOffset.x + 'px';
		        	
		        calcColumnPosition(e);
	    	}
 		},
 		mouseDown	: function(e, element) {
 			calcHeaderPositions();
        
	      //  if (e.pageX < headerPositions[headerPositions.length - 1].left) { 
		        
		        mouseOffset = getMouseOffset(element, e);
		        
		        for (var i = 1; i < headerPositions.length; i++) {
		        	if ( Math.abs(headerPositions[i].left - e.pageX) < 5) {
		        		resizeColumnIdx = i - 1;
		        		resize = true;
		        		break;
		        	}
		        }
		        if (resize) {
		        	resizeOffset = e.pageX;
		        } else {
		        	originalDragObject = element;
		        }
		        
		        return true;
	     //   }
	        
	    //    return false;
 		}
 	});
 	
 	function getMouseOffset(target, e) {
        var docPos  = iup.DragMaster.getPosition(target);
        return {x:e.pageX - docPos.x, y:e.pageY - docPos.y};
    }
 	
 	function calcHeaderPositions() {
		headerPositions = [];
		$.each(headers.children, function(idx, header) {
			var offset = $(header).offset();
			headerPositions.push({
				top : offset.top,
				left : offset.left,
				width : $(header).width(),
				height : $(header).height()
			});
		});
	}   
	
	function calcColumnPosition(e) {
    	dragObject.position = -1;
    	
    	for(var i = 0; i < headers.children.length; i++) {
    		if (e.pageX < headerPositions[i].left + headerPositions[i].width/2) {
    			break;
    		} else {
    			dragObject.position = i;
    		}
    	} 
    }
    
    this.makeDraggable = function(element){
    	dragMaster.makeDraggable(element);
//        element.onmousedown = mouseDown;
    };
    
    this.setHeaders = function(aTr) {
    	headers = aTr;
    };
};