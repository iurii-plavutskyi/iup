iup.popup.Menu = function (oCfg) {
	var cfg = {
		content	: oCfg.content,
		anchor : oCfg.anchor instanceof iup.layout.Element ? oCfg.anchor.getEl() : oCfg.anchor,
		position : (oCfg.position || 'bottom-right').split('-')
	}
	this.cfg = cfg;
	
	var submenus = [];
	
	var self = this;
	var container;
	var shown = false;
	
	var activated = false;
	var parent = undefined;
	
	wrapContent();
	
	if (cfg.anchor) {
		cfg.anchor.onmouseover = function(event) {
			show();
			
		}
	} 
	if (cfg.anchor) {
		cfg.anchor.onclick = function(event) {
			activate(true);
			show();
			event.stopPropagation();
		}
	}
	function activate(firstLevel){
		if (firstLevel && parent) {
			parent.activate();
		}
		if (!parent){
			activated = !activated;
			if (activated) {
				document.body.addEventListener('click', mouseUp);
			} else {
				document.body.removeEventListener('click', mouseUp);
				hideSubmenus();
			}
		}
	}
	
	this.isActivated = function() {
		return activated || (parent && parent.isActivated());
	}
	
	function mouseUp(event) {
		activate();
	}
	function hideSubmenus() {
		for (var i = 0, n = submenus.length; i < n; i++) {
			var item = submenus[i].hide();
		}
	};
	
	function wrapContent() {
		container = iup.utils.createEl('div', {
			className : 'menu'
		});
		if (cfg.anchor) {
			container.style.display = 'none';
			container.style.position = 'absolute'; 
			container.style.border = '1px solid black';
		}
		for (var i = 0, n = cfg.content.length; i < n; i++) {
			var item = cfg.content[i];
			if (item instanceof iup.popup.Menu) {
				item.setParent(self);
				submenus.push(item);
				item.beforeShow = hideSubmenus;
				item = item.cfg.anchor;
				
			}
			if (item instanceof iup.layout.Element) {
				item = item.getEl();
			} else if (typeof item === "object" && "text" in item) {
				item = new iup.Button({text : item.text, handler : item.handler}).getEl();
			} else if (typeof item === "string") {
				item = iup.utils.createEl('span',{
					content : item
				})
			}
			container.appendChild(item);
		}
	}
	
	function setPosition() {
		var offset = $(cfg.anchor).offset();
		if (cfg.position[0] === 'top'){
			container.style.top = offset.top - $(container).outerHeight() + 'px';
		} else if (cfg.position[0] === 'bottom') {
			container.style.top = offset.top + $(cfg.anchor).outerHeight() + 'px';
		} else if (cfg.position[0] === 'left') {
			container.style.left = offset.left - $(container).outerWidth() + 'px';
		} else if (cfg.position[0] === 'right') {
			container.style.left = offset.left + $(cfg.anchor).outerWidth() + 'px';
		} 
		
		if (cfg.position[1] === 'right') {
			container.style.left = offset.left + 'px';
		} else if (cfg.position[1] === 'left') {
			container.style.left = offset.left + $(cfg.anchor).outerWidth() - $(container).outerWidth() + 'px';
		} else if (cfg.position[1] === 'bottom') {
			container.style.top = offset.top + 'px';
		} else if (cfg.position[1] === 'top') {
			container.style.top = offset.top  + $(cfg.anchor).outerHeight() - $(container).outerHeight() + 'px';
		} 
	}
	
	function show() {
		if (self.isActivated()) {
			if (!shown){
				if (typeof self.beforeShow == 'function') {self.beforeShow();}
				document.body.appendChild(container);
				
				container.style.display = 'block';
				
				setPosition();
				
				
				shown = true;
			}
		}
		console.log(self.isActivated(), shown);
	}
	
	function hide() {
		console.log(this.cfg);
		if (shown) {
			hideSubmenus();
			document.body.removeChild(container);
			//container = null;
			
			shown = false;
			console.log("hidden");
		}
		activate();
	}
	this.setParent = function(oParent) {
		parent = oParent;
	}
	this.activate = activate;
	
	this.hide = hide;
	
	this.getEl = function() {return container;};
}