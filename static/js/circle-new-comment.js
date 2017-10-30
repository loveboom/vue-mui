mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			item: []
		}
	})

	mui.plusReady(function() {
		var token = plus.storage.getItem('token');
		var old_back = mui.back;
		mui.back = function(){
			var circle = plus.webview.getWebviewById('circle.html');
			mui.fire(circle,'reload');
			old_back();
		}

		var comments = {
			init: function() {
				comments.getlist();
				comments.bind();
			},
			getlist: function() {
				mui.ajax({
					url: URL.path + '/comments/new_comment_lists',
					type: 'post',
					data: {
						token: token,
						terminalNo: '3',
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
								mui.toast(data.msg)
							}
						}
					},
				})
			},
			reads: function(id, callback) {
				mui.ajax({
					url: URL.path + '/comments/do_read',
					type: 'post',
					data: {
						token: token,
						terminalNo: '3',
						id: id
					},
					success: function(data) {
						if(data.returnCode == 200) {
							callback()
						}
					}
				})
			},
			bind: function() {
				mui('body').on('tap', '.link-circle', function() {
					var id = this.getAttribute('data-id');
					var nid = this.getAttribute('data-nid');
					comments.reads(nid, function() {
						mui.openWindow({
							url: 'circle-info.html',
							id: 'circle-info.html',
							extras: {
								cid: id
							}
						})
					});

				})
				mui('body').on('tap', '.link-article', function() {

					var id = this.getAttribute('data-id');
					var nid = this.getAttribute('data-nid');
					comments.reads(nid, function() {
						var nwaiting = plus.nativeUI.showWaiting();
						var webviewShow = plus.webview.create('circle-article-info.html', 'circle-article-info.html', { top: '0px', bottom: '0px' }, { cid: id });
					});
				})
				
				mui('body').on('tap', '.link-topic', function() {

					var id = this.getAttribute('data-id');
					var nid = this.getAttribute('data-nid');
					comments.reads(nid, function() {
						var nwaiting = plus.nativeUI.showWaiting();
						var webviewShow = plus.webview.create('circle-topic-info.html', 'circle-topic-info.html', { top: '0px', bottom: '0px' }, { cid: id });
					});
				})
				

				window.addEventListener('new', function() {
					comments.getlist()
				})
			}
		}

		comments.init()

	})

})