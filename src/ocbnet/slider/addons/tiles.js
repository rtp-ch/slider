/*
  Copyright (c) Marcel Greter 2013 - ocbnet.ch - RTP jQuery Slider Tiles plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  EXPERIMENTAL: if you include this file it may break other slide modes !!!

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

			// enable plugin
			tiles: false,

			// how many tiles for animations
			tileRows: 1, tileCols: 1,

			// how many tiles should animate at once
			tileRowsAtOnce: 1, tileColsAtOnce: 1,

			// from where should tile animation start
			tileDimOrigin: 0.5, tileOppOrigin: 0.5

		});
		// EO extend config

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: config @@@
	prototype.plugin('ready', function (extend)
	{

		if (!this.conf.tiles) return;

		this.rows = [];
		this.cols = [];
		this.tiles = [];

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


		// @@@ overload method: getContainerOffset @@@
		this.getContainerOffset = function(invert)
		{

			if (!this.conf.tiles) return this.__proto__.getContainerOffset.apply(this, arguments)

			if (typeof this.ct_off != "undefined") return this.ct_off;

			// return a float number from the container offset
			return - (parseFloat(this.container.css(getOffsetCssStr.call(this, invert)), 10) || 0)

		}
		// @@@ EO overload method: getContainerOffset @@@


		// @@@ overload method: setContainerOffset @@@
		this.setContainerOffset = function(offset, invert)
		{

			if (!this.conf.tiles) return this.__proto__.setContainerOffset.apply(this, arguments)

			// search position to clamp container to
			var i = this.offset.length; while(i--)
			{ if (this.offset[i] <= offset) break; }

			// set the offset position of the container to the viewport
			this.container.css(getOffsetCssStr.call(this, invert), - this.offset[i]);

			// update internal variable
			// needed to calc visibilities
			this.ct_off = offset;

		}
		// @@@ EO overload method: setContainerOffset @@@

		// @@@ overload method: getOffsetByPosition @@@
		this.getOffsetByPosition = function (index)
		{

			if (!this.conf.tiles) return this.__proto__.getOffsetByPosition.apply(this, arguments)

			return prototype.getOffsetByPosition.call(this, index)

		}
		// @@@ EO overload method: getOffsetByPosition @@@


		for(var i = 0; i < this.slides.length; i++)
		{
			jQuery(this.slides[i]).addClass('rtp-slider-slide-' + i);
		}

		var fader = jQuery('<div class="rtp-slider-fader">');

		for(var i = 0; i < this.conf.tileRows; i++)
		{

			var cols = [], tiles = [],
			    row = jQuery('<div class="row row-' + i + '">');

			for(var n = 0; n < this.conf.tileCols; n++)
			{

				var col = jQuery('<div class="col col-' + n + '">');
				var tile = jQuery('<div class="tile tile-' + i + '-' + n + '">');

				row.append(col)

				col.append(tile);

				cols.push(col);

				tiles.push(tile);

			}

			fader.append(row)

			this.rows.push(row);

			this.cols.push(cols);

			this.tiles.push(tiles);

		}

		jQuery(this.viewport).append(fader);

		this.fader = fader;

		fader.css({

			'top' : '0px',
			'left' : '0px',
			'right' : '0px',
			'bottom' : '0px',
			'position' : 'absolute'

		});

	}, -9999);
	// @@@ EO plugin: config @@@


	function layout()
	{

		if (!this.conf.tiles) return;

		var off_y = 0,
		    rows = this.rows,
		    cols = this.cols,
		    tiles = this.tiles,
		    y = this.vp_y / this.conf.tileRows,
		    x = this.vp_x / this.conf.tileCols;

		for (var i = 0; i < this.conf.tileRows; i ++)
		{

			var off_x = 0;

			rows[i].css({
				'left' : '0px',
				'right' : '0px',
				'width' : 'auto',
				'height' : y + 'px',
				'top' : off_y + 'px',
				'overflow' : 'hidden',
				'position' : 'absolute'
			});

			for (var n = 0; n < this.conf.tileCols; n ++)
			{

				cols[i][n].css({
					'left' : off_x + 'px',
					// 'width' : x + 'px',
					'height' : 'auto',
					'top' : '0px',
					'bottom' : '0px',
					'overflow' : 'hidden',
					'position' : 'absolute'
				})

				if (this.position == Math.floor(this.position))
				{
				}

				tiles[i][n].css({
					'width' : this.vp_x * 2,
					'height' : this.vp_y * 2,
					'marginTop' : - off_y,
					'marginLeft' : - off_x
				})

				jQuery('.rtp-slider-panel', tiles[i][n]).css({
					'float' : 'none',
					// 'width' : '100%',
					// 'height' : '100%',
					'opacity' : '1'
				});

				off_x += x;

			}

			off_y += y;

		}

	}

	function change(position, part)
	{

		if (!this.conf.tiles) return;

		var width = this.vp_x / this.conf.tileCols;
		var height = this.vp_y / this.conf.tileRows;

		var off_y = 0,
		    y = this.vp_y / this.conf.tileRows,
		    x = this.vp_x / this.conf.tileCols;

		for (var i = 0; i < this.conf.tileRows; i ++)
		{

			var off_x = 0;

			for (var n = 0; n < this.conf.tileCols; n ++)
			{

				// the simples swipe through
				// one start when other ends
				// var d_w = 1 / this.conf.tileCols, s_w = d_w * n;

				// distribute it from the left/top
				var d_w = 1 / this.conf.tileCols * this.conf.tileColsAtOnce,
				    s_w = this.conf.tileCols == 1 ? 0 :
				          (1 - d_w) / (this.conf.tileCols - 1) * n;
				var d_h = 1 / this.conf.tileRows * this.conf.tileRowsAtOnce,
				    s_h = this.conf.tileRows == 1 ? 0 :
				          (1 - d_h) / (this.conf.tileRows - 1) * i;

				var prog_w = (part - s_w) / (d_w);
				prog_w = Math.max(0, Math.min(1, prog_w));

				var prog_h = (part - s_h) / (d_h);
				prog_h = Math.max(0, Math.min(1, prog_h));

				var align_h = this.conf.tileOppOrigin || 0,
				    align_w = this.conf.tileDimOrigin || 0;

				this.cols[i][n].css({

					'opacity' : part,

					'width' : width * prog_w + 'px',
					'height' : height * prog_h + 'px',

					'marginTop' : align_h * height * (1 - prog_h) + 'px',
					'marginLeft' : align_w * width * (1 - prog_w) + 'px'


				});

				this.tiles[i][n].css({

					'opacity' : part,

					'marginTop' : (-1 * align_h * height * (1 - prog_h) - off_y) + 'px',
					'marginLeft' : (-1 * align_w * width * (1 - prog_w) - off_x) + 'px'

				});

				off_x += x;

			}

			off_y += y;

		}

	}


	var first = true;

	// @@@ plugin: changedPosition @@@
	prototype.plugin('changedPosition', function (previous)
	{

		if (!this.conf.tiles) return;

		var position = this.position;

		// get the integer via method
		var int_pos = parseInt(position, 10),
		    int_prv = parseInt(previous, 10),
		    ceil_pos = Math.ceil(position),
		    ceil_prv = Math.ceil(previous),
		    floor_pos = Math.floor(position),
		    floor_prv = Math.floor(previous);

		if (first || floor_pos != floor_prv)
		{

			first = false;

			var slide_left = Math.min(floor_pos),
			    panel_left = this.slide2panel(slide_left),
			    panel_right = this.slide2panel(slide_left + 1);

			var panel = this.panels.get(panel_right),
			    panel = jQuery(panel);

			this.fader.hide();

			for(var i = 0; i < this.conf.tileRows; i++)
			{
				for(var n = 0; n < this.conf.tileCols; n++)
				{
					this.tiles[i][n].empty().append(panel.clone().css({ 'margin': '0' }));
				}
			}

		};

		if (Math.floor(position) != position)
		this.fader.show(); else this.fader.hide();

		var part_pos = position - Math.floor(position);

		change.call(this, position, part_pos)

	}, - 999);
	// @@@ EO plugin: changedPosition @@@


	// @@@ plugin: layout @@@
	prototype.plugin('layout', function ()
	{

		layout.call(this);

		var position = this.position;

		var part_pos = position - Math.floor(position);

		change.call(this, position, part_pos);

	}, 0);
	// @@@ EO plugin: layout @@@



	// @@@ private fn: alignOppInViewport @@@
	function alignOppInViewport ()
	{

		if (!this.conf.tiles) return;

		// declare local variables
		var align = this.conf.alignPanelOpp,
		    // get the css attribute to set
		    css = this.conf.vertical ? 'left' : 'top';

		// check for valid number
		if (isNaN(align)) return;

		// loop all slides to setup their 3d transformation
		var i = this.slides.length; while (i--)
		{

			var p = this.slide2panel(i);

			// calculate the possible margin and multiply
			var margin = (this.vp_y - this.pd[1][p]) * align;

			// set this panel margin for direction
			jQuery('.rtp-slider-slide-' + i).css(css, margin + 'px');
			// jQuery(this.panels[i]).css(css, margin + 'px');

		}
			// EO all panels

	}
	// @@@ EO private fn: alignOppInViewport @@@

	function changedPanelsSize()
	{

		if (!this.conf.tiles) return;

		// loop all slides to setup their 3d transformation
		var i = this.slides.length; while (i--)
		{

			var p = this.slide2panel(i);

			// calculate the possible margin and multiply
			var dim = this.pd[0][p], opp = this.pd[1][p]

			// set this panel margin for direction
			jQuery('.rtp-slider-slide-' + i, this.fader)
			.css({
				'width': dim + 'px',
				'height': opp + 'px'
			});

		}

	}

	// run late after the viewport opposition has been changed/updated
	prototype.plugin('updatedViewportOpp', alignOppInViewport, 99999);

	prototype.plugin('updatedPanelsDim', changedPanelsSize, 99999);
	prototype.plugin('updatedPanelsOpp', changedPanelsSize, 99999);



// EO extend class prototype
})(RTP.Slider.prototype, jQuery);