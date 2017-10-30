mui.ready(function() {
	
	var vm = new Vue({
		el:'#main',
		data:{
			item:{}
		}
	})
	
	
	mui.plusReady(function() {

		var web = plus.webview.currentWebview();

		function News() {
			this.init = function() {
				getNews();
			}

			function getNews() {
				mui.ajax({
					url: URL.path + '/topic/news_detail',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3',
						id: web.cid
					},
					success: function(data) {
						if(data.returnCode == 200) {
							vm.item = data.data; 
							web.show('slide-in-right', 300);
							plus.nativeUI.closeWaiting();
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							}else if(data.returnCode == 250){
								web.show('slide-in-right', 300);
								plus.nativeUI.closeWaiting();
								mui.back();
								mui.toast(data.msg)
							}else {
								mui.toast(data.msg)
							}
						}
					}
				})
			}
		}
		var news = new News();
		news.init();
	})

})