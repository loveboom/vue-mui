var vm = new Vue({
	el: '#main',
	data: {
		idlist: [{
				id: '1',
				title: '企业',
				check: false
			},
			{
				id: '2',
				title: '投资机构',
				check: false
			},
			{
				id: '3',
				title: '合格投资人',
				check: false
			},
			{
				id: '4',
				title: '咨询机构',
				check: false
			},
			{
				id: '5',
				title: '券商研究员',
				check: false
			},
			{
				id: '6',
				title: '新三板做市商',
				check: false
			}
		],
		interesting:[]
	},
	methods: {
		selectid: function(params) {
			this.idlist[params.index].check = !this.idlist[params.index].check;
		},
		selectinteresting:function(params){
			this.interesting[params.index].check = !this.interesting[params.index].check;
		}
	}
})

mui.ready(function() {
 
	mui.plusReady(function() {
		
		var lastweb = plus.webview.getWebviewById('screen-result.html');
		setTimeout(function(){
			plus.webview.close(lastweb); 
		},1000)
		
		
		mui.ajax({
			url: URL.path + '/other/interested',
			type: 'post',
			data: {
				terminalNo: 3
			},
			success: function(data) {
				if(data.returnCode == 200) {
					for(var i in data.data){
						var datas = data.data[i];
						datas.check = false;
					}
					vm.interesting = data.data;
				}
			}
		})
		
		mui('body').on('tap','#sub',function(){
			var ctypeArr = [];
			var insterestingArr = [];
			
			for(var i in vm.idlist){
				if(vm.idlist[i].check){
					ctypeArr.push(vm.idlist[i].id)
				}
			}
			for(var i in vm.interesting){
				if(vm.interesting[i].check){
					insterestingArr.push(vm.interesting[i].id)
				}
			} 
			if(ctypeArr.length == 0 && insterestingArr.length == 0){    
				mui.toast('请至少选择一项');
				return;
			}
			var ctype = ctypeArr.join(',');
			var instreresting = insterestingArr.join(',');
			
			console.log(ctype,'ctype');
			console.log(instreresting,'instreresting');
			
			var web = plus.webview.currentWebview();
			mui.openWindow({
				url:'screen-result.html',
				id:'screen-result.html',
				extras:{
					ctype:ctype,
					interested:instreresting
				}
			})
			
			
		})
	})

})