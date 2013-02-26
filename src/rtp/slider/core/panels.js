/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Panels Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ plugin: config @@@
	// attach and create status arrays
	// store all panels style definitions
	prototype.plugin('config', function ()
	{

		// sizes
		this.ps = [[], []];
		// margins
		this.pm = [[], []];
		// borders
		this.pb = [[], []];
		// paddings
		this.pp = [[], []];
		// dimensions
		this.pd = [[], []];

		// layout
		this.pl = [];

	})
	// @@@ EO plugin: config @@@


	// @@@ private fn: getBoxSizeCssStr @@@
	function getBoxSizeCssStr (invert)
	{

		// get the reverse option from config
		var reverse = this.conf.offsetReverse;

		// return the strings according to options
		return this.conf.vertical ^ invert
			? (reverse ? ['Bottom', 'Top'] : ['Top', 'Bottom'])
			: (reverse ? ['Right', 'Left'] : ['Left', 'Right']);

	}
	// @@@ EO private fn: getBoxSizeCssStr @@@


	// @@@ privat fn: getPanelBoxCss @@@
	function getPanelBoxCss (panel, prefix, suffix, invert)
	{

		// get the box size strings (ie left/right)
		var css = getBoxSizeCssStr.call(this, invert);

		// get the left/top and right/bottom value for this css box
		var lt = parseFloat(panel.css(prefix + css[0] + suffix), 10);
		var rb = parseFloat(panel.css(prefix + css[1] + suffix), 10);

		// some browser may return auto when the actual value is zero (ie8)
		if(isNaN(lt)) lt = 0; if(isNaN(rb)) rb = 0;

		// return an array with values and sum
		return [lt, rb, lt + rb];

	}
	// @@@ EO privat fn: getPanelBoxCss @@@


	// @@@ privat fn: getPanelMargin @@@
	function getPanelMargin (panel, invert)
	{

		// call through getPanelCss function
		return getPanelBoxCss.call(this, panel, 'margin', '', invert);

	}
	// @@@ EO privat fn: getPanelMargin @@@


	// @@@ privat fn: getPanelBorder @@@
	function getPanelBorder (panel, invert)
	{

		// call through getPanelCss function
		return getPanelBoxCss.call(this, panel, 'border', 'Width', invert);

	}
	// @@@ EO privat fn: getPanelBorder @@@


	// @@@ privat fn: getPanelPadding @@@
	function getPanelPadding (panel, invert)
	{

		// call through getPanelCss function
		return getPanelBoxCss.call(this, panel, 'padding', '', invert);

	}
	// @@@ EO privat fn: getPanelPadding @@@


	// @@@ method: getPanelSize @@@
	prototype.getPanelSize = function (panel, invert)
	{

		// access panel only once (get id into range)
		panel = this.panels.eq(this.panel2panel(panel));

		// return the panel axis size
		return this.conf.vertical ^ invert
			? panel.height() : panel.width();

		// return the accurate panel size
		// return this.conf.vertical ^ invert
		// 	? panel.get(0).clientHeight ? panel.get(0).clientHeight : panel.height()
		// 	: panel.get(0).clientWidth ? panel.get(0).clientWidth : panel.width();

	}
	// @@@ EO method: getPanelSize @@@


	// @@@ method: setPanelSize @@@
	prototype.setPanelSize = function (panel, value, invert)
	{

		// access panel only once (get id into range)
		panel = this.panels.eq(this.panel2panel(panel));

		// return the panel axis size
		return this.conf.vertical ^ invert
			? panel.height(value) : panel.width(value);

	}
	// @@@ EO method: setPanelSize @@@


	// @@@ private fn: readPanelsSize @@@
	function readPanelsSize (invert)
	{

		// declare loop variables
		var size,
		    outer = this.pd[invert],
		    inner = this.ps[invert],
		    layout = this.pl[invert],
		    border = this.pb[invert],
		    margin = this.pm[invert],
		    padding = this.pp[invert];

		// reset size and dim array
		inner.length = outer.length = 0;

		// collect size and margin for all panels
		var i = this.panels.length; while (i--)
		{

			// get actual panel size on drag axis
			inner[i] = size = this.getPanelSize(i, invert);

			// add padding, border and margin to size for final dimension
			outer[i] = size + padding[i][2] + border[i][2] + margin[i][2];

			// adjust for panel box sizing
			// this may not work with all jquery versions
			// once jquery starts to fully support this itself
			// if (layout[i] == 'padding-box')
			// { inner[i] += padding[i][2]; }
			// else if (layout[i] == 'border-box')
			// { inner[i] += padding[i][2] + border[i][2]; }

		}
		// EO foreach panel

	}
	// @@@ EO private fn: readPanelsSize @@@


	// @@@ private fn: readPanelsStyles @@@
	function readPanelsStyles (invert)
	{

		// store box-sizing
		this.pl[invert] = [];

		// store margin
		this.pm[invert] = [];
		// store border
		this.pb[invert] = [];
		// store padding
		this.pp[invert] = [];

		// collect size and margin for all panels
		var i = this.panels.length; while (i--)
		{

			// access panel only once (get id into range)
			var panel = this.panels.eq(this.panel2panel(i));

			// get box sizing to adjust some stuff later
			this.pl[invert][i] = panel.css('box-sizing');

			// get panel margin for both sides (and a sum of them)
			this.pm[invert][i] = getPanelMargin.call(this, panel, invert);
			this.pb[invert][i] = getPanelBorder.call(this, panel, invert);
			this.pp[invert][i] = getPanelPadding.call(this, panel, invert);

		}
		// EO foreach panel

	}
	// @@@ EO private fn: readPanelsStyles @@@


	// @@@ method: updatePanelsDim @@@
	prototype.updatePanelsDim = function()
	{

		// get sizes for drag axis
		readPanelsSize.call(this, 0);

		// trigger hook for updated panels
		this.trigger('updatedPanelsDim');

		// read the new panel opps from UA
		// updates the ps[1] and pd[1] arrays
		// this is only needed if the opp is fluid
		// which means it can change when dim changes
		// if (this.conf.fluidPanelsOpp) this.updatePanelsOpp();

	};
	// @@@ EO method: updatePanelsDim @@@


	// @@@ method: updatePanelsDim @@@
	prototype.updatePanelsOpp = function()
	{

		// get sizes for scroll axis
		readPanelsSize.call(this, 1);

		// trigger hook for updated panels
		this.trigger('updatedPanelsOpp');

		// read the new panel dims from UA
		// updates the ps[0] and pd[0] arrays
		// this is only needed if the dim is fluid
		// which means it can change when opp changes
		// if (this.conf.fluidPanelsDim) this.updatePanelsDim();

	};
	// @@@ EO method: updatePanelsOpp @@@


	// @@@ plugin: updatedPanelsDim @@@
	// the pd (panel dimension) has been updated
	// recalculate the complete panel offset array
	prototype.plugin('updatedPanelsDim', function()
	{

		// experimental feature
		if (this.conf.carousel3d)
		{

			// get local variable
			var dimensions = this.pd[0];

			// calculate offset for each panel
			var offset = 0; this.offset = [0];

			// collect size and margin for all panels
			for(var i = 0; i < dimensions.length; i++)
			{

				// sum up and store current offset
				this.offset.push(offset += dimensions[i]);

			}
			// EO foreach panel

		}
		// hardcore calculation by getting the real offsets
		// this should lead to perfect offset positions
		else
		{

			// get local variable
			var dimensions = this.pd[0];

			// get the vertical indicator for arrays
			var vertical = this.conf.vertical ? 1 : 0;

			// calculate offset for each panel
			var offset = 0; this.offset = [];

			// start with the first panel's offset
			var offset = this.panels.eq(0).offset();

			// get the start offset for the correct direction
			var start = vertical ? offset.top : offset.left;

			// adjust start offset for the margin
			start -= this.pm[vertical][0][0];

			// collect size and margin for all panels
			for(var i = 0; i < dimensions.length; i++)
			{

				// get the offset value for this panel
				offset = this.panels.eq(i).offset();

				// get the offset for the correct direction
				offset = vertical ? offset.top : offset.left;

				// calculate the precise offset for this panel
				offset = parseFloat(offset) - start - this.pm[vertical][i][0];

				// sum up and store current offset
				this.offset.push(offset);

			}
			// EO foreach panel

			// have at least one panel
			if (this.panels.length)
			{

				// add last dimension to indicate the whole length
				this.offset.push(parseFloat(offset) + this.pd[0][i-1])

			}

		}

	}, + 99);
	// @@@ plugin: updatedPanelsDim @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// read styles for both axes
		readPanelsStyles.call(this, 0);
		readPanelsStyles.call(this, 1);

		// read the dimensions
		this.updatePanelsDim();
		this.updatePanelsOpp();

	}, - 99);
	// @@@ EO plugin: ready @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);