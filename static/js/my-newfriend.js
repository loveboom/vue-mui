mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			item: [],
			keywords: '',
			phones: ''
		}
	})

	mui.plusReady(function() {
//		alert(plus.storage.getItem('token')) 
		plus.storage.removeItem('phonesContacts')
		var old_back = mui.back;
		mui.back = function() {
			var my = plus.webview.getWebviewById('my.html');
			mui.fire(my, 'reloadFriend');
			old_back();
		}
		if(plus.storage.getItem('phonesContacts')) {
			vm.phones = plus.storage.getItem('phonesContacts');
			ajaxlist();
		} else {
			plus.contacts.getAddressBook(plus.contacts.ADDRESSBOOK_PHONE, function(addressbook) {	
				addressbook.find(["displayName", "phoneNumbers"], function(contacts) {
				console.log(JSON.stringify(contacts),'contacts');
					var arr = [];
					for(var i = 0; i < contacts.length; i++) {
						if(contacts[i].phoneNumbers.length != 0) {
							var data = contacts[i].phoneNumbers[0].value;
						}

						data = data.replace(/-/g, '')
						arr.push(data);
					}
					var phones = arr.join(',');
					vm.phones = phones;
					plus.storage.setItem('phonesContacts', phones);
//					console.log(vm.phones) 
					ajaxlist()
				}, function() {
					alert("error");
				}, {
					multiple: true
				});
			}, function(e) {
				ajaxlist();
			});
		}

		function ajaxlist() {
			console.log(vm.phones) 
			mui.ajax({
				url: URL.path + '/concern/friend',
				type: 'post',
				dataType: 'json',
				data: {
					token: plus.storage.getItem('token'),
					terminalNo: '3',
					phones: vm.phones
				},
				success: function(data) {
					if(data.returnCode == 200) {
						vm.item = data.data;
						mui('.mui-scroll-wrapper').scroll({
							deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
						});
					} else {
						if(data.returnCode == 401) {
							unLoginComfirm();
						} else {
							mui.toast(JSON.stringify(data.msg))
						}
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				}
			})
		}

		mui('#main').on('tap', '.followed', function() { //取消关注
			var box = this.parentNode;
			var id = box.getAttribute('data-id');
			var _this = this;
			mui.ajax({
				url: URL.path + '/concern/cupdate',
				type: 'post',
				data: {
					token: plus.storage.getItem('token'),
					rid: id,
					terminalNo: '3'
				},
				success: function(data) {
					if(data.returnCode == 200) {
						//alert(JSON.stringify(data));
						mui.toast('成功取消关注');
						_this.classList.remove('followed');
						_this.classList.add('unfollowed');
						_this.innerHTML = '+ 关注';
					} else {
						if(data.returnCode == 401) {
							unLoginComfirm();
						} else {
							mui.toast(JSON.stringify(data.msg))
						}
					}
				}
			})
		})

		mui('#main').on('tap', '.unfollowed', function() { //添加关注
			var box = this.parentNode;
			var id = box.getAttribute('data-id');
			var _this = this;
			mui.ajax({
				url: URL.path + '/concern/cupdate',
				type: 'post',
				data: {
					token: plus.storage.getItem('token'),
					rid: id,
					terminalNo: '3'
				},
				success: function(data) {
					if(data.returnCode == 200) {
						//alert(JSON.stringify(data));
						mui.toast('成功添加关注');
						_this.classList.remove('unfollowed');
						_this.classList.add('followed');
						_this.innerHTML = '已关注';
					} else {
						if(data.returnCode == 401) {
							unLoginComfirm();
						} else {
							mui.toast(JSON.stringify(data.msg))
						}
					}
				}
			})
		})

		mui('#main').on('tap', '.my-follow-user', function() { //跳转个人主页
			var box = this.parentNode;
			var id = box.getAttribute('data-id');
			mui.openWindow({
				url: 'homepage-personal.html',
				id: 'homepage-personal.html',
				extras: {
					rid: id
				}
			})
		})

		mui('body').on('tap', '.my-newfriend-search-btn', function(e) {

			if(vm.keywords) {
				//					alert(vm.keywords)
				mui.ajax({
					url: URL.path + '/concern/friendsKw',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						kw: vm.keywords
					},
					success: function(data) {
						if(data.returnCode == 200) {
							//alert(JSON.stringify(data))
							vm.item = data.data;
							document.querySelector(".circle-hot-search-input").blur();
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

		})

	})
})