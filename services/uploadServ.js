/*
*                           UPLOAD MODULE
*
*	Read KML file from 'markers'-folder, parse and validate it,
*	check data for match in DB and insert results to DB
*
*/

'user strict';

angular.module('uploadModule')
	.controller('uploadController',function($scope,uploadService,$timeout,$http,uploadSectorService,progressBar){
		
		$scope.maxId=0;//'id' of the last saved marker into the DB
		$scope.parsedLength=0;//Number elements in the parsed XML file
		//Pool of parsed data loading
		var fileName="";
		var step=45;//How many elements
		var number=0;//Pool start number of element
		
		//Upload modal preparation. START uploading.
		$scope.uploadStart=function(){
			$scope.markers=[];
			$scope.parsedLength=0;
			$scope.uploadReadFile=false;//Activate 'Read file'-button
			$scope.save=true;//Dis activate 'Save'-button
			progressBar.clear();
			$scope.progressB=false;
			$scope.uploadClear();
		}
		
		//Clear some variables
		$scope.uploadClear=function(){
			clearEditErrors();
			$scope.processingFile=false;
			//$scope.progressBar=false;
		}
		
		//Upload
		$scope.upload=function(){
			clearEditErrors();
			var obj=document.getElementById("file");
			var id=0;//Max id
			//Get file name
			$scope.fileError=false;
			if ('files' in obj){
				if (obj.files.length==0)
					showFileError();
				else{
					var file=obj.files[0];
					fileName=file.name;
					//File name validation
					var i=fileName.indexOf(".")+1;
					var ext=fileName.slice(i,fileName.length);
					if (ext==="kml"){
						$scope.uploadReadFile=true;//Make 'Read file'-button disabled
						//Get parsed data length
						uploadService.lenghtXML(fileName,function(response){
							if (response.success){
								$scope.parsedLength=response.data;
								uploadSectorService.createSectors();//Calculate sector bounds and sector names
								//Part of the parsed data reads from server. Get pool elements.
								number=1;
								$scope.save=false;//Activate 'Save'-button
								progressBar.start($scope.parsedLength);//Progress bar activated
								$scope.progressB=true;//Progress bar show
								$scope.editData();//Go to the first data editing
							}
							else{
								//Parsed data length read error
								$scope.errorMsg=response.data;
								$scope.editError.errorMsg=true;
							}
						});
						}
						else
							showFileError();//File error
				}
			}
		}
		
		//---------------------- Edit data
		//Load pool and data editing
		$scope.editData=function(){
			$scope.processingFile=true;
			//Read no more than 'step' elements
				uploadService.loadXML(fileName,number,step,function(response){
					if (response.success){
						//Parsed file loaded successfully
						$scope.markers=response.data;
						for (var i=0; i<$scope.markers.length; i++){
							//'$scope.markers' correction
							$scope.markers[i].number=+$scope.markers[i].number;
							$scope.markers[i].lat=+$scope.markers[i].lat;
							$scope.markers[i].lat=Math.round($scope.markers[i].lat*100000)/100000;
							$scope.markers[i].lng=+$scope.markers[i].lng;
							$scope.markers[i].lng=Math.round($scope.markers[i].lng*100000)/100000;
							$scope.markers[i].sector="";
						}
						//Match sector name with marker coordinates
						for (var i=0; i<$scope.markers.length; i++){
							if ($scope.markers[i].lat===undefined) $scope.markers[i].lat=0;
							if ($scope.markers[i].lng===undefined) $scope.markers[i].lng=0;
							var coordinates={
								lat: $scope.markers[i].lat,
								lng: $scope.markers[i].lng
							};
							var res=uploadSectorService.sectorSearch(coordinates);
							if (res==null){
								res="";
								//Show sector error message
								if (!$scope.editError.sector)
									$scope.editError.sector=true;
							}
							$scope.markers[i].sector=res;
						}
						$scope.processingFile=false;
					}
					else{
						//Pool read error
						$scope.errorMsg=response.data;
						$scope.editError.errorMsg=true;
					}
				});
		}
		//Catch coordinates input fields changed
		$scope.latLngChange=function(i){
			//Sector match
			console.log($scope.markers[i]);
			var res=uploadSectorService.sectorSearch($scope.markers[i]);
			$scope.markers[i].sector=res;
		}
		//Remove the marker
		$scope.uploadRemove=function(index){
			$scope.markers.splice(index,1);
		}
		//---------------------- Edit data_(end)
		
		//Save to DB
		$scope.uploadSave=function(){
			clearEditErrors();
			//Catch errors
			//-"There is none of markers to save"
			if ($scope.markers.length==0)
				$scope.editError.markersEmpty=true;
			else{
				//-"You should fill in empty field(s)"
				var index=["name","lat","lng"];//'markers' element`s content list for check
				//Loop thought markers
				for (var i=0; i<$scope.markers.length; i++){
					//Loop thought the markers[i]
					for (var j=0; j<index.length; j++){
						var marker=$scope.markers[i];
						//Search empty fields
						if (marker[index[j]].length==0 && !$scope.editError.fieldEmpty)
							$scope.editError.fieldEmpty=true;
					}
				}
				//-"Number of markers is too big"
				if ($scope.markers.length>step)
					$scope.editError.markersNumber=true;
			}
			//Loop thought the matched errors
			var errorIndex=null;
			var isError=false;
			var item=$scope.editError;
			for (errorIndex in item)
				if (item[errorIndex])
					isError=true;
			if (!isError){
				$scope.save=true;//Dis activate 'save'-button
				//Add marker from 'markers' to DB
				uploadService.saveMarkers(angular.toJson($scope.markers),function(response){
					if (response.success){
						//Markers pool was inserted
						$scope.editError.save=true;
						//Select matched markers
						for (var i=0; i<response.data.length; i++)
							for (var j=0; j<$scope.markers.length; j++){
								if (+response.data[i]==$scope.markers[j].number){
									$scope.markers[j].selected="selected";
								}
							}
					}
					else{
						//Markers pool saving error
						$scope.errorMsg="response.data";
						$scope.editError.errorMsg=true;
					}
				});
			}
		}
		
		//Get next pool
		$scope.nextPool=function(){
			clearEditErrors();
			number+=step;
			$scope.markers=[];
			if (number<$scope.parsedLength){
				progressBar.nextStep(number);//Progress bar show next step
				$scope.editData();
			}
			else{
				console.log("Well done!");
				$("#uploadModalOK").trigger("click");
			}
		}
		
		/* ERROR events */
		//Showing file error during several seconds
		function showFileError(){
			$scope.fileError=true;
			//Clear the error message after ... milliseconds
			$timeout(function(){
				$scope.fileError=false;
			},3000);
		}
		//Clear all edit errors
		function clearEditErrors(){
			$scope.editError={
				errorMsg: false,
				fieldEmpty: false,
				markersEmpty: false,
				markersNumber: false,
				sector: false,
				save: false
			};
		}
		
	})
		
	/* ---------------------- SERVICE -------------------------- */
	.service('uploadSectorService',function(){
		var sectorMarkers=[];
		
		//Calculate coordinates for sector bounds
		this.createSectors=function(){
			//Border line
			var borderCoordinates=[
				{lat:52.42922, lng:22.10449},//leftTop
				{lat:44.30812, lng:22.10449},//leftBottom
				{lat:44.30812, lng:40.19},//rightBottom
				{lat:52.42922, lng:40.19},//rightTop
				{lat:52.42922, lng:22.10449}//leftTop
			];
			//Horizontal lines
			var horLines=[];//Horizontal lines collection
			var horLineX1=22.10449; var horLineX2=40.19;//lng
			var horLineY=[];//lat
			horLineY[0]=44.30812;
			var dY=(52.42922-horLineY[0])/8;
			for (var i=1; i<8; i++){
				horLineY.push(horLineY[i-1]+dY);
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
			var sector=[
			"  ","  ","E1","D1","C1","B1","A1",
			"  ","F2","E2","D2","C2","B2","A2",
			"G3","F3","E3","D3","C3","B3","A3",
			"G4","F4","E4","D4","C4","B4","A4",
			"G5","F5","E5","D5","C5","B5","A5",
			"G6","F6","E6","D6","C6","  ","  ",
			"  ","F7","E7","D7","C7","  ","  ",
			"  ","F8","E8","  ","C8","  ","  "
			];
			function Object(sector,borderLeftBottom){
				this.sector=sector,
				this.borderLeftBottom=borderLeftBottom
			};
			Object.prototype.dX=dX;
			Object.prototype.dY=dY;
			//Make collection
			markerIndex=sector.length-1;
			for (var i=0; i<horLineY.length; i++){
				for (var j=0; j<verLineX.length; j++){
					var obj=new Object(sector[markerIndex],{lat:horLineY[i], lng:verLineX[j]});
					sectorMarkers.push(obj);
					markerIndex--;
				}
			}
		}
			
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
						res=sectorMarkers[i].sector;
						break;
					}				
			}
			return res;
		}
		
	})
	
	/*Upload service*/
	.service('uploadService',function($http){
		
		//Get XML parsed data length
		this.lenghtXML=function(fileName,callBack){
			$http.post("backEnd/xmlParser.php/"+fileName).success(function(data){
				var response={
					success: true,
					data: data
				};
				callBack(response);
			})
			.error(function(data){
				var response={
					success: false,
					data: data
				};
				callBack(response);
			});
		}
		
		//Load pool of parsed XML
		this.loadXML=function(fileName,number,step,callBack){
			$http.get("backEnd/xmlParser.php/"+fileName+"?number="+number+"&step="+step).success(function(data){
				var response={
					success: true,
					data: data
				};
				callBack(response);
			})
			.error(function(data){
				var response={
					success: false,
					data: data
				};
				callBack(response);
			});
		}
		
		//Save parsed markers to DB
		this.saveMarkers=function(markers,callBack){
			$http.post("backEnd/insert.php/"+markers).success(function(data){
				var response={
					success: true,
					data: data
				};
				callBack(response);
			})
			.error(function(data){
				var response={
					success: false,
					data: data
				};
				callBack(response);
			});
		}
	})
	
	//Progress bar animate
	.service('progressBar',function(){
		var parsedLength=0;
		
		this.clear=function(){
			$(".progress>div").css("width","0%");
			$(".progress>div").text("0%");
		}
				
		this.start=function(len){
			parsedLength=len;
		}

		this.nextStep=function(number){
			var progress=Math.round(number*100/parsedLength);
			$(".progress>div").css("width",progress+"%");
			$(".progress>div").text(progress+"%");
		}
		
		this.finish=function(){
			$(".progress>div").css("width","100%");
			$(".progress>div").text("100%");
		}
	});