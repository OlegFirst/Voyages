'use strict';
angular.module('loginModule')
	.controller('loginCtrl',function($scope,authenticationService,$location,$timeout){
		//Check if user data is correct
		$scope.loginSubmit=function(){
			authenticationService.login($scope.mail+"@gmail.com",$scope.password,function(response){
				//Hide alerts
				$scope.showError=false;
				$scope.showSuccess=false;
				//Get returning data from the service
				if (response.success){
					$scope.showError=false;
					$scope.success=response.message;
					$scope.showSuccess=true;
					signUpOut($scope.mail+"@gmail.com");
					$timeout(function(){//Pause
						if ($scope.mail==="admin"){
							//Go to 'administrator' page
							$location.path('/administrator');
						}
						else{
							//Go to 'user' page
							$location.path('/user');
						}
					},1000);
				}
				else{
					$scope.error=response.message;
					$scope.showError=true;
				}
			});
		};
	});

//}]);