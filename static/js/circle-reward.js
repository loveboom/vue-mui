var vm = new Vue({
	el: '#main',
	data: {
		moneylist: ['5', '10', '20', '50', '100', '200'],
		choose: null
	},
	methods: {
		selectMoney: function(params) {
			this.choose = params.index
		}
	}
})

mui.ready(function() {

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		//alert(web.name) 
		document.querySelector(".mui-title").innerHTML = '赞赏' + web.name;
		if(web.avatar) {
			document.querySelector(".swipebox").style.backgroundImage = 'url(' + web.avatar + ')';
		}
		document.querySelector(".circle-reward-tit").innerHTML = web.title;

		var reg = /^[0-9]+$/;

		function Reward() {

			this.init = function() {

				selectMoney();
				getLimit();
			}

			this.minMoney = '';
			this.maxMoney = '';

			function getLimit() {
				var _this = this;
				mui.ajax({
					url: URL.path + '/longarticle/maxmoney',
					type: 'post',
					data: {
						token: plus.storage.getItem('token')
					},
					success: function(data) {
						if(data.returnCode == 200) {
							_this.minMoney = data.data.min_money;
							_this.maxMoney = data.data.max_money;
							otherMoney();
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

			function otherMoney() {
				var _this = this;
				mui('body').on('tap', '#others', function() {
					var cap = '<div class="popp-input"><input type="text" id="money"  placeholder="可输入' + _this.minMoney + '-' + _this.maxMoney + '整数金额"><span>元</span></div>'
					mui.confirm(cap, '输入其他金额', ['取消', '赞赏'], function(data) {
						if(data.index == 1) {
							var money = document.getElementById("money").value;
							if(reg.test(money) && (+money >= +_this.minMoney) && (+money <= +_this.maxMoney)) {
								mui.openWindow({
									url: 'circle-reward-pay.html',
									id: 'circle-reward-pay.html',
									extras: {
										cid: web.cid,
										money: money,
										name: web.name
									}
								})
							} else {
								mui.toast('输入金额有误')
							}

						}
					}, 'div')

				})

			}

			function selectMoney() {
				mui('body').on('tap', '#gopay', function() {
					if(vm.choose == null) {
						mui.toast('请选择赞赏金额');
						return;
					}
					mui.openWindow({
						url: 'circle-reward-pay.html',
						id: 'circle-reward-pay.html',
						extras: {
							cid: web.cid,
							money: vm.moneylist[vm.choose],
							name: web.name
						}
					})

				})
			}

		}
		var reward = new Reward();
		reward.init();

	})
})