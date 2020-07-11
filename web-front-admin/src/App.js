import React from 'react';
import './App.scss';
import './popup.scss';
import logo from './images/logo-dforce.svg';
import Web3 from 'web3';
import address_map from './abi/address';
import { Select, Input, Button, Modal } from 'antd';
import 'antd/dist/antd.css';
import {
  format_persentage,
  format_balance,
  format_str_to_K,
  format_persentage_tofixed,
  get_token_balance,
  get_token_lending,
  get_token_enable,
  get_token_price,
  get_first_data,
  get_fee,
  get_fee_btc,
  Emergency_start,
  Emergency_stop,
  get_is_open_state,
  get_my_balance,
  handle_Transfer_in_change,
  handle_Transfer_out_change,
  click_Transfer_in,
  click_Transfer_out,
  control_lending_disableLending,
  control_lending_enableLending,
  control_enable_enableToken,
  control_enable_disableToken,
  setfee_click,
  enableTrade_click,
  disableTrade_click,
  handle_Transfer_in_max,
  handle_Transfer_out_max
} from './utils';

let tokens_abi = require('./abi/tokenABI.json');
let xSwap_abi = require('./abi/xSwapABI.json');
let priceOracle_ABI = require('./abi/priceOracle_ABI.json');


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
        WBTC: 8,
        GOLDx: 18
      },
      mask_Emergency: false,
      mask_setfee: false,
      got_is_open_xswap: false,
      is_open_xswap: false,
      got_is_open_xswap_btc: false,
      is_open_xswap_btc: false,
      is_enbale_transferIn: true,
      is_enbale_transferOut: true
    }
    this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);
    this.bn = this.new_web3.utils.toBN;
    // return;
    this.new_web3.givenProvider.enable().then(res_accounts => {
      console.log(res_accounts);
      this.setState({
        my_account: res_accounts[0]
      })
    })

    this.new_web3.eth.net.getNetworkType().then(net_type => {
      let XSwap_stable = new this.new_web3.eth.Contract(xSwap_abi, address_map[net_type]['XSwap_stable']);
      let XSwap_btc = new this.new_web3.eth.Contract(xSwap_abi, address_map[net_type]['XSwap_btc']);
      let Oracle = new this.new_web3.eth.Contract(priceOracle_ABI, address_map[net_type]['Oracle']);
      let HBTC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['HBTC']);
      let HUSD = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['HUSD']);
      let BUSD = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['BUSD']);
      // let imBTC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['imBTC']);
      let WBTC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['WBTC']);
      let USDx = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDx']);
      let USDT = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDT']);
      let USDC = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['USDC']);
      let PAX = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['PAX']);
      let TUSD = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['TUSD']);
      let DAI = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['DAI']);
      let GOLDx = new this.new_web3.eth.Contract(tokens_abi, address_map[net_type]['GOLDx']);
      this.setState({
        HUSD: HUSD,
        HBTC: HBTC,
        BUSD: BUSD,
        // imBTC: imBTC,
        WBTC: WBTC,
        USDx: USDx,
        USDT: USDT,
        USDC: USDC,
        PAX: PAX,
        TUSD: TUSD,
        DAI: DAI,
        GOLDx: GOLDx,
        net_type: net_type,
        XSwap_stable: XSwap_stable,
        XSwap_btc: XSwap_btc,
        Oracle: Oracle,
        cur_send_token: 'USDT',
        cur_send_token_btc: 'WBTC',
        cur_receive_token: 'USDx',
        cur_receive_token_btc: 'HBTC',
        cur_Transfer_in_token: 'USDx',
        Transfer_in_value: '',
        cur_Transfer_out_token: 'USDx',
        Transfer_out_value: ''
      }, () => {
        get_token_balance(this);
        get_token_lending(this);
        get_token_enable(this);
        get_token_price(this);
        get_first_data(this);
        get_is_open_state(this);
        get_my_balance(this);
      })
    })
  }

  handleChange_send = (e) => {
    console.log(e);
    this.setState({
      cur_send_token: e
    }, () => {
      get_fee(this);
    })
  }
  handleChange_send_btc = (e) => {
    console.log(e);
    this.setState({
      cur_send_token_btc: e
    }, () => {
      get_fee_btc(this);
    })
  }
  handleChange_Transfer_in = (token) => {
    console.log(token);
    this.setState({
      cur_Transfer_in_token: token,
      Transfer_in_value: ''
    });
  }
  handleChange_Transfer_out = (token) => {
    console.log(token);
    this.setState({
      cur_Transfer_out_token: token,
      Transfer_out_value: ''
    });
  }


  handleChange_receive = (e) => {
    console.log(e);
    this.setState({
      cur_receive_token: e
    }, () => {
      get_fee(this);
    })
  }
  handleChange_receive_btc = (e) => {
    console.log(e);
    this.setState({
      cur_receive_token_btc: e
    }, () => {
      get_fee_btc(this);
    })
  }


  click_show_Emergency = (action) => {
    // console.log(action);
    this.setState({
      mask_Emergency: true,
      cur_Emergency_action: action
    })
  }
  click_show_Emergency_Cancel = () => {
    console.log('kong');
    this.setState({
      mask_Emergency: false,
      cur_Emergency_action: ''
    })
  }
  click_show_Emergency_Confirm = () => {
    var action = this.state.cur_Emergency_action;
    var Contract;
    console.log(action);
    if (action === 'Stop XSwap' || action === 'Stop XSwapBTC') {
      if (action === 'Stop XSwap') {
        Contract = this.state.XSwap_stable;
      } else {
        Contract = this.state.XSwap_btc;
      }
      Emergency_stop(this, Contract);
    } else {
      if (action === 'Start XSwap') {
        Contract = this.state.XSwap_stable;
      } else {
        Contract = this.state.XSwap_btc;
      }
      Emergency_start(this, Contract);
    }
  }


  control_lending = (token, cur_lending) => {
    var t_Contract = this.state.XSwap_stable;
    if (token === 'imBTC' || token === 'HBTC' || token === 'WBTC') {
      t_Contract = this.state.XSwap_btc;
    }

    if (cur_lending) {
      control_lending_disableLending(this, t_Contract, token);
    } else {
      control_lending_enableLending(this, t_Contract, token);
    }
  }
  control_enable = (token, cur_lending) => {
    var t_Contract = this.state.XSwap_stable;
    if (token === 'imBTC' || token === 'HBTC' || token === 'WBTC') {
      t_Contract = this.state.XSwap_btc;
    }

    if (cur_lending) {
      control_enable_disableToken(this, t_Contract, token);
    } else {
      control_enable_enableToken(this, t_Contract, token);
    }
  }
  show_setfee = (xswap_type) => {
    this.setState({
      cur_xswap_type: xswap_type,
      mask_setfee: true
    })
    if (xswap_type === 'btc') {
      this.setState({
        setfee_value: format_balance(this.state.cur_Fee_btc, 16, 8),
        setfee_value_real: this.state.cur_Fee_btc
      })
    } else {
      this.setState({
        setfee_value: format_balance(this.state.cur_Fee, 16, 8),
        setfee_value_real: this.state.cur_Fee
      })
    }
  }
  show_setfee_Cancel = () => {
    this.setState({
      mask_setfee: false,
      setfee_value: '',
      setfee_value_real: ''
    })
  }
  show_setfee_Confirm = () => {
    // console.log(this.state.setfee_value_real, this.state.cur_xswap_type);//stable
    var t_Contract;
    var cur_input_token;
    var cur_output_token;
    if (this.state.cur_xswap_type === 'stable') {
      t_Contract = this.state.XSwap_stable;
      cur_input_token = this.state.cur_send_token;
      cur_output_token = this.state.cur_receive_token;
    } else {
      t_Contract = this.state.XSwap_btc;
      cur_input_token = this.state.cur_send_token_btc;
      cur_output_token = this.state.cur_receive_token_btc;
    }

    setfee_click(this, t_Contract, cur_input_token, cur_output_token, this.state.setfee_value_real);
  }
  handleChange_setfee = (val) => {
    // console.log(val);
    var amount_bn;
    var temp_value = val;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(val.indexOf('.') + 1);
      amount_bn = this.bn(temp_value).mul(this.bn(10 ** (16 - sub_num)));
    } else {
      amount_bn = this.bn(val).mul(this.bn(10 ** 16));
    }

    // console.log(amount_bn.toString());

    this.setState({
      setfee_value: val,
      setfee_value_real: amount_bn.toString()
    })
  }


  click_open = (xswap_type) => {
    console.log(xswap_type);
    var t_Contract = this.state.XSwap_stable;
    var cur_input_token = this.state.cur_send_token;
    var cur_output_token = this.state.cur_receive_token;

    if (xswap_type === 'btc') {
      t_Contract = this.state.XSwap_btc;
      cur_input_token = this.state.cur_send_token_btc;
      cur_output_token = this.state.cur_receive_token_btc;
    }

    this.setState({
      mask_click_open: true,
      mask_t_Contract: t_Contract,
      mask_cur_input_token: cur_input_token,
      mask_cur_output_token: cur_output_token,
      mask_xswap_type: xswap_type
    })
  }
  mask_click_open_Cancel = () => {
    this.setState({
      mask_click_open: false
    })
  }
  click_close = (xswap_type) => {
    console.log(xswap_type);
    var t_Contract = this.state.XSwap_stable;
    var cur_input_token = this.state.cur_send_token;
    var cur_output_token = this.state.cur_receive_token;

    if (xswap_type === 'btc') {
      t_Contract = this.state.XSwap_btc;
      cur_input_token = this.state.cur_send_token_btc;
      cur_output_token = this.state.cur_receive_token_btc;
    }

    this.setState({
      mask_click_close: true,
      mask_t_Contract: t_Contract,
      mask_cur_input_token: cur_input_token,
      mask_cur_output_token: cur_output_token,
      mask_xswap_type: xswap_type
    })
  }
  mask_click_close_Cancel = () => {
    this.setState({
      mask_click_close: false
    })
  }

  componentDidMount = () => {
    setInterval(() => {
      if (!this.state.my_account) {
        return false;
      }
      // console.log('*** get_my_balance ***');
      get_token_balance(this);
      get_token_lending(this);
      get_token_enable(this);
      get_token_price(this);
      get_my_balance(this);
      get_is_open_state(this);
      get_fee(this);
      get_fee_btc(this);
    }, 1000 * 15);
  }

  render() {
    return (
      <>
        <Modal
          keyboard={false}
          maskClosable={false}
          visible={this.state.mask_Emergency}
          centered={true}
          footer={false}
          // closable={false}
          onCancel={() => { this.click_show_Emergency_Cancel() }}
        >
          <div className='popup-tips'>
            <div className='popup-tips-title'>
              Please make sure you want to  {this.state.cur_Emergency_action}
            </div>
            <div className='popup-tips-btn' onClick={() => { this.click_show_Emergency_Confirm() }}>
              Confirm
            </div>
          </div>
        </Modal>

        <Modal
          keyboard={false}
          maskClosable={false}
          visible={this.state.mask_click_open}
          centered={true}
          footer={false}
          // closable={false}
          onCancel={() => { this.mask_click_open_Cancel() }}
        >
          <div className='popup-tips'>
            <div className='popup-tips-title'>
              Please make sure you want to open this exchange?
            </div>
            <div className='popup-tips-btn' onClick={() => { enableTrade_click(this, this.state.mask_t_Contract, this.state.mask_cur_input_token, this.state.mask_cur_output_token) }}>
              Confirm
            </div>
          </div>
        </Modal>

        <Modal
          keyboard={false}
          maskClosable={false}
          visible={this.state.mask_click_close}
          centered={true}
          footer={false}
          // closable={false}
          onCancel={() => { this.mask_click_close_Cancel() }}
        >
          <div className='popup-tips'>
            <div className='popup-tips-title'>
              Please make sure you want to close this exchange?
            </div>
            <div className='popup-tips-btn' onClick={() => { disableTrade_click(this, this.state.mask_t_Contract, this.state.mask_cur_input_token, this.state.mask_cur_output_token) }}>
              Confirm
            </div>
          </div>
        </Modal>

        <Modal
          keyboard={false}
          maskClosable={false}
          visible={this.state.mask_setfee}
          centered={true}
          footer={false}
          // closable={false}
          title={'SetFee'}
          onCancel={() => { this.show_setfee_Cancel() }}
        >
          <div className='popup-tips'>
            <div className='popup-tips-input'>
              <Input type='number' value={this.state.setfee_value} onChange={(e) => { this.handleChange_setfee(e.target.value) }} />
            %
            </div>
            <div className='popup-tips-btn' onClick={() => { this.show_setfee_Confirm() }}>
              Confirm
            </div>
          </div>
        </Modal>

        <div className='top'>
          <div className='top-left'>
            <a href='https://dforce.network/' target='_blank' rel="noopener noreferrer">
              <img src={logo} alt='' />
            </a>
          </div>
          <div className='top-right'>
            {
              !this.state.my_account &&
              <div className='top-right-btn'>
                Connect
              </div>
            }

            {
              (this.state.my_account && this.state.net_type) &&
              <div className='top-right-account'>
                <div className='account' onClick={() => { this.to_ethscan_with_account(this, this.state.my_account) }}>
                  <span className={'spot ' + this.state.net_type}></span>
                  <span className={'account-address'}>
                    {this.state.my_account.slice(0, 4) + '...' + this.state.my_account.slice(-4)}
                  </span>
                </div>
              </div>
            }
          </div>
          <div className='clear'></div>
        </div>

        <div className='balance'>
          <div className='title'>Balance</div>
          <div className='balance-table'>
            <div className='table-left'>
              <div className='item'>Assets</div>
              <div className='item'>Balance</div>
              <div className='item'>Price</div>
              {/* <div className='item'>Lending</div> */}
              <div className='item'>Enable</div>
            </div>
            <div className='table-right'>
              <div className='table-right-box'>

                <div className='box-item'>
                  <div className='box-item-token'>USDx</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_USDx ? format_str_to_K(format_balance(this.state.cur_liquidaty_USDx, this.state.decimals.USDx, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_USDx ? '$' + format_balance(this.state.price_USDx, this.state.decimals.USDx, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_USDx ? 'checked' : ''} readOnly onClick={() => { this.control_lending('USDx', this.state.cur_lending_USDx) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_USDx ? 'checked' : ''} readOnly onClick={() => { this.control_enable('USDx', this.state.cur_enable_USDx) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>GOLDx</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_GOLDx ? format_str_to_K(format_balance(this.state.cur_liquidaty_GOLDx, this.state.decimals.GOLDx, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_GOLDx ? '$' + format_balance(this.state.price_GOLDx, this.state.decimals.GOLDx, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_USDx ? 'checked' : ''} readOnly onClick={() => { this.control_lending('USDx', this.state.cur_lending_USDx) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_GOLDx ? 'checked' : ''} readOnly onClick={() => { this.control_enable('GOLDx', this.state.cur_enable_GOLDx) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>USDT</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_USDT ? format_str_to_K(format_balance(this.state.cur_liquidaty_USDT, this.state.decimals.USDT, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_USDT ? '$' + format_balance(this.state.price_USDT, 30, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_USDT ? 'checked' : ''} readOnly onClick={() => { this.control_lending('USDT', this.state.cur_lending_USDT) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_USDT ? 'checked' : ''} readOnly onClick={() => { this.control_enable('USDT', this.state.cur_enable_USDT) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>DAI</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_DAI ? format_str_to_K(format_balance(this.state.cur_liquidaty_DAI, this.state.decimals.DAI, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_DAI ? '$' + format_balance(this.state.price_DAI, 18, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_DAI ? 'checked' : ''} readOnly onClick={() => { this.control_lending('DAI', this.state.cur_lending_DAI) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_DAI ? 'checked' : ''} readOnly onClick={() => { this.control_enable('DAI', this.state.cur_enable_DAI) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>HUSD</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_HUSD ? format_str_to_K(format_balance(this.state.cur_liquidaty_HUSD, this.state.decimals.HUSD, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_HUSD ? '$' + format_balance(this.state.price_HUSD, 28, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_HUSD ? 'checked' : ''} readOnly onClick={() => { this.control_lending('HUSD', this.state.cur_lending_HUSD) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_HUSD ? 'checked' : ''} readOnly onClick={() => { this.control_enable('HUSD', this.state.cur_enable_HUSD) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>BUSD</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_BUSD ? format_str_to_K(format_balance(this.state.cur_liquidaty_BUSD, this.state.decimals.BUSD, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_HUSD ? '$' + format_balance(this.state.price_HUSD, 28, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_BUSD ? 'checked' : ''} readOnly onClick={() => { this.control_lending('BUSD', this.state.cur_lending_BUSD) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_BUSD ? 'checked' : ''} readOnly onClick={() => { this.control_enable('BUSD', this.state.cur_enable_BUSD) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>USDC</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_USDC ? format_str_to_K(format_balance(this.state.cur_liquidaty_USDC, this.state.decimals.USDC, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_USDx ? '$' + format_balance(this.state.price_USDx, 18, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_USDC ? 'checked' : ''} readOnly onClick={() => { this.control_lending('USDC', this.state.cur_lending_USDC) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_USDC ? 'checked' : ''} readOnly onClick={() => { this.control_enable('USDC', this.state.cur_enable_USDC) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>PAX</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_PAX ? format_str_to_K(format_balance(this.state.cur_liquidaty_PAX, this.state.decimals.PAX, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_HUSD ? '$' + format_balance(this.state.price_HUSD, 28, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_PAX ? 'checked' : ''} readOnly onClick={() => { this.control_lending('PAX', this.state.cur_lending_PAX) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_PAX ? 'checked' : ''} readOnly onClick={() => { this.control_enable('PAX', this.state.cur_enable_PAX) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>TUSD</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_TUSD ? format_str_to_K(format_balance(this.state.cur_liquidaty_TUSD, this.state.decimals.TUSD, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>
                    {this.state.price_USDx ? '$' + format_balance(this.state.price_USDx, 18, 6) : '...'}
                  </div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_TUSD ? 'checked' : ''} readOnly onClick={() => { this.control_lending('TUSD', this.state.cur_lending_TUSD) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_TUSD ? 'checked' : ''} readOnly onClick={() => { this.control_enable('TUSD', this.state.cur_enable_TUSD) }} />
                  </div>
                </div>

                {/* <div className='box-item'>
                  <div className='box-item-token'>imBTC</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_imBTC ? format_str_to_K(format_balance(this.state.cur_liquidaty_imBTC, this.state.decimals.imBTC, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>{'-'}</div>
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_imBTC ? 'checked' : ''} readOnly onClick={() => { this.control_lending('imBTC', this.state.cur_lending_imBTC) }} />
                  </div>
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_imBTC ? 'checked' : ''} readOnly onClick={() => { this.control_enable('imBTC', this.state.cur_enable_imBTC) }} />
                  </div>
                </div> */}

                <div className='box-item'>
                  <div className='box-item-token'>HBTC</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_HBTC ? format_str_to_K(format_balance(this.state.cur_liquidaty_HBTC, this.state.decimals.HBTC, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>{'-'}</div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_HBTC ? 'checked' : ''} readOnly onClick={() => { this.control_lending('HBTC', this.state.cur_lending_HBTC) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_HBTC ? 'checked' : ''} readOnly onClick={() => { this.control_enable('HBTC', this.state.cur_enable_HBTC) }} />
                  </div>
                </div>

                <div className='box-item'>
                  <div className='box-item-token'>WBTC</div>
                  <div className='box-item-price'>
                    {this.state.cur_liquidaty_WBTC ? format_str_to_K(format_balance(this.state.cur_liquidaty_WBTC, this.state.decimals.WBTC, 2)) : '...'}
                  </div>
                  <div className='box-item-price'>{'-'}</div>
                  {/* <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_lending_WBTC ? 'checked' : ''} readOnly onClick={() => { this.control_lending('WBTC', this.state.cur_lending_WBTC) }} />
                  </div> */}
                  <div className='box-item-checked'>
                    <input type="checkbox" checked={this.state.cur_enable_WBTC ? 'checked' : ''} readOnly onClick={() => { this.control_enable('WBTC', this.state.cur_enable_WBTC) }} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        <div className='exchanges'>
          <div className='title'>Exchanges</div>
          <div className='exchanges-box'>
            <div className='exchanges-send'>
              <Select defaultValue="USDT" style={{ width: '100%' }} onChange={(e) => { this.handleChange_send(e) }}>
                <Select.Option value="USDx">USDx</Select.Option>
                <Select.Option value="GOLDx">GOLDx</Select.Option>
                <Select.Option value="USDT">USDT</Select.Option>
                <Select.Option value="DAI">DAI</Select.Option>
                <Select.Option value="HUSD">HUSD</Select.Option>
                <Select.Option value="BUSD">BUSD</Select.Option>
                <Select.Option value="USDC">USDC</Select.Option>
                <Select.Option value="PAX">PAX</Select.Option>
                <Select.Option value="TUSD">TUSD</Select.Option>
              </Select>
            </div>

            <div className='exchanges-receive'>
              <Select defaultValue="USDx" style={{ width: '100%' }} onChange={(e) => { this.handleChange_receive(e) }}>
                <Select.Option value="USDx">USDx</Select.Option>
                <Select.Option value="GOLDx">GOLDx</Select.Option>
                <Select.Option value="USDT">USDT</Select.Option>
                <Select.Option value="DAI">DAI</Select.Option>
                <Select.Option value="HUSD">HUSD</Select.Option>
                <Select.Option value="BUSD">BUSD</Select.Option>
                <Select.Option value="USDC">USDC</Select.Option>
                <Select.Option value="PAX">PAX</Select.Option>
                <Select.Option value="TUSD">TUSD</Select.Option>
              </Select>
            </div>

            <div className='exchanges-fee'>
              {'Fee: '}
              {this.state.cur_Fee ? format_balance(this.state.cur_Fee, 16, 2) + '%' : '...'}
            </div>
            <div className='exchanges-setfee' onClick={() => { this.show_setfee('stable') }}>{'SetFee'}</div>
            {
              this.state.cur_tradesDisable_stable &&
              <div className='exchanges-open' onClick={() => { this.click_open('stable') }}>{'Open'}</div>
            }
            {
              !this.state.cur_tradesDisable_stable &&
              <div className='exchanges-close' onClick={() => { this.click_close('stable') }}>{'Close'}</div>
            }
          </div>
          {/* ------------------------------------------------------- */}
          <div className='exchanges-box'>
            <div className='exchanges-send'>
              <Select defaultValue="WBTC" style={{ width: '100%' }} onChange={(e) => { this.handleChange_send_btc(e) }}>
                {/* <Select.Option value="imBTC">imBTC</Select.Option> */}
                <Select.Option value="HBTC">HBTC</Select.Option>
                <Select.Option value="WBTC">WBTC</Select.Option>
              </Select>
            </div>

            <div className='exchanges-receive'>
              <Select defaultValue="HBTC" style={{ width: '100%' }} onChange={(e) => { this.handleChange_receive_btc(e) }}>
                {/* <Select.Option value="imBTC">imBTC</Select.Option> */}
                <Select.Option value="HBTC">HBTC</Select.Option>
                <Select.Option value="WBTC">WBTC</Select.Option>
              </Select>
            </div>

            <div className='exchanges-fee'>
              {'Fee: '}
              {this.state.cur_Fee_btc ? format_balance(this.state.cur_Fee_btc, 16, 2) + '%' : '...'}
            </div>
            <div className='exchanges-setfee' onClick={() => { this.show_setfee('btc') }}>{'SetFee'}</div>
            {
              this.state.cur_tradesDisable_btc &&
              <div className='exchanges-open' onClick={() => { this.click_open('btc') }}>{'Open'}</div>
            }
            {
              !this.state.cur_tradesDisable_btc &&
              <div className='exchanges-close' onClick={() => { this.click_close('btc') }}>{'Close'}</div>
            }
          </div>
        </div>

        <div className='transfer'>
          <div className='title'>Transfer</div>
          <div className='transfer-box'>
            <div className='item-1'>
              <Select defaultValue="USDx" style={{ width: '100%' }} onChange={(e) => { this.handleChange_Transfer_in(e) }}>
                <Select.Option value="USDx">USDx</Select.Option>
                <Select.Option value="GOLDx">GOLDx</Select.Option>
                <Select.Option value="USDT">USDT</Select.Option>
                <Select.Option value="DAI">DAI</Select.Option>
                <Select.Option value="HUSD">HUSD</Select.Option>
                <Select.Option value="BUSD">BUSD</Select.Option>
                <Select.Option value="USDC">USDC</Select.Option>
                <Select.Option value="PAX">PAX</Select.Option>
                <Select.Option value="TUSD">TUSD</Select.Option>
                {/* <Select.Option value="imBTC">imBTC</Select.Option> */}
                <Select.Option value="HBTC">HBTC</Select.Option>
                <Select.Option value="WBTC">WBTC</Select.Option>
              </Select>
            </div>
            <div className='item-2'>
              <Input
                onChange={(e) => handle_Transfer_in_change(this, e.target.value, this.state.decimals[this.state.cur_Transfer_in_token])}
                value={this.state.Transfer_in_value}
                type='number'
              />
              <span
                onClick={() => handle_Transfer_in_max(this, this.state.cur_Transfer_in_token, this.state.decimals[this.state.cur_Transfer_in_token])}
                className='max'>MAX</span>
              <span className='text'>
                Wallet Balance:
                {
                  this.state.cur_Transfer_in_token === 'USDx' && this.state.my_balance_USDx &&
                  format_str_to_K(format_balance(this.state.my_balance_USDx, this.state.decimals.USDx, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'GOLDx' && this.state.my_balance_GOLDx &&
                  format_str_to_K(format_balance(this.state.my_balance_GOLDx, this.state.decimals.GOLDx, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'HUSD' && this.state.my_balance_HUSD &&
                  format_str_to_K(format_balance(this.state.my_balance_HUSD, this.state.decimals.HUSD, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'HBTC' && this.state.my_balance_HBTC &&
                  format_str_to_K(format_balance(this.state.my_balance_HBTC, this.state.decimals.HBTC, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'BUSD' && this.state.my_balance_BUSD &&
                  format_str_to_K(format_balance(this.state.my_balance_BUSD, this.state.decimals.BUSD, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'imBTC' && this.state.my_balance_imBTC &&
                  format_str_to_K(format_balance(this.state.my_balance_imBTC, this.state.decimals.imBTC, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'WBTC' && this.state.my_balance_WBTC &&
                  format_str_to_K(format_balance(this.state.my_balance_WBTC, this.state.decimals.WBTC, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'USDT' && this.state.my_balance_USDT &&
                  format_str_to_K(format_balance(this.state.my_balance_USDT, this.state.decimals.USDT, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'USDC' && this.state.my_balance_USDC &&
                  format_str_to_K(format_balance(this.state.my_balance_USDC, this.state.decimals.USDC, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'PAX' && this.state.my_balance_PAX &&
                  format_str_to_K(format_balance(this.state.my_balance_PAX, this.state.decimals.PAX, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'TUSD' && this.state.my_balance_TUSD &&
                  format_str_to_K(format_balance(this.state.my_balance_TUSD, this.state.decimals.TUSD, 2))
                }
                {
                  this.state.cur_Transfer_in_token === 'DAI' && this.state.my_balance_DAI &&
                  format_str_to_K(format_balance(this.state.my_balance_DAI, this.state.decimals.DAI, 2))
                }
              </span>
            </div>
            <div className='item-3'>
              <div className='item-btn'>
                <Button
                  type="primary"
                  onClick={() => { click_Transfer_in(this) }}
                  disabled={!this.state.is_enbale_transferIn}
                >Transfer In</Button>
              </div>
            </div>
          </div>
          {/* ------------------------------------------------------- */}
          <div className='transfer-box'>
            <div className='item-1'>
              <Select defaultValue="USDx" style={{ width: '100%' }} onChange={(e) => { this.handleChange_Transfer_out(e) }}>
                <Select.Option value="USDx">USDx</Select.Option>
                <Select.Option value="GOLDx">GOLDx</Select.Option>
                <Select.Option value="USDT">USDT</Select.Option>
                <Select.Option value="DAI">DAI</Select.Option>
                <Select.Option value="HUSD">HUSD</Select.Option>
                <Select.Option value="BUSD">BUSD</Select.Option>
                <Select.Option value="USDC">USDC</Select.Option>
                <Select.Option value="PAX">PAX</Select.Option>
                <Select.Option value="TUSD">TUSD</Select.Option>
                {/* <Select.Option value="imBTC">imBTC</Select.Option> */}
                <Select.Option value="HBTC">HBTC</Select.Option>
                <Select.Option value="WBTC">WBTC</Select.Option>
              </Select>
            </div>
            <div className='item-2'>
              <Input
                value={this.state.Transfer_out_value}
                onChange={(e) => handle_Transfer_out_change(this, e.target.value, this.state.decimals[this.state.cur_Transfer_out_token])}
                type='number'
              />
              <span
                onClick={() => handle_Transfer_out_max(this, this.state.cur_Transfer_out_token, this.state.decimals[this.state.cur_Transfer_out_token])}
                className='max'>MAX</span>
              <span className='text'>
                Available to Withdraw:
                {
                  this.state.cur_Transfer_out_token === 'USDx' && this.state.cur_liquidaty_USDx &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_USDx, this.state.decimals.USDx, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'GOLDx' && this.state.cur_liquidaty_GOLDx &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_GOLDx, this.state.decimals.GOLDx, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'HUSD' && this.state.cur_liquidaty_HUSD &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_HUSD, this.state.decimals.HUSD, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'HBTC' && this.state.cur_liquidaty_HBTC &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_HBTC, this.state.decimals.HBTC, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'BUSD' && this.state.cur_liquidaty_BUSD &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_BUSD, this.state.decimals.BUSD, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'imBTC' && this.state.cur_liquidaty_imBTC &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_imBTC, this.state.decimals.imBTC, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'WBTC' && this.state.cur_liquidaty_WBTC &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_WBTC, this.state.decimals.WBTC, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'USDT' && this.state.cur_liquidaty_USDT &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_USDT, this.state.decimals.USDT, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'USDC' && this.state.cur_liquidaty_USDC &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_USDC, this.state.decimals.USDC, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'PAX' && this.state.cur_liquidaty_PAX &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_PAX, this.state.decimals.PAX, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'TUSD' && this.state.cur_liquidaty_TUSD &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_TUSD, this.state.decimals.TUSD, 2))
                }
                {
                  this.state.cur_Transfer_out_token === 'DAI' && this.state.cur_liquidaty_DAI &&
                  format_str_to_K(format_balance(this.state.cur_liquidaty_DAI, this.state.decimals.DAI, 2))
                }
              </span>
            </div>
            <div className='item-3'>
              <div className='item-btn'>
                <Button
                  type="primary"
                  onClick={() => { click_Transfer_out(this) }}
                  disabled={!this.state.is_enbale_transferOut}
                >Transfer Out</Button>
              </div>
            </div>
          </div>
        </div>

        <div className='emergency'>
          <div className='title'>Emergency</div>
          <div className='title-p'>Operate</div>
          <div className='operate-btn'>
            {
              this.state.got_is_open_xswap && !this.state.is_open_xswap &&
              <Button type="primary" onClick={() => { this.click_show_Emergency('Start XSwap') }}>Start XSwap</Button>
            }
            {
              this.state.got_is_open_xswap && this.state.is_open_xswap &&
              <Button type="primary" onClick={() => { this.click_show_Emergency('Stop XSwap') }}>Stop XSwap</Button>
            }
          </div>
          <div className='operate-btn'>
            {
              this.state.got_is_open_xswap_btc && !this.state.is_open_xswap_btc &&
              <Button type="primary" onClick={() => { this.click_show_Emergency('Start XSwapBTC') }}>Start XSwapBTC</Button>
            }
            {
              this.state.got_is_open_xswap_btc && this.state.is_open_xswap_btc &&
              <Button type="primary" onClick={() => { this.click_show_Emergency('Stop XSwapBTC') }}>Stop XSwapBTC</Button>
            }
          </div>
        </div>

      </>
    )
  }
}