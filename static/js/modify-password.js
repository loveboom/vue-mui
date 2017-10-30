 mui.ready(function () {
   	
   	mui.plusReady(function () {
   	    
   	    document.getElementById("sub").addEventListener('tap',function(){
   	    	
   	    		var opw = document.getElementById("opw").value;
   	    		var npw = document.getElementById("npw").value;
   	    		var rpw = document.getElementById("rpw").value;
   	    		
   	    		if(!opw){
   	    			mui.toast('请输入原密码');
   	    			return;
   	    		}
   	    		if(!npw){
   	    			mui.toast('请输入新密码');
   	    			return;
   	    		}
   	    		if(!rpw){
   	    			mui.toast('请输入新密码');
   	    			return;
   	    		}
   	    		if(npw !== rpw){
   	    			mui.toast('两次密码不一致');
   	    			return;
   	    		}
   	    		mui.ajax({
   	    			url:URL.path + '/account/editPwd',
   	    			type:'post',
   	    			data:{
   	    				terminalNo:'3',
   	    				token:plus.storage.getItem('token'),
   	    				oldpassword:opw,
   	    				password:npw,
   	    				password_re:rpw
   	    			},
   	    			success:function(data){
   	    				if(data.returnCode == 200){
   	    					mui.toast('修改成功');
   	    					setTimeout(function(){
   	    						mui.back();
   	    					},1000)
   	    				}else{
   	    					if(data.returnCode == 401){
   	    						unLoginComfirm('modify-password.html'); 
   	    					}else{
   	    						mui.toast(JSON.stringify(data.msg))
   	    					}
   	    				}
   	    			},
   	    			error:function(xhr,type,errorThrown){
		//异常处理；
		console.log(type);
	}
   	    		})
   	    })
   	    
   	    
   	})
})