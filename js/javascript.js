var id=null;//Marker 'id' for edit
var selectedMarker=null;//Get user marker

//Sign up / sign out
function signUpOut(userMail){
	if (userMail!=="unregistered"){
		//New user has already register
		document.getElementById("userLogin").innerHTML="User: "+userMail;
		if (userMail==="admin@gmail.com")
		document.getElementById("userLogin").innerHTML="Administrator";
		document.getElementById("signOut").removeAttribute("disabled");
	}
	else{
		//User went out
		document.getElementById("userLogin").innerHTML="User: unregistered";
		document.getElementById("signOut").setAttribute("disabled","disabled");
		//Go to main page
		window.location.href="index.html";
	}
}

//Map start
function mapInit(){
	//Map initialize
		map=new google.maps.Map(document.getElementById("map"),{
		center: {lat: 49.41097, lng: 31.55273},
		zoom: 5,
		minZoom: 4,
		maxZoom: 17,
		disableDefaultUI: true,//Turn off the API`s default UI settings entirely
		mapTypeId: google.maps.MapTypeId.TERRAIN
		});
		console.info("mapInit");
}

/* Modal */
//Marker edit modal show
function markerEdit(markerId){
	id=markerId;
	$("#editModal").trigger("click");//Show #editModal within administrator.html/user.html
}
//Marker remove
function markerRemove(markerId){
	id=markerId;
	$("#removeModal").trigger("click");
}
//Upload
function uploadModalShow(){
	$("#uploadModal").trigger("click");
}
//User get new marker
function getNewMarker(marker){
	//userMarkerId=markerId;
	selectedMarker=marker;
	$("#getNewMarker").trigger("click");
}

$(document).ready(function(){

});