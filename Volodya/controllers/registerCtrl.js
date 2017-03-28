'use strict';
angular.module('registerModule')
	.controller('registerCtrl',function($scope,authenticationService){
		//Register new user
		$scope.registerSubmit=function(){
			authenticationService.mailValidation($scope.mail,$scope.password,function(response){
				//Hide alerts
				$scope.showError=false;
				$scope.showSuccess=false;
				//Mail validation
				if (response.success)
					$scope.showError=false;
				else{
					$scope.showError=true;
					$scope.error=response.message;
				}
				//If mail and password are valid check is he a new user
				if (response.success)
					authenticationService.isNewUser($scope.mail,function(response){
						if (response.success)
							$scope.showError=false;
						else{
							$scope.showError=true;
							$scope.error=response.message;
						}
						//Add this user to 'security'-table
						if (response.success){
							authenticationService.addUser($scope.mail,$scope.password,function(response){
								console.log(response);
								$scope.success=response.message;
								$scope.showSuccess=true;
								signUpOut($scope.mail);
							});
						}
					});
			});
		};
	});