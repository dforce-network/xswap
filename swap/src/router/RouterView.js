import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

class RouterView extends Component {
    render() {
        let { routes } = this.props;	//取到传进来的路由表
        let rdArr = routes && routes.filter(item => item.redirect);	//把所以路由重定向取出来
        let rdCom = rdArr &&  rdArr.map((item, key) => <Redirect from={item.path} to={item.redirect} key={key} />);
        return (
            <Switch>
                {
                  routes &&  routes.map((item, key) => !item.redirect && <Route path={item.path} key={key} render={(props) => <item.component {...props} routes={item.children} />} />).concat(rdCom)
                }
            </Switch>
        );
    }
}
export default RouterView;