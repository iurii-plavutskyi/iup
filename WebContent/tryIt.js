function SamplesPanel() {
	var localSamples = [];
	try {
		var db = new iup.db.Connector({
			name : 'iup',
			upgrade : function (db) {
				/*var objectStore = */db.createObjectStore("samples", { keyPath: "id", autoIncrement : true });
			},
			onconnect : function() {
				db.list('samples', function(items) {
					localSamples = items;
					for (var i = 0; i < items.length; i++) {
						var sample = items[i];
						addLocalSampleTab(sample);
					}
				});
				
				
			},
			version : 1
		});
	} catch (e) {
		console.log (e);
	}
	
	var stretchPanel = new iup.layout.StretchPanel({
		style: {border : '1px solid #ccc'/*, backgroundColor:'#fff', padding : '5px'*/},
		content : new iup.layout.Panel({
			//style: {border : '1px solid #090', backgroundColor:'#555', padding : '5px'},
			content	: [new iup.layout.Element({
				html : 'If sample on the right returns instance of iup.layout.Panel, it will be set here, once you execute the sample.'
			})]
		})
	});
	
	function createSampleTab(url) {
		var textArea = document.createElement('textarea');
		textArea.style.width = '100%';
		textArea.style.height = '100%';
		
		textArea.onkeydown = function(e) {
			var keyCode = e.keyCode || e.which;

			if (keyCode == 9) {
				e.preventDefault();
				var start = $(this).get(0).selectionStart;
				var end = $(this).get(0).selectionEnd;

				// set textarea value to: text before caret + tab + text after caret
				$(this).val($(this).val().substring(0, start)
							+ "    "
							+ $(this).val().substring(end));

				// put caret at right position again
				$(this).get(0).selectionStart = 
				$(this).get(0).selectionEnd = start + 4;
			}
		}
		
		if (url) {
			$.ajax({
				url: url,
				dataType :'text',
				success : function(data,b,c) {
					textArea.value = data;
				}
			})
		}
	
		return new iup.layout.Panel({
			style: {
				backgroundColor:'#aaa', 
				overflow:'hidden'
			},
			content : [textArea]
		});

	}
	
	var samples = new iup.layout.TabPanel({
		content : [
			{ title : 'Tabs', content : createSampleTab('samples/Tabs.js')},
			{ title : 'Grid', content : createSampleTab('samples/Grid.js')},
			{ title : 'Window', content : createSampleTab('samples/Window.js')},
			{ title : 'Form', content : createSampleTab('samples/Form.js')}
		]
	})
	
	var execute = new iup.Button({
		text:"EXECUTE", 
		className : 'button edit',
		handler : function() {
			var script = $(samples.disclosedItem.content.getEl()).find('textarea').val();
			
			if (samples.disclosedItem.id) {
				for (var i = 0; i < localSamples.length; i++) {
					var sample = localSamples[i];
					if (sample.id === samples.disclosedItem.id) {
						sample.content = script;
						db.put('samples', sample, function(id) {console.log('object saved; ID: ' + id)});
					}
				}
				
			}
			
			var exec;
			
			try{
				eval('exec = function() {' + script + '}');
			} catch (e) {
				console.log(e);
				iup.popup.Notification.notify({
					type : 'error',
					title : 'Excecution failed',
					message : e
				});
			}
			if (typeof exec === 'function') {
				var ret = exec();
				if (ret instanceof iup.layout.Panel) {
					stretchPanel.setContent(ret);
				}
			}
		}
	});
	
	function addLocalSampleTab(sample){
			var tab = createSampleTab();
			tab.cfg.content[0].value = sample.content;
			samples.addItem({
				id : sample.id,
				title:sample.title, 
				content : tab, 
				closable : true, 
				beforeclose: function(){
					db.remove('samples', sample.id, function() {
						localSamples.splice(localSamples.indexOf(sample), 1);
						console.log(localSamples);
					});
				} 
			});
		}
		
		var sampleTabName = new iup.form.Field({
			label : 'Tab name:',
			name : 'tabName',
			required : true
		});
		var tabNameWin = new iup.popup.Window({
			width : 300,
			height : 91,
			content : new iup.form.FieldSet({
				fields : [sampleTabName]
			}),
			bbar : [
				'->',
				new iup.Button ({
					text : 'OK',
					className : 'button edit',
					handler : function() {
						if (sampleTabName.validate()) {
							console.log(sampleTabName.getField().get());
							var newSample = {
								title : sampleTabName.getField().get(),
								content : ''
							} 
							db.put('samples', newSample, function(id) {
								//console.log(id, newSample);
								localSamples.push(newSample);
								addLocalSampleTab(newSample);
							});
							tabNameWin.hide();
						}
					}
				})
			]
		})
		
		
		var buttons = new iup.layout.Toolbar({
			style	: {/*backgroundColor:'#aaf', */padding : '5px'},
			marginBetweenItems : 5,
			content	: [
				execute,
				'->', 
				new iup.Button({
					text : "Add", 
					className : 'button edit',
					handler : function() {
						tabNameWin.show();
					}
				})
			]
		});

		var description = new iup.layout.HtmlPanel({
			//style : {width : '1000px'},
			html : "Try it <br/> test <b>test</b>",
			url : 'tryItHeader.html'
		})
		
		var borderPanel = new iup.layout.BorderPanel({
			layoutConfig : {top : 150, left : 500},
			splitter : ['top', 'left'],
			top 	: new iup.layout.ScrollPanel({
				style : {minWidth : '1000px'},
				scroll : iup.layout.ScrollPanel.SCROLL_BOTH,
				content : [description]
			}),
			left 	: new iup.layout.BorderPanel({
				layoutConfig : {
					bottom : 30
				},
				bottom : buttons,
				center : samples,//scrollPanel,//new iup.layout.Panel({style: {backgroundColor:'#aaa'}}),
			}),
			center	: new iup.layout.StretchPanel({
				style : {padding : '5px'}, 
				content : stretchPanel
			})
		});

		var border = new iup.layout.StretchPanel({
			style : {border : '1px solid #ccc'},
			content : borderPanel
		});
	
	this.getPanel = function () {return border;}
}