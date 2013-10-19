/*

  Copyright (c) Marcel Greter 2012 - ocbnet.ch - RTP Slider Demo
  This is free software; you can redistribute it and/or modify it under the terms
  of the [GNU General Public License](http://www.gnu.org/licenses/gpl-3.0.txt),
  either version 3 of the License, or (at your option) any later version.

*/

function init (slider)
{

	if (typeof slider == 'undefined')
	{ throw('slider not connected'); }

	var config = slider.conf;

	console.log('loaded ', config)

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

// on init
jQuery(function()
{

	jQuery('#configurator FORM').attr(
		'action', self.opener.document.location
	);

	var i = blocks.length; while (i--)
	{
		if (jQuery('#' + blocks[i]).length)
		{
			if (jQuery('INPUT[name=' + blocks[i] + ']').get(0).checked)
			{ jQuery('#' + blocks[i]).show(); }
			else { jQuery('#' + blocks[i]).hide(); }
		}
	}

	jQuery('#configurator')
		.find('INPUT[type=checkbox]')
		.change(function (evt)
		{
			if(this.checked)
			{ jQuery('#' + this.name).slideDown(); }
			else { jQuery('#' + this.name).slideUp(); }
		});

	// call parent method (calls our init method)
	if (self.opener && self.opener.setConfigurator)
	{ self.opener.setConfigurator(init); }

});
// EO on init