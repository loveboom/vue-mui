mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			item: [],
			myid:''
		}
	})

	mui.plusReady(function() {
		
		var old_back = mui.back;
		mui.back = function(){
			var my = plus.webview.getWebviewById('my.html');
			mui.fire(my,'reload');
			old_back();
		}
		
		var user = JSON.parse(plus.storage.getItem('user'));
		vm.myid = user.id;
		
		var web = plus.webview.currentWebview();
		var id = web.uid;
		function fans() {
			this.init = function() {
				this.ajaxList();
				this.cancel();
				this.add();
				this.link();
			}
			this.ajaxList = function() {
					mui.ajax({ //加载
						url: URL.path + '/concern/cfens',
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							terminalNo: '3',
							id:id
						},
						success: function(data) {
							if(data.returnCode == 200) {
								vm.item = data.data;
								mui('.mui-scroll-wrapper').scroll({
									deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
								});
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(data.msg)
								}
							}

						}
					})
				},
				this.cancel = function() {
					mui('#main').on('tap', '.followed', function(e) { //取消关注
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
									mui.toast('成功取消关注');
									_this.classList.remove('followed');
									_this.classList.add('unfollowed');
									_this.innerHTML = '+ 关注';
								} else {
									if(data.returnCode == 401) {
										unLoginComfirm('my-fans.html');
									} else {
										mui.toast(JSON.stringify(data.msg))
									}
								}
							}
						})
					})
				}
			this.add = function() {
				mui('#main').on('tap', '.unfollowed', function(e) { //添加关注
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
								mui.toast('成功添加关注');
								_this.classList.remove('unfollowed');
								_this.classList.add('followed');
								_this.innerHTML = '已关注';
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm('my-fans.html');
								} else {
									mui.toast(JSON.stringify(data.msg))
								}
							}
						}
					})
				})
			}
			this.link = function() {
				mui('#main').on('tap', '.my-follow-li', function() { //跳转个人主页
					var id = this.getAttribute('data-id');
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
		var fans = new fans();
		fans.init();
	})
})