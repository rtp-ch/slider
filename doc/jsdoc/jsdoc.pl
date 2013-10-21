package JsDoc;

use strict;
use warnings;

# simple import
# for development
use Parser;

use Code;
use Scope;

my $id = 0;

# file helper module
use File::Slurp;

# read the complete test file
my $data = my $copy = read_file('../../release/rtp.slider.exp.js');

my $start_length = length($data);
my $start_lines = $data =~ tr/\n//;

# setup parser object
our $parser = { lines => 1, data => \ $data, offset => 0, parent => undef };

$parser->{'scope'} = new Scope($parser);

sub parserPosition2 ($)
{

	my ($parser) = @_;

	my $new_length = length(${$parser->{'data'}});
	my $new_lines = ${$parser->{'data'}} =~ tr/\n//;

	my $parsed = substr($copy, 0, $parser->{'offset'});

	return (
		offset => $parser->{'offset'},
		line => $parsed =~ tr/\n// + 1,
		col => $parsed =~ m/\n([^\n]+)\z/ ? length($1) : -1
	)

}

sub parserPosition ()
{
parserPosition2($parser);
}

our $parserPosition = \ &parserPosition;

$parser->{'class'} = sub
{
	my ($parser, $block, $name, $var) = @_;

	return if $name =~ m/^this\./;

	if ($var)
	{

	}
	else
	{
		unless (exists $parser->{'classes'}->{$name})
		{
			$parser->{'current'} = $name;
			$parser->{'classes'}->{$name} =
			{
				'id' => $id ++,
				'name' => $name,
				'caller' => {},
				'methods' => {},
				'plugins' => {},
				'triggers' => {},
				'scopes' => [],
				'functions' => [],
				'anonymous' => [],
				'scope' => $parser->{'scope'},
				'block' => $block,
				parserPosition
			};
		}
		else
		{
			warn "class $name already known";
		}
	}

	$var = $var ? 'local' : 'global';
	# print "declare $var class $name\n";
};

$parser->{'scoped'} = sub
{
	my ($parser, $block) = @_;
	my $class = $parser->{'current'};
	return unless $class;
	push @{$parser->{'classes'}->{$class}->{'scopes'}}, $parser->{'scope'} if $parser->{'scope'};
};
$parser->{'function'} = sub
{
	$id ++;
	my ($parser, $block, $name) = @_;
	$name = 'anonymous' unless $name;
	my $class = $parser->{'current'};
	return unless $class;
	push @{$parser->{'classes'}->{$class}->{'functions'}},
	{
		'id' => $id,
		'name' => $name,
		'block' => $block,
		'scope' => $parser->{'scope'},
		parserPosition
	};
	push @{$parser->{'scope'}->{'functions'}},
	{
		'id' => $id,
		'name' => $name,
		'block' => $block,
		'scope' => $parser->{'scope'},
		parserPosition
	};

	# print "new function : $name\n";
};

$parser->{'method'} = sub
{
	$id ++;
	my ($parser, $block, $name) = @_;
	my $class = $parser->{'current'};
	if (exists $parser->{'classes'}->{$class})
	{
		$parser->{'classes'}->{$class}->{'methods'}->{$name} =
		{
			'id' => $id,
			'name' => $name,
			'block' => $block,
			'scope' => $parser->{'scope'},
			parserPosition
		}
	}

	$parser->{'scope'}->{'methods'}->{$name} =
	{
		'id' => $id,
		'name' => $name,
		'block' => $block,
		'scope' => $parser->{'scope'},
		parserPosition
	}

};

$parser->{'plugin'} = sub
{
	$id ++;
	my ($parser, $block, $name, $prio) = @_;
	$name = substr($name, 1, -1);
	my $class = $parser->{'current'};
	$prio = 0 unless defined $prio;
	$prio = 0 if $prio eq '';
	$prio =~ s/\s+//;
	if (exists $parser->{'classes'}->{$class})
	{
		unless (exists $parser->{'classes'}->{$class}->{'plugins'}->{$name})
		{ $parser->{'classes'}->{$class}->{'plugins'}->{$name} = []; }
		push @{$parser->{'classes'}->{$class}->{'plugins'}->{$name}},
		{
			'id' => $id,
			'name' => $name,
			'prio' => $prio + 0,
			'block' => $block,
			'scope' => $parser->{'scope'},
			parserPosition
		};
	}
	unless (exists $parser->{'scope'}->{'plugins'}->{$name})
	{ $parser->{'scope'}->{'plugins'}->{$name} = []; }
	push @{$parser->{'scope'}->{'plugins'}->{$name}},
	{
		'id' => $id,
		'name' => $name,
		'prio' => $prio,
		'block' => $block,
		'scope' => $parser->{'scope'},
		parserPosition
	};
};

$parser->{'trigger'} = sub
{
	$id ++;
	my ($parser, $block, $name) = @_;
	$name = substr($name, 1, -1);
	my $class = $parser->{'current'};
	if (exists $parser->{'classes'}->{$class})
	{
		unless (exists $parser->{'classes'}->{$class}->{'triggers'}->{$name})
		{ $parser->{'classes'}->{$class}->{'triggers'}->{$name} = []; }
		push @{$parser->{'classes'}->{$class}->{'triggers'}->{$name}},
		{
			'id' => $id,
			'name' => $name,
			'block' => $block,
			'scope' => $parser->{'scope'},
			parserPosition
		};
	}
	unless (exists $parser->{'scope'}->{'triggers'}->{$name})
	{ $parser->{'scope'}->{'triggers'}->{$name} = []; }
	push @{$parser->{'scope'}->{'triggers'}->{$name}},
	{
		'id' => $id,
		'name' => $name,
		'block' => $block,
		'scope' => $parser->{'scope'},
		parserPosition
	};
};

