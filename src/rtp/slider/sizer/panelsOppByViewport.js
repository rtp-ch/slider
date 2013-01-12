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


	// @@@ fn: panelsOppByViewport @@@
	function panelsOppByViewport ()
	{

		// abort if this feature is not enabled
		if (this.conf.sizerOpp != 'panelsByViewport') return;

		// process all slides to set opp size
		var i = this.slides.length; while (i--)
		{

			// set size to full viewport opp
			this.setSlideOpp(i, this.vp_y);

		}

		// trigger the changed panels opp hook
		this.trigger('changedPanelsOpp');

		// read the new panel dims from UA
		// updates the ps[0] and pd[0] arrays
		// this is only needed if the dim is fluid
		// which means it can change when opp changes
		if (this.conf.fluidPanelsDim) this.readPanelsDim();

	}
	// @@@ EO fn: panelsOppByViewport @@@


	// hook into various change events to adjust size
	prototype.plugin('changedViewport', panelsOppByViewport, 999999999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
