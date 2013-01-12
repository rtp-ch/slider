/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Viewport Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// link wrapper dimension to viewport
			linkWrapperToViewportDim: true,
			// link wrapper opposition to viewport
			linkWrapperToViewportOpp: false

		});

	});
	// @@@ EO plugin: config @@@


	// @@@ method: getViewportOffset @@@
	prototype.getViewportOffset = function ()
	{

		// get the viewport offset
		var offset = this.viewport.offset();

		// normalize drag and scroll axis
		return this.conf.vertical
			? { x : offset.top, y : offset.left }
			: { x : offset.left, y : offset.top };

	}
	// @@@ EO method: getViewportOffset @@@


	// @@@ private fn: setViewportSize @@@
	// this may not work as other css might overrule us
	// the implementer has to make sure this does not happen
	function setViewportSize (value, invert)
	{

		// get local variable
		var conf = this.conf,
		    wrapper = this.wrapper,
		    viewport = this.viewport;

		// set the height
		if (conf.vertical ^ invert)
		{
			viewport.height(value);
			if (conf.linkWrapperToViewportOpp)
			{ wrapper.height(viewport.outerHeight(true)); }
		}
		// set the width
		else
		{
			viewport.width(value);
			if (conf.linkWrapperToViewportDim)
			{ wrapper.width(viewport.outerWidth(true)); }
		}

	}
	// @@@ EO private fn: setViewportSize @@@


	// @@@ method: setViewportDim @@@
	prototype.setViewportDim = function (value)
	{

		// does the value really change
		// if (this.vp_x == value) return;

		// assign given viewport dimension
		setViewportSize.call(this, value, 0);

		this.vp_x = value;

		// now trigger the changedViewportOpp hook
		this.trigger('updatedViewportDim', value);

	}
	// @@@ EO method: setViewportDim @@@

	// @@@ method: setViewportOpp @@@
	prototype.setViewportOpp = function (value)
	{

		// does the value really change
		// if (this.vp_y == value) return;

		// assign given viewport opposition
		setViewportSize.call(this, value, 1);

		// now trigger the changedViewportOpp hook
		this.trigger('updatedViewportOpp', value);

	}
	// @@@ EO method: setViewportOpp @@@


	// @@@ private fn: getViewportSize @@@
	function getViewportSize (invert)
	{

		// get local variable
		var viewport = this.viewport;

		// return the viewport axis size
		return this.conf.vertical ^ invert
			? viewport.height() : viewport.width();

	}
	// @@@ EO private fn: getViewportSize @@@

	// @@@ method: readViewportDim @@@
	prototype.readViewportDim = function()
	{

		// store the current viewport dimension
		this.vp_x = getViewportSize.call(this, 0);

	}
	// @@@ EO method: readViewportDim @@@

	// @@@ method: readViewportOpp @@@
	prototype.readViewportOpp = function()
	{

		// store the current viewport opposition
		this.vp_y = getViewportSize.call(this, 1);

	}
	// @@@ EO method: readViewportOpp @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
