<div class="row">
  <div class="columns large-12">
    <h2>Login</h2>
  </div>

  <div class="columns large-12" ng-show="error">
    <div class="alert-box warning">Invalid login</div>
  </div>

  <section class="columns large-12">
    <form class="custom">
      <label for="Email">
        <%t Form.Email "Email" %>
        <input type="email" ng-model="logindata.email" required>
      </label>

      <label for="Password">
        <%t Form.Password "Password" %>
        <input type="password" ng-model="logindata.password" required>
      </label>

      <button class="button" ng-click="login()"><%t Form.Menu.SignIn "sign in" %></button>
    </form>
  </section>
</div>