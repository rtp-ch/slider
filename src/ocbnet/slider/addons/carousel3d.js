/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP jQuery Slider Carousel 3D Plugin
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

			// enable feature
			carousel3d: false

		});

	});
	// @@@ EO plugin: config @@@


	// conversion constants
	// var deg2rad = Math.PI/180;
	// var rad2deg = 180/Math.PI;

	// @@@ plugin: init @@@
	prototype.plugin('init', function ()
	{

		// create closures for functions
		// only calculate on layout update
		var angle, paneldim, distance;

		// save and store to old method (to be restored later)
		var oldSetOffsetByPosition = this.setOffsetByPosition;

		// @@@ private fn: setOffsetByPosition @@@
		function setOffsetByPosition (position)
		{

			// check if feature is enabled
			if (!this.conf.carousel3d)
			{

				// call original method if feature is disabled
				return oldSetOffsetByPosition.apply(this, arguments);

			}
			// EO if feature not enabled

			// now calulate the rotation for this position
			var rotate = 360 / this.slides.length * position;

			var dir = this.conf.vertical ? 'X' : 'Y';

			// set 3d container styles
			this.container.css({

				// rotate the 3d panel and move it aways from the 3d center
				// transform: 'translateZ(-' + distance + 'px) rotate' + dir + '(-' + rotate + 'deg)'
				transform: 'translateZ(-' + distance + 'px) rotate' + dir + '(-' + rotate + 'deg)'

			});

		}
		// @@@ EO private fn: setOffsetByPosition @@@


		// @@@ private fn: layout @@@
		function layout ()
		{

			// check if feature is enabled
			if (!this.conf.carousel3d) return;

			// declare local variables
			var conf = this.conf,
			    alignPanel = conf.alignPanel,
			    alignViewport = conf.alignViewport,
			    panelsVisible = conf.panelsVisible;

			// get segment angle at center (in radians)
			var angle = Math.PI / this.slides.length;

			// calculate maxium panel dimension and take half
			var paneldim = Math.max.apply( Math, this.pd[0] ) / 2;

			// calculate the panel distances (3d) from the center
			distance = parseFloat(paneldim / Math.tan(angle), 10);

			// calculate the alignment / offset position (use panelsVisible to assume viewport)
			var align = panelsVisible * (alignViewport - 0.5) - alignPanel + 0.5

			// setup 3d panels
			this.panels.css({

				// use absolute position
				position : 'absolute',
				left : '0px', right : '0px',

				// force anti aliasing in firefox
				outline: '1px solid transparent'

			});

			// hide cloned panels
			this.cloned.hide();

			var dir = this.conf.vertical ? 'X' : 'Y';

			// loop all slides to setup their 3d transformation
			var l = this.slides.length, i = l; while (i--)
			{

				// get rotation for this panel
				var rotate = 360 / l * i + align;

				// set all 3d panel styles
				jQuery(this.slides[i]).css({

					// rotate the 3d panel and move it aways from the 3d center
					transform: 'rotate' + dir + '(' + rotate + 'deg) translateZ( ' + distance + 'px )'

				});

			}
			// EO all slides

			// setup 3d viewport styles
			this.viewport.css({
				// 'overflow': 'hidden',
				'perspective': distance * panelsVisible / 2
			});

			// setup 3d container styles
			this.container.css({
				'width': '100%',
				'overflow': 'visible',
				'transform-style': 'preserve-3d'
			});

		}
		// @@@ EO private fn: layout @@@


		// overwrite setOffsetByPosition method
		// do this on each instance not on prototype
		this.setOffsetByPosition = setOffsetByPosition;

		// setup the 3d carousel on layout event
		prototype.plugin('layout', layout, - 9);


	});
	// @@@ EO plugin: init @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
