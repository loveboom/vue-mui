var vm = new Vue({
	el: '#main',
	data: {
		list: [],
		page: '1',
		limit: '15',
		islogin: false,
		type: '1',
		myid: '',
		banner: [],
		banlength: '',
		phones: ''
	}
})
addNav(0);

mui.init({
	//	pullRefresh: {
	//		container: '#pullrefresh',
	//		down: {
	//			callback: down
	//		},
	//		up: {
	//			contentrefresh: '正在加载...',
	//			callback: up
	//		}
	//	},

});
mui('#pullrefresh').pullToRefresh({
	up: {
		callback: up,
		contentrefresh: "正在加载...",
		contentnomore: '没有更多数据了',
	},
	down: {
		callback: down,
	}
})
var deceleration = mui.os.ios ? 0.003 : 0.0009;
mui('.mui-scroll-wrapper').scroll({
	bounce: false,
	indicators: true, //是否显示滚动条
	deceleration: deceleration
});

function down() {
	vm.page = 1;
	var datas = {
		terminalNo: '3',
		page: vm.page,
		limit: vm.limit,
		ctype: vm.type,
	}
	if(plus.storage.getItem('token')) {
		datas.token = plus.storage.getItem('token')
	}
	mui.ajax({
		url: URL.path + '/welcome',
		type: 'post',
		data: datas,
		success: function(data) {
			if(data.returnCode == 200) {
				vm.list = data.data;
				//				mui('#pullrefresh').pullRefresh().endPulldownToRefresh();
				//				mui('#pullrefresh').pullRefresh().enablePullupToRefresh();

				//				mui('#pullrefresh').pullToRefresh().endPullDownToRefresh();
				mui('#pullrefresh').pullToRefresh().refresh(true);
			} else {
				if(data.returnCode == 401) {
					unLoginComfirm();
				} else {
					mui.toast(data.msg)
				}
			}
			mui('#pullrefresh').pullToRefresh().endPullDownToRefresh();
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
		}
	})
}

