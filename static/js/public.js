//正式
//<<<<<<< HEAD
window.URL = {
	path: 'http://www.qironghome.com/api/index.php', 
	path2: 'http://www.qironghome.com/index.php', //不用授权的接口地址
	path3: 'http://www.qironghome.com/index.php/app/' //h5分享页面的地址

// 	path: 'http://47.93.63.26/zbq/web/api/index.php', //接口地址
// 	path2: 'http://47.93.63.26/zbq/web/index.php', //不用授权的接口地址
// 	path3: 'http://47.93.63.26/zbq/web/index.php/app/' //h5分享页面的地址	
   	
// 	path: 'http://test.qironghome.com/zbq/web/api/index.php', //接口地址
// 	path2: 'http://test.qironghome.com/zbq/web/index.php', //不用授权的接口地址
// 	path3: 'http://test.qironghome.com/zbq/web/index.php/app/' //h5分享页面的地址	2
   	
// 	path: 'http://192.168.2.61/zbq/web/api/index.php', //接口地址
//  path2: 'http://192.168.2.61/zbq/web/index.php', //不用授权的接口地址
//  path3: 'http://192.168.2.61/zbq/web/index.php/app/' //h5分享页面的地址
}

//测试
//window.URL = {
//	path: 'http://xjw.hzboc.com/NewZbq/web/api/index.php', //接口地址
//	path2: 'http://xjw.hzboc.com/NewZbq/web/index.php', //不用授权的接口地址
//	path3: 'http://xjw.hzboc.com/NewZbq/web/index.php/app/' //h5分享页面的地址
//}


function set_font() {
	// 计算、转换布局单位
	var html = document.getElementsByTagName('html')[0];
	var designFontSize = 100,
		designWidth = 750;

	function setFontSize() {
		var winWidth = document.documentElement.getBoundingClientRect().width;
		var fontSize = winWidth / designWidth * designFontSize;

		html.style.fontSize = fontSize + 'px';
	}
	setFontSize();
	window.addEventListener('resize', function() {

		setFontSize();
	});

	return this;
}
set_font();

function GO(name, opt, showtpye) { //跳转
	var show = 'slide-in-right';
	if(showtpye) {
		show = "slide-in-up"
	}
	mui.openWindow({
		url: name + '.html',
		id: name + '.html',
		extras: opt,
		show: {
			aniShow: show
		}
	})
}

//function isLogin() {
//	if(plus.storage.getItem('token')) {
//		return false;
//	} else {
//		mui.toast('您还未登录');
//
//		//清空设备信息
//		plus.storage.setItem('deviceToken', '');
//
//		return true;
//	}
//}

function BackLogin(id) { //跳转登录页面
	mui.openWindow({
		url: 'signin.html',
		id: 'signin.html',
		extras: {
			webid: id
		}
	})
}

function unLoginComfirm(id) { //num==2 不能返回  1能返回
	var str = '';
	if(plus.storage.getItem('token')) {
		str = '您的账号异常，请重新登录'
	} else {
		str = '您还未登录'
	}
	mui.confirm(str, '确认', ['去登录', '取消'], function(res) {
		if(res.index == 0) {
			BackLogin(id)
		}
	});

	//清空设备信息
	plus.storage.setItem('deviceToken', '');
}

function LINK(url, opt, login, islog) {
	if(login) {
		if(islog) { //vm.islog： vue中是否登录
			GO(url, opt)
		} else {
			mui.toast('请先登录')
		}
		//清空设备信息
		plus.storage.setItem('deviceToken', '');
	} else {
		GO(url, opt);
	}
}

function BindLink(name, url, opt) {
	//name:被绑定的dom id   url:跳转页面名字   login: 是否启用判断登录条件  opt:带参  islog:登录判断条件
	document.getElementById(name).addEventListener('tap', function() {
		GO(url, opt)
	});
}

//	function OnLink(parent,name,url,opt){
//		mui(parent).on('tap',name,function(){
//			GO(url,opt)
//		})
//	}

function getId(ctype) {
	//alert(ctype)
	switch(ctype) {
		case '1':
			return '企业';
			break;
		case '2':
			return '投资机构';
			break;
		case '3':
			return '合格投资人';
			break;
		case '4':
			return '咨询机构';
			break;
		case '5':
			return '券商研究员';
			break;
		case '6':
			return '新三板做市商';
			break;
	}
}

mui.plusReady(function() {
	mui('body').on('tap', '.personal', function(e) {
		e.stopPropagation()
		var id = this.getAttribute('data-id');
		if(!id) {
			mui.toast('没有该用户id');
			return;
		}
		mui.openWindow({
			url: 'homepage-personal.html',
			id: 'homepage-personal.html',
			extras: {
				rid: id
			}
		})
		//		var nwaiting = plus.nativeUI.showWaiting();
		//		var webviewShow = plus.webview.create('homepage-personal.html', 'homepage-personal.html', {
		//			top: '0px',
		//			bottom: '0px'
		//		}, {
		//			rid: id
		//		});
	})

	//app到前台清空红点信息
	document.addEventListener("resume", function(){
		plus.runtime.setBadgeNumber( 0 );
	}, false);

});

