/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP jQuery Slider Visibility Plugin
  Map global changedVisibility event to slide specific events if visibilities change
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

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

			// when is a slide visible
			// how visible has it to be
			withinThreshold : 0.995

		});

		// store per slide
		this.within = [];

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: changedVisibility @@@
	prototype.plugin('changedVisibility', function (visibility, sv)
	{

		// process all slides, array must have
		// same length as all registered slides
		var i = visibility.length; while (i--)
		{

			// get the previous value
			var prev = this.within[i];

			// get status if slide is visible (int for array access)
			var vis = visibility[i] > this.conf.withinThreshold ? 1 : 0;

			// check is status has changed
			if (vis != prev)
			{

				// store new status
				this.within[i] = vis;

				// emit an event to inform that this slide visibility has changed
				this.trigger('changedSlideVisibility', this.slides[i], vis, prev);

			}
			// EO if state changed

		}
		// EO each slide

	});
	// @@@ EO plugin: changedVisibility @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);