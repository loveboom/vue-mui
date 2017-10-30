mui.ready(function() {
	var vm = new Vue({
		el: '#main',
		data: {
			ctype: '',
			list1: [], //所在行业
			list2: [], //需求标签
			list3: [], //投资阶段
			list4: [], //单个项目投资规模（单选）
			list5: [], //感兴趣行业
			list6: [], //擅长行业（单选）
			num4: '',
			num6: '',
			board: '0',
			showBoard: false
		},
		methods: {
			selectA: function(paramA) {
				this.list1[paramA.index].check = !this.list1[paramA.index].check;
			},
			selectB: function(paramB) {

				this.list2[paramB.index].check = !this.list2[paramB.index].check;
			},
			selectC: function(paramC) {
				this.list3[paramC.index].check = !this.list3[paramC.index].check;
			},
			selectD: function(paramD) {
				this.num4 = this.list4[paramD.index].id;
			},
			selectE: function(paramE) {
				this.list5[paramE.index].check = !this.list5[paramE.index].check;
			},
			selectF: function(paramF) {
				this.num6 = this.list6[paramF.index].id;
			}
		},
		mounted: function() {
			//this.select1(0)
		}
	})

	mui.plusReady(function() {
		var web = plus.webview.currentWebview();
		vm.ctype = web.ctype;
		//alert(plus.storage.getItem('token'))

		var first = null;
		mui.back = function() {}

		plus.key.addEventListener('backbutton', function() {
			//首次按键，提示‘再按一次退出应用’
			if(!first) {
				first = new Date().getTime();
				mui.toast('请完善资料');
				setTimeout(function() {
					first = null;
				}, 1000);
			} else {
				if(new Date().getTime() - first < 1000) {
					plus.runtime.quit();
				}
			}
		}, false);

		mui.ajax({
			url: URL.path + '/other/board',
			type: 'post',
			data: {
				token: plus.storage.getItem('token')
			},
			success: function(data) {
				//	    			alert(data.returnCode)
				if(data.returnCode == 200) {
					vm.board = data.data.board;
					//	    				alert(vm.board)
					if(data.data.board == 0) {
						vm.showBoard = true;
					}
				}
			}
		})

		mui.ajax({
			url: URL.path + '/login/three',
			type: 'post',
			data: {
				token: plus.storage.getItem('token')
			},
			success: function(data) {
				if(data.returnCode == 200) {
					//   	    				alert(JSON.stringify(data.data))
					for(var i = 0; i < data.data.length; i++) {
						var datas = data.data[i];
						for(var j = 0; j < datas.length; j++) {
							datas[j]['check'] = 0;
						}
					}

					if(web.ctype == 1) {
						vm.list1 = data.data[0];
						vm.list2 = data.data[1];
					}
					if(web.ctype == 2) {
						vm.list5 = data.data[0];
						vm.list3 = data.data[1];
						vm.list4 = data.data[2];
					}
					if(web.ctype == 3) {
						vm.list1 = data.data[0];
						vm.list5 = data.data[1];
					}
					if(web.ctype == 4 || web.ctype == 5) {
						vm.list6 = data.data[0];
						vm.list5 = data.data[1];
						//alert(JSON.stringify(data.data))
					}
					if(web.ctype == 6) {
						vm.list5 = data.data[0]
					}
				} else {
					mui.confirm(data.msg)
				}
			}
		})

		//提交
		document.getElementById("sub").addEventListener('tap', function() {
			if(vm.ctype == 3 && vm.board == '0' && vm.showBoard) {
				mui.toast('请选择是否有新三板账号');
				return;
			}
			if(vm.list1.length !== 0) {
				var data1 = getdata(vm.list1);
			}
			if(vm.list2.length !== 0) {
				var data2 = getdata(vm.list2);
			}
			if(vm.list3.length !== 0) {
				var data3 = getdata(vm.list3);
			}
			if(vm.num4) {
				var data4 = vm.num4;
			}
			if(vm.list5.length !== 0) {
				var data5 = getdata(vm.list5);
			}
			if(vm.num6) {
				var data6 = vm.num6;
			}
			var subdata = {}
			subdata.token = plus.storage.getItem('token');
			if(web.ctype == 1) {
				if(mytoast(data1, 1)) {
					return;
				}
				if(mytoast(data2, 2)) {
					return;
				}
				subdata.industry = data1;
				subdata.tags = data2;
			}
			if(web.ctype == 2) {
				if(mytoast(data5, 5)) {
					return;
				}
				if(mytoast(data3, 3)) {
					return;
				}
				if(mytoast(data4, 4)) {
					return;
				}
				subdata.interested = data5;
				subdata.fund_stage = data3;
				subdata.single_project = data4;
			}
			if(web.ctype == 3) {
				if(mytoast(data1, 1)) {
					return;
				}
				if(mytoast(data5, 5)) {
					return;
				}
				subdata.industry = data1;
				subdata.interested = data5;
				subdata.board = vm.board;
			}
			if(web.ctype == 4 || web.ctype == 5) {
				if(mytoast(data6, 6)) {
					return;
				}
				if(mytoast(data5, 5)) {
					return;
				}
				subdata.good_industry = data6;
				subdata.interested = data5;
			}
			if(web.ctype == 6) {
				if(mytoast(data5, 5)) {
					return;
				}
				subdata.interested = data5;
			}
//			alert(JSON.stringify(subdata))

			mui.ajax({
				url: URL.path + '/login/success',
				type: 'post',
				data: subdata,
				// 	    			dataType:'string',
				success: function(data) {
					// alert(JSON.stringify(data))
					if(data.returnCode == 200) {
						mui.toast('信息成功完善');
						var view = plus.webview.getWebviewById('home.html');
						if(view) {
//							mui.fire(view, 'showShare');
							mui.openWindow({
								url: 'home.html',
								id: 'home.html'
							})
						} else {
							plus.storage.setItem('ShareShow','1')
							mui.openWindow({
								url: 'home.html',
								id: 'home.html',
								extras: {
//									showShare: true
								}
							})
						}

					} else {
						mui.confirm(data.msg)
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					console.log(type);
				}
			})
		})

		function getdata(arr) {
			var data = [];
			arr.forEach(function(value, index, array) {
				if(value.check == 1) {
					data.push(value.id)
				}
			})
			data = data.join(',');
			return data;
		}

		function mytoast(obj, num) {
			if(!obj) {
				var content = '';
				switch(num) {
					case 1:
						content = '请选择所在行业';
						break;
					case 2:
						content = '请选择需求标签';
						break;
					case 3:
						content = '请选择投资阶段';
						break;
					case 4:
						content = '请选择单个项目投资规模';
						break;
					case 5:
						content = '请选择感兴趣行业';
						break;
					case 6:
						content = '擅长行业';
						break;
				}
				mui.toast(content);
				return true;
			} else {
				return false;
			}
		}
	})
})