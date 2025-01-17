

Ember.Application.initializer({
  name: 'emberfire:firebase',
  initialize: function(container, application) {
  	var firebase = new Firebase('https://burning-fire-4834.firebaseio.com/');
    application.register('firebase:main', firebase, { instantiate: false, singleton: true });
	      Ember.A(['model', 'controller', 'view', 'route', 'adapter', 'component']).forEach(function(component) {
	        application.inject(component, 'firebase', 'firebase:main');

	      });
	var store = container.lookup('store:main'); 
	application.set('user', Ember.Object.create())
	// application.deferReadiness();
	// var user = Ember.Object.extend({
	//   uid: null,
	//   data: function() {

	//   }.property()
	// });

	// store.  
	 	application.register('efu:main', application.get('user'), { instantiate: false, singleton: true });
	 	Ember.A(['model', 'controller', 'view', 'route', 'component']).forEach(function(component) {
   		application.inject(component, 'user', 'efu:main');
  		
	 }); 
  }
});

App = Ember.Application.create();

Ember.Lvrs = {};
Ember.Lvrs.SubscriptionOnlyRouteMixin = Ember.Mixin.create({
	beforeModel: function(transition) {
		var _this = this;
	    return new Ember.RSVP.Promise(function(resolve, reject) {
	    	Ember.run.scheduleOnce('sync', App, function() {
				if (!_this.get('user.data')) {
			  		var authData = _this.get('firebase').getAuth();
					if (authData) {
						_this.store.find('user', authData.uid).then(function (user) {
						    App.set('user.data',user);
						    if (!user.get('subscription')) {
						    	transition.abort();
				    			_this.transitionTo('index');
				    			reject('Not a subscriber.')
						    }
						    else {
						    	resolve();
						    }
						})
					}
					else {
					    transition.abort();
					    _this.transitionTo('login');
					    reject('Not logged in.')
					}
				}
				else if (!_this.get('user.data.subscription')) {
				    transition.abort();
				    _this.transitionTo('index');
				    reject('Not a subscriber.')
				}
				else {
					resolve();
				}
			});
		});
	}
});
Ember.Lvrs.ApplicationRouteMixin = Ember.Mixin.create({

});
Ember.Lvrs.FormControllerMixin = Ember.Mixin.create({
	cv : true,
	credentialsValid: function(key, value, previousValue) {
		if (arguments.length > 1) {
      		this.set('cv', value)
	    }
	    // getter
	    return this.get('cv');
	}.property('email', 'password'),
	emailValid: function () {
		if (this.get('email'))
			return !this.get('email').match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/); //'
		else return true;
	}.property('email'),
	fullNameValid: function () {
		return (this.get('fullName') && this.get('fullName').length > 0)
	}.property('fullName'),
	actions: {
		login: function() {
			var _this = this;
			this.get('firebase').authWithPassword({
			  email    : this.get('email'),
			  password : this.get('password')
			}, function(err, authData) {
			  if (err) {
			    switch (err.code) {
			      case "INVALID_EMAIL":
			      // handle an invalid email
			      case "INVALID_PASSWORD":
			      // handle an invalid password
			      default:
			    }
			    _this.set('cv', false);
			  } else if (authData) {
			  	var _authData = authData;
			    // user authenticated with Firebase
			    console.log("Logged In! User ID: " + authData.uid);
			    if (!_this.get('user.data')) {
				    _this.store.find('user', authData.uid).then(function (user) {
				    	App.set('user.data',user);
				    	_this.set('cv', true);
				    	_this.transitionToRoute('index');
				    }).catch(function (reason) {
				    	if (_this.get('fullName')) {
						    var fullName = _this.get('fullName').split(" ");
						    var lastName = null;
						    var firstName = fullName[0];
						    if (fullName.length > 1)
						    	lastName = fullName[fullName.length - 1];
						    user = _this.store.createRecord('user', {id: _authData.uid, firstName: firstName, lastName: lastName, email: _this.get('email'), uid: _authData.uid, mobile: _this.get('mobile')});
						    user.save();
				    	}
				    	App.set('user.data',user);
				    	_this.set('cv', true);
				    	_this.transitionToRoute('index');
				    });
				}
				else {
					_this.set('cv', true);
				    _this.transitionToRoute('index');
				}
			    
				
			  }
			});

		},
		signup: function() {
			var _this = this;
			this.get('firebase').createUser({
			  email    : this.get('email'),
			  password : this.get('password')
			}, function(error) {
			  if (error === null) {
			    console.log("User created successfully");
			    _this.send('login');
			  } else {
			    console.log("Error creating user:", error);
			  }
			});
	  	}
	  }
});
Ember.Lvrs.ProtectedRouteMixin = Ember.Mixin.create({
	beforeModel: function(transition) {
		var _this = this;
	    return new Ember.RSVP.Promise(function(resolve, reject) {
  			Ember.run.scheduleOnce('sync', App, function() {
		    	if (!_this.get('user.data')) {
		    		var authData = _this.get('firebase').getAuth();
					if (authData) {
						_this.store.find('user', authData.uid).then(function (user) {
						    	App.set('user.data',user);
						    	resolve();
						}).catch(function (reason) {
							transition.abort();
							_this.transitionTo('login');
							reject('Not valid user - could not fetch details')
						});
					}
					else {
						_this.transitionTo('login');	
						reject('Not valid user - not logged in')
					}	    	
		    	}
		    	else {
		    		if (this.get('user.data') && (transition.targetName === 'signup' || transition.targetName === 'login')) {
						transition.abort();
						this.transitionTo('index');
					}
					resolve();
		    	}
		    });
  		});

	}
});


