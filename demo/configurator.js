/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP Slider Demo
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

var connected;

function init (slider, con)
{

	connected = con

	var config = slider.conf;

	var texts = [
		'align',
		'slideFirst',
		'panelsVisible',
		'autoslideDelay',
		'autoslideAction',
		'autoslideFirstDelay',
		'autoslideResumeDelay'
	];

	var selects = [
		'sizer'
	];

	var checkboxes = [
		'swipe',
		'touchSwipe',
		'mouseSwipe',
		'carousel',
		'carousel3d',
		'vertical',
		'autoslide',
		'navDots',
		'navArrows',
		'navToolbar',
		'navKeyboard',
		'fillViewport',
		'shrinkViewport',
		'autoslidePauseOnHover',
		'autoslideStopOnHover',
		'autoslideStopOnAction'
	];

	var blocks = [
		'swipe',
		'autoslide'
	];

	var i = blocks.length; while (i--)
	{
		if (jQuery('#' + blocks[i]).length)
		{
			if (config[blocks[i]])
			{
				jQuery('#' + blocks[i]).show();
			}
		}
	}

	var i = texts.length; while (i--)
	{
		jQuery('#configurator')
			.find('INPUT[name=' + texts[i] + ']')
			.val(config[texts[i]])
	}

	var i = selects.length; while (i--)
	{
		jQuery('#configurator')
			.find('SELECT[name=' + selects[i] + ']')
			.val(config[selects[i]])
	}

	var i = checkboxes.length; while (i--)
	{
		jQuery('#configurator')
			.find('INPUT[name=' + checkboxes[i] + ']')
			.get(0).checked = config[checkboxes[i]];
	}

}

jQuery(function()
{

	var blocks = [ 'autoslide', 'swipe' ];

	var i = blocks.length; while (i--)
	{
		if (jQuery('#' + blocks[i]).length)
		{
			if (jQuery('INPUT[name=' + blocks[i] + ']').get(0).checked)
			{
				jQuery('#' + blocks[i]).show();
			}
			else
			{
				jQuery('#' + blocks[i]).hide();
			}
		}
	}

	jQuery('#configurator')
		.find('INPUT[type=checkbox]')
		.change(function (evt) {

			if(this.checked)
			{
				jQuery('#' + this.name).slideDown();
			}
			else
			{
				jQuery('#' + this.name).slideUp();
			}

		});

	if (self.opener && self.opener.setConfigurator)
	{ self.opener.setConfigurator(self); }

});