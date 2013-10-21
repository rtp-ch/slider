package Code;

use strict;
use warnings;

sub new
{

	my ($pkg, $code) = @_;

	my $self =
	{
		'code' => $code,
		'inserts' => []
	};

	return bless $self, $pkg;

}

sub render
{

	my ($self) = @_;

	my $code = $self->{'code'};

	@{$self->{'inserts'}} = sort {

		$b->[0] - $a->[0]

	} @{$self->{'inserts'}};

	foreach my $insert
	(@{$self->{'inserts'}})
	{

		substr($code, $insert->[0], 0, $insert->[1]);

	}

	$code =~ s/&/&amp;/gm;
	$code =~ s/</&lt;/gm;
	$code =~ s/>/&gt;/gm;

	$code =~ s/&amp;&amp;/&/gm;
	$code =~ s/&lt;&lt;/</gm;
	$code =~ s/&gt;&gt;/>/gm;

	return $code;

}

sub insert
{

	my ($self, $offset, $text) = @_;

	push @{$self->{'inserts'}}, [$offset, $text];

	return $self;

}



1;