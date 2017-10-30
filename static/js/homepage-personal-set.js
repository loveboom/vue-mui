mui.ready(function() {
	var deepCopy = function(source) { //深度复制数组
		var result;
		(source instanceof Array) ? (result = []) : (result = {});

		for(var key in source) {
			result[key] = (typeof source[key] === 'object') ? deepCopy(source[key]) : source[key];
		}
		return result;
	}

	var vm = new Vue({
		el: '#main',
		data: {
			avatar: 'static/img/avatar.png',
			uname: '',
			concerns: 0,
			fans: 0,
			activity: 0,
			reward: 0,
			position: '',
			company: '',
			profile: '',
			cprofile: '',
			ctype: '',
			board: '',
			avatarid: '',
			zan_money: '',
			companyTags: [],
			enterprises: [], //已投项目 
			data1: [], //需求标签弹窗
			data2: [], //感兴趣弹窗
			data3: [], //所在行业弹窗
			data4: [], //投资阶段弹窗
			data5: {}, //单个项目投资规模弹窗
			data6: [], //擅长领域弹窗
			dataVirtual1: [], //虚拟数据，用于展示
			dataVirtual2: [],
			dataVirtual3: [],
			dataVirtual4: [],
			dataVirtual5: {},
			dataVirtual6: [],
			show1: false,
			show2: false,
			show3: false,
			show4: false,
			show5: false,
			show6: false,
		},
		computed: {
			identity: function() {
				return getId(this.ctype);
			},
			boardcn: function() {
				if(this.board == 1) {
					return '是'
				} else {
					return '否'
				}
			}
		},
		methods: {
			showdata1: function() {
				this.show1 = true;
			},
			showdata2: function() {
				this.show2 = true;
			},
			showdata3: function() {
				this.show3 = true;
			},
			showdata4: function() {
				this.show4 = true;
			},
			showdata5: function() {
				this.show5 = true;
			},
			showdata6: function() {
				this.show6 = true;
			},
			hideall: function() {
				this.show1 = false; //窗口关闭
				this.show2 = false;
				this.show3 = false;
				this.show4 = false;
				this.show5 = false;
				this.show6 = false;
			},
			closeall: function() {
				//alert(JSON.stringify(this.data2))
				this.hideall();
				this.dataVirtual1 = deepCopy(this.data1); //虚拟展示数据变为原始数据
				this.dataVirtual2 = deepCopy(this.data2);
				this.dataVirtual3 = deepCopy(this.data3);
				this.dataVirtual4 = deepCopy(this.data4);
				this.dataVirtual5 = deepCopy(this.data5);
				this.dataVirtual6 = deepCopy(this.data6);
			},
			save: function() {
				this.hideall();
				this.data1 = deepCopy(this.dataVirtual1);
				this.data2 = deepCopy(this.dataVirtual2);
				this.data3 = deepCopy(this.dataVirtual3);
				this.data4 = deepCopy(this.dataVirtual4);
				this.data5 = deepCopy(this.dataVirtual5);
				this.data6 = deepCopy(this.dataVirtual6);
			},
			selected1: function(params) {
				if(this.dataVirtual1[params.index].is_select == 0) {
					this.dataVirtual1[params.index].is_select = 1;
				} else {
					this.dataVirtual1[params.index].is_select = 0;
				}
			},
			selected2: function(params) {
				if(this.dataVirtual2[params.index].is_select == 0) {
					this.dataVirtual2[params.index].is_select = 1;
				} else {
					this.dataVirtual2[params.index].is_select = 0;
				}
			},
			selected3: function(params) {
				if(this.dataVirtual3[params.index].is_select == 0) {
					this.dataVirtual3[params.index].is_select = 1;
				} else {
					this.dataVirtual3[params.index].is_select = 0;
				}
			},
			selected4: function(params) {
				if(this.dataVirtual4[params.index].is_select == 0) {
					this.dataVirtual4[params.index].is_select = 1;
				} else {
					this.dataVirtual4[params.index].is_select = 0;
				}
			},
			selected5: function(params) {
				for(var i in this.dataVirtual5) {
					if(i == params.index) {
						this.dataVirtual5[i].is_select = 1;
					} else {
						this.dataVirtual5[i].is_select = 0;
					}
				}
			},
			selected6: function(params) {
				for(var i in this.dataVirtual6) {
					if(i == params.index) {
						this.dataVirtual6[i].is_select = 1;
					} else {
						this.dataVirtual6[i].is_select = 0;
					}
				}
			}
		}
	})
	mui.plusReady(function() {
		var old_back = mui.back;
		mui.back = function() {
			var my = plus.webview.getWebviewById('homepage-personal.html');
			mui.fire(my, 'reload');
			old_back();
		}

		function Set() {
			this.init = function() {
				info();
				//ajaxtags();
				sub();
				addProject();
				//				upload();
			}

			function info() { //加载个人信息
				mui.ajax({
					url: URL.path + '/account/info',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3'
					},
					success: function(data) {
						if(data.returnCode == 200) {
							//							alert(JSON.stringify(data.data)) 
							vm.ctype = data.data.ctype;
							vm.uname = data.data.uname;
							vm.avatar = data.data.photo ? data.data.photo.url : 'static/img/avatar.png';
							vm.concerns = data.data.concerns;
							vm.fans = data.data.fans;
							vm.activity = data.data.activity;
							vm.reward = data.data.reward;
							vm.position = data.data.position;
							vm.company = data.data.company;
							vm.profile = data.data.info.profile;
							vm.cprofile = data.data.info.cprofile;
							vm.board = data.data.board;
							vm.enterprises = data.data.info.enterprises ? toarr(data.data.info.enterprises) : [];
							vm.companyTags = data.data.info.industry;
							vm.zan_money = data.data.zan_money;
							//							alert(vm.profile)
							vm.$nextTick(function() {
//								if(vm.ctype == 1) {
//									document.getElementById("company_text").disabled = true;
//								}
								mui('.mui-scroll-wrapper').scroll({
									deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
								});
								link();
							})

							ajaxtags(); //加载标签

						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg)
							}
						}
					},
					error: function(xhr, type) {
						console.log(type)
					}
				})
			}

			function ajaxtags() { //加载标签
				mui.ajax({
					url: URL.path + '/account/other',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3'
					},
					success: function(data) {
						if(data.returnCode == 200) {
							//alert(JSON.stringify(data))
							if(vm.ctype == 1) {
								vm.data1 = deepCopy(data.data.tags);
								vm.dataVirtual1 = deepCopy(data.data.tags);

								vm.data3 = deepCopy(data.data.industry);
								vm.dataVirtual3 = deepCopy(data.data.industry);
							}
							if(vm.ctype == 2) {
								vm.data2 = deepCopy(data.data.interested);
								vm.dataVirtual2 = deepCopy(data.data.interested);

								vm.data4 = deepCopy(data.data.fund_stage);
								vm.dataVirtual4 = deepCopy(data.data.fund_stage);

								vm.data5 = deepCopy(data.data.single_project);
								vm.dataVirtual5 = deepCopy(data.data.single_project);

							}
							if(vm.ctype == 3) {
								vm.data2 = deepCopy(data.data.interested);
								vm.dataVirtual2 = deepCopy(data.data.interested);

								vm.data3 = deepCopy(data.data.industry);
								vm.dataVirtual3 = deepCopy(data.data.industry);

							}
							if(vm.ctype == 4 || vm.ctype == 5) {
								vm.data2 = deepCopy(data.data.interested);
								vm.dataVirtual2 = deepCopy(data.data.interested);

								vm.data6 = deepCopy(data.data.good_industry);
								vm.dataVirtual6 = deepCopy(data.data.good_industry);
							}
							if(vm.ctype == 6) {
								vm.data2 = deepCopy(data.data.interested);
								vm.dataVirtual2 = deepCopy(data.data.interested);
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

			function sub() {
				mui('body').on('tap', '.my-save', function() {
					if(vm.ctype == 2) {
						if(getSelected(vm.data2).length == 0) {
							mui.toast('感兴趣行业不能为空');
							return;
						}
					}
					if(vm.ctype == 3) {
						if(getSelected(vm.data2).length == 0) {
							mui.toast('感兴趣行业不能为空');
							return;
						}
						if(getSelected(vm.data3).length == 0) {
							mui.toast('所在行业不能为空');
							return;
						}
					}
					if(vm.ctype == 4 || vm.ctype == 5) {
						if(getSelected(vm.data2).length == 0) {
							mui.toast('感兴趣行业不能为空');
							return;
						}
						if(getSelected(vm.data6).length == 0) {
							mui.toast('擅长行业不能为空');
							return;
						}
					}
					if(vm.ctype == 6) {
						if(getSelected(vm.data2).length == 0) {
							mui.toast('感兴趣行业不能为空');
							return;
						}
					}
					var datas = {
						token: plus.storage.getItem('token'),
						terminalNo: '3'
					}
					if(vm.ctype == 1) {
						datas.profile = vm.profile;
						datas.tags = cut(vm.data1);
					}
					if(vm.ctype == 2) {
						datas.interested = cut(vm.data2);
						datas.fund_stage = cut(vm.data4);
						datas.single_project = cut(vm.data5);
						datas.profile = vm.profile;
						datas.cprofile = vm.cprofile;
						var projectArr = [];
						mui(".my-project-li-input").each(function() {
							if(this.value) {
								projectArr.push(this.value);
							}

						})
						var projectJson = tojson(projectArr);
						datas.enterprises = projectJson;
					}
					if(vm.ctype == 3) {
						datas.interested = cut(vm.data2);
						datas.industry = cut(vm.data3);
						datas.profile = vm.profile;
						datas.board = vm.board;
					}
					if(vm.ctype == 4 || vm.ctype == 5) {
						datas.interested = cut(vm.data2);
						datas.good_industry = cut(vm.data6);
						var projectArr = [];
						mui(".my-project-li-input").each(function() {
							if(this.value) {
								projectArr.push(this.value);
							}
						})
						var projectJson = tojson(projectArr);
						datas.enterprises = projectJson;
						datas.profile = vm.profile;
						datas.cprofile = vm.cprofile;
					}
					if(vm.ctype == 6) {
						datas.interested = cut(vm.data2);
						var projectArr = [];
						mui(".my-project-li-input").each(function() {
							if(this.value) {
								projectArr.push(this.value);
							}
						})
						var projectJson = tojson(projectArr);
						datas.enterprises = projectJson;
						datas.profile = vm.profile;
						datas.cprofile = vm.cprofile;
					}
					//					alert(JSON.stringify(projectJson.length))   
					//					if(projectJson.length){
					//								alert(2)
					//								alert(projectJson.length)
					//					}else{ 
					//						alert(1) 
					//					} 
					//					datas.enterprises = ''; 
					mui.ajax({
						url: URL.path + '/account/edit',
						type: 'post',
						data: datas,
						//						dataType:'string',
						success: function(data) {
							//							alert(JSON.stringify(data))
							if(data.returnCode == 200) {
								var list = plus.webview.currentWebview().opener();
								var my = plus.webview.getWebviewById('my.html');
								//								list.reload(true);
								//								my.reload(true);   
								mui.back();
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(data.msg)
								}
							}
						},
						error: function(xhr, type, errorThrown) {
							//异常处理；
							console.log(type);
						}
					})
				})
			}

			function cut(arr) { //选取选中数组，并拼接成字符串			
				return getSelected(arr).join(',')
			}

			function getSelected(arr) { //选取选中数组
				var newArr = [];
				arr.forEach(function(array, index) {
					if(array.is_select == 1) {
						newArr.push(array.id)
					}
				})
				return newArr
			}

			function toarr(json) { //json 转字符串
				var arr = [];
				for(var key in json) {
					arr.push(json[key]);
				}
				return arr;
			}

			function tojson(arr) { //数组转json
				var json = {}
				for(var i in arr) {
					i++;
					json[i] = arr[i - 1]
				}
				return json;
			}

			function link() { //个人身份变更跳转
				mui('body').on('tap', '#idchange', function() {
					mui.openWindow({
						url: 'change-identity.html',
						id: 'change-identity.html',
						extras: {
							name: vm.uname,
							ctype: vm.ctype
						}
					})
				})
			}

			function addProject() {
				mui('body').on('tap', '#add_project', function() {
					var li = document.createElement('li');
					li.className = 'my-project-li';
					li.innerHTML = '<input type="text" value="" class="my-project-li-input" /><div class="mui-icon mui-icon-closeempty my-project-li-delete"></div>';
					document.querySelector(".my-project-ul").appendChild(li);
				})

				mui('body').on('tap', '.my-project-li-delete', function() {
					this.parentNode.remove();
				})
			}

			//			function upload() {
			//				mui("body").on('change', '#upload', function(e) { //上传图片
			//					var form = document.getElementById("formData")
			//					var myForm = new FormData(form);
			//					$.ajax({
			//						type: "post",
			//						url: URL.path + '/upload/photo',
			//						data: myForm,
			//						async: false,
			//						cache: false,
			//						contentType: false,
			//						processData: false,
			//						success: function(data) {
			//							//alert(JSON.stringify(data))	
			//
			//							vm.avatar = data.data.url;
			//							vm.avatarid = data.data.id;
			//							changeava(data.data.id)
			//						},
			//						error: function(xhr, type, errorThrown) {
			//							alert(type);
			//						}
			//					});
			//				})
			//			}
			function upImg(othis) {
				//var container = mui(".form-img > p");
				
				var uploader = new plupload.Uploader({
					runtimes: 'html5',
					browse_button: othis, // you can pass in id...
					url: URL.path + '/upload/photo',
					file_data_name: 'upload_file',
					multipart_params: {
						terminalNo: '3'
					},
					resize: {
						width: '640'
					},
					filters: {
						//                        max_file_size: '5mb', //最大上传文件大小（格式100b, 10kb, 10mb, 1gb）
						mime_types: [ //允许文件上传类型
							{
								title: "files",
								extensions: "png,bmp,gif,jpg,jpeg"
							}
						]
					},
					multi_selection: true, //true:ctrl多文件上传, false 单文件上传
					init: {
						PostInit: function() {

						},
						FilesAdded: function(up, files) {

							//上传文件
							uploader.start();
							//							container.progressbar({
							//								progress: 0
							//							}).show();

						},
						UploadProgress: function(up, file) { //上传中，显示进度条
							var percent = file.percent;
							//						container.progressbar().setProgress(percent);
							//						if(percent == 100) {
							//							container.progressbar().hide();
							//						}
						},
						FileUploaded: function(up, file, info) { //文件上传成功的时候触发 
							var res = JSON.parse(info.response);
							//							alert(info.response) 
							if(res.returnCode == '200') {
								console.log(res);
								//vm.img.push(res.data);
								vm.avatar = res.data.url;
								vm.avatarid = res.data.id;
								changeava(res.data.id);
							} else if(res.returnCode == '401') {
								unLoginComfirm();
							}
						},
						Error: function(up, err) { //上传出错的时候触发
							//alert(err)
						}
					}
				});
				//在实例对象上调用init()方法进行初始化
				uploader.init();
			};
			upImg(document.getElementById("upload"));
			//console.log(upImg)
			
//			mui('body').on('tap','#upload',function(){
//				alert(1)
//			})

			function changeava(photo) {
				mui.ajax({
					url: URL.path + '/account/editPhoto',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						terminalNo: '3',
						photo: photo
					}
				})
			}
		}

		var set = new Set();
		set.init();

		//BindLink('idchange', 'change-identity',{name:}); 

	})

})