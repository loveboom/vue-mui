document.addEventListener("plusready", function() {

	// 监听点击消息事件
	plus.push.addEventListener("click", function(msg) {

		//		mui.toast('点击消息了' + JSON.stringify(msg));

		try {
			//安卓
			var titArr = '';

			//ios
			if(plus.os.name == 'iOS') {
				if(msg.aps) {
					titArr = msg.payload;
				} else {
					titArr = JSON.parse(plus.storage.getItem('titArr'));
				}
			} else {
				titArr = JSON.parse(plus.storage.getItem('titArr'));
			}

			switch(parseInt(titArr.type)) {
				case 1: //需求
					close_page('demand-info.html');
					setTimeout(function() {
						GO('demand-info', {
							sign: titArr.id
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
					close_page('circle-article-info.html');
					setTimeout(function() {
						GO('circle-article-info', {
							cid: titArr.id
						});
					}, 200);
					break;
				case 4: //需求s
					close_page('demand-infos.html');
					setTimeout(function() {
						GO('demand-infos', {
							sign: titArr.id
						});
					}, 200);
					break;
				case 5: //聊天
					close_page('chat.html');
					close_page('chat-main.html');
					setTimeout(function() {
						GO('chat-main', {
							cid: titArr.cid
						});
					}, 200);
					break;
			}

		} catch(e) {

		}

	}, false);

	// 监听在线消息事件
	plus.push.addEventListener("receive", function(msg) {

		//		alert('消息发来了' + JSON.stringify(msg));

		var options = {
			cover: false
		};
		var titArr = {};

		try {
			titArr = JSON.parse(msg.content);
			plus.storage.setItem('titArr', msg.content);

			//弹出本地消息
			plus.push.createMessage(titArr.cap, titArr.cont, options);
		} catch(e) {

		}

	}, false);
//
//	function getPushInfo() {
//		var info = plus.push.getClientInfo();
//
//		var timeBox = setInterval(function() {
//			if(info.clientid) {
//				var msg = "token: " + info.token;
//				msg += "clientid: " + info.clientid;
//				msg += "appid: " + info.appid;
//				msg += "appkey: " + info.appkey;
//
//				//				mui.toast(msg);
//
//				if(plus.storage.getItem('token')) {
//					upPush();
//				}
//				clearInterval(timeBox);
//			}
//		}, 1000);
//	}
//	getPushInfo();
}, false);