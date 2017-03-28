'user strict';


angular.module('userModule')
	.controller('userController',function($scope,sectorService,sectorEvents,settings){
		
		//User start
		if (settings.identified!=='user'){
			//Map start
			mapInit();
			//Sector service preparation
			sectorService.createSectors();
			//Sector service events preparations
			sectorEvents.preparation();
			//Configure 'mapModule' services for administrator
			settings.identificate('user');
		}
	
	});