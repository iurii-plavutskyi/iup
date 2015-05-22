if (typeof iup == "undefined") {
	iup = {};
}

iup.Button = function(oCfg) {
	oCfg.visible = typeof oCfg.visible == "undefined" ? true : oCfg.visible; 
	
	iup.Button.superclass.constructor.call(this, oCfg);  
};

extend(iup.Button, iup.layout.Element);

iup.Button.prototype.createInnerHtml = function(icon) {
	return (icon ? "<div class='button-icon' style='background:url(" + icon + ")'></div>" : "")
						+ "<span>" + this.cfg.text + "</span>";
};

iup.Button.prototype._buildEl = function(cfg) {
	
	var el = document.createElement("div");
	//el.className = 'button-div';
	
	var content = document.createElement("div");
	content.className = 'button-div';
	el.appendChild(content);
	if (cfg.disabled) {
		$(content).addClass('disabled').attr('disabled', 'disabled');
		content.innerHTML = this.createInnerHtml(cfg.disabledIcon || cfg.icon);
	} else {
		content.innerHTML = this.createInnerHtml(cfg.icon);
	}
	
	if (!cfg.visible) {
		content.style.display = "none";
	}
	
	this._el = content;

	if (typeof cfg.handler === 'function') {
		this._getStyleEl().onclick = cfg.handler;		
	}
	//this._styleEl = content;
};

iup.Button.prototype.enable = function() {
	var cfg = this.cfg;
	if (cfg.disabled) {
		$(this._styleEl()).removeClass('disabled').removeAttr('disabled');
		if (cfg.disabledIcon) {
			this._styleEl().innerHTML = this.createInnerHtml(cfg.icon);
		}
		cfg.disabled = false;
	} 
};

iup.Button.prototype.disable = function() {
	var cfg = this.cfg;
	if (!cfg.disabled) {
		$(this._styleEl()).addClass('disabled').attr('disabled', 'disabled');
		if (cfg.disabledIcon) {
			this._styleEl().innerHTML = this.createInnerHtml(cfg.disabledIcon);
		}
		cfg.disabled = true;
	}
};

iup.Button.prototype.setHandler = function(callback) {
	this.getEl().onclick = callback;
};