<?php snippet('header') ?>



<script type="text/x-handlebars">
    <div class="container">
      <div class="navbar navbar-default" role="navigation">
        <div class="navbar-header">
          <a class="navbar-brand" href="#">Verve Shop</a>
        </div>
        <div class="navbar-collapse collapse">
          {{#if user.authenticated}}
            <ul class="nav navbar-nav">
              <li>{{#link-to 'subscribe'}}Subscribe{{/link-to}}</li>
            </ul>
          {{/if}}
          <ul class="nav navbar-nav pull-right">
            {{#unless user.authenticated}}
              <li>{{#link-to 'login'}}Log In{{/link-to}}</li>
              <li>{{#link-to 'signup'}}Sign Up{{/link-to}}</li>
            {{else}}
              <li><a href="#" {{ action 'logout' }}>Log Out</a></li>
            {{/unless}}
          </ul>
        </div>
      </div>

      {{outlet}}
    </div>
  </script>

  <script type="text/x-handlebars" data-template-name="index">
    <div class="jumbotron">
      <h2>Hi {{user.current.first_name}}! Welcome to Ember.js with UserApp</h2>
      <p>This is a simple demo app that illustrates how to add user authentication to an Ember.js app with UserApp.</p>
    </div>
  </script>

  <script type="text/x-handlebars" data-template-name="signup">
    <form class="form" {{action signup on='submit'}}>
      <h2 class="form-heading">Please Sign Up</h2>
      <div class="form-fields">
        {{input id='name' placeholder='First Name' class='form-control' value=first_name}}
        {{input id='email' placeholder='Email' class='form-control' value=email}}
        {{input id='username' placeholder='Username' class='form-control' value=username}}
        {{input id='password' placeholder='Password' class='form-control' type='password' value=password}}
      </div>
      <button class="btn btn-lg btn-primary btn-block" type="submit">
        {{#if loading}}
          <img src="https://app.userapp.io/img/ajax-loader-transparent.gif">
        {{else}}
          Sign Up
        {{/if}}
      </button>
      {{#if error}}
        <div class="alert alert-danger">{{error.message}}</div>
      {{/if}}
    </form>
  </script>

  <script type="text/x-handlebars" data-template-name="login">
    <form class="form" {{action login on='submit'}}>
      <h2 class="form-heading">Please Log In</h2>
      <div class="form-fields">
        {{input id='username' placeholder='Username' class='form-control' value=username}}
        {{input id='password' placeholder='Password' class='form-control' type='password' value=password}}
      </div>
      <button class="btn btn-lg btn-primary btn-block" type="submit">
        {{#if loading}}
          <img src="https://app.userapp.io/img/ajax-loader-transparent.gif">
        {{else}}
          Log In
        {{/if}}
      </button>
      {{#if error}}
        <div class="alert alert-danger">{{error.message}}</div>
      {{/if}}
    </form>
  </script>

  <script type="text/x-handlebars" data-template-name="article">
    <div class="row">
      {{#each model}}
      <div class="col-lg-4">
        <h2>{{title}}</h2>
        <p>{{body}}</p>
      </div>
      {{/each}}
    </div>
  </script>

  <script type="text/x-handlebars" data-template-name="subscribe">
        <form action="/subscribe.php" method="POST" id="payment-form">
            <div class="form-row">
                <label>Card Number</label>
                <input type="text" size="20" autocomplete="off" class="card-number" value="4242424242424242" />
            </div>
            <div class="form-row">
                <label>CVC</label>
                <input type="text" size="4" autocomplete="off" class="card-cvc" value="971" />
            </div>
            <div class="form-row">
                <label>Expiration (MM/YYYY)</label>
                <input type="text" size="2" class="card-expiry-month" value="12"/>
                <span> / </span>
                <input type="text" size="4" class="card-expiry-year" value="2017"/>
            </div>
            <button type="submit" class="submit-button">Submit Payment</button>
        </form>
  </script>

   <script type="text/x-handlebars" data-template-name="preferences">
        <h1>Preferences</h1>
   </script>

   <script type="text/x-handlebars" data-template-name="transacted">
        <h1>Succcessful Transaction</h1>
        {{#link-to 'preferences'}}Now tell us what you would like to do.{{/link-to}}
   </script>

   <script type="text/x-handlebars" data-template-name="declined">
        <h1>Declined</h1>
   </script>


  <script src="/public/js/libs/jquery-1.10.2.js"></script>
  <script src="/public//js/libs/handlebars-1.1.2.js"></script>
  <script src="/public/js/libs/ember.min.js"></script>
  <script src="/public/js/libs/ember-data.min.js"></script>
  <script src="https://app.userapp.io/js/userapp.client.js"></script>
  <script src="https://app.userapp.io/js/ember-userapp.js"></script>
  <script src="/public/js/app.js"></script>
  <script type="text/javascript" src="https://js.stripe.com/v1/"></script>