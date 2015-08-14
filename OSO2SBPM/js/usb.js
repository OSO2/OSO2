'use strict';

var usbDevices = {
    atmega32u4: {"vendorId": 9025, "productId": 32822},
    cp2102:     {"vendorId": 4292, "productId": 60000},
    ftdi:       {"vendorId": 1027, "productId": 24577}
};
var MAX_HID_REPORT_NUM = 34;
var mHidDeviceId;
var mHidConnectionId; 
var mHidReportId;
var mHidReportNum;
function arrayBufferToString(array) {
    return String.fromCharCode.apply(null, new Uint8Array(array));
}
var hidStart = function(){
    if(mHidDeviceId){
        mHidReportNum = 0;
        chrome.hid.connect(
            mHidDeviceId,
            function(connection){
                mHidConnectionId = connection.connectionId;
                if(mHidConnectionId){
                    console.log('HID connectionId: ' + mHidConnectionId);
                    //myDevicePoll();
                    sendCommand(1);
                    //myDevicePoll();
                }
        });
    }else{
        console.log('HID start timeout! -> device is booting OK');
    }
}
var sendCommand = function(command){
    var bytes = new Uint8Array(64);
    var command1 = 0x81;
    if(command==2) command1 = 0x82;
    bytes[0] = command1;
    for (var i = 1; i < 64; ++i) {
      bytes[i] = 0x00;
    }
    chrome.hid.send(mHidConnectionId, 0, bytes.buffer, function() {
      console.log('Send: '+command1 );
      myDevicePoll();
    });
}
var myDevicePoll = function() {
    var size = 64;
    var value;
    if(mHidConnectionId){
        chrome.hid.receive(mHidConnectionId,function(reportId,data) {
            if (data != null) {
                // Convert Byte into Ascii to follow the format of our device
                size = data.lenght;
                value = arrayBufferToString(data);
                mHidReportNum++;
                console.log('Seq: '+ mHidReportNum +', Data: ' + value);

                if((mHidReportNum > 1)&&(mHidReportNum <= MAX_HID_REPORT_NUM)){
                    setTimeout(myDevicePoll, 0);
                }else if((mHidReportNum == 1) && (value.indexOf("12345") == 1)){
                    sendCommand(2);//send the second command

                }
            }
        });
    }
}   
var resetDevice = function(mdeviceId){
    if(mHidConnectionId){
        chrome.hid.disconnect(mHidConnectionId);
    }
    mHidDeviceId = null;
    mHidConnectionId = null;
}

var usbPermissions = {permissions: [{'usbDevices': [usbDevices.atmega32u4, usbDevices.cp2102, usbDevices.ftdi]}]};

function check_usb_permissions(callback) {
    chrome.permissions.contains(usbPermissions, function(result) {
        if (result) {
            GUI.optional_usb_permissions = true;
        } else {
            console.log('Optional USB permissions: missing');
            GUI.log(chrome.i18n.getMessage('please_grant_usb_permissions'));

            // display optional usb permissions request box
            $('div.optional_permissions').show();

            // UI hooks
            document.getElementById("requestOptionalPermissions").addEventListener('click', function() {
                chrome.permissions.request(usbPermissions, function(result) {
                    if (result) {
                        GUI.log(chrome.i18n.getMessage('usb_permissions_granted'));
                        $('div.optional_permissions').hide();

                        GUI.optional_usb_permissions = true;
                    }
                });
            });
        }

        if (callback) callback();
    });
}