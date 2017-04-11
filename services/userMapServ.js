'use strict';

angular.module('userMapModule')
	.factory('userService',function($http,modelContent,model,infoWindow){
		var service={};
		
		//Load sector markers
		service.loadSectorMarkers=function(sectorName,callBack){
			var res={
				isShow: true,				
				msg: "New markers not present"
			};
			$http.get("backEnd/marker.php/markers/sector/'"+sectorName+"'").success(function(data){
				if (data!=="0 results")
					for (var i=0; i<data.length; i++){
						var markerId=+data[i].id;
						var obj=model.getterObj(markerId);
						if (obj===null){						
							var location={
								lat: +data[i].lat,
								lng: +data[i].lng,
							}
							//Create marker
							var marker=new google.maps.Marker({
								position: location,
								map: map,
								label: "M",
								id: markerId
							});
							marker.__proto__.getId=function(){
								return this.id;
							}
							//Marker content
							var content={
								name: data[i].name,
								sector: data[i].sector
							};
							var inner="<p class='infoWindowName userGet'><b>Name: </b>"+content.name+"</p>"+
								"<p class='infoWindowSector'><b>Sector: </b>"+content.sector+"</p>";
							//inner+="<p><button onclick='getNewMarker("+markerId+")'>Get marker</button></p>";
							inner+="<p>Right click on marker to get it</p>";
							var outer="<div id='marker"+markerId+"' class='infoWindow'>"+inner+"</div>";
							marker.content=outer;
							marker.contentCopy={
								name: content.name,
								sector: content.sector,
								id: markerId
							}
							//Info window
							marker.addListener("click",function(){
								var msg=this.content;
								var window=new google.maps.InfoWindow({
									content: msg
								}).open(map,this);
							});
							//Get marker event
							marker.addListener("rightclick",function(){
								this.setMap(null);
								getNewMarker(this);
							});
							if (res.msg!=="New markers is being shown")
								res.msg="New markers is being shown";
						}
					}
				else{
					res.msg="None of markers";
				}
				callBack(res);//Return action result message
			})
			.error(function(data){
				res.msg="Read from DB error";
				callBack(res);//Return action result message
			});
		}
		
		return service;
	})