document.addEventListener("plusready", function() {
	var sign = {
		ctype: 44,
		version: plus.runtime.version
	};

	if(plus.os.name == 'iOS') {
		sign.ctype = 43;
	}

	mui.ajax({
		url: URL.path + '/other/version',
		type: 'post',
		dataType: 'json',
		data: sign,
		success: function(res) {
			if(res.returnCode == '200') {

				mui.confirm(' ', '有新版本更新，是否安装', ['取消', '确认'], function(e) {
					if(e.index == 1) {
						if(plus.os.name == 'iOS') {
							plus.runtime.openURL(res.data.url);
						} else {
							mui.toast('下载开始');
							var dtask = plus.downloader.createDownload(res.data.url, {}, function(d, status) {
								if(status == 200) { // 下载成功
									var path = d.filename;

									mui.toast('下载成功');

									plus.runtime.install(path); // 安装下载的apk文件

								} else { //下载失败
									mui.toast('下载失败' + status);
								}
							});
							dtask.start();
						}
					}
				},'div');
			}
		}
	});

});