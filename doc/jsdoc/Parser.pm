use strict;
use warnings;

our $re_id = qr/[_a-zA-Z\$][_a-zA-Z0-9]*/s;
our $re_apo = qr/(?:[^\'\\]+|\\.)*/s;
our $re_quot = qr/(?:[^\"\\]+|\\.)*/s;
our $re_float = qr/[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/;
our $re_string = qr/(?:\'$re_apo\'|\"$re_quot\")/s;

sub parseApo
{

	my ($parser, $data) = @_;
	my $string = '';

	# print "apo\n";

	while(${$data})
	{
		if (${$data} =~ s/\A\n//)
		{
			$string .= "\n";
			$parser->{'line'} ++;
			$parser->{'offset'} ++;
		}
		elsif (${$data} =~ s/\A\'//)
		{
			$string .= "'";
			$parser->{'offset'} ++;
			return $string;
		}
		elsif (${$data} =~ s/\A(\\.|[^\'])//)
		{
			$string .= $1;
			$parser->{'offset'} += length($1);
		}
		else { die '>>' . substr(${$data}, 0, 10), "\n"; }
	}

}

sub parseQuot
{

	my ($parser, $data) = @_;
	my $string = '';

	# print "quot\n";

	while(${$data})
	{
		if (${$data} =~ s/\A\n//)
		{
			$string .= "\n";
			$parser->{'line'} ++;
			$parser->{'offset'} ++;
		}
		elsif (${$data} =~ s/\A\"//)
		{
			$string .= '"';
			$parser->{'offset'} ++;
			return $string;
		}
		elsif (${$data} =~ s/\A((?:[^\"\\]+|\\.)*)//)
		{
			$string .= $1;
			$parser->{'offset'} += length($1);
		}
		else { die '>>' . substr(${$data}, 0, 10), "\n"; }
	}

}

sub parseRegex
{

	my ($parser, $data) = @_;
	my $string = '';

	while(${$data})
	{
		if (${$data} =~ s/\A\n//)
		{
			$string .= "\n";
			$parser->{'line'} ++;
			$parser->{'offset'} ++;
		}
		elsif (${$data} =~ s/\A\///)
		{
			$string .= '/';
	 		$parser->{'offset'} ++;
			# print "regex $string\n";
			return $string;
		}
		elsif (${$data} =~ s/\A(\\.|[^\/])//)
		{
			$string .= $1;
			$parser->{'offset'} += length($1);
		}
		else { die '>>' . substr(${$data}, 0, 10), "\n"; }
	}

}

sub parseScope
{

	my $string = '';

	my ($parser, $data, $name) = @_;

	# get rid of possible comments
	$string .= parseComments($parser, $data);

	# try to parse a statement (list may be empty)
	$string .= parseList($parser, $data);

	while (${$data} =~ s/\A(\s*;\s*)//)
	{

		# seperator
		$string .= $1;

		$parser->{'offset'} += length($1);

		# get rid of possible comments
		$string .= parseComments($parser, $data);

		$string .= parseList($parser, $data);

	}

	return $string;

}

sub parseList
{

	my $string = '';

	my ($parser, $data) = @_;

	# get rid of possible comments
	$string .= parseComments($parser, $data);


	# try to parse a statement (list may be empty)
	$string .= parseStatements($parser, $data);

	while (${$data} =~ s/\A(\s*,\s*)//)
	{

		# seperator
		$string .= $1;

		$parser->{'offset'} += length($1);

		# get rid of possible comments
		$string .= parseComments($parser, $data);

		$string .= parseStatements($parser, $data);

	}

	return $string;

}

sub parseStatements
{

	my $string = '';

	my ($parser, $data) = @_;

	# get rid of possible comments
	$string .= parseComments($parser, $data);

	# try to parse one statement
	$string .= parseStatement($parser, $data);

	while (${$data} =~ s/\A(\s*[\&\|\=]{1,3}\s*)//)
	{

		# operator
		$string .= $1;

		$parser->{'offset'} += length($1);

		# get rid of possible comments
		$string .= parseComments($parser, $data);

		# now parse a further statement
		$string .= parseStatement($parser, $data);

	}

	return $string;

}

sub parseStatement
{

	my $string = '';

	my ($parser, $data) = @_;

	PARSESTATEMENT:

	# get rid of possible comments
	$string .= parseComments($parser, $data);

	# parse statement prefixer
	if (${$data} =~ s/\A(\!|\+\+|\-\-|\~)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		goto PARSESTATEMENT;
	}

	if (${$data} =~ s/\A(($re_id\.)*?prototype\.($re_id)\s*=\s*function)//)
	{
		my $found = $1;
		$string .= $1; my $name = $3;
		my $offset = $parser->{'offset'};
		$string .= parseComments($parser, $data);
		$parser->{'offset'} += length($found);
		$string .= parseParentheses($parser, $data);
		$string .= parseComments($parser, $data);
		$string .= parseBlock($parser, $data, $name);
		my $foo = $parser->{'offset'};
		$parser->{'offset'} = $offset;
		$parser->{'method'}->($parser, {}, $name);
		$parser->{'offset'} = $foo;
		goto PARSESTATEMENT;
	}
	elsif (${$data} =~ s/\A((var)?\s*($re_id\.*?($re_id))\s*=\s*function)//)
	{
		my $found = $1;
		$string .= $1; my ($var, $name) = ($2, $3);
		# $parser->{'current'} = $name;
		my $offset = $parser->{'offset'};
		$string .= parseComments($parser, $data);
		$parser->{'offset'} += length($found);
		$string .= parseParentheses($parser, $data);
		$string .= parseComments($parser, $data);
		$string .= parseBlock($parser, $data, $name);
		my $foo = $parser->{'offset'};
		$parser->{'offset'} = $offset;
		$parser->{'class'}->($parser, {}, $name, $var);
		$parser->{'offset'} = $foo;
		goto PARSESTATEMENT;
	}

	elsif (${$data} =~ s/\A(($re_id\.)*?prototype\.plugin\s*\(\s*($re_string)\s*,\s*function)//)
	{
		my $found = $1;
		$string .= $1; my ($prio, $name) = (0, $3);
		my $offset = $parser->{'offset'};
		$string .= parseComments($parser, $data);
		$parser->{'offset'} += length($found);
		$string .= parseParentheses($parser, $data);
		$string .= parseComments($parser, $data);
		$string .= parseBlock($parser, $data, $name);
		my $delim = ${$data} =~ s/\A(\s*,\s*)// ? $1 : '';
		$string .= $delim;
		$parser->{'offset'} += length($delim);
		$prio = parseList($parser, $data);
		die "plugin struct error" unless ${$data} =~ s/\A\)//;
		$parser->{'offset'} ++;
		my $foo = $parser->{'offset'};
		$parser->{'offset'} = $offset;
		$parser->{'plugin'}->($parser, {}, $name, $prio);
		$parser->{'offset'} = $foo;
		goto PARSESTATEMENT;
	}
	elsif (${$data} =~ s/\A(($re_id\.)*?$re_id\.trigger\s*\(\s*($re_string))//)
	{
		my $found = $1;
		$string .= $found; my ($name) = ($3);
		my $offset = $parser->{'offset'};
		$string .= parseComments($parser, $data);
		$parser->{'offset'} += length($found);
		my $prio = parseList($parser, $data);
		die "trigger struct error" unless ${$data} =~ s/\A\)//;
		$parser->{'offset'} ++;
		my $foo = $parser->{'offset'};
		$parser->{'offset'} = $offset;
		$parser->{'trigger'}->($parser, {}, $name, $prio);
		$parser->{'offset'} = $foo;
		goto PARSESTATEMENT;
	}
	elsif (${$data} =~ s/\A(function)//)
	{
		my $found = $1; $string .= $1;
		my $offset = $parser->{'offset'};
		$string .= parseComments($parser, $data);
		$parser->{'offset'} += length($found);
		my $name = ${$data} =~ s/\A($re_id)// ? $1 : '';
		$parser->{'offset'} += length($name);
		$string .= parseComments($parser, $data);
		$string .= parseParentheses($parser, $data);
		$string .= parseComments($parser, $data);
		$string .= parseBlock($parser, $data, 'anon');
		my $foo = $parser->{'offset'};
		$parser->{'offset'} = $offset;
		$parser->{'function'}->($parser, {}, $name);
		$parser->{'offset'} = $foo;
		goto PARSESTATEMENT;
	}
	elsif (${$data} =~ s/\A(var|return|case|typeof|new)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		$string .= parseComments($parser, $data);
		goto PARSESTATEMENT;
	}
	elsif (${$data} =~ s/\A(if|catch|for|while|switch)\b//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		$string .= parseComments($parser, $data);
		$string .= parseParentheses($parser, $data);
		$string .= parseComments($parser, $data);
		$string .= parseBlock($parser, $data);
		goto PARSESTATEMENT;
	}
	elsif (${$data} =~ s/\A(else|try)\b//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		$string .= parseComments($parser, $data);
		$string .= parseBlock($parser, $data);
		goto PARSESTATEMENT;
	}
	elsif (
		${$data} =~ s/\A(((?:$re_id\.)*?($re_id)(?:\.apply|\.call))\s*\()// ||
		${$data} =~ s/\A(((?:$re_id\.)+?($re_id)(?:\.apply|\.call)?)\s*\()// ||
		${$data} =~ s/\A(((?:$re_id\.)*?($re_id)(?:\.apply|\.call)?)\s*\()//
	)
	{
		my $found = $1;
		$string .= $found; my ($name) = ($3);
		my $offset = $parser->{'offset'};
		$string .= parseComments($parser, $data);
		$parser->{'offset'} += length($found);
		my $prio = parseList($parser, $data);
		die "caller struct error", $$data unless ${$data} =~ s/\A\)//;
		$parser->{'offset'} ++;
		my $foo = $parser->{'offset'};
		$parser->{'offset'} = $offset;
		$parser->{'caller'}->($parser, {}, $name, $prio);
		$parser->{'offset'} = $foo;
		# goto PARSESTATEMENT;
	}
	elsif (${$data} =~ s/\A((?:$re_id\.)*$re_id)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
	}
	elsif (${$data} =~ s/\A($re_float)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
	}
	elsif (${$data} =~ s/\A(\')//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		$string .= parseApo($parser, $data);
	}
	elsif (${$data} =~ s/\A(\")//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		$string .= parseQuot($parser, $data);
	}
	elsif (${$data} =~ s/\A(\/)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		$string .= parseRegex($parser, $data);
	}
	elsif (${$data} =~ s/\A,//)
	{
		$string .= ',';
		$parser->{'offset'} ++;
		goto PARSESTATEMENT;
	}

	PARSESTATEMENTACCESS:

	# get rid of possible comments
	$string .= parseComments($parser, $data);

	if (${$data} =~ s/\A\{//)
	{
		$parser->{'offset'} ++;
		$string .= '{' . parseList($parser, $data);
		$string .= parseComments($parser, $data);
		if (${$data} =~ s/\A(\s*\})//) { $string .= $1; $parser->{'offset'} += length($1); }
		else { die "expected closing curly bracket\n>>", substr(${$data}, 0, 70); }
		goto PARSESTATEMENTACCESS;
	}
	elsif (${$data} =~ s/\A\[//)
	{
		$parser->{'offset'} ++;
		$string .= '[' . parseList($parser, $data);
		$string .= parseComments($parser, $data);
		if (${$data} =~ s/\A(\s*\])//) { $string .= $1; $parser->{'offset'} += length($1); }
		else { die "expected closing bracket\n>>", substr(${$data}, 0, 70); }
		goto PARSESTATEMENTACCESS;
	}
	elsif (${$data} =~ s/\A\(//)
	{
		$parser->{'offset'} ++;
		$string .= '(' . parseList($parser, $data);
		$string .= parseComments($parser, $data);
		if (${$data} =~ s/\A(\s*\))//) { $string .= $1; $parser->{'offset'} += length($1); }
		else { die "expected closing parenthese\n>>", substr(${$data}, 0, 70); }
		goto PARSESTATEMENTACCESS;
	}
	elsif (${$data} =~ s/\A(\.(?:$re_id\.)*$re_id)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		goto PARSESTATEMENTACCESS;
	}

	$string .= parseComments($parser, $data);

	# postfix
	if (${$data} =~ s/\A(\+\+|\-\-)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
	}

	$string .= parseComments($parser, $data);

	if (${$data} =~ s/\A([\-\+\*\/\%\^\<\>])//) { $string .= $1; $parser->{'offset'} += length($1); goto PARSESTATEMENT; }
	if (${$data} =~ s/\A(\!?\=?\=|\?|\:)//) { $string .= $1; $parser->{'offset'} += length($1); goto PARSESTATEMENT; }
	if (${$data} =~ s/\A([\&\|\=]{1,3})//) { $string .= $1; $parser->{'offset'} += length($1); goto PARSESTATEMENT; }
	if (${$data} =~ s/\A([;])//) { $string .= $1; $parser->{'offset'} += length($1); goto PARSESTATEMENT; }

	$string .= parseComments($parser, $data);

	goto PARSESTATEMENT if ${$data} =~ m/\A(?=\s*[_a-zA-Z\$])/;

	return $string;

}

my $id = 100000;
use Scope;

sub parseBlock
{

	my $string = '';

	my ($parser, $data, $scoped) = @_;

	die $parser->{'scope'} if ref $parser->{'scope'} ne "Scope";

	# get rid of possible comments
	$string .= parseComments($parser, $data);

	if (${$data} =~ s/\A(\s*\{)//)
	{
		if ($scoped)
		{
			my $parent = $parser->{'scope'};

			$parser->{'scope'} = new Scope($parser, $scoped);
			$parser->{'scope'}->{'parent'} = $parent;
			$parser->{'offset'} = $parser->{'offset'};
			$parser->{'scoped'}->($parser, {});
		}
		$string .= $1;
		$parser->{'offset'} += length($1);
		parseScope($parser, $data);
		if (${$data} =~ s/\A(\s*\})//) { $string .= $1; $parser->{'offset'} += length($1); }
		else { die "expected right curly brace\n>>", substr(${$data}, 0, 70); }

		if ($scoped)
		{
			$parser->{'parent'}->{'ended'} = $parser->{'offset'};
			$parser->{'scope'} = $parser->{'scope'}->{'parent'};

		}

	}
	else
	{
		$string .= parseStatements($parser, $data);
	}

	return $string;

}

sub parseBraces
{

	my $string = '';

	my ($parser, $data) = @_;

	# get rid of possible comments
	$string .= parseComments($parser, $data);

	if (${$data} =~ s/\A(\s*\{)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		$string .= parseScope($parser, $data);
		if (${$data} =~ s/\A(\s*\})//) { $string .= $1; $parser->{'offset'} += length($1); }
		else { die "expected closing curly brace\n>>", substr(${$data}, 0, 70); }
	}
	else
	{
		die "expected opening curly brace\n>>", substr(${$data}, 0, 70);
	}

	return $string;

}

sub parsePrackets
{

	my $string = '';

	my ($parser, $data) = @_;

	# get rid of possible comments
	$string .= parseComments($parser, $data);

	if (${$data} =~ s/\A(\s*\[)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		parseScope($parser, $data);
		if (${$data} =~ s/\A(\s*\])//) { $string .= $1; $parser->{'offset'} += length($1); }
		else { die "expected closing bracket\n>>", substr(${$data}, 0, 70); }
	}
	else
	{
		die "expected opening bracket\n>>", substr(${$data}, 0, 70);
	}

	return $string;

}

sub parseParentheses
{

	my $string = '';

	my ($parser, $data) = @_;

	# get rid of possible comments
	$string .= parseComments($parser, $data);

	if (${$data} =~ s/\A(\s*\()//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
		$string .= parseScope($parser, $data);
		if (${$data} =~ s/\A(\s*\))//) { $string .= $1; $parser->{'offset'} += length($1); }
		else { die "expected closing parenthese\n>>", substr(${$data}, 0, 70); }
	}
	else
	{
		die "expected opening parenthese\n>>", substr(${$data}, 0, 70);
	}

	return $string;

}

sub parseComments
{

	my $string = '';

	my ($parser, $data) = @_;

	while (${$data} =~ s/\A((?:\/\/.*|\/\*(?:.|\n)*?\*\/|\s+)\s*)//)
	{
		$string .= $1;
		$parser->{'offset'} += length($1);
	}

	return $string;

}


1;



