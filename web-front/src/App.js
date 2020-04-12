import React from 'react';
import './App.scss';
import Web3 from 'web3';
import is_selected from './images/is_selected.svg';
import exchange from './images/exchange.svg';
import show_tips from './images/show-tips.svg';
import imBTC from './images/imBTC.svg';
import HBTC from './images/HBTC.svg';
import USDx from './images/USDx.svg';
import USDT from './images/USDT.svg';
import WETH from './images/WETH.svg';
import WBTC from './images/WBTC.svg';
import DAI from './images/DAI.svg';
import HUSD from './images/HUSD.svg';
import BUSD from './images/BUSD.svg';
// png
import usdc from './images/usdc.png';
import tusd from './images/tusd.png';
import pax from './images/pax.png';
// add i18n.
import { IntlProvider, FormattedMessage } from 'react-intl';
import en_US from './language/en_US.js';
import zh_CN from './language/zh_CN';
import History from './component/history';
import Top from './component/top';
import Twitter from './images/Twitter.svg';
import Medium from './images/Medium.svg';
import Reddit from './images/Reddit.svg';
import Discord from './images/Discord.svg';
import LinkedIn from './images/LinkedIn.svg';
import Youtube from './images/Youtube.svg';
import Telegram from './images/Telegram.svg';
import erweima from './images/erweima.png';
import weixin from './images/weixin.svg';
import arrow_u from './images/up.svg';
import {
  get_my_balance,
  handle_A_change,
  handle_B_change,
  get_data_first,
  format_bn,
  swap_click,
  swapTo_click,
  get_exchange__get_fee,
  handle_A_max,
  format_num_to_K
} from './utils.js';
let tokens_abi = require('./abi/tokensABI.json');
let xSwap_abi = require('./abi/xSwapABI.json');
let address_map = require('./abi/address_map.json');


export default class App extends React.Component {
  constructor(porps) {
    super(porps);

    this.state = {
      data_is_ok: false,
      token: {
        WETH: WETH,
        imBTC: imBTC,
        USDT: USDT,
        USDx: USDx,
        HBTC: HBTC,
        USDC: usdc,
        TUSD: tusd,
        PAX: pax,
        WBTC: WBTC,
        DAI: DAI,
        WBTC: WBTC,
        HUSD: HUSD,
        BUSD: BUSD
      },
      decimals: {
        HUSD: 8,
        BUSD: 18,
        USDx: 18,
        TUSD: 18,
        PAX: 18,
        DAI: 18,
        USDC: 6,
        USDT: 6,
        imBTC: 8,
        HBTC: 18,
        WBTC: 8
      },
      cur_language: navigator.language === 'zh-CN' ? '中文' : 'English',
      show_left_more_token: false,
      cur_send_addr: 'USDT',
      cur_recive_addr: 'USDx',
      is_stable_coin_send: true,
      is_stable_coin_receive: true
    }

    this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);
    this.bn = this.new_web3.utils.toBN;
    this.placeholder = navigator.language === 'zh-CN' ? '输入数量' : 'Amount';

