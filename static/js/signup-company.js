mui.ready(function() {

	mui.plusReady(function() {

		var vm = new Vue({
			el: '#main',
			data: {
				name: '',
				job: '',
				company: '',
				companyfull: '',
//				phone: '',
//				code: '',
				password: '',
				repw: '',
				agree: true,
				time: 60,
				isget: true,
//				inviter: '',
				ctype: '',
				companyBoxShow: false,
				companyList: [],
			},
			methods: {
				companySearch: function() {
					var _this = this;
					if(this.ctype == 1) {
						if(!this.company) {
							this.companyBoxShow = false;
						}
//						console.log(_this.company)
						mui.ajax({
							url: URL.path + '/other/company',
							type: 'post',
							data: {
								kw: _this.company,
								terminalNo: '3'
							},
							success: function(data) {
								
								if(data.returnCode == 200) {
									
									//									alert(JSON.stringify(data.data))
									if(data.data.length != 0) {
										_this.companyBoxShow = true;
										_this.companyfull = '';
									} else {
										_this.companyBoxShow = false;
									}
									_this.companyList = data.data;
									document.querySelector(".companyFull").readOnly = false;
								}
							},
							error: function(xhr, type) {
								console.log(type)
							}
						})
					}
				},
				selectCompany: function(params) {
					this.companyfull = this.companyList[params.index].name;
					this.company = this.companyList[params.index].short;
					this.companyBoxShow = false;
					//					this.stock = this.companyList[params.index].stock_code;
					document.querySelector(".companyFull").readOnly = true;
				}
			}
		})
		var web = plus.webview.currentWebview();
		vm.ctype = web.ctype;
		var phone = /^1[34578]\d{9}$/;
		var password = /^[a-zA-Z0-9]{6,12}$/;
		//注册提交
		document.getElementById("sub").addEventListener('tap', function() {

			if(!vm.name) {
				mui.toast('请输入姓名');
				return;
			}
			if(!vm.job) {
				mui.toast('请输入职位');
				return;
			}
			if(!vm.company) {
				mui.toast('请输入公司简称');
				return;
			}
			if(!vm.companyfull) {
				mui.toast('请输入公司全称');
				return;
			}
			if(!vm.phone) {
				mui.toast('请输入手机号');
				return;
			}
			if(!phone.test(vm.phone)) {
				mui.toast('手机号格式有误');
				return;
			}
			if(!vm.code) {
				mui.toast('请输入短信验证码');
				return;
			}
			if(!vm.password) {
				mui.toast('请输入密码');
				return;
			}
			if(!password.test(vm.password)) {
				mui.toast('密码格式错误');
				return;
			}
			if(vm.password !== vm.repw) {
				mui.toast('两次密码不一致');
				return;
			}
			if(!vm.agree) {
				mui.toast('请阅读并同意服务协议');
				return;
			}

			mui.ajax({
				url: URL.path + '/regist/go',
				type: 'post',
				data: {
					phone: vm.phone,
					card: web.imgid,
					ctype: web.ctype,
					smscode: vm.code,
					uname: vm.name,
					position: vm.job,
					repwd: vm.repw,
					company_name: vm.companyfull,
					short: vm.company,
					pwd: vm.password,
					inviter: vm.inviter,
					photo:web.avatarid
				},
				success: function(data) {

					if(data.returnCode == '200') {
						mui.toast('注册成功');
						var user = JSON.stringify(data.data);
						var token = data.data.token;
						plus.storage.setItem('user', user);
						plus.storage.setItem('token', token);
//						var myweb = plus.webview.getWebviewById('my.html');
//						if(myweb) {
//							myweb.reload(true); // 刷新个人中心页面
//						}
//						var cicrleweb = plus.webview.getWebviewById('circle.html');
//						if(cicrleweb) {
//							cicrleweb.reload(true); // 刷新我的圈子页面
//						}
//						var signupweb = plus.webview.getWebviewById('signup.html');
//						if(signupweb) {
//							plus.webview.close(signupweb) // 关闭注册第一步
//						}
						mui.openWindow({
							url: 'signup-fix.html',
							extras: {
								ctype: web.ctype
							}
						})

					} else {
						mui.toast(data.msg)
					}
				},
				error: function(xhr, type, errorThrown) {
					console.log(type)
					//异常处理；
				}
			})

		})

		//获取验证码
		document.getElementById("getcode").addEventListener('tap', function() {
			if(!vm.phone) {
				mui.toast('请输入手机号码');
				return;
			}
			if(!vm.isget) {
				return;
			}
			var _this = this;
			//var ajaxurl = URL.path + '/regist/smsCode';
			mui.ajax({
				type: "post",
				url: URL.path + '/regist/smsCode',
				data: {
					phone: vm.phone
				},
				success: function(data) {
					// alert(JSON.stringify(data));
					if(data.returnCode == 200) {
						vm.isget = false;
						var countDown = setInterval(function() {
							vm.time--;
							if(vm.time == 0) {
								vm.isget = true;
								vm.time = 60;
								_this.innerHTML = '获取验证码';								
								clearInterval(countDown);
							} else {
								_this.innerHTML = vm.time + 's再次获得';
							}
						}, 1000)
					}else{
						mui.toast(data.msg)
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				}
			})
		})

		mui('body').on('tap', '.agreement', function() {
			mui.openWindow({
				url: 'singepage.html',
				id: 'singepage.html',
				extras: {
					cid: 3
				}
			})
		})
	})

})