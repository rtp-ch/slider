/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Adjust the panels opposition to the available viewport opposition.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: changedViewport @@@
	prototype.plugin('changedViewport', function ()
	{

		// abort if this feature is not enabled
		if (this.conf.sizerOpp == 'panelsByViewport')
		{

			// process all slides to set opposition
			var i = this.slides.length; while (i--)
			{

				// set size to full viewport opp
				this.setSlideOpp(i, this.getSlideOppFromVp(i));

			}
		}

	});
	// @@@ EO plugin: changedViewport @@@


	// @@@ plugin: adjustViewport @@@
	prototype.plugin('adjustViewport', function ()
	{

		// distribute viewport dim to slides
		if (this.conf.sizerOpp == 'panelsByViewport')
		{
			// trigger the changed panels dim hook
			this.trigger('updatedPanelsOpp');
			// now update the panel opposition
			// read in the new dimensions and
			// dispatch updatedPanelsOpp event
			this.updatePanelsDim();
		}

	});
	// @@@ EO plugin: adjustViewport @@@


	// @@@ method: getSlideOppFromVp @@@
	// get the opposition for the given slide
	prototype.getSlideOppFromVp = function (slide)
	{

		// extend to the full opposition
		// todo: implement a more complex method
		return parseFloat(this.vp_y, 10)

	}
	// @@@ EO method: getSlideOppFromVp @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);