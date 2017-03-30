'user strict';

angular.module('administratorModule')
	
	.controller('administratorController',function($scope,settings,sectorService,sectorEvents,pointList){
	//Choose sector for edit
	$scope.mapStart=function(){
		$scope.searchInfo=false;
		//Hide navigation
		$scope.navHide=true;
		//Show point list content
		var tag=document.getElementById("pointList");
		var array=tag.getElementsByTagName('div');
		for (var i=0; i<array.length; i++)
			array[i].style.display="block";
		//Map start	
		mapInit();
		//Sector service preparation
		sectorService.createSectors();
		//Sector service events preparations
		sectorEvents.preparation();
		//Configure 'mapModule' services for administrator
		settings.identificate('admin');
	}
	$scope.searchMarkerName=function(){
		$scope.searchInfo=false;
		var res=pointList.search1($scope.markerName);
		if (!res)
			$scope.searchInfo=true;
	}
	//Marker animation stop
	$scope.searchMarkerNameCancel=function(){
		pointList.search1Stop();
		$scope.searchInfo=false;
		$scope.markerName="";
	}
	
	//Users map edit
	$scope.usersStart=function(){
		//Hide navigation
		/*$scope.user={};
		$scope.navHide=true;
		
		$scope.user={
			login: 'mail1@gmail.com',
			password: "123",
			markerCount: 15
		};*/
	}
		
	/*$scope.user1=function(){
		console.info("user1Edit");
	}
	$scope.user2=function(){
		console.info("user2Edit");
	}*/
	});	
	
	//User list directive for <user-list> tag
	/*.directive('usersList',function(){
		return{
			restrict: 'E',
			template:
				"<p>List of users</p>",
				"<p>Login {{user.login}}</p>",
				"<p>Password {{user.password}}</p>",
				"<p>Marker count {{user.markerCount}}</p>"
		};
	});*/