//导出菜单数据
export  const  MenuData = [
   {
       title:'首页',path : '/index' ,icon:'el-icon-s-home'
   },
   {
       title:'用户管理',path : '/auth/index' ,icon:'el-icon-user',
       children:[
           { title:'用户列表' , path : '/users/index'},
           { title:'用户审核' , path : '/auth/index'}
       ]
   },
   {
        title:'图文管理', path:'/article',icon:'el-icon-edit',
        children:[
          { title:'频道管理' , path : '/channel/index'},
          { title:'内容管理' , path : '/content/index'},
          { title:'媒体审核' , path : '/content/auth_media'},
          { title:'敏感词设置' , path : '/sensitive/index'}
        ]
   }
]
