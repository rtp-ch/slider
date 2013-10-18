/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Position Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ method: setPosition @@@
	prototype.setPosition = function (position)
	{

		// normalize the slide index
		position = this.slide2slide(position);

		// check if the position really changed
		if (this.position == position) return;

		// get previous position to pass
		var previous = this.position;

		// store normalized position
		this.position = position;

		// sync to monitor?
		if (this.conf.vsync)
		{
			// synchronize action with monitor
			this.trigger('changedPosition', position, previous);
		}
		else
		{
			// defer draw to achieve the wished frame rate (approx)
			this.defer(1000 / this.conf.fps, 'changedPosition', position, previous);

		}

	}
	// @@@ EO method: setPosition @@@


	// @@@ plugin: layout @@@
	prototype.plugin('changedPosition', function ()
	{

		// just reset the current position
		this.setOffsetByPosition(this.position);

	});
	// @@@ EO plugin: layout @@@


	// @@@ method: setOffsetByPosition @@@
	prototype.setOffsetByPosition = function (position)
	{

		// store current normalized position
		this.position = this.slide2slide(position);

		// declare local variables
		var conf = this.conf,
		    alignPanelDim = conf.alignPanelDim,
		    alignViewport = conf.alignViewport,
		    panelsVisible = conf.panelsVisible;

		// only in non-carousel mode
		if (!conf.carousel)
		{

			// try to show as many panels possible
			if (conf.fillViewport)
			{

				// calculate the left and right space to be filled
				var fill_left = panelsVisible * alignViewport - alignPanelDim,
				    fill_right = -1 * fill_left + panelsVisible - 1;

				// adjust panel position to make those
				// panels "virtually" visible / exposed
				if (position < this.smin + fill_left)
				{ position = this.smin + fill_left; }
				if (position > this.smax - fill_right)
				{ position = this.smax - fill_right; }

			}
			// EO if conf.fillViewport

		}
		// EO if not conf.carousel

		// get the pixel offset for the given relative index
		var px = this.getOffsetByPosition(position);

		// adjust the offset on the viewport
		px -= this.vp_x * alignViewport;

		// adjust the container offset
		this.setContainerOffset(px);

	}
	// @@@ EO method: setOffsetByPosition @@@


	// @@@ method: getOffsetByPosition @@@
	prototype.getOffsetByPosition = function (index)
	{

		// index is meant as slide, get into panels
		index += this.smin + this.conf.alignPanelDim;

		if (this.conf.carousel)
		{
			// adjust index into the valid panel range
			while (index > this.smax) index -= this.slides.length;
			while (index < this.smin) index += this.slides.length;
		}
		else
		{
			// adjust index into the valid panel range
			if (index <= this.smin + 0) return this.offset[this.smin];
			if (index >= this.smax + 1) return this.offset[this.smax + 1];
		}

		// get the panel on the left side
		var panel = Math.floor(index);

		// get the floating part
		var fpart = index - panel;

		// solve by distributing in the panel
		var px = this.pd[0][panel] * fpart;

		// add the offset of the panels
		px += this.offset[panel];

		// return px
		return px;

	}
	// @@@ EO method: getOffsetByPosition @@@


	// @@@ method: getPositionByOffset @@@
	prototype.getPositionByOffset = function (px)
	{

		// ensure pixel as integer
		px = parseInt(px + 0.5, 10);

		// get the left and right position
		// also calculate size of all slides
		var left = this.offset[this.smin],
		    right = this.offset[this.smax + 1],
		    align = this.conf.alignPanelDim + this.smin;


		if (this.conf.carousel && right > left)
		{
			// shift into prefered and best visible area
			while (px < left) { px += right - left; }
			while (right <= px) { px -= right - left; }
		}
		else
		{
			if (px <= left) { return this.smin; }
			if (px >= right) { return this.smax + 1; }
		}

		// process all panels from left until we find
		// a panel that is currently moving out of view
		var i = this.panels.length; while (i--)
		{

			// assign to local variables
			var panel_left = this.offset[i+0];
			var panel_right = this.offset[i+1];

			// make test for equality first
			// this is the most common case so
			// avoid the unnecessary calculation
			if (panel_left == px) return i - align;

			// test if pixel offset lies in this panel
			if (panel_right > px && px > panel_left)
			{

				// return the calculated position (intoPanel / panelSize + i - offset)
				return (px - panel_left) / (panel_right - panel_left) + i - align;

			}
			// EO if position in panel

		}
		// EO each panel

		// this should not ever happen, debug!!
		throw('getPositionByOffset has invalid state');

	}
	// @@@ EO method: getPositionByOffset @@@


	// @@@ plugin: layout @@@
	prototype.plugin('layout', function ()
	{

		// normalized the position before layouting
		this.position = this.slide2slide(this.position);

	}, - 999);
	// @@@ EO plugin: layout @@@


	// @@@ plugin: layout @@@
	prototype.plugin('layout', function ()
	{

		// just reset the current position
		this.setOffsetByPosition(this.position);

	}, + 999);
	// @@@ EO plugin: layout @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);