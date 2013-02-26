/*

  Copyright (c) Marcel Greter 2013 - ocbnet.ch - RTP jQuery Slider Progress Bar Plugin
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
			progressBar: false,

			// position of the dom nodes
			// we only need the first char
			// valid: prepend, append, both
			progressBarPosition: 'append',

			// templates fragments
			tmpl : {

				'progress-bar-append' : '<div class="rtp-progress-bar-append"></div>',
				'progress-bar-prepend' : '<div class="rtp-progress-bar-prepend"></div>'

			},

			// classes to assign
			klass : {

				'progress-bar' : 'rtp-progress-bar'

			}

		});
		// EO extend config

	});
	// @@@ EO plugin: config @@@


	// @@@ css @@@
	function css(value)
	{
		if (this.conf.vertical)
		{ return { height : value }; }
		else { return { width : value }; }
	}
	// @@@ EO css @@@


	// @@@ stopProgressBar @@@
	function stopProgressBar ()
	{

		// prevent early calls
		if (!this.progressbar) return;

		// stop previous animation
		this.progressbar
			.stop(true)
			.css(
				css.call(this, '0%')
			);

	}
	// @@@ EO stopProgressBar @@@


	// @@@ startProgressBar @@@
	function startProgressBar (delay)
	{

		// prevent animation
		if (!delay) return;

		// prevent early calls
		if (!this.progressbar) return;

		// stop previous animation
		stopProgressBar.call(this);

		// animate progressbar
		this.progressbar
			.stop(true)
			.css(
				css.call(this, '0%')
			)
			.animate(
				css.call(this, '100%'),
				delay
			)

	}
	// @@@ EO startProgressBar @@@


	// @@@ plugin: init @@@
	prototype.plugin('init', function()
	{

		// create closure
		var self = this;

		// activate autoslide
		if (self.conf.progressBar)
		{

			// create the progress bar jQuery collection
			var progressbar = jQuery();

			// get the configured position for progress bar (first char lowercase)
			var position = this.conf.progressBarPosition.substr(0,1).toLowerCase();

			// check if we should prepend the progress bar
			if (position == 'p' || position == 'b')
			{

				// create the progress bar dom node
				var node = jQuery(
					this.tmpl['progress-bar-prepend'],
					this.tmpl['progress-bar']
				);

				// add this node the jQuery collection
				progressbar = progressbar.add(node);

				// prepend node to the wrapper
				this.wrapper.prepend(node);

			}
			// EO if prepend

			// check if we should prepend the progress bar
			if (position == 'a' || position == 'b')
			{

				// create the progress bar dom node
				var node = jQuery(
					this.tmpl['progress-bar-append'] ||
					this.tmpl['progress-bar']
				);

				// add this node the jQuery collection
				progressbar = progressbar.add(node);

				// append node to the wrapper
				this.wrapper.append(node);

			}
			// EO if append

			// store object to slide instance
			this.progressbar = progressbar;

			// add our standard class name to dom nodes
			progressbar.addClass(this.conf.klass['progress-bar'])

			// call the stop function
			stopProgressBar.call(this);

		}
		// EO if conf.progressBar

	});
	// @@@ plugin: init @@@


	// hook into various change events to adjust progress bars
	prototype.plugin('autoslideWaitStop', stopProgressBar);
	prototype.plugin('autoslideWaitStart', startProgressBar);


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);