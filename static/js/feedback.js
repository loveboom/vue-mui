mui.ready(function() {

	

	mui('body').on('tap', '.btn', function() {
		var content = document.getElementById("content").value;
		var tel = document.getElementById("tel").value;
		if(!content) {
			mui.toast('请输入问题描述');
			return;
		}
		if(!tel) {
			mui.toast('请输入联系电话');
			return;
		}
		mui.ajax({
			url: URL.path + '/other/feedback',
			type: 'post',
			data: {
				token: plus.storage.getItem('token'),
				content: content,
				tel: tel,
				terminalNo: '3'
			},
			success: function(data) {
				if(data.returnCode == 200) {
					//alert(JSON.stringify(data))
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

})