/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Core Panels Functions
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

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

		// get the left and right value for this css box object
		var left = parseFloat(panel.css(prefix + css[0] + suffix), 10);
		var right = parseFloat(panel.css(prefix + css[1] + suffix), 10);

		// some browser may return auto when the actual value is zero (ie8)
		if(isNaN(left)) left = 0; if(isNaN(right)) right = 0;

		// return an array with values and sum
		return [left, right, left + right];

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

	}
	// @@@ EO method: getPanelSize @@@


	// @@@ method: updatePanels @@@
	// create slidepanels lookup array
	// trigger updatedPanels hook
	prototype.updatePanels = function ()
	{

		// initialize slidepanels
		this.slidepanels = [];

		// get slides length
		this.slen = this.slides.length;

		// max index for real slider panels (not cloned ones)
		this.smax = this.smin + this.slen - 1;

		// test how much viewable each panel is right now
		for(var i = 0; i < this.panels.length; i ++)
		{

			// normalize from panel to slide
			var slide = this.panel2slide(i);

			// generate slidepanels array
			if (!this.slidepanels[slide])
			{ this.slidepanels[slide] = [i]; }
			else { this.slidepanels[slide].push(i); }

		}
		// EO foreach panel

		// trigger updatedPanels hook
		// hook is not yet used by anyone
		// this.trigger('updatedPanels');

	}
	// @@@ EO method: updatePanels @@@


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

	// @@@ method: checkPanelStyles @@@
	// get the panel styles from UA
	// store values to use them later
	// trigger changedPanelsDim hook
	// trigger changedPanelsOpp hook
	prototype.checkPanelsStyle = function(flag)
	{

		// read styles for both axes
		readPanelsStyles.call(this, 0);
		readPanelsStyles.call(this, 1);

		// read some more styles
		readPanelsSize.call(this, 0);
		readPanelsSize.call(this, 1);

		// calculate offsets
		this.updatePanelsOffset();

	}
	// @@@ EO checkPanelStyles @@@


	// @@@ method: readPanelsDim @@@
	prototype.readPanelsDim = function()
	{

		// get sizes for drag axis
		readPanelsSize.call(this, 0);

	};
	// @@@ EO method: readPanelsDim @@@

	// @@@ method: readPanelsDim @@@
	prototype.readPanelsOpp = function()
	{

		// get sizes for scroll axis
		readPanelsSize.call(this, 1);

	};
	// @@@ EO method: readPanelsOpp @@@


	// @@@ method: checkPanelStyles @@@
	// update offset array from stored dimensions
	prototype.updatePanelsOffset = function()
	{

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

			// trigger hook to adjust container
			this.trigger('changedPanelsOffset');

		}
		// hardcore calculation by getting the real offsets
		// this will lead to perfect offset positions
		else
		{

			// trigger hook to adjust container
			this.trigger('changedPanelsOffset');

			// get local variable
			var dimensions = this.pd[0];

			// calculate offset for each panel
			var offset = 0; this.offset = [];

	// this.panels.css('float', 'left');

				var offset = this.panels.eq(0).offset();

				var start = this.conf.vertical ? offset.top : offset.left;
	start -= this.pm[0][0][0];

			// collect size and margin for all panels
			for(var i = 0; i < dimensions.length; i++)
			{

				offset = this.panels.eq(i).offset();

				offset = this.conf.vertical ? offset.top : offset.left;

				offset = parseFloat(offset) - start - this.pm[0][i][0];

				// sum up and store current offset
				this.offset.push(offset);

			}
			// EO foreach panel

			if (this.panels.length)
			{
				this.offset.push(parseFloat(offset) + this.pd[0][i-1])
			}

		}

	};
	// @@@ EO checkPanelStyles @@@



	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// calculate base values
		this.updatePanels();

		// read panel sizes and margins
		this.checkPanelsStyle();

	}, - 99);
	// @@@ EO plugin: ready @@@



// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
