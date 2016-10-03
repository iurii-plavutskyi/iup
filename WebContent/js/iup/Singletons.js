$(function(){
iup.popup.Notification = function() {
	function buildMessageDiv(message) {
        var messageDiv = document.createElement('div');
        var messageHeader = document.createElement('div');
        messageHeader.style.minHeight = '25px';
		messageHeader.style.overflow = 'hidden';
		var messageBody = new iup.layout.ScrollPanel({
			content : new iup.layout.Panel({
				content : new iup.form.Label({
					text : message.message || ''
				})
			})
		});
		messageBody.getEl().style.maxHeight = '200px';
		messageBody.hide();

        if (message.message) {
            var expandMessage = document.createElement('div');
            var img = document.createElement('img');
            img.setAttribute('src', 'img/notification/expand.png');
            expandMessage.appendChild(img);
            messageDiv.expanded = false;

            expandMessage.className = 'expandMessage';
            expandMessage.onclick = function (evt) {
                messageDiv.expanded = !messageDiv.expanded;
                img.setAttribute('src', messageDiv.expanded ? 'img/notification/collapse.png' : 'img/notification/expand.png');
              //  messageBody.style.display = messageDiv.expanded ? 'block' : 'none';
                messageBody.setVisible(messageDiv.expanded);
                if (messageDiv.expanded) {
                	messageBody.doLayout();
                }
                scrollPanel.doLayout();
            };
            messageHeader.appendChild(expandMessage);
        }

        var messageTitle = document.createElement('div');
        switch (message.type) {
			case "info" : messageTitle.className = 'infoMessage'; break;
			case "warning" : messageTitle.className = 'warningMessage'; break;
			case "error" : messageTitle.className = 'errorMessage'; break;
			default : messageTitle.className = 'infoMessage'; break;
		}
        
        messageTitle.innerHTML = message.title;

        messageHeader.appendChild(messageTitle);

        messageDiv.appendChild(messageHeader);
        messageDiv.appendChild(messageBody.getEl());
        return messageDiv;
    }
	
	function buildMessage(item) {
		var img ="";
			switch (item.type) {
				case "info" : img = "img/notification/info.png"; break;
				case "warning" : img = "img/notification/warning.png"; break;
				case "error" : img = "img/notification/error.png"; break;
				default : img = "img/notification/info.png"; break;
			}
			img = "<img src='" + img + "'/>";
		return "<div><table><tbody><tr>" +
					"<td>" + img + "</td>" +
					"<td style='color: #105285;font-size: 11px;font-weight: bold;margin-top: 2px;white-space: nowrap;'>"+ item.title + "</td>" +
				"</tr></tbody></table></div>" +
				"<div style='margin-top:5px;margin-bottom:5px;color:#333;text-align:center;'>" + item.message + "</div>";
	}
	
	var container = new iup.layout.Panel({
		
	});
	var scrollPanel = new iup.layout.ScrollPanel({
		content : container
	});
	
	var logWin = new iup.popup.Window({
		width : 400,
		height : 500,
		closable : true,
		content : scrollPanel
	});
	
	return {
		shown : false,
		items : [],
		logButton : new iup.Button({
			icon : 'img/iconList16r.png',
			style : {border : '0px', padding:'0px', marginTop : '3px', backgroundColor:'transparent'},
			handler : function () {
				logWin.show();
			}
		}),
		show	: function() {
			var oThis = this;
			oThis.shown = true;
			var item = this.items.shift();
			
			var div = iup.utils.createEl('div',{
				style : {
					display	: "none",
					position : "absolute",
					top : "20px",
					padding : "10px",
					zIndex	:  ++iup.popup.zIndex,
					backgroundColor : "#fff",
					border : "1px solid #BAC5DC",
					minWidth : "200px"
				}
			});
				
			div.innerHTML = buildMessage(item);
			
			document.getElementsByTagName("body")[0].appendChild (div);
			
			$(div).css('left', (window.innerWidth - $(div).width() ) / 2 + "px");
			
			$(div).fadeIn(1000);
			
			setTimeout(function(){
			  $(div).fadeOut(1000, function() {
			  	$(div).remove();
			  	if (oThis.items.length > 0) {
			  		oThis.show();
			  	} else {
			  		oThis.shown = false;
			  	}
			  });
			  
			}, 2000);
		},
		notify : function(oCfg) {
			this.items.push(oCfg);
		//	this.logMessages.push(oCfg);
			container.addItem(new iup.layout.Panel({content : buildMessageDiv(oCfg)}));
			if (!this.shown) {
				this.show();
			}
		},
		displayFixed : function(cfg) {
			var body = document.getElementsByTagName('body')[0];
			var placeHolder = iup.utils.createEl('div', {
				style : {
					position : 'fixed',
					top : cfg.top || 5 + 'px',
					right : cfg.right || 5 + 'px',
					zIndex : 999999
				},
				content : this.logButton.getEl()
			});
			body.appendChild(placeHolder);
		}
	};
}();
});

