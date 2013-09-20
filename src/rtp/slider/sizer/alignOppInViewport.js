/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Align the panels to the opposite direction of the viewport. Just usefull if the
  viewport has a fixed height and no fluid panels. So you may want to align the
  panels vertically to the bottom or to the middle (like css vertical-align).

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// center in viewport
			alignPanelOpp: 0.5

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ private fn: alignOppInViewport @@@
	function alignOppInViewport ()
	{

		// get the css attribute to set
		var css = this.conf.vertical ? 'left' : 'top',
		    // get the alignment number (between 0 and 1)
		    align = parseFloat(this.conf.alignPanelOpp, 10);

		// check for valid number
		if (isNaN(align)) return;

		// loop all slides to set their offset
		var i = this.panels.length; while (i--)
		{

			// calculate the difference and multiply to align
			var offset = (this.vp_y - this.pd[1][i]) * align;

			// set this panel offset for given direction
			jQuery(this.panels[i]).css(css, offset + 'px');

		}
			// EO each panel

	}
	// @@@ EO private fn: alignOppInViewport @@@


	// run late after the viewport opposition has been changed/updated
	prototype.plugin('updatedViewportOpp', alignOppInViewport, 999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);