function addNav(index, active) {
	var navbox = document.getElementById("nav");
	var div = document.createElement('div');
	if(document.querySelector(".nav-box")) {
		document.querySelector(".nav-box").remove()
	}
	div.className = 'nav-box';
	var html = '';
	if(index == 0) {
		html += '<a id="nav_home" class="nav-bar-list mui-active" style="color:#4cb6ff;background-color:#f5f5f5;">';
	} else {
		html += '<a id="nav_home" class="nav-bar-list">';
	}

	html += '<span class="mui-icon nav-icon-home"></span>';
	html += '<span class="mui-tab-label">首页</span>';
	html += '</a>';
	if(index == 1) {
		html += '<a class="nav-bar-list  mui-active" id="nav_circle" style="color:#4cb6ff;background-color:#f5f5f5;">';
	} else {
		html += '<a class="nav-bar-list" id="nav_circle">';
	}

	html += '<span class="mui-icon nav-icon-circle"></span>';
	html += '<span class="mui-tab-label">圈子</span>';
	html += '</a>';
	if(index == 2) {
		html += '<a class="nav-bar-list mui-active" id="nav_demand" style="color:#4cb6ff;background-color:#f5f5f5;">';
	} else {
		html += '<a class="nav-bar-list" id="nav_demand">';
	}

	html += '<span class="mui-icon nav-icon-demand"></span>';
	html += '<span class="mui-tab-label">需求</span>';
	html += '</a>';
	if(index == 3) {
		html += '<a class="nav-bar-list mui-active" id="nav_my" style="color:#4cb6ff;background-color:#f5f5f5;">';
	} else {
		html += '<a class="nav-bar-list" id="nav_my">';
	}
	if(active&&index == 3) {
		html += '<span class="nav-icon-my-active"></span>'
	}
	html += '<span class="mui-icon nav-icon-my"></span>';
	html += '<span class="mui-tab-label">我的</span>';
	html += '</a>';
	div.innerHTML = html;
	navbox.appendChild(div);
}

function startTime() { //开始计算在线时间

	var now = new Date();
	var stime = now.getTime();
	stime = stime.toString();
	plus.storage.setItem('startTime', stime);
	plus.storage.setItem('isTimeSubmit', '1'); //isTimeSubmit  是否可以提交在线时间 1：可以  0：不可以
}

function endTime() { //结束计算在线时间
	var now = new Date();
	var etime = now.getTime();
	var stime = plus.storage.getItem('startTime');
	var time = etime - stime;
	var isTimeSubmit = plus.storage.getItem('isTimeSubmit');
	if(isTimeSubmit == '1') {
		//		alert(time);
		var min = time / 6000;
		mui.ajax({
			url: URL.path + '/account/activity',
			type: 'post',
			data: {
				token: plus.storage.getItem('token'),
				terminalNo: '3',
				time: min
			}
		})
		plus.storage.setItem('isTimeSubmit', '0');
	}
}

//关闭指定页面
function close_page(page, none) {
	if(!none) none = 'none';
	// 获取所有Webview窗口
	var wvs = plus.webview.all();
	for(var i = 0, len = wvs.length; i < len; i++) {
		if(wvs[i].id == page) {
			plus.webview.close(wvs[i], none);
		}
	}
}

//刷新指定页面
function load_page(page) {
	// 获取所有Webview窗口
	var wvs = plus.webview.all();
	for(var i = 0, len = wvs.length; i < len; i++) {
		if(wvs[i].id == page) {
			wvs[i].reload('none');
		}
	}
}

function Power(callback) {
	if(!plus.storage.getItem('token')) {
		mui.toast('您还未登录');
		return;
	}
	mui.ajax({
		url: URL.path + '/other/power',
		type: 'post',
		data: {
			token: plus.storage.getItem('token'),
			terminalNo: '3'
		},
		success: function(data) {

			if(data.returnCode == 200) {
				callback();
			} else {
				if(data.returnCode == 401){
					mui.toast('请登录')
				}else{
					mui.toast(data.msg)
				}
			}
		}
	})
}
//
//function isActive(){
//	var user = plus.storage.getItem('user')
//	if(!user){
//		return;
//	}
//	mui.ajax({
//		url:URL.path + '/account/new_friend_fans',
//		type:'post',
//		data:{
//			terminalNo:'3',
//			phones:user.phone,
//
//		}
//	})
//}

//上传推送标识

document.addEventListener("plusready", function() {

	//登陆状态判断device是否为空
	if(!plus.storage.getItem('deviceToken')&&plus.storage.getItem('token')) {
		getPushInfo();
	}

}, false);

function getPushInfo(fun) {
	var info = plus.push.getClientInfo();

	var timeBox = setInterval(function() {
		if(info.clientid&&info.token) {
			var msg = "token: " + info.token;
			msg += "clientid: " + info.clientid;
			msg += "appid: " + info.appid;
			msg += "appkey: " + info.appkey;

//			mui.toast(msg);

			upPush(function(){
				if(typeof fun === 'function') return fun();
			});

			clearInterval(timeBox);
		}
	}, 1000);
}

function upPush(fun) {
	var info = plus.push.getClientInfo();

	mui.ajax({
		url: URL.path + '/account/devicetoken',
		type: 'post',
		dataType: 'json',
		data: {
			token: plus.storage.getItem('token'),
			devicetoken: info.token,
			devicecid: info.clientid
		},
		success: function(res) {
			if(res.returnCode == '200') {
//				mui.toast(res.msg);

				plus.storage.setItem('deviceToken', 'true');
			}
			if(typeof fun === 'function') return fun();
		}
	});
}

//重新升级安装，重新登录
//document.addEventListener("plusready", function() {
//	var version = plus.runtime.version;
//
//	//判断当前是否最新安装
//	if(!plus.storage.getItem('version')){
//		plus.storage.setItem('version',version);
//	}else{
//		//判断与当前版本是否相同
//		if(version!=plus.storage.getItem('version')){
//			plus.storage.setItem('version',version);
//			//清空登录信息
//			plus.storage.removeItem('token');
//		}
//	}
//});
