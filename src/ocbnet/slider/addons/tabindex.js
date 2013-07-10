/*

  Copyright (c) Marcel Greter 2013 - ocbnet.ch - RTP jQuery Slider TabIndex Plugin
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

			// enable plugin
			adjustTabIndex: true

		});
		// EO extend config

	});
	// @@@ EO plugin: config @@@


	// @@@ plugin: ready @@@
	prototype.plugin('ready', function ()
	{

		// check if feature is enabled
		if (!this.conf.adjustTabIndex) return;

		// fetch all links within the slides
		var i = this.slides.length; while (i --)
		{
			var slide = jQuery(this.slides[i]);
			slide.data('links', jQuery('A', slide))
		}

		// first disable all links in all panels
		// links in cloned panels are never selectable
		jQuery('A', this.panels).attr('tabindex', '-1');

	});
	// @@@ EO plugin: ready @@@


	// @@@ plugin: changedSlideVisibility @@@
	prototype.plugin('changedSlideVisibility', function (slide, visible)
	{

		// check if feature is enabled
		if (!this.conf.adjustTabIndex) return;

		// reset the tabindex for all links in this slide
		jQuery(slide).data('links').attr('tabindex', visible ? '' : '-1');

	});
	// @@@ EO plugin: changedSlideVisibility @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);