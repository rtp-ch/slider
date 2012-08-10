// taken from http://api.jquery.com/jQuery.cssHooks/

(function($) {

	if ( !$.cssHooks )
	{
		throw("jQuery 1.4.3+ is needed for this plugin to work");
		return;
	}

	var css3 = [
		'boxSizing',
		'transform',
		'perspective',
		'transformStyle',
		'backfaceVisibility'
	];

	function styleSupport( prop )
	{

		var vendorProp, supportedProp,
		    capProp = prop.charAt(0).toUpperCase() + prop.slice(1),
		    prefixes = [ "Moz", "Webkit", "O", "ms" ],
		    div = document.createElement( "div" );

		if ( prop in div.style )
		{
			supportedProp = prop;
		}
		else
		{
			for ( var i = 0; i < prefixes.length; i++ )
			{
				vendorProp = prefixes[i] + capProp;
				if ( vendorProp in div.style )
				{
					supportedProp = vendorProp;
					break;
				}
			}
		}

		div = null;

		$.support[ prop ] = supportedProp

		return supportedProp;

	}

	var i = css3.length; while (i--)
	{

		(function()
		{

			var attr = css3[i],
					support = styleSupport( attr );

			// Set cssHooks only for browsers that
			// supports a vendor-prefixed style only
			if ( support && support !== attr )
			{
				$.cssHooks[attr] =
				{
					get: function( elem, computed, extra )
					{
						return $.css( elem, support );
					},
					set: function( elem, value)
					{
						elem.style[ support ] = value;
					}
				};
			}

		})()

	}

})(jQuery);

