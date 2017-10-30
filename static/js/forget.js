var vm = new Vue({
	el: '#main',
	data: {
		phone: '',
		code: '',
		time: 60,
		isget: true
	}
})

mui.ready(function() {
	var phone = /^1[34578]\d{9}$/;
	mui('body').on('tap', '.sign-get', function() {
		if(!vm.phone) {
			mui.toast('请输入手机号码');
			return;
		}
		if(!phone.test(vm.phone)) {
				mui.toast('手机号格式有误');
				return;
			}
		if(!vm.isget) {
			return;
		}
		var _this = this;
		mui.ajax({
			type: "post",
			url: URL.path + '/regist/smsCode',
			data: {
				phone: vm.phone,
				forget: '1'
			},
			success: function(data) {
//				 alert(JSON.stringify(data));
				if(data.returnCode == 200) {
					vm.isget = false;
					var countDown = setInterval(function() {
						vm.time--;
						if(vm.time == 0) {
							vm.isget = true;
							vm.time = 60;
							_this.innerHTML = '获取验证码';
							clearInterval(countDown);
						} else {
							_this.innerHTML = vm.time + 's再次获得';
						}
					}, 1000)
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

	mui('body').on('tap', '#sub',function(){
		if(!vm.phone) {
			mui.toast('请输入手机号码');
			return;
		}
		if(!vm.code) {
			mui.toast('请输入短信验证码');
			return;
		}
		mui.openWindow({
			url:'reset.html',
			id:'reset.html',
			extras:{
				phone:vm.phone,
				code:vm.code
			}
		})
	})
})