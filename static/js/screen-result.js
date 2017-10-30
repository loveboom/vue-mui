var vm = new Vue({
	el: '#main',
	data: {
		list: [],
		page: '1',
		limit: '7',
		islogin: false,
		myid: ''
	}
})

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
	//	}
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

mui.ready(function() {

	mui.plusReady(function() {
		var deceleration = mui.os.ios ? 0.003 : 0.0009;

		mui('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true, //是否显示滚动条
			deceleration: deceleration
		});

		var web = plus.webview.currentWebview();
		var ctype = web.ctype;
		var interested = web.interested;

		var token = plus.storage.getItem('token');
		if(token) {
			vm.islogin = true;
		}
		var lastweb = plus.webview.getWebviewById('screen.html');
		setTimeout(function() {
			plus.webview.close(lastweb);
		}, 1000)

		var user = JSON.parse(plus.storage.getItem('user'));
		if(user) {
			vm.myid = user.id;
		}

		function Search() {

			this.init = function() {
				getList();
				Concern(); //关注
				linkSearch();
			}

			function getList() {
				var datas = {
					terminalNo: '3',
					ctype: ctype,
					interested: interested,
					page: vm.page,
					limit: vm.limit,
				}
				if(plus.storage.getItem('token')) {
					datas.token = plus.storage.getItem('token');
				}
				mui.ajax({
					url: URL.path + '/welcome',
					type: 'post',
					data: datas,
					success: function(data) {
						if(data.returnCode == 200) {
//							alert(JSON.stringify(data.data))
							vm.list = data.data;
							vm.$nextTick(function() {

							})
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

			function linkSearch() {
				mui('body').on('tap', '#home_btn', function() {
					mui.openWindow({
						url: 'screen.html',
						id: 'screen.html',
					})
				})
			}
		}

		var search = new Search();
		search.init();

	})

})

function down() {
	vm.page = 1;
	var datas = {
		terminalNo: '3',
		ctype: plus.webview.currentWebview().ctype,
		interested: plus.webview.currentWebview().interested,
		page: vm.page,
		limit: vm.limit,
	}
	if(plus.storage.getItem('token')) {
		datas.token = plus.storage.getItem('token');
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
				mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(); //取消下拉按钮
				mui('#pullrefresh').pullToRefresh().refresh(true); //启用上拉
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

function up() {
	vm.page++;
	var datas = {
		terminalNo: '3',
		ctype: plus.webview.currentWebview().ctype,
		interested: plus.webview.currentWebview().interested,
		page: vm.page,
		limit: vm.limit,
	}
	if(plus.storage.getItem('token')) {
		datas.token = plus.storage.getItem('token');
	}
	mui.ajax({
		url: URL.path + '/welcome',
		type: 'post',
		data: datas,
		success: function(data) {
			if(data.returnCode == 200) {
				//				alert(JSON.stringify(data.data))
				if(data.data.length == 0) {
					//					mui('#pullrefresh').pullRefresh().endPullupToRefresh(true);
					mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);

				} else {
					//					alert(JSON.stringify(vm.list.length))
					vm.list = vm.list.concat(data.data);
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