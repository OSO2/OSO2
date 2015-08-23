'use strict';

var OSO = {
  //HID variables
	NUMBER_PACKET_HID: 34,
	isHIDReceivedData: false,
	HID_Buffer: new Uint8Array(3072),//current: 64x34 = 2176
	HID_Counter: 0,
	//Internal variables
	userName: "Patient Name",
	bodyPart: "Left hand",
	previousBodyPart: 0,
	leftTime: "",
	rightTime: "",
	serialNumber: "HCB20040",
	version: "SBPM14",
	SYS: 120,
	DIA: 80,
	PULSE: 70,
	DIF0: 100,
	DIF1: 3.0,
	DIF2: 3,
	DIF3: 1.5,
	DIF4: 3.1,
	DIF5: 0,
	DIF6: 0,
	server: "http://www.oso2.com.au/HC/data.aspx?",
	server2: "http://oso2.com/Request.aspx?",
	server3: "http://oso2.net.au/VN/sbpm.aspx?",
	server4: "http://oso2.com/VN/hap.aspx?",
	server5: "http://oso2.com/VN/Usolution.aspx?",
	urls: [],
	packageIndex: 0,
	key1: "1fba4420a1bfbbe10f76230acadf3a99a1be5e723f9eb5284716beb9f93f9818",
	key2: "75b2ccd99cdf53a17f9ead9d9f57725c",
	keyl1: "093cdd40c091c8e5d1c9ba872737140fdf49029e42e38c688479f39296050c9a",
	keyl2: "d5aa3ce5c8d251dfa35ca688b2b468cb",
	isSendSuccess: false,
	isLRSent: false,
	isStart: false

};
OSO.HID_proccessData = function(){
 		if (!this.isStart){
          console.log("Application isn't started. Please click Start button!");
          return;
	    }
	    var receivedValue ;
	    var dt = new Date();
	    //string receivedValue = "";
	    if (this.HID_Buffer[0] == 255 && this.HID_Buffer[1] == 255 && this.HID_Buffer[2] == 255){
	        if (this.HID_Counter > 6 && this.HID_Buffer[this.HID_Counter - 3] == 255 && this.HID_Buffer[this.HID_Counter - 2] == 255 && this.HID_Buffer[this.HID_Counter - 1] == 255)
	        {
	            //Send data to server
	            if (this.HID_Counter >= 8)
	            {
	                receivedValue =bytesToString(this.HID_Buffer);
	                //lstReceivedData.Items.Add(dt.ToString("dd/MM/yy hh:mm:ss: ") + receivedValue);
	                var isOK = sendDatatoServer(receivedValue, dt);
	                //lstResults.Items.Add(dt.ToString("dd/MM/yy hh:mm:ss: ") + "Send "+ isOK.ToString());
	                //isHIDReceivedData = false;
	            }
	            else
	            {//error data
	            }
	        }
	    }
	    else
	    {//Waiting for start signal
	    }
};
OSO.requestCode = function(option){
	XHRSend(this.server2+"serial="+this.serialNumber,XHRRequestSuccesss,XHRError,option);
}
OSO.getSolution = function(ste,option){
	//lefttime=150815125027%20CH&righttime=150815125055%20CH
	var url = this.server3;
	if(option=="view"){
		var mD = new Date();
		//"10:02:52 PM"
		var mTime = mD.toLocaleTimeString();
		if(mTime.length ==10){
			mTime = "0"+mTime;
		}
		//"ddMMyyhhmmss"
		var id = mD.getDate()
			+ '' +((mD.getMonth() < 9) ? '0' + (mD.getMonth()+1): mD.getMonth()+1)
			+ '' + (mD.getFullYear()%100)
	        + '' + mTime.substr(0,2)
	        + '' + mTime.substr(3,2)
	        + '' + mTime.substr(6,2);
	    mTime = id + "%20" + mTime.substr(9,2);

		url += "cmd=view&user=self"
		+ "&serial=" + this.serialNumber 
		+"&lefttime=" + mTime + "&righttime=" + mTime 
		+"&c="+encodeURIComponent(ste);
	}else{
		url += "cmd=&user="+ encodeURIComponent(this.userName) 
		+ "&serial=" + this.serialNumber 
		+"&lefttime=" + this.leftTime + "&righttime=" + this.rightTime 
		+"&c="+encodeURIComponent(ste);
	}
	console.log("getSolution: " + url);
	document.getElementById("oso_popup").src = url;
}

OSO.testSend = function(){
  var i = 0;
  this.HID_Buffer[0] = this.HID_Buffer[1] = this.HID_Buffer[2] = 255;
  this.HID_Buffer[1999] = this.HID_Buffer[1998] = this.HID_Buffer[1997] = 255;
  this.HID_Counter = 2000;
  for (i = 3; i < 1997; i++)
  {
      if (i%2 == 1)
          this.HID_Buffer[i] = 4;
      else
          this.HID_Buffer[i] = (20 - i % 20);
  }
  this.isStart = true;
  console.log("Testing");
  this.HID_proccessData();
};

