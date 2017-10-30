mui.ready(function() {
	// alert()
	mui.plusReady(function() {
		function Wallet() {

			this.init = function() {
				getMoney();
				link();
			}

			function getMoney() {

				mui.ajax({
					url: URL.path + '/account/info',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3'
					},
					success: function(data) {
						if(data.returnCode == 200) {
							document.querySelector(".my-wallet-money").innerHTML = data.data.balance;
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg);
							}
						}
					}
				})
			}

			function link() {
				mui('body').on('tap','#detail',function(){
					GO('my-wallet-detail');
				});
			}
		}


		
	})
})