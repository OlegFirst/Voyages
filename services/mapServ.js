/* Arguments
*
* 'settings' - configure 'mapModule' services depends on administrator/user 
*	res_settings.identified="admin"/"user";
*
* 'mapCan' - what can be done;
*
* 'modelContent' - some content of MODEL which depends on administrator/user;
*
* 'infoWindow' - visibility and editable part of 'modelContent'
*
 */
 


'use strict';
angular.module('mapModule')

	.controller('mapController',function($scope,model,infoWindow,mapCan){
		
		/* Marker MODAL for editing */
		
		//Edit modal shows
		$scope.mapMarkerEdit=function(){
			$scope.obj=model.getterObj(id);
		}
		//Edit modal submitted
		$scope.editModalSubmit=function(){
			//Validation name
			var msg=$scope.obj.content.name;
			var patt=/^[a-zA-Zа-яА-Я]{1}[a-zA-Zа-яА-Я0-9]{0,19}/g;
			var res=patt.test(msg);
			if (!res)
				console.error("Name incorrect");
			if (res){
				$("#editModalOK").trigger("click");
				model.changeMarker($scope.obj);
				infoWindow.update($scope.obj.marker.id,$scope.obj.content);//InfoWindow update
			}
		}
		
		/* Marker MODAL for removing */
		//Remove marker
		$scope.removeModalSubmit=function(){
			if (mapCan.getter().removeMarker){
				var obj=model.getterObj(id);//Get object for remove
				model.remove(obj);//Remove marker from model and DB
				obj.marker.setMap(null);//Remove marker from map
			}
			else
				alert ("You don`t able to remove markers");			
			$("#removeModalOK").trigger("click");//Closing modal
		}
		
		/* Marker MODAL for sector change */
		$scope.sectorChangeModalSubmit=function(){
			$("#sectorChangeModalOK").trigger("click");//Closing modal			
		}
	
	})

	.service('mapCan',function(){
	// What can to do
	/*	addMarker - add new marker to map, model, DB
	*	removeMarker - remove marker from map, model, DB
	*/
		var can={
			addMarker: false,
			removeMarker: false
		};
		return{
			getter: function(){
				return can;
			},
			setter: function(addMarker,removeMarker){
				can.addMarker=addMarker;
				can.removeMarker=removeMarker;
			},
			clear: function(){
				can.addMarker=false;
				can.removeMarker=false;
			}
		}
	})
	
	/* Settings for 'arg'=administrator/user */
	.service('settings',function(mapCan){
		this.identified="";
		this.identificate=function(arg){
			if (arg==="admin"){
				//For administrator
				console.info("Administrator identified")
				mapCan.clear();//Set all can do equal FALSE
				mapCan.setter(true,true);
				this.identified=arg;
			}
			else 
				if (arg==="user"){
					//For user
					console.info("User identified");
					this.identified=arg;
				}
				else console.error("Settings error: not identified!");
		}
	})
	
	/* Map model content. res_object */
	.service('modelContent',function(settings,sectorService){
		this.obj={};//This is the content object that includes administrator/user content
		this.contentSetObject=function(content){
			if (settings.identified==="admin"){
				//Administrator model content
				var i=null;
				this.obj={
					name: "",
					sector: ""
				};
				for (i in this.obj){
					var j=null;
					for (j in content)
						if (i===j){
							this.obj[i]=content[j];
							break;
						}
				}
			}
			else{
				//User model content
				var i=null;
				this.obj={
					sector: "",
					name: "",
					isVisited: false,
					isCaptured: false
				};
				for (i in this.obj){
					var j=null;
					for (j in content)
						if (i===j){
							this.obj[i]=content[j];
							break;
						}
				}			
			}
			return this.obj;
		}
	})
	
	/* Map model */
	.service('model',function(dataBaseService,modelContent){
		var server=true;
		
		var collection=[];
				
		function Obj(marker,content){
			this.marker=marker;
			this.content=content;
		};
		return{
			//Clear collection
			clearCollection: function(){
				for (var i=0; i<collection.length; i++){
					var marker=collection[i].marker;
					marker.setMap(null);//Remove marker from map
				}
				collection=[];
			},
			
			//Add new marker to MODEL
			addMarker: function(marker,content){
				var contentObj=modelContent.contentSetObject(content);//Content transform
				var obj=new Obj(marker,contentObj);
				collection.push(obj);
				//Save to DB
				if (server)
					dataBaseService.addMarker(obj);
			},
			
			//Add loaded marker to MODEL
			addLoadedMarker: function(marker,contentObj){
				var obj=new Obj(marker,contentObj);
				collection.push(obj);
			},
			
			//Marker change
			changeMarker: function(obj){
				var j=searchJ(obj.marker.id);//Search 'obj' position in 'collection'
				collection[j].marker=obj.marker;
				collection[j].content=obj.content;
				console.log("Change marker:", collection);
				//Save to DB
				if (server)
					dataBaseService.changeMarkerContent(obj.marker.id,obj.content);
			},
			
			//Marker remove
			remove: function(obj){
				var markerId=obj.marker.id;
				var j=searchJ(obj.marker.id);//Search 'obj' position in 'collection'
				collection.splice(j,1);
				//Remove from DB
				if (server)
					dataBaseService.markerRemove(markerId);
			},
			
			//Collection getters
			getter: function(i){
				return collection[i] ;
			},
			getterLength: function(){
				return collection.length;
			},
			getterObj: function(id){
				var j=searchJ(id);
				return collection[searchJ(id)];//Return object according to id
			},
			
			/*User*/
			//Marker change
			userMarkerChange: function(id,visited,captured){
				var j=searchJ(id);
				collection[j].content.isVisited=visited;
				collection[j].content.isCaptured=captured;
				console.log(collection);
			}
		}
		
		function searchJ(id){
			var j=0;
			for (var i=0; i<collection.length; i++){
				if (id==collection[i].marker.id){
					j=i;
					break;
				}
			}
			return j;
		}
	})
	
	/* infoWindow content */
	.service('infoWindow',function(settings){
		this.html=function(id,arg){
			if (settings.identified==="admin"){
				//Administrator
				var inner="<p class='infoWindowName'><b>Name: </b>"+arg.name+"</p>"+
					"<p class='infoWindowSector'><b>Sector: </b>"+arg.sector+"</p>"
			}
			else{
				//User
				var inner="<p class='infoWindowName'><b>Name: </b>"+arg.name+"</p>"+
					"<p class='infoWindowSector'><b>Sector: </b>"+arg.sector+"</p>"+
					"<hr><p><b>Visited</b><input type='checkbox' class='infoWindowCheckBox' value="+arg.isVisited+" disabled></p>"+
					"<p><b>Captured</b><input type='checkbox' class='infoWindowCheckBox' value="+arg.isCaptured+" disabled></p>";
			}
			inner+="<p><button onclick='markerEdit("+id+")'>Edit</button><button onclick='markerRemove("+id+")'>Remove</button></p>";
			return inner;
		}
		//Window create
		this.create=function(id,arg){
			var inner=this.html(id,arg);
			var outer="<div id='marker"+id+"' class='infoWindow'>"+inner+"</div>";
			return outer;
		}
		//Window update
		this.update=function(id,arg){
			info=arg;
			var inner=this.html(id,arg);
			document.getElementById("marker"+id).innerHTML=inner;
		}
		//User infoWindow update
		this.userUpdate=function(id,visited,captured){
			var element=document.getElementById("marker"+id);
			element.getElementsByClassName("infoWindowCheckBox")[0].checked=visited;
			element.getElementsByClassName("infoWindowCheckBox")[1].checked=captured;
		}
	})
	
	//Map sectors service
	.service('sectorService',function(){
		//$scope.sectors=null;
		this.createSectors=function(){
			//Border line
			var borderCoordinates=[
				{lat:52.42922, lng:22.10449},//leftTop
				{lat:44.30812, lng:22.10449},//leftBottom
				{lat:44.30812, lng:40.19},//rightBottom
				{lat:52.42922, lng:40.19},//rightTop
				{lat:52.42922, lng:22.10449}//leftTop
			];
			var border=new google.maps.Polyline({
				path: borderCoordinates,
				strokeColor: '#FF0000',
				strokeOpacity: 0.5,
				strokeWeight: 1,
			});
			border.setMap(map);//(null) for remove line
			//Horizontal lines
			var horLines=[];//Horizontal lines collection
			var horLineX1=22.10449; var horLineX2=40.19;//lng
			var horLineY=[];//lat
			horLineY[0]=44.30812;
			var dY=(52.42922-horLineY[0])/8;
			for (var i=1; i<8; i++){
				horLineY.push(horLineY[i-1]+dY);
			}
			var i=1;
			while (i<horLineY.length){
				horLines[i]=new google.maps.Polyline({
				path: [
					{lat: horLineY[i], lng: horLineX1},
					{lat: horLineY[i], lng: horLineX2},
					],
				strokeColor: '#FF0000',
				strokeOpacity: 0.5,
				strokeWeight: 1,
				});
				horLines[i].setMap(map);
				i++;
			}
			//Vertical lines
			var verLines=[];//Vertical lines collection
			var verLineY1=52.42922; var verLineY2=44.30812;//lat
			var verLineX=[];//lng
			verLineX[0]=22.10449;
			var dX=(40.19-verLineX[0])/7;
			for (var i=1; i<7; i++){
				verLineX.push(verLineX[i-1]+dX);
			}
			var i=0;
			while (i<verLineX.length){
				verLines[i]=new google.maps.Polyline({
				path: [
					{lat: verLineY1, lng: verLineX[i]},
					{lat: verLineY2, lng: verLineX[i]},
					],
				strokeColor: '#FF0000',
				strokeOpacity: 0.5,
				strokeWeight: 1,
				});
				verLines[i].setMap(map);
				i++;
			}
			
			//Sector markers
			var anchor_left=0, anchor_top=10;
			var iconImage={
				url: "images/image.png",
				scaledSize: new google.maps.Size(20,20),
				origin: new google.maps.Point(0,0),
				anchor: new google.maps.Point(anchor_left,anchor_top)
			};
			var label=[
			"  ","  ","E1","D1","C1","B1","A1",
			"  ","F2","E2","D2","C2","B2","A2",
			"G3","F3","E3","D3","C3","B3","A3",
			"G4","F4","E4","D4","C4","B4","A4",
			"G5","F5","E5","D5","C5","B5","A5",
			"G6","F6","E6","D6","C6","  ","  ",
			"  ","F7","E7","D7","C7","  ","  ",
			"  ","F8","E8","  ","C8","  ","  "
			];
			var labelIndex=label.length-1;
			var sectorMarkers=[];
			function Object(marker,borderLeftBottom){
				this.marker=marker,
				this.borderLeftBottom=borderLeftBottom
			};
			Object.prototype.dX=dX;
			Object.prototype.dY=dY;
			
			//Search clicked sector
			this.sectorSearch=function(cursorPosition){
				var res=null;//Equal 'null' if cursor is not within any sectors
				for (var i=0; i<sectorMarkers.length; i++){
					var borderLeftTop={
						lng: sectorMarkers[i].borderLeftBottom.lng,
						lat: sectorMarkers[i].borderLeftBottom.lat+sectorMarkers[i].__proto__.dY
					};
					var borderRightTop={
						lng: sectorMarkers[i].borderLeftBottom.lng+sectorMarkers[i].__proto__.dX,
						lat: sectorMarkers[i].borderLeftBottom.lat+sectorMarkers[i].__proto__.dY
					};
					var borderRightBottom={
						lng: sectorMarkers[i].borderLeftBottom.lng+sectorMarkers[i].__proto__.dX,
						lat: sectorMarkers[i].borderLeftBottom.lat
					};
					//OX
					if (cursorPosition.lng>=sectorMarkers[i].borderLeftBottom.lng && cursorPosition.lng<borderRightBottom.lng)
						//OY
						if (cursorPosition.lat>=sectorMarkers[i].borderLeftBottom.lat && cursorPosition.lat<borderLeftTop.lat){
							res={
								sectorMarker: sectorMarkers[i],
								borderLeftBottom: sectorMarkers[i].borderLeftBottom,
								borderRightBottom: borderRightBottom,
								borderRightTop: borderRightTop,
								borderLeftTop: borderLeftTop
							};
							break;
						}				
				}
				return res;
			}
			//Make collection
			for (var i=0; i<horLines.length; i++){
				for (var j=0; j<verLines.length; j++){
					var marker=new google.maps.Marker({
						position: {lat:horLineY[i]+dY-0.5, lng:verLineX[j]},
						icon: iconImage,
						label: "12",
					});
					if (label[labelIndex]!=="  "){
						marker.label=label[labelIndex];
						marker.setMap(map);
						var obj=new Object(marker,{lat:horLineY[i], lng:verLineX[j]});
						sectorMarkers.push(obj);
					}
					labelIndex--;
				}
			}
		}
	})
	
	/* Map service */
	.service('mapService',function(mapCan,model,infoWindow,$http,modelContent,sectorService){
		//Max marker 'Id'
		var maxId=0;
		info=maxId;
		
		//Show map with sectors
		this.showMapWithSectors=function(){
			//Create map sectors
			sectorService.createSectors();
		}
		
		//Read map
		this.readSector=function(sectorName){
			console.info("Read map...");
			//Read from DB
			$http.get("backEnd/marker.php/markers/sector/'"+sectorName+"'").success(function(data){
				console.info("Read map success");
				model.clearCollection();
				//Last section model clears
				if (data!=="0 results"){
					for (var i=0; i<data.length; i++){
						var contentRes=modelContent.contentSetObject(data[i]);//Create marker content
						var location={
							lat: +data[i].lat,
							lng: +data[i].lng,
						}
						//Create marker
						var marker=new google.maps.Marker({
							position: location,
							map: map,
							id: +data[i].id
						});
						marker.__proto__.getId=function(){
							return this.id;
						}
						//Add marker to MODEL
						model.addLoadedMarker(marker,contentRes);
						//Marker event
						markerEvent(marker);
					}
				}
				//Get marker`s max id
				$http.get("backEnd/marker.php/markers/lastId").success(function(data){
					console.info("Read last saved marker success");
					maxId=+data[0].id;
					console.log("maxId=",maxId);
				})
				.error(function(){
					console.error("Read last saved marker error");
				})
			})
			.error(function(data){
				console.error("Read map error");
			});
		}
				
		//Add new marker from map
		this.addMarker=function(location){
			//mapScope
			if (mapCan.getter().addMarker){//If user can do it
				var res=sectorService.sectorSearch(location);
				maxId=maxId+1;
				var marker=new google.maps.Marker({
					position: location,
					map: map,
					id: maxId
				});
				//Get marker 'id'
				marker.__proto__.getId=function(){
					return this.id;
				}
				//Add new marker to MODEL
				/*var position={
					lat: marker.postion.lat,
					lng: marker.position.lng
				};*/
				model.addMarker(marker,{"sector":res.sectorMarker.marker.label});
				//Marker event
				//N.B.
				// - 'infoWindow' content is created when 'marker.addListener' occurs
				// - 'infoWindow' content (includes <div marker>...</div>) is removed when 'infoWindow' is closed
				markerEvent(marker);
			}
		}
		//Marker event
		function markerEvent(marker){
			marker.addListener("click",function(){
				var markerId=this.getId();//Get marker 'id'
				var obj=model.getterObj(markerId);
				var msg=infoWindow.create(obj.marker.id,obj.content);
				new google.maps.InfoWindow({
					content: msg
				}).open(map,this);
			});
		}
	
	});