App.Router.map(function() {
  this.route('signup');
  this.route('login');
  this.route('article');
  this.route('subscribe');
  this.route('setting');
  this.route('transacted');
  this.route('declined');
  this.route('feedback');
  this.route('paymentMethod');
  this.route('invoices');
});


App.ApplicationRoute = Ember.Route.extend(Ember.Lvrs.ApplicationRouteMixin);
App.SignupController = Ember.Controller.extend(Ember.Lvrs.FormControllerMixin);
App.LoginController = Ember.Controller.extend(Ember.Lvrs.FormControllerMixin);
App.IndexRoute = Ember.Route.extend(Ember.Lvrs.ProtectedRouteMixin);

App.SubscribeRoute = Ember.Route.extend(Ember.Lvrs.ProtectedRouteMixin);
App.SubscribeView = Ember.View.extend({
	didInsertElement: function () {
		var _this = this;
		// this identifies your website in the createToken call below
		Stripe.setPublishableKey('pk_live_CPiVhO4rfNcUKZVNXMU7Bfuy');

		var stripeResponseHandler = function (status, response) {
			if (response.error) {
				// re-enable the submit button
				$('.submit-button').removeAttr("disabled");
				// show the errors on the form
				$(".payment-errors").html(response.error.message);
			} else {

				var form$ = $("#payment-form");
				// token contains id, last4, and card type
				var token = response['id'];
				// insert the token into the form so it gets submitted to the server
				form$.append("<input type='hidden' name='stripeToken' value='" + token + "' />");
				form$.append("<input type='hidden' name='uid' value='" + _this.get('user.data.uid') + "' />");
				form$.append("<input type='hidden' name='sid' value='" + _this.get('user.data.sid') + "' />");
				form$.append("<input type='hidden' name='email' value='" + _this.get('user.data.email') + "' />");
				form$.append("<input type='hidden' name='mobile' value='" + _this.get('user.data.mobile') + "' />");
				form$.append("<input type='hidden' name='firstName' value='" + _this.get('user.data.firstName') + "' />");
				form$.append("<input type='hidden' name='coupon' value='" + $('#coupon').val() + "' />");
				// and submit
				_this.set('user.data.stoken', token);
				_this.get('user.data').save();
				//Have to put in delay as save to firebase was closing connection too early
				Ember.run.later(this, function () {
					form$.get(0).submit();	
				}, 500)
				
			}
		}

		$(document).ready(function() {
			$("#payment-form").submit(function(event) {
				// disable the submit button to prevent repeated clicks
				$('.submit-button').attr("disabled", "disabled");
				// createToken returns immediately - the supplied callback submits the form if there are no errors
				Stripe.createToken({
					number: $('.card-number').val(),
					cvc: $('.card-cvc').val(),
					exp_month: $('.card-expiry-month').val(),
					exp_year: $('.card-expiry-year').val()
				}, stripeResponseHandler);
				return false; // submit from callback
			});
		});
	}
});

