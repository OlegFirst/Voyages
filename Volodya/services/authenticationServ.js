'use strict';
angular.module('loginModule')
	.factory('authenticationService',function($http){
		var service={};
		
		// 'loginCtrl' 
		//Checking user has already login
		service.login=function(mail,password,callBack){
			//Read from server
			$http.post("backEnd/read.php?action=loginCheck&mail="+mail+"&password="+password).success(function(data){
				//data "true", "false", "...error...",
				var response={};
				if (data.length>9)
					if (data.slice(4,9)=="error"){
						response.message="Connection to data base failed!";
						response.success=false;
					}
				if (data==="true"){
					response.message="Your account is created";
					response.success=true;
				}
				if (data==="false"){
					response.message="Mail or password is incorrect";
					response.success=false;
				}
				callBack(response);
			});
		};
		
		// 'registerCtrl'
		//Mail validation
		service.mailValidation=function(mail,password,callBack){
			var response={};
			var pat=/^[a-zA-z]{1}[a-zA-z0-9]+@gmail.com$/g;
			response.success=pat.test(mail);
			if (response.success)
				response.message="Your account is created";
			if (!response.success)
				response.message="E-mail is incorrect";
			callBack(response);
		};
		
		// 'registerCtrl'
		//DB user check
		service.isNewUser=function(mail,callBack){
			//Read from server
			$http.post("backEnd/read.php?action=isNewUser&mail="+mail).success(function(data){
				var response={};
				console.log("service: "+data);
				if (data.length>9)
						if (data.slice(4,9)=="error"){
							response.message="Connection to data base failed!";
							response.success=false;
						}
				if (data==="true"){
					response.message="Your account is created";
					response.success=true;
				}
				if (data==="false"){
					response.message="Your e-mail is used";
					response.success=false;
				}
				callBack(response);
			});
		}
		
		// 'registerCtrl'
		//Add new user to 'security'-table
		service.addUser=function(mail,password,callBack){
			//Read from server
			$http.post("backEnd/read.php?action=addUser&mail="+mail+"&password="+password).success(function(data){
				var response={};
				console.log(data);
				if (data.length>9)
						if (data.slice(4,9)=="error"){
							response.message="Connection to data base failed!";
							response.success=false;
						}
				if (data==="true"){
					response.message="User has been registered";
					response.success=true;
				}
				if (data==="false"){
					response.message="User hasn`t been registered";
					response.success=false;
				}
				callBack(response);
			});
		}
		
		return service;
		
	});
//}]);

//Catch errors from server
function catchError(data){
	var res={
		message: "",
		success: true
	};
	if (data=="zero"){
		res.message="Zero results";
		res.success=false;
	}
	else{
		if (data.length>9)
			if (data.slice(4,9)=="error"){
				res.message="Connection to data base failed";
				res.success=false;
			}
	}
	return res;
}

/*service.validation=function(mail,password,callBack){
			console.log(mail,password);
			var pat=/^[a-zA-z]{1}[a-zA-z0-9]+@gmail.com/g;
			var res=pat.test(mail);
		}*/