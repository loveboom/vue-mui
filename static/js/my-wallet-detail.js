mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			item: []
		}
	})

	mui.plusReady(function() {

		function WalletDetail() {

			this.init = function() {
				moneyList();
				link();
			}

			function link() {
				mui('body').on('tap', '.my-wallet-d-li', function() {
					var id = this.getAttribute('data-id');
					var zf = this.getAttribute('data-zf');
					mui.openWindow({
						url: 'transaction-details.html',
						id: 'transaction-details.html',
						extras: {
							cid: id,
							zf:zf
						}
					})
				})
			}

			function moneyList() {
				//				var user = JSON.parse(plus.storage.getItem('user'));
				//				var id = user.id;
				mui.ajax({
					url: URL.path + '/balance/blist',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3',
					},
					success: function(data) {

						// alert(JSON.stringify(data))
						if(data.returnCode == 200) {

							for(var i in data.data) {
								var datas = data.data[i];
								if(datas.type == 1 || datas.type == 2) {
									datas.icon = 1;
								} else if(datas.type == 8) {
									datas.icon = 3;
								} else if(datas.type == 9) {
									datas.icon = 2;
								} else {
									datas.icon = 4;
								}
								var zf = '';
								if(datas.type == 1 || datas.type == 3 || datas.type == 4 || datas.type == 8) {
									zf = 0;
								} else {
									zf = 1;
								}
								datas.zf = zf;
							}
							vm.item = data.data;
							mui('.mui-scroll-wrapper').scroll({
								deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
							});
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg);
							}
						}
					},
					error: function(xhr, type) {
						console.log(type)
						// alert(1)
					}
				})
			}
		}

		var wallet = new WalletDetail();
		wallet.init()
	})

})