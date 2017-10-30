var vm = new Vue({
	el: '#main',
	data: {
		item: {},
		zf:''
	},
	computed:{
		name:function(){
			if(this.zf == 1){
				return '付款人'
			}else{
				return '收款人'
			}
		}
	}
})

mui.ready(function() {

	mui.plusReady(function() {

		var web = plus.webview.currentWebview();
		var id = web.cid;
		vm.zf = web.zf;
		console.log(vm.zf)
		function Details() {

			this.init = function() {

				getInfo()
			}

			function getInfo() {

				mui.ajax({
					url: URL.path + '/balance/detail',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3',
						id: id
					},
					success: function(data) {
						if(data.returnCode == 200) {
//							alert(JSON.stringify(data.data))
							var datas = data.data;
							if(datas.type_id == 1 || datas.type_id == 2) {
								datas.icon = 1;
							} else if(datas.type_id == 8) {
								datas.icon = 3;
							} else if(datas.type_id == 9) {
								datas.icon = 2;
							} else {
								datas.icon = 4;
							}
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

		var details = new Details();
		details.init();
	})

})