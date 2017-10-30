
document.addEventListener("plusready", function() {
	var _BARCODE = 'Push'; // 插件名称
	var B = window.plus.bridge;

	var JPushPlugin = {
		receiveMessage: {},
		openNotification: {},
		receiveNotification: {},
		callNative: function(fname, args, successCallback) {
			var callbackId = this.getCallbackId(successCallback, this.errorCallback);
			if(args != null) {
				args.unshift(callbackId);
			} else {
				var args = [callbackId];
			}
			return B.exec(_BARCODE, fname, args);
		},
		getCallbackId: function(successCallback) {
			var success = typeof successCallback !== 'function' ? null : function(args) {
				successCallback(args);
			};
			callbackId = B.callbackId(success, this.errorCallback);
			return callbackId;
		},
		errorCallback: function(errorMsg) {
			console.log("Javascript callback error: " + errorMsg);
		},
		fireDocumentEvent: function(ename, jsonData) {
			var event = document.createEvent('HTMLEvents');
			event.initEvent(ename, true, true);
			event.eventType = 'message';
			jsonData = JSON.stringify(jsonData);
			var data = JSON.parse(jsonData);
			event.arguments = data;
			document.dispatchEvent(event);
		},
		// 通用 API
		getRegistrationID: function(successCallback) {
			this.callNative("getRegistrationID", null, successCallback);
		},
		setTags: function(tags) {
			this.callNative("setTags", tags, null);
		},
		setAlias: function(alias) {
			this.callNative("setAlias", [alias], null);
		},
		setTagsWithAlias: function(tags, alias) {
			if(alias == null) {
				this.setTags(tags);
				return;
			}
			if(tags == null) {
				this.setAlias(alias);
				return;
			}
			var arrayTagWithAlias = [tags];
			arrayTagWithAlias.unshift(alias);
			this.callNative("setTagsWithAlias", arrayTagWithAlias, null);
		},
		stopPush: function() {
			this.callNative("stopPush", null, null);
		},
		resumePush: function() {
			this.callNative("resumePush", null, null);
		},
		isPushStopped: function(successCallback) {
			this.callNative("isPushStopped", null, successCallback);
		},
		// Android methods
		init: function() {
			if(plus.os.name == 'Android') {
				this.callNative("init", null, null);
			}
		},
		setDebugMode: function(mode) {
			if(plus.os.name == 'Android') {
				this.callNative("setDebugMode", [mode], null);
			}
		},
		addLocalNotification: function(builderId, content, title,
			notificaitonID, broadcastTime, extras) {
			if(plus.os.name == 'Android') {
				data = [builderId, content, title, notificaitonID, broadcastTime, extras];
				this.callNative("addLocalNotification", data, null);
			}
		},
		removeLocalNotification: function(notificationId) {
			if(plus.os.name == 'Android') {
				this.callNative("removeLocalNotification", [notificationId], null);
			}
		},
		clearLocalNotifications: function() {
			if(plus.os.name == 'Android') {
				this.callNative("clearLocalNotifications", null, null);
			}
		},
		clearAllNotification: function() {
			if(plus.os.name == 'Android') {
				this.callNative("clearAllNotification", null, null);
			}
		},
		clearNotificationById: function(notificationId) {
			if(plus.os.name == 'Android') {
				this.callNative("clearNotificationById", [notificationId], null);
			}
		},
		setBasicPushNotificationBuilder: function() {
			if(plus.os.name == 'Android') {
				this.callNative("setBasicPushNotification", null, null);
			}
		},
		setCustomPushNotificationBuilder: function() {
			if(plus.os.name == 'Android') {
				this.callNative("setCustomPushNotificationBuilder", null, null);
			}
		},
		setLatestNotificationNum: function(num) {
			if(plus.os.name == 'Android') {
				this.callNative("setLatestNotificationNum", [num], null);
			}
		},
		setPushTime: function(successCallback, weekDays, startHour, endHour) {
			if(plus.os.name == 'Android') {
				this.callNative("setPushTime", [weekDays, startHour, endHour],
					successCallback);
			}
		},
		setSilenceTime: function(successCallback, startHour, startMinute, endHour, endMinute) {
			if(plus.os.name == 'Android') {
				this.callNative("setSilenceTime", [startHour, startMinute, endHour, endMinute], successCallback);
			}
		},
		requetPermission: function() {
			if(plus.os.name == 'Android') {
				this.callNative("requestPermission", null, null);
			}
		},
		onGetRegistrationId: function(rId) {
			if(plus.os.name == 'Android') {
				this.fireDocumentEvent('jpush.onGetRegistrationId', rId);
			}
		},
		receiveMessageInAndroidCallback: function(data) {
			if(plus.os.name == 'Android') {
				data = JSON.stringify(data);
				var jsonObj = JSON.parse(data);
				this.receiveMessage = jsonObj;
				this.fireDocumentEvent("jpush.receiveMessage", this.receiveMessage);
			}
		},
		openNotificationInAndroidCallback: function(data) {
			if(plus.os.name == 'Android') {
				data = JSON.stringify(data);
				var jsonObj = JSON.parse(data);
				this.openNotification = jsonObj;
				this.fireDocumentEvent("jpush.openNotification", this.openNotification);
			}
		},
		receiveNotificationInAndroidCallback: function(data) {
			if(plus.os.name == 'Android') {
				data = JSON.stringify(data);
				var jsonObj = JSON.parse(data);
				this.receiveNotification = jsonObj;
				this.fireDocumentEvent("jpush.receiveNotification", this.receiveNotification);
			}
		},
		// iOS methods
		setBadge: function(value) {
			if(plus.os.name == 'iOS') {
				try {
					this.callNative("setBadge", [value], null);
				} catch(exception) {
					console.log(exception);
				}
			}
		},
		resetBadge: function() {
			if(plus.os.name == 'iOS') {
				try {
					this.callNative("resetBadge", [], null);
				} catch(exception) {
					console.log(exception);
				}
			}
		},
		setApplicationIconBadgeNumber: function(badge) {
			if(plus.os.name == 'iOS') {
				this.callNative("setApplicationIconBadgeNumber", [badge], null);
			}
		},
		getApplicationIconBadgeNumber: function(callback) {
			if(plus.os.name == 'iOS') {
				this.callNative("getApplicationIconBadgeNumber", [], callback);
			}
		},
		startLogPageView: function(pageName) {
			if(plus.os.name == 'iOS') {
				this.callNative("startLogPageView", [pageName], null);
			}
		},
		stopLogPageView: function(pageName) {
			if(plus.os.name == 'iOS') {
				this.callNative("stopLogPageView", [pageName], null);
			}
		},
		beginLogPageView: function(pageName, duration) {
			if(plus.os.name == 'iOS') {
				this.callNative("beginLogPageView", [pageName, duration], null);
			}
		},
		setLogOFF: function() {
			if(plus.os.name == 'iOS') {
				this.callNative("setLogOFF", [], null);
			}
		},
		setCrashLogON: function() {
			if(plus.os.name == 'iOS') {
				this.callNative("crashLogON", [], null);
			}
		},
		setLocation: function(latitude, longitude) {
			if(plus.os.name == 'iOS') {
				this.callNative("setLocation", [latitude, longitude], null);
			}
		},
		addLocalNotificationIniOS: function(delayTime, content, badge,
			notificationID, extras) {
			if(plus.os.name == 'iOS') {
				var data = [delayTime, content, badge, notificationID, extras];
				this.call_native("setLocalNotification", data, null);
			}
		},
		deleteLocalNotificationWithIdentifierKeyIniOS: function(identifierKey) {
			if(plus.os.name == 'iOS') {
				var data = [identifierKey];
				this.call_native("deleteLocalNotificationWithIdentifierKey", data, null);
			}
		},
		clearAllLocalNotificationsIniOS: function() {
			if(plus.os.name == 'iOS') {
				this.call_native("clearAllLocalNotifications", [], null);
			}
		}
	};

	JPushPlugin.init();
	window.plus.Push = JPushPlugin;
	
	//别名
	updateAlias();

	//初始化获得id
	var onGetRegistradionID = function(data) {
//  	alert('初始化成功');    
	}
	window.plus.Push.getRegistrationID(onGetRegistradionID);

}, true);

