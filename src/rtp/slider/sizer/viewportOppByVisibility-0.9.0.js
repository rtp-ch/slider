/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Viewport Height by Visibility Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{


	// @@@ plugin: config @@@
	prototype.plugin('config', function()
	{

		// extend default configuration
		this.conf = jQuery.extend
		(
			{

				// enable feature
				autoVpOpp: true,

				// panel dead zone
				autoVpOppDeadZone: 0.5

			},
			this.conf
		);

	});
	// @@@ EO plugin: config @@@

	function viewportOppByVisibility ()
	{

		var visibility = this.s_e;

		// check if feature is enabled
		if (this.conf.vertical) return;
		if (!this.conf.autoVpOpp) return;

		// local variable and dead zone for out of view panel
		var max = 0, dead_zone = this.conf.autoVpOppDeadZone || 1;

		// process all panel visibilites
		for(var i = 0; i < visibility.length; i++)
		{

			// skip if panel is not visible
			if (visibility[i] == 0) continue;

			// check if panel is fully visible
			if (visibility[i] > dead_zone)
			{
				// use full panel height
				max = Math.max(max, this.pd[1][i]);
			}
			else
			{
				// use a partial panel height (distribute from 0 to dead_zone)
				max = Math.max(max, this.pd[1][i] * (visibility[i] / dead_zone));
			}
			// EO if fully visible

		}
		// EO foreach panel visiblity

		// set viewport opposite size
		this.setViewportOpp(max);

		// vp_y never read
		this.vp_y = max;

	}

	// @@@ plugin: changedPanelVisibility @@@

	prototype.plugin('layout', viewportOppByVisibility);

	prototype.plugin('layout', function()
	{

		if (this.conf.vertical)
		{

			this.readPanelsDim();

/*
			this.readPanelsOpp();
			// this.updatePanels()

*/
			this.updatePanelsOffset()
			this.setOffsetByPosition(this.position);
		}

	}, - 99999);


 	// prototype.plugin('updatedSlideExposure', viewportOppByVisibility);

	// @@@ EO plugin: changedPanelVisibility @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
