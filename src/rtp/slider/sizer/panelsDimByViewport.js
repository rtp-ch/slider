/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Distribute the width of the viewport evenly to all visibile panels.
  Maybe add distribution factors or fixed widths for panels later.
  This sizer adjusts the panels if the viewport opposition changes.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ private fn: panelsDimByViewport @@@
	function panelsDimByViewport ()
	{

		// abort if this feature is not enabled
		if (this.conf.sizerDim != 'panelsByViewport') return;

		// process all slides to set dimension
		var i = this.slides.length; while (i--)
		{

			// set size to the calculated value
			this.setSlideDim(i, this.getSlideDimFromVp(i));

		}

		// trigger the changed panels dim hook
		this.trigger('changedPanelsDim');

		// read the new panel opps from UA
		// updates the ps[1] and pd[1] arrays
		// this is only needed if the opp is fluid
		// which means it can change when dim changes
		if (
		      this.conf.fluidPanelsOpp ||
		      this.conf.sizerOpp == 'viewportByPanels'
		)
		{
			this.readPanelsOpp();
		}

	}
	// @@@ EO private fn: panelsDimByViewport @@@


	// @@@ method: getSlideDimFromVp @@@
	// get the dimension for the given slide
	prototype.getSlideDimFromVp = function (slide)
	{

		// declare and normalize slide
		// var panel = this.slide2panel(slide),
		//     slide = this.panel2slide(panel);

		// we currently distribute everything evenly to all slides
		// todo: implement a more complex sizer with distribution factors
		return parseFloat(this.vp_x / this.conf.panelsVisible, 10)

	}
	// @@@ EO method: getSlideDimFromVp @@@


	// hook into various change events to adjust panels
	prototype.plugin('changedViewport', panelsDimByViewport);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
