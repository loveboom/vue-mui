var vm = new Vue({
	el: '#main',
	data: {
		token: '',
		content: '',
		mytoken: '',
		list: [],
		islogin: true,
		myname: '',
		myavatar: '',
		othername: '',
		otheravatar: '',
		canScroll: true,
		maxScroll: '',
		firstLoad: true,
		newMessage: '',
		id: '',
		msLength:0
	}
})

mui.init();

mui.ready(function() {
	mui.plusReady(function() {
		mui.ajax({
			url: URL.path + '/account/ryAppKey',
			type: 'post',
			data: {
				token: plus.storage.getItem('token')
			},
			success: function(data) {
				if(data.returnCode = 200) {
					var appkey = data.data.Appkey;
					CHAT(appkey);
				}
			}
		})
	})
})

function CHAT(appkey) {
	RongIMClient.init(appkey);

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
	// 消息监听器
	RongIMClient.setOnReceiveMessageListener({
		// 接收到的消息

		onReceived: function(message) {

			// 判断消息类型
			switch(message.messageType) {
				case RongIMClient.MessageType.TextMessage:
					// 发送的消息内容将会被打印
					var mes = {};
					mes.user = 'other';
					mes.content = message.content.content;
					mes.time = moment(message.sentTime).format('MM-DD HH:mm');
					//				plus.storage.setItem(vm.id) = mes.content;
					vm.list.push(mes);
					//				var scroll = document.querySelector(".mui-scroll").clientHeight - document.querySelector(".mui-scroll-wrapper").clientHeight;
					//				mui('.mui-scroll-wrapper').scroll().scrollTo(0, -scroll, 500);
					vm.$nextTick(function() {
						var scrollHeight = $('.mui-scroll').height() - $(".mui-scroll-wrapper").height();
						$('.mui-scroll-wrapper').animate({
							scrollTop: scrollHeight + 'px'
						}, 500);
					})

					break;
				case RongIMClient.MessageType.VoiceMessage:
					// 对声音进行预加载                
					// message.content.content 格式为 AMR 格式的 base64 码
					RongIMLib.RongIMVoice.preLoaded(message.content.content);
					break;
				case RongIMClient.MessageType.ImageMessage:
					// do something...
					break;
				case RongIMClient.MessageType.DiscussionNotificationMessage:
					// do something...
					break;
				case RongIMClient.MessageType.LocationMessage:
					// do something...
					break;
				case RongIMClient.MessageType.RichContentMessage:
					// do something...
					break;
				case RongIMClient.MessageType.DiscussionNotificationMessage:
					// do something...
					break;
				case RongIMClient.MessageType.InformationNotificationMessage:
					// do something...
					break;
				case RongIMClient.MessageType.ContactNotificationMessage:
					// do something...
					break;
				case RongIMClient.MessageType.ProfileNotificationMessage:
					// do something...
					break;
				case RongIMClient.MessageType.CommandNotificationMessage:
					// do something...
					break;
				case RongIMClient.MessageType.CommandMessage:
					// do something...
					break;
				case RongIMClient.MessageType.UnknownMessage:
					// do something...
					break;
				default:
					// 自定义消息
					// do something...
			}
		}
	});

	mui.ready(function() {

		mui.plusReady(function() {

			var web = plus.webview.currentWebview();
			var id = web.cid;
			var user = JSON.parse(plus.storage.getItem('user'));
			var myid = user.id;
			var myname = user.nickname;
			vm.id = id;
			vm.othername = web.othername;
			vm.otheravatar = web.otheravatar;

			function Chat() {
				this.init = function() {
					getToken();
					pushMessage();
					bind();
				}

				function bind() {
					//				document.querySelector('.mui-scroll-wrapper').addEventListener('scroll', function(e) {
					//					if(e.detail.y > 40 && vm.canScroll) {
					//						getMessage();
					//					}
					//				})

					//				document.querySelector('.mui-scroll-wrapper').addEventListener('scroll', function(event) {
					//					console.log(event.scrollY)
					//				})
					$('.mui-scroll-wrapper').on('scroll', function(e) {
						if($('.mui-scroll-wrapper').scrollTop() < -40 && vm.canScroll) {
							getMessage();
						}
					})

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
								//														alert(JSON.stringify(data.data))

								vm.mytoken = data.data.result.token;
								vm.myname = data.data.account.nickname;
								vm.myavatar = data.data.account.photo ? data.data.account.photo : 'static/img/avatar.png';
								//							alert(vm.mytoken)
								connect();
							} else {
								if(data.returnCode == 401) {
									//								unLoginComfirm();
									vm.islogin = false;
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

				function pushMessage() {
					mui('body').on('tap', '.circle-comment-buttom', function(e) {

						if(!vm.content) {
							mui.toast('聊天内容不能为空');
							return;
						}
						// 定义消息类型,文字消息使用 RongIMLib.TextMessage
						var msg = new RongIMLib.TextMessage({
							content: vm.content,
							extra: "附加信息"
						});
						//或者使用RongIMLib.TextMessage.obtain 方法.具体使用请参见文档
						//var msg = RongIMLib.TextMessage.obtain("hello");
						var conversationtype = RongIMLib.ConversationType.PRIVATE; // 私聊
						var targetId = id; // 目标 Id
						RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
							// 发送消息成功
							onSuccess: function(message) {
								//message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
								console.log("Send successfully");
								//								alert(JSON.stringify(message))
								var mes = {};
								mes.user = 'me';
								mes.content = message.content.content;
								mes.time = moment(message.sentTime).format('MM-DD HH:mm');
								//								plus.storage.setItem(id) = mes.content;
								vm.list.push(mes);

								mui.ajax({
									url: URL.path + '/chat/chat_tui',
									type: 'post',
									data: {
										token: plus.storage.getItem('token'),
										uid: id,
										cid: myid,
										title: mes.content,
										name: myname
									},
									success: function(data) {
										if(data.returnCode == 200) {
											mui.toast('发送成功')
										}
									}
								})

								vm.$nextTick(function() {
									var scrollHeight = $('.mui-scroll').height() - $(".mui-scroll-wrapper").height();
									$('.mui-scroll-wrapper').animate({
										scrollTop: scrollHeight + 'px'
									}, 500);
								})
								vm.content = '';
								document.querySelector(".chat-footer-input").blur();
							},
							onError: function(errorCode, message) {
								var info = '';
								switch(errorCode) {
									case RongIMLib.ErrorCode.TIMEOUT:
										info = '超时';
										break;
									case RongIMLib.ErrorCode.UNKNOWN_ERROR:
										info = '未知错误';
										break;
									case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
										info = '在黑名单中，无法向对方发送消息';
										break;
									case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
										info = '不在讨论组中';
										break;
									case RongIMLib.ErrorCode.NOT_IN_GROUP:
										info = '不在群组中';
										break;
									case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
										info = '不在聊天室中';
										break;
									default:
										info = '';
										break;
								}
								console.log('发送失败:' + info);
							}
						});
						
					})
				}

				function connect() {
					RongIMClient.connect(vm.mytoken, {
						onSuccess: function(userId) {
							console.log("Login successfully." + userId);
							getMessage();
						},
						onTokenIncorrect: function() {
							console.log('token无效');
						},
						onError: function(errorCode) {
							var info = '';
							switch(errorCode) {
								case RongIMLib.ErrorCode.TIMEOUT:
									info = '超时';
									break;
								case RongIMLib.ErrorCode.UNKNOWN_ERROR:
									info = '未知错误';
									break;
								case RongIMLib.ErrorCode.UNACCEPTABLE_PaROTOCOL_VERSION:
									info = '不可接受的协议版本';
									break;
								case RongIMLib.ErrorCode.IDENTIFIER_REJECTED:
									info = 'appkey不正确';
									break;
								case RongIMLib.ErrorCode.SERVER_UNAVAILABLE:
									info = '服务器不可用';
									break;
							}
							console.log(errorCode);
						}
					});
				}

				function getMessage() {
					vm.canScroll = false;
					RongIMClient.getInstance().getHistoryMessages(RongIMLib.ConversationType.PRIVATE, id, null, 10, {
						onSuccess: function(list, hasMsg) {
							// hasMsg为boolean值，如果为true则表示还有剩余历史消息可拉取，为false的话表示没有剩余历史消息可供拉取。
							// list 为拉取到的历史消息列表

							var newList = [];
							for(var i in list) {
								var json = {};
								if(list[i].targetId) {
									json.user = 'other'
								} else {
									json.user = 'me'
								}
								json.content = list[i].content.content;
								json.time = moment(list[i].sentTime).format('MM-DD HH:mm');
								newList.push(json);
							}
							vm.list = newList.concat(vm.list);
							vm.$nextTick(function() {
								if(vm.firstLoad) {
									//								mui('.mui-scroll-wrapper').scroll({
									//									deceleration: 0.0005, //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
									//									bounce: true
									//								});
									//								mui('.mui-scroll-wrapper').scroll().scrollToBottom(0);
									var scrollHeight = $('.mui-scroll').height() - $(".mui-scroll-wrapper").height();
									$('.mui-scroll-wrapper').scrollTop(scrollHeight);
									vm.firstLoad = false;
								}

								//							var scroll = document.querySelector(".mui-scroll").clientHeight - document.querySelector(".mui-scroll-wrapper").clientHeight;
								//							mui('.mui-scroll-wrapper').scroll().scrollTo(0, -scroll, 500);
								//							mui('.mui-scroll-wrapper').scroll().scrollTo(0, mui('.mui-scroll-wrapper').scroll().maxScrollY, 500);

								//							e.detail.lastY
							})
							setTimeout(function() {
								if(hasMsg) {
									vm.canScroll = true;
								} else {
									vm.canScroll = false;
								}
							}, 1000)

						},
						onError: function(error) {
							// APP未开启消息漫游或处理异常
							// throw new ERROR ......
						}
					});
				}
			}

			var chat = new Chat();
			chat.init();

		})
	})

	function downLodeChat() {
		mui('#down').pullRefresh().endPulldownToRefresh();
	}
}