App.TransactedRoute = Ember.Route.extend(Ember.Lvrs.ProtectedRouteMixin);


App.TransactedController = Ember.ArrayController.extend({
  queryParams: ['sid', 'stoken','subscription'],
  sid: null,
  stoken: null,
  subscription: null
});

App.TransactedView = Ember.View.extend({
	didInsertElement: function () {
		var _this = this;
		var user = this.get('user.data');
		var sid = user.get('sid');
		var stoken = user.get('stoken');
		if (!sid)
			user.set('sid', this.get('controller.sid'));
		user.set('subscription', this.get('controller.subscription'));
		user.set('subscribed', moment(new Date()).toISOString());
		user.save();
		if (stoken !== this.get('controller.stoken'))
			alert('Please contact support regarding your transaction,\r\n the submitted quote is not identical to the invoice.');
		Ember.run.later(this, function () {
			_this.get('controller').transitionToRoute('setting');
		}, 3000);
		

	}
});

App.DeclinedController = Ember.ArrayController.extend({
  queryParams: ['error'],
  error: null,
  humanError: function() {
  	var error = this.get('error');
  	if (error === 'duplicateTransaction')
  		return 'The transaction was stopped from duplicating. Did you double click the purchase button? If not please contact support.';
  	if (error === 'invalidPost')
  		return 'The transaction was stopped from processing as it was malformed. Please contact support.';
  	if (error === 'invalidCard')
  		return 'The transaction was already processed at a different time. Did you hit refresh? If not please contact support.';
  	if (error === 'invalidSubscription')
  		return 'The transaction could not be processed as the coupon and subscription did not match our records.';
  }.property()
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
    //firebase: new Firebase('https://slo2606sr0d.firebaseio-demo.com/')
});

App.SettingRoute = Ember.Route.extend(Ember.Lvrs.SubscriptionOnlyRouteMixin);

