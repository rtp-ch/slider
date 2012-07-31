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
		this.trigger('readviewportDim', data);
		this.trigger('readviewportOpp', data);

	}
	// @@@ EO method: preLayout @@@


	// @@@ method: updateLayout @@@
	// called by OCBNET.Layout library
	prototype.updateLayout = function(data)
	{

		// check if viewport has changed
		// otherwise do nothing to safe cpu
		if (
			this.vp_x_lck !== this.vp_x ||
			this.vp_y_lck !== this.vp_y ||
			data.force
		)
		{

			// update and adjust all ui elements
			// only use the values previously read
			this.trigger('changedViewportDim', data);

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
			this.vp_x_lck !== this.vp_x ||
			this.vp_y_lck !== this.vp_y ||
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
		OCBNET.Layout();

	}, 999);
	// @@@ EO plugin: ready @@@

	prototype.plugin('layout', function (data)
	{

		if (
			this.vp_x_lck !== this.vp_x ||
			this.vp_y_lck !== this.vp_y ||
			data.force
		)
		{

			// layout user interface
			OCBNET.Layout();

		}

	}, - 99999);

/*
	// @@@ plugin: updatedPosition @@@
	prototype.plugin('updatedPosition', function()
	{

		// store old dimension
		var vp_x = this.vp_x

		// read viewport dimensions first
		// this will read this.vp_x again
		this.trigger('readviewportDim');

		// redo layout if viewport dimension changed
		if (vp_x != this.vp_x) return OCBNET.Layout();

		// enqueue a defered call to layout
		else OCBNET.Layout.schedule(200, true);

	});
	// @@@ EO plugin: updatedPosition @@@
*/

// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
