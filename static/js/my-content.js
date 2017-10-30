var deceleration = mui.os.ios ? 0.003 : 0.0009;
var vm = new Vue({
	el: '#main',
	data: {
		all: [],
		allpage: '1',
		demand: [],
		demandpage: '1',
		circle: [],
		circlepage: '1'
	}
})

mui.ready(function() {

	mui.plusReady(function() {

		function Content() {

			this.init = function() {
				contentAjax('0', 'down', 'first');
				contentAjax('1', 'down', 'first');
				contentAjax('2', 'down', 'first');
				link();
			}

			function muiScroll() {
				mui('.mui-scroll-wrapper').scroll({
					bounce: false,
					indicators: true, //是否显示滚动条
					deceleration: deceleration
				});
			}

			function allInit() {
				mui('#all').pullToRefresh({
					up: {
						callback: allUp,
						contentrefresh: "正在加载...",
						contentnomore: '没有更多数据了',
					},
					down: {
						callback: allDown,
					}
				})
			}

			function demandInit() {
				mui('#demand').pullToRefresh({
					up: {
						callback: demandUp,
						contentrefresh: "正在加载...",
						contentnomore: '没有更多数据了',
					},
					down: {
						callback: demandDown,
					}
				})
			}

			function circleInit() {
				mui('#circle').pullToRefresh({
					up: {
						callback: circleUp,
						contentrefresh: "正在加载...",
						contentnomore: '没有更多数据了',
					},
					down: {
						callback: circleDown,
					}
				})
			}

			function contentAjax(type, direction, first) {
				var datas = {}
				if(type == 0) {
					if(direction == 'up') {
						vm.allpage++;
					} else {
						vm.allpage = 1;
					}
					datas.page = vm.allpage;
				}
				if(type == 1) {
					if(direction == 'up') {
						vm.demandpage++;
					} else {
						vm.demandpage = 1;
					}
					datas.page = vm.demandpage;
				}
				if(type == 2) {
					if(direction == 'up') {
						vm.circlepage++;
					} else {
						vm.circlepage = 1;
					}
					datas.page = vm.circlepage;
				}
				datas.token = plus.storage.getItem('token');
				datas.ctype = type;
				//console.log(plus.storage.getItem('token'))
				mui.ajax({
					url: URL.path + '/circle/my_contents',
					type: 'post',
					data: datas,
					success: function(data) {
						if(data.returnCode == 200) {
							//							alert(JSON.stringify(data.data)) 
							if(type == 0) { //全部
								if(direction == 'up') {
									if(data.data.length == 0) {
										setTimeout(function() {
											mui('#all').pullToRefresh().endPullUpToRefresh(true);
										}, 800)
									} else {

										vm.all = vm.all.concat(data.data);
										mui('#all').pullToRefresh().endPullUpToRefresh(false);
									}
								} else {
									//									alert(JSON.stringify(data.data))
									vm.all = data.data;
									if(!first) {
										mui('#all').pullToRefresh().endPullDownToRefresh();
										mui('#all').pullToRefresh().refresh(true);
									}

								}
								if(first) {
									allInit();
								}
							}
							if(type == 1) {

								//								alert(JSON.stringify(data.data))
								if(direction == 'up') {
									if(data.data.length == 0) {
										setTimeout(function() {
											mui('#demand').pullToRefresh().endPullUpToRefresh(true);
										}, 800)
									} else {
										vm.demand = vm.demand.concat(data.data);
										mui('#demand').pullToRefresh().endPullUpToRefresh(false);
									}
								} else {

									vm.demand = data.data;
									if(!first) {
										mui('#demand').pullToRefresh().endPullDownToRefresh();
										mui('#demand').pullToRefresh().refresh(true);
									}

								}
								if(first) {
									demandInit();
								}
							}
							if(type == 2) {
//								alert(JSON.stringify(data.data))
								if(direction == 'up') {
									if(data.data.length == 0) {
										setTimeout(function() {
											mui('#circle').pullToRefresh().endPullUpToRefresh(true);
										}, 800)
									} else {
										vm.circle = vm.circle.concat(data.data);
										mui('#circle').pullToRefresh().endPullUpToRefresh(false);
									}
								} else {

									vm.circle = data.data;
									if(!first) {
										mui('#circle').pullToRefresh().endPullDownToRefresh();
										mui('#circle').pullToRefresh().refresh(true);
									}

								}
								if(first) {
									circleInit();
								}
							}
							muiScroll();
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

			function allUp() { //全部上拉加载
				contentAjax('0', 'up');
			}

			function allDown() { //全部下拉刷新
				contentAjax('0', 'down');
			}

			function demandUp() { //需求上拉加载
				contentAjax('1', 'up');
			}

			function demandDown() { //需求下拉刷新
				contentAjax('1', 'down');
			}

			function circleUp() { //全部上拉加载
				contentAjax('2', 'up');
			}

			function circleDown() { //全部下拉刷新
				contentAjax('2', 'down');
			}

			function link() {
				mui('body').on('tap', '.link-circle', function() {
					var id = this.getAttribute('data-id');
					mui.openWindow({
						url: 'circle-info.html',
						id: 'circle-info.html',
						extras: {
							cid: id
						}
					})
				})
				mui('body').on('tap', '.link-topic', function() {
					var id = this.getAttribute('data-tid');
//					alert(id)
					var nwaiting = plus.nativeUI.showWaiting();
					var webviewShow = plus.webview.create('circle-topic-info.html', 'circle-topic-info.html', {
						top: '0px',
						bottom: '0px'
					}, {
						cid: id
					});
				})
				mui('body').on('tap', '.link-article', function() {
					var id = this.getAttribute('data-tid');
					var nwaiting = plus.nativeUI.showWaiting();
					var webviewShow = plus.webview.create('circle-article-info.html', 'circle-article-info.html', {
						top: '0px',
						bottom: '0px'
					}, {
						cid: id
					});
				})
				mui('body').on('tap', '.link-demand', function() {
					var id = this.getAttribute('data-id');
					var dtype = this.getAttribute('data-dtype');
					var isClaim = this.getAttribute('data-isClaim');
					var url = '';
 
					if(dtype == 1 || isClaim == 1){
						url = 'demand-info.html'
					}else{
						url = 'demand-infos.html'
					}
//					alert(id)
					mui.openWindow({
						url: url,
						id: url,
						extras: {
							sign: id
						}
					})
				})
				
			}
		}

		var content = new Content();
		content.init();

	})

})