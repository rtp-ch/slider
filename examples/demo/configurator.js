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

	// console.log('loaded ', config)

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

	var i = floats.length; while (i--)
	{
		jQuery('#configurator')
			.find('INPUT[name=' + floats[i] + ']')
			// .val(isNaN(config[floats[i]]) ? '' : config[floats[i]])
			.val(config[floats[i]])
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

	try
	{
		jQuery('#configurator FORM').attr(
			'action', self.opener.document.location
		);
	} catch (e) {}

	jQuery('#configurator')
		.find('INPUT[type=checkbox]')
		.change(function (evt)
		{
			if(this.checked)
			{ jQuery('#' + this.name).slideDown(); }
			else { jQuery('#' + this.name).slideUp(); }
		});

	// refresh function
	function refresh ()
	{

		if ( self.opener ) {
			try {
				if ( self.opener.setConfigurator )
				{ self.opener.setConfigurator(init); }
				else { alert('wrong opener connected'); }
				jQuery('INPUT[name="inline"]').prop('checked', jQuery('BODY', self.opener.document).hasClass('inlined'))
			} catch (e) { alert('wrong opener connected'); }
		}
		else if (self.parent)
		{
			init(self.parent.slider)

			jQuery('INPUT[name="inline"]').prop('checked', jQuery('BODY', self.parent.document).hasClass('inlined'))

		}
		else { alert('no opener connected'); }

		var i = blocks.length; while (i--)
		{
			if (jQuery('#' + blocks[i]).length)
			{
				if (jQuery('INPUT[name=' + blocks[i] + ']').get(0).checked)
				{ jQuery('#' + blocks[i]).show(); }
				else { jQuery('#' + blocks[i]).hide(); }
			}
		}

	}

	jQuery('INPUT.refresh').click(refresh);

	var attachedParent = jQuery('DIV.attached-parent');
	var attachedSlider = jQuery('DIV.attached-slider');

	window.setInterval(function()
	{

		try { if (self.calledby) self.calledby.popup = self; } catch (e) {}

		try {
			if (self.calledby) attachedParent.css('background', 'green');
			else if (self.parent) attachedParent.css('background', 'blue');
			else attachedParent.css('background', 'orange');
		} catch (e) { attachedParent.css('background', 'red'); }

		try {
			if (self.calledby && self.calledby.slider)
			{ attachedSlider.css('background', 'green'); }
			else if (self.parent && self.parent.slider)
			{ attachedSlider.css('background', 'blue'); }
			else { attachedSlider.css('background', 'orange'); }
		} catch (e) { attachedSlider.css('background', 'red'); }

	}, 500);

	refresh();

});
// EO on init