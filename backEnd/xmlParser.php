<?php
	$method=$_SERVER['REQUEST_METHOD'];
	$request=explode('/',trim($_SERVER['PATH_INFO'],'/'));
	$key=array_shift($request);//Get KML-file name
	
	if ($method==='GET' && strlen($key)>4)	
		xml("../markers/$key");
	else{
		header("HTTP/1.1 400 OK");//Bad request
		echo "Error: bad request";
	}
		
	//XML parser
	function xml($xmlName){
		$matrix=array();
		$xml=simplexml_load_file($xmlName) or die ("Error: Cannot create object");
		//Get header information
		$title=$xml->Document->name;
		$pos=strpos($title,"Ukraine");$res[]=floatval(substr($arg,0,$pos));
		$title=substr($title,$pos+8,strlen($title));
		//echo "<b>Location name:</b> ".$title."<br>";
		//Get other information	
		foreach($xml->Document->children() as $placeMark){
			if (strlen($placeMark->name)>0){
				$element=array(
					'name'=>(string)$placeMark->name,
					'coordinates'=>(string)$placeMark->Point->coordinates
				);
				$matrix[]=$element;
			}
		}
		//Make JSON response
		$j=1;
		echo "[";
		foreach ($matrix as $i=>$row){
			if ($j<20){
			$row['coordinates']=(string)$row['coordinates'];
			$res=coordinatesParse($row['coordinates']);//Get altitude and longitude
			$lng=$res[0]; $lat=$res[1];
			if ($j>1)
				echo ",";
			$one=$row["name"];
			echo '{"name":"'.$one.'","lat":"'.$lat.'","lng":"'.$lng.'"}';
			$j++;
			}
		}
		echo "]";
	}
	
	//DB read
	function dbRead($tableName){
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error)
			die("Connection to Data Base failed: ".$conn->connect_error);
		//Get data from DB
		$sql="SELECT * FROM $tableName";
		$res=$conn->query($sql);
		if ($res->num_rows>0)
			while ($row=$res->fetch_assoc()){
				$name=dbException($row['name'],"read");
				if ($row['existing']==0)
					$existing=false;
				else
					$existing=true;
				echo var_dump($existing).$row['id']." ".$name." ".$row['lat']." ".$row['lng']."<br>";
			}
		else
			echo "Table hasn`t been read";
		//Connection close
		$conn->close();
	}
	
	//DB save
	function dbSave($tableName){
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error)
			die("Connection to Data Base failed: ".$conn->connect_error);
		//Set data into DB
		$sql="INSERT INTO $tableName (name, lat, lng) VALUES ('lovely place', '12.12345', '13.12345')";
		if ($conn->query($sql)===TRUE)
			echo "New record created successfully";
		else
			echo "Error: ".$sql."<br>".$conn->error;
		//Connection close
		$conn->close();
	}
	
	function coordinatesParse($arg){
		$res=array();
		//Search the first coordinate
		$pos=strpos($arg, ",");
		$res[]=floatval(substr($arg,0,$pos));
		//Search the second coordinate
		$arg=substr($arg,$pos+1,strlen($arg)-$pos);
		$pos=strpos($arg, ",");
		$res[]=floatval(substr($arg,0,$pos));
		return $res;
	}
	
	function dbException($arg,$way){
	//arg_$arg='save'/'read'
	//res_$arg
		if ($way==="save"){
			//Change ' to @
			$arg=str_replace("'","@",$arg);
		}
		if ($way==="read"){
			//Change @ to '
			$arg=str_replace("@","'",$arg);
		}
		return $arg;
	}
	
?>