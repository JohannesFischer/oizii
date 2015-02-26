<!DOCTYPE html>
<html lang="$Locale">
<head>
  <% base_tag %>
  <title>$Title</title>
  $MetaTags(false)
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="stylesheet" href="/themes/share/bower/foundation/css/normalize.css">
  <% require themedCSS(cmslogin) %>
</head>
<body class="LoginPage">
  <% if Content %>
    <div class="PageContent">$Content</div>
  <% end_if %>

  <div id="CMSSecurity">
    $Form
  </div>

  <script>
    var by_id = function (id) {
      return document.getElementById(id);
    };

    // set label text as placeholder

    // Login Form
    if (by_id('MemberLoginForm_LoginForm')) {
      // email
      by_id('MemberLoginForm_LoginForm_Email').placeholder = by_id('Email').getElementsByTagName('label')[0].innerHTML;
      // password
      by_id('MemberLoginForm_LoginForm_Password').placeholder = by_id('Password').getElementsByTagName('label')[0].innerHTML;
    }
    // Forgot password form
    if (by_id('MemberLoginForm_LostPasswordForm')) {
      by_id('MemberLoginForm_LostPasswordForm_Email').placeholder = by_id('Email').getElementsByTagName('label')[0].innerHTML;
    }
  </script>
</body>
</html>