if (typeof iup == "undefined") {
	iup = {};
}

iup.Button = function(oCfg) {
	oCfg.visible = typeof oCfg.visible == "undefined" ? true : oCfg.visible; 
	
	iup.Button.superclass.constructor.call(this, oCfg);  
};

extend(iup.Button, iup.layout.Element);

iup.Button.prototype.createInnerHtml = function(icon) {
	return (icon ? "<div style='float:left; width : 16px; height : 16px; background:url(" + icon + ")'></div>" : "")
						+ "<span>" + this.cfg.text + "</span>";
};

iup.Button.prototype._buildEl = function(cfg) {
	var el = document.createElement("button");
	
	if (cfg.disabled) {
		$(el).addClass('disabled').attr('disabled', 'disabled');
		el.innerHTML = this.createInnerHtml(cfg.disabledIcon || cfg.icon);
	} else {
		el.innerHTML = this.createInnerHtml(cfg.icon);
	}
	
	if (!cfg.visible) {
		el.style.display = "none";
	}

	if (typeof cfg.handler === 'function') {
		el.onclick = cfg.handler;		
	}
	
	this._el = el;
};

iup.Button.prototype.enable = function() {
	var cfg = this.cfg;
	if (cfg.disabled) {
		$(this.getEl()).removeClass('disabled').removeAttr('disabled');
		if (cfg.disabledIcon) {
			this.getEl().innerHTML = this.createInnerHtml(cfg.icon);
		}
		cfg.disabled = false;
	} 
};

iup.Button.prototype.disable = function() {
	var cfg = this.cfg;
	if (!cfg.disabled) {
		$(this.getEl()).addClass('disabled').attr('disabled', 'disabled');
		if (cfg.disabledIcon) {
			this.getEl().innerHTML = this.createInnerHtml(cfg.disabledIcon);
		}
		cfg.disabled = true;
	}
};

iup.Button.prototype.setHandler = function(callback) {
	this.getEl().onclick = callback;
};