$parser->{'caller'} = sub
{
	$id ++;
	my ($parser, $block, $name) = @_;
	my $class = $parser->{'current'};
	return unless $class;
	if (exists $parser->{'classes'}->{$class})
	{
		unless (exists $parser->{'classes'}->{$class}->{'callers'}->{$name})
		{ $parser->{'classes'}->{$class}->{'callers'}->{$name} = []; }
		push @{$parser->{'classes'}->{$class}->{'callers'}->{$name}},
		{
			'id' => $id,
			'name' => $name,
			'block' => $block,
			'scope' => $parser->{'scope'},
			parserPosition
		};
	}
	unless (exists $parser->{'scope'}->{'callers'}->{$name})
	{ $parser->{'scope'}->{'callers'}->{$name} = []; }
	push @{$parser->{'scope'}->{'callers'}->{$name}},
	{
		'id' => $id,
		'name' => $name,
		'block' => $block,
		'scope' => $parser->{'scope'},
		parserPosition
	};
};

# parse the main script scope
my $scope = parseBlock($parser, \ $data);

# check everything is parsed correctly
die "not everything parsed" if $data ne '';

foreach my $class (%{$parser->{'classes'}})
{
	foreach my $event (%{$parser->{'classes'}->{$class}->{'plugins'}})
	{
		next unless $parser->{'classes'}->{$class}->{'plugins'}->{$event};
		@{$parser->{'classes'}->{$class}->{'plugins'}->{$event}} =
		sort { $a->{'prio'} - $b->{'prio'} }
		@{$parser->{'classes'}->{$class}->{'plugins'}->{$event}}
	}
}


use Template;

  # some useful options (see below for full list)
  my $config = {
      INCLUDE_PATH => '.',  # or list ref
      INTERPOLATE  => 1,               # expand "$var" in plain text
      POST_CHOMP   => 1,               # cleanup whitespace
#      PRE_PROCESS  => 'header',        # prefix each template
      EVAL_PERL    => 1,               # evaluate Perl code blocks
  };

  # create Template object
  my $template = Template->new($config);




	my $code = Code->new($copy);

	foreach my $class (values %{$parser->{'classes'}})
	{
		foreach my $scope (values @{$class->{'scopes'}})
		{
			# $code->insert($scope->{'offset'}, '[scope ' . $scope->{'id'} . ']');
			$code->insert($scope->{'offset'}, '<<a id="id-' . $scope->{'id'} . '"/>>');
		}

		foreach my $function (values @{$class->{'functions'}})
		{
			# $code->insert($function->{'offset'}, '[function: '.$function->{'name'}.']');
			$code->insert($function->{'offset'}, '<<a id="id-' . $function->{'id'} . '"/>>');
		}

		foreach my $method (values %{$class->{'methods'}})
		{
			# $code->insert($method->{'offset'}, '[method: '.$method->{'name'}.' ('.$method->{'id'}.')]');
			$code->insert($method->{'offset'}, '<<a id="id-' . $method->{'id'} . '"/>>');
		}
		foreach my $plugins (values %{$class->{'plugins'}})
		{
			foreach my $plugin (@{$plugins})
			{
				# $code->insert($plugin->{'offset'}, '[plugin: '.$plugin->{'name'}.']');
				$code->insert($plugin->{'offset'}, '<<a id="id-' . $plugin->{'id'} . '"/>>');
			}
		}
		foreach my $triggers (values %{$class->{'triggers'}})
		{
			foreach my $trigger (@{$triggers})
			{
				my $fn = $trigger->{'scope'}->findFunction($trigger->{'name'}) if ref $trigger->{'scope'};
				$code->insert($trigger->{'offset'}, '<</a>>') if $fn;
				$code->insert($trigger->{'offset'}, '[event]') if $fn;
				$code->insert($trigger->{'offset'}, '<<a href="#id-' . $fn->{'id'} . '">>') if $fn;
				$code->insert($trigger->{'offset'}, '<<a id="id-' . $trigger->{'id'} . '"/>>');
			}
		}
		foreach my $callers (values %{$class->{'callers'}})
		{
			foreach my $callers (@{$callers})
			{

				my $fn = $callers->{'scope'}->findFunction($callers->{'name'}) if ref $callers->{'scope'};
				$code->insert($callers->{'offset'}, '<</a>>') if $fn;
				$code->insert($callers->{'offset'}, '[call]') if $fn;
				$code->insert($callers->{'offset'}, '<<a href="#id-' . $fn->{'id'} . '">>') if $fn;
				$code->insert($callers->{'offset'}, '<<a id="id-' . $callers->{'id'} . '"/>>');
			}
		}
	}

	my $class = $parser->{'classes'}->{'RTP.Slider'};

  # define template variables for replacement
  my $vars = {
      class  => $class,
      code => $code->render
#      var2  => \%hash,
#      var3  => \@list,
#      var4  => \&code,
#      var5  => $object,
  };

  # process input template, substituting variables
my $rv = $template->process('tmpl.html', $vars, 'jsdoc.html')
      || die $template->error();

foreach my $ns ('RTP.Slider')
{

	my $class = $parser->{'classes'}->{$ns};

	die $class;

}


