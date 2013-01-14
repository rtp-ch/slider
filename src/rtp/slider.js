/*

  Copyright (c) Marcel Greter 2010/2012 - rtp.ch - RTP jQuery Slider
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

// START anonymous scope
(function(jQuery)
{

	// declare our namespace
	if (!window.RTP) window.RTP = {};

	/* @@@@@@@@@@ CONSTRUCTOR @@@@@@@@@@ */
	RTP.Slider = function (el, conf)
	{

		// create closure for
		// resize event handler
		var slider = this;

		// only init once
		if (slider.inited) { return; }
		else { slider.inited = true; }

		// @@@ private fn: extend @@@
		function extend (config)
		{

			// add more default configuration options (deep extend)
			return slider.conf = jQuery.extend(true, config, slider.conf);

		}
		// @@@ EO private fn: extend @@@

		// first store given config
		slider.conf = conf;

		// add defaults
		extend({

			// the panel alignment to the position
			align: 'center',
			// inherit from align
			alignPanel: false,
			alignViewport: false,

			// vertical sliding is also supported
			vertical: false,

			// set float parameter for panels
			// will not be set if vertical is true
			setFloat: true,

			// enable endless carousel
			carousel: false,

			// the first slide to load after init
			// this can also be a callback function
			slideFirst: 0,

			// how many panels should be visible
			// mainly used for the layout sizers, but
			// also defines how many panels are cloned
			panelsVisible: 1,

			// how many panels should be cloned
			// if this is set to 0, we will use
			// the panelsVisible option for this
			clonePanels: 0,

			// in which direction should we clone
			// adds cloned panels before or after
			cloneAfter: true,
			cloneBefore: true,

			// initialize some structures
			// they can be used by plugins

			// localized texts
			text: {},

			// templates fragments
			tmpl:
			{
				wrapper : '<div class="rtp-slider-wrapper"></div>',
				container : '<div class="rtp-slider-container"></div>'
			},

			// classes to assign
			klass:
			{
				next: 'next',
				current: 'current',
				previous: 'previous',
				vertical: 'rtp-slider-vertical',
				horizontal: 'rtp-slider-horizontal'
			},

			// dom css selectors
			selector:
			{
				panel : 'DIV.rtp-slider-panel',
				container : 'DIV.rtp-slider-container'
			}

		});

		// execute all config hooks
		// this will add more defaults
		slider.trigger('config', extend);

		// assign shortcuts to access nested config
		jQuery(['text', 'tmpl', 'klass', 'selector'])
		.each(function() { slider[this] = slider.conf[this]; })

		// assertion for some options
		if (isNaN(slider.conf.align))
		{ slider.conf.align = 0.5; }
		if (isNaN(slider.conf.panelsVisible))
		{ slider.conf.panelsVisible = 0.5; }

		// current element is used as our viewport
		var viewport = slider.viewport = jQuery(el);

		// get all intial panels (slides) once at startup (after config)
		var slides = slider.slides = viewport.find(slider.selector.panel);

		// put a wrapper around everything
		var wrapper = slider.wrapper = viewport
			.wrapAll(slider.tmpl.wrapper).parent();

		// wrap all panels into container
		var container = slider.container = viewport
			.wrapInner(slider.tmpl.container)
				.find(slider.selector.container);

		// min and max index for slides
		slider.smin = slider.smax = 0;

		// markup the wrapper if we are vertical/horizontal
		if (slider.conf.vertical && slider.klass.vertical)
		{ slider.wrapper.addClass(slider.klass.vertical); }
		if (!slider.conf.vertical && slider.klass.horizontal)
		{ slider.wrapper.addClass(slider.klass.horizontal); }

		// first slide to load may be a function
		slider.position = jQuery.isFunction(slider.conf.slideFirst)
			? slider.conf.slideFirst.call(slider)
			: slider.conf.slideFirst || 0;

		// @@@ private fn: resolve_align @@@
		// this can be a number between -INF and +INF
		// or you can use "left", "center" or "right"
		function resolve_align (key, preset)
		{

			// get configured option
			var align = slider.conf[key];

			// check if align matches any of our strings
			if (new RegExp(/^l/i).test(align)) align = 0.0;
			if (new RegExp(/^c/i).test(align)) align = 0.5;
			if (new RegExp(/^r/i).test(align)) align = 1.0;

			// now check if it's valid or use given preset
			if (isNaN(parseInt(align, 10))) align = preset;
			// maybe there was no preset given, check again
			if (isNaN(parseInt(align, 10))) align = 0.5;

			// assign and return the number
			return slider.conf[key] = align;

		}
		// EO @@@ private fn: resolve_align @@@

		// first resolve the shared value to inherit from
		var preset = resolve_align('align', 0.5);
		// then resolve the specific align options
		resolve_align('alignViewport', preset);
		resolve_align('alignPanel', preset);

		// init array always
		// avoid checks in code
		slider.cloned = jQuery();

		// create cloned panels
		if (slider.conf.carousel)
		{

			// Clone as many panels needed to fill the viewport.
			// If sizer is false you can use this config option
			// to adjust how many panels you want to have cloned
			// In this mode the viewport might be much wider than
			// all panels inside. Todo: Maybe support this better.
			var panelsToClone = slider.conf.clonePanels ||
			                    Math.ceil(slider.conf.panelsVisible);

			// distribute cloned panels before (left/top)
			var cloneBefore = slider.conf.cloneBefore === false ? 0 :
				isNaN(slider.conf.cloneBefore) ? slider.conf.cloneBefore :
				Math.ceil(panelsToClone * (1 - slider.conf.alignViewport) + 0.5);

			// distribute cloned panels after (right/bottom)
			var cloneAfter = slider.conf.cloneAfter === false ? 0 :
				isNaN(slider.conf.cloneAfter) ? slider.conf.cloneAfter :
				Math.ceil(panelsToClone * (0 + slider.conf.alignViewport) + 0.5);


			// accumulate all cloned panels
			// we may clone each slide more than once
			var after = jQuery([]), before = jQuery([]);

			// I will clone as many as you wish
			while (cloneBefore > slides.length)
			{
				// remove a full set of slides
				cloneBefore -= slides.length;
				// clone and add another full set
				jQuery.merge(before, slides.clone());
			}

			// clone panels before
			if (cloneBefore > 0)
			{
				// clone panels from end to extend the container
				before = jQuery.merge(slides.slice(- cloneBefore).clone(), before);
			}

			// I will clone as many as you wish
			while (cloneAfter > slides.length)
			{
				// remove a full set of slides
				cloneAfter -= slides.length;
				// clone and add another full set
				jQuery.merge(after, slides.clone());
			}

			// clone panels after
			if (cloneAfter > 0)
			{
				// clone panels from begining to extend the container
				jQuery.merge(after, slides.slice(0, cloneAfter).clone());
			}

			// append the cloned panels to the container and set class
			after.appendTo(slider.container).addClass('cloned');
			before.prependTo(slider.container).addClass('cloned');

			// increase min and max slide index
			slider.smax += after.length;
			slider.smax += before.length;
			slider.smin += before.length;

			// all cloned panels
			var cloned = [];
			// merge other array into
			jQuery.merge(cloned, before);
			jQuery.merge(cloned, after)

			// store the cloned panels
			slider.cloned = cloned;
			slider.before = before;
			slider.after = after;

		}
		// EO if conf.carousel

		// execute all init hooks
		slider.trigger('init');

		// lookup panels - equals slides if carousel == false
		slider.panels = viewport.find(slider.selector.panel);

		// to which side should we float the panels / container
		var floating = slider.conf.offsetReverse ? 'right' : 'left';

		if (slider.conf.vertical) floating = 'none';

		var overflow = slider.conf.carousel3d ? 'visible' : 'hidden';

		// set some css to fix some issues
		// if you do not want this you have
		// to remove these styles on ready event
		slider.viewport
			.css({
				'overflow' : overflow
			});

		slider.panels
			.css({
				'float' : floating
			})
			.add(slider.viewport)
			.add(slider.container)
			.css({
				'zoom' : 1,
				// 'overflow' : overflow,
				'position' : 'relative'
			});

/*
if (slider.conf.vertical)
{
		slider.viewport.css({
			'min-height': '50px'
		});
		slider.container.css({
			'top': '0px',
			'left': '0px',
			'right': '0px',
			'bottom': '0px',
			'position': 'absolute'
		});
}
*/

		// setup floats for the container
		if (!slider.conf.vertical)
		{
			// we either float the container right or left
			slider.container.css('float', floating)
				// insert a float clearing div after the container
				.after('<DIV style="clear:both;"/>');
		}

		// private named function
		// execute when images loaded
		function loaded ()
		{

			// trigger ready hook
			slider.trigger('ready');

		};
		// EO fn loaded

		// defer until all images are loaded
		// otherwise we will not get valid info
		// about resource dimensions like images
		jQuery('IMG', viewport).imagesLoaded().done(loaded);

	};
	/* @@@@@@@@@@ CONSTRUCTOR @@@@@@@@@@ */


	/* @@@@@@@@@@ RTP CLASS @@@@@@@@@@ */
	(function (prototype, jQuery)
	{

		// @@@ method: panel2panel @@@
		prototype.panel2panel = function(panel)
		{
			// adjust for carousel
			if (this.conf.carousel)
			{
				// adjust panels into the valid range
				while (panel > this.smax) panel -= this.slides.length;
				while (panel < this.smin) panel += this.slides.length;
			}
			else
			{
				// adjust panels to outer ranges
				if (panel > this.smax) panel = this.smax;
				if (panel < this.smin) panel = this.smin;
			}
			// return the in range panel
			return panel;
		}
		// @@@ EO method: panel2panel @@@


		// @@@ method: slide2panel @@@
		prototype.slide2panel = function(slide)
		{
			return this.panel2panel(slide + this.smin);
		}
		// @@@ EO method: slide2panel @@@


		// @@@ method: panel2slide @@@
		prototype.panel2slide = function (panel)
		{
			return this.panel2panel(panel) - this.smin;
		}
		// @@@ EO method: panel2slide @@@


		// @@@ method: panel2slide @@@
		prototype.slide2slide = function (slide)
		{
			return this.panel2slide(this.slide2panel(slide));
		}
		// @@@ EO method: panel2slide @@@


	// EO extend class prototype
	})(RTP.Slider.prototype, jQuery);
	/* @@@@@@@@@@ RTP CLASS @@@@@@@@@@ */


	/* @@@@@@@@@@ JQUERY CONNECTOR @@@@@@@@@@ */
	jQuery.fn.rtpSlider = function(conf)
	{
		return this.each(function(){
			// check if already initialized
			if (typeof jQuery(this).data('rtp-slider') == 'undefined')
			{ jQuery(this).data('rtp-slider', new RTP.Slider(this, conf)); }
			// else { rtp.log('tried to init slider twice') }
		});
	}
	/* @@@@@@@@@@ JQUERY CONNECTOR @@@@@@@@@@ */


// END anonymous scope
})(jQuery);

