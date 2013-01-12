/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Sizer Functions
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

				// sizer is used to adjust ui elements
				// this is mainly used to switch between
				// panelsByViewport or viewportByPanels mode
				sizer: false

			},
			this.conf
		);

	});
	// @@@ EO plugin: config @@@


	// @@@ method: preLayout @@@
	// called by OCBNET.Layout library
	prototype.preLayout = function(data)
	{

		// read viewport dimensions first
		// use only these values to adjust ui
		this.trigger('readViewportDim', data);
		this.trigger('readViewportOpp', data);

	}
	// @@@ EO method: preLayout @@@


	// @@@ method: updateLayout @@@
	// called by OCBNET.Layout library
	prototype.updateLayout = function(data)
	{

		// check if viewport has changed
		// otherwise do nothing to safe cpu
		if (
			Math.abs(this.vp_x_lck - this.vp_x) > 0.0001 ||
			Math.abs(this.vp_y_lck - this.vp_y) > 0.0001 ||
			data.force
		)
		{

			// update and adjust all ui elements
			this.trigger('changedViewport', data);

		}
		// EO if dimension changed

	}
	// @@@ EO method: updateLayout @@@


	// @@@ method: postLayout @@@
	// called by OCBNET.Layout library
	prototype.postLayout = function(data)
	{

		// check if viewport has changed
		// otherwise do nothing to safe cpu
		if (
			this.vp_x_lck != this.vp_x ||
			this.vp_y_lck != this.vp_y ||
			data.force
		)
		{

			// update the lock variable
			// tells us when layout was run
			this.vp_x_lck = this.vp_x;
			this.vp_y_lck = this.vp_y;

			// redo all layouts
			this.trigger('layout', data);

		}
		// EO if dimension changed

	}
	// @@@ EO method: postLayout @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// add widget to layout manager
		OCBNET.Layout.add(this);

		// layout user interface
		OCBNET.Layout(true);

	}, 999);
	// @@@ EO plugin: ready @@@


	// @@@ plugin: changedPosition @@@
	prototype.plugin('changedPosition', function()
		{

		// re-layout the widgets
		// only when viewport changes
			OCBNET.Layout();

	});
	// @@@ EO plugin: changedPosition @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
