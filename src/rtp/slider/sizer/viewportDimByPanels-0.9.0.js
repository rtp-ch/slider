/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport By Panels Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: updatedSlideExposure @@@
	prototype.plugin('updatedSlideExposure', function(visibility)
	{

		// local variable
		var dimension = 0;

		// abort if feature is disabled
		if (
			this.conf.vertical ||
			this.conf.sizer == 'viewportByPanels'
		)
		{

			// process all panel visibilites
			for(var i = 0; i < visibility.length; i++)
			{

				// skip if panel is not visible
				if (visibility[i] == 0) continue;

				// sum up dimensions of all panels
				dimension += this.pd[0][i] * visibility[i];

			}

			// set viewport dimension
			this.setViewportDim(dimension);

		}

	});
	// @@@ EO plugin: updatedSlideExposure @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
