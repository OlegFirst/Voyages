<?php
	$method=$_SERVER['REQUEST_METHOD'];
	$request=explode('/',trim($_SERVER['PATH_INFO'],'/'));
	$key=array_shift($request);//Get KML-file name
	
	if ($method==='GET' && strlen($key)>4){	
		$number=$_GET['number'];
		$step=$_GET['step'];
		xml("../markers/$key",$number,$step);
	}
	elseif ($method==='POST' && strlen($key)>4)
		getLength("../markers/$key");
	else{
		header("HTTP/1.1 400 OK");//Bad request
		echo "Error: bad request";
	}
	
	//Get XML=file length
	function getLength($xmlName){
		if (file_exists($xmlName)){
			$xml=simplexml_load_file($xmlName);
			//Count data elements
			$i=0;
			foreach($xml->Document->children() as $placeMark)
				if (strlen($placeMark->name)>0){
					$i++;
				}
			echo $i;
		}
		else {
			header("HTTP/1.1 400 OK");
			echo "can`t process $xmlName file";
		}
	}
	
	//XML parser
	function xml($xmlName,$numberStart,$step){
		$matrix=array();
		if (file_exists($xmlName)){
			$xml=simplexml_load_file($xmlName);
			//Get header information
			//$title=$xml->Document->name;
			//$pos=strpos($title,"Ukraine");$res[]=floatval(substr($arg,0,$pos));
			//$title=substr($title,$pos+8,strlen($title));
			//Get other information
			$number=0;
			foreach($xml->Document->children() as $placeMark){
				if (strlen($placeMark->name)>0){
					if ($number >= $numberStart && $number < $numberStart+$step){
						$element=array(
							'number'=>$number,
							'name'=>(string)$placeMark->name,
							'coordinates'=>(string)$placeMark->Point->coordinates
						);
						$matrix[]=$element;
					}
				}
				$number++;
			}
			//Make JSON response
			$j=1;
			echo "[";
			foreach ($matrix as $i=>$row){
				$row['coordinates']=(string)$row['coordinates'];
				$res=coordinatesParse($row['coordinates']);//Get altitude and longitude
				$lng=$res[0]; $lat=$res[1];
				if ($j>1)
					echo ",";
				$one=$row["name"];
				$one=str_replace("'","@",$one);//Avoid errors with DB 
				$num=$row["number"];
				echo '{"number":"'.$num.'","name":"'.$one.'","lat":"'.$lat.'","lng":"'.$lng.'"}';
				$j++;
			}
			echo "]";
		}
		else {
			//Read file error
			header("HTTP/1.1 400 OK");
			echo "can`t process $xmlName file";
		}
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