mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			content: '',
			img: [],
			imgid: [],
			check: {},
			imglength:''
		},
		methods: {
			deletes: function(parmas) {
				this.img.splice(parmas.index, 1);
				this.imgid.splice(parmas.index, 1);
			}
		}
	})

	mui.plusReady(function() {
//		var old_back = mui.back();
		mui.back = function(){
			mui.confirm('是否退出编辑','确认',['取消','确认'],function(res){
				if(res.index == 1){
					document.querySelector(".circle-publish-textarea").blur(); 
					close_page('circle-publish.html','slide-out-right'); 
				}
			},'div')
		}

		//		mui("#main").on('change', '#upload', function(e) { //上传图片
		//			var fs = this.files.length;
		//			var all = vm.img.length + fs;
		//			if(fs > 9 || all > 9) {
		//				mui.toast('上传图片数量超过限制');
		//				return;
		//			}
		//			var form = document.getElementById("formData")  
		//			var myForm = new FormData(form);
		////			var myForm = new FormData();
		//
		////			for(var i = 0; i < this.files.length; i++) {
		////				var reader = new FileReader();
		////				reader.readAsDataURL(this.files[i]);
		////				myForm.append(i, this.files[i]);　　　　　　　　　
		////			}
		//
		//			
		//			$.ajax({
		//				type: "post",
		//				url: URL.path + '/upload/photo',
		//				data: myForm,
		//				contentType: false,
		//				processData: false,
		//				success: function(data) {
		////					alert(JSON.stringify(data.data)) 
		//					vm.img.push(data.data.url);
		//					vm.imgid.push(data.data.id);
		//					vm.$nextTick(function() {
		//						mui.previewImage();
		//					});
		//					//alert(vm.img)
		//				},
		//				error: function(xhr, type, errorThrown) {
		//					alert(type);
		//				}
		//			});
		//		})
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
				multi_selection: false, //true:ctrl多文件上传, false 单文件上传
				init: {
					PostInit: function() { 

					},
					FilesAdded: function(up, files) {
						if(vm.img.length < 9) {
//							console.log(vm.img.length)
							//上传文件
							uploader.start();
//							container.progressbar({
//								progress: 0
//							}).show();
						} else {
							mui.toast('最多上传9张图片');
						}
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
						//alert(info.response)
						if(res.returnCode == '200') {
//							console.log(res);
							//vm.img.push(res.data);
							vm.img.push(res.data.url);
							vm.imgid.push(res.data.id);
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

		mui('body').on('tap', '#locations', function() {
			var nwaiting = plus.nativeUI.showWaiting();
			var webviewShow = plus.webview.create('circle-location.html', 'circle-location.html', {
				top: '0px',
				bottom: '0px'
			}, {
				addr: vm.check
			});
		})
		
		var T_publish = true;
		document.getElementById("publish").addEventListener('tap', function() { //发布
			//			alert(vm.check)
			if(!T_publish) return;
			if(!vm.content && vm.img == 0) {
				mui.toast('请输入发布内容');
				return;
			}
			T_publish = false;
			mui.ajax({
				url: URL.path + '/circle/create_circle',
				type: 'post',
				data: {
					content: vm.content,
					photos: vm.imgid.join(','),
					locations: vm.check.name ? vm.check.name : '',
					token: plus.storage.getItem('token'),
					terminalNo: '3'
				},
				success: function(data) {
					T_publish = true;
					if(data.returnCode == 200) {
						mui.toast('发布成功');
						var web = plus.webview.currentWebview().opener();
						if(web.id) {
							var wobj = plus.webview.getWebviewById(web.id);
							wobj.reload(true);
//							old_back(); 
							close_page('circle-publish.html','slide-out-right');
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
		})

	})

	window.addEventListener('doit', function(e) {　
		if(e.detail.data) {
			e.detail.data.ischeck = 1;
			vm.check = e.detail.data;
		} else {
			vm.check = ''
		}

	});
})