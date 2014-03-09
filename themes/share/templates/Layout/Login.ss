<div class="columns large-12">
	<h2>Login</h2>
</div>	

<div class="columns large-12" ng-show="error">
	<div class="alert-box warning">An error accured</div>
</div>

<section class="columns large-12">
	<form class="custom">
		
		<label for="Email">
			<%t Form.Email "Email" %>
			<input type="email" id="Email" required>
		</label>
		
		<label for="Password">
			<%t Form.Password "Password" %>
			<input type="password" id="Password" required>
		</label>
		
		<button class="button" ng-click="login()"><%t Form.Menu.SignIn "sign in" %></button>
	</form>
</section>