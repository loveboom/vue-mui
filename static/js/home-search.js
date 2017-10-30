var vm = new Vue({
	el: '#main',
	data: {
		list: [],
		keywords: '',
		page: '1',
		limit: '20',
		historyShow: true,
		islogin: false,
		history: [],
		myid:''
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

		var token = plus.storage.getItem('token');
		if(token) {
			vm.islogin = true;
		}
		var user = JSON.parse(plus.storage.getItem('user'));
		if(user) {
			vm.myid = user.id;
		}

		function Search() {

			this.init = function() {
				sub(); //搜索
				Concern(); //关注
				history(); //历史纪录
				clickSub(); //点击搜索
				deleteHistory(); //删除历史纪录
			}

			function sub() {
				mui('body').on('tap', '.home-sarch-btn', function(e) {
					if(!vm.keywords){
						mui.toast('请输入搜索内容');
						return;
					}
					getList();
					addHistory();
					document.querySelector(".home-search-input").blur();
					
				})
			}

			function getList() { 
				mui.ajax({
					url: URL.path + '/welcome',
					type: 'post',
					data: {
						terminalNo: '3',
						kw: vm.keywords,
						page: '1',
						limit: vm.limit,
						token: plus.storage.getItem('token')
					},
					
					success: function(data) {
					
						if(data.returnCode == 200) {
							vm.historyShow = false;
							
							vm.list = data.data;
//							alert(JSON.stringify(data.data)) 
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

			function history() {
				mui.ajax({
					url: URL.path + '/history/hlist',
					type: 'post',
					data: {
						token: plus.storage.getItem('token')
					},
					success: function(data) {
						if(data.returnCode == 200) {
							vm.history = data.data;
						}
					}
				})
			}

			function addHistory() {
				mui.ajax({
					url: URL.path + '/history/hcreate',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						kw: vm.keywords
					}
				})
			}

			function clickSub() {
				mui('body').on('tap', '.home-search-history-li', function() {
					vm.keywords = this.getAttribute('data-kw');
					getList();
				})
			}

			function deleteHistory() {
				mui('body').on('tap', '.home-search-history-delete', function(e) {
					e.stopPropagation();
					var id = this.getAttribute('data-id');
					var _this = this;
					mui.ajax({
						url: URL.path + '/history/hdel',
						type: 'post',
						data: {
							id: id
						},
						success: function(data) {
							if(data.returnCode == 200) {
								_this.parentNode.remove();
							}
						}
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
	mui.ajax({
		url: URL.path + '/welcome',
		type: 'post',
		data: {
			terminalNo: '3',
			kw: vm.keywords,
			page: vm.page,
			limit: vm.limit,
			token: plus.storage.getItem('token')
		},
		success: function(data) {
			if(data.returnCode == 200) {
				vm.list = data.data;
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
	mui.ajax({
		url: URL.path + '/welcome',
		type: 'post',
		data: {
			terminalNo: '3',
			kw: vm.keywords,
			page: vm.page,
			limit: vm.limit,
			token: plus.storage.getItem('token')
		},
		success: function(data) {
			if(data.returnCode == 200) {
				if(data.data.length == 0) {
					mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
				} else {
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