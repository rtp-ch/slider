/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Center Opposition in Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ private fn: updatedViewportOpp @@@
	function updatedViewportOpp (vp_y)
	{

		// loop all slides to setup their 3d transformation
		var l = this.panels.length, i = l; while (i--)
		{

			var margin = (vp_y - this.pd[1][i]) / 2;

			jQuery(this.panels[i]).css('top', margin + 'px');

		}
			// EO all panels

	}
	// @@@ EO private fn: updatedViewportOpp @@@


	// run late after the viewport opposition has been changed/updated
	prototype.plugin('changedViewportOpp', updatedViewportOpp, 999);
	prototype.plugin('updatedViewportOpp', updatedViewportOpp, 999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
