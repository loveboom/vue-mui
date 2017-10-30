var ly = new Vue({
	el:'#app_1',
	data:{
		ly_content:'',
	}
})
window.addEventListener('reload', function() {
	location.reload();
});

addNav(2);

mui.init();

mui.ready(function() {
	
	var _this = this;
	var timeArr = [];

	var vm_2 = new Vue({
		el: '#app_2',
		data: {
			items: [],
			naveState: 1,
			islogin: 1,
			status:false
		},
		updated: function() {
			if(this.items.length) {
				$('#app_2 .not-cont').removeClass('on');
			} else {
				$('#app_2 .not-cont').addClass('on');
			}

			//判断有没有内容
			if(vm_2.items.length) {
				$('#item2mobile .mui-pull-bottom-tips').fadeIn();
				//							$('#item2mobile .circle-withoutlogin-box').fadeIn();
				if($('#naveMarket>div.on').attr('data-val') == 2) {
					//								$('#item2mobile .circle-withoutlogin-box').fadeIn();
				}
			} else {
				$('#item2mobile .mui-pull-bottom-tips').fadeOut();
				//							$('#item2mobile .circle-withoutlogin-box').fadeOut();
				if($('#naveMarket>div.on').attr('data-val') == 2) {

				}
			}
		}
	});

	mui.plusReady(function() {

	
	

		function isActive() {
			if(plus.storage.getItem('token')) {
				var datas = {
					terminalNo: '3',
					token: plus.storage.getItem('token')
				}
				if(plus.storage.getItem('phonesContacts')) {
					datas.phones = plus.storage.getItem('phonesContacts');
				}
				mui.ajax({
					url: URL.path + '/account/new_friend_fans',
					type: 'post',
					data: datas,
					success: function(data) {
						if(data.returnCode == 200) {
							if(data.data.all_nums != 0) {
								addNav(2, true);
							} else {
								addNav(2);
							}
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg)
							}
						}
					}
				})
			} else {
				addNav(2);
			}
		}
		isActive();
		
		var token = '';
		if(plus.storage.getItem('token')){
			token = plus.storage.getItem('token');
		}else{
			token = ''
		}
		function getPlayList(){
			mui.ajax({
				url:URL.path + '/video/video_list',
				type:'post',
				dataType:'json',
				data:{
					token:token
				},
				success:function(data){
					ly.ly_content = data.data;
				},
				error:function(ms){
//					console.log(ms.msg);
				}
			});
			
		}
		getPlayList();

		
		
		//立即报名
		mui('body').on('tap','#baoming',function(e){
			if(token==''){
				mui.toast('您还未登录，请先登录')
			}else{
			var id = this.getAttribute('data-id');
			var cid = this.getAttribute('data-cid');
			mui.ajax({
				url:URL.path + '/needs/claim_needs',
				type:'post',
				dataType:'json',
				data:{
					token:token,
					need_id:id,
					cid:cid
				},
				success:function(fa){
					mui.toast(fa.msg);
					$('#baoming').html('已报名');
					$('#baoming').css('background-color','#9e9e9e');
				},
				error:function(sm){
					mui.toast(sm.msg)
				}
			})
			
			e.stopPropagation();
			}
		})


		//市场需求
		var app_2 = mui('#app_2').pullToRefresh({
			down: {
				callback: function() {

					sign_2.page = 1;

					//								_this.clearTime();
					_this.getNeed(function(res) {
						vm_2.items = res;
						app_2.endPullDownToRefresh();
//									location.reload();
					});
				}
			},
			up: {
				callback: function() {
					sign_2.page ++;
					//								_this.clearTime();
					_this.getNeed(function(res) {
						if(res.length) {
							for(var i = 0; i < res.length; i++) {
								vm_2.items.push(res[i]);
							}
							app_2.endPullUpToRefresh();
						} else {
							app_2.endPullUpToRefresh(true);
						}
					});
				},
//							contentrefresh: "正在加载...",
//							contentnomore: '没有更多数据了',
			}
		});
		mui('body').on('tap', '#naveMarket>div', function() {
			var val = $(this).attr('data-val');
			sign_2.cate = val;
			sign_2.page = 1;
			sign_2.ids = '';
			sign_2.cate_id = '';

			$('#app_2').css('transform', '');
			$('.float-screen-list>li').removeClass('on');
			$(this).addClass('on').siblings().removeClass('on');
			
			_this.getNeed(function(res) {
				vm_2.items = res;

				if(val == 2 && !vm_2.items.length) {
					vm_2.islogin = 1;
				}
				if(val == 2) {
					if(vm_2.items.length) {
						$('#item2mobile .circle-withoutlogin-box').fadeOut();
					} else {
						$('#item2mobile .circle-withoutlogin-box').fadeIn();
					}
				}
			})

		});

		var sign_1 = {
			token: plus.storage.getItem('token'),
			cate: 0,
			page: 1
		};
		var sign_2 = {
			token: plus.storage.getItem('token'),
			cate_id: '',
			cate: 2,
			page: 1
		};
		//获得市场需求
		_this.getNeed = function(fun) {
			var needUrl = URL.path + '/needs/market_needs'; //市场登陆后，我关注的

			//判断登陆
			if(!plus.storage.getItem('token')) {

				//判断是 所有还是 关注
				if($('#naveMarket>div.on').attr('data-val') == '1') {

				} else {
					needUrl = URL.path2 + '/common/market_needs'; //未登录状态
				}
			}

			app_2.refresh(true);
			mui.ajax({
				url: needUrl,
				type: 'post',
				dataType: 'json',
				data: sign_2,
				success: function(res) {
//					console.log(res,'res');
					if(res.returnCode == '200') {
						for(var i = 0; i < res.data.length; i++) {
							var t = parseInt(res.data[i].countdown) - parseInt(res.data[i].now_time);

							if(t > 0) {
								res.data[i]['time'] = {
									h: Math.floor(t / 60 / 60),
									m: Math.floor(t / 60 % 60),
									s: Math.floor(t % 60)
								};
							} else {
								res.data[i]['time'] = 0;
							}
						}
						$('#item2mobile .mui-pull-loading').fadeIn();
						if(typeof fun === 'function') return fun(res.data);
					} else if(res.returnCode == '401') {
						//																		unLoginComfirm();
						//
						vm_2.islogin = 0;

						if(typeof fun === 'function') return fun([]);
					}
				}
			})
		};
		
		//刷新倒计时
		_this.refresh = function() {
			$('.demand-my-li').each(function() {
				var othis = $(this).find('.demand-my-time');

				if(othis.length) {

					timeArr[timeArr.length] = setInterval(function() {

						var h = parseInt(othis.find('.h').text());
						var m = parseInt(othis.find('.m').text());
						var s = parseInt(othis.find('.s').text());

						s -= 1;

						//s
						if(s == -1) {
							s = 59;
							if(m != 0) m -= 1;
						}
						//m
						if(m == 0) {
							if(h != 0) {
								m = 59;
								h -= 1;
							}
						}

						//整理格式
						if(s < 10) s = '0' + s;
						if(m < 10) m = '0' + m;
						if(h < 10) h = '0' + h;

						othis.find('.h').text(h);
						othis.find('.m').text(m);
						othis.find('.s').text(s);

						//停止计时器
						if(s == 0 && m == 0 && h == 0) {
							clearInterval(timeArr[timeArr.length - 1]);
						}

					}, 1000);

//					console.log(timeArr.length)
				}
			})
		};
		
		_this.clearTime = function() {

			for(var i = 0; i < timeArr.length; i++) {
				clearInterval(timeArr[i]);
			}

		};

		//监听选项卡切换
		$('.float-release-box').addClass('on');
		document.getElementById('slider').addEventListener('slide', function(e) {
			$('.demand-header-choose').slideUp(200);
			switch(e.detail.slideNumber) {
				case 0:
					sign_1.page = 1;
					sign_1.cate = 0;
//								$('.float-release-box').addClass('on');
					$('#sliderSegmentedControl a').removeClass('mui-active');
					$('#aaa').addClass('mui-active');
					$('.float-release-box').removeClass('on');
					break;
				case 1:
					sign_2.page = 1;
					sign_2.cate = 2;
//								$('.float-release-box').removeClass('on');
					$('#sliderSegmentedControl a').removeClass('mui-active');
					$('#bbb').addClass('mui-active');
					$('.float-release-box').addClass('on');
					//								_this.clearTime();
//								_this.getNeed(function(res) {
//									vm_2.items = res;
//								});
					break;
				case 2:
					$('#sliderSegmentedControl a').removeClass('mui-active');
					$('#ccc').addClass('mui-active');
					$('.float-release-box').removeClass('on');
					break;
			}

		});

		//初次加载
//					_this.getDemand(function(res) {
//						vm.items = res;
//					});
		_this.getNeed(function(ress) {
			vm_2.items = ress;
		});
		
		
		//融云
		var ry = new Vue({
			el: '#item3mobile',
			data: {
				token: '',
				list: [],
				chatlist: [],
				islogin: 1,
				msLength:null
			}
		})

		var app_3 = mui('#app_3').pullToRefresh({
			down: {
				callback: ryjs2,
			}
		})
		//下拉刷新时使用
		function ryjs2() {

			mui.ajax({
				url: URL.path + '/account/ryAppKey',
				type: 'post',
				data: {
					token: plus.storage.getItem('token')
				},
				success: function(data) {
					if(data.returnCode = 200) {
						var appkey = data.data.Appkey;
						var ryuser = JSON.parse(plus.storage.getItem('user'));
						if(ryuser) {
							var rymyid = ryuser.id;
						}
						
						app_3.endPullDownToRefresh();
						
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

						_this.getToken = function() { //获取融云token
							mui.ajax({
								url: URL.path + '/account/RygetToken',
								type: 'post',
								data: {
									id: rymyid,
									token: plus.storage.getItem('token'),
								},
								success: function(data) {
									if(data.returnCode == 200) {
										if(data.data.result) {
											ry.token = data.data.result.token;
										}
										_this.connect();

									} else {
										if(data.returnCode == 401) {
											ry.islogin = 0;
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
						_this.getToken();

						_this.chatList = function() { //得到会话列表
							RongIMClient.getInstance().getConversationList({
								onSuccess: function(list) {
									if(list.length > 0) {
										_this.getChatUser(list)
									}

								},
								onError: function(error) {
									// do something...
								}
							}, null);
						}
						_this.connect = function() { //连接融云
							RongIMClient.connect(ry.token, {
								onSuccess: function(userId) {
									console.log("Login successfully." + userId);
									_this.chatList();
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

						_this.getChatUser = function(list) { //服务端请求用户数据

							var usersIdArry = [];
							for(var i in list) {
								usersIdArry.push(list[i].targetId)
							}
							var usersId = usersIdArry.join(',');
							mui.ajax({
								url: URL.path + '/chat/info',
								type: 'post',
								data: {
									terminalNo: '3',
									token: plus.storage.getItem('token'),
									ids: usersId
								},
								success: function(data) {
									if(data.returnCode == 200) {
										for(var i in data.data) {
											var datas = data.data[i];
											datas.photo = datas.photo ? datas.photo : 'static/img/avatar.png';
											datas.lastMessage = list[i].latestMessage ? list[i].latestMessage.content.content : '';
											datas.lasttime = moment(list[i].latestMessage.sentTime).format('MM-DD HH:mm');
											datas.id = list[i].targetId;
										}
										ry.chatlist = data.data;
									} else {
										if(data.returnCode == 401) {
											unLoginComfirm();
										} else {
											mui.toast(data.msg)
										}
									}
								},
								error: function(xhr, type) {
									console.log(type)
								}
							})
						}
					}
				}
			})

		}
		
		
		function ryjs() {

			mui.ajax({
				url: URL.path + '/account/ryAppKey',
				type: 'post',
				data: {
					token: plus.storage.getItem('token')
				},
				success: function(data) {
					if(data.returnCode = 200) {
						var appkey = data.data.Appkey;
						var ryuser = JSON.parse(plus.storage.getItem('user'));
						if(ryuser) {
							var rymyid = ryuser.id;
						}
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

						_this.getToken = function() { //获取融云token
							mui.ajax({
								url: URL.path + '/account/RygetToken',
								type: 'post',
								data: {
									id: rymyid,
									token: plus.storage.getItem('token'),
								},
								success: function(data) {
									if(data.returnCode == 200) {
										//																			alert(JSON.stringify(data.data))
										if(data.data.result) {
											ry.token = data.data.result.token;
										}
										_this.connect();

									} else {
										if(data.returnCode == 401) {
											ry.islogin = 0;
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
						_this.getToken();

						_this.chatList = function() { //得到会话列表
							RongIMClient.getInstance().getConversationList({
								onSuccess: function(list) {
									if(list.length > 0) {
										_this.getChatUser(list)
									}
								},
								onError: function(error) {
									// do something...
								}
							}, null);
						}
						_this.connect = function() { //连接融云
							RongIMClient.connect(ry.token, {
								onSuccess: function(userId) {
									console.log("Login successfully." + userId);
									_this.chatList();
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

						_this.getChatUser = function(list) { //服务端请求用户数据

							var usersIdArry = [];
							for(var i in list) {
								usersIdArry.push(list[i].targetId)
							}
							var usersId = usersIdArry.join(',');
							mui.ajax({
								url: URL.path + '/chat/info',
								type: 'post',
								data: {
									terminalNo: '3',
									token: plus.storage.getItem('token'),
									ids: usersId
								},
								success: function(data) {
									if(data.returnCode == 200) {
										for(var i in data.data) {
											var datas = data.data[i];
											datas.photo = datas.photo ? datas.photo : 'static/img/avatar.png';
											datas.lastMessage = list[i].latestMessage ? list[i].latestMessage.content.content : '';
											datas.lasttime = moment(list[i].latestMessage.sentTime).format('MM-DD HH:mm');
											datas.id = list[i].targetId;
										}
										ry.chatlist = data.data;
									} else {
										if(data.returnCode == 401) {
											unLoginComfirm();
										} else {
											mui.toast(data.msg)
										}
									}
								},
								error: function(xhr, type) {
									console.log(type)
								}
							})
						}
					}
				}
			})

		}
		window.addEventListener('refreshChatList', function() {　
			ryjs()
		})
		window.addEventListener('showShare', function() {
			ryjs()
		})

		ryjs() //聊天js

		mui('body').on('tap', '.demand-chat-li', function() {
			var id = this.getAttribute('data-id');
			Power(function() {
				mui.openWindow({
					url: 'chat-main.html',
					id: 'chat-main.html',
					extras: {
						cid: id
					}
				})
			})

		})
		
		//点击进入直播详情页
		mui('body').on('tap', '.ly_list', function() {
			if(!(plus.storage.getItem('token'))){
				mui.toast('您还未登录，请先登录')
			}else{
			var id = this.getAttribute('data-id');
			var eee = this.getAttribute('data-cid');
			var type = this.getAttribute('data-typeA');
			var sn = this.getAttribute('data-sn');
			var type_id = this.getAttribute('data-type_id');
			var user = JSON.parse(plus.storage.getItem('user'));
			console.log(user,'user');
			if(type==0){
				mui.alert('直播尚未开始');
			}else if(type==1){
					mui.ajax({
						url:URL.path + '/video/set_onlinenumber',
						type:'post',
						data:{
							type:1,
							id:id
						},
						success:function(data){

						}
					})
					mui.ajax({
						url:URL.path + '/needs/claim_list',
						type:'post',
						dataType:'json',
						data:{
							token:plus.storage.getItem('token'),
							need_id:id,
							cid:eee
						},
						success:function(aaa){
//							vm.bmList = aaa.data;

							var length = aaa.data.length;
							for(var i=0;i<length;i++){
								if(aaa.data[i].uname==user.nickname){
									vm_2.status = true;
									break;
								}
							}
							if(vm_2.status==false){
								mui.toast('观看直播请提前报名');
							}else{
								Power(function() {
									mui.openWindow({
										url: 'luyan-details.html',
										id: 'luyan-details.html',
										extras: {
											uid:id,
											dd:eee,
											sn:sn,
											type:type,
											type_id:type_id
										}
									})
								})
							}
						}
					})						
			}else if(type==2){
				Power(function() {
					mui.openWindow({
						url: 'luyan-details.html',
						id: 'luyan-details.html',
						extras: {
							uid:id,
							dd:eee,
							sn:sn,
							type:type,
							type_id:type_id
						}
					})
				})
			}else if(type==3){
				mui.toast('抱歉，此直播视频尚未开放')
			}
			}
		})
		
		//进入公司或个人主页
		mui('body').on('tap', '#company', function(e) {
			e.stopPropagation();
			if(!plus.storage.getItem('token')) {
				//mui.toast('您还未登录'); 
				GO('signin')
				return;
			}
			var type_id = this.getAttribute('data-type_id');
			mui.openWindow({
				url: 'homepage-company.html',
				id: 'homepage-company.html',
				extras: {
					cid: type_id
				}
			})						
		})
		
		mui('body').on('tap', '#person', function(e) {
			e.stopPropagation();
			if(!plus.storage.getItem('token')) {
				//mui.toast('您还未登录'); 
				GO('signin')
				return;
			}
			var type_id = this.getAttribute('data-type_id');
//			console.log('type_id',type_id);
			mui.openWindow({
				url: 'homepage-personal.html',
				id: 'homepage-personal.html',
				extras: {
					rid: type_id
				}
			})						
		})
		
		mui('body').on('tap', '.demand-chat-kf', function() {
			//						var id = this.getAttribute('data-id');
			mui.openWindow({
				url: 'chat-kf.html',
				id: 'chat-kf.html',
			})
		})

		mui('body').on('tap', '.demand-header-choose>div', function() {
			$(this).addClass('on').siblings().removeClass('on');
		});

		mui('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true //是否显示滚动条
		});


		//跳转内页 市场
		mui('#item2mobile').on('tap', '.demand-my-li', function() {
			var id = $(this).attr('data-id');
			var isMe = parseInt($(this).attr('data-isMe'));
			var isClaim = parseInt($(this).attr('data-isClaim'));

			if(!plus.storage.getItem('token')) {
				mui.confirm('您还未登录', '确认', ['去登录', '取消'], function(res) {
					if(res.index == 0) {
						BackLogin()
					}
				})
			} else {
				if(isMe == 1 || isClaim == 1) {
					GO('demand-info', {
						sign: id
					}, true)
				} else {
					GO('demand-infos', {
						sign: id
					}, true)
				}
			}
		});

		//显示下拉菜单
		mui('body').on('tap', '.mui-control-item', function() {
			if($(this).hasClass('mui-active')) {
				$(this).find('.demand-header-choose').slideToggle(200);
			}
		});

		//发布
		mui('body').on('tap', '.float-release-box,.not-cont-btn', function() {
			Power(function() {
				GO('demand-release', {}, true)
			})

		});

		//打开筛选
		mui('body').on('tap', '.choose', function() {
			if(plus.storage.getItem('token')) {
				$('.float-screen-box').addClass('on');
				mui.ajax({
					url: URL.path + '/needs/get_category',
					type: 'post',
					dataType: 'json',
					data: {
						token: plus.storage.getItem('token')
					},
					success: function(res) {
						if(res.returnCode == '200') {

							var html = "<li data-id='30'>所有悬赏</li>";
							for(var i = 0; i < res.data.length; i++) {
								html += "<li data-id='" + res.data[i].id + "'>" + res.data[i].title + "</li>";
							}
							$('.float-screen-list').html(html);
						} else if(res.returnCode == '401') {
							unLoginComfirm();
						}
					}
				});
			} else {
				mui.toast('您还未登录');
			}

		});

		//关闭筛选
		mui('body').on('tap', '.float-screen-close', function() {
			$('.float-screen-box').removeClass('on');
		});

		//确认筛选
		mui('body').on('tap', '.float-screen-btn', function() {
			var ids = '',
				idi = 0;

			$('.float-screen-box').removeClass('on');
			$('.float-screen-list>li').each(function(i) {
				var id = $(this).attr('data-id');

				if($(this).hasClass('on')) {
					if(idi == 0) {
						ids = id;
					} else {
						ids += ',' + id;
					}
					idi++;
				}
			});

			sign_2.page = 1;
			sign_2.cate_id = ids;

			//						_this.clearTime();
			_this.getNeed(function(res) {
				vm_2.items = res;
			});
		});

		

		//筛选选择
		mui('body').on('tap', '.float-screen-list>li', function() {
			if($(this).hasClass('on')) {
				$(this).removeClass('on');
			} else {
				$(this).addClass('on');
			}
		});

		mui('body').on('tap', '#nav_home', function() {
			GO('home', {}, true)
		});
		mui('body').on('tap', '#nav_circle', function() {
			GO('circle', {}, true)
		});
		mui('body').on('tap', '#nav_demand', function() {
			GO('demand', {}, true)
		});
		mui('body').on('tap', '#nav_my', function() {
			GO('my', {}, true)
		});

		mui('body').on('tap', '.signin', function() {
			GO('signin')
		})
	})

})