//点击通知消息时候触发
var onOpenNotification = function() {

	var obj = JSON.parse(window.plus.Push.openNotification.extras['cn.jpush.android.EXTRA']);

	switch(parseInt(obj.type)) {
		case 1: //需求
			close_page('demand-info.html');
			setTimeout(function() {
				GO('demand-info', {
					sign: obj.id
				});
			}, 200);
			break;
		case 2: //个人中心
			close_page('my.html');
			setTimeout(function() {
				GO('my');
			}, 200);
			break;
		case 3: //长文章
			close_page('circle-acricle-info.html');
			setTimeout(function() {
				GO('circle-acricle-info', {
					cid: obj.id
				});
			}, 200);
			break;
	}
}

document.addEventListener("jpush.openNotification", onOpenNotification, false);

//接收到自定义消息
//var onReceiveMessage = function(event) {
//	alert(window.plus.Push.receiveMessage.message);
//	cons(window.plus.Push.receiveMessage);
//}
//document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);

var onTagsWithAlias = function(event) {
//   alert('别名刷新成功');
}
document.addEventListener("jpush.setTagsWithAlias", onTagsWithAlias, false);

//刷新别名消息推送状态
function updateAlias(){
    var id = '';

    //判断是否登陆
    if(plus.storage.getItem('token')){
        var user = JSON.parse(plus.storage.getItem('user'));
        id = user.id;
    }

    window.plus.Push.setAlias(id);
}