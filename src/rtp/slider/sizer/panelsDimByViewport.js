/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Distribute the width of the viewport evenly to all visible panels.
  Maybe add distribution factors or fixed widths for panels later.
  This sizer adjusts the panels if the viewport opposition changes.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: changedViewport @@@
	prototype.plugin('changedViewport', function ()
	{

		// distribute viewport dim to slides
		if (this.conf.sizerDim == 'panelsByViewport')
		{
			// process all slides to set dimension
			var i = this.slides.length; while (i--)
			{
				// set size to the calculated value
				this.setSlideDim(i, this.getSlideDimFromVp(i));
			}
		}

	})
	// @@@ EO plugin: changedViewport @@@


	// @@@ plugin: adjustViewport @@@
	prototype.plugin('adjustViewport', function ()
	{

		// distribute viewport dim to slides
		if (this.conf.sizerDim == 'panelsByViewport')
		{
			// trigger the changed panels dim hook
			this.trigger('updatedPanelsDim');
			// now update the panel opposition
			// read in the new dimensions and
			// dispatch updatedPanelsOpp event
			this.updatePanelsOpp();
		}

	});
	// @@@ EO plugin: adjustViewport @@@


	// @@@ method: getSlideDimFromVp @@@
	// get the dimension for the given slide
	prototype.getSlideDimFromVp = function (slide)
	{

		// correct virtual viewport to get rid of the margin
		var virtual = this.vp_x + (this.conf.margin || 0);

		// we currently distribute everything evenly to all slides
		// todo: implement a more complex sizer with distribution factors
		return parseFloat(virtual / this.conf.panelsVisible, 10)

	}
	// @@@ EO method: getSlideDimFromVp @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);