var demo = angular.module("demo", ["RongWebIMWidget"]);

demo.controller("main", ["$scope", "WebIMWidget", "$http", function($scope, WebIMWidget, $http) {

    $scope.targetType = 1; //1：私聊 更多会话类型查看http://www.rongcloud.cn/docs/api/js/global.html#ConversationType
    $scope.targetId = 'bb';

    //注意实际应用中 appkey 、 token 使用自己从融云服务器注册的。
    WebIMWidget.init({
        appkey: '3argexb6r934e',
        token: "b/jvjEFD41TIVT0nsf9+L3ryPPkHsvRwWZV8SVI5ICcZ2I5Nl4OdNO01OjZxjjmVlD2dmk4RZ90=",
        displayConversationList: true,
        style:{
            left:3,
            bottom:3,
            width:430
        },
        onSuccess: function(id) {
            $scope.user = id;
            document.title = '用户：' + id;
            console.log('连接成功：' + id);
        },
        onError: function(error) {
            console.log('连接失败：' + error);
        }
    });

    WebIMWidget.setUserInfoProvider(function(targetId, obj) {
        obj.onSuccess({
            name: "用户：" + targetId
        });
    });

    WebIMWidget.setGroupInfoProvider(function(targetId, obj){
        obj.onSuccess({
            name:'群组：' + targetId
        });
    })

    $scope.setconversation = function () {
        if (!!$scope.targetId) {
            WebIMWidget.setConversation(Number($scope.targetType), $scope.targetId, "用户：" + $scope.targetId);
            WebIMWidget.show();
        }
    };

    $scope.customerserviceId = "KEFU145914839332836";
    $scope.setcustomerservice = function () {
        WebIMWidget.setConversation(Number(RongIMLib.ConversationType.CUSTOMER_SERVICE), $scope.customerserviceId);
        WebIMWidget.show();
    }

    $scope.show = function() {
        WebIMWidget.show();
    };

    $scope.hidden = function() {
        WebIMWidget.hidden();
    };

    WebIMWidget.show();


    // 示例：获取 userinfo.json 中数据，根据 targetId 获取对应用户信息
    // WebIMWidget.setUserInfoProvider(function(targetId,obj){
    //     $http({
    //       url:"/userinfo.json"
    //     }).success(function(rep){
    //       var user;
    //       rep.userlist.forEach(function(item){
    //         if(item.id==targetId){
    //           user=item;
    //         }
    //       })
    //       if(user){
    //         obj.onSuccess({id:user.id,name:user.name,portraitUri:user.portraitUri});
    //       }else{
    //         obj.onSuccess({id:targetId,name:"用户："+targetId});
    //       }
    //     })
    // });

    // 示例：获取 online.json 中数据，根据传入用户 id 数组获取对应在线状态
    // WebIMWidget.setOnlineStatusProvider(function(arr, obj) {
    //     $http({
    //         url: "/online.json"
    //     }).success(function(rep) {
    //         obj.onSuccess(rep.data);
    //     })
    // });

}]);