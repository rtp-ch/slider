/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP jQuery Slider Toolbar Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// declare here for compiler
	var prefix = 'rtp-toolbar';

	// @@@ plugin: config @@@
	prototype.plugin('config', function ()
	{

		// default configuration
		this.conf = jQuery.extend
		(
			{

				navToolbar: false,

				// enable feature
				// toolbar: 'first, rewind, pause, stop, play, toggle-stop, toggle-pause, forward, last'
				navToolbarButtons: this.conf.carousel ?
					'rewind, toggle-stop, toggle-pause, forward' :
					'first, rewind, toggle-stop, toggle-pause, forward, last'

			},
			this.conf
		);

		// default configuration
		this.klass = jQuery.extend
		(
			{
				// navDot: prefix,
				// panelHidden: prefix + '-hidden',
				// panelPartial: prefix + '-partial',
				// panelVisible: prefix + '-visible'
			},
			this.klass
		);

		// default configuration
		this.tmpl = jQuery.extend
		(
			{
				navButtonWrapper: ['<a href="javascript:void(0);">', '</a>'],
				navButton: '<img src="img/rtp-toolbar-{type}.gif" width="12" height="12" alt="{title}"/>'
			},
			this.tmpl
		);
	});
	// @@@ EO plugin: config @@@

	// @@@ plugin: init @@@
	prototype.plugin('init', function ()
	{

		// create closure
		var self = this;

		self.buttons = {};

		function action (type)
		{

			switch (type)
			{

				case 'first':
					this.goFirst()
				break;
				case 'rewind':
					this.goPrev()
				break;
				case 'play':
					this.startAutoSlide();
				break;
				case 'pause':
					this.stopAutoSlide(true);
				break;
				case 'stop':
					this.stopAutoSlide(false);
				break;
				case 'toggle-pause':
					if (this.autosliding)
					{ this.stopAutoSlide(true); }
					else { this.startAutoSlide(); }
				break;
				case 'toggle-stop':
					if (this.autosliding !== null)
					{ this.stopAutoSlide(false); }
					else { this.startAutoSlide(); }
				break;
				case 'forward':
					this.goNext()
				break;
				case 'last':
					this.goLast()
				break;

			}

		}

		// activate autoslide
		if (self.conf.navToolbar)
		{

			var buttons = self.conf.navToolbarButtons.split(/\s*,\s*/), nodes = [];

			// create the wrapper around all nav dots
			var wrapper = jQuery('<div class="' + prefix + '">');

			for (var i = 0, l = buttons.length; i < l; i++)
			{
				var button = jQuery(
					'<span class="rtp-toolbar-' + buttons[i] + '">'
					+ self.tmpl.navButtonWrapper[0]
					+ self.tmpl.navButton
					   .replace(/{type}/g, buttons[i].replace('toggle-', ''))
				     .replace(/{title}/g, buttons[i])
					+ self.tmpl.navButtonWrapper[1]
					+ '</span>'
				).click(jQuery.proxy(action, self, buttons[i]));
				wrapper.append(self.buttons[buttons[i]] = button);
			}

			self.toolbarWrapper = wrapper;

			// append wrapper to the main slider wrapper
			self.toolbarWrapper.appendTo(self.wrapper);

		}
		// EO if conf.autoslide


	});
	// @@@ EO plugin: init @@@

	var togglers = [ 'stop', 'pause' ];

	function updateToggleButtons ()
	{

		var n = 0;

		var imgs = this.buttons['toggle-' + togglers[n]];

		imgs = imgs ? imgs.find('IMG') : [];

		var i = imgs.length; while (i--)
		{
			if (this.autosliding !== null)
			{
				imgs[i].src = imgs[i].src.replace('play', togglers[n]);
			}
			else
			{
				imgs[i].src = imgs[i].src.replace(togglers[n], 'play');
			}
		}

		n = 1;

		var imgs = this.buttons['toggle-' + togglers[n]];

		imgs = imgs ? imgs.find('IMG') : [];

		var i = imgs.length; while (i--)
		{
			if (this.autosliding)
			{
				imgs[i].src = imgs[i].src.replace('play', togglers[n]);
			}
			else
			{
				imgs[i].src = imgs[i].src.replace(togglers[n], 'play');
			}
		}


	}

	// @@@ plugin: autoslidePause @@@
	prototype.plugin('ready', updateToggleButtons);
	prototype.plugin('autoslideStop', updateToggleButtons);
	prototype.plugin('autoslideStart', updateToggleButtons);
	prototype.plugin('autoslidePause', updateToggleButtons);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