function sendDatatoServer(data, d){
	var BodyPartID = "0"; // LEFT HAND
	if(OSO.bodyPart == "Left hand"){
		OSO.previousBodyPart = 0;
	}else{
		OSO.previousBodyPart = 1;
	}
	OSO.bodyPart= "Left hand";
	var tempStr =document.getElementById("tl-patientName").value;
	if (document.getElementById("tl-righthand").checked == true)
	{
		BodyPartID = "1"; 
		OSO.bodyPart= "Right hand";
	}
	if (tempStr != "")
	{
		OSO.userName= tempStr;
	}
	var dataLength = data.length;
	//"ddMMyy"
	var mDate = d.getDate()
		+ '' +((d.getMonth() < 9) ? '0' + (d.getMonth()+1): d.getMonth()+1)
		+ '' + (d.getFullYear()%100);
	//"10:02:52 PM"
	var mTime = d.toLocaleTimeString();
	if(mTime.length ==10){
		mTime = "0"+mTime;
	}
	//"ddMMyyhhmmss"
	var id = d.getDate()
		+ '' +((d.getMonth() < 9) ? '0' + (d.getMonth()+1): d.getMonth()+1)
		+ '' + (d.getFullYear()%100)
        + '' + mTime.substr(0,2)
        + '' + mTime.substr(3,2)
        + '' + mTime.substr(6,2);
    mTime = id + "%20" + mTime.substr(9,2);
    if(BodyPartID == 1){
    	OSO.rightTime = mTime;
    }else{
    	OSO.leftTime = mTime;
    }
    var strLog;
    strLog = "Measurement result of <b>"+ OSO.userName +"</b>'s " + OSO.bodyPart 
    + ": |SYS:<b>" +OSO.SYS+"</b>|"
    + "DIA:<b>" +OSO.DIA+"</b>|"
    + "P/M:<b>" +OSO.PULSE+"</b>|"
    + "DIF1:<b>" +OSO.DIF1+"</b>|"
    + "DIF2:<b>" +OSO.DIF2+"</b>|"
    + "DIF3:<b>" +OSO.DIF3+"</b>|"
    + "DIF4:<b>" +OSO.DIF4+"</b>|"
    + "DIF5:<b>" +OSO.DIF5+"</b>|"
    + "DIF6:<b>" +OSO.DIF6+"</b>|"
    GUI.log(strLog);

	var size = formatNum(dataLength,"000000");
	var packageNum = Math.ceil(dataLength / 300);
	var strPackageNum = formatNum(packageNum,"00");
	var dataPackage = "";
	var url = OSO.server;
	var i;
	console.log("Start create data Datapackages:");
	for (i = 0; i < packageNum; i++){
		dataPackage = "";
		url = OSO.server;
		if (i != packageNum - 1)
		{
		    dataPackage += size + strPackageNum + formatNum(i + 1,"00") + "000300";
		    dataPackage += data.substr(i * 300, 300);
		}
		else
		{
		    dataPackage += size + strPackageNum + formatNum(i + 1,"00")  +
		        formatNum(dataLength - i * 300,"000000");
		    dataPackage += data.substr(i * 300,
		        dataLength - i * 300);
		}
	
		url += "id=" + id + "&acc=" + OSO.userName + "&SerialNumber=" + OSO.serialNumber +
		       "&BodyPartID=" + BodyPartID +
		      "&time=" + mTime + "&data=" + dataPackage;   
		OSO.urls.push(url); 
	}
	console.log("Total package: " + packageNum);
	OSO.urls.reverse();
	OSO.packageIndex = packageNum-1;
	if(packageNum >0){
		console.log("XHRSend package: " + OSO.packageIndex);
		XHRSend(OSO.urls[OSO.packageIndex],XHRSuccess,XHRError);
	}
    return packageNum;
}
function XHRSend(url,successCallback, errorCallback, option1) {
  console.log("XHRSend url: " + url);
  
  var req = new XMLHttpRequest();
  if(url.length>5){
	req.onload = function (e) {
		successCallback(req.status, req.responseText, option1);
	};
	req.onerror = errorCallback;
	req.open('GET', url);
	req.send();
  }
}
function XHRSuccess(mstatus,mrespText){
	if(checkResponse(mstatus,mrespText) == true){ 
	  OSO.urls.pop();
		if(OSO.urls.length >0){
			OSO.packageIndex --;
			console.log("XHRSend package: " + OSO.packageIndex);
			XHRSend(OSO.urls[OSO.packageIndex],XHRSuccess,XHRError);
		}else{
			allSent(true);
		}
	}else{
		allSent(false);//maybe try some more times
	}
}