function up() {
	//	alert(2)
	vm.page++;
	var datas = {
		terminalNo: '3',
		ctype: vm.type,
		page: vm.page,
		limit: vm.limit,
	}
	if(plus.storage.getItem('token')) {
		datas.token = plus.storage.getItem('token')
	}
	mui.ajax({
		url: URL.path + '/welcome',
		type: 'post',
		data: datas,
		success: function(data) {
			if(data.returnCode == 200) {
				if(data.data.length == 0) {
					//					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
					mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
				} else {
					vm.list = vm.list.concat(data.data);
					//					mui('#pullrefresh').pullRefresh().endPullupToRefresh(false);
					mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(false);
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

mui.plusReady(function() {
	//读取本地存储，检查是否为首次启动
	//plus.storage.removeItem("lauchFlag")
	var showGuide = plus.storage.getItem("lauchFlag");
	//仅支持竖屏显示
	plus.screen.lockOrientation("portrait-primary");
	var user = JSON.parse(plus.storage.getItem('user'));
	if(user) {
		vm.myid = user.id;
	}

	if(showGuide) {
		//有值， 说明已经显示过了， 无需显示；
		//关闭splash页面；
		plus.navigator.closeSplashscreen();
		plus.navigator.setFullscreen(false);
		document.querySelector(".home-mask").style.display = 'none';
		//预加载
		preload();

	} else {
		//显示启动导航
		//alert(1)
		mui.openWindow({
			id: 'guide.html',
			url: 'guide.html',
			styles: {
				popGesture: "none"
			},
			show: {
				aniShow: 'none'
			},
			waiting: {
				autoShow: false
			}
		});
		setTimeout(function() {
			//预加载
			preload();
			//			alert(document.querySelector(".home-mask"))
			document.querySelector(".home-mask").style.display = 'none';
		}, 1000);
	}

	function preload() {
		document.addEventListener("resume", onAppStart, false);
		document.addEventListener("pause", onAppEnd, false);

		function onAppStart() {
			startTime();
		}

		function onAppEnd() {
			endTime();
		}
		//document.addEventListener('plusready', onPlusReady, false);
		//		alert('第一次打开app')
		startTime();
		if(plus.storage.getItem('token')) {
			var web = JSON.parse(plus.storage.getItem('user'));
			mui.ajax({
				url: URL.path + '/account/rsuccess',
				type: 'post',
				data: {
					token: plus.storage.getItem('token'),
					terminalNo: '3'
				},
				success: function(data) {
					//						alert(JSON.stringify(data))
					if(data.returnCode == 200) {

						if(data.data.is_success == 0) {
							//							alert(data.data.ctype)

							mui.openWindow({
								url: 'signup-fix.html',
								id: 'signup-fix.html',
								extras: {
									ctype: data.data.ctype
								}
							})
						}
					}
				},
				error: function(xhr, type) {
					console.log(type)
				}
			})
			mui.ajax({
				url: URL.path + '/account/rsuccess',
				type: 'post',
				data: {
					token: plus.storage.getItem('token'),
					terminalNo: '3'
				},
				success: function(data) {
					if(data.returnCode == 200) {
						if(data.data.identity == 1) {
							mui.confirm('变更申请被拒绝，请核对信息后重新提交', '确认', ['暂不', '前往'], function(res) {
								if(res.index == 1) {
									mui.openWindow({
										url: 'change-identity.html',
										id: 'change-identity.html',
										extras: {
											name: web.nickname,
											ctype: web.ctype
										}
									})
								}
							})
						}
					}
				}
			})
		}
		//		var web = plus.webview.currentWebview();
		//		if(web.showShare){
		//			var view = plus.webview.getWebviewById('home.html');
		//			mui.fire(view, 'showShare');
		//			
		//		}

		if(plus.storage.getItem('ShareShow')) {
			if(plus.storage.getItem('token')) {
				var user = JSON.parse(plus.storage.getItem('user'));
				var name = user.nickname;
				name = encodeURIComponent(name);
				SHARE(URL.path3 + 'shareapp?name=' + name, '新三板融资，上企融直通车', null, true, '邀请好友注册');
			}
			close_page('signup.html') //关闭注册第一步 

			close_page('signup-company.html') //关闭注册第二步

			close_page('signup-personal.html') //关闭注册第二步

			close_page('signup-fix.html') //关闭注册第三部

			close_page('my.html')
		}

		var token = plus.storage.getItem('token');
		if(token) {
			vm.islogin = true;
		}

		window.addEventListener('showShare', function(e) {　 //监听注册完开启分享
			//			alert('监听到了')
			if(plus.storage.getItem('token')) {
				var user = JSON.parse(plus.storage.getItem('user'));
				var name = user.nickname;
				name = encodeURIComponent(name);
				SHARE(URL.path3 + 'shareapp?name=' + name, '新三板融资，上企融直通车', null, true, '分享即获免费路演');
			}
			close_page('signup.html') //关闭注册第一步 

			close_page('signup-company.html') //关闭注册第二步

			close_page('signup-personal.html') //关闭注册第二步

			close_page('signup-fix.html') //关闭注册第三部

			close_page('my.html')

		});

		if(plus.storage.getItem('phonesContacts')) {
			vm.phones = plus.storage.getItem('phonesContacts');
			isActive();
		} else {
			plus.contacts.getAddressBook(plus.contacts.ADDRESSBOOK_PHONE, function(addressbook) {
				addressbook.find(["displayName", "phoneNumbers"], function(contacts) {
					var arr = []
					//				alert(JSON.stringify(contacts))
					for(var i = 0; i < contacts.length; i++) {
						if(contacts[i].phoneNumbers.length != 0) {
							//console.log(contacts[i].phoneNumbers[0].value)
							var data = contacts[i].phoneNumbers[0].value;
						}

						data = data.replace(/-/g, '')
						arr.push(data);
					}
					var phones = arr.join(',');
					vm.phones = phones;
					plus.storage.setItem('phonesContacts', phones);

					isActive();
				}, function() {
					alert("error");
				}, {
					multiple: true
				});
			}, function(e) {
				//				mui.toast("通讯录拒绝访问");
				isActive();
			});
		}

		function isActive() {
			if(plus.storage.getItem('token')) {
				mui.ajax({
					url: URL.path + '/account/new_friend_fans',
					type: 'post',
					data: {
						terminalNo: '3',
						token: plus.storage.getItem('token'),
						phones: vm.phones
					},
					success: function(data) {
						if(data.returnCode == 200) {
							if(data.data.all_nums != 0) {
								addNav(0, true);
							} else {
								addNav(0);
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
				addNav(0);
			}
		}
		//isActive();

		function Home() {

			this.init = function() {
				getList();
				tab();
				//linkHomePage();
				Concern();
				banner();
			}

			function getList() {
				var datalist = {
					terminalNo: '3',
					ctype: vm.type,
					page: vm.page,
					limit: vm.limit,
				}
				if(plus.storage.getItem('token')) {
					datalist.token = plus.storage.getItem('token');
				}

				mui.ajax({
					url: URL.path + '/welcome',
					type: 'post',
					data: datalist,
					success: function(data) {
//						console.log(data.data,'data.data');
						if(data.returnCode == 200) {
							vm.list = data.data;

						} else {
							if(data.returnCode == 401) {
								//unLoginComfirm();
								mui.confirm('您还未登录', '确认', ['去登录', '取消'], function(res) {
									if(res.index == 0) {
										BackLogin()
									} else {
										plus.storage.clear();
										getList();
									}
								})
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

			function tab() {
				mui('body').on('tap', '.home-tab-li', function() {
					//this.parentNode.childNodes.classList.remove('cur')
					vm.type = this.getAttribute('data-type');
					vm.page = 1;
					console.log(vm.type,'11111111')
					getList();
					//mui('#pullrefresh').pullRefresh().enablePullupToRefresh();
					mui('#pullrefresh').pullToRefresh().refresh(true);
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
								obj.classList.add('home-con-fwed');
								obj.classList.remove('home-con-fw');
								obj.innerHTML = '已关注';
							} else {
								obj.classList.remove('home-con-fwed');
								obj.classList.add('home-con-fw');
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

			function Concern() {
				mui('body').on('tap', '.home-con-fw', function(e) {
					e.stopPropagation()
					if(!vm.islogin) {
						mui.toast('您还未登录');
						return;
					}
					var id = this.getAttribute('data-id');
					concernAjax('add', id, this);
				});
				mui('body').on('tap', '.home-con-fwed', function(e) {
					e.stopPropagation()
					if(!vm.islogin) {
						mui.toast('您还未登录');
						return;
					}
					var id = this.getAttribute('data-id');
					concernAjax('remove', id, this);
				})
			}

			function banner() {
				mui.ajax({
					url: URL.path2 + '/common/banner_list',
					type: 'post',
					success: function(data) {
						//alert(JSON.stringify(data))
						//alert(JSON.stringify(data.data))

						if(data.returnCode == 200) {
							vm.banner = data.data;
							vm.banlength = data.data.length - 1;
							//							alert(vm.banlength)
							vm.$nextTick(function() {
								var gallery = mui('.mui-slider');
								gallery.slider({
									interval: 5000 //自动轮播周期，若为0则不自动播放，默认为0；
								});
								scrollBall();
								bannerLink();
							})
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

			function scrollBall() {
				var scrollheight = -$("#home_banner").height();
				document.querySelector('.mui-scroll-wrapper').addEventListener('scroll', function(e) {	　　
					if((e.detail.lastY < scrollheight)) {
						document.getElementById("home_btn2").style.display = 'none';
						document.getElementById("home_btn").style.display = 'block';
					} else {
						document.getElementById("home_btn").style.display = 'block';
						document.getElementById("home_btn2").style.display = 'block';
					}
				})
			}

			function bannerLink() {
				mui('body').on('tap', '.home-banner', function() {
					var url = this.getAttribute('data-url');
					var id = this.getAttribute('data-id');
					var title = this.getAttribute('data-title');
					if(!plus.storage.getItem('token')) {
						//mui.toast('您还未登录');
						GO('signin')
						return;
					}
					if(this.classList.contains('banner-circle')) { //跳转圈子详情
						GO('circle-info', {
							cid: id
						})
					}
					if(this.classList.contains('banner-article')) { //跳转长文章详情
						GO('circle-article-info', {
							cid: id
						})
					}
					if(this.classList.contains('banner-topic')) { //跳转话题详情
						//						GO('circle-topic-info', {
						//							cid: id
						//						})
						var nwaiting = plus.nativeUI.showWaiting();
						var webviewShow = plus.webview.create('circle-topic-info.html', 'circle-topic-info.html', {
							top: '0px',
							bottom: '0px'
						}, {
							cid: id
						});
					}
					if(this.classList.contains('banner-personal')) { //跳转个人主页
						GO('homepage-personal', {
							rid: id
						})
					}
					if(this.classList.contains('banner-company')) { //跳转企业主页
						GO('homepage-company', {
							cid: id
						})
					}
					if(this.classList.contains('banner-demand')) { //跳转企业主页
						GO('demand-info', {
							sign: id
						})
					}
					if(this.classList.contains('banner-link')) { //跳转外链
						GO('other-link', {
							url: url,
							title: title
						})

					}

				})
			}

		}

		var home = new Home();
		home.init();

		var contentWebview = null;

		mui('#nav').on('tap', '#nav_home', function() {
			mui('#pullrefresh').pullToRefresh().pullDownLoading();
		})
		mui('#nav').on('tap', '#nav_circle', function() {
			GO('circle', {}, true)
		})
		mui('#nav').on('tap', '#nav_demand', function() {
			GO('demand', {}, true)
		})
		mui('#nav').on('tap', '#nav_my', function() {
			GO('my', {}, true)
		})
		
		var scroll = mui('.mui-scroll-wrapper').scroll();

		document.querySelector('.mui-scroll-wrapper').addEventListener('swipedown',function (e) {
		　　document.querySelector('.top').style.display = '';
		})
		document.querySelector('.mui-scroll-wrapper').addEventListener('swipeup',function (e) {
		　　document.querySelector('.top').style.display = 'none';
		})
		mui('body').on('tap', '.top', function(e) {
		    mui('.mui-scroll-wrapper').scroll().scrollTo(0,0,1000);//100毫秒滚动到顶  
		    document.querySelector('.top').style.display = 'none';
		    e.stopPropagation();
		})

		mui('body').on('tap', '.home-search', function() {
			if(!plus.storage.getItem('token')) {
				//mui.toast('您还未登录');
				GO('signin')
				return;
			}
			GO('home-search', {}, true)
		})

		mui('body').on('tap', '.link-screen', function() {
			if(!plus.storage.getItem('token')) {
				//mui.toast('您还未登录');
				GO('signin')
				return;
			}
			GO('screen', {}, true)
		})

		mui('body').on('tap', '.home-con-li', function() {
			if(!plus.storage.getItem('token')) {
				//mui.toast('您还未登录'); 
				GO('signin')
				return;
			}
			var id = this.getAttribute('data-id');
			mui.openWindow({
				url: 'homepage-personal.html',
				id: 'homepage-personal.html',
				extras: {
					rid: id
				}
			})
		})
	}

})