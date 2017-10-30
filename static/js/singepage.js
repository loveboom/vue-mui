var vm = new Vue({
	el: '#main',
	data: {
		item: {}
	}
})

mui.ready(function() {

	mui.plusReady(function() {

		var web = plus.webview.currentWebview();
		var id = web.cid;

		function Singe() {

			this.init = function() {

				getInfo();
			}

			function getInfo() {
				
				var datas = {};
				var url = URL.path2 + '/common/page_detail'
				if(id != 3){ 
					datas.token = plus.storage.getItem('token');
					datas.ctype = id;
					url = URL.path + '/common/page_detail'
				}

				mui.ajax({
					url: url,
					type: 'post',
					data: datas,
					success: function(data) {
						if(data.returnCode == 200) {
//							alert(JSON.stringify(data.data))
							vm.item = data.data;
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg)
							}
						}
					}
				})
			}
		}
		
		var singe = new Singe();
		singe.init();

	})
})