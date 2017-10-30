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
		canConcern: true,
		content: ''
	}
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

	mui.plusReady(function() {
		vm.token = plus.storage.getItem('token') //存储token
		var web = plus.webview.currentWebview();
		var deceleration = mui.os.ios ? 0.003 : 0.0009;

		mui('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true, //是否显示滚动条
			deceleration: deceleration
		});
		//		var currentView = plus.webview.currentWebview();

		var Info = {
			init: function() {
				Info.content(); //详情加载
				Info.publish(); //发布评论
				Info.bind(); //绑定跳转内容
				Info.response(); //回复个人 
				Info.deleteComment() // 删除评论 
				Info.addFollow()
				Info.removeFollow()
			},
			content: function() {
				mui.ajax({
					url: URL.path + '/topic/topic_detail',
					type: 'post',
					data: {
						id: web.cid,
						token: vm.token,
						terminalNo: '3',
					},
					success: function(data) {
						if(data.returnCode == 200) {
							//alert(JSON.stringify(data.data))
							data.data.imglength = data.data.circle_photo.length;
							vm.item = data.data;
							vm.$nextTick(function() {
								mui.previewImage();
							});
							web.show('slide-in-right', 300);
							plus.nativeUI.closeWaiting();
							
							SHARE(URL.path3 + 'topic?id=' + web.cid, vm.item.title, function() {
								mui.ajax({
									url: URL.path + '/longarticle/shares',
									type: 'post',
									data: {
										token: plus.storage.getItem('token'),
										tid: web.cid
									}
								})
							}) //分享
							comments(); //加载评论
						} else {
							if(data.returnCode == 401) {
								unLoginComfirm();
							} else if(data.returnCode == 250) {
								web.show('slide-in-right', 300);
								plus.nativeUI.closeWaiting();
								mui.back();
								mui.toast(data.msg);
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

					var content = this.value;
					mui.ajax({
						url: URL.path + '/comments/create_comments',
						type: 'post',
						data: {
							rid: vm.item.id,
							type: '3',
							pid: vm.pid,
							content: vm.content,
							token: vm.token,
							terminalNo: '3'
						},
						success: function(data) {
							if(data.returnCode == 200) {
								mui.toast('评论成功');
								vm.content = "";
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
				mui('body').on('tap', '.circle-i-more', function(e) { //展开评论
					var index = $(this).parents('.circle-c-list').index();
					vm.$set(vm.comt[index], 'childshow', 1);
					$(this).hide();
				})

				mui('body').on('tap', '.circle-topic-news', function() {
					var url = this.getAttribute('data-url');
					var id = this.getAttribute('data-id');
					var title = this.getAttribute('data-title');
					if(!plus.storage.getItem('token')) {
						//mui.toast('您还未登录');
						GO('signin')
						return;
					}
					if(this.classList.contains('banner-circle')) { //跳转圈子详情
						GO('circle-info', {
							cid: id
						})
					}
					if(this.classList.contains('banner-article')) { //跳转长文章详情
						GO('circle-article-info', {
							cid: id
						})
					}
					if(this.classList.contains('banner-topic')) { //跳转话题详情
						//						GO('circle-topic-info', {
						//							cid: id
						//						})
						var nwaiting = plus.nativeUI.showWaiting();
						var webviewShow = plus.webview.create('circle-topic-info.html', 'circle-topic-info.html', {
							top: '0px',
							bottom: '0px'
						}, {
							cid: id
						});
					}
					if(this.classList.contains('banner-personal')) { //跳转个人主页
						GO('homepage-personal', {
							rid: id
						})
					}
					if(this.classList.contains('banner-company')) { //跳转企业主页
						GO('homepage-company', {
							cid: id
						})
					}
					if(this.classList.contains('banner-demand')) { //跳转企业主页
						GO('demand-info', {
							sign: id
						})
					}
					if(this.classList.contains('banner-link')) { //跳转外链
						GO('other-link', {
							url: url,
							title: title
						})
					}
					if(this.classList.contains('banner-news')) { //新闻跳转
						var nwaiting = plus.nativeUI.showWaiting();
						var webviewShow = plus.webview.create('circle-news-info.html', 'circle-news-info.html', {
							top: '0px',
							bottom: '0px'
						}, {
							cid: id
						});
					}

				})

				//				mui('body').on('tap', '.circle-topic-news', function(e) { //新闻跳转
				//					var id = this.getAttribute('data-id');
				//					var nwaiting = plus.nativeUI.showWaiting();
				//					var webviewShow = plus.webview.create('circle-news-info.html', 'circle-news-info.html', { top: '0px', bottom: '0px' }, { cid: id });
				//				})

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
								vm.item.comments--;
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
			topicAjax: function(type) { //话题关注或取消ajax
				var url = ''
				if(type == 'add') {
					url = URL.path + '/concerns/cadd';
				} else {
					url = URL.path + '/concerns/cupdate';
				}
				mui.ajax({
					url: url,
					type: 'post',
					data: {
						tid: web.cid,
						token: vm.token,
						terminalNo: '3',
					},
					success: function(data) {
						setTimeout(function() {
							vm.canConcern = true;
						}, 1000)
						if(data.returnCode == 200) {
							if(type == 'add') {
								mui.toast('关注成功');
								vm.item.is_concern = 0;
							} else {
								mui.toast('已取消关注');
								vm.item.is_concern = 1;
							}
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
			addFollow: function() { // 关注话题
				mui('body').on('tap', '.circle-my-t-s-follow', function(e) {
					e.stopPropagation();
					if(!vm.canConcern) {
						mui.toast('操作太频繁，请稍后再试');
						return;
					}
					vm.canConcern = false;
					Info.topicAjax('add')
				})
			},
			removeFollow: function() { //取消关注话题
				mui('body').on('tap', '.circle-my-t-s-followed', function(e) {
					e.stopPropagation();
					if(!vm.canConcern) {
						mui.toast('操作太频繁，请稍后再试');
						return;
					}
					vm.canConcern = false;
					mui.confirm('确认取消关注', '确认', ['确认', '取消'], function(res) {
						if(res.index == 0) {
							Info.topicAjax('remove')
						}
					})

				})
			},
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
			type: '3',
			page: vm.page,
			token: vm.token,
			terminalNo: '3'
		},
		success: function(data) {
			if(data.returnCode == 200) {
				//				alert(JSON.stringify(data.data))
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
			type: '3',
			page: '1',
			token: vm.token,
			terminalNo: '3'
		},
		success: function(data) {
			if(data.returnCode == 200) {
				read()
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
			type: '3',
			terminalNo: '3'
		}
	})
}