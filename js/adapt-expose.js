define(function(require) {

	function toHyphenCase(str) {
		if (!str) return false;
		return str.replace(/([A-Z])/g, "-$1").toLowerCase();
	}

	var ComponentView = require('coreViews/componentView');
	var Adapt = require('coreJS/adapt');

	var Expose = ComponentView.extend({
		events: {
			"click .expose-item-cover": "toggleItem",
			"click .expose-item-content": "toggleItem",
			"click .expose-item-button": "toggleItem"
		},

		onDeviceResize: function() {
			this.setupColumns();
			this.setEqualHeights();
		},

		preRender: function() {
			this.animationType = toHyphenCase(this.model.get("_animationType")) || "fade";
		},

		postRender: function() {
			this.$(".expose-item").children().addClass(this.animationType);
			this.setupColumns();
			this.setupEventListeners();
			this.$(".expose-item-img").imageready(_.bind(this.onImageReady, this));
		},
		
		onImageReady: function() {
			this.setEqualHeights();
			this.setReadyStatus();
		},

		setupColumns: function() {
			if (this.model.get("_columns") && $(window).width() > 760) {
				var w = 100 / this.model.get("_columns") + "%";
				this.$(".expose-items").addClass("expose-columns");
				this.$(".expose-item").width(w).addClass("expose-column");
			} else {
				this.$(".expose-items").removeClass("expose-columns");
				this.$(".expose-item").width("auto").removeClass("expose-column");
			}
		},

		setEqualHeights: function () {
			if (this.model.get("_equalHeights") === false) return;
			var $contentElements = this.$(".expose-item-content");
			$contentElements.height('auto'); 
			var hMax = 0;
			_.each($contentElements, function(el) {
				var h = $(el).outerHeight();
				if (h > hMax) hMax = h;
			});
			$contentElements.height(hMax);
		},
		
		setupEventListeners: function() {
			this.listenTo(Adapt, {'device:resize': this.onDeviceResize});
		},

		toggleItem: function(e) {
			if (e.target.tagName === "A") return;
			var $parent = $(e.currentTarget).parent();
			var $cover = $parent.children(".expose-item-cover");
			$cover.toggleClass(this.animationType);
			if (!$cover.is(".visited")) {
				$cover.addClass("visited");
				var i = $cover.parents(".expose-item").index();
				this.model.get("_items")[i]._isVisited = true;
				this.evaluateCompletion();
			}
		},

		evaluateCompletion: function() {
			var incompleteItems = _.filter(this.model.get("_items"), function(item) {
				return !item._isVisited;
			});
			!incompleteItems.length && this.onComplete();
		},

		onComplete: function() {
			this.setCompletionStatus();

		}

	});

	Adapt.register('expose', Expose);

	return Expose;

});