App.SettingController = Ember.ObjectController.extend({
	init : function() {
		var years = [{label: '', value: null}];
		for (var i = 1900; i < 2008; i ++)
		{
			years.push({label: i + '', value: i })
		}
		this.set('years', years);

		var days = [{label: '', value: null}];
		for (var i = 1; i < 32; i ++)
		{
			days.push({label: i + '', value: i })
		}
		this.set('monthDays', days);
	},
	genders: [
      { label: '', value: null },
	  { label: 'Male', value: 'm' },
	  { label: 'Female', value: 'f' }
	],
	days: [
	  { label: '', value: null },
	  { label: 'Monday', value: 'mon' },
	  { label: 'Tuesday', value: 'tue' },
	  { label: 'Wednesday', value: 'wed' },
	  { label: 'Thursday', value: 'thu' },
	  { label: 'Friday', value: 'fri' },
	  { label: 'Saturday', value: 'sat' },
	  { label: 'Sunday', value: 'sun' }
	],
	months: [
	  { label: '', value: null },
	  { label: 'January', value: 1 },
	  { label: 'Febuary', value: 2 },
	  { label: 'March', value: 3 },
	  { label: 'April', value: 4 },
	  { label: 'May', value: 5 },
	  { label: 'June', value: 6 },
	  { label: 'July', value: 7 },
	  { label: 'August', value: 8 },
	  { label: 'September', value: 9 },
	  { label: 'October', value: 10 },
	  { label: 'November', value: 11 },
	  { label: 'December', value: 12 }
	],
	musics: [
	  { label: '60s', value: '60s' },
	  { label: '70s', value: '70s' },
	  { label: '80s', value: '80s' },
	  { label: '90s', value: '90s' },
	  { label: 'Classical', value: 'cla' },
	  { label: 'Country', value: 'cnt' },
	  { label: 'Electro', value: 'elc' },
	  { label: 'Folk', value: 'flk' },
	  { label: 'Jazz', value: 'jaz' },
	  { label: 'Pop', value: 'pop' },
	  { label: 'Rap', value: 'rnb' },
	  { label: 'RnB', value: 'rnb' },
	  { label: 'Rock', value: 'rck' },
	  { label: 'Rockabilly', value: 'rby' },
	  { label: 'Roots', value: 'rts' },
	  { label: 'Dislike Music', value: 'dmu' }
	],
	alcohols: [
	  { label: 'Beer', value: 'ber' },
	  { label: 'Cocktails', value: 'cck' },
	  { label: 'Shots', value: 'sht' },
	  { label: 'Whiskey', value: 'whi' },
	  { label: 'Wine', value: 'win' },
	  { label: 'Digestifs', value: 'dig' },
	  { label: 'Dislike Alcohol', value: 'dal' }
	],
	adventures: [
	  { label: 'Water', value: 'wat' },
	  { label: 'Mountains', value: 'mnt' },
	  { label: 'Air', value: 'air' },
	  { label: 'City', value: 'cit' },
	  { label: 'Dislike Adventure', value: 'dad' }
	],
	physicals: [
	  { label: 'Upper Body', value: 'ubo' },
	  { label: 'Lower Body', value: 'lbo' },
	  { label: 'Dislike Physical Activities', value: 'dph' }
	],
	foods: [
	  { label: 'Ethnic', value: 'eth' },
	  { label: 'All you can eat', value: 'ace' },
	  { label: 'Gourmand', value: 'gou' },
	  { label: 'Dislike Food', value: 'dfo' }
	],
	times: [
	  { label: 'Morning', value: 'mor' },
	  { label: 'Midday', value: 'mid' },
	  { label: 'Afternoon', value: 'aft' },
	  { label: 'Evening', value: 'eve' }
	],
	dobValid: function () {
		return !moment(this.get('model.dob'), ["DD/MM/YYYY"], true).isValid()
	}.property('model.dob'),
	anniversaryValid: function () {
		return !moment(this.get('model.anniversary'), ["DD/MM/YYYY"], true).isValid()
	}.property('model.anniversary'),
	childrenValid: function () {
		return  !/^\d+$/.test(this.get('model.children'));
	}.property('model.children'),
	mobileValid: function () {
		return !/^\d+$/.test(this.get('model.mobile'));
	}.property('model.mobile'),
	actions: {
		savePreferences: function () {
			this.get('user.data').save();
			Messenger().post('Preferences Updated');
			// var _this = this;
			// var p = {};
			// $.each(this.get('content.constructor.attributes').keys.list, function (i,v) {
			// 		p[v] = {"value": _this.get('model.' + v), "override": true };
			// });
			// debugger;
			// UserApp.User.save({
			// 	"user_id": 'self',
			// 	"properties": p
			// }, function (error,result) {
			// 	//console.log(error, result);
			// });
		}
	}
});

