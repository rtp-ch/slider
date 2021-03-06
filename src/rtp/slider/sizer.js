/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Sizer Functions
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

			// which viewport dimension should be fluid
			// those values are read from the user agent
			// and the code must not try to set that itself
			// valid: panelsByViewport or viewportByPanels
			sizerDim: 'panelsByViewport',
			sizerOpp: 'viewportByPanels'

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ method: preLayout @@@
	// called by OCBNET.Layout library
	prototype.preLayout = function(data)
	{

		// read viewport dimensions first
		// use only these values to adjust ui
		if (this.conf.sizerDim != 'viewportByPanels') this.trigger('readViewportDim', data);
		if (this.conf.sizerOpp != 'viewportByPanels') this.trigger('readViewportOpp', data);

		// check if viewport has changed
		// otherwise do nothing to safe cpu
		// if (
		// 	Math.abs(this.vp_x_lck - this.vp_x) > 0.0001 ||
		// 	Math.abs(this.vp_y_lck - this.vp_y) > 0.0001 ||
		// 	data.force
		// )
		// {
		// }
		// EO if dimension changed

		// update and adjust all ui elements
		this.trigger('changedViewport', data);

	}
	// @@@ EO method: preLayout @@@


	// @@@ method: postLayout @@@
	// called by OCBNET.Layout library
	prototype.postLayout = function(data)
	{

		if (
			Math.abs(this.vp_x_lck - this.vp_x) > 0.0001 ||
			Math.abs(this.vp_y_lck - this.vp_y) > 0.0001 ||
			data.force
		)
		{

			// adjust outer ui elements (viewport)
			this.trigger('adjustViewport', data);

		}

	}
	// @@@ EO method: postLayout @@@

	// @@@ method: updateLayout @@@
	// called by OCBNET.Layout library
	prototype.updateLayout = function(data)
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
	// @@@ EO method: updateLayout @@@


	// @@@ plugin: ready @@@
	prototype.plugin('start', function()
	{

		// add widget to layout manager
		OCBNET.Layout.add(this);

		// trigger changed viewport once
		this.trigger('changedViewport');

		// layout user interface
		OCBNET.Layout(true);

	}, 999999);
	// @@@ EO plugin: ready @@@


	// @@@ plugin: changedPosition @@@
	// A position change may change the opposition
	// which could trigger a scrollbar, so check for
	// this condition here on the corresponding event
	prototype.plugin('changedPosition', function()
	{

		// remember initial values
		this.old_vp_x = this.vp_x;
		this.old_vp_y = this.vp_y;

	}, - 999999);
	prototype.plugin('changedPosition', function()
	{

		// check against the stored viewport dimensions for changes
		// if they differ, chances are we need to update all layouts
		if (this.vp_x != this.old_vp_x || this.vp_y != this.old_vp_y) OCBNET.Layout();

	}, 999999);
	// @@@ EO plugin: changedPosition @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);