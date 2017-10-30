var vm = new Vue({
	el: '#main',
	data: {
		reportCtype: [],
		selected: '',
		content: ''
	}
})

mui.ready(function() {

	mui.plusReady(function() {

		var web = plus.webview.currentWebview();
		var id = web.rid;

		function Report() {

			this.init = function() {
				type();
				sub();
			}

			function type() {

				mui.ajax({
					url: URL.path + '/account/reportCtype',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3'
					},
					success: function(data) {
						if(data.returnCode == 200) {
							vm.reportCtype = data.data;
							vm.selected = data.data[0].id;
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

				mui('body').on('tap', '.my-save', function() {
					if(!vm.selected) {
						mui.toast('请选择举报原因');
						return;
					}
					if(!vm.content) {
						mui.toast('请填写举报说明');
						return;
					}
					mui.ajax({
						url: URL.path + '/account/report',
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							terminalNo: '3',
							rid: web.rid,
							content: vm.content,
							ctype: vm.selected
						},
						success: function(data) {
							if(data.returnCode == 200) {
								mui.toast('提交成功');
								mui.back();
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(data.msg)
								}
							}
						}
					})
				})
			}
		}

		var report = new Report();
		report.init();

	})

})