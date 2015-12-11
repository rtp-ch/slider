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
			carousel3d: false,

			// class to mark wrapper with our class
			klass: { carousel3d: 'rtp-slider-carousel3d' }

		});

	});
	// @@@ EO plugin: config @@@


	// conversion constants
	// var deg2rad = Math.PI/180;
	// var rad2deg = 180/Math.PI;

	// @@@ plugin: init @@@
	prototype.plugin('init', function ()
	{

		// check if feature is enabled
		if (!this.conf.carousel3d) return;

		// create closures for functions
		// only calculate on layout update
		var angle, paneldim, distance;

		// save and store to old method (to be restored later)
		var oldSetOffsetByPosition = this.setOffsetByPosition;

		// mark the wrapper with current run mode
		this.viewport.addClass(this.klass.carousel3d);

		// @@@ private fn: setOffsetByPosition @@@
		function setOffsetByPosition (position)
		{

			// call original method to update `ct_off`
			oldSetOffsetByPosition.apply(this, arguments);

			// now calulate the rotation for this position
			var direction = this.conf.vertical ? 'X' : 'Y';
			var rotate = 360 / this.slides.length * position;
			rotate *= this.conf.vertical ? 1 : -1;

			// transformations
			var transforms = [];
			// move the 3d center away from the viewport plane
			transforms.push('translateZ(-' + (distance) + 'px)');
			if (this.conf.vertical) transforms.push('translateY(' + (this.vp_x / 2) + 'px)');
			// apply the current rotation angle on direction axis
			transforms.push('rotate' + direction + '(' + rotate + 'deg)');
			// set 3d container styles to create rotation effect
			this.container.css('transform', transforms.join(' '));

		}
		// @@@ EO private fn: setOffsetByPosition @@@

		function setup ()
		{

			var css = {
				// use absolute position
				// seems faster than static
				position : 'absolute',
				// force anti aliasing in firefox
				outline: '1px solid transparent'
			};
			// fix in one axis
			if (this.conf.vertical) {
				css.top = '0px';
				css.bottom = '0px';
			} else {
				css.left = '0px';
				css.right = '0px';
			}
			// setup 3d panels
			this.panels.css(css);

		}

		// @@@ private fn: layout @@@
		function layout ()
		{

			// check if feature is enabled
			if (!this.conf.carousel3d) return;

			var vertical = this.conf.vertical;
			// ensure we always rotate around the same axis
			// this will be the center of the container node
			if (vertical) this.container.css('height', 0);

			// declare local variables
			var conf = this.conf,
			    alignPanelDim = conf.alignPanelDim,
			    alignViewport = conf.alignViewport,
			    panelsVisible = conf.panelsVisible;

			// get segment angle at center (in radians)
			var angle = Math.PI / this.slides.length;

			// calculate maxium panel dimension and take half
			var paneldim = Math.max.apply( Math, this.pd[0] ) / 2;

			// calculate the panel distances (3d) from the center
			distance = parseFloat(paneldim / Math.tan(angle), 10);

			// calculate the alignment / offset position (use panelsVisible to assume viewport)
			var align = panelsVisible * (alignViewport - 0.5) - alignPanelDim + 0.5

			// setup 3d panels
			this.panels.css({

				// use absolute position
				position : 'absolute',
				// left : '0px', right : '0px',

				// force anti aliasing in firefox
				outline: '1px solid transparent'

			});

			// dont bleed inside border et al
			// unfortunately breaks 3d in chrome
			// if (OCBNET.Layout.ua.browser != 'chrome')
			// { this.viewport.css('overflow', 'hidden'); }

			// hide cloned panels
			this.cloned.hide();

			var clock = vertical ? -360 : 360;
			var direction = vertical ? 'X' : 'Y';

			// loop all slides to setup their 3d transformation
			var l = this.slides.length, i = l; while (i--)
			{

				// get rotation for this panel
				var rotate = clock / l * i + align;

				// transformations
				var transforms = [];
				// apply the current rotation angle on direction axis
				if (vertical) transforms.push('translateY(-' + (this.vp_x / 2) + 'px)');
				transforms.push('rotate' + direction + '(' + rotate + 'deg)');
				// move the 3d center away from the viewport plane
				transforms.push('translateZ(' + (distance) + 'px)');
				// set 3d container styles to create rotation effect
				jQuery(this.slides[i]).css('transform', transforms.join(' '));

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
		// also overwrite setContainerOffset to accept any value
		// this allows other plugins (ie. visibility) to kick in
		this.setContainerOffset = function(off) { this.ct_off = off; };


		// setup the 3d carousel on layout event
		// prototype.plugin('adjustViewport', setup, - 9999);

		// setup the 3d carousel on layout event
		prototype.plugin('adjustViewport', layout, - 99);


	});
	// @@@ EO plugin: init @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);