function checkResponse(status,resp){
	var tempResp = false;
	console.log("Response of package: " + OSO.packageIndex);
	if (status === 200) {
		console.log("Server response: " + resp);
		if ((resp.substr(0, 2) == "RR")||(resp.substr(0, 2) == "OK")){
      tempResp = true;
    }
	}else{
		console.log("Server Error: " + status);
	}
	return 	tempResp;
}

function XHRError(e) {
	OSO.isSendSuccess = false;
	console.log('Stopped! communication error: ', e);
	//console.log("Current package: " + OSO.packageIndex);
}
function allSent(aStatus){
	OSO.isSendSuccess = aStatus;
	console.log('Stopped! with status: '+aStatus);
	if(OSO.previousBodyPart == 0 && OSO.bodyPart == "Right hand"){
		OSO.isLRSent = true;
		OSO.requestCode();
	}else{
		OSO.isLRSent = false;
	}
}
function XHRRequestSuccesss(mstatus,mrespText,moption){
	if (mstatus === 200) {
		console.log("Server response: " + mrespText);
		var textl = null;
		var key = CryptoJS.enc.Hex.parse(OSO.keyl1);
		var iv = CryptoJS.enc.Hex.parse(OSO.keyl2);
	
		var input = mreverse(mrespText);
		var decrypted = CryptoJS.AES.decrypt(input, key, {iv: iv});
		textl = decrypted.toString(CryptoJS.enc.Utf8);
		console.log("Server response: " + textl);

		key = CryptoJS.enc.Hex.parse(OSO.key1);
		iv = CryptoJS.enc.Hex.parse(OSO.key2);
		var encrypted = CryptoJS.AES.encrypt(decrypted, key, { iv: iv });
		input = ""+encrypted;
		input = mreverse(input);
		console.log("Server response: " + input);
		OSO.getSolution(input,moption);
    }else{
		console.log("Server Error: " + status);
	}
}


function mreverse(s){
    return s.split("").reverse().join("");
}
//Start: 255 255 255, End: 255 255 255
function bytesToString(temp){
    	if (temp === null){
            return;
    	}
      var counter = 0;
      var i;
      var mReceivedValue ="";
      //int calValue = temp[4];            
      for (i = 3; i < 3072; i++)
      {
          if (temp[i] == 255 && temp[i + 1] == 255 && temp[i + 2] == 255)
          {
              counter = i;
              break;
          }
      }
      var calValue = 0;
      calValue = temp[3]* 256 + temp[4];
      mReceivedValue += calValue.toString();
      for (i = 5; i < counter; i++)
      {
          calValue = temp[i] * 256 + temp[i + 1];
          mReceivedValue += "," + calValue.toString();
          i++;
      }
      // Lay serial number
      var sn = "";
      var temp_int = temp[2000 + 7] * 256 + temp[2000 + 8];
      sn = String.fromCharCode(temp[2000+4]);//H
      sn = sn + String.fromCharCode(temp[2000 + 5]);//C
      sn = sn + String.fromCharCode(temp[2000 + 6]);//B
      sn = sn + temp_int.toString();//20040
      if(sn.length == 8){
      	OSO.serialNumber = sn;
      	if(sn.indexOf("A")>0){
      		OSO.version ="SBPM12";
      	}
      	$('#tl-version').text(OSO.version);
    	$('#tl-serial').text(OSO.serialNumber);

    	OSO.SYS = temp[2000 + 27] * 256 + temp[2000 + 28];
    	OSO.DIA = temp[2000 + 29] * 256 + temp[2000 + 30];
    	OSO.PULSE = temp[2000 + 31] * 256 + temp[2000 + 32];
    	OSO.DIF1 = temp[2000 + 33] * 256 + temp[2000 + 34];
    	OSO.DIF2 = temp[2000 + 35] * 256 + temp[2000 + 36];
    	OSO.DIF3 = temp[2000 + 37] * 256 + temp[2000 + 38];
    	OSO.DIF4 = temp[2000 + 39] * 256 + temp[2000 + 40];
    	OSO.DIF5 = temp[2000 + 41] * 256 + temp[2000 + 42];
    	OSO.DIF6 = temp[2000 + 43] * 256 + temp[2000 + 44];
    	OSO.DIF0 = temp[2000 + 45] * 256 + temp[2000 + 45];

      }
       
      //GUI.log(url);
      //txtTestingSerialNumber.Text = sn;
      return mReceivedValue;
}  
function formatNum(val,strFormat){
//30,"000000"=> return"000030"
	var mstr = new Uint8Array(strFormat.length);
	var temp = val;
	var i;
	for(i = strFormat.length -1; i>=0; i--){
		mstr[i]= 0x30 + temp%10;
		temp = (temp/10)|0;
	}
	temp="";
	for(i = 0; i<strFormat.length; i++){
		temp += String.fromCharCode(mstr[i]);
	}
	return temp;
}