App.User = DS.Model.extend({
	subscription: DS.attr('', {defaultValue: null}),
	subscribed: DS.attr('', {defaultValue: null}),
	firstName:  DS.attr('', {defaultValue: null}),
	lastName:  DS.attr('', {defaultValue: null}),
	uid: DS.attr('', {defaultValue: ''}),
	sid: DS.attr('', {defaultValue: ''}),
	stoken: DS.attr('', {defaultValue: null}),
	email: DS.attr('', {defaultValue: null}),
	partnersFirstName: DS.attr('', {defaultValue: null}),
	dob: DS.attr('', {defaultValue: null}),
	doby: DS.attr('', {defaultValue: null}),
	dobm: DS.attr('', {defaultValue: null}),
	dobd: DS.attr('', {defaultValue: null}),
	gender: DS.attr('', {defaultValue: null}),
	address: DS.attr('', {defaultValue: null}),
	addressStreet: DS.attr('', {defaultValue: null}),
	addressCity: DS.attr('', {defaultValue: null}),
	addressState: DS.attr('', {defaultValue: null}),
	addressPostcode: DS.attr('', {defaultValue: null}),
	addressCountry: DS.attr('', {defaultValue: null}),
	anniversaryy : DS.attr('', {defaultValue: null}),
	anniversarym : DS.attr('', {defaultValue: null}),
	anniversaryd : DS.attr('', {defaultValue: null}),
	mobile: DS.attr('', {defaultValue: null}),
	date_monday: DS.attr('', {defaultValue: null}),
	date_tuesday: DS.attr('', {defaultValue: null}),
	date_wednesday: DS.attr('', {defaultValue: null}),
	date_thursday: DS.attr('', {defaultValue: null}),
	date_friday: DS.attr('', {defaultValue: null}),
	date_saturday: DS.attr('', {defaultValue: null}),
	date_sunday: DS.attr('', {defaultValue: null}),
	date_time: DS.attr('', {defaultValue: null}),
	date_date: DS.attr('', {defaultValue: null}),
	date_days: DS.attr('', {defaultValue: null}),
	date_duration: DS.attr('', {defaultValue: null}),
	physical_water: DS.attr('', {defaultValue: null}),
	physical_outdoors: DS.attr('', {defaultValue: null}),
	physical_extreme: DS.attr('', {defaultValue: null}),
	physical_city: DS.attr('', {defaultValue: null}),
	physical_dislike: DS.attr('', {defaultValue: null}),
	alcohol_beer: DS.attr('', {defaultValue: null}),
	alcohol_wine: DS.attr('', {defaultValue: null}),
	alcohol_cocktails: DS.attr('', {defaultValue: null}),
	alcohol_spirits: DS.attr('', {defaultValue: null}),
	alcohol_whisky: DS.attr('', {defaultValue: null}),
	alcohol_dislike: DS.attr('', {defaultValue: null}),
	travel_distance: DS.attr('', {defaultValue: null}),
	anniversary: DS.attr('', {defaultValue: null}),
	children: DS.attr('', {defaultValue: null}),
	likes_music: DS.attr('', {defaultValue: null}),
	likes_food: DS.attr('', {defaultValue: null}),
	likes_food_asian: DS.attr('', {defaultValue: null}),
	likes_food_middle_eastern: DS.attr('', {defaultValue: null}),
	likes_food_european: DS.attr('', {defaultValue: null}),
	likes_adventure: DS.attr('', {defaultValue: null}),
	likes_physical: DS.attr('', {defaultValue: null}),
	likes_alcohol: DS.attr('', {defaultValue: null}),
	special_needs: DS.attr('', {defaultValue: null}),
	date_date_moment: function (key, value, previousValue) {
		 if (arguments.length > 1) {
		  this.set('date_date', value.format("DD/MM/YYYY"));
		}
		if (moment(this.get('date_date'), ["DD/MM/YYYY"], true).isValid())
			return moment(this.get('date_date'), ["DD/MM/YYYY"]);
		else
			return '';
	}.property('date_date')
});

App.Feedback = DS.Model.extend({
	date_date: '',
	feedback: ''
});
