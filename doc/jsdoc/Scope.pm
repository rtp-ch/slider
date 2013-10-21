package Scope;

use strict;
use warnings;

my $id = 20000;

sub new
{

	my ($pkg, $parser) = @_;

	my $self =
	{
		'id' => $id ++,
		'caller' => {},
		'methods' => {},
		'plugins' => {},
		'triggers' => {},
		'functions' => [],
		'anonymous' => [],
		JsDoc::parserPosition()
	};

	return bless $self, $pkg;

}

sub scopeList
{

	my ($self, $name) = @_;

	my $list = '.' . $self->{'id'};

	if ($self->{'parent'})
	{ $list .= $self->{'parent'}->scopeList; }

	return  $list

}

sub findFunction
{

	my ($self, $name) = @_;

	my $functions = $self->{'functions'};

	my $i = scalar(@{$functions || []}); while($i--)
	{
		if ($functions->[$i]->{'name'} eq $name)
		{
			return $functions->[$i];
		}
	}

	$functions = $self->{'methods'}->{$name};
	return $functions if $functions;

#	my $i = scalar(@{$functions || []}); while($i--)
#	{
#		if ($functions->[$i]->{'name'} eq $name)
#		{
#			return $functions->[$i];
#		}
#	}

	return $self->{'parent'}->findFunction($name) if $self->{'parent'};

	return undef;

}


1;