    this.new_web3.eth.net.getNetworkType().then(
      (net_type) => {
        console.log(net_type);
        let HBTC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['HBTC']);
        let HUSD = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['HUSD']);
        let BUSD = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['BUSD']);
        let imBTC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['imBTC']);
        let WBTC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['WBTC']);
        let XSwap_stable = new this.new_web3.eth.Contract(xSwap_abi, address_map[net_type]['XSwap_stable']);
        let XSwap_btc = new this.new_web3.eth.Contract(xSwap_abi, address_map[net_type]['XSwap_btc']);
        let USDx = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDx']);
        let USDT = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDT']);
        let USDC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDC']);
        let PAX = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['PAX']);
        let TUSD = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['TUSD']);
        let DAI = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['DAI']);
        console.log(' *** init contract finished *** ');
        this.setState({
          net_type: net_type,
          XSwap_stable: XSwap_stable,
          XSwap_btc: XSwap_btc,
          USDx: USDx,
          imBTC: imBTC,
          USDT: USDT,
          HBTC: HBTC,
          USDC: USDC,
          PAX: PAX,
          TUSD: TUSD,
          DAI: DAI,
          WBTC: WBTC,
          HUSD: HUSD,
          BUSD: BUSD,
          cur_send_contract: USDT,
          cur_recive_contract: USDx,
          cur_send_addr: 'USDT',
          cur_recive_addr: 'USDx',
          cur_send_decimals: 6,
          cur_recive_decimals: 18,
          is_from_right_input: false
        }, () => {
          this.new_web3.givenProvider.enable().then((res_accounts) => {
            console.log(res_accounts[0]);
            this.setState({
              my_account: res_accounts[0],
              load_new_history: Math.random()
            }, () => {
              get_data_first(
                this,
                address_map[net_type]['XSwap_stable'],
                address_map[this.state.net_type][this.state.cur_send_addr],
                address_map[this.state.net_type][this.state.cur_recive_addr]
              );
              get_my_balance(this);
            })
          })
        })
      }
    )

    // add accounts changed
    if (window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => {
        // console.log('accountsChanged: ', accounts[0]);
        this.setState({
          my_account: accounts[0],
        }, () => {
          get_data_first(
            this,
            address_map[this.state.net_type]['XSwap_stable'],
            address_map[this.state.net_type][this.state.cur_send_addr],
            address_map[this.state.net_type][this.state.cur_recive_addr]
          );
          get_my_balance(this);
          this.setState({ load_new_history: Math.random() });
        })
      });
    }
  }


  change_send_addr = (token) => {
    // console.log(token);
    var t_bool;
    var t_cur_recive_addr;

    this.setState({
      show_left_more_token: false,
      side_A_amount: '',
      side_B_amount: ''
    });
    if (token === 'kong') {
      return false;
    }

    if (token === 'imBTC' || token === 'HBTC' || token === 'WBTC') {
      this.setState({
        is_stable_coin_send: false,
        is_stable_coin_receive: false
      });
      t_bool = false;
      if (token === 'imBTC') {
        this.setState({
          cur_recive_addr: 'HBTC',
          cur_recive_decimals: 18,
          cur_recive_contract: this.state.HBTC
        });
        t_cur_recive_addr = 'HBTC';
      } else if (token === 'HBTC' || token === 'WBTC') {
        this.setState({
          cur_recive_addr: 'imBTC',
          cur_recive_decimals: 8,
          cur_recive_contract: this.state.imBTC
        })
        t_cur_recive_addr = 'imBTC';
      }
    } else {
      if (!this.state.is_stable_coin_send) {
        if (token === 'USDT' || token === 'USDC' || token === 'PAX' || token === 'TUSD' || token === 'DAI' || token === 'HUSD' || token === 'BUSD') {
          this.setState({
            cur_recive_addr: 'USDx',
            cur_recive_decimals: 18,
            cur_recive_contract: this.state.USDx
          })
          t_cur_recive_addr = 'USDx';
        } else {
          this.setState({
            cur_recive_addr: 'USDT',
            cur_recive_decimals: 6,
            cur_recive_contract: this.state.USDT
          })
          t_cur_recive_addr = 'USDT';
        }
      }
      this.setState({
        is_stable_coin_send: true,
        is_stable_coin_receive: true
      });
      t_bool = true;
    }

    if (token === 'imBTC') {
      this.setState({
        cur_send_addr: 'imBTC',
        cur_send_decimals: 8,
        cur_send_contract: this.state.imBTC
      })
    } else if (token === 'HBTC') {
      this.setState({
        cur_send_addr: 'HBTC',
        cur_send_decimals: 18,
        cur_send_contract: this.state.HBTC
      })
    } else if (token === 'WBTC') {
      this.setState({
        cur_send_addr: 'WBTC',
        cur_send_decimals: 8,
        cur_send_contract: this.state.WBTC
      })
    } else if (token === 'USDx') {
      this.setState({
        cur_send_addr: 'USDx',
        cur_send_decimals: 18,
        cur_send_contract: this.state.USDx
      })
    } else if (token === 'DAI') {
      this.setState({
        cur_send_addr: 'DAI',
        cur_send_decimals: 18,
        cur_send_contract: this.state.DAI
      })
    } else if (token === 'PAX') {
      this.setState({
        cur_send_addr: 'PAX',
        cur_send_decimals: 18,
        cur_send_contract: this.state.PAX
      })
    } else if (token === 'TUSD') {
      this.setState({
        cur_send_addr: 'TUSD',
        cur_send_decimals: 18,
        cur_send_contract: this.state.TUSD
      })
    } else if (token === 'USDT') {
      this.setState({
        cur_send_addr: 'USDT',
        cur_send_decimals: 6,
        cur_send_contract: this.state.USDT
      })
    } else if (token === 'USDC') {
      this.setState({
        cur_send_addr: 'USDC',
        cur_send_decimals: 6,
        cur_send_contract: this.state.USDC
      })
    } else if (token === 'HUSD') {
      this.setState({
        cur_send_addr: 'HUSD',
        cur_send_decimals: 8,
        cur_send_contract: this.state.HUSD
      })
    } else if (token === 'BUSD') {
      this.setState({
        cur_send_addr: 'BUSD',
        cur_send_decimals: 18,
        cur_send_contract: this.state.BUSD
      })
    }

    if (!t_cur_recive_addr) {
      t_cur_recive_addr = this.state.cur_recive_addr;
    }
    get_exchange__get_fee(
      this,
      address_map[this.state.net_type][token],
      address_map[this.state.net_type][t_cur_recive_addr],
      t_bool
    );
  }
  change_recive_addr = (token) => {
    // console.log(token);
    var t_bool;

    this.setState({
      show_right_more_token: false,
      side_A_amount: '',
      side_B_amount: ''
    });
    if (token === 'kong') {
      return false;
    }

    if (token === 'imBTC' || token === 'HBTC' || token === 'WBTC') {
      this.setState({ is_stable_coin_receive: false })
      t_bool = false;
    } else {
      this.setState({ is_stable_coin_receive: true })
      t_bool = true;
    }

    if (token === 'imBTC') {
      this.setState({
        cur_recive_addr: 'imBTC',
        cur_recive_decimals: 8,
        cur_recive_contract: this.state.imBTC
      })
    } else if (token === 'HBTC') {
      this.setState({
        cur_recive_addr: 'HBTC',
        cur_recive_decimals: 18,
        cur_recive_contract: this.state.HBTC
      })
    } else if (token === 'WBTC') {
      this.setState({
        cur_recive_addr: 'WBTC',
        cur_recive_decimals: 8,
        cur_recive_contract: this.state.WBTC
      })
    } else if (token === 'USDx') {
      this.setState({
        cur_recive_addr: 'USDx',
        cur_recive_decimals: 18,
        cur_recive_contract: this.state.USDx
      })
    } else if (token === 'DAI') {
      this.setState({
        cur_recive_addr: 'DAI',
        cur_recive_decimals: 18,
        cur_recive_contract: this.state.DAI
      })
    } else if (token === 'PAX') {
      this.setState({
        cur_recive_addr: 'PAX',
        cur_recive_decimals: 18,
        cur_recive_contract: this.state.PAX
      })
    } else if (token === 'TUSD') {
      this.setState({
        cur_recive_addr: 'TUSD',
        cur_recive_decimals: 18,
        cur_recive_contract: this.state.TUSD
      })
    } else if (token === 'USDT') {
      this.setState({
        cur_recive_addr: 'USDT',
        cur_recive_decimals: 6,
        cur_recive_contract: this.state.USDT
      })
    } else if (token === 'USDC') {
      this.setState({
        cur_recive_addr: 'USDC',
        cur_recive_decimals: 6,
        cur_recive_contract: this.state.USDC
      })
    } else if (token === 'HUSD') {
      this.setState({
        cur_recive_addr: 'HUSD',
        cur_recive_decimals: 8,
        cur_recive_contract: this.state.HUSD
      })
    } else if (token === 'BUSD') {
      this.setState({
        cur_recive_addr: 'BUSD',
        cur_recive_decimals: 18,
        cur_recive_contract: this.state.BUSD
      })
    }

    get_exchange__get_fee(
      this,
      address_map[this.state.net_type][this.state.cur_send_addr],
      address_map[this.state.net_type][token],
      t_bool
    );
  }
  change_send_to_recive = () => {
    // console.log('side_A_amount:', this.state.side_A_amount);
    // console.log('side_B_amount:', this.state.side_B_amount);
    this.setState({
      side_A_amount: '',
      is_wap_enable: false,
      side_B_amount: '',
      is_Insufficient_Balance: false,
      is_liquidity_limit: false
    })

    var t_cur_recive_addr = this.state.cur_recive_addr;
    var t_cur_recive_decimals = this.state.cur_recive_decimals;
    var t_cur_recive_contract = this.state.cur_recive_contract;

    this.setState({
      cur_recive_addr: this.state.cur_send_addr,
      cur_recive_decimals: this.state.cur_send_decimals,
      cur_recive_contract: this.state.cur_send_contract,
      is_stable_coin_send: this.state.is_stable_coin_receive
    }, () => {
      this.setState({
        cur_send_addr: t_cur_recive_addr,
        cur_send_decimals: t_cur_recive_decimals,
        cur_send_contract: t_cur_recive_contract
      }, () => {
        // if (!this.state.side_B_amount) {
        //   return false;
        // }
        // handle_A_change(this.state.side_B_amount, this);
        // this.setState({
        //   side_B_amount: ''
        // });
      })
    })
  }

  componentDidMount = () => {
    setInterval(() => {
      if (!this.state.my_account) {
        return false;
      }

      console.log('*** get_my_balance ***');
      get_my_balance(this);
    }, 1000 * 5);
  }
  before_swap_click = () => {
    if (this.state.is_from_right_input) {
      console.log('*** swapTo ***');
      swapTo_click(
        this,
        address_map[this.state.net_type][this.state.cur_send_addr],
        address_map[this.state.net_type][this.state.cur_recive_addr]
      );
    } else {
      console.log('*** swap ***');
      swap_click(
        this,
        address_map[this.state.net_type][this.state.cur_send_addr],
        address_map[this.state.net_type][this.state.cur_recive_addr]
      );
    }
  }

  connect = () => {
    console.log('click connected');
    this.new_web3.givenProvider.enable().then(res_accounts => {
      this.setState({
        my_account: res_accounts[0]
      }, () => {
        // console.log('connected: ', this.state.my_account)
        get_data_first(
          this,
          address_map[this.state.net_type]['XSwap_stable'],
          address_map[this.state.net_type][this.state.cur_send_addr],
          address_map[this.state.net_type][this.state.cur_recive_addr]
        );
        get_my_balance(this);
      })
    })
  }



  render() {
    return (
      <IntlProvider locale={'en'} messages={this.state.cur_language === '中文' ? zh_CN : en_US} >
        <Top
          account={this.state.my_account}
          net_type={this.state.net_type}
          fn_connect={() => { this.connect() }}
        />

        <div className="App">
          <div className="token-balance">
            <div className="token-balance-left">
              <FormattedMessage id='send' />
              {
                this.state.cur_send_addr === 'USDx' &&
                <span className="my-balance">
                  {this.state.my_balance_USDx ? format_num_to_K(format_bn(this.state.my_balance_USDx, this.state.decimals.USDx, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'USDT' &&
                <span className="my-balance">
                  {this.state.my_balance_USDT ? format_num_to_K(format_bn(this.state.my_balance_USDT, this.state.decimals.USDT, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'USDC' &&
                <span className="my-balance">
                  {this.state.my_balance_USDC ? format_num_to_K(format_bn(this.state.my_balance_USDC, this.state.decimals.USDC, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'PAX' &&
                <span className="my-balance">
                  {this.state.my_balance_PAX ? format_num_to_K(format_bn(this.state.my_balance_PAX, this.state.decimals.PAX, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'TUSD' &&
                <span className="my-balance">
                  {this.state.my_balance_TUSD ? format_num_to_K(format_bn(this.state.my_balance_TUSD, this.state.decimals.TUSD, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'DAI' &&
                <span className="my-balance">
                  {this.state.my_balance_DAI ? format_num_to_K(format_bn(this.state.my_balance_DAI, this.state.decimals.DAI, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'WBTC' &&
                <span className="my-balance">
                  {this.state.my_balance_WBTC ? format_num_to_K(format_bn(this.state.my_balance_WBTC, this.state.decimals.WBTC, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'imBTC' &&
                <span className="my-balance">
                  {this.state.my_balance_imBTC ? format_num_to_K(format_bn(this.state.my_balance_imBTC, this.state.decimals.imBTC, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'HBTC' &&
                <span className="my-balance">
                  {this.state.my_balance_HBTC ? format_num_to_K(format_bn(this.state.my_balance_HBTC, this.state.decimals.HBTC, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'HUSD' &&
                <span className="my-balance">
                  {this.state.my_balance_HUSD ? format_num_to_K(format_bn(this.state.my_balance_HUSD, this.state.decimals.HUSD, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'BUSD' &&
                <span className="my-balance">
                  {this.state.my_balance_BUSD ? format_num_to_K(format_bn(this.state.my_balance_BUSD, this.state.decimals.BUSD, 2)) : '···'}
                </span>
              }
            </div>

            <div className="token-balance-right">
              <FormattedMessage id='recive' />
              {
                this.state.cur_recive_addr === 'USDx' &&
                <span className="my-balance">
                  {this.state.my_balance_USDx ? format_num_to_K(format_bn(this.state.my_balance_USDx, this.state.decimals.USDx, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'USDT' &&
                <span className="my-balance">
                  {this.state.my_balance_USDT ? format_num_to_K(format_bn(this.state.my_balance_USDT, this.state.decimals.USDT, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'USDC' &&
                <span className="my-balance">
                  {this.state.my_balance_USDC ? format_num_to_K(format_bn(this.state.my_balance_USDC, this.state.decimals.USDC, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'PAX' &&
                <span className="my-balance">
                  {this.state.my_balance_PAX ? format_num_to_K(format_bn(this.state.my_balance_PAX, this.state.decimals.PAX, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'TUSD' &&
                <span className="my-balance">
                  {this.state.my_balance_TUSD ? format_num_to_K(format_bn(this.state.my_balance_TUSD, this.state.decimals.TUSD, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'DAI' &&
                <span className="my-balance">
                  {this.state.my_balance_DAI ? format_num_to_K(format_bn(this.state.my_balance_DAI, this.state.decimals.DAI, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'imBTC' &&
                <span className="my-balance">
                  {this.state.my_balance_imBTC ? format_num_to_K(format_bn(this.state.my_balance_imBTC, this.state.decimals.imBTC, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'HBTC' &&
                <span className="my-balance">
                  {this.state.my_balance_HBTC ? format_num_to_K(format_bn(this.state.my_balance_HBTC, this.state.decimals.HBTC, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'WBTC' &&
                <span className="my-balance">
                  {this.state.my_balance_WBTC ? format_num_to_K(format_bn(this.state.my_balance_WBTC, this.state.decimals.WBTC, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'HUSD' &&
                <span className="my-balance">
                  {this.state.my_balance_HUSD ? format_num_to_K(format_bn(this.state.my_balance_HUSD, this.state.decimals.HUSD, 2)) : '···'}
                </span>
              }
              {
                this.state.cur_recive_addr === 'BUSD' &&
                <span className="my-balance">
                  {this.state.my_balance_BUSD ? format_num_to_K(format_bn(this.state.my_balance_BUSD, this.state.decimals.BUSD, 2)) : '···'}
                </span>
              }
            </div>
            <div className="clear"></div>
          </div>

          {/* left */}
          <div className="other-tokens float-left">
            <div className="other-tokens-left">
              <button
                onClick={() => { this.setState({ show_left_more_token: !this.state.show_left_more_token }) }}
                onBlur={() => { this.change_send_addr('kong') }}
              >
                <img alt='' className="token-logo" src={this.state.token[this.state.cur_send_addr]} />
                <span className="token-title">
                  {this.state.cur_send_addr}
                </span>
                <span className={this.state.show_left_more_token ? "token-tips-re" : "token-tips"}></span>

                {
                  this.state.show_left_more_token &&
                  <div className="more-tokens">
                    {
                      this.state.cur_recive_addr !== 'USDx' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('USDx') }}>
                        <img alt='' className="token-logo" src={this.state.token.USDx} />
                        <span className="token-title">
                          USDx
                      </span>
                        {
                          this.state.cur_send_addr === 'USDx' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'USDT' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('USDT') }}>
                        <img alt='' className="token-logo" src={this.state.token.USDT} />
                        <span className="token-title">
                          USDT
                          <i>(Tether USD)</i>
                        </span>
                        {
                          this.state.cur_send_addr === 'USDT' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'DAI' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('DAI') }}>
                        <img alt='' className="token-logo" src={this.state.token.DAI} />
                        <span className="token-title">
                          DAI
                        </span>
                        {
                          this.state.cur_send_addr === 'DAI' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'HUSD' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('HUSD') }}>
                        <img alt='' className="token-logo" src={this.state.token.HUSD} />
                        <span className="token-title">
                          HUSD
                        </span>
                        {
                          this.state.cur_send_addr === 'HUSD' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'BUSD' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('BUSD') }}>
                        <img alt='' className="token-logo" src={this.state.token.BUSD} />
                        <span className="token-title">
                          BUSD
                        </span>
                        {
                          this.state.cur_send_addr === 'BUSD' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'USDC' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('USDC') }}>
                        <img alt='' className="token-logo" src={this.state.token.USDC} />
                        <span className="token-title">
                          USDC
                          <i>(USD Coin)</i>
                        </span>
                        {
                          this.state.cur_send_addr === 'USDC' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'PAX' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('PAX') }}>
                        <img alt='' className="token-logo" src={this.state.token.PAX} />
                        <span className="token-title">
                          PAX
                          <i>(Paxos Standard)</i>
                        </span>
                        {
                          this.state.cur_send_addr === 'PAX' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'TUSD' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('TUSD') }}>
                        <img alt='' className="token-logo" src={this.state.token.TUSD} />
                        <span className="token-title">
                          TUSD
                          <i>(True USD)</i>
                        </span>
                        {
                          this.state.cur_send_addr === 'TUSD' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'imBTC' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('imBTC') }}>
                        <img alt='' className="token-logo" src={this.state.token.imBTC} />
                        <span className="token-title">
                          imBTC
                        </span>
                        {
                          this.state.cur_send_addr === 'imBTC' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'HBTC' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('HBTC') }}>
                        <img alt='' className="token-logo" src={this.state.token.HBTC} />
                        <span className="token-title">
                          HBTC
                        </span>
                        {
                          this.state.cur_send_addr === 'HBTC' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      this.state.cur_recive_addr !== 'WBTC' &&
                      <div className="more-tokens-token" onClick={() => { this.change_send_addr('WBTC') }}>
                        <img alt='' className="token-logo" src={this.state.token.WBTC} />
                        <span className="token-title">
                          WBTC
                        </span>
                        {
                          this.state.cur_send_addr === 'WBTC' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }

                  </div>
                }
              </button>
            </div>

            <div className="other-tokens-right">
              <input
                value={this.state.side_A_amount || ''}
                onChange={(e) => handle_A_change(e.target.value, this)}
                placeholder={this.placeholder}
              />
              <span
                onClick={() => handle_A_max(this)}
                className="other-tokens-right-max"
              >
                MAX
              </span>
            </div>

            <div className="other-tokens-rate">
              1 {this.state.cur_send_addr} = {' '}
              {
                this.state.cur_exchange ?
                  format_bn((this.bn(this.state.cur_exchange).div(this.bn(10 ** 10))).toString(), 8, 8)
                  : '···'
              }
              {' ' + this.state.cur_recive_addr}
            </div>
          </div>

          <div className="exchange">
            <img alt='' className='exc' src={exchange} onClick={() => { this.change_send_to_recive() }} />

            {
              this.state.is_Insufficient_Balance &&
              <div className='show-tips'>
                <img alt='' className='show-tips-img' src={show_tips} />
                <span className='show-tips-text'>
                  <FormattedMessage id='Insufficient_Balance' />
                </span>
              </div>
            }
            {
              this.state.is_liquidity_limit &&
              <div className='show-tips'>
                <img alt='' className='show-tips-img' src={show_tips} />
                <span className='show-tips-text'>
                  <FormattedMessage id='Insufficient_Liquidity' />
                </span>
              </div>
            }
          </div>

          {/* right */}
          <div className="other-tokens float-right">
            <div className="other-tokens-left">
              <button
                onClick={() => { this.setState({ show_right_more_token: !this.state.show_right_more_token }) }}
                onBlur={() => { this.change_recive_addr('kong') }}
              >
                <img alt='' className="token-logo" src={this.state.token[this.state.cur_recive_addr]} />
                <span className="token-title">
                  {this.state.cur_recive_addr}
                </span>
                <span className={this.state.show_right_more_token ? "token-tips-re" : "token-tips"}></span>

                {
                  this.state.show_right_more_token &&
                  <div className="more-tokens">
                    {
                      (this.state.is_stable_coin_send && this.state.cur_send_addr !== 'USDx') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('USDx') }}>
                        <img alt='' className="token-logo" src={this.state.token.USDx} />
                        <span className="token-title">
                          USDx
                      </span>
                        {
                          this.state.cur_recive_addr === 'USDx' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (this.state.is_stable_coin_send && this.state.cur_send_addr !== 'USDT') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('USDT') }}>
                        <img alt='' className="token-logo" src={this.state.token.USDT} />
                        <span className="token-title">
                          USDT
                        <i>(Tether USD)</i>
                        </span>
                        {
                          this.state.cur_recive_addr === 'USDT' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (this.state.is_stable_coin_send && this.state.cur_send_addr !== 'DAI') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('DAI') }}>
                        <img alt='' className="token-logo" src={this.state.token.DAI} />
                        <span className="token-title">
                          DAI
                      </span>
                        {
                          this.state.cur_recive_addr === 'DAI' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (this.state.is_stable_coin_send && this.state.cur_send_addr !== 'HUSD') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('HUSD') }}>
                        <img alt='' className="token-logo" src={this.state.token.HUSD} />
                        <span className="token-title">
                          HUSD
                      </span>
                        {
                          this.state.cur_recive_addr === 'HUSD' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (this.state.is_stable_coin_send && this.state.cur_send_addr !== 'BUSD') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('BUSD') }}>
                        <img alt='' className="token-logo" src={this.state.token.BUSD} />
                        <span className="token-title">
                          BUSD
                      </span>
                        {
                          this.state.cur_recive_addr === 'BUSD' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (this.state.is_stable_coin_send && this.state.cur_send_addr !== 'USDC') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('USDC') }}>
                        <img alt='' className="token-logo" src={this.state.token.USDC} />
                        <span className="token-title">
                          USDC
                          <i>(USD Coin)</i>
                        </span>
                        {
                          this.state.cur_recive_addr === 'USDC' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (this.state.is_stable_coin_send && this.state.cur_send_addr !== 'PAX') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('PAX') }}>
                        <img alt='' className="token-logo" src={this.state.token.PAX} />
                        <span className="token-title">
                          PAX
                          <i>(Paxos Standard)</i>
                        </span>
                        {
                          this.state.cur_recive_addr === 'PAX' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (this.state.is_stable_coin_send && this.state.cur_send_addr !== 'TUSD') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('TUSD') }}>
                        <img alt='' className="token-logo" src={this.state.token.TUSD} />
                        <span className="token-title">
                          TUSD
                        <i>(True USD)</i>
                        </span>
                        {
                          this.state.cur_recive_addr === 'TUSD' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (!this.state.is_stable_coin_send && this.state.cur_send_addr !== 'imBTC') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('imBTC') }}>
                        <img alt='' className="token-logo" src={this.state.token.imBTC} />
                        <span className="token-title">
                          imBTC
                        </span>
                        {
                          this.state.cur_recive_addr === 'imBTC' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (!this.state.is_stable_coin_send && this.state.cur_send_addr !== 'HBTC') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('HBTC') }}>
                        <img alt='' className="token-logo" src={this.state.token.HBTC} />
                        <span className="token-title">
                          HBTC
                        </span>
                        {
                          this.state.cur_recive_addr === 'HBTC' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                    {
                      (!this.state.is_stable_coin_send && this.state.cur_send_addr !== 'WBTC') &&
                      <div className="more-tokens-token" onClick={() => { this.change_recive_addr('WBTC') }}>
                        <img alt='' className="token-logo" src={this.state.token.WBTC} />
                        <span className="token-title">
                          WBTC
                        </span>
                        {
                          this.state.cur_recive_addr === 'WBTC' &&
                          <img alt='' className="token-isselected" src={is_selected} />
                        }
                      </div>
                    }
                  </div>
                }
              </button>
            </div>
            <div className="other-tokens-right">
              <input
                value={this.state.side_B_amount || ''}
                // disabled='disabled'
                placeholder={this.placeholder}
                onChange={(e) => handle_B_change(e.target.value, this)}
              />
            </div>
          </div>

          <div className='clear'></div>

          <div
            onClick={() => { this.before_swap_click() }}
            className={this.state.is_wap_enable ? "btn-wrap" : "btn-wrap-disable"}
          >
            <FormattedMessage id='swap' />
          </div>

          <History
            account={this.state.my_account}
            net_type={this.state.net_type}
            new_web3={this.new_web3}
            load_new_history={this.state.load_new_history}
            cur_language={this.state.cur_language}
          />


          {/* foot */}
          <div className="foot">
            <div className="foot-item">
              <div className="foot-item-title">
                <FormattedMessage id='Resource' />
              </div>
              <div className="foot-item-content">
                <a href='' target='_blank' rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
              <div className="foot-item-content">
                <a href='' target='_blank' rel="noopener noreferrer">
                  FAQ
                </a>
              </div>
            </div>

            <div className="foot-item">
              <div className="foot-item-title">
                <FormattedMessage id='Community' />
              </div>
              <div className="foot-item-content icom-a">
                <a href='https://twitter.com/dForcenet' target='_blank' rel="noopener noreferrer">
                  <img alt='' src={Twitter} />
                </a>
                <a href='https://t.me/dforcenet' target='_blank' rel="noopener noreferrer">
                  <img alt='' src={Telegram} />
                </a>
                <a href='https://medium.com/dforcenet' target='_blank' rel="noopener noreferrer">
                  <img alt='' src={Medium} />
                </a>
                <a href='https://www.reddit.com/r/dForceNetwork' target='_blank' rel="noopener noreferrer">
                  <img alt='' src={Reddit} />
                </a>
                <a href='https://discord.gg/Gbtd3MR' target='_blank' rel="noopener noreferrer">
                  <img alt='' src={Discord} />
                </a>
                <a href='https://www.linkedin.com/company/dforce-network' target='_blank' rel="noopener noreferrer">
                  <img alt='' src={LinkedIn} />
                </a>
                <a href='https://www.youtube.com/channel/UCM6Vgoc-BhFGG11ZndUr6Ow' target='_blank' rel="noopener noreferrer">
                  <img alt='' src={Youtube} />
                </a>
                {
                  this.state.cur_language === '中文' &&
                  <span className='weixin-img-wrap'>
                    <img alt='' src={weixin} />
                    <img alt='' className='weixin-img' src={erweima} />
                  </span>
                }
              </div>

              <div className='footer-right-fixed'>
                <div className='fixed1'>
                  {
                    this.state.cur_language
                  }
                </div>
                <span className='fixed-img'>
                  <img alt='' src={arrow_u} />
                </span>
                <div className='fixed2'>
                  <ul>
                    <li onClick={() => { this.setState({ cur_language: '中文' }) }}>{'中文'}</li>
                    <li onClick={() => { this.setState({ cur_language: 'English' }) }}>{'English'}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="foot-item padding-left20">
              <div className="foot-item-title">
                <FormattedMessage id='Contract_US' />
              </div>
              <div className="foot-item-content">
                contacts@dforce.network
              </div>
              <div className="foot-item-content">
                bd@dforce.network
              </div>
              <div className="foot-item-content">
                tech@dforce.network
              </div>
            </div>
            <div className="clear"></div>
          </div>


        </div>
      </IntlProvider>
    )
  }
}
