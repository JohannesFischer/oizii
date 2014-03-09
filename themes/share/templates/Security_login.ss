<!DOCTYPE html>
<html lang="$ContentLocale">
<head>
    <% base_tag %>
    <title>share :: sign in</title>
	<% require themedCSS(foundation/css/normalize) %>
	<% require themedCSS(foundation/css/foundation.min) %>
	<% require themedCSS(app) %>
	<meta name="viewport" content="width=device-width">
	<meta name="robots" content="noindex, nofollow">
</head>
<body class="$ClassName LoginPage typography">
    
	<header>
		<div class="row">
	        <div class="column large-12">
				<h1><a href="/">login</a></h1>
			</div>
		</div>
	</header>
	
    <% if Content %>
		<div class="row">
	        <div class="column large-12">
			    <div class="PageContent">$Content</div>
			</div>
		</div>
    <% end_if %>

    <div id="CMSLogin" class="row">
        <div class="column large-12">
            $Form
        </div>
		<!--
		<div class="column large-12">
            <h3><%t Title.RequestAccount "Request an account" %></h3>
			<p><%t Text.RequestAccount "Enter your name and email and I will create an account for you" %></p>
			<form>
				<input type="text" name="RequestName" placeholder="your name">
				<input type="email" name="RequestEmail" placeholder="your email">
				<input type="submit" name="SubmitRequest">
			</form>
        </div>
		-->
    </div>

	<script src="/themes/share/javascript/third-party/jquery-1.9.1.min.js"></script>
	<script src="/themes/share/javascript/init.js"></script>
	
</body>
</html>