mui.ready(function() {

	mui.plusReady(function() {

		var page = mui.preload({ //预加载修改页面
			url: 'homepage-personal-set.html',
			id: 'homepage-personal-set.html',
		});
		//跳转修改页面
		BindLink('user', 'homepage-personal-set');
		//跳转修改密码
		BindLink('password', 'modify-password');

		function onAppTrimMemory() {
			// alert("Trim Memory!");
		}

		function Set() {

			this.init = function() {
				signout();
				claer();
				bind();

				isWechatBind();

			}

			function signout() {
				mui('body').on('tap', '#outlogin', function() {
					plus.storage.removeItem('token');
					plus.storage.removeItem('user');
					plus.storage.setItem('deviceToken', '');

					mui.toast('成功退出登录');
					endTime();
					mui.openWindow({
						url: 'signin.html',
						id: 'signin.html',
					})
					var my = plus.webview.getWebviewById('my.html');
					if(my) {
						plus.webview.close(my, 'none', 0)
					}
					var circle = plus.webview.getWebviewById('circle.html');
					if(circle) {
						plus.webview.close(circle, 'none', 0)
					}
					var demand = plus.webview.getWebviewById('demand.html');
					if(demand) {
						plus.webview.close(demand, 'none', 0)
					}
					var home = plus.webview.getWebviewById('home.html');
					if(home) {
						plus.webview.close(home, 'none', 0)
					}
				})
			}

			function claer() {
				mui('body').on('tap', '#clear', function() {
					//					document.addEventListener("trimmemory", onAppTrimMemory, false);
					//					alert(plus.storage.getLength())
					setTimeout(function() {
						mui.toast('清理缓存成功');
					}, 1000)

				})
			}

			function bind() {
				mui('body').on('tap', '#contact', function() {
					mui.openWindow({
						url: 'singepage.html',
						id: 'singepage.html',
						extras: {
							cid: '2'
						}
					})
				})
				mui('body').on('tap', '#about', function() {
					mui.openWindow({
						url: 'singepage.html',
						id: 'singepage.html',
						extras: {
							cid: '1'
						}
					})
				})
			}

			function wechat() {
				var auths = null;
				if(!plus.storage.getItem('token')) {
					return;
				}
				mui('body').on('tap', '#wechat', function() {
					plus.oauth.getServices(function(services) {
						auths = services;
						var s = null;

 						for(var i = 0;i<auths.length;i++){
							if(auths[i].id="weixin"){
								s = auths[0]; 
							}
						}

//						if(!s.authResult) {
							s.login(function(e) {
								
								s.getUserInfo(function(e) {
//									console.log(s.userInfo)
//									alert("获取用户信息成功：" + JSON.stringify(s.userInfo));
									putWechatInfo(s.userInfo); //提交个人信息
								}, function(e) {
									mui.alert("获取用户信息失败：" + e.message + " - " + e.code);
								});
							}, function(e) {
								mui.alert("登录认证失败！");
							});
//						} else {
//							mui.alert("已经登录认证！");
//						}
					}, function(e) {
						mui.alert("获取分享服务列表失败：" + e.message + " - " + e.code);
					});
				})
			}

			function isWechatBind() {
				mui.ajax({
					url: URL.path + '/account/account_bind',
					type: 'post',
					data: {
						token: plus.storage.getItem('token')
					},
					success: function(data) {
						if(data.returnCode == 200) {
							if(data.data.is_bind == 0) {
								wechat();
								document.querySelector(".set-wechat").innerHTML = '未绑定';
							} else {
								document.querySelector(".set-wechat").innerHTML = '已绑定';
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
			}

			function putWechatInfo(json) {
				mui.ajax({
					url: URL.path + '/account/bind_weixin',
					type: 'post',
					data: { 
						token: plus.storage.getItem('token'),
						openid: json.openid,
						unionid:json.unionid,
						nickname: json.nickname,
						sex: json.sex,
						headimgurl: json.headimgurl
					},
					success: function(data) {
						if(data.returnCode == 200) {
//														alert(JSON.stringify(data))
							mui.toast("登录认证成功！");
							document.querySelector(".set-wechat").innerHTML = '已绑定';
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

		var set = new Set();
		set.init();
	})

})