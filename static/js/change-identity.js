mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			changeType: '33', //1公司名称变更  2工作单位变更
			company: '',
			companyfull: '',
			identity: '1',
			name: '',
			job: '',
			imgid: '',
			img: '',
			ctype: '',
			companyBoxShow: false,
			companyList: [],
		},
		methods: {
			companySearch: function() {
				var _this = this;
				if(this.ctype == 1 && this.changeType == 34 && this.identity == 1) {
					if(!this.company) {
						this.companyBoxShow = false;
					}
					mui.ajax({
						url: URL.path + '/other/company',
						type: 'post',
						data: {
							kw: _this.company,
							terminalNo: '3'
						},
						success: function(data) {
							if(data.returnCode == 200) {
								//					alert(JSON.stringify(data.data))
//								console.log(vm.company)
								if(data.data.length != 0) {
									_this.companyBoxShow = true;
									_this.companyfull = '';
								} else {
									_this.companyBoxShow = false;
								}
								_this.companyList = data.data;
								document.querySelector(".companyFull").readOnly = false;
							}
						},
						error: function(xhr, type) {
							console.log(type)
						}
					})
				}
			},
			selectCompany: function(params) {
				this.companyfull = this.companyList[params.index].name;
				this.company = this.companyList[params.index].short;
				this.companyBoxShow = false;
				//					this.stock = this.companyList[params.index].stock_code;
				document.querySelector(".companyFull").readOnly = true;
			}
		}
	})

	mui.plusReady(function() {

		var web = plus.webview.currentWebview();
		document.querySelector(".change-name").innerHTML = web.name;
		vm.ctype = web.ctype;

		function Change() {
			this.init = function() {
				//upload(); //上传图片
				deleteImg(); //删除图片
				sub(); //提交
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
			//							vm.img = data.data.url;
			//							vm.imgid = data.data.id;
			//							vm.$nextTick(function() {
			//								mui.previewImage();
			//							})
			//						},
			//						error: function(xhr, type, errorThrown) {
			//							alert(type);
			//						}
			//					});
			//
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
								vm.img = res.data.url;
								vm.imgid = res.data.id;
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

			function deleteImg() {
				mui('body').on('tap', '#delete', function(e) {
					e.stopPropagation;
					vm.img = '';
					vm.imgid = '';
				})
			}

			function sub() {
				mui('body').on('tap', '.my-save', function() {
					if(!vm.companyfull) {
						mui.toast('请输入变更公司全称');
						return;
					}
					if(!vm.company) {
						mui.toast('请输入变更公司简称');
						return;
					}
					if(vm.changeType == '34') {
						if(!vm.job) {
							mui.toast('请输入职位');
							return;
						}
					}
					if(!vm.imgid) {
						mui.toast('请上传名片');
						return;
					}
					mui.ajax({
						url: URL.path + '/account/identity',
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							terminalNo: '3',
							ctype: vm.changeType,
							com_name: vm.companyfull,
							com_short: vm.company,
							photo: vm.imgid,
							actype: vm.identity,
							//uname: vm.name,
							position: vm.job
						},
						success: function(data) {
							if(data.returnCode == 200) {
								mui.toast('已提交变更身份申请');
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
							//							alert(1)
							//异常处理；
							console.log(type);
						}

					})
				})
			}
		}

		var change = new Change();
		change.init();
	})
})