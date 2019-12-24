import Home from '../pages/home'
const routes = [
    {
        path:'/',
        redirect:'/home',
    },
    {
        path: '/home',
        component: Home
    }
]

export default routes