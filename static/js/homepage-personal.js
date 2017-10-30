var vm = new Vue({
	el: '#main',
	data: {
		item: {},
		ctype: '',
		myself: false,
		info: {},
		company: {},
		avatar: '',
		islogin: false,
		enterprises: []
	},
	computed: {
		identity: function() {
			return getId(this.ctype);
		},
		isboard: function() {
			if(this.item.board == 0) {
				return '否';
			} else {
				return '是';
			}
		}
	}
})

mui.ready(function() {

	mui.plusReady(function() {
			var web = plus.webview.currentWebview()
			var rid = web.rid;
			var user = JSON.parse(plus.storage.getItem('user'));
//			console.log('token',plus.storage.getItem('token'));
			if(plus.storage.getItem('token')) {
				vm.islogin = true;
			}

			function Personal() {

				var old_back = mui.back;
				mui.back = function() {
					var my = plus.webview.getWebviewById('my.html');
					mui.fire(my, 'reload');
					old_back();
				}

				this.init = function() {
					getPersonal();
					set();
					report();
					link();
					Concern();
				}
				window.addEventListener('reload', function() {
					getPersonal();
				})

				function getPersonal() {
					var datas = {}
					if(user) {
						if(rid == user.id) {
							datas.token = plus.storage.getItem('token');
							vm.myself = true;
						} else {
							if(plus.storage.getItem('token')) {
								datas.token = plus.storage.getItem('token');
							}
							datas.uid = rid;
						}
					} else {
						datas.uid = rid;
					}
					datas.terminalNo = '3';
					console.log(datas,'datas')
					mui.ajax({
						url: URL.path + '/account/info',
						type: 'post',
						data: datas,
//																dataType:'string',
						success: function(data) {
//							console							alert(JSON.stringify(data))
							console.log(data,'data')
							if(data.returnCode == 200) {
								vm.item = data.data;
								vm.info = data.data.info;
								console.log(data.data.info.profile,'222222222');
								vm.ctype = data.data.ctype;
								vm.company = data.data.company;
								vm.avatar = data.data.photo ? data.data.photo.url : 'static/img/avatar.png';
								//							alert(JSON.stringify(data.data.info.enterprises));
								vm.enterprises = [];
								for(var i in data.data.info.enterprises) {
									vm.enterprises.push(data.data.info.enterprises[i])
									//								console.log(data.data.info.enterprises[i])
								}

								//							alert(JSON.stringify(data.data.photo))
								//							alert(data.data.ctype)
//																													alert(JSON.stringify(data.data))
								mui('.mui-scroll-wrapper').scroll({
									deceleration: 0.0005
								});
								web.show('slide-in-right', 300);
								plus.nativeUI.closeWaiting();
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

				function set() {
					mui('body').on('tap', '.my-save', function() {
							if(!plus.storage.getItem('token')) {
								mui.toast('您还未登录');
								return;
							}
							mui.ajax({
									url: URL.path + '/other/power',
									type: 'post',
									data: {
										token: plus.storage.getItem('token'),
										terminalNo: '3'
									},
									success: function(data) {
										//							alert(JSON.stringify(data))
										if(data.returnCode == 200 || data.returnCode == '7000005') {
											GO('homepage-personal-set')
										} else {
											mui.toast(data.msg)
										}
									}
								})
							//})

					})
			}

			function report() {
				mui('body').on('tap', '.hompage-report', function() {
					mui.openWindow({
						url: 'report.html',
						id: 'report.html',
						extras: {
							rid: rid
						}
					})
				})
			}

			function link() {
				mui('body').on('tap', '.link-company', function() {
					if(!vm.islogin) {
						mui.toast('您还未登录');
						return;
					}
					var id = this.getAttribute('data-id');
					mui.openWindow({
						url: 'homepage-company.html',
						id: 'homepage-company.html',
						extras: {
							cid: id,
							uid: rid,
							name: vm.company.com_name
						}
					})
				})
				mui('body').on('tap', '.gochat', function() {
					var id = this.getAttribute('data-id');
					Power(function() {
						mui.openWindow({
							url: 'chat-main.html',
							id: 'chat-main.html',
							extras: {
								cid: rid
							}
						})
					})
				})
				mui('body').on('tap', '.follow', function() {
					mui.openWindow({
						url: 'my-follow.html',
						id: 'my-follow.html',
						extras: {
							uid: rid
						},
						createNew: true
					})
				})
				mui('body').on('tap', '.fans', function() {
					mui.openWindow({
						url: 'my-fans.html',
						id: 'my-fans.html',
						extras: {
							uid: rid
						},
						createNew: true
					})
				})
			}

			function Concern() {
				mui('body').on('tap', '.unfollowed', function(e) {
					e.stopPropagation()
					if(!vm.islogin) {
						mui.toast('您还未登录');
						return;
					}
					var id = this.getAttribute('data-id');
					concernAjax('add', id, this);
				});
				mui('body').on('tap', '.followed', function(e) {
					e.stopPropagation()
					if(!vm.islogin) {
						mui.toast('您还未登录');
						return;
					}
					var id = this.getAttribute('data-id');
					concernAjax('remove', id, this);
				})
			}

			function concernAjax(type, id, obj) {
				mui.ajax({
					url: URL.path + '/concern/cupdate',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						rid: id
					},
					success: function(data) {
						if(data.returnCode == 200) {
							if(type == 'add') {
								obj.classList.add('followed');
								obj.classList.remove('unfollowed');
								obj.innerHTML = '已关注';
							} else {
								obj.classList.remove('followed');
								obj.classList.add('unfollowed');
								obj.innerHTML = '+关注';
							}
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg)
							}
						}
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						console.log(type);
					}
				})
			}
		}
		var personal = new Personal(); personal.init();

	})
})