var shares = null;

mui.plusReady(function() {
	updateSerivces();
});

/**
 * 更新分享服务
 */
function updateSerivces() {
	plus.share.getServices(function(s) {
		shares = {};
		for(var i in s) {
			var t = s[i];
			shares[t.id] = t;
		}
//		console.log("获取分享服务列表成功");
	}, function(e) {
		mui.toast("获取分享服务列表失败：" + e.message);
	});
}

function SHARE(url, content, backcall, auto,title) {
	
	var str = "分享给好友";
	if(title){
		str = title
	}

	var shareDom = document.createElement('div');
	shareDom.innerHTML = '<div class="share-mask">\
			<div class="share-box">\
				<div class="share-content">\
					<div class="share-title"><span class="share-line"></span><span>'+str+'</span><span class="share-line"></span></div>\
					<div class="share-list">\
						<div class="share-item">\
							<div class="share-icon wx"></div>\
							<div class="share-name">微信</div>\
						</div>\
						<div class="share-item">\
							<div class="share-icon pyq"></div>\
							<div class="share-name">朋友圈</div>\
						</div>\
						<div class="share-item">\
							<div class="share-icon wb"></div>\
							<div class="share-name">微博</div>\
						</div>\
						<div class="share-item">\
							<div class="share-icon qq"></div>\
							<div class="share-name">QQ</div>\
						</div>\
					</div>\
				</div>\
				<div class="share-close"><div class="mui-icon mui-icon-closeempty"></div></div>\
			</div>\
		</div>';

	document.body.appendChild(shareDom);

	mui('body').on('tap', '.share-btn', function() {
		document.querySelector(".share-mask").classList.add('active');
	})
	if(auto) {
		document.querySelector(".share-mask").classList.add('active');
	}
	mui('body').on('tap', '.share-close', function() {
		plus.storage.removeItem('ShareShow');
		document.querySelector(".share-mask").classList.remove('active');
	})

	/**
	 * 分享操作
	 */
	function shareAction(id, ex) {
		var s = null;
		if(!id || !(s = shares[id])) {
//			mui.toast("无效的分享服务！");
			return;
		}
		if(s.authenticated) {
//			mui.toast("---已授权---");
			shareMessage(s, ex);
		} else {
//			mui.toast("---未授权---");
			s.authorize(function() {
				shareMessage(s, ex);
			}, function(e) {
//				mui.toast("认证授权失败");
			});
		}
	}
	/**
	 * 发送分享消息
	 */
	function shareMessage(s, ex) {
		var msg = {
			content: '企融直通车分享',
			href: url,
			title: content,
			thumbs: ['http://www.qironghome.com/static/app/img/120.png'],
			extra: {
				scene: ex
			}
		};

		s.send(msg, function() {
			mui.toast("分享成功!");
			document.querySelector(".share-mask").classList.remove('active');
		}, function(e) {
			mui.toast("分享失败!");
			document.querySelector(".share-mask").classList.remove('active');
		});
	}
	/**
	 * 分享按钮点击事件
	 */
	function shareHref(ind) {
		plus.storage.removeItem('ShareShow');
		var ids = [{
			id: "weixin",
			ex: "WXSceneSession" /*微信好友*/
		}, {
			id: "weixin",
			ex: "WXSceneTimeline" /*微信朋友圈*/
		}, {
			id: "qq" /*QQ好友*/
		}, {
			id: "tencentweibo" /*腾讯微博*/
		}, {
			id: "sinaweibo" /*新浪微博*/
		}];

		shareAction(ids[ind].id, ids[ind].ex);
	}

	//微信好友
	mui('body').on('tap', '.share-icon.wx', function() {
		shareHref(0);
		
	})
	//微信朋友圈
	mui('body').on('tap', '.share-icon.pyq', function() {
		shareHref(1);
	})
	//新浪微博
	mui('body').on('tap', '.share-icon.wb', function() {
		shareHref(4);
	})
	//qq好友
	mui('body').on('tap', '.share-icon.qq', function() {
		shareHref(2);
	})

}