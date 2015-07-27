iup.utils.createComponent('iup.Button', iup.layout.Element, function(){
	function createInnerHtml(icon, text) {
		var style = 'background:url(' + icon + ');';
		if (icon && text) { 
			style += 'margin-right:5px;';
		}
		return (icon ? "<div class='button-icon' style='" + style + "'></div>" : "")
							+ "<span>" + (text || '') + "</span>";
	}
	return {
		defaults : {
			visible : true
		},
		prototype : {
			_buildEl : function(cfg) {
	
				var el = document.createElement("div");
				el.className = 'button-div';
				
				var content = document.createElement("button");
				//content.className = 'button-div';
				el.appendChild(content);
				if (cfg.disabled) {
					$(content).addClass('disabled').attr('disabled', 'disabled');
					content.innerHTML = createInnerHtml(cfg.disabledIcon || cfg.icon, this.cfg.text);
				} else {
					content.innerHTML = createInnerHtml(cfg.icon, this.cfg.text);
				}
				
				if (!cfg.visible) {
					content.style.display = "none";
				}
				
				this._el = el;//content;

				if (typeof cfg.handler === 'function') {
					this._getStyleEl().onclick = cfg.handler;		
				}
				this._styleEl = content;
			},
			enable : function() {
				var cfg = this.cfg;
				if (cfg.disabled) {
					$(this._getStyleEl()).removeClass('disabled').removeAttr('disabled');
					if (cfg.disabledIcon) {
						this._getStyleEl().innerHTML = this.createInnerHtml(cfg.icon);
					}
					cfg.disabled = false;
				} 
			},
			disable : function() {
				var cfg = this.cfg;
				if (!cfg.disabled) {
					$(this._getStyleEl()).addClass('disabled').attr('disabled', 'disabled');
					if (cfg.disabledIcon) {
						this._getStyleEl().innerHTML = this.createInnerHtml(cfg.disabledIcon);
					}
					cfg.disabled = true;
				}
			},
			setHandler : function(handler) {
				this.cfg.handler = handler;
				this.getEl().onclick = handler;
			}
		}
	}
}());
