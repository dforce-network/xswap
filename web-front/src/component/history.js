import React, { Component } from "react";
import moment from 'moment';
import "./history.scss";
// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from '../language/en_US.js';
import zh_CN from '../language/zh_CN';
import logo_exchange from '../images/logo_exchange.svg';
import logo_exchange_pendding from '../images/logo_exchange_pendding.svg';
import no_history from '../images/no-history.svg';
import { format_num_to_K } from '../utils.js';


export default class RecordBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            RecentTransactions: []
        };
    }

    load_history = () => {
        if (window.localStorage) {
            let key = this.props.account + '-' + this.props.net_type;
            let results_arr = JSON.parse(`${window.localStorage.getItem(key)}`) || [];

            if (results_arr !== null) {
                results_arr.reverse();
                // console.log(JSON.stringify(results_arr));

                this.setState({ RecentTransactions: results_arr }, () => {
                    results_arr.map(item => {
                        if (item.status === 'pendding') {

                            var timerOBJ = {};
                            var tempRnum = Math.random();
                            timerOBJ[tempRnum] = setInterval(() => {

                                console.log('checking getTransactionReceipt...');

                                this.props.new_web3.eth.getTransactionReceipt(item.hash, (res_fail, res_success) => {

                                    // 合约有信息返回
                                    if (res_success) {
                                        // console.log(JSON.stringify(res_success));
                                        console.log(' *** i got getTransactionReceipt... *** ');
                                        clearInterval(timerOBJ[tempRnum]);

                                        // 有状态返回 存入localstorage
                                        let contractData = JSON.parse(window.localStorage.getItem(key));
                                        contractData.map((temp_item) => {
                                            if (temp_item.hash === res_success.transactionHash) {
                                                var temp_status;
                                                if (res_success.status === true) {
                                                    temp_status = 'success'
                                                } else {
                                                    temp_status = 'fail'
                                                }
                                                temp_item.res_origin = res_success;
                                                temp_item.status = temp_status;
                                            }
                                            return item.id;
                                        })

                                        window.localStorage.setItem(key, JSON.stringify(contractData));

                                        setTimeout(() => {
                                            console.log(' *** i load_history again *** ');
                                            this.load_history();
                                        }, 300);
                                    }


                                    if (res_fail) {
                                        console.log(res_fail);
                                        clearInterval(timerOBJ[tempRnum]);
                                    }
                                })
                            }, 2000)
                        }
                        return item.id;
                    })
                });
            }
        }
    }

    goTxnHashHref = txnHashHref => {
        // console.log(txnHashHref);
        if (this.props.net_type === 'rinkeby') {
            txnHashHref = 'https://rinkeby.etherscan.io/tx/' + txnHashHref;
        } else {
            txnHashHref = 'https://etherscan.io/tx/' + txnHashHref;
        }
        window.open(txnHashHref, "_blank");
    };

    componentDidMount = () => {
        this.load_history();
        var timer = setInterval(() => {
            // console.log(this.props.account, this.props.net_type);
            if (this.props.account && this.props.net_type) {
                clearInterval(timer);
                this.load_history();
            }
        }, 1000);
    };

    componentWillReceiveProps = (nextProps) => {
        if (this.props.load_new_history !== nextProps.load_new_history) {
            // console.log(this.props.load_new_history !== nextProps.load_new_history, 'i will load new history.');
            this.load_history();
        }
    }


    renderRecord() {
        if (this.state.RecentTransactions === null) {
            return "";
        }

        return (
            <IntlProvider locale={'en'} messages={this.props.cur_language === '中文' ? zh_CN : en_US} >
                {
                    this.state.RecentTransactions &&
                    <div className="history-title">
                        <FormattedMessage id='history' />
                    </div>
                }

                <div className="history">
                    {
                        (this.state.RecentTransactions).length === 0 &&
                        <div className="no-history">
                            <img alt='' src={no_history} />
                            <span className="no-history-span">
                                <FormattedMessage id='no_history' />
                            </span>
                        </div>
                    }

                    {
                        this.state.RecentTransactions && this.state.RecentTransactions.map((item, i) => {
                            var img_src = logo_exchange;
                            if (item.status === 'pendding') {
                                img_src = logo_exchange_pendding;
                            }

                            return (
                                <div className="history-item" key={i}>
                                    <div className="history-item-left">
                                        <img alt='' className={item.status === 'pendding' ? 'rotate' : ''} src={img_src} />
                                    </div>

                                    <div className="history-item-right">
                                        <div className="history-item-right-top">
                                            <span className='tx_date'>
                                                {moment(item.timestamp).format('MMM. DD, HH:mm')}
                                            </span>
                                            <span className='tx_hash' onClick={() => this.goTxnHashHref(item.hash)}>
                                                {item.hash.slice(0, 6) + '...' + item.hash.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="history-item-right-bottom">
                                            <FormattedMessage id='send' />
                                            {' ' + format_num_to_K(item.send_amount) + ' '}
                                            {item.send_token}
                                            {', '}
                                            <FormattedMessage id='recive' />
                                            {' ' + format_num_to_K(item.recive_amount) + ' '}
                                            {item.recive_token}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </IntlProvider>
        )
    }

    render = () => {
        return this.renderRecord();
    };
}

