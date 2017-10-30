var vm = new Vue({
	el: '#main',
	data: {
		item: {}, //详情
		id: '', //长文章id
		page: 1,
		comt: [], //评论列表
		pid: '', //被回复人id
		token: '',
		resindex: '', //背回复的二级回复index
		cid: '', //评论id,用于删除评论
		iscol: '1', //是否收藏 默认否
		isup: '1', // 是否点赞 默认否
		content: '',
		myid: '',
		iszan: true
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

	mui.plusReady(function() {
		vm.token = plus.storage.getItem('token') //存储token
		var web = plus.webview.currentWebview();
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
				Info.delete(); //删除长文章
				Info.deleteComment() // 删除评论
				Info.collection() //收藏/取消长文章
				Info.up() //点赞、取消点赞
				Info.reward(); // 打赏
				Info.isZan(); // 是否能赞赏
			},
			content: function() { //详情加载
				mui.ajax({
					url: URL.path + '/longarticle/longarticle_detail',
					type: 'post',
					crossDomain: true,
					data: {
						id: web.cid,
						token: vm.token,
						terminalNo: '3',
					},
					success: function(data) {
						if(data.returnCode == 200) {
							//																					alert(JSON.stringify(data.data)) 
							data.data.zanlength = data.data.zan_user.length;
							vm.item = data.data;
							vm.iscol = data.data.is_collect;
							vm.isup = data.data.is_praise;
							var user = JSON.parse(plus.storage.getItem('user'));
							vm.myid = user.id;
							//							alert(vm.item.content)
							//vm.isup = data.data.
							SHARE(URL.path3 + 'article?id=' + web.cid, vm.item.title, function() {
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
							} else {
								mui.toast(data.msg)
							}
						}
						var currentView = plus.webview.currentWebview();
						currentView.show('slide-in-right', 300);
						plus.nativeUI.closeWaiting();
					},
					error: function(xhr, err) {
						console.log(err)
					}
				})
			},
			isZan: function() {
				//alert(plus.runtime.version) 
				mui.ajax({
					url: URL.path + '/account/iosconfig',
					type: 'post',
					data: {
						token: plus.storage.getItem('token'),
						title: plus.runtime.version
					},
					success: function(data) {
						if(data.returnCode == 200) {
							if(data.data.is_can == 0 && mui.os.ios){
								vm.iszan = false;
							}else{
								vm.iszan = true; 
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
			},
			publish: function() { //发表评论
				mui('body').on('tap', '.circle-comment-buttom', function(e) {

					var content = this.value;
					mui.ajax({
						url: URL.path + '/comments/create_comments',
						type: 'post',
						data: {
							rid: web.cid,
							type: '2',
							pid: vm.pid,
							content: vm.content,
							token: vm.token,
							terminalNo: '3'
						},
						success: function(data) {
							if(data.returnCode == 200) {
								mui.toast('评论成功');
								//alert(JSON.stringify(data.data))
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
						mui.openWindow({
							url: 'circle-forward.html',
							id: 'circle-forward.html',
							extras: {
								cid: vm.item.circle_info.id,
								tid: vm.item.circle_info.t_id,
								type: '2'
							}
						})
					})

				})
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
			delete: function() { //删除长文章
				mui('body').on('tap', '#delete', function() {
					Power(function() {
						mui.confirm(' ', '确认删除', ['取消', '确认'], function(res) {
							if(res.index == 1) {
								mui.ajax({
									url: URL.path + '/longarticle/delete_article',
									type: 'post',
									data: {
										rid: web.cid,
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
									},
									error: function(xhr, type) {
										console.log(type)
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
			collection: function() { //收藏、取消收藏长文章
				mui('body').on('tap', '#collection', function() {
					if(vm.iscol == '0') {
						mui.ajax({
							url: URL.path + '/collects/cupdate2',
							type: 'post',
							data: {
								tid: web.cid,
								token: vm.token,
								terminalNo: '3'
							},
							success: function(data) {

								if(data.returnCode == 200) {
									mui.toast('取消收藏');
									vm.iscol = '1';
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
					} else {
						mui.ajax({
							url: URL.path + '/collects/cadd',
							type: 'post',
							data: {
								tid: web.cid,
								token: vm.token,
								terminalNo: '3',
							},
							success: function(data) {
								if(data.returnCode == 200) {
									mui.toast('收藏成功');
									vm.iscol = '0';
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
			},
			up: function() { //点赞、取消点赞
				mui('body').on('tap', '.circle-my-s-up', function() {
					var url = ''
					if(vm.isup == 0) {
						url = URL.path + '/praise/cupdate';
					}
					if(vm.isup == 1) {
						url = URL.path + '/praise/cadd';
					}
					mui.ajax({
						url: url,
						type: 'post',
						data: {
							token: vm.token,
							terminalNo: '3',
							tid: web.cid
						},
						success: function(data) {
							if(data.returnCode == 200) {
								if(vm.isup == 1) {
									vm.isup = '0';
									vm.item.praise++;
									mui.toast('点赞成功');
								} else {
									vm.isup = '1';
									vm.item.praise--;
									mui.toast('取消点赞');
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

			},
			reward: function() {
				mui('body').on('tap', '.circle-i-a-payicon', function() {
					mui.openWindow({
						url: 'circle-reward.html',
						id: 'circle-reward.html',
						extras: {
							cid: vm.item.id,
							name: vm.item.uname,
							avatar: vm.item.headimg,
							title: vm.item.title
						}
					})
				})

			}
		}
		Info.init();
		//		plus.share.getServices(function(s) {
		//			shares = s;
		//			for(var i in s) {
		//				if('weixin' == s[i].id) {
		//					sharewx = s[i];
		//					document.getElementById("share").addEventListener('tap', function() {
		//						sharewx.send({ content: "DCloud HBuilder-做最好的HTML5开发工具", href: "http://www.dcloud.io/", extra: { scene: "WXSceneTimeline" } }, function() {
		//							alert("分享成功！");
		//						}, function(e) {
		//							alert("分享失败：" + e.message);
		//						});
		//					})
		//				}
		//			}
		//		}, function(e) {
		//			alert("获取分享服务列表失败：" + e.message);
		//		});

		//		function shareWeixinMessage() {
		//			alert(1)
		//			sharewx.send({ content: "DCloud HBuilder-做最好的HTML5开发工具", href: "http://www.dcloud.io/", extra: { scene: "WXSceneTimeline" } }, function() {
		//				alert("分享成功！");
		//			}, function(e) {
		//				alert("分享失败：" + e.message);
		//			});
		//		}
	})

})

function comments() { //加载评论 
	mui.ajax({
		url: URL.path + '/longarticle/circle_comments',
		type: "post",
		data: {
			id: plus.webview.currentWebview().cid,
			type: '2',
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
		url: URL.path + '/longarticle/circle_comments',
		type: "post",
		data: {
			id: plus.webview.currentWebview().cid,
			type: '2',
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
					mui.toast(data.msg);
				}
			}

		}
	})
}

function read() {
	mui.ajax({
		url: URL.path + '/comments/to_read',
		type: 'post',
		data: {
			token: plus.storage.getItem('token'),
			id: plus.webview.currentWebview().cid,
			type: '2',
			terminalNo: '3'
		}
	})
}