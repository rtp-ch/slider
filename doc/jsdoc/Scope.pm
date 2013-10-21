package Scope;

use strict;
use warnings;

my $id = 20000;

sub new
{

	my ($pkg, $parser, $name) = @_;

	if ($name && $name =~ m/\A[\'\"]/)
	{ $name = substr($name, 1, -1); }

	my $self =
	{
		'id' => $id ++,
		'name' => $name,
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

sub name
{

	my ($self) = @_;

	if ( $self->{'name'} )
	{ return $self->{'name'}; }

	if ( $self->{'parent'} )
	{ return $self->{'parent'}->name }

	return undef

}

sub named
{

	my ($self) = @_;

	if ( $self->{'name'} )
	{ return $self; }

	if ( $self->{'parent'} )
	{ return $self->{'parent'}->name }

	return undef

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