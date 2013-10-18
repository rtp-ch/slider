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


	// @@@ private fn: panelsOppByViewportRead @@@
	function panelsOppByViewportRead ()
	{

		// abort if this feature is not enabled
		if (this.conf.sizerOpp != 'panelsByViewport') return;

		// process all slides to set opposition
		var i = this.slides.length; while (i--)
		{

			// set size to full viewport opp
			this.setSlideOpp(i, this.getSlideOppFromVp(i));

		}

	}
	// @@@ EO private fn: panelsOppByViewportRead @@@


	// @@@ private fn: panelsOppByViewportUpdate @@@
	function panelsOppByViewportUpdate ()
	{

		// abort if this feature is not enabled
		if (this.conf.sizerOpp != 'panelsByViewport') return;

		// trigger the changed panels opp hook
		this.trigger('updatedPanelsOpp');

		// read the new panel dims from UA
		// updates the ps[0] and pd[0] arrays
		// this is only needed if the dim is fluid
		// which means it can change when opp changes
		if (
		      this.conf.fluidPanelsDim ||
		      this.conf.sizerDim == 'viewportByPanels'
		)
		{
			this.updatePanelsDim();
		}

	}
	// @@@ EO private fn: panelsOppByViewportUpdate @@@


	// @@@ method: getSlideOppFromVp @@@
	// get the opposition for the given slide
	prototype.getSlideOppFromVp = function (slide)
	{

		// declare and normalize slide
		// var panel = this.slide2panel(slide),
		//     slide = this.panel2slide(panel);

		// extend to the full opposition
		// todo: implement a more complex method
		return parseFloat(this.vp_y, 10)

	}
	// @@@ EO method: getSlideOppFromVp @@@


	// hook into various change events to adjust panels
	prototype.plugin('changedViewport', panelsOppByViewportRead);
	prototype.plugin('adjustViewport', panelsOppByViewportUpdate);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);