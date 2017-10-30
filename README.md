使用：

1.克隆远成仓库到本地：

    git clone https://git@gitlab.com:qq931957963/QR_car.git

2.在master分支基础上创建自己的分支member:

    git checkout -b member1
    
    .../修改项目代码的过程

3.合并到master分支并提交：

    git add .
    
    git commit -m '我修改了xxx页面的代码，解决了xxx功能'
    
    git checkout --no-ff merge member1
    
    git push


注意事项：

可能需要先添加ssh