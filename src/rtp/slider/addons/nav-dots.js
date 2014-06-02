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

			if (this.conf.groupPanels)
			{
				// should always to be an integer
				var vis = this.conf.panelsVisible;
				// group visibilities together is distribute
				for(var i = 0, l = visibility.length; i < l; i += vis)
				{
					// declare variables
					var sum = 0, count = 0;
					// process all dots in this panels group
					for(var n = 0; n < vis && i + n < l; n ++)
					{ sum += visibility[i + n]; count ++; }
					// calculate the (adjusted) average
					var average = Math.pow(sum / count, vis);
					// update all dots in group with average
					for(var n = 0; n < vis && i + n < l; n ++)
					{ updateNavDotUI.call(this, i, average) }
				}
			}
			else
			{
				// call update for each slide nav dot
				for(var i = 0; i < visibility.length; i++)
				{ updateNavDotUI.call(this, i, visibility[i]) }
			}

		}
		// EO if is enabled

	}
	// @@@ EO private fn: updateVisibility @@@


	// @@@ private fn: updateUI @@@
	function updateUI (config)
	{

		if (!this.navDot) return;

		// fall back to instance config
		if (!config) config = this.conf;

		// get the new configuration
		var vis = config.panelsVisible;

		// calculate how many nav dots are visible
		var count = Math.ceil(this.navDot.length/vis);

		// check for old count class
		if (this.navDotCountClass)
		{
			// remove the indicator class from the wrapper
			this.navDotWrapper.removeClass(this.navDotCountClass);
			// reset the storage variable
			this.navDotCountClass = null;
		}

		// check of config option
		if (this.conf.navDotCountClass)
		{
			// create class indicating how many nav dots are ...
			this.navDotCountClass = this.klass.navDotCount + count;
			// ... currently shown (use to hide single nav dots)
			this.navDotWrapper.addClass(this.navDotCountClass);
		}

		// process all nav dots to show/hide them
		for(var i = 0; i < this.slides.length; i++)
		{
			// check if the current nav dot is shown or not
			var display = i % vis == 0 ? '' : 'none';
			// update inline styles of the dom node
			this.navDot.eq(i).css('display', display);
		}

	}
	// @@@ EO private fn: updateUI @@@


	// @@@ plugin: updating @@@
	prototype.plugin('updating', function (config)
	{

		// check if we should group the panels (otherwise just return)
		// option may be overruled by new config (therefore we use a proper check)
		if (!(('groupPanels' in config && config.groupPanels) || this.conf.groupPanels )) return;

		// only proceed if the visible panels have changed (pass new config to function)
		if (config.panelsVisible != this.conf.panelsVisible) updateUI.call(this, config);

	});
	// @@@ EO plugin: updating @@@


	// @@@ plugin: config @@@
	prototype.plugin('config', function (extend)
	{

		// add defaults
		extend({

			// enable plugin
			navDots: false,
			// enable wrappers
			navDotWrappers: false,
			// function name to add dom node
			// ex: prepend, append, after or before
			navDotPosition: 'append',
			// add class indicating how many
			// now dots are currently shown
			// use this to hide single dots
			navDotCountClass: true,
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
				navDotCount: prefix + '-count-',
				panelHidden: prefix + '-hidden',
				panelPartial: prefix + '-partial',
				panelVisible: prefix + '-visible'

			},

			tmpl : {
				navDotWrapper: ['<span><a href="javascript:void(0);">', '</a></span>'],
				navDotElement: '<img src="img/rtp-nav-dot-clear.gif" width="12" height="12" alt=""/>'
			},

			selector : {
				navDotImage: 'IMG'
			}


		});

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: init @@@
	prototype.plugin('init', function()
	{

		// create closure
		var self = this,
		    tmpl = self.tmpl,
		    conf = self.conf;

		// activate autoslide
		if (conf.navDots)
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
						tmpl.navDotWrapper[0] +
							tmpl.navDotElement +
						tmpl.navDotWrapper[1]
					)

						// add generic class to the item
						.addClass(self.klass.navDot)
						// add specific class to the item (with nr)
						.addClass([self.klass.navDot, i].join('-'))

						// attach click handler to the nav dot
						// use experimental fade mode if configured
						// TODO: refactor animate to avoid these nonsense arguments
						.click(function () { self.animate(self.conf.fader ? 'f' + i : '=' + i, null, null, null, true); })

						// append object to wrapper
						.appendTo(self.navDotWrapper);

					// get the nav dot image node
					var navDotImg = jQuery(conf.selector.navDotImage, navDot);

					// set some attributes for the image (overwrite format functions to personalize)
					if (isFn(conf.navDotAltFormat)) navDotImg.attr('alt', conf.navDotAltFormat.call(self, i));
					if (isFn(conf.navDotTitleFormat)) navDotImg.attr('title', conf.navDotTitleFormat.call(self, i));

					// collect all real dom nodes
					self.navDot.push(navDot.get(0));
					self.navDotImg.push(navDotImg.get(0));

					// setup the styles of this dot
					updateNavDotUI.call(self, i, 0);

				});

				// get configured function from node
				var fn = self.wrapper[conf.navDotPosition];
				// call to add wrapper to the main slider wrapper
				if (fn) fn.call(self.wrapper, self.navDotWrapper);

				// enable additional wrappers
				if (conf.navDotWrappers)
				{
					// these can be usefull to center them in all browsers
					self.navDotWrapper.wrap('<div class="rtp-nav-dots-outer">');
					self.navDotWrapper.wrap('<div class="rtp-nav-dots-wrapper">');
				}

			}
			// EO if slides > 1

		}
		// EO if conf.autoslide

		// call updateUI
		updateUI.call(this);

	});
	// @@@ plugin: init @@@


	// execute when slide visibility is changed (actual visibility)
	prototype.plugin('changedVisibility', updateVisibility);
	prototype.plugin('foobarVisibility', updateVisibility);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);