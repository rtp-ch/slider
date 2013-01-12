/*

  Copyright (c) Marcel Greter 2012 - rtp.ch - RTP jQuery Slider Panels By Viewport Sizer
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

  Distribute the width of the viewport evenly to all visibile panels.
  Maybe add distribution factors or fixed widths for panels later.
  This sizer adjusts the panels if the viewport dimension changes.

*/

// extend class prototype
(function (prototype, jQuery)
{

	// @@@ plugin: changedViewportDim @@@
	prototype.plugin('changedViewport', function ()
	{

		// check if this sizer is enabled
		if (
			(!this.conf.vertical) &&
			this.conf.sizer == 'panelsByViewport'
		)
		{

			// set the panel dimensions from vp_x
			// this will update the panel dom nodes
			// will also recalculate all panel offsets
			this.setSlidesDimFromVp();

			// read the new panel height from UA
			// updates the ps[1] and pd[1] arrays
			this.trigger('readPanelsOpp');


			// this.trigger('layout');

			// update the panel visibility
			this.trigger('readPanelVisibility');

		}

	});
	// @@@ EO plugin: changedViewportDim @@@



	// @@@ method: getSlideDimFromVp @@@
	// get the dimension for the given slide
	prototype.getSlideDimFromVp = function (slide)
	{

		// declare and normalize slide
		// var panel = this.slide2panel(slide),
		//     slide = this.panel2slide(panel);

		// we currently distribute everything evenly to all slides
		// todo: implement a more complex sizer with distribution factors
		return parseInt(this.vp_x / this.conf.panelsVisible + 0.5, 10)

	}
	// @@@ EO method: getSlideDimFromVp @@@


	// @@@ method: setSlidesDimFromVp @@@
	// get the dimension for all slides
	prototype.setSlidesDimFromVp = function()
	{

		// process all slides
		var i = this.slides.length; while (i--)
		{
			// set the slide size to calculated value
			this.setSlideDim(i, this.getSlideDimFromVp(i));
		}

		// calculate the new panel offsets
		// this will update the offset array
		// panel dimensions are taken from pd[0]
		this.updatePanelsOffset();

	}
	// @@@ EO method: setSlidesDimFromVp @@@


// EO extend class prototype
})(RTP.Slider.prototype, jQuery);
