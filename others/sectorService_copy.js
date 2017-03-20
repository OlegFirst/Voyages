			/* Show map with sectors */
			mapService.showMapWithSectors();
			//Sector selecting
			
			
			$scope.circle.addListener("click",function(){//Mouse clicks within circle
				var center={
					lat: $scope.circle.getCenter().lat(),
					lng: $scope.circle.getCenter().lng()
				};
				//Search selected sector
				var res=sectorService.sectorSearch(center);
				if (res!=null){
					if ($scope.sectorCoordinates!=null){//If user is able to change selected sector
						//$("#sectorChangeModal").trigger("click");
						//return;
					}
					//Open sector
					$scope.$apply(function(){
						$scope.sectorName="Sector name: "+res.sectorMarker.marker.label;
					});
					$scope.sectorCoordinates=res;
					map.setCenter(center);
					$scope.circle.setMap(null);//Circle clear;
					map.setZoom(10);
					//Read markers in the chosen sector
					mapService.readSector(res.sectorMarker.marker.label);
				}		
				//map.panTo(center);
			});
		}