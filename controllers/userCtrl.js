'user strict';


angular.module('userModule')
	.controller('userController',function($scope,sectorService,sectorEvents,settings,pointList,model,infoWindow){
		
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
		
		//Marker search_(start)
		$scope.searchMarkerName=function(){
		$scope.searchInfo=false;
		var res=pointList.search1($scope.markerName);
		if (!res)
			$scope.searchInfo=true;
		}
		$scope.searchMarkerNameCancel=function(){
			pointList.search1Stop();
			$scope.searchInfo=false;
			$scope.markerName="";
		}
		//Marker search_(end)
		
		//User marker edit_(start)
		$scope.userMarkerEdit=function(){//Show editing modal
			$scope.obj=model.getterObj(id);
			//$scope.captured=$scope.obj.isCaptured;
			info=$scope.visited;
		}
		$scope.userEditModalSubmit=function(){//Submit editing modal
			if ($scope.obj.isVisited===undefined)
				$scope.obj.isVisited=false;
			if ($scope.obj.isCaptured===undefined)
				$scope.obj.isCaptured=false;
			model.userMarkerChange(id,$scope.obj.isVisited,$scope.obj.isCaptured);//Model update
			infoWindow.userUpdate(id,$scope.obj.isVisited,$scope.obj.isCaptured);//Info window update
		}
		//User marker edit_(end)		
	
	});