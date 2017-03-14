/Map navigation
/*var sectorCollection=[];
var sectorCaption=["A1","B1","C1","D1","E1","","",
					"A2","B2","C2","D2","E2","F2","",
					"A3","B3","C3","D3","E3","F3","G3",
					"A4","B4","C4","D4","E4","F4","G4",
					"A5","B5","C5","D5","E5","F5","G5",
					"","","C6","D6","E6","F6","G6",
					"","","C7","D7","E7","F7","",
					"","","C8","","E8","F8",""
];
var Sector=function(sectorId,caption){
	this.sectorId=sectorId;
	this.caption=caption;
}
function mapNavigation(){
	var parent=document.getElementsByClassName("sectorOuter")[0];
	var id=1;
	for (var i=1; i<=8; i++)
		for (var j=1; j<=7; j++){
			var sector=document.createElement("div");
			sector.className="sector";
			sector.id="sector"+id;
			sector.addEventListener("click",sectorListener,false);
			parent.appendChild(sector);
			//Correction
			if (i>=1 && i<=2)
				sector.style.height="13.3%"	
			if (i==4)
				sector.style.height="12%";
			if (i==6)
				sector.style.height="11.7%";
			if (i>=7)
				sector.style.height="11.4%";
			var obj=new Sector(id,sectorCaption[id-1]);
			sectorCollection.push(obj);
			id++;
		}	
}
function sectorListener(){
	var id=this.id;
	id=id.slice(6,id.length);
	//Search object in the collection 
	for (var i=0; i<sectorCollection.length; i++)
		if (id==sectorCollection[i].sectorId)
			break;
	if (i>=sectorCollection.lenght)//If not found
		i=1;
	//console.error(id);
	//console.log(sectorCollection[i]);
	alert (sectorCollection[i].caption);
}*/

//Return current screen size (mines headerHeight)
/*function sizeCorrect(height){
	var headerHeight=$("header").height();
	var screenWidth=$(window).width();
	var screenHeight=$(window).height()-headerHeight;
	var top=Math.round((screenHeight-height)/2);
	var screen={
		width: screenWidth,
		height: screenHeight,
		top: top
	}
	console.log(screen);
	return screen;
}*/


//Double click safeguard
		function doubleClickCheck(location){
			var res=true;
			//Get last marker from MODEL
			var lastI=model.getterLength()-1;
			if (lastI>=0){
				var markerLast=model.getter(lastI);
				var lastLat=markerLast.marker.position.lat();
				var lastLng=markerLast.marker.position.lng();
				//Get current marker location
				var lat=location.lat();
				var lng=location.lng();
				if (lastLat==lat && lastLng==lng)
					res=false;
			}
			return res;
		}