/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport By Panels Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ private fn: viewportDimByPanels @@@
	function viewportDimByPanels ()
	{

		// abort if feature is not enabled
		if (this.conf.sizerDim != 'viewportByPanels') return;

		// calculate dimension from exposure
		var dim = 0, exposure = this.se;

		// process all panel visibilites
		for(var i = 0; i < exposure.length; i++)
		{

			// skip if panel is not visible
			if (exposure[i] == 0) continue;

			// sum up dimensions of all panels
			dim += this.pd[0][i] * exposure[i];

		}

		// set viewport dimension
		this.updateViewportDim(dim);

	}
	// @@@ EO private fn: viewportDimByPanels @@@


	// hook into various change events to adjust viewport
	prototype.plugin('changedExposure', viewportDimByPanels, 99999);
	prototype.plugin('changedViewport', viewportDimByPanels, 99999);
	prototype.plugin('changedPanelsDim', viewportDimByPanels, 99999);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
