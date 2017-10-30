mui.ready(function() {

	var vm = new Vue({
		el: '#main',
		data: {
			last: [],
			new: '',
			img: '',
			name: '',
			content: '',
			type: '',
			uid: '',
			lastimg:'',
			lastname:'',
			lastcontent:'',
			isdelete:'',
			pcontent:''
		}
	})

	mui.plusReady(function() {
		
		mui.back = function(){
//			document.querySelector("#editor").blur();
			//document.querySelector(".circle-forward-textarea").blur();
			document.querySelector("#textarea").blur();
			mui.confirm('是否退出编辑','确认',['取消','确认'],function(res){
				
				if(res.index == 1){
					close_page('circle-forward.html','slide-out-right');   
				}
			},'div')
		}

		var web = plus.webview.currentWebview();
		var token = plus.storage.getItem('token');
		vm.type = web.type;
		var forward = {
			init: function() {
				forward.getlast();
				forward.publish();
				forward.listInfo();
			},
			getlast: function() {
//				if(vm.type == '1') {
	
					mui.ajax({
						url: URL.path + '/circle/get_repeater',
						type: 'post',
						data: {
							token: token,
							terminalNo: '3',
							rid: web.cid
						},
						success: function(data) {
							if(data.returnCode == 200) {
								//alert(JSON.stringify(data.data));
								vm.last = data.data;
								forward.edit();
							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(data.msg);
								}
							}
						},
						error: function(xhr, type, errorThrown) {
							//异常处理； 
							console.log(type);
						}
					})
//				} else {
					//forward.edit();
//				}
			},
			edit: function() {
//				var editor = document.getElementById('editor');
//				//alert(editor)
//				editor.onfocus = function() {
//					window.setTimeout(function() {
//						var sel, range;
//						if(window.getSelection && document.createRange) {
//							range = document.createRange();
//							range.selectNodeContents(editor);
//							range.collapse(true);
//							range.setEnd(editor, editor.childNodes.length);
//							range.setStart(editor, editor.childNodes.length);
//							sel = window.getSelection();
//							sel.removeAllRanges();
//							sel.addRange(range);
//						} else if(document.body.createTextRange) {
//							range = document.body.createTextRange();
//							range.moveToElementText(editor);
//							range.collapse(true);
//							range.select();
//						}
//					}, 1);
//				}
//
//				mui('body').on('tap', '.forward', function() {
//					editor.focus()
//				})
			},
			publish: function() {
				document.getElementById("publish").addEventListener('tap', function() {
					if(vm.pcontent) {
						if(vm.type == 1) {
							forward.publishAjax(URL.path + '/circle/repeat_circle', {
								token: token,
								terminalNo: '3',
								rid: web.cid,
								r_content1: JSON.stringify(vm.last),
								r_content: vm.pcontent
							}, 1)
						}
						if(vm.type == 2) { 
							forward.publishAjax(URL.path + '/longarticle/repeat_larticle', {
								token: token,
								terminalNo: '3',
								tid: web.tid,
								rid: web.cid,
								r_content1: JSON.stringify(vm.last),
								r_content: vm.pcontent
							}, 2)
						}
					} else {
						mui.toast('请输入转发内容')
					}

				})
			},
			publishAjax: function(url, data, type) {
				mui.ajax({
					url: url,
					type: 'post',
					data: data,
					//dataType:'string',
					success: function(data) {
						if(data.returnCode == 200) {
							//alert(JSON.stringify(data.data))
							if(type == 1) {
								plus.webview.close('circle-info.html'); // 关闭圈子详情
							}
							if(type == 2) {
								plus.webview.close('circle-article-info.html'); // 关闭长文章详情
							}
							
							close_page('circle-forward.html','slide-out-right');
							var circlereload = plus.webview.getWebviewById('circle.html');
							mui.fire(circlereload,'reload'); 
							//plus.webview.close('circle-forward.html');
							//var wobj = plus.webview.getWebviewById("circle.html");
							//wobj.reload(true);
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
			},
			listInfo: function() {
				mui.ajax({
					url: URL.path + '/circle/get_sources',
					type:'post',
					data:{
						token:plus.storage.getItem('token'),
						terminalNo:'3',
						id:web.cid,
						ctype:web.type
					},
					success: function(data) {
						if(data.returnCode == 200) {
							vm.lastcontent = data.data.content;	
							vm.lastimg = data.data.circle_photo;
							vm.lastname = data.data.userinfo?data.data.userinfo.uname:'';
							vm.isdelete = data.data.deleted;
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg)
							}
						}
					},
				})
			}
		}
		forward.init();

	})
})