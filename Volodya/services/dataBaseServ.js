'use strict';

angular.module('dataBaseModule')
	.service('dataBaseService',function(settings,$http){
				
		//Convert object to sending pattern
		this.objToSend=function(obj){
			//var settings={};
			//settings.identified="admin";
			//Get data from object marker
			var objSend={};
			//Get data from object content
			if (settings.identified==="admin"){
				//Administrator model content
				objSend={
					id: obj.marker.id,
					lat: obj.marker.position.lat(),
					lng: obj.marker.position.lng(),
					sector: obj.content.sector,
					name: obj.content.name,
				};
			}
			else{
				//User model content
				objSend={
					id: obj.marker.id,
					lat: obj.marker.position.lat(),
					lng: obj.marker.position.lng(),
					sector: obj.content.sector,
					name: obj.content.name,
					isVisited: obj.content.isVisited,
					isCaptured: obj.content.isCaptured
				};				
			}
			return angular.toJson(objSend);
		}
		
		//Add new marker to DB
		this.addMarker=function(obj){
			console.info("Save to DB...");
			var objSend=this.objToSend(obj);//Convert object to sending pattern
			//Send to server
			$http.post("backEnd/marker.php/markers/",objSend).success(function(data){
				console.info("Save to DB success");
				console.log(data);
			})
			.error(function(data){
				console.error("Save to DB error");
			});
		}
		
		//Change marker content in DB
		this.changeMarkerContent=function(markerId,content){
			console.info("Save to DB...");
			var contentSend={};
			if (settings.identified==="admin"){
				contentSend={
					name: content.name,
					sector: content.sector,
				}
			}
			else{
				return;
				contentSend={
					isVisited: content.isVisited,
					isCaptured: content.isCaptured
				}
			}
			contentSend=angular.toJson(contentSend);
			$http.put("backEnd/marker.php/markers/"+markerId,contentSend).success(function(data){
				console.info("Save to DB success");
			})
			.error(function(data){
				console.error("Save to DB error");
			});
		}
		
		//Remove marker from DB
		this.markerRemove=function(markerId){
			console.log(markerId);
			console.info("Remove from DB...");
			$http.post("backEnd/marker.php?action=markerRemove&id="+markerId).success(function(data){
				console.info("Success");
			});
		}
				
	});