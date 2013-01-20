/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Navigation Dots Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// get function checker
	var isFn = jQuery.isFunction;

	// declare here for compiler
	var prefix = 'rtp-nav-dot';

	// @@@ private fn: formatTitle @@@
	// default title format function
	function formatTitle (nr)
	{
		return (nr + 1) + "/" + this.slides.length;
	}
	// @@@ EO private fn: formatTitle @@@


	// @@@ private fn: updateNavDotUI @@@
	// call to setup the styles of a nav dot node
	function updateNavDotUI (slide, progress)
	{

		// classes for selectors
		var class_hidden = this.klass.panelHidden;
		var class_partial = this.klass.panelPartial;
		var class_visible = this.klass.panelVisible;

		// panel if completely visible
		if (progress >= 1)
		{
			this.navDot.eq(slide)
				.addClass(class_visible)
				.removeClass(class_hidden)
				.removeClass(class_partial)
		}
		// panel is not shown at all
		else if (progress <= 0)
		{
			this.navDot.eq(slide)
				.addClass(class_hidden)
				.removeClass(class_partial)
				.removeClass(class_visible)
		}
		// panel is partially visible
		else
		{
			this.navDot.eq(slide)
				.addClass(class_partial)
				.removeClass(class_hidden)
				.removeClass(class_visible)
		}

		// call configured function for styling
		var fn = this.conf.navDotStepFunction;
		// assert that the configured option is a function
		if (jQuery.isFunction(fn)) fn.call(this, slide, progress)

	}
	// @@@ EO private fn: updateNavDotUI @@@


	// @@@ private fn: updateVisibility @@@
	function updateVisibility (visibility)
	{

		// is plugin enabled
		if (this.conf.navDots)
		{

			// call update for each slide nav dot
			for(var i = 0; i < visibility.length; i++)
			{ updateNavDotUI.call(this, i, visibility[i]) }

		}
		// EO if is enabled

	}
	// @@@ EO private fn: updateVisibility @@@


	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// enable plugin
			navDots: false,
			// format for alt and title tag
			navDotAltFormat: formatTitle,
			navDotTitleFormat: formatTitle,
			// this function is responsible to change styles
			// progress will be in the range of 0 to 1 (100%)
			navDotStepFunction: function(slide, progress)
			{
				// the default method is to change the opacity
				this.navDotImg.eq(slide).css('opacity', progress);
			},

			klass : {

				navDot: prefix,
				panelHidden: prefix + '-hidden',
				panelPartial: prefix + '-partial',
				panelVisible: prefix + '-visible'

			},

			tmpl : {
				navDotWrapper: ['<span><a href="javascript:void(0);">', '</a></span>'],
				navDotElement: '<img src="img/rtp-nav-dot-clear.gif" width="12" height="12" alt=""/>'
			}


		});

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: init @@@
	prototype.plugin('init', function()
	{

		// create closure
		var self = this;

		// activate autoslide
		if (self.conf.navDots)
		{

			// only if more than one slide
			if (self.slides.length > 1)
			{

				// store nav dots and nav dot images
				self.navDot = jQuery(), self.navDotImg = jQuery();

				// create the wrapper around all nav dots
				self.navDotWrapper = jQuery('<div class="' + prefix + 's">');

				// create a representation for each slide
				self.slides.each(function (i)
				{

					// create a new jquery dom object
					var navDot = jQuery(
						self.tmpl.navDotWrapper[0] +
							self.tmpl.navDotElement +
						self.tmpl.navDotWrapper[1]
					)

						// add generic class to the item
						.addClass(self.klass.navDot)
						// add specific class to the item (with nr)
						.addClass([self.klass.navDot, i].join('-'))

						// attach click handler to the nav dot
						.click(function () { self.animate(i); })

						// append object to wrapper
						.appendTo(self.navDotWrapper)

					// get the nav dot image node
					var navDotImg = jQuery('IMG', navDot)

					// set some attributes for the image (overwrite format functions to personalize)
					if (isFn(self.conf.navDotAltFormat)) navDotImg.attr('alt', self.conf.navDotAltFormat.call(self, i));
					if (isFn(self.conf.navDotTitleFormat)) navDotImg.attr('title', self.conf.navDotTitleFormat.call(self, i));

					// collect all real dom nodes
					self.navDot.push(navDot.get(0));
					self.navDotImg.push(navDotImg.get(0));

					// setup the styles of this dot
					updateNavDotUI.call(self, i, 0);

				});

				// append wrapper to the main slider wrapper
				self.wrapper.append(self.navDotWrapper);

				// self.navDotWrapper.wrap('<div class="rtp-nav-dots-outer">');
				// self.navDotWrapper.wrap('<div class="rtp-nav-dots-wrapper">');

			}
			// EO if slides > 1

		}
		// EO if conf.autoslide

	});
	// @@@ plugin: init @@@


	// execute when slide visibility is changed (actual visibility)
	prototype.plugin('changedVisibility', updateVisibility);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
