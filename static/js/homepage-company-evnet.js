var vm = new Vue({
	el: '#main',
	data: {
		my: [],
		mypage: 1,
	}
})

mui.ready(function() {

	mui.plusReady(function() {
		vm.token = plus.storage.getItem('token');
		var web = plus.webview.currentWebview();
		var deceleration = mui.os.ios ? 0.003 : 0.0009;
		var circle = {
			init: function() {
				circle.myajaxfirst(); //第一次我的圈子详情加载  带判断状态
				circle.deleteCircle(); //删除圈子或长文章
				circle.bind();
			},
			setIndex: function() {
				var n = document.querySelectorAll(".circle-my-list");
				for(var i = 0; i < n.length; i++) {
					n[i].index = i;
				}
			},
			muiScroll: function() { //mui滚动初始化
				mui('.mui-scroll-wrapper').scroll({
					bounce: false,
					indicators: true, //是否显示滚动条
					deceleration: deceleration
				});
			},
			muiMyInit: function() { //mui我的圈子初始化
				mui('#my').pullToRefresh({
					up: {
						callback: circle.myUp,
						contentrefresh: "正在加载...",
						contentnomore: '没有更多数据了',
					},
					down: {
						callback: circle.myDown,
					}
				})
			},
			myajax: function(type) { //我的圈子ajax
				if(type == 'up') {
					vm.mypage++;
				} else {
					vm.mypage = 1;
				}
				mui.ajax({
					url: URL.path + '/circle/circle_list',
					type: 'post',
					data: {
						page: vm.mypage,
						token: vm.token,
						terminalNo: '3',
					},
					success: function(data) {
						if(data.returnCode == 200) {
							if(type == 'up') {
								if(data.data.length == 0) {
									setTimeout(function() {
										mui('#my').pullToRefresh().endPullUpToRefresh(true);
									}, 800)
								} else {
//									alert(JSON.stringify(vm.my))  
									vm.my.comments = vm.my.comments.concat(data.data.comments);
									mui('#my').pullToRefresh().endPullUpToRefresh(false);
								}
							} else {
								vm.my = data.data;
								mui('#my').pullToRefresh().endPullDownToRefresh();
								mui('#my').pullToRefresh().refresh(true);
							}
							vm.$nextTick(function() {
								mui.previewImage();
								circle.setIndex();
							})

						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg)
							}
						}
					},
					error:function(xhr,type){
						console.log(type)
					}
				})
			},
			myajaxfirst: function() { //第一次我的圈子详情加载  带判断状态

				mui.ajax({
					url: URL.path + '/circle/circle_list',
					type: 'post',
					data: {
						page: '1',
						token: vm.token,
						terminalNo: '3',
					},
					success: function(data) {
						if(data.returnCode == 200) {
							if(data.data.length == 0) {
								//mui('#my').pullToRefresh().endPullUpToRefresh(true);
							} else {
								vm.my = data.data;
								vm.$nextTick(function() {
									circle.muiScroll();
									circle.muiMyInit();
									mui.previewImage();
									circle.setIndex();
								})
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
			},
			myUp: function() { //我的圈子上拉加载更多	
				circle.myajax('up');
			},
			myDown: function() { //我的圈子下拉刷新
				circle.myajax('down');
			},
			bind: function() {
				mui("body").on('tap', '.link-circle', function(e) { //跳转圈子
					
					e.stopPropagation();
					if(this.classList.contains('cant')) {
						mui.toast('该圈子已经被删除');
						return;
					}
					var id = this.getAttribute('data-id');
					mui.openWindow({
						url: 'circle-info.html',
						id: 'circle-info.html',
						extras: {
							cid: id
						}
					})
				})
				mui("body").on('tap', '.link-article', function(e) { //跳转长文章
						e.stopPropagation();
						if(this.classList.contains('cant')) {
							mui.toast('该圈子已经被删除');
							return;
						}
						var id = this.getAttribute('data-tid');
						//优化加载
						var nwaiting = plus.nativeUI.showWaiting();
						var webviewShow = plus.webview.create('circle-article-info.html', 'circle-article-info.html', { top: '0px', bottom: '0px' }, { cid: id });
					})
			},
			deleteCircleAjax: function(url, id, index, parent) { //删除圈子 或者长文章 ajax
				mui.ajax({
					url: url,
					type: 'post',
					data: {
						rid: id,
						token: vm.token,
						terminalNo: '3',
					},
					success: function(data) {
						if(data.returnCode == 200) {
							mui.toast('删除成功');
							//vm.my.comments.splice(index, index + 1);
							parent.remove();
							mui('#my').pullToRefresh().pullDownLoading();
							mui('#hot').pullToRefresh().pullDownLoading();
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
			deleteCircle: function() { //删除圈子 或者长文章
				mui('body').on('tap', '.circle-my-s-delete', function(e) {
					e.stopPropagation();
					var _this = this;
					mui.confirm(' ', '确认删除', ['确认', '取消'], function(res) {
						if(res.index == 0) {
							var parent = _this.parentNode.parentNode.parentNode;
							//								if(parent.classList.contains('link-circle')) {
							circle.deleteCircleAjax(URL.path + '/circle/delete_circle', parent.getAttribute('data-id'), parent.index, parent)
							//								}
							//								if(parent.classList.contains('link-article')) {
							//									circle.deleteCircleAjax(URL.path + '/longarticle/delete_article', parent.getAttribute('data-id'), parent.index, parent)
							//								}
						}
					})

					//alert(parent.classList.contains(''))
				})
			},
		}
		circle.init();
		
		
	})

	mui('.mui-scroll-wrapper').scroll({
		indicators: false,
		deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
	});
})