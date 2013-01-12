/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Distribute the width of the viewport evenly to all visibile panels.
  Maybe add distribution factors or fixed widths for panels later.
  This sizer adjusts the panels if the viewport dimension changes.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// center in viewport
			alignOpp: 0.5

		});

	});
	// @@@ EO plugin: config @@@

	// @@@ private fn: centerOppInViewport @@@
	function centerOppInViewport (vp_y)
	{

		// declare local variables
		var align = this.conf.alignOpp,
		    // get the css attribute to set
		    css = this.conf.vertical ? 'left' : 'top';

		// check for valid number
		if (isNaN(align)) return;

		// loop all slides to setup their 3d transformation
		var l = this.panels.length, i = l; while (i--)
		{

			// calculate the possible margin and multiply
			var margin = (vp_y - this.pd[1][i]) * align;

			// set this panel margin for direction
			jQuery(this.panels[i]).css(css, margin + 'px');

		}
			// EO all panels

	}
	// @@@ EO private fn: centerOppInViewport @@@


	// run late after the viewport opposition has been changed/updated
	prototype.plugin('updatedViewportOpp', centerOppInViewport, 999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
