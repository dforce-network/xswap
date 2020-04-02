import React from 'react';
import logo from './logo.svg';
import './App.scss';
import _ from 'lodash';
import Web3 from 'web3';


import logo_lock from './images/lock.svg';
import is_selected from './images/is_selected.svg';
import exchange from './images/exchange.svg';


import BTC from './images/BTC.svg';
import imBTC from './images/imBTC.svg';
import HUBTC from './images/HBTC.svg';
import HBTC from './images/HBTC.svg';
import USDx from './images/USDx.svg';
import UUDD from './images/UUDD.svg';
import USDT from './images/USDT.svg';
import WETH from './images/WETH.svg';
// import telegram from './images/telegram.svg';
// import twitter from './images/twitter.svg';
// import medium from './images/medium.svg';
// import up from './images/up.svg';
import UUTT from './images/USDT.svg';
import WBTC from './images/WBTC.svg';
import DAI from './images/DAI.svg';
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
  get_allowance,
  get_my_balance,
  handle_A_change,
  get_data_first,
  format_bn,
  swap_click,
  handle_approve_click,
  get_exchange__get_fee
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
        UUDD: UUDD,
        imBTC: imBTC,
        USDT: USDT,
        USDx: USDx,
        HUBTC: HUBTC,
        HBTC: HBTC,
        USDC: usdc,
        TUSD: tusd,
        UUTT: UUTT,
        PAX: pax,
        WBTC: WBTC,
        DAI: DAI
      },
      decimals: {
        USDx: 18,
        USDC: 6,
        USDT: 6,
        TUSD: 18,
        PAX: 18,
        DAI: 18,
        HBTC: 18,
        imBTC: 8
      },
      cur_language: navigator.language === 'zh-CN' ? '中文' : 'English',
      show_left_more_token: false,
      cur_send_addr: 'USDT',
      cur_recive_addr: 'USDx'
    }

    this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);
    this.bn = this.new_web3.utils.toBN;
    this.placeholder = navigator.language === 'zh-CN' ? '输入数量' : 'Amount';

    this.new_web3.eth.net.getNetworkType().then(
      (net_type) => {
        console.log(net_type);
        let XSwap = new this.new_web3.eth.Contract(xSwap_abi, address_map[net_type]['XSwap']);
        let USDx = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDx']);
        let imBTC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['imBTC']);
        let USDT = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDT']);
        let HBTC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['HBTC']);
        let USDC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDC']);
        let PAX = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['PAX']);
        let TUSD = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['TUSD']);
        let DAI = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['DAI']);
        console.log(' *** init contract finished *** ');
        this.setState({
          net_type: net_type,
          XSwap: XSwap,
          USDx: USDx,
          imBTC: imBTC,
          USDT: USDT,
          HBTC: HBTC,
          USDC: USDC,
          PAX: PAX,
          TUSD: TUSD,
          DAI: DAI,
          cur_send_contract: USDT,
          cur_recive_contract: USDx,
          cur_send_addr: 'USDT',
          cur_recive_addr: 'USDx',
          cur_send_decimals: 6,
          cur_recive_decimals: 18
        }, () => {
          this.new_web3.givenProvider.enable().then((res_accounts) => {
            console.log(res_accounts[0]);
            this.setState({
              my_account: res_accounts[0],
              load_new_history: Math.random()
            }, () => {
              get_data_first(
                this,
                address_map[net_type]['XSwap'],
                address_map[this.state.net_type][this.state.cur_send_addr],
                address_map[this.state.net_type][this.state.cur_recive_addr]
              );


              get_allowance(this, address_map[net_type]['XSwap']);
              get_my_balance(this);
            })
          })
        })
      }
    )
  }


  change_send_addr = (token) => {
    console.log(token);
    this.setState({
      show_left_more_token: false
    });
    if (token === 'kong') {
      return false;
    }

    if (token === 'imBTC') {
      this.setState({
        cur_send_addr: 'imBTC',
        cur_send_decimals: 8,
        cur_send_contract: this.state.imBTC
      })
    } else if (token === 'USDx') {
      this.setState({
        cur_send_addr: 'USDx',
        cur_send_decimals: 18,
        cur_send_contract: this.state.USDx
      })
    } else if (token === 'HBTC') {
      this.setState({
        cur_send_addr: 'HBTC',
        cur_send_decimals: 18,
        cur_send_contract: this.state.HBTC
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
    }

    get_exchange__get_fee(
      this,
      address_map[this.state.net_type][token],
      address_map[this.state.net_type][this.state.cur_recive_addr]
    );
  }
  change_recive_addr = (token) => {
    console.log(token);
    this.setState({
      show_right_more_token: false
    });
    if (token === 'kong') {
      return false;
    }

    if (token === 'imBTC') {
      this.setState({
        cur_recive_addr: 'imBTC',
        cur_recive_decimals: 8,
        cur_recive_contract: this.state.imBTC
      })
    } else if (token === 'USDx') {
      this.setState({
        cur_recive_addr: 'USDx',
        cur_recive_decimals: 18,
        cur_recive_contract: this.state.USDx
      })
    } else if (token === 'HBTC') {
      this.setState({
        cur_recive_addr: 'HBTC',
        cur_recive_decimals: 18,
        cur_recive_contract: this.state.HBTC
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
    }

    get_exchange__get_fee(
      this,
      address_map[this.state.net_type][this.state.cur_send_addr],
      address_map[this.state.net_type][token]
    );
  }
  change_send_to_recive = () => {
    var t_cur_recive_addr = this.state.cur_recive_addr;
    var t_cur_recive_decimals = this.state.cur_recive_decimals;
    var t_cur_recive_contract = this.state.cur_recive_contract;

    this.setState({
      cur_recive_addr: this.state.cur_send_addr,
      cur_recive_decimals: this.state.cur_send_decimals,
      cur_recive_contract: this.state.cur_send_contract
    }, () => {
      this.setState({
        cur_send_addr: t_cur_recive_addr,
        cur_send_decimals: t_cur_recive_decimals,
        cur_send_contract: t_cur_recive_contract
      })
    })
  }






  render() {
    return (
      <IntlProvider locale={'en'} messages={this.state.cur_language === '中文' ? zh_CN : en_US} >
        <Top
          account={this.state.my_account}
          net_type={this.state.net_type}
        />

        <div className="App">
          <div className="token-balance">
            <div className="token-balance-left">
              <FormattedMessage id='send' />
              {
                this.state.cur_send_addr === 'USDx' &&
                <span className="my-balance">
                  {this.state.my_balance_USDx ? format_bn(this.state.my_balance_USDx, this.state.decimals.USDx, 2) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'USDT' &&
                <span className="my-balance">
                  {this.state.my_balance_USDT ? format_bn(this.state.my_balance_USDT, this.state.decimals.USDT, 2) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'imBTC' &&
                <span className="my-balance">
                  {this.state.my_balance_imBTC ? format_bn(this.state.my_balance_imBTC, this.state.decimals.imBTC, 2) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'HBTC' &&
                <span className="my-balance">
                  {this.state.my_balance_HBTC ? format_bn(this.state.my_balance_HBTC, this.state.decimals.HBTC, 2) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'USDC' &&
                <span className="my-balance">
                  {this.state.my_balance_USDC ? format_bn(this.state.my_balance_USDC, this.state.decimals.USDC, 2) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'PAX' &&
                <span className="my-balance">
                  {this.state.my_balance_PAX ? format_bn(this.state.my_balance_PAX, this.state.decimals.PAX, 2) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'TUSD' &&
                <span className="my-balance">
                  {this.state.my_balance_TUSD ? format_bn(this.state.my_balance_TUSD, this.state.decimals.TUSD, 2) : '···'}
                </span>
              }
              {
                this.state.cur_send_addr === 'DAI' &&
                <span className="my-balance">
                  {this.state.my_balance_DAI ? format_bn(this.state.my_balance_DAI, this.state.decimals.DAI, 2) : '···'}
                </span>
              }
            </div>

            <div className="token-balance-right">
              <FormattedMessage id='recive' />
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
                <img className="token-logo" src={this.state.token[this.state.cur_send_addr]} />
                <span className="token-title">
                  {this.state.cur_send_addr}
                </span>
                <span className={this.state.show_left_more_token ? "token-tips-re" : "token-tips"}></span>

                {
                  this.state.show_left_more_token &&
                  <div className="more-tokens">
                    <div className="more-tokens-token" onClick={() => { this.change_send_addr('imBTC') }}>
                      <img className="token-logo" src={this.state.token.imBTC} />
                      <span className="token-title">
                        imBTC
                        {/* <i>(Tether USD)</i> */}
                      </span>
                      {
                        this.state.cur_send_addr === 'imBTC' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_send_addr('USDT') }}>
                      <img className="token-logo" src={this.state.token.USDT} />
                      <span className="token-title">
                        USDT
                        <i>(Tether USD)</i>
                      </span>
                      {
                        this.state.cur_send_addr === 'USDT' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_send_addr('HBTC') }}>
                      <img className="token-logo" src={this.state.token.HBTC} />
                      <span className="token-title">
                        HBTC
                        {/* <i>(Tether USD)</i> */}
                      </span>
                      {
                        this.state.cur_send_addr === 'HBTC' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_send_addr('USDC') }}>
                      <img className="token-logo" src={this.state.token.USDC} />
                      <span className="token-title">
                        USDC
                        <i>(USD Coin)</i>
                      </span>
                      {
                        this.state.cur_send_addr === 'USDC' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_send_addr('PAX') }}>
                      <img className="token-logo" src={this.state.token.PAX} />
                      <span className="token-title">
                        PAX
                        <i>(Paxos Standard)</i>
                      </span>
                      {
                        this.state.cur_send_addr === 'PAX' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_send_addr('TUSD') }}>
                      <img className="token-logo" src={this.state.token.TUSD} />
                      <span className="token-title">
                        TUSD
                        <i>(True USD)</i>
                      </span>
                      {
                        this.state.cur_send_addr === 'TUSD' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_send_addr('DAI') }}>
                      <img className="token-logo" src={this.state.token.DAI} />
                      <span className="token-title">
                        DAI
                        {/* <i>(True USD)</i> */}
                      </span>
                      {
                        this.state.cur_send_addr === 'DAI' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_send_addr('USDx') }}>
                      <img className="token-logo" src={this.state.token.USDx} />
                      <span className="token-title">
                        USDx
                        {/* <i>(True USD)</i> */}
                      </span>
                      {
                        this.state.cur_send_addr === 'USDx' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

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
            </div>


          </div>

          <div className="exchange">
            <img src={exchange} onClick={() => { this.change_send_to_recive() }} />
          </div>

          {/* right */}
          <div className="other-tokens float-right">
            <div className="other-tokens-left">
              <button
                onClick={() => { this.setState({ show_right_more_token: !this.state.show_right_more_token }) }}
                onBlur={() => { this.change_recive_addr('kong') }}
              >
                <img className="token-logo" src={this.state.token[this.state.cur_recive_addr]} />
                <span className="token-title">
                  {this.state.cur_recive_addr}
                </span>
                <span className={this.state.show_right_more_token ? "token-tips-re" : "token-tips"}></span>

                {
                  this.state.show_right_more_token &&
                  <div className="more-tokens">
                    <div className="more-tokens-token" onClick={() => { this.change_recive_addr('imBTC') }}>
                      <img className="token-logo" src={this.state.token.imBTC} />
                      <span className="token-title">
                        imBTC
                        {/* <i>(Tether USD)</i> */}
                      </span>
                      {
                        this.state.cur_recive_addr === 'imBTC' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_recive_addr('USDT') }}>
                      <img className="token-logo" src={this.state.token.USDT} />
                      <span className="token-title">
                        USDT
                        <i>(Tether USD)</i>
                      </span>
                      {
                        this.state.cur_recive_addr === 'USDT' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_recive_addr('HBTC') }}>
                      <img className="token-logo" src={this.state.token.HBTC} />
                      <span className="token-title">
                        HBTC
                        {/* <i>(Tether USD)</i> */}
                      </span>
                      {
                        this.state.cur_recive_addr === 'HBTC' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_recive_addr('USDC') }}>
                      <img className="token-logo" src={this.state.token.USDC} />
                      <span className="token-title">
                        USDC
                        <i>(USD Coin)</i>
                      </span>
                      {
                        this.state.cur_recive_addr === 'USDC' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_recive_addr('PAX') }}>
                      <img className="token-logo" src={this.state.token.PAX} />
                      <span className="token-title">
                        PAX
                        <i>(Paxos Standard)</i>
                      </span>
                      {
                        this.state.cur_recive_addr === 'PAX' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_recive_addr('TUSD') }}>
                      <img className="token-logo" src={this.state.token.TUSD} />
                      <span className="token-title">
                        TUSD
                        <i>(True USD)</i>
                      </span>
                      {
                        this.state.cur_recive_addr === 'TUSD' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_recive_addr('DAI') }}>
                      <img className="token-logo" src={this.state.token.DAI} />
                      <span className="token-title">
                        DAI
                        {/* <i>(True USD)</i> */}
                      </span>
                      {
                        this.state.cur_recive_addr === 'DAI' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>

                    <div className="more-tokens-token" onClick={() => { this.change_recive_addr('USDx') }}>
                      <img className="token-logo" src={this.state.token.USDx} />
                      <span className="token-title">
                        USDx
                        {/* <i>(True USD)</i> */}
                      </span>
                      {
                        this.state.cur_recive_addr === 'USDx' &&
                        <img className="token-isselected" src={is_selected} />
                      }
                    </div>
                  </div>
                }
              </button>
            </div>
            <div className="other-tokens-right">
              <input
                value={this.state.side_B_amount || ''}
                disabled='disabled'
                placeholder={this.placeholder}
              />
            </div>
          </div>

          <div className='clear'></div>

          <div
            onClick={() => {
              swap_click(
                this,
                address_map[this.state.net_type][this.state.cur_send_addr],
                address_map[this.state.net_type][this.state.cur_recive_addr]
              )
            }}
            className="btn-wrap"
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
                <a href='' target='_blank'>
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
                    <img className='weixin-img' alt='' src={erweima} />
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
                  <img src={arrow_u} alt='' />
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
