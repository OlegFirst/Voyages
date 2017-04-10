'user strict';


angular.module('userModule')
	.controller('userController',function($scope,sectorService,sectorEvents,settings,pointList,model,infoWindow,userService,dataBaseService){
		
		//User start
		if (settings.identified!=='user'){
			//Map start
			mapInit();
			//User identification
			settings.identificate('user');
			//Sector service preparation
			sectorService.createSectors();
			//Sector service events preparations
			sectorEvents.preparation();
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
		}
		$scope.userEditModalSubmit=function(){//Submit editing modal
			if ($scope.obj.content.isVisited===undefined)
				$scope.obj.content.isVisited=false;
			if ($scope.obj.content.isCaptured===undefined)
				$scope.obj.content.isCaptured=false;
			model.userMarkerChange(id);//Model update
			infoWindow.userUpdate(id,$scope.obj.content.isVisited,$scope.obj.content.isCaptured);//Info window update
		}
		//User marker edit_(end)
		
		//User marker remove
		$scope.userMarkerRemove=function(){
			model.userMarkerRemove(id,settings.userMail);
		}

		//Markers showing within the sector -----------------------------------
		//First input
		$scope.firstInput={
			value: "User markers hide",
			valueShow: "User markers show",
			valueHide: "User markers hide",
		};
		$scope.firstInputClicked=function(){
			for (var i=0; i<model.getterLength(); i++){
				var obj=model.getter(i);
				if ($scope.firstInput.value===$scope.firstInput.valueHide)
					obj.marker.setMap(null);
				else
					obj.marker.setMap(map);
			}
			if ($scope.firstInput.value===$scope.firstInput.valueShow)
				$scope.firstInput.value=$scope.firstInput.valueHide;//Change button to 'Hide'
			else
				$scope.firstInput.value=$scope.firstInput.valueShow;//Change button to 'Show'
		}
		//Second input
		$scope.secondInput={
			value: "Sector markers show",
			valueShow: "Sector markers show",
			valueHide: "Sector markers hide",
		};
		$scope.secondInputClicked=function(){
			if ($scope.secondInput.value===$scope.secondInput.valueShow){
				//Show markers in the sector
				var sectorName=document.getElementById("cursorPosition").innerHTML;
				sectorName=sectorName.slice(sectorName.length-2,sectorName.length);
				userService.loadSectorMarkers(sectorName,function(response){
					$scope.sectorMarkersInfo=response;
					$scope.secondInput.value=$scope.secondInput.valueHide;				
				});
			}	
			else
				$scope.secondInput.value=$scope.secondInput.valueShow;
		}
		
		//Get new marker and add it to user
		$scope.getNewMarker=function(){
			var obj={
				mail: settings.userMail,
				id: userMarkerId,
				isVisited: false,
				isCaptured: false
			}
			//Save to DB
			dataBaseService.userMarkerGet(obj);
		}
	
	});