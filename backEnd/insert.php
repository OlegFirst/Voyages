<?php
	include "../config.php";
	$method=$_SERVER['REQUEST_METHOD'];
	$request=explode('/',trim($_SERVER['PATH_INFO'],'/'));
	$key=array_shift($request);//Get KML-file name
	
	
	if ($method==='POST' && strlen($key)>0){
		$markersJSON=$key;
		$check=isJson($markersJSON);
		if ($check===TRUE)
			dbCheckInsert($markersJSON);
		if ($check===FALSE){
			header("HTTP/1.1 400 OK");
			//Not JSON
			echo "Error: request parameter is not JSON";
			helpInformation();
		}
	}
	else{
		header("HTTP/1.1 400 OK");//Bad request
		echo "Error: bad request";
		helpInformation();
	}
	
	//Check if these markers are new
	function dbCheckInsert($markersJSON){
		$markers=json_decode($markersJSON,true);
		//Connect to DB
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error){
			//The resource requested was not found
			header("HTTP/1.1 500 OK");
			echo "Connection error";
			helpInformation();
			return;
		}
		//Get maxId from the DB
		$sql="SELECT * FROM placemark ORDER BY id DESC LIMIT 0,1";
		$res=$conn->query($sql);
		$maxId=$res->fetch_assoc();
		$maxId=$maxId['id'];
		//Loop through all 'markers'
		$match=array();//Array of the matched markers
		foreach($markers as $row){
			//Check if the $row marker is not inserted into the DB
			$lat=$row['lat'];
			$lng=$row['lng'];
			$sql="SELECT * FROM placemark WHERE lat=$lat AND lng=$lng";
			$res=$conn->query($sql);
			if ($res->num_rows>0){
				//The $row marker is present in DB
				$match[]=$row['number'];
			}
			else{
				//The $row marker is new one. Insert it into the DB
				$maxId++;
				$name=$row['name'];
				$sector=$row['sector'];
				$sql="INSERT INTO placemark (id, lat, lng, name, sector) VALUES ('".$maxId."','".$lat."','".$lng."','".$name."','".$sector."')";
				$res=$conn->query($sql);
				if ($res===FALSE){
					header("HTTP/1.1 404 OK");//Not found
					echo "Not able to data base insert";
				}
			}
		}
		//Close
		$conn->close();
		//Loop through matched markers array
		$res=json_encode($match);
		echo $res;
	}
	
	//Print
	function prn($arg){
		echo "$arg<br>";
	}
	
	//Request parameter check
	function isJSON($arg){
		json_decode($arg);
		return (json_last_error()==JSON_ERROR_NONE);
	}
	
	
	//Help information
	function helpInformation(){
		echo "
			<h3>Information</h3><hr>
			<table style='border:1px solid black;'>
				<tr style='border:1px solid black;'>
					<th>Method</th><th>URL template</th><th>Description</th>
				</tr>
				<tr>
					<td>POST</td><td>/{markersJSON}</td><td>Insert new markers only</td>
				</tr>
			</table>
		";
	}
	
?>