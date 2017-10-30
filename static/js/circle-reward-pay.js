mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			money: '',
			payway: [{
				icon: 'static/img/balance.png',
				title: '账户余额',
				type: '3'
			}, {
				icon: 'static/img/weixin.png',
				title: '微信支付',
				type: '1'
			}, {
				icon: 'static/img/alipay.png',
				title: '支付宝',
				type: '2'
			}],
			name: '',
			choose: '0',
			balance: '',
			empty: ''
		},
		methods: {
			selected: function(params) {
				this.choose = params.index;
			}
		}
	})

	mui.plusReady(function() {

		var web = plus.webview.currentWebview();
		vm.name = web.name;
		vm.money = web.money;

		function Pay() {

			this.init = function() {
				balance();
				sub();
			}

			function balance() {
				mui.ajax({ //验证余额
					url: URL.path + '/longarticle/balance_empty',
					type: 'post',
					data: {
						money: web.money,
						token: plus.storage.getItem('token'),
						terminalNo: '3'
					},
					success: function(data) {
						if(data.returnCode == 200) {
							//alert(JSON.stringify(data.data))
							vm.balance = data.data.balance;
							vm.empty = data.data.is_empty;
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

			function sub() {
				mui('body').on('tap', '#sub', function() {
					if(vm.choose == 0 && vm.empty == 0) {
						mui.toast('余额不足');
						return;
					}
					mui.ajax({
						url: URL.path + '/longarticle/recharge_zan',
						type: 'post',
						data: {
							money: vm.money,
							type: vm.payway[vm.choose].type,
							tid: web.cid,
							token: plus.storage.getItem('token'),
						},
						success: function(data) {
							if(data.returnCode == 200) {
								//alert(JSON.stringify(data.data))
								//						plus.webview.close('circle-reward-pay.html'); 
								//						plus.webview.close('circle-reward.html');
								mui.toast('余额支付成功');
								//						mui.back(); 
								var wobj = plus.webview.getWebviewById("circle-article-info.html");
								wobj.reload(true);
								plus.webview.show(wobj, 'auto', function() {
									var lastweb = plus.webview.currentWebview('circle-reward.html');
									plus.webview.close(lastweb);
								});

							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(data.msg)
								}
							}
						},
						error: function(xhr, type) {
							alert(type)
						}
					})
				})
			}
		}
		
		var pay = new Pay();
		pay.init()
	})

})