import React from 'react';
import './App.scss';
import './header.scss';
import 'antd/dist/antd.css';
import is_selected from './images/is_selected.svg';
import exchange from './images/exchange.svg';
import exchange_mob from './images/exchange_mob.svg';
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
import logo_xswap from './images/logo-dforce.svg';
import close from './images/close.svg';
import close_new from './images/close-new.svg';
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
import Twitter from './images/twitter.svg';
import Medium from './images/medium.svg';
import Reddit from './images/Reddit.svg';
import Discord from './images/Discord.svg';
import LinkedIn from './images/LinkedIn.svg';
import Youtube from './images/Youtube.svg';
import Telegram from './images/telegram.svg';
import erweima from './images/erweima.png';
import weixin from './images/weixin.svg';
import arrow_u from './images/up.svg';
import arrow_d from './images/arrow_d.svg';//
import img_is_open from './images/img_is_open.svg';
import { Menu, Dropdown, Drawer, Collapse, Modal } from 'antd';


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
      is_stable_coin_receive: true,
      showonly: false,
      meun1: true,
      meun2: true,
      meun3: true,
      is_open: true
    }
  }



  render() {
    return (
      <IntlProvider locale={'en'} messages={this.state.cur_language === '中文' ? zh_CN : en_US} >
        <div className={'header'}>
          <a href="/" className={'header__logo'}>
            <img src={logo_xswap} alt="logo" />
          </a>

          <div className={'header__menu'}>
            <Dropdown
              overlay={
                <Menu className={'header__overlay'}>
                  <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="https://usdx.dforce.network/" className={'header__overlay_item'}>
                      <span>{'USDx'}</span>
                      <label><FormattedMessage id='Portal' /></label>
                    </a>
                  </Menu.Item>
                  {/* <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="/" className={'header__overlay_item'}>
                      <span>{'DIP001'}</span>
                      <label>{'Collateral Lending Dashboard'}</label>
                    </a>
                  </Menu.Item> */}
                </Menu>
              }
            >
              <span className={'header__menu_item'}>
                <label><FormattedMessage id='dForce_Stablecoin' /></label>
                <img src={arrow_d} alt="down" />
              </span>
            </Dropdown>

            {/* <Dropdown
              overlay={
                <Menu className={'header__overlay'}>
                  <Menu.Item>
                    <a target="_blank" rel="noopener noreferrer" href="https://lendf.me" className={'header__overlay_item'}>
                      <span>{'LendfMe'}</span>
                      <label>{'Lend and Borrow'}</label>
                    </a>
                  </Menu.Item>
                </Menu>
              }
            >
              <span className={'header__menu_item'}>
                <label>{'Yield Market'}</label>
                <img src={arrow_d} alt="down" />
              </span>
            </Dropdown> */}

            <Dropdown
              overlay={
                <Menu className={'header__overlay'}>
                  <Menu.Item>
                    <a rel="noopener noreferrer" href="https://trade.dforce.network/" className={'header__overlay_item'}>
                      <span>{'dForce Trading'}</span>
                      <label>
                        <FormattedMessage id='Instant_Swap_of_Stable_Assets' />
                      </label>
                    </a>
                  </Menu.Item>
                </Menu>
              }
            >
              <span className={'header__menu_item'}>
                <label><FormattedMessage id='Exchange_Market' /></label>
                <img src={arrow_d} alt="down" />
              </span>
            </Dropdown>
            <a className={'header__menu_wallet'}>
              <FormattedMessage id='connect' />
            </a>
          </div>
        </div>

        {/* mobile tips */}
        <div className={this.state.showonly ? 'mobile-only' : 'disn'}>
          <div className='wrap-mob'>
            <div className='only-left'>
              <img src={logo_xswap} alt='' />
            </div>
            <div className='only-right'>
              <img src={close_new} alt='' onClick={() => { this.setState({ showonly: false }) }} />
            </div>
            <div className='clear'></div>
          </div>
          <div className='only-kong'></div>

          <h1 onClick={() => { this.setState({ meun1: !this.state.meun1 }) }}>
            <FormattedMessage id='dForce_Stablecoin' />
            <span>
              <img src={this.state.meun1 ? arrow_u : arrow_d} />
            </span>
          </h1>
          <div className={this.state.meun1 ? 'meun1' : 'only1px'}>
            <div className='m-item'>
              <a href='https://usdx.dforce.network/' target='_blank' rel="noopener noreferrer">
                <span className='title'>USDx</span>
              </a>
              <span className='details'><FormattedMessage id='Portal' /></span>
            </div>

            {/* <div className='m-item'>
              <a href='https://dip001.dforce.network/' target='_blank' rel="noopener noreferrer">
                <span className='title'>DIP001</span>
              </a>
              <span className='details'>Collateral Lending Dashboard</span>
            </div> */}
          </div>


          {/* <h1 onClick={() => { this.setState({ meun2: !this.state.meun2 }) }}>
            Yield Market
            <span>
              <img src={this.state.meun2 ? arrow_u : arrow_d} />
            </span>
          </h1>
          <div className={this.state.meun2 ? 'meun1' : 'only1px'}>
            <div className='m-item'>
              <a href='https://www.lendf.me/' target='_blank' rel="noopener noreferrer">
                <span className='title'>LendfMe</span>
              </a>
              <span className='details'>Lend and Borrow</span>
            </div>
          </div> */}


          <h1 onClick={() => { this.setState({ meun3: !this.state.meun3 }) }}>
            <FormattedMessage id='Exchange_Market' />
            <span>
              <img src={this.state.meun3 ? arrow_u : arrow_d} />
            </span>
          </h1>
          <div className={this.state.meun3 ? 'meun1' : 'only1px'}>
            <div className='m-item'>
              <a href='https://trade.dforce.network/' rel="noopener noreferrer">
                <span className='title'>dForce Trading</span>
              </a>
              <span className='details'>
                <FormattedMessage id='Instant_Swap_of_Stable_Assets' />
              </span>
            </div>
          </div>

        </div>


        <div className="App">

          <div className='wrap-mob'>
            <div className='only-left'>
              <img src={logo_xswap} alt='' />
            </div>
            <div className='only-right'>
              <img src={close} alt='' onClick={() => { this.setState({ showonly: true }) }} />
            </div>
            <div className='clear'></div>
          </div>
          <div className="slogon" style={{ letterSpacing: this.state.cur_language === '中文' ? '5px' : '0px' }}>
            <FormattedMessage id='slogon' />
          </div>


          <div className='other-tokens-wrap'>
            {/* left */}
            <div className="other-tokens float-left">
              <div className="token-balance-left">
                <FormattedMessage id='send' />
                <span className="my-balance">
                  {'···'}
                </span>
                <span className="my-balance-title">
                  <FormattedMessage id='balance' />:
              </span>
              </div>

              <div className="other-tokens-left">
                <button>
                  <img alt='' className="token-logo" src={this.state.token[this.state.cur_send_addr]} />
                  <span className="token-title">
                    {this.state.cur_send_addr}
                  </span>
                  <span className={this.state.show_left_more_token ? "token-tips-re" : "token-tips"}></span>
                </button>
              </div>

              <div className="other-tokens-right">
                <input
                  value={this.state.side_A_amount || ''}
                  placeholder={this.state.cur_language === '中文' ? '输入数量' : 'Amount'}
                />
                <span
                  className="other-tokens-right-max"
                >
                  MAX
              </span>
              </div>

              <div className="other-tokens-rate">
                1 {this.state.cur_send_addr} = {' '}
                {'···'}
                {' ' + this.state.cur_recive_addr}
                {/* {' (inclusive of fees)'} */}
              </div>
              <div className="other-tokens-rate-p">
                {'Fee: 0.00%'}
              </div>
            </div>

            <div className="exchange">
              <img alt='' className='exc' src={exchange} />
              <img alt='' className='exc_mob' src={exchange_mob} />
            </div>

            {/* right */}
            <div className="other-tokens float-right">
              <div className="token-balance-left">
                <FormattedMessage id='recive' />
                <span className="my-balance">
                  {'···'}
                </span>
                <span className="my-balance-title">
                  <FormattedMessage id='balance' />:
              </span>
              </div>

              <div className="other-tokens-left">
                <button>
                  <img alt='' className="token-logo" src={this.state.token[this.state.cur_recive_addr]} />
                  <span className="token-title">
                    {this.state.cur_recive_addr}
                  </span>
                  <span className={this.state.show_right_more_token ? "token-tips-re" : "token-tips"}></span>
                </button>
              </div>
              <div className="other-tokens-right">
                <input
                  value={this.state.side_B_amount || ''}
                  // disabled='disabled'
                  placeholder={this.state.cur_language === '中文' ? '输入数量' : 'Amount'}
                />
              </div>
            </div>

          </div>
          <div className='clear'></div>

          <div className={"btn-wrap-disable"}>
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
                <a href='https://github.com/dforce-network/xswap.git' target='_blank' rel="noopener noreferrer">
                  GitHub
                </a>
              </div>
              <div className="foot-item-content">
                <a
                  href={
                    this.state.cur_language === '中文' ?
                      'https://docn.dforce.network/dforce-trade'
                      :
                      'https://docs.dforce.network/dforce-trading-protocol/dforce-trade'
                  }
                  target='_blank'
                  rel="noopener noreferrer"
                >
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
                    this.state.cur_language === '中文' ? '中文简体' : 'English'
                  }
                </div>
                <span className='fixed-img'>
                  <img alt='' src={arrow_u} />
                </span>
                <div className='fixed2'>
                  <ul>
                    <li onClick={() => { this.setState({ cur_language: '中文' }) }}>{'中文简体'}</li>
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
                support@dforce.network
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
