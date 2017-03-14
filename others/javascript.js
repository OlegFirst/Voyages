(function(){
	'use strict';
	angular.module('mapModule',[]);
	var mainApp=angular.module('mainApp',[
		'mapModule',
		'ngRoute'
	]);
	
	mainApp.config(['$routeProvider',function($routeProvider){
		$routeProvider
			.when('/map',{
				templateUrl: 'modules/markers/mapView.html',
				controller: 'mapCtrl'
			})
			.otherwise({redirectTo: 'modules/markers/mapView.html'});
	}]);
	
	mainApp.run(function($location){
		$location.path('/map');
	});
})();

/*var len=model.getterLength();
				if (len>0){
					maxId=model.getter(0).marker.id;
					for (var i=0; i<len; i++){
						if (maxId<model.getter(i).marker.id)
						maxId=model.getter(i).marker.id;
					}
				}*/