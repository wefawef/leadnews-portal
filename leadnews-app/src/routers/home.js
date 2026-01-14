// ============  主页路由MODEL  ==================
import Layout from '@/compoents/layouts/layout_main'
import Home from '@/pages/home/index'
import Article from '@/pages/article/index'
import Search from '@/pages/search/index'
import Login from '@/pages/login/index'
import Register from '@/pages/register/index'
import Screen from '@/pages/load_screen/index'
import SearchResult from '@/pages/search_result/index'
import UserInfo from '@/pages/user/index'
import RealNameAuth from '@/pages/user/realname_auth'
import EditUserInfo from '@/pages/user/edit_info'

let routes = [
    {
        path: '/',
        component: Layout,
        children:[
            {
                path:'/home',
                name:'Home',
                component: Home
            }
        ]
    },{
        path:'/screen',
        name: 'screen',
        component:Screen
    },{
        path:'/login',
        name: 'login',
        component:Login
    },{
        path:'/register',
        name: 'register',
        component:Register
    },{
        path:'/user',
        name: 'user',
        component:UserInfo
    },{
        path:'/user/realname_auth',
        name: 'realname_auth',
        component:RealNameAuth
    },{
        path:'/user/edit_info',
        name: 'user_edit_info',
        component:EditUserInfo,
        props:true
    },{
        path:'/article',
        name: 'article-info',
        component:Article,
        props:true
    },{
        path:'/search',
        name: 'search',
        component:Search
    },{
        path:'/search_result',
        name: 'search_result',
        component:SearchResult,
        props:true
    }
]

export default routes;
