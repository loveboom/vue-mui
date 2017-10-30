mui.init()
mui.ready(function() {
	//plus.storage.removeItem('token')

	addNav(3)
	//plus.storage.removeItem('token')
	//	mui.openWindow({
	//		url:'signup.html',
	//		id:'signup.html'
	//	})
	var vm = new Vue({
		el: '#my',
		data: {
			islog: false,
			avatar: 'static/img/avatar.png',
			uname: '请登录',
			concerns: 0,
			fans: 0,
			activity: 0,
			reward: 0,
			position: '',
			company: '',
			profile: '',
			ctype: '',
			id: '',
			ispass: '',
			zan_money: '',
			new_fans_nums: '',
			is_rep: '',
			new_friends: ''
		},
		computed: {
			identity: function() {
				return getId(this.ctype);
			}
		}
	})

	mui.plusReady(function() {

		window.addEventListener('reload', function() {
			myAjax();
		})

		window.addEventListener('reloadFriend', function() {
			isActive();
		})

		var user = JSON.parse(plus.storage.getItem('user'));
		if(user) {
			var rid = user.id;
		}

		function isActive() {
			if(plus.storage.getItem('token')) {
				var datas = {
					terminalNo: '3',
					token: plus.storage.getItem('token')
				}
				if(plus.storage.getItem('phonesContacts')) {
					datas.phones = plus.storage.getItem('phonesContacts');

				}
				//				console.log(datas.phones)
				mui.ajax({
					url: URL.path + '/account/new_friend_fans',
					type: 'post',
					data: datas,
					//					dataType:'string',
					success: function(data) {
						//						alert(JSON.stringify(data))
						if(data.returnCode == 200) {
//														alert(JSON.stringify(data.data))
							if(data.data.all_nums != 0) {
//								alert(1) 
								addNav(3, true);
							} else {
								addNav(3);
							}
							vm.new_friends = data.data.friend;
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
			} else {
				addNav(3);
			}
		}
		isActive();

		function myAjax() {
			mui.ajax({
				url: URL.path + '/account/info',
				type: 'post',
				data: {
					token: plus.storage.getItem('token'),
					terminalNo: '3',
				},
				//				dataTye:'string',
				success: function(data) {
					//					alert(JSON.stringify(data)); 
					if(data.returnCode == 200) {
						//											alert(JSON.stringify(data.data));   
						vm.islog = true;
						vm.ctype = data.data.ctype;
						vm.uname = data.data.uname;
						vm.avatar = data.data.photo ? data.data.photo.url : 'static/img/avatar.png';
						vm.concerns = data.data.concerns;
						vm.fans = data.data.fans;
						vm.activity = data.data.activity;
						vm.reward = data.data.reward;
						vm.position = data.data.position;
						vm.company = data.data.company;
						vm.profile = data.data.info.profile;
						vm.id = data.data.id;
						//						alert(vm.id)
						vm.ispass = data.data.identity;
						vm.zan_money = data.data.zan_money;
						vm.new_fans_nums = data.data.new_fans_nums;
						vm.is_rep = data.data.is_rep;
					} else {
						if(data.returnCode == 401) {
							//						unLoginComfirm('my.html'); 
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
		myAjax();

		function myLink(name, url) {
			document.getElementById(name).addEventListener('tap', function() {
				if(vm.islog) {
					GO(url)
				} else {
					mui.toast('您还未登录');
					return;
				}
			})
			mui('body').on('tap', '.my-header-intro', function() {
				if(!vm.islog) {
					mui.openWindow({
						url: 'signin.html',
						id: 'signin.html'
					})
				} else {
					mui.openWindow({
						url: 'homepage-personal.html',
						id: 'homepage-personal.html',
						extras: {
							rid: vm.id
						}
					})
				}
			})
		}

		window.addEventListener('reload', function() {
			myAjax();
		})
		if(plus.storage.getItem('token')) {
			var user = JSON.parse(plus.storage.getItem('user'));
			console.log(user,'user')
			var name = user.nickname;
			//SHARE(URL.path3 + 'shareapp?name=' + name, '分享app');
		}

		//关注跳转
		//		myLink('follow', 'my-follow');
		mui('body').on('tap', '#follow', function() {
			if(!plus.storage.getItem('token')) {
				mui.toast('您还未登录');
				return;
			}
			mui.openWindow({
				url: 'my-follow.html',
				id: 'my-follow.html',
				extras: {
					uid: rid
				},
				createNew: true
			})
		})

		mui('body').on('tap', '#fans', function() {
			if(!plus.storage.getItem('token')) {
				mui.toast('您还未登录');
				return;
			}
			mui.openWindow({
				url: 'my-fans.html',
				id: 'my-fans.html',
				extras: {
					uid: rid
				},
				createNew: true
			})
		})

		mui('body').on('tap', '.my-fail', function() {
			mui.openWindow({
				url: 'change-identity.html',
				id: 'change-identity.html',
				extras: {
					name: vm.uname,
					ctype: vm.ctype
				}
			})
		})
		mui('body').on('tap', '#share', function() {
			if(!plus.storage.getItem('token')) {
				mui.toast('您还未登录');
				return;
			}
			var user = JSON.parse(plus.storage.getItem('user'));
			console.log(user,'user')
			if(user) {
				var name = user.nickname;
			}

			GO('shareh5', {
				name: name
			})
		})

		//粉丝跳转
		//	myLink('fans', 'my-fans');
		//内容管理跳转
		myLink('content', 'my-content');
		//新朋友跳转
		myLink('myfriend', 'my-newfriend');
		//我的收藏跳转
		myLink('collection', 'my-collection');
		//钱包跳转
		myLink('wallet', 'my-wallet');
		//意见反馈
		myLink('feedback', 'feedback');
		//设置跳转 
		myLink('set', 'set');

		mui('#nav').on('tap', '#nav_home', function() {
			//			mui.openWindow({
			//				url:'home-main.html',
			//				id:'home-main.html'  
			//			})
			GO('home', {}, true)
		})
		mui('#nav').on('tap', '#nav_circle', function() {
			GO('circle', {}, true)
		})
		mui('#nav').on('tap', '#nav_demand', function() {
			GO('demand', {}, true)
		})
		mui('#nav').on('tap', '#nav_my', function() {
			//GO('my', {}, true)
			var myweb = plus.webview.currentWebview();
			myweb.reload(true);
		})

	})

})