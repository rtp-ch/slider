/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Container Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ private fn: getSizeCssStr @@@
	function getSizeCssStr (invert)
	{

		return this.conf.vertical ^ invert
			? 'height' : 'width';

	}
	// @@@ EO private fn: getSizeCssStr @@@


	// @@@ private fn: getOffsetCssStr @@@
	function getOffsetCssStr (invert)
	{

		// get the reverse option from config
		var reverse = this.conf.offsetReverse;

		// return the string according to options
		return this.conf.vertical ^ invert
			? (reverse ? 'marginBottom' : 'marginTop')
			: (reverse ? 'marginRight' : 'marginLeft');

	}
	// @@@ EO private fn: getOffsetCssStr @@@


	// @@@ method: getContainerOffset @@@
	prototype.getContainerOffset = function(invert)
	{

		// return a float number from the container offset
		return - (parseFloat(this.container.css(getOffsetCssStr.call(this, invert)), 10) || 0)

	}
	// @@@ EO method: getContainerOffset @@@


	// @@@ method: setContainerOffset @@@
	prototype.setContainerOffset = function(offset, invert)
	{

		/*

		Tests have shown that the clamping is not needed here!
		So this has been disabled on purpose for performance!
		Keep the code anyway, as it might become needed again!

		// get the left and right position
		// also calculate size of all slides
		var conf = this.conf
		    align = conf.align * conf.vp_x,
		    left = this.offset[this.smin] + align,
		    right = this.offset[this.smax + 1] + align,
		    size = right - left;

		// shift into range when in carousel
		// protect from endless loop condition
		if (conf.carousel && size > 0)
		{
			// shift into prefered and best visible area
			// this may go wrong if floated to the right?
			while (offset < left) { offset += size; }
			while (right <= offset) { offset -= size; }
		}
		// EO if conf.carousel

		// allow offsets outside the valid range
		// if (offset < left) { offset = left; }
		// if (right < offset) { offset = right; }

		*/

		// only set offset to full integers
		// avoids some strange visual bugs
		offset = parseInt(offset + 0.5);

		// set the offset position of the container to the viewport
		this.container.css(getOffsetCssStr.call(this, invert), - offset);

		// update internal variable
		// needed to calc visibilities
		this.ct_off = offset;

	}
	// @@@ EO method: setContainerOffset @@@


	// @@@ method: readContainerOffset @@@
	prototype.readContainerOffset = function ()
	{

		// update the container offset
		this.ct_off = this.getContainerOffset(0);

	};
	// @@@ EO method: readContainerOffset @@@


	// @@@ method: checkContainerOffset @@@
	// get container offset from browser
	// check if offset value has changed
	// trigger changedContainerOffset hook
	prototype.checkContainerOffset = function()
	{

		// get the current container offset
		var current = this.getContainerOffset(0);

		// check if dimension change
		if (this.ct_off !== current)
		{

			// store previous value and assign new value
			var previous = this.ct_off; this.ct_off = current;

			// now trigger the changedContainerOffset hook
			this.trigger('changedContainerOffset', current, previous);

		}
		// EO if value changed

	}
	// @@@ EO method: checkContainerOffset @@@


	// @@@ plugin: updatedPanelsDim @@@
	prototype.plugin('updatedPanelsDim', function ()
	{

		// in vertical mode the container always
		// has the panels correctly layed out
		if (this.conf.carousel3d) return;
		if (this.conf.vertical) return;

		// sum up the dimensions for the container
		// calculate it so we can later get the accurate
		// pixel offset for the positioning from the ua
		// the panels hook for updatedPanelsDim runs later
		var dim = 0, i = this.panels.length;
		while (i--) { dim += this.pd[0][i]; }

		// set the container width/height to the calculated value to contain all panels
		// there is no getter or setter method for this particular container attribute
		// we really only need to adjust this dimension if the panel dimensions have changed
		this.container.css(getSizeCssStr.call(this), Math.ceil(dim) + 'px')

	}, - 9999);
	// @@@ EO plugin: updatedPanelsDim @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function()
	{

		// check container offset
		this.checkContainerOffset();

	}, - 99);
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);