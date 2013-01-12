/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport Height by Visibility Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// when is a panel fully visible
			autoVpOppDeadZone: 0.5

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ fn: viewportOppByPanels @@@
	function viewportOppByPanels ()
	{

		// declare local variables for loop
		var opps = [], exposure = this.s_e,
		    // dead zone for out of view panel
		    dead_zone = this.conf.autoVpOppDeadZone || 1;

		// abort if feature is not enabled
		if (this.conf.sizerOpp != 'viewportByPanels') return;

		// process all panel visibilites
		var i = exposure.length; while (i --)
		{

			// skip if panel is not visible
			if (exposure[i] === 0) continue;

			// check if panel is fully visible
			if (exposure[i] > dead_zone)
			{
				// use full panel height
				opps.push(this.pd[1][i]);
			}

			// panel only partial visible
			else
			{

				// use a partial panel size (dead_zone == full size)
				opps.push(this.pd[1][i] * exposure[i] / dead_zone);

			}

		}
		// EO foreach panel visiblity

		// get the biggest value from array
		var max = Math.max.apply(Math, opps);

		// update opposite viewport size
		this.updateViewportOpp(max);

	}
	// @@@ EO fn: viewportOppByPanels @@@


	// hook into various change events to adjust size
	prototype.plugin('changedExposure', viewportOppByPanels, 99);
	prototype.plugin('changedViewport', viewportOppByPanels, 99);




	prototype.plugin('changedViewport', function()
	{

		// fluid dimension
		if (this.conf.vertical) {
debugger;
		this.readPanelsDim();
		// this.trigger('changedPanelsDim');
		// this.updatePanelsOffset();
		}

	}, 9);

})(RTP.Slider.prototype, jQuery);
