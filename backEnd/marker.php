<?php
	include "../config.php";
	
	//Read
	$method=$_SERVER['REQUEST_METHOD'];//Request method
	$request=explode('/',trim($_SERVER['PATH_INFO'],'/'));//Separate string with '/'
	$data=file_get_contents('php://input');//Request data
	$input=json_decode($data,true);//Transform request data
	
	//Behaviour. Pattern_marker.php/$key1/$key2
	$key1=array_shift($request);
	$key2=array_shift($request);
	$value=array_shift($request);
			
	//Navigation
	$success=false;
	if ($method==='GET'){
		//Method GET
		if ($key1==="markers"){
			//"PLACEMARK" table
			if (strlen($key2)==0)
				readElements("placemark","");
			elseif (strlen($value)==0){
				if ($key2==="lastId")
					readElements("placemark"," ORDER BY id DESC LIMIT 0,1");//Read last saved 'id'
				else				
					readElements("placemark"," WHERE id=".$key2);
			}
			elseif (strlen($key2)>0 && strlen($value)>0)
				readElements("placemark"," WHERE ".$key2."=".$value);
		}elseif ($key1==="users"){
			//"USERS" table
			if (strlen($key2)==0)
				readElements("users","");
			elseif (strlen($value)==0){
				$sector=$_GET['sector'];
				if (strlen($sector)==0)
					readElements("users"," WHERE mail='".$key2."'");
				else
					readUserSectorMarkers($key2,$sector);//Show user sector markers
			}
			elseif (strlen($key2)>0 && strlen($value)>0)
				readElements("users"," WHERE ".$key2."=".$value);//Show all users with {userParameter}={value}
			else{
				header("HTTP/1.1 400 OK");//Bad request
				echo "Error: bad request";
				helpInformation();
			}
		}
		else{
				header("HTTP/1.1 400 OK");//Bad request
				echo "Error: bad request";
				helpInformation();
			}
	}
		
	if ($method==='POST'){
		//Method POST.
		$obj=$input;
		if ($key1==="markers" && strlen($key2)==0){
			$sql="INSERT INTO placemark (id, lat, lng, name, sector) VALUES ('".$obj['id']."','".$obj['lat']."','".$obj['lng']."','".$obj['name']."','".$obj['sector']."')";
			insertUpdateElement($sql);
		}elseif ($key1==="users" && strlen($key2)==0){
			$sql="INSERT INTO users (mail, id, isVisited, isCaptured) VALUES ('".$obj['mail']."','".$obj['id']."','".$obj['isVisited']."','".$obj['isCaptured']."')";
			insertUpdateElement($sql);
		}
		else{
			header("HTTP/1.1 400 OK");//Bad request
			echo "Error: bad request";
			helpInformation();
		}
	}
	
	if ($method==='PUT'){
		//Method PUT
		$obj=$input;
		if ($key1==="markers" && strlen($key2)>0){
			$sql="UPDATE placemark SET";
			$i=1;
			foreach ($obj as $index=>$value){
				if ($i==1) $koma=" ";
				else $koma=", ";
				$sql=$sql.$koma."$index='$value'";
				$i++;
			}
			$sql=$sql." WHERE id=$key2";
			insertUpdateElement($sql);
		}elseif ($key1==="users" && strlen($key2)>0 && strlen($value)>0){
			$sql="UPDATE users SET isVisited='".$obj['isVisited']."', isCaptured='".$obj['isCaptured']."' WHERE mail='$key2' AND id='$value'";
			insertUpdateElement($sql);
		}
		else{
			header("HTTP/1.1 400 OK");//Bad request
			echo "Error: bad request";
			helpInformation();
		}
	}
	
	if ($method==='DELETE'){
		//Method DELETE
		if ($key1==="markers" && strlen($key2)>0)
			removeElement("placemark","id=".$key2);
		elseif ($key1==="users" && strlen($key2)>0 && strlen($value)>0)
			removeElement("users","mail='".$key2."' AND id=".$value);
		else{
			header("HTTP/1.1 400 OK");//Bad request
			echo "Error: bad request";
			helpInformation();
		}
	}
		
	//Insert or update an element
	function insertUpdateElement($sql){
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error){
			header("HTTP/1.1 500 OK");//The resource requested was not found
			echo "Connection error";
			return;
		}
		$res=$conn->query($sql);
		$conn->close();
		if ($res===FALSE){
			header("HTTP/1.1 404 OK");//Not found
			echo "false";
		}
	}
	
	//Read all elements from table
	function readElements($tableName,$sqlSearch){
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error){
			header("HTTP/1.1 500 OK");//The resource requested was not found
			echo "Connection error";
			return;
		}
		$sql="SELECT * FROM $tableName".$sqlSearch;
		$matrix=array();
		$res=$conn->query($sql);
		if ($res->num_rows>0){
			while ($row=$res->fetch_assoc()){
				$matrix[]=$row;
			}
			$res=json_encode($matrix);
			echo $res;
		}else{
			echo "0 results";
		}
		$conn->close();
	}
	
	//Remove marker or user from DB
	function removeElement($tableName,$sqlSearch){
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error){
			header("HTTP/1.1 500 OK");//The resource requested was not found
			return;
		}
		$sql="DELETE FROM $tableName WHERE $sqlSearch";
		echo $sql;
		$res=$conn->query($sql);
		$conn->close();
		if ($res===FALSE){
			header("HTTP/1.1 404 OK");//Not found
		}
	}
	
	//Read user sector markers
	function readUserSectorMarkers($mail,$sector){
		//Connect to DB
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error){
			header("HTTP/1.1 500 OK");//The resource requested was not found
			echo "Connection error";
			return;
		}
		//Read user`s data from 'user'-table
		$allUserMarkers=array();
		$sql="SELECT * FROM users WHERE mail='$mail'";
		$res=$conn->query($sql);
		if ($res->num_rows>0){
			while($row=$res->fetch_assoc())
				$allUserMarkers[]=$row;
		}
		//print_r($allUserMarkers);
		//echo "<br>";
		//Read markers` data which are within selected sector
		$allSectorMarkers=array();
		$sql="SELECT * FROM placemark WHERE sector='$sector'";
		$res=$conn->query($sql);
		if ($res->num_rows>0){
			while($row=$res->fetch_assoc())
				$allSectorMarkers[]=$row;
		}
		//print_r($allSectorMarkers);
		//echo "<br>";
		//Select markers from $allUserMarkers & $allSectorMarkers with equal 'id'
		$matrix=array();
		foreach ($allUserMarkers as $i=>$row){
			$id=$row['id'];
			//echo "userId: ".$id."<br>";
			foreach ($allSectorMarkers as $j=>$rowForCompare){
				$idForCompare=$rowForCompare['id'];
				//echo "compareId: ".$idForCompare."<br>";
				if ($id==$idForCompare){
					$obj=array(
						'id' => $rowForCompare['id'],
						'sector' => $rowForCompare['sector'],
						'name' => $rowForCompare['name'],
						'lat' => $rowForCompare['lat'],
						'lng' => $rowForCompare['lng'],
						'isVisited' => $row['isVisited'],
						'isCaptured' => $row['isCaptured']
					);
					$matrix[]=$obj;
				}				
			}
		}
		//Show result
		//print_r($matrix);
		$res=json_encode($matrix);
		echo $res;
		//Connection close
		$conn->close();
		/*if ($res===FALSE){
			header("HTTP/1.1 404 OK");
			echo "false";
		}*/
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
					<td>GET</td><td>/markers</td><td>Show all markers</td>
				</tr>
				<tr>
					<td>GET</td><td>/users</td><td>Show all users</td>
				</tr>					
				<tr>
					<td>GET</td><td>/markers/{id}</td><td>Show marker with {id}</td>
				</tr>
				<tr>
					<td>GET</td><td>/markers/lastId</td><td>Show last saved marker</td>
				</tr>
				<tr>
					<td>GET</td><td>/users/{userMail}</td><td>Show user with {userMail}</td>
				</tr>
				<tr>
					<td>GET</td><td>/markers/{markerParameter}/{value}</td><td>Show all markers with {markerParameter}={value}</td>
				</tr>
				<tr>
					<td>GET</td><td>/users/{userParameter}/{value}</td><td>Show all users with {userParameter}={value}</td>
				</tr>
				<tr>
					<td>GET</td><td>/users/{userMail}?sector={value}</td><td>Show {userMail} markers are within sector={value}</td>
				</tr>
				<tr>
					<td>PUT</td><td>/markers/{id}</td><td>Update marker with {id}</td>
				</tr>
				<tr>
					<td>PUT</td><td>/users/{userMail}/{id}</td><td>Update user with {userMail} and marker's id={id} </td>
				</tr>
				<tr>
					<td>POST</td><td>/markers</td><td>Insert new marker</td>
				</tr>
				<tr>
					<td>POST</td><td>/users</td><td>Insert new user</td>
				</tr>
				<tr>
					<td>DELETE</td><td>/markers/{id}</td><td>Delete marker with {id}</td>
				</tr>
				<tr>
					<td>DELETE</td><td>users/{userMail}/{id}</td><td>Delete user with {userMail} and marker`s id={id}</td>
				</tr>
			</table>
		";
	}
	
?>