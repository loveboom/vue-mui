var vm = new Vue({
	el: '#main',
	data: {
		item: {},
		user: {},
		isrep: false,
		logo:'',
	}
})

mui.ready(function() {

	mui.plusReady(function() {

		var web = plus.webview.currentWebview();
		var id = web.cid;
		console.log('id',id);
		console.log('uid',web.uid);
		console.log(plus.storage.getItem('token'));
		var user = JSON.parse(plus.storage.getItem('user'));
		var myid = user.id;

		function Company() {

			this.init = function() {
				getinfo();
				downLoad();
				goChat();
				goEvent();
				goUp();
			}

			function getinfo() {
				var datas = {
					terminalNo: '3',
					company: id,
					uid: web.uid
				}
				if(plus.storage.getItem('token')) {
					datas.token = plus.storage.getItem('token')
				}
				mui.ajax({
					url: URL.path + '/company',
					type: 'post',
					data: datas,
					//					dataType:'string',
					success: function(data) {
						//						alert(JSON.stringify(data))
						if(data.returnCode == 200) {
							//														alert(JSON.stringify(data.data))
							vm.item = data.data;
							vm.user = data.data.user;
							vm.logo = data.data.logo?data.data.logo:'static/img/avatar.png';

							if(myid == data.data.user.id) {
								vm.isrep = true;
							}
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
					error: function(xhr, type) {
						console.log(type)
					}
				})
			}

			function downLoad() {
//				mui('body').on('tap', '.homepage-c-download', function() {
//
//					var downLoadUrl = this.getAttribute('data-url');
//					if(downLoadUrl) {
//						var dtask = plus.downloader.createDownload(downLoadUrl, {}, function(d, status) {
//							// 下载完成
//							if(status == 200) {
//								//							alert("Download success: " + d.filename);
//								mui.toast('下载完成')
//							} else {
//								//							alert("Download failed: " + status);
//								mui.toast('下载失败')
//							}
//						});
//						dtask.start();
//					}
//
//				})
			}

			function goChat() {
				mui('body').on('tap', '.my-chat-btn', function() {
					var id = this.getAttribute('data-id');
					Power(function() {
						mui.openWindow({
							url: 'chat-main.html',
							id: 'chat-main.html',
							extras: {
								cid: id
							}
						})
					})

				})
			}

			function goEvent() {
				mui('body').on('tap', '.homepage-c-botbtn', function() {
					var id = this.getAttribute('data-id');
					mui.openWindow({
						url: 'homepage-company-event.html',
						id: 'homepage-company-event.html',
						extras: {
							cid: id,
							name: vm.item.short,
							uid: myid
						}
					})
				})
			}

			function goUp() {
				mui('body').on('tap', '.homepage-c-tips', function() {

					mui.confirm('是否确认请企融直通车帮助展示公司商业价值？', '确认', ['取消', '确认'], function(res) {
						if(res.index == 1) {
							mui.ajax({
						url: URL.path + '/other/combing',
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							id: id
						},
						success: function(data) {
							//							alert(JSON.stringify(data))
							if(data.returnCode == 200) {
								// alert(JSON.stringify(data))
								mui.toast(data.msg)
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(data.msg)
								}
							}
						},
						error: function(xhr, type) {
							console.log(type)
						}
					})
						}
					}, 'div')

					
				})
			}

		}

		var company = new Company();
		company.init();
	})

})