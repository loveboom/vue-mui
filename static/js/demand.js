RongIMClient.init("vnroth0kvqrxo");
RongIMClient.setConnectionStatusListener({
	onChanged: function(status) {
		switch(status) {
			//链接成功
			case RongIMLib.ConnectionStatus.CONNECTED:
				console.log('链接成功');
				break;
				//正在链接
			case RongIMLib.ConnectionStatus.CONNECTING:
				console.log('正在链接');
				break;
				//重新链接
			case RongIMLib.ConnectionStatus.DISCONNECTED:
				console.log('断开连接');
				break;
				//其他设备登录
			case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
				console.log('其他设备登录');
				break;
				//网络不可用
			case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
				console.log('网络不可用');
				break;
		}
	}
});

mui.ready(function() {

	mui.plusReady(function() {
		var user = JSON.parse(plus.storage.getItem('user'));
		var myid = user.id;

		function Chat() {

			this.init = function() {
				getToken();
				chatList();
			}

			function getToken() {
				mui.ajax({
					url: URL.path + '/account/RygetToken',
					type: 'post',
					data: {
						id: myid,
						token: plus.storage.getItem('token'),
					},
					success: function(data) {
						if(data.returnCode == 200) {
							//							alert(JSON.stringify(data.data))
							var token = data.data.result.token;
							//							alert(vm.mytoken)
							Unread(token);
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg);
							}
						}
					},
					error: function(xhr, type) {
						console.log(type)
					}
				})
			}

			function Unread(token) {
				RongIMClient.getInstance().hasRemoteUnreadMessages(token, {
					onSuccess: function(hasMessage) {
						if(hasMessage) {
							// 有未读的消息
							console.log(hasMessage)
						} else {
							// 没有未读的消息
							console.log('meiyou')
						}
					},
					onError: function(err) {
						// 错误处理...
					}
				});
			}

			function chatList() {
				RongIMClient.getInstance().getConversationList({
					onSuccess: function(list) {
						// list => 会话列表集合。
						console.log(JSON.stringify(list))
					},
					onError: function(error) { 
						// do something...
					}
				}, null);
			}
		}

		var chat = new Chat();
		chat.init();

	})

})