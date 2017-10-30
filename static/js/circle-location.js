var vm = new Vue({
	el: '#main',
	data: {
		page: 1,
		addr: [],
		lat: '',
		lon: '',
		keyword: '',
		check: 0,
		hascheckdata: {}
	},
	methods: {
		checked: function(params) {
			this.check = params.index;
			this.hascheckdata = this.addr[params.index]; //储存选中的数据
			var view = plus.webview.currentWebview().opener();
			mui.fire(view, 'doit', {
				data: this.hascheckdata
			});
			mui.back();
		},
		unchecked: function() {
			var view = plus.webview.currentWebview().opener();
			mui.fire(view, 'doit', {
				data: null
			});
			mui.back();
		}
	}
})

mui.init({
	//	pullRefresh: {
	//		container: '#pullrefresh', //待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
	//		up: {
	//			contentrefresh: "正在加载...", //可选，正在加载状态时，上拉加载控件上显示的标题内容
	//			contentnomore: '没有更多数据了', //可选，请求完毕若没有更多数据时显示的提醒内容；
	//			callback: alaxloction //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
	//		}
	//	}
})
mui('#pullrefresh').pullToRefresh({
	up: {
		callback: alaxloction,
		contentrefresh: "正在加载...",
		contentnomore: '没有更多数据了',
	}
})

mui.ready(function() {

	//	document.getElementById("search").addEventListener('keydown', function(e) {
	//		if(e.keyCode == 13) {
	//			this.blur();
	//			vm.keyword = this.value;
	//			vm.page = 1;
	//			vm.addr = []
	//			alaxloction();
	//		}
	//	})

	mui('body').on('tap', '.circle-hot-search-btn', function() {
		if(!vm.keyword) {
			return;
		}
		document.getElementById("search").blur();
		vm.page = 1;
		vm.addr = [];
		alaxloction();
	})

	mui.plusReady(function() {
		var data = plus.webview.currentWebview();
		if(data.addr) {
			vm.addr.splice(0, 0, data.addr);
		}

		var currentView = plus.webview.currentWebview();
		currentView.show('slide-in-right', 300);
		plus.nativeUI.closeWaiting();

		var deceleration = mui.os.ios ? 0.003 : 0.0009;

		mui('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true, //是否显示滚动条
			deceleration: deceleration
		});

		plus.geolocation.getCurrentPosition(function(p) {
			vm.lat = p.coords.latitude;
			vm.lon = p.coords.longitude;
			alaxloction();
			//alert( "Geolocation\nLatitude:" + p.coords.latitude + "\nLongitude:" + p.coords.longitude + "\nAltitude:" + p.coords.altitude );
		}, function(e) {
			//alert("Geolocation error: " + e.message);
		});

	})

})

function alaxloction() {
	var _this = this;
	mui.ajax({
		url: URL.path + '/circle/getlocation',
		type: 'post',
		data: {
			location: vm.lon + ',' + vm.lat,
			page: vm.page,
			keyword: vm.keyword ? vm.keyword : '',
			token: plus.storage.getItem('token')
		},
		success: function(data) {
			if(data.returnCode == 200) {
				vm.addr = vm.addr.concat(data.data);
				if(vm.page == 1) {

				}
				if(data.data.length == 0) {
					mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
				} else {
					vm.page++;
					mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(false);
				}
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