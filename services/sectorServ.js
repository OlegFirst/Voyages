/*
*                 SECTOR EVENTS
*
*	Let choose map sector, edit map sector, change map sector;
*	Point list events
*
*/

'use strict';

angular.module('sectorModule').factory('sectorEvents',function(mapService,sectorService){
	var service={};
	var startMap=null;//Show if that either start map or editing sector
	var circle=null;
	var circleRadius=[40000,40000,40000,30000,50000,50000,40000,15000,8000,4000,2500,1500,800,200,150,80,40,20];
	var sectorCoordinates=null;//Sector bounds coordinates	
		
	/*---------- Sector events preparations ----------------*/
	service.preparation=function(){
		startMap=true;//This is a start map
		this.circleObject();
		
		// - Cursor moves within the circle (Circle moves). START MAP & SECTOR EDIT
		circle.addListener("mousemove",function(event){
			var position={
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			if (startMap){//Start map			
				circle.setCenter(new google.maps.LatLng(position.lat,position.lng));
				startMapCursoreMove(position);
				isWithinMap(position);
			}
		});
		
		// - Cursor moves out the circle (Circle overtakes cursor)
		map.addListener("mousemove",function(event){
			var position={
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			circle.setCenter(new google.maps.LatLng(position.lat,position.lng));
			if (startMap){
				startMapCursoreMove(position);
				isWithinMap(position);
			}
			else{//Sector edit
				if (!isWithin(position)){//Cursor went out the selected sector
					if (!circle.getVisible())
						circle.setVisible(true);
					var res=sectorService.sectorSearch(position);
					var msg="None";
					if (res!=null)
						msg="<strong>Cursor: </strong>"+res.sectorMarker.marker.label;
					document.getElementById('cursorNewPosition').innerHTML=msg;	
				}
				if (isWithin(position) && circle.getVisible()){//Cursor went in the selected sector
					circle.setVisible(false);
				}
			}
		});
		
		// - Cursor clicked on the map (Add new marker). SECTOR EDIT
		map.addListener("click",function(event){
			var position={
				lat: event.latLng.lat(),
				lng: event.latLng.lng()
			};
			if (isWithin(position))//If cursor clicked within selected sector
				mapService.addMarker({lat:event.latLng.lat(), lng:event.latLng.lng()});
		});
		
		// - Cursor goes out of the map bounds (Map scrolls). SECTOR EDIT
		map.addListener("mouseout",function(event){
			//if (!startMap)
				//map.panTo({lat:event.latLng.lat(), lng:event.latLng.lng()});
		});
		
		// - Map zoom changes (Circle radius correction). SECTOR EDIT
		map.addListener("zoom_changed",function(){
			if (startMap)
				map.zoom=5;//It`s a start map
			else
				setCircleRadius();				
		});
		
		// - Cursor clicked on the circle (Go to the selected sector)
		circle.addListener("click",function(){
			if (circle.getVisible()){
			var position={
				lat: circle.getCenter().lat(),
				lng: circle.getCenter().lng()
			};
			//Selected sector check
			var res=sectorService.sectorSearch(position);
			if (res!=null){
				document.getElementById('cursorPosition').innerHTML="<strong>Sector: </strong>"+res.sectorMarker.marker.label;
				if (startMap){
					startMap=false;
					map.setZoom(10);
				}
				map.setCenter(position);
				circle.setVisible(false);//Hide circle
				sectorCoordinates=res;//Set selected sector coordinates
				//Read markers in the chosen sector
				mapService.readSector(res.sectorMarker.marker.label);
			}
			else				
				document.getElementById('cursorNewPosition').innerHTML="None";
			}
		});
		
		//Check if cursor within map
		function isWithinMap(position){
			var res=sectorService.sectorSearch(position);
			if (res==null)
				circle.setVisible(false);
			else
				circle.setVisible(true);
		}
	}
	
	/*---------- Circle ----------------*/
	//Create object
	service.circleObject=function(){
		//Circle creates
		circle=new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			center: {lat: 49.41097, lng: 31.55273},
			radius: 27000,
			draggable: true
		});
		setCircleRadius();
		circle.setMap(map);
	}
	
	/*---------- Handle events ----------------*/
	//Set circle radius
	function setCircleRadius(){
		var zoom=map.zoom;
		var i=circleRadius.length-1;
		if (zoom<circleRadius.length)
			i=zoom;
		circle.radius=circleRadius[i];
		if (circle.getVisible()){
			circle.setMap(null); circle.setMap(map);
		}
	}
	
	//Check if cursor is within editing sector
	function isWithin(position){
		var inside=false;
		//OX
		if (position.lng>=sectorCoordinates.borderLeftBottom.lng && position.lng<sectorCoordinates.borderRightBottom.lng){
			//OY
			if (position.lat>=sectorCoordinates.borderLeftBottom.lat && position.lat<sectorCoordinates.borderLeftTop.lat)
				inside=true;
		}
		return inside;
	}
	
	//Show hovered sector while start map is showing
	function startMapCursoreMove(position){
		var res=sectorService.sectorSearch(position);
		if (res!=null)
			var msg="<strong>Cursor position: </strong>"+res.sectorMarker.marker.label;
		else
			var msg="None";
		document.getElementById('cursorPosition').innerHTML=msg;
	}	
	
	return service;
})

.service('pointList',function(model){
	
	this.search1=function(markerName){
		this.search1Stop();//Animated marker stop
		var len=model.getterLength();//Model collection length
		var match=false;
		for (var i=0; i<len; i++){
			var obj=model.getter(i);
			if (markerName===obj.content.name){
				obj.marker.setAnimation(google.maps.Animation.BOUNCE);
				match=true;
			}
		}
		return match;
	};
	
	//Marker animation stop
	this.search1Stop=function(){
		var len=model.getterLength();
		for (var i=0; i<len; i++){
			var obj=model.getter(i);
			obj.marker.setAnimation(null);
		}
	}
	
});