iup.layout.ViewPort = function (cfg) {
	var contentPlaceholder = new iup.layout.StretchPanel({
		style : {padding : '5px'},
		content : cfg.content || []
	});
	var innerPanel = contentPlaceholder;
	if (cfg.tBar) {
		innerPanel = new iup.layout.BorderPanel({
			layoutConfig : {top : 27},
			top : new iup.layout.Toolbar({
				style : {
					backgroundColor : '#333',
					paddingRight : '5px'
				},
				content : cfg.tBar
			}),
			center : contentPlaceholder
		});
	}
	
	var viewPort = new iup.layout.StretchPanel({
		style : {border : '1px solid #333'},
		content : innerPanel
	});

	iup.layout.ViewPort.setContent = function(content) {
		contentPlaceholder.setContent(content);
	};
	//console.log(iup.layout.ViewPort);
	iup.layout.ViewPort.getBody = function() {
		return contentPlaceholder.getEl();
	};

	var w = window,
	    d = document,
	    e = d.documentElement,
	    b = d.body || d.getElementsByTagName('body')[0];
	    
	//b.style.overflow = "hidden";
	b.appendChild(viewPort.getEl());
	
	window.onresize = function(event) {
		var x = w.innerWidth || e.clientWidth || b.clientWidth,
	    	y = w.innerHeight|| e.clientHeight|| b.clientHeight;
		viewPort.doLayout(x, y);
	};
	
	window.onkeyup = function (evt) {
		if (evt.keyCode === 13 && evt.altKey) {
			contentPlaceholder.cfg.content[0].select();
		}
	};
	
	window.onresize();
};
iup.layout.ViewPort.getBody = function() {return undefined;};

iup.db.userConfig = new iup.db.Connector({
	name : 'userConfig',
	upgrade : function (db) {
		db.createObjectStore("config", {keyPath: "id"});
	},
	onconnect : function() {
		iup.db.userConfig.list('config', function(items) {
			iup.db.userConfig.events.fireEvent('load', items);
			iup.db.userConfig.config = items;
		});
	},
	version : 1
});
iup.db.userConfig.onload = function(id, callback) {
	if (iup.db.userConfig.loaded) {
		peekConfig(iup.db.userConfig.config);
	} 
	iup.db.userConfig.events.on('load', peekConfig);
	
	function peekConfig(items) {
		
		for (var i = 0, n = items.length; i < n; i++) {
			if (items[i].id === id) {
				callback(items[i].config);
			}
		}
	}
};
iup.db.userConfig.events = new iup.EventManager({
    events : ["load"]
});
iup.layout.KeyboardNavigationManager = {
	currentTarget : undefined,//{target : undefined, parentCallback:undefined, removeSelection : undefined},
	takeSelection : function(component) {
		if (this.currentTarget) {
			//var callback = this.currentTarget.select;
			this.currentTarget.removeSelection();
			var parent = this.currentTarget;
			component.select(function () { 
				parent.target.select(parent.parentCallback);
			});
		}
	}
}
