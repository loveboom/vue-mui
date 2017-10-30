mui.init();
(function($) {
	//alert(1)
	//addNav(1)
	//阻尼系数
	var deceleration = $.os.ios ? 0.003 : 0.0009;

	var vm = new Vue({
		el: '#main',
		data: {
			my: {}, 
			islogin: false,
			mypage: 1,
			isconcern: true,
			hot: [],
			hotpage: 1,
			friends: [],
			canConcern: true,
			hotSearchContent: '',
			isbm:''
		}
	})
	addNav(1);

	$.ready(function() {
		mui.plusReady(function() {
			
			mui('body').on('tap','#hot_search',function(){
				document.querySelector('#nav').style.display = 'none';
				
				document.querySelector('.mui-slider-group').style.bottom = '0';
				var div = document.querySelector('#hot_search');
				setTimeout(function(){
					if(div.value==''){
						document.activeElement.blur();
						document.querySelector('#nav').style.display = 'block';
						document.querySelector('.mui-slider-group').style.bottom = '1rem';
						div.value = '';
						div.innerHTML = '';
					}
					
				},7000);
			})
			
			vm.token = plus.storage.getItem('token');
			//plus.storage.removeItem('token')  
			console.log(vm.token,'vm.token');
			

			function isActive() {
				if(plus.storage.getItem('token')) {
					var datas = {
						terminalNo: '3',
						token: plus.storage.getItem('token')
					}
					if(plus.storage.getItem('phonesContacts')) {
						datas.phones = plus.storage.getItem('phonesContacts');
					}
					mui.ajax({
						url: URL.path + '/account/new_friend_fans',
						type: 'post',
						data: datas,
						success: function(data) {
							if(data.returnCode == 200) {
								if(data.data.all_nums != 0) {
									addNav(1, true);
								} else {
									addNav(1);
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
				} else {
					addNav(1);
				}
			}
			isActive();

			var circle = {
				init: function() {
					circle.myajaxfirst(); //第一次我的圈子详情加载  带判断状态
					circle.bind(); //事件绑定
					circle.addFollow(); //关注话题
					circle.removeFollow(); //取消关注话题
					circle.deleteCircle(); //删除圈子或长文章
					circle.hotAjaxFirst() //热门首次加载
					circle.upAjax() //热门点赞
					circle.hotSearch() // 热门搜索
					circle.friendsAdd();
					circle.friendsCancel();
				},
				setIndex: function() {
					var n = document.querySelectorAll(".circle-my-list");
					for(var i = 0; i < n.length; i++) {
						n[i].index = i;
					}
					var m = document.querySelectorAll(".circle-hot-list");
					for(var i = 0; i < m.length; i++) {
						m[i].index = i;
					}
				},
				muiScroll: function() { //mui滚动初始化
					$('.mui-scroll-wrapper').scroll({
						bounce: false,
						indicators: true, //是否显示滚动条
						deceleration: deceleration
					});
				},
				muiMyInit: function() { //mui我的圈子初始化
					mui('#my').pullToRefresh({
						up: {
							callback: circle.myUp,
							contentrefresh: "正在加载...",
							contentnomore: '没有更多数据了',
						},
						down: {
							callback: circle.myDown,
						}
					})
				},
				hotInit: function() { //mui我的圈子初始化
					mui('#hot').pullToRefresh({
						up: {
							callback: circle.hotUp,
							contentrefresh: "正在加载...",
							contentnomore: '没有更多数据了',
						},
						down: {
							callback: circle.hotDown,
						}
					})
				},
				myajax: function(type) { //我的圈子ajax
					if(type == 'up') {
						vm.mypage++;
					} else {
						vm.mypage = 1;
					}
					mui.ajax({
						url: URL.path + '/circle/circle_list',
						type: 'post',
						data: {
							page: vm.mypage,
							token: vm.token,
							terminalNo: '3',
						},
						//						dataType:'string',
						success: function(data) {
							//														alert(JSON.stringify(data.data))
							if(data.returnCode == 200) { 
//								alert(JSON.stringify(data.data))  
//								alert(vm.hotpage)
								if(type == 'up') {
									if(data.data.length == 0) {
										setTimeout(function() {
											mui('#my').pullToRefresh().endPullUpToRefresh(true);
										}, 800)
									} else {
										//alert(JSON.stringify(vm.my)) 
										vm.my.comments = vm.my.comments.concat(data.data.comments);
										mui('#my').pullToRefresh().endPullUpToRefresh(false);
									}
								} else {
									vm.my = data.data;
									mui('#my').pullToRefresh().endPullDownToRefresh();
									mui('#my').pullToRefresh().refresh(true);
								}
								vm.$nextTick(function() {
									mui.previewImage();
									circle.setIndex();
								})

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
				myajaxfirst: function() { //第一次我的圈子详情加载  带判断状态
					mui.ajax({
						url: URL.path + '/circle/circle_list',
						type: 'post',
						data: {
							page: '1',
							token: vm.token,
							terminalNo: '3',
						},
						success: function(data) {
							if(data.returnCode == 200) {
//								alert(JSON.stringify(data.data))  
								vm.islogin = true;
								vm.isconcern = true;
								if(data.data.length == 0) { 
									//mui('#my').pullToRefresh().endPullUpToRefresh(true);
								
								} else { 
							
									vm.my = data.data;
									//console.log(JSON.stringify(data.data.comments[0]));
									//									console.log(data.data.comments[0].headimg)
									//								 																			alert(JSON.stringify(data.data))
									vm.$nextTick(function() { 
										circle.muiScroll();
										circle.muiMyInit();
										mui.previewImage();
										circle.setIndex();
									})
								}
							} else {
								if(data.returnCode == 401) {
									vm.islogin = false;
									vm.isconcern = false;
								} else if(data.returnCode == 400) {
									circle.newfriends()
									vm.islogin = true;
									vm.isconcern = false;

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
				myUp: function() { //我的圈子上拉加载更多	
					circle.myajax('up');
				},
				myDown: function() { //我的圈子下拉刷新
					circle.myajax('down');
				},
				bind: function() {
					window.addEventListener('reload', function() {
						circle.myajaxfirst();
					})
					mui("body").on('tap', '.link-circle', function(e) { //跳转圈子
						e.stopPropagation();
						if(this.classList.contains('cant')) {
							mui.toast('该圈子已经被删除');
							return;
						}
						var id = this.getAttribute('data-id');
						mui.openWindow({
							url: 'circle-info.html',
							id: 'circle-info.html',
							extras: {
								cid: id
							}
						})
					})
					//监听选项卡切换
					document.getElementById('slider').addEventListener('slide', function(e) {
						switch(e.detail.slideNumber) {
							case 0:
								var ddd = $('#sliderSegmentedControl>a');
								ddd[0].className = 'mui-control-item mui-active';
								ddd[1].className = 'mui-control-item';
								console.log(ddd,'ddd');
//									$('#sliderSegmentedControl a').removeClass('mui-active');
//									$('#aaa').addClass('mui-active');
//									document.getElementById("publish").style.display = 'block';
								break;
							case 1:
								var eee = $('#sliderSegmentedControl>a');
								eee[0].className = 'mui-control-item';
								eee[1].className = 'mui-control-item mui-active';
								break;
						}
					});
					mui("body").on('tap', '.link-article', function(e) { //跳转长文章
						e.stopPropagation();
						if(!plus.storage.getItem('token')) {
							//mui.toast('您还未登录');
							mui.openWindow({
								url: 'signin.html',
								id: 'signin.html'
							})
							return;
						}
						if(this.classList.contains('cant')) {
							mui.toast('该文章已经被删除');
							return;
						}
						var id = this.getAttribute('data-tid');
						//优化加载
						var nwaiting = plus.nativeUI.showWaiting();
						var webviewShow = plus.webview.create('circle-article-info.html', 'circle-article-info.html', {
							top: '0px',
							bottom: '0px'
						}, {
							cid: id
						});
					})
					mui("body").on('tap', '.link-topic', function(e) { //跳转话题
						e.stopPropagation();
						if(this.classList.contains('cant')) {
							mui.toast('该话题已经被删除');
							return;
						}
						if(!plus.storage.getItem('token')) {
							//mui.toast('您还未登录');
							mui.openWindow({
								url: 'signin.html',
								id: 'signin.html'
							})
							return;
						}
						var id = this.getAttribute('data-tid');
						//优化加载
						var nwaiting = plus.nativeUI.showWaiting();
						var webviewShow = plus.webview.create('circle-topic-info.html', 'circle-topic-info.html', {
							top: '0px',
							bottom: '0px'
						}, {
							cid: id
						});
					})
					mui('body').on('tap', '.circle-my-s-forward', function(e) {
						e.stopPropagation();
						var parent = this.parentNode.parentNode.parentNode;
						var id = '';
						var type = '';
						Power(function() {
							if(parent.classList.contains('link-circle')) {
								id = parent.getAttribute('data-id');
								tid = parent.getAttribute('data-tid');
							} else {
								id = parent.getAttribute('data-id');
								tid = parent.getAttribute('data-tid');
							}

							type = parent.getAttribute('data-type');
							mui.openWindow({
								url: 'circle-forward.html',
								id: 'circle-forward.html',
								extras: {
									cid: id,
									tid: tid,
									type: type
								}
							})
						})

					})
					mui('body').on('tap', '.my-follow-li', function() {
						var id = this.getAttribute('data-id');
						// alert(id)
						mui.openWindow({
							url: 'homepage-personal.html',
							id: 'homepage-personal.html',
							extras: {
								rid: id
							},
							createNew: true
						})
					})

					mui('body').on('tap', '.circle-new-ct', function() {
						GO('circle-new-comment')
					})
					mui('body').on('tap', '#publish', function() {
						Power(function() {
							GO('circle-publish')
						})

					})
					mui('body').on('tap', '#signin', function() {
						GO('signin')
					})
					mui('#nav').on('tap', '#nav_home', function() {
						GO('home', {}, true)
					})
					mui('#nav').on('tap', '#nav_circle', function() {
						if(document.getElementById("item1mobile").classList.contains('mui-active')) { //判断处在哪个页面
							if(vm.islogin && vm.isconcern) { //已登录已关注，调用下拉刷新方法								
								mui('#my').pullToRefresh().pullDownLoading();
							} else { //未登录或未关注，调用加载方法,带状态判断
								//circle.myajaxfirst();
								var circleweb = plus.webview.currentWebview();
								circleweb.reload(true); 
							}
						} else {
							mui('#hot').pullToRefresh().pullDownLoading();
						}

					})
					mui('#nav').on('tap', '#nav_demand', function() {
						GO('demand', {}, true)
					})
					mui('#nav').on('tap', '#nav_my', function() {
						GO('my', {}, true)
					})
				},
				topicAjax: function(type, tid, index) { //话题关注或取消ajax
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
							tid: tid,
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

									if(document.getElementById("item1mobile").classList.contains('mui-active')) {
										vm.my.comments[index].is_concern = 0;
									} else {
										vm.hot[index].is_concern = 0;
									}

								} else {
									mui.toast('已取消关注');
									if(document.getElementById("item1mobile").classList.contains('mui-active')) {
										vm.my.comments[index].is_concern = 1;
									} else {
										vm.hot[index].is_concern = 1;
									}
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
						var parent = this.parentNode.parentNode.parentNode;
						circle.topicAjax('add', parent.getAttribute('data-tid'), parent.index)
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
						var parent = this.parentNode.parentNode.parentNode;
						mui.confirm('确认取消关注', '确认', ['取消', '确认'], function(res) {
							if(res.index == 1) {
								circle.topicAjax('remove', parent.getAttribute('data-tid'), parent.index)
							}
						}, 'div')

					})
				},
				deleteCircleAjax: function(url, id, index, parent) { //删除圈子 或者长文章 ajax
					mui.ajax({
						url: url,
						type: 'post',
						data: {
							rid: id,
							token: vm.token,
							terminalNo: '3',
						},
						success: function(data) {
							if(data.returnCode == 200) {
								mui.toast('删除成功');
								//vm.my.comments.splice(index, index + 1);
//								parent.remove();
								//mui('#my').pullToRefresh().pullDownLoading();
								//mui('#hot').pullToRefresh().pullDownLoading(); 
								circle.myajax('down');
								circle.hotajax('down'); 
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
				deleteCircle: function() { //删除圈子 或者长文章
					Power(function() {
						mui('body').on('tap', '.circle-my-s-delete', function(e) {
							e.stopPropagation();
							var _this = this;
							mui.confirm(' ', '确认删除', ['取消', '确认'], function(res) {
								if(res.index == 1) {
									var parent = _this.parentNode.parentNode.parentNode;
									circle.deleteCircleAjax(URL.path + '/circle/delete_circle', parent.getAttribute('data-id'), parent.index, parent)
								}
							}, 'div')
						})
					})

				},
				hotAjaxFirst: function() { //热门首次加载
					var datas = {
						terminalNo: '3',
						page: vm.hotpage
					}
					if(vm.token) {
						datas.token = vm.token;
					}
					mui.ajax({
						url: URL.path + '/circle/hot_list',
						type: 'post',
						data: datas,
						success: function(data) {
							if(data.returnCode == 200) {
								vm.hot = data.data;
								//alert(JSON.stringify(data.data))
								circle.hotInit();
								vm.$nextTick(function() {
									circle.muiScroll();
									mui.previewImage();
									circle.setIndex();
								})
							} else {
								if(data.returnCode == 401) {
									//									unLoginComfirm();
								} else {
									mui.toast(data.msg)
								}
							}
						}
					})
				},
				hotajax: function(type) {
					var datas = {
						terminalNo: '3',
						keyword: vm.hotSearchContent
					}
					if(plus.storage.getItem('token')) {
						datas.token = plus.storage.getItem('token')
					}
					if(type == 'up') {
						vm.hotpage++;
					} else {
						vm.hotpage = 1;
					}
					datas.page = vm.hotpage;
					mui.ajax({
						url: URL.path + '/circle/hot_list',
						type: 'post',
						data: datas,
						success: function(data) {
							if(data.returnCode == 200) {
								if(type == 'up') {
									if(data.data.length == 0) {
										setTimeout(function() {
											mui('#hot').pullToRefresh().endPullUpToRefresh(true);
										}, 800);
									} else {
										vm.hot = vm.hot.concat(data.data);
										mui('#hot').pullToRefresh().endPullUpToRefresh(false);
									}
								} else {
									vm.hot = data.data;
									mui('#hot').pullToRefresh().endPullDownToRefresh();
									mui('#hot').pullToRefresh().refresh(true);
								}
								vm.$nextTick(function() {
									mui.previewImage();
									circle.setIndex();
								})
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
				hotUp: function() {
					circle.hotajax('up');
				},
				hotDown: function() {
					circle.hotajax('down');
				},
				friends: function() { //推荐关注
					mui.ajax({
						url: URL.path + '/concern/clist',
						type: 'post',
						data: {
							token: plus.storage.getItem('token'),
							terminalNo: '3'
						},
						success: function(data) {
							//alert(data.returnCode)
							
							if(data.returnCode == 200) {
								//								alert(JSON.stringify(data.data))
								vm.friends = data.data;
							} else {
								if(data.returnCode == 400) {
									circle.newfriends();
								}
							}

						}
					})
				},
				newfriends: function() {
					mui.ajax({
						url: URL.path + '/concern/friends',
						type: 'post',
						dataType: 'json',
						data: {
							token: plus.storage.getItem('token'),
							terminalNo: '3'
						},
						success: function(data) {
							console.log(data.data,'2222222')
							if(data.returnCode == 200) {
								//								alert(JSON.stringify(data.data))
								vm.friends = data.data;
								//								mui('.mui-scroll-wrapper').scroll({
								//									deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
								//								});
							}
						},
						error: function(xhr, type, errorThrown) {
							//异常处理；
							console.log(type);
						}
					})
				},
				friendsCancel: function() {
					mui('#main').on('tap', '.followed', function(e) { //取消关注
						e.stopPropagation();
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
									//circle.friends();
									_this.classList.remove('followed');
									_this.classList.add('unfollowed');
									_this.innerHTML = '+ 关注';
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
				friendsAdd: function() {
					mui('#main').on('tap', '.unfollowed', function(e) { //添加关注
						e.stopPropagation();
						var box = this.parentNode;
						var id = box.getAttribute('data-id');
						var _this = this;
						//						alert(id); 
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
									//circle.friends();
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
				upAjax: function(index) {
					mui('body').on('tap', '.circle-my-s-up', function(e) {
						e.stopPropagation()
						//alert(this.childNodes[0])
						var url = '';
						var type = 0;
						var _this = this;
						var num = _this.childNodes[0].innerHTML;
						if(this.childNodes[0].classList.contains('cur')) {
							url = URL.path + '/praise/cupdate';
							type = 1;
						} else {
							url = URL.path + '/praise/cadd';
							type = 2;
						}
						mui.ajax({
							url: url,
							type: 'post',
							data: {
								token: vm.token,
								terminalNo: '3',
								tid: _this.getAttribute('data-id')
							},
							success: function(data) {
								if(data.returnCode == 200) {
									if(type == 1) {
										_this.childNodes[0].classList.remove('cur');
										_this.childNodes[0].innerHTML = num - 1;
									} else {
										_this.childNodes[0].classList.add('cur');
										_this.childNodes[0].innerHTML = +num + 1;
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
				hotSearch: function() { //热门搜索
					mui('body').on('tap','.my-newfriend-search-btn',function(){						
						document.getElementById("hot_search").blur();
						document.querySelector('#nav').style.display = 'block';
						document.querySelector('.mui-slider-group').style.bottom = '1rem';
//						document.querySelector('#hot_search').value = '';
//						document.querySelector('#hot_search').innerHTML = '';
						circle.hotajax();						
					})
				}
			}
			circle.init();

		})
	});
})(mui);