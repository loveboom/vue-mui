mui.ready(function() {

	mui.plusReady(function() {

		var web = plus.webview.currentWebview();
		var password = /^[a-zA-Z0-9]{6,12}$/;

		mui('body').on('tap', '#sub', function() {

			var pw = document.getElementById("pw").value;
			var npw = document.getElementById("npw").value;

			if(!pw) {
				mui.toast('请输入新密码');
				return;
			}
			if(!password.test(pw)) {
				mui.toast('密码格式错误');
				return;
			}
			
			if(pw !== npw) {
				mui.toast('两次密码不一致');
				return;
			}

			mui.ajax({
				url: URL.path + '/regist/forget',
				type: 'post',
				data: {
					phone: web.phone,
					smscode: web.code,
					pwd: pw,
					repwd: npw
				},
				success: function(data) {
					//				alert(JSON.stringify(data));
					if(data.returnCode == 200) {
						mui.toast('修改成功');
						plus.webview.close('forget.html');
						plus.webview.close('reset.html');
						plus.storage.clear();
//						mui.back();
						mui.openWindow({
							url:'signin.html',
							id:'signin.html',
						})
					}else{
						mui.toast(data.msg)
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				}
			})
		})

	})

})