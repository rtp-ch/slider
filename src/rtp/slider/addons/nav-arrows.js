/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Navigation Arrows Plugin
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// extend class prototype
(function (prototype, jQuery)
{

	'use strict';


	// @@@ updateUI @@@
	var updateUI = function(duration)
	{

		// get the prev/next nodes
		var prev = this.arrows.prev;
		var next = this.arrows.next;

		// is carousel mode?
		if (this.conf.carousel)
		{

			// prev/next links are always shown in carousel mode
			if(!prev.is(':visible')) prev.stop(true, true).show();
			if(!next.is(':visible')) next.stop(true, true).show();

		}
		else
		{

			// show/hide prev/next scroll navigation by slide position
			if (isNaN(duration)) duration = this.conf.slideEaseDuration;

			if(this.position < this.smin + 1) // show/hide prev links
			{ if(prev.is(':visible')) prev.stop(true, true).fadeOut(duration); }
			else { if(!prev.is(':visible')) prev.stop(true, true).fadeIn(duration); }

			if(this.position > this.smax - 1) // show/hide next links
			{ if(next.is(':visible')) next.stop(true, true).fadeOut(duration); }
			else { if(!next.is(':visible')) next.stop(true, true).fadeIn(duration); }

		}

	}
	// @@@ EO updateUI @@@

	// hook into rtp slider class
	prototype.plugin('layout', updateUI);

	// hook into rtp slider class
	prototype.plugin('config', function(extend)
	{

		// add defaults
		extend({

			navArrows: false, // should we generate navigation arrows
			navArrowAttach: 'wrapper', // wrapper or panels
			navArrowPosition: 'default', // prepend, reverse, append
			navArrowPrevText: '&#171; left', // text/html for the previous link
			navArrowNextText: 'right &#187;', // text/html for the next link

			tmpl : {

				'arrow-prev' : ['<div class="rtp-nav-prev"><a href="javascript:void(0)">', '</a></div>'],
				'arrow-next' : ['<div class="rtp-nav-next"><a href="javascript:void(0)">', '</a></div>']

			},

			selector : {

				'nav-prev' : '.rtp-nav-prev A',
				'nav-next' : '.rtp-nav-next A'

			}

		});

	});

	// hook into rtp slider class
	prototype.plugin('init', function(extend)
	{

		// declare and init navigation arrows
		this.arrows = { prev : jQuery(), next : jQuery() };

		// initialize navigation arrows
		if (this.conf.navArrows)
		{

			// get default methods for the insert
			var navPositionNext = this.viewport.append;
			var navPositionPrev = this.viewport.prepend;

			// switch positions by given configuration
			switch(this.conf.navArrowPosition.substr(0,1))
			{
				case 'r': // reverse
					navPositionPrev = this.viewport.append;
					navPositionNext = this.viewport.prepend;
				break;
				case 'p': // prepend
					navPositionNext = this.viewport.prepend;
				break;
				case 'a': // append
					navPositionPrev = this.viewport.append;
				break;
			}

			// where should the arrows be attached to (inside each panel or once for all within wrapper)
			var el = this.conf.navArrowAttach.substring(0,1) == 'p' ? this.panels : this.wrapper;

			// add prev/next navigation items (will be shown or hidden by other application settings)
			var txt_prev = this.conf.navArrowPrevText, txt_next = this.conf.navArrowNextText;
			if (txt_prev) navPositionPrev.call(el, this.tmpl['arrow-prev'][0] + txt_prev + this.tmpl['arrow-prev'][1]);
			if (txt_next) navPositionNext.call(el, this.tmpl['arrow-next'][0] + txt_next + this.tmpl['arrow-next'][1]);

			// get the actual dom nodes by selecting them from the wrapper
			this.arrows.prev = this.wrapper.find(this.selector['nav-prev']);
			this.arrows.next = this.wrapper.find(this.selector['nav-next']);

			// attach prev/next arrow click (prevent event bubbeling)
			if (this.arrows.prev) this.arrows.prev.click(jQuery.proxy(function() { this.goPrev(); return false; }, this));
			if (this.arrows.next) this.arrows.next.click(jQuery.proxy(function() { this.goNext(); return false; }, this));

			// update ui immediately
			updateUI.call(this, 0);

		};
		// EO if conf.navArrows

	});
	// EO init hook

// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
