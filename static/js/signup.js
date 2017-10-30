mui.ready(function() {
	var vm = new Vue({
		el: '#main',
		data: {
			choose: '0',
			identity: [],
			img: '',
			imgid: '',
			ctype: '',
			avatar: '',
			avatarid: '',
			time: 60,
			phone:'',
			inviter:'',
			code: '',
			password:'',
			repw:'',
			isget: true,
			agree: true,
		},
		methods: {
			click: function(params) {
				this.choose = params.index;
				this.ctype = this.identity[params.index].id;
			}
		}
	})

	mui.plusReady(function() {
		//alert(1) 

		function upImg(othis,type) {
			//var container = mui(".form-img > p");
			var uploader = new plupload.Uploader({
				runtimes: 'html5',
				browse_button: othis, // you can pass in id...
				url: URL.path + '/upload/photo',
				file_data_name: 'upload_file',
				multipart_params: {
					terminalNo: '3'
				},
				resize: {
					width: '640'
				},
				filters: {
					//                        max_file_size: '5mb', //最大上传文件大小（格式100b, 10kb, 10mb, 1gb）
					mime_types: [ //允许文件上传类型
						{
							title: "files",
//							extensions: "png,bmp,gif,jpg,jpeg"
							extensions: "png,jpg,jpeg"
						}
					]
				},
				multi_selection: false, //true:ctrl多文件上传, false 单文件上传
				init: {
					PostInit: function() {

					},
					FilesAdded: function(up, files) {
						uploader.start();
					},
					UploadProgress: function(up, file) { //上传中，显示进度条
						var percent = file.percent;
						//						container.progressbar().setProgress(percent);
						//						if(percent == 100) {
						//							container.progressbar().hide();
						//						}
					},
					FileUploaded: function(up, file, info) { //文件上传成功的时候触发 
						var res = JSON.parse(info.response);
//						alert(info.response)
						if(res.returnCode == '200') {
							//console.log(res);
							//vm.img.push(res.data); 
							if(type == 1 && !vm.img){
								vm.img = res.data.url;
								vm.imgid = res.data.id;
							}
							if(type == 2 && !vm.avatar){
								vm.avatar = res.data.url;
								vm.avatarid = res.data.id;
							}
						} else if(res.returnCode == '401') {
							unLoginComfirm();
						}
					},
					Error: function(up, err) { //上传出错的时候触发
//						alert(err)
						alert('上传失败，请检查图片格式或稍后重试')
					}
				}
			});
			//在实例对象上调用init()方法进行初始化
			uploader.init();
		};
		upImg(document.getElementById("upload"),1);
		upImg(document.getElementById("upload2"),2);
		
		
//		mui("#main").on('change', '#upload', function(e) { //上传图片
//			var form = document.getElementById("formData")
//			var myForm = new FormData(form);
//			$.ajax({
//				type: "post",
//				url: URL.path + '/upload/photo',
//				data: myForm,
//				async: false,
//				cache: false,
//				contentType: false,
//				processData: false,
//				success: function(data) {
//					//					alert(JSON.stringify(data))
//					vm.img = data.data.url;
//					vm.imgid = data.data.id;
//				},
//				error: function(xhr, type, errorThrown) {
//					console.log(type);
//				}
//			});
//		})
//
//		mui("#main").on('change', '#upload2', function(e) { //上传图片
//			var form = document.getElementById("formData2")
//			var myForm = new FormData(form);
//			$.ajax({
//				type: "post",
//				url: URL.path + '/upload/photo',
//				data: myForm,
//				async: false,
//				cache: false,
//				contentType: false,
//				processData: false,
//				success: function(data) {
//					vm.avatar = data.data.url;
//					vm.avatarid = data.data.id;
//				},
//				error: function(xhr, type, errorThrown) {
//					alert(type);
//				}
//			});
//		})

		mui.ajax({ //身份列表
			url: URL.path + '/other/userType',
			type: 'post',
			data: {
				terminalNo: '3'
			},
			success: function(data) {
				if(data.returnCode == '200') {
					//alert(JSON.stringify(data))
					vm.identity = data.data;
					vm.ctype = vm.identity[0].id;
					/**
					 * id:1 企业
					 * id:2 投资机构
					 * id:3 个人投资人
					 * id:4 咨询机构
					 * id：5 券商研究员
					 * id:6 新三板做市商
					 **/
				}
			},
			error: function(xhr, type, errorThrown) {
				//异常处理；
				console.log(type);
			}
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

		//绑定删除图片事件
		mui('#main').on('tap', '#delete', function() {
			vm.img = '';
			vm.imgid = '';
		})
		mui('#main').on('tap', '#delete2', function() {
			vm.avatar = '';
			vm.avatarid = '';
		})
		//绑定跳转登录事件
		document.getElementById("return").addEventListener('tap', function() {
			mui.openWindow({
				url: 'signin.html',
				id: 'signin.html',
				styles: {
					top: '0px',
					bottom: '0px'
				}

			})
		})
		//下一步
		var phone = /^1[34578]\d{9}$/;
		var password = /^[a-zA-Z0-9]{6,12}$/;
		document.getElementById("sub").addEventListener('tap', function() {
//			if(!vm.name) {
//				mui.toast('请输入姓名');
//				return;
//			}
//			if(!vm.job) {
//				mui.toast('请输入职位');
//				return;
//			}
//			if(!vm.company) {
//				mui.toast('请输入公司简称');
//				return;
//			}
//			if(!vm.companyfull) {
//				mui.toast('请输入公司全称');
//				return;
//			}
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
//			if(!vm.agree) {
//				mui.toast('请阅读并同意服务协议');
//				return;
//			}
			if(!vm.img) {
				mui.toast('请上传名片');
				return;
			}
			if(!vm.avatar) {
				mui.toast('请上传头像');
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
					card: vm.imgid,
					ctype: vm.ctype,
					smscode: vm.code,
					uname: vm.name,
//					position: vm.job,
					repwd: vm.repw,
//					company_name: vm.companyfull,
//					short: vm.company,
					pwd: vm.password,
					inviter: vm.inviter,
					photo:vm.avatarid
				},
				success: function(data) {
					if(data.returnCode == '200') {
						mui.toast('您已注册成功，我们将会在24小时之内通过审核');
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
								ctype: vm.ctype
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
			
			
			
//			var nextUrl = 'signup-company.html';
//			if(vm.ctype == 3) {
//				nextUrl = 'signup-personal.html';
//			}
//			mui.openWindow({
//				url: nextUrl,
//				id: nextUrl,
//				extras: {
//					imgid: vm.imgid,
//					ctype: vm.ctype,
//					avatarid: vm.avatarid
//				}
//			})
		})
		
		mui('body').on('tap', '.agreement', function() {
//				e.stopPropagation();
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