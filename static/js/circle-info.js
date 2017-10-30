var vm = new Vue({
	el: '#main',
	data: {
		item: {}, //详情
		id: '', //圈子id
		page: 1,
		comt: [], //评论列表
		pid: '', //被回复人id
		token: '',
		resindex: '', //背回复的二级回复index
		cid: '', //评论id,用于删除评论
		content: ''
	},
})


				
mui.init({
	//	pullRefresh: {
	//		container: '#pullrefresh', //待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
	//		up: {
	//			contentrefresh: "正在加载...", //可选，正在加载状态时，上拉加载控件上显示的标题内容
	//			contentnomore: '没有更多数据了', //可选，请求完毕若没有更多数据时显示的提醒内容；
	//			callback: comments //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
	//		},
	//		down: {
	//			//auto:true,
	//			contentdown: "下拉可以刷新", //可选，在下拉可刷新状态时，下拉刷新控件上显示的标题内容
	//			contentover: "释放立即刷新", //可选，在释放可刷新状态时，下拉刷新控件上显示的标题内容
	//			contentrefresh: "正在刷新...", //可选，正在刷新状态时，下拉刷新控件上显示的标题内容
	//			callback: upload
	//		},
	//	},
	beforeback: function() {
		var web = plus.webview.getWebviewById('circle-new-comment.html');
		mui.fire(web, 'new');
		return true;
	}
})
mui('#pullrefresh').pullToRefresh({
	up: {
		callback: comments,
		contentrefresh: "正在加载...",
		contentnomore: '没有更多数据了',
	},
	down: {
		callback: upload,
	}
})
mui.ready(function() {
	//plus.storage.removeItem('token') 
	//alert(plus.storage.getItem('token'))   
	mui.plusReady(function() {
				
		
		vm.token = plus.storage.getItem('token') //存储token  
		var web = plus.webview.currentWebview(); 
		
		var old_back = mui.back;
		mui.back = function(){
			var circle = plus.webview.getWebviewById('circle.html');
			mui.fire(circle,'reload');
			old_back();
		}

		var deceleration = mui.os.ios ? 0.003 : 0.0009;

		mui('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true, //是否显示滚动条
			deceleration: deceleration
		});
		//		alert(web.cid)  

		var Info = {
			init: function() {
				Info.content(); //详情加载
				Info.publish(); //发布评论
				Info.bind(); //绑定跳转内容
				Info.response(); //回复个人 
				Info.delete(); //删除圈子
				Info.deleteComment() // 删除评论 
			},
			content: function() { //详情加载  
				mui.ajax({
					url: URL.path + '/circle/circle_detail',
					type: 'post',
					data: {
						id: web.cid,
						token: vm.token,
						terminalNo: '3',
					},
					success: function(data) {
						if(data.returnCode == 200) {
//														alert(JSON.stringify(data.data)) 
							data.data.imglength = data.data.circle_photo.length;
							vm.item = data.data;
							var shareContent = vm.item.rid == 0 ? vm.item.content : vm.item.r_content;
							if(!shareContent) {
								shareContent = '企融直通车';
							}
							SHARE(URL.path3 + 'circle?id=' + web.cid, shareContent) //分享
							
							vm.$nextTick(function() {
								mui.previewImage();
							});
							comments(); //加载评论
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else {
								mui.toast(data.msg)
							}
						}
					},
					error: function(xhr, err) {
						console.log(err)
					}
				})
			},
			publish: function() { //发表评论
				mui('body').on('tap', '.circle-comment-buttom', function(e) {
					mui.ajax({
						url: URL.path + '/comments/create_comments',
						type: 'post',
						data: {
							rid: vm.item.id,
							type: '1',
							pid: vm.pid,
							content: vm.content,
							token: vm.token,
							terminalNo: '3'
						},
						success: function(data) {
							if(data.returnCode == 200) {
								mui.toast('评论成功');
								vm.content = '';
								vm.item.comments++;
								document.getElementById("comment_input").blur();
								if(data.data.length != 0) {
									vm.comt[vm.resindex].child.push(data.data);
									vm.comt[vm.resindex].childnums++;
								} else {
									upload(); //评论后更新
								}

							} else {
								if(data.returnCode == 401) {
									unLoginComfirm();
								} else {
									mui.toast(data.msg)
								}
							}
						},
						error: function(xhr, err) {
							console.log(err)
						}
					})

				})
			},
			bind: function() { //绑定事件 
				mui('body').on('tap', '#comment', function() { //发表评论弹出输入框
					vm.pid = '0';
					document.getElementById("comment_input").placeholder = '评论';
					document.getElementById("comment_input").focus();
				})

				mui('body').on('tap', '#forward', function() { //转发
					Power(function() {
						var img = '',
							name = '',
							content = '',
							uid = '';
						if(vm.item.start) {
							name = vm.item.start.uname;
							content = vm.item.start.content;
							img = vm.item.start.circle_photo[0];
							uid = vm.item.start.uid;
						} else {
							name = vm.item.uname;
							content = vm.item.content ? vm.item.content : vm.item.r_content;
							img = vm.item.circle_photo[0];
							uid = vm.item.uid;
						}
						mui.openWindow({
							url: 'circle-forward.html',
							id: 'circle-forward.html',
							extras: {
								cid: vm.item.id,
								type: '1',
								name: name,
								img: img,
								content: content,
								uid: uid
							}
						})
					})

				})
				mui('body').on('tap', '.link-circle', function(e) { //打开
					e.stopPropagation();
					if(this.classList.contains('cant')) {
						mui.toast('该圈子已经被删除');
						return;
					}
					var id = this.getAttribute('data-id');
					//alert(id)
					mui.openWindow({
						url: 'circle-info.html',
						id: 'circle-info.html',
						createNew: true,
						extras: {
							cid: id
						}
					})
				})
				mui('body').on('tap', '.link-article', function(e) { //打开
					e.stopPropagation();
					if(this.classList.contains('cant')) {
						mui.toast('该圈子已经被删除');
						return;
					}
					var id = this.getAttribute('data-id');
					//alert(id)
					mui.openWindow({
						url: 'circle-article-info.html',
						id: 'circle-article-info.html',
						createNew: true,
						extras: {
							cid: id
						}
					})
				})
				//				mui('body').on('tap', '.personal', function(e) { //跳转个人主页
				//					e.stopPropagation()
				//					mui.openWindow({
				//						url: 'homepage-personal.html',
				//						id: 'homepage-personal.html',
				//						//					extras: {
				//						//						id: vm.id
				//						//					}
				//					})
				//				})
				mui('body').on('tap', '.circle-i-more', function(e) { //展开评论
					var index = $(this).parents('.circle-c-list').index();
					vm.$set(vm.comt[index], 'childshow', 1);
					$(this).hide();
				})

			},
			response: function() { //回复个人
				mui('body').on('tap', '.response', function() {
					if(this.classList.contains('can') == true) {
						vm.pid = this.getAttribute('data-id');
						vm.resindex = $(this).parents('.circle-c-list').index();
						var name = this.getAttribute('data-name');
						document.getElementById("comment_input").placeholder = '回复' + name;
						document.getElementById("comment_input").focus();
					} else {
						vm.cid = this.getAttribute('data-id');
						mui('#sheet1').popover('toggle');
					}
				})

			},
			delete: function() { //删除圈子
				mui('body').on('tap', '#delete', function() {
					Power(function() {
						mui.confirm(' ', '确认删除', ['取消', '确认'], function(res) {
							if(res.index == 1) {
								mui.ajax({
									url: URL.path + '/circle/delete_circle',
									type: 'post',
									data: {
										rid: vm.item.id,
										token: vm.token,
										terminalNo: '3'
									},
									success: function(data) {
										if(data.returnCode == 200) {
											mui.toast('删除成功');
											vm.item.comments--;
											var web = plus.webview.currentWebview().opener();
											var wobj = plus.webview.getWebviewById(web.id);
											wobj.reload(true);
											mui.back();
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
						},'div')
					})

				})
			},
			deleteComment: function() {
				mui('body').on('tap', '#delete_comment', function() {
					mui.ajax({
						url: URL.path + '/comments/delete_comment',
						type: 'post',
						data: {
							com_id: vm.cid,
							token: vm.token,
							terminalNo: '3'
						},
						success: function(data) {
							if(data.returnCode == 200) {
								mui.toast('删除成功');
								mui('#sheet1').popover('toggle');
								upload();
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
			},
			read: function() {

			}
		}
		Info.init();
	})

})

function comments() { //加载评论 
	mui.ajax({
		url: URL.path + '/circle/circle_comments',
		type: "post",
		data: {
			id: plus.webview.currentWebview().cid,
			type: '1',
			page: vm.page,
			token: vm.token,
			terminalNo: '3'
		},
		success: function(data) {
			if(data.returnCode == 200) {
				//alert(JSON.stringify(data.data))
				read();
				if(data.data.length == 0) {
					mui('#pullrefresh').pullToRefresh().endPullUpToRefresh(true);
				} else {
					vm.page++;
					vm.comt = vm.comt.concat(data.data);
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

function upload() { //更新评论
	mui.ajax({
		url: URL.path + '/circle/circle_comments',
		type: "post",
		data: {
			id: plus.webview.currentWebview().cid,
			type: '1',
			page: '1',
			token: vm.token,
			terminalNo: '3'
		},
		success: function(data) {
			if(data.returnCode == 200) {
				read();
				vm.page = 2;
				vm.comt = data.data;
				mui('#pullrefresh').pullToRefresh().endPullDownToRefresh(); //取消下拉按钮
				mui('#pullrefresh').pullToRefresh().refresh(true); //启用上拉 
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

function read() {
	mui.ajax({
		url: URL.path + '/comments/to_read',
		type: 'post',
		data: {
			token: plus.storage.getItem('token'),
			id: plus.webview.currentWebview().cid,
			type: '1',
			terminalNo: '3'
		}
	})
}