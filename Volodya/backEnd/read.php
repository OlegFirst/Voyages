<?php
	include "../config.php";
	$action=$_GET['action'];
		
	//Navigation
	$success=false;
	if ($action==='loginCheck')
		$success=loginCheck($GLOBALS['table3'],$_GET['mail'],$_GET['password']);
	if ($action==='isNewUser')
		$success=isNewUser($GLOBALS['table3'],$_GET['mail']);
	if ($action==='addUser')
		$success=addUser($GLOBALS['table3'],$_GET['mail'],$_GET['password']);
	if ($success===FALSE)
		echo "false";//Action wasn`t successful
	
	//Check user has already login
	function loginCheck($tableName,$mail,$password){
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		//$conn=new mysqli('s',$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error) return;
		$sql="SELECT * FROM $tableName WHERE mail='$mail' AND password='$password'";
		//$sql="SELECT * FROM $tableName WHERE mail='mail' AND password='$password'";
		$res=$conn->query($sql);
		if ($res->num_rows>0)
			echo "true";
		else
			echo "false";
		$conn->close();
		return true;//Action was successful
	}
	
	//Check is a new user
	function isNewUser($tableName,$mail){
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error) return;
		$sql="SELECT * FROM $tableName WHERE mail='$mail'";
		$res=$conn->query($sql);
		if ($res->num_rows>0)
			echo "false";
		else
			echo "true";
		$conn->close();
	}
	
	//Add new user
	function addUser($tableName,$mail,$password){
		$conn=new mysqli($GLOBALS['serverName'],$GLOBALS['userName'],$GLOBALS['password'],$GLOBALS['dbName']);
		if ($conn->connect_error) return;
		$sql="INSERT INTO $tableName (mail, password) VALUES ('$mail','$password')";
		$res=$conn->query($sql);
		if ($res===TRUE)
			echo "true";
		else
			echo "false";
		$conn->close();
	}
?>