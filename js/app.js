var info;

(function (){
	'use strict';
		
	//Declare other modules
	angular.module('loginModule',[]);
	angular.module('registerModule',[]);
	angular.module('administratorModule',[]);
	angular.module('userModule',[]);
	angular.module('mapModule',[]);
	angular.module('sectorModule',[]);
	angular.module('uploadModule',[]);
	angular.module('dataBaseModule',[]);
	//Declare main module and add other modules into the main one
	var mainApp=angular.module('mainApp',[
		'loginModule',
		'registerModule',
		'dataBaseModule',
		'mapModule',
		'sectorModule',
		'uploadModule',
		'administratorModule',
		'userModule',
		'ngRoute'
	]);
		
	//Navigation
	mainApp.config(['$routeProvider',function($routeProvider){
		$routeProvider
			.when('/login',{
				templateUrl: 'views/login.html',
				controller: 'loginCtrl'
			})
			.when('/register',{
				templateUrl: 'views/register.html',
				controller: 'registerCtrl'
			})
			.when('/home',{
				templateUrl: 'views/login.html',
				controller: 'loginCtrl'
			})
			.when('/administrator',{
				templateUrl: 'views/administrator.html',
				controller: 'administratorController'
			})
			.when('/user',{
				templateUrl: 'views/user.html',
				controller: 'userController'
			})
			.otherwise({redirectTo: 'views/login.html'});
	}]);
	
	//Application start parameters
	mainApp.run(function($location){
		$location.path('/login');
		//Go to the login page
		//$location.path('/administrator');
		//document.getElementById("userLogin").innerHTML="User: "+'one@gmail.com';
		//$location.path('/user');
	});
	
	mainApp.value("defaultUser","unregistered ");
	mainApp.constant("constantValue","God");
		
	//App controller
	mainApp.controller('mainCtrl',function($scope,defaultUser){
		$scope.user=defaultUser;
		document.getElementById("signOut").setAttribute("disabled","disabled");
	});	
	
})();