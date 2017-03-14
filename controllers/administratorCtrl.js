'user strict';


angular.module('administratorModule')
	
	/*Upload service*/
	.service('uploadService',function($http){
		//Load parsed XML
		this.loadXML=function(fileName,callBack){
			$http.get("backEnd/xmlParser.php/"+fileName).success(function(data){
				console.info("Read parsed file success");
				var response={
					success: true,
					data: data
				};
				callBack(response);
			})
			.error(function(){
				console.info("Read parsed file error");
			});
		}
		
		//Save parsed markers to DB
		this.saveMarker=function(obj){
			var objSend={
				lat: obj.lat,
				lng: obj.lng,
				sector: obj.sector,
				name: obj.name
			}
			//Send to server
			$http.post("backEnd/marker.php/markers/",objSend).success(function(data){
				console.info("Save to DB success");
			})
			.error(function(data){
				console.error("Save to DB error");
			});
		}
	})
	
	/*Administrator controller*/
	.controller('administratorController',function($scope,settings,mapCan,mapService,dataBaseService,sectorService,sectorEvents,pointList,uploadService){
	//Choose sector for edit
	$scope.mapStart=function(){
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
		pointList.search1($scope.markerName);
	}
	//Marker animation stop
	$scope.searchMarkerNameCancel=function(){
		pointList.search1Stop();
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
	
	//Upload
	$scope.upload=function(){
		var obj=document.getElementById("file");
		//Get file name
		$scope.fileError=false;
		if ('files' in obj){
			if (obj.files.length==0)
				$scope.fileError=true;
			else{
				var file=obj.files[0];
				var fileName=file.name;
				//File name validation
				var i=fileName.indexOf(".")+1;
				var ext=fileName.slice(i,fileName.length);
				if (ext==="kml"){
					uploadService.loadXML(fileName,function(response){
						if (response.success){
							//Parsed file loaded successfully
							/*$scope.markers=[{
								lat: "49.860895",
								lng: "26.091037",
								sector: "",
								name: "Lanivtsi - ukrainian heroes mo"
							}];*/
							$scope.markers=response.data;
							for (var i=0; i<$scope.markers.length; i++){
								//'$scope.markers' correction
								$scope.markers[i].lat=+$scope.markers[i].lat;
								$scope.markers[i].lng=+$scope.markers[i].lng;
								$scope.markers[i].sector="";
							}
							console.log($scope.markers);
						}
						else
							$scope.fileError=true;
					});
				}
				else
					$scope.fileError=true;
			}
		}
	}
	//Remove the marker
	$scope.uploadRemove=function(index){
		$scope.markers.splice(index,1);
	}
	//Clear marker data
	$scope.uploadClear=function(){
		$scope.markers=[];
	}
	//Save to DB
	$scope.uploadSave=function(){
		console.log("Save to DB...");
		for (var i=0; i<$scope.markers.length; i++){
			uploadService.saveMarker($scope.markers[i]);//Add marker from 'markers' to DB
		}
	}
	//Hide upload modal
	$scope.uploadModalSubmit=function(){
		$("#uploadModalOK").trigger("click");
	}
	
	/*$scope.user1=function(){
		console.info("user1Edit");
	}
	$scope.user2=function(){
		console.info("user2Edit");
	}
	$scope.upload=function(){
		console.info("upload");
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