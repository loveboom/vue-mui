mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			item: []
		}
	})

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		var id = web.uid;
		
		var user = JSON.parse(plus.storage.getItem('user'));
		vm.myid = user.id;

		var follow = {
			init: function() {
				follow.ajaxlist();
				follow.cancel();
				follow.add();
				follow.link();
			},
			ajaxlist: function() {
				mui.ajax({
					url: URL.path + '/concern/clist',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3',
						id:id
					},
					success: function(data) {
						if(data.returnCode == 200) {
							//alert(JSON.stringify(data.data))     
							vm.item = data.data;
							mui('.mui-scroll-wrapper').scroll({
								deceleration: 0.0005
							});
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(JSON.stringify(data.msg))
							}
						}

					}
				})
			},
			cancel: function() {
				mui('#main').on('tap', '.followed', function(e) { //取消关注
					e.stopPropagation();
					var box = this.parentNode;
					var id = box.getAttribute('data-id');
					var _this = this;
					mui.ajax({
						url: URL.path + '/concern/cupdate',
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							rid: id,
							terminalNo: '3'
						},
						success: function(data) {
							if(data.returnCode == 200) {
								//alert(JSON.stringify(data));
								mui.toast('成功取消关注');
								//								follow.ajaxlist();
								_this.classList.remove('followed');
								_this.classList.add('unfollowed');
								_this.innerHTML = '+ 关注';
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm('my-follow.html');
								} else {
									mui.toast(JSON.stringify(data.msg))
								}
							}
						}
					})
				})
			},
			add: function() {
				mui('#main').on('tap', '.unfollowed', function(e) { //添加关注
					e.stopPropagation();
					var box = this.parentNode;
					var id = box.getAttribute('data-id');
					var _this = this;
					//alert(id);
					mui.ajax({
						url: URL.path + '/concern/cupdate', 
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							rid: id,
							terminalNo: '3'
						},
						success: function(data) {
							if(data.returnCode == 200) {
								//alert(JSON.stringify(data));
								mui.toast('成功添加关注');
								//								follow.ajaxlist();
								_this.classList.remove('unfollowed');
								_this.classList.add('followed');
								_this.innerHTML = '已关注';
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm('my-follow.html');
								} else {
									mui.toast(JSON.stringify(data.msg))
								}
							}
						}
					})
				})
			},
			link: function() {
				mui('#main').on('tap', '.my-follow-li', function() { //跳转个人主页
					var id = this.getAttribute('data-id');
					// alert(id)
					mui.openWindow({
						url: 'homepage-personal.html',
						id: 'homepage-personal.html',
						extras: {
							rid: id
						},
						createNew:true 
					})
				})
			}
		}

		follow.init();

	})
})