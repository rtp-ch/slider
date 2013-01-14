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

	// define all toggle buttons
	var toggler = {

		// define function to define if state is on
		stop : function () { return this.autosliding === null; },
		pause : function () { return this.autosliding !== true; }

	};

	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// enable feature
			navToolbar: false,

			// toolbar: 'first, rewind, pause, stop, play, toggle-stop, toggle-pause, forward, last'
			navToolbarButtons: this.conf.carousel ?
				'rewind, toggle-stop, toggle-pause, forward' :
				'first, rewind, toggle-stop, toggle-pause, forward, last',

			// add templates
			tmpl :
			{
				navButtonWrapper: ['<a href="javascript:void(0);">', '</a>'],
				navButton: '<img src="img/rtp-toolbar-{type}.gif" width="12" height="12" alt="{title}"/>'
			}

		});

	});
	// @@@ EO plugin: config @@@

	// @@@ plugin: init @@@
	prototype.plugin('init', function ()
	{

		// create closure
		var self = this;

		// store the buttons
		self.buttons = {};

		// function for the button actions
		function action (command)
		{

			switch (command)
			{

				// navigation commands
				case 'last': this.goLast(); break;
				case 'first': this.goFirst(); break;
				case 'rewind': this.goPrev(); break;
				case 'forward': this.goNext(); break;

				// auto slide show commands
				case 'play': this.startAutoSlide(); break;
				case 'stop': this.stopAutoSlide(false); break;
				case 'pause': this.stopAutoSlide(true); break;

				// toggle pause/play
				case 'toggle-pause':
					if (!toggler.pause.call(this))
					{ this.stopAutoSlide(true); }
					else { this.startAutoSlide(); }
				break;

				// toggle stop/play
				case 'toggle-stop':
					if (!toggler.stop.call(this))
					{ this.stopAutoSlide(false); }
					else { this.startAutoSlide(); }
				break;

			}

		}
		// EO fn action

		// check if the feature is activated and configured
		if (self.conf.navToolbar && self.conf.navToolbarButtons)
		{

			// get all buttons for the toolbar
			var buttons = self.conf.navToolbarButtons.split(/\s*,\s*/), nodes = [];

			// create the wrapper around all toolbar buttons
			var wrapper = jQuery('<div class="' + prefix + '">');

			// now create all configured buttons
			for (var i = 0, l = buttons.length; i < l; i++)
			{

				// create the button node
				var button = jQuery(
					'<span class="' + prefix + '-' + buttons[i] + '">'
					+ self.tmpl.navButtonWrapper[0]
					+ self.tmpl.navButton
				     .replace(/{title}/g, buttons[i])
					   .replace(/{type}/g, buttons[i].replace('toggle-', ''))
					+ self.tmpl.navButtonWrapper[1]
					+ '</span>'
				)

				// attach click handler to the button
				.click(jQuery.proxy(action, self, buttons[i]));

				// add button to the outer wrapper node
				wrapper.append(self.buttons[buttons[i]] = button);

				// find and store all button images
				button.imgs = button.find('IMG');

			}

			// store the toolbar wrapper
			self.toolbarWrapper = wrapper;

			// append wrapper to the main slider wrapper
			self.toolbarWrapper.appendTo(self.wrapper);

		}
		// EO if conf.autoslide


	});
	// @@@ EO plugin: init @@@


	// @@@ private fn: updateToggleButtons @@@
	function updateToggleButtons ()
	{

		// process all toggle buttons
		for(var type in toggler)
		{

			// get value if feature is enabled
			var enabled = toggler[type].call(this);

			// get the images previousely stored
			var imgs = this.buttons['toggle-' + type].imgs;

			// process all button images
			var i = imgs.length; while (i--)
			{

				// get the current image src
				var src = imgs[i].src.replace(
					enabled ? type : 'play',
					enabled ? 'play' : type
				);

				// check if src has changed
				if (src != imgs[i].src)
				{ imgs[i].src = src; }

			}
			// EO each image

		}
		// EO each toggler

	}
	// @@@ EO private fn: updateToggleButtons @@@


	// plug into various events to update buttons
	prototype.plugin('ready', updateToggleButtons);
	prototype.plugin('autoslideStop', updateToggleButtons);
	prototype.plugin('autoslideStart', updateToggleButtons);
	prototype.plugin('autoslidePause', updateToggleButtons);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
