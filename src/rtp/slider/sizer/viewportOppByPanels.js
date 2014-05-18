/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport By Panels Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Adjust the viewport opposition to the currently shown panel(s).

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

			// when is a panel not visible
			autoVpOppDeadZone: 0.2,
			// when is a panel fully visible
			autoVpOppLifeZone: 0.8

		});

	});
	// @@@ EO plugin: config @@@



	// @@@ private fn: viewportOppByPanels @@@
	function viewportOppByPanels ()
	{

		// protect beeing called too early
		if (this.isReady !== true) return;

		// abort if feature is not enabled
		if (this.conf.sizerOpp != 'viewportByPanels') return;

		// declare local variables for loop
		var min = 1E+100, opps = [], exposure = this.se,
		    // dead zone for out of view panel
		    dead_zone = parseFloat(this.conf.autoVpOppDeadZone, 10),
		    // life zone for out of view panel
		    life_zone = parseFloat(this.conf.autoVpOppLifeZone, 10);

		// assertion for numeric value
		if (isNaN(dead_zone)) dead_zone = 0.2;
		if (isNaN(life_zone)) life_zone = 0.8;

		// switch arguments if they seem to be
		// defined in the opposite way (play safe)
		if (dead_zone > life_zone)
		{
			var foobar = dead_zone;
			dead_zone = life_zone;
			life_zone = foobar;
		}

		// development assertions
		if (exposure.length == 0) eval('debugger');
		if (this.pd[1].length == 0) eval('debugger');

		// process all panel visibilites
		var i = exposure.length; while (i --)
		{
			// panel access index
			var n = this.smin + i;
			// check if current panel is visible and smaller than min
			if (exposure[i] > 0 && this.pd[1][n] < min) min = this.pd[1][n];
		}

		// process all panel visibilites
		var i = exposure.length; while (i --)
		{

			// panel access index
			var n = this.smin + i;

			// skip if panel is not visible
			if (exposure[i] === 0) continue;

			// check if panel is fully visible
			if (exposure[i] > life_zone)
			{

				// use full panel size difference
				opps.push((this.pd[1][n] - min));

			}

			// panel only partial visible
			else if (exposure[i] > dead_zone)
			{

				// use a partial panel size diff (distribute from 0 to 1 between dead_zone and life_zone)
				opps.push((this.pd[1][n] - min) * (exposure[i] - dead_zone) / (life_zone - dead_zone));

			}

		}
		// EO foreach panel visiblity

		// get the biggest value from array
		var offset = Math.max.apply(Math, opps);

		// update opposite viewport size
		// take minimum size and add offset
		this.updateViewportOpp(min + offset);

	}
	// @@@ EO private fn: viewportOppByPanels @@@


	// hook into various change events to adjust viewport
	prototype.plugin('adjustViewport', viewportOppByPanels, 9999);
	prototype.plugin('changedPosition', viewportOppByPanels, 9999);

	prototype.plugin('foobarVisibility', viewportOppByPanels, 9999);

// EO extend class prototype
})(RTP.Slider.prototype, jQuery);