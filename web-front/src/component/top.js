import React, { Component } from "react";
import "./top.scss";
// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../language/en_US.js';
import zh_CN from '../language/zh_CN';
import logo_xswap from '../images/logo-xswap.svg';


export default class top extends Component {
    constructor(props) {
        super(props);
    }

    openOnEtherscan = (my_account) => {
        if (this.props.net_type === 'rinkeby') {
            my_account = 'https://rinkeby.etherscan.io/address/' + my_account;
        } else {
            my_account = 'https://etherscan.io/address/' + my_account;
        }
        window.open(my_account, "_blank");
    }

    render() {
        return (
            <IntlProvider locale={'en'} messages={navigator.language === 'zh-CN' ? zh_CN : en_US} >
                <div className="top">
                    <div className="top-left">
                        <img src={logo_xswap} />
                    </div>

                    {
                        this.props.account &&
                        <div className="top-right">
                            <span onClick={() => { this.openOnEtherscan(this.props.account) }}>
                                {this.props.account.slice(0, 4) + '...' + this.props.account.slice(-4)}
                            </span>
                        </div>
                    }

                    {
                        !this.props.account &&
                        <div className="top-right-connect">
                            <FormattedMessage id='connect' />
                        </div>
                    }

                </div>

                <div className="slogon">
                    <FormattedMessage id='slogon' />
                </div>
            </IntlProvider>
        )
    }
}

