/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Keyboard Navigation Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: init @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// should we enable keyboard navigation
			navKeyboard : false,
			// jquery keycode for prev action
			navKeyboardPrev : this.conf.vertical ? 38 : 37,
			// jquery keycode for next action
			navKeyboardNext : this.conf.vertical ? 40 : 39

		});

	});
	// @@@ EO plugin: init @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// initialize keyboard navigation
		if (this.conf.navKeyboard)
		{
			// bind to keyboard event on document scope
			jQuery(document).keydown(jQuery.proxy(function (evt)
			{
				// only capture without any modifier combination (ie. for opera tabbing)
				if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) return true;
				// map key to slider function
				switch (evt.which)
				{
					case this.conf.navKeyboardPrev: this.goPrev(); break;
					case this.conf.navKeyboardNext: this.goNext(); break;
				}

			}, this));
		}

	});
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
