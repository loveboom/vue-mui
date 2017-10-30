mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			item: []
		}
	});

	mui.plusReady(function() {

		var collection = {
			init: function() {
				collection.ajaxList();
				collection.cancel();
				collection.add();
				collection.link()
			},
			ajaxList: function() {
				mui.ajax({ //加载
					url: URL.path + '/collects/clist',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3'
					},
					success: function(data) {
						if(data.returnCode == 200) {
//							alert(JSON.stringify(data.data))
							vm.item = data.data;
							mui('.mui-scroll-wrapper').scroll({
								deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
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
				mui('#main').on('tap', '.my-collection-had', function(e) { //取消收藏
					e.stopPropagation();
					var id = this.getAttribute('data-id');
					var _this = this;
					mui.ajax({ //加载
						url: URL.path + '/collects/cupdate',
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							terminalNo: '3',
							id: id
						},
						success: function(data) {
							if(data.returnCode == 200) {
								mui.toast('取消成功');
								collection.ajaxList(); 
//							_this.classList.add('my-collection-unhad');
//							_this.classList.remove('my-collection-had');
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(JSON.stringify(data.msg))
								}
							}
						}
					})
				})
			},
			add:function(){
				mui('#main').on('tap', '.my-collection-unhad', function(e) { //取消收藏
					e.stopPropagation();
					var id = this.getAttribute('data-id');
					var _this = this;
					mui.ajax({ //加载
						url: URL.path + '/collects/cupdate',
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							terminalNo: '3',
							id: id
						},
						success: function(data) {
							if(data.returnCode == 200) { 
								mui.toast('收藏成功');
//								collection.ajaxList(); 
							_this.classList.remove('my-collection-unhad');
							_this.classList.add('my-collection-had');
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(JSON.stringify(data.msg))
								}
							}
						}
					})
				})
			},
			link: function() {
				mui('body').on('tap', '.my-collection-li', function() {
					var id = this.getAttribute('data-tid');

					//优化加载
					var nwaiting = plus.nativeUI.showWaiting();
					var webviewShow = plus.webview.create('circle-article-info.html', 'circle-article-info.html', { top: '0px', bottom: '0px' }, { cid: id });
				})
			}
		}
		collection.init()
	})
})