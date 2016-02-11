// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var db = null;

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        	console.log('plugins available')
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        if (window.sqlitePlugin !== undefined) {
            db = $cordovaSQLite.openDB({ name: "kempel.db" });
        } else {
            db = window.openDatabase("kempel.db", "1.0", "Kempel Database", 2 * 1024 * 1024);
        }

        if (window.cordova){
        	cordova.getAppVersion.getVersionNumber().then(function (version){
        		console.log('version', version);
        	});
        }

    });
})

.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
        .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
        url: '/dash',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashCtrl'
            }
        }
    })

    .state('tab.data', {
            url: '/data',
            views: {
                'tab-data': {
                    templateUrl: 'templates/tab-data.html',
                    controller: 'DataCtrl'
                }
            }
        })
        .state('tab.datum', {
            url: '/datum/:id',
            views: {
                'tab-data': {
                    templateUrl: 'templates/tab-datum.html',
                    controller: 'DatumCtrl'
                }
            }
        })

    .state('tab.form', {
        url: '/form',
        views: {
            'tab-form': {
                templateUrl: 'templates/tab-form.html',
                controller: 'FormCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

});
