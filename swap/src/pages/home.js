import React, { Component } from 'react'
import CurrencyConversion from './CurrencyConversion/index'
import HistoricalRecord from './HistoricalRecord/index'
import Network from '../constant.json'
import Web3 from 'web3';
import address from '../ABIs/address_map.json'
import { get_tokensTwo_decimals, format_bn } from '../util.js'
import './home.scss'

let XSwap_Abi = require('../ABIs/XSwap_ABI.json')
let USDX_ABI = require('../ABIs/USDX_ABI.json')
let USDT_ABI = require('../ABIs/USDT_ABI.json')

class Home extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rinkebyAddress: null,
            USDT_balance: null,
            USDx_balance: null,
            USDT_price: 0

        }
        this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);
        this.bn = this.new_web3.utils.toBN;
        this.web3 = window.web3;
        this.XSwap_address = "0x5fc6345c302d0127a777eaf924f63c028b087f56";
        this.USDx_address = "0xaf21bb8ae7b7a5eec37964e478583cd486fd12e2";
        this.TUSD_address = "0xfeb2112e370091f25a2f96fb600484700a0ed603";
        this.USDT_address = "0xA1e525F7d24D7cCB78A070BBd12C0BF21Fb4a848";

        this.XSwap = new this.new_web3.eth.Contract(XSwap_Abi, this.XSwap_address);
         this.USDx = new this.new_web3.eth.Contract(USDX_ABI, this.USDx_address);
        this.TUSD = new this.new_web3.eth.Contract(USDX_ABI, this.TUSD_address);
        this.USDT = new this.new_web3.eth.Contract(USDT_ABI, this.USDT_address);

        // this.new_web3.eth.net.getNetworkType().then(
        //     (net_type) => {
        //         if (net_type === 'rinkeby') {
        //             this.myaddress = Network.Rinkeby.USDx;
        //             console.log('rinkeby')
        //         }
        //         else if (net_type === 'main') {

        //             this.myaddress = Network.Main.USDx;
        //         }
        //         let USDx = new this.new_web3.eth.Contract(USDX_ABI, address[net_type]['address_USDx']);
        //         let XSwap = new this.new_web3.eth.Contract(XSwap_Abi, address[net_type]['address_XSwap']);
        //         let USDT = new this.new_web3.eth.Contract(USDT_ABI, address[net_type]['address_USDT']);
        //         this.setState({ net_type: net_type, USDx: USDx, XSwap: XSwap, USDT: USDT }, () => {
        //             this.new_web3.givenProvider.enable().then(res_accounts => {
        //                 this.setState({ my_account: res_accounts[0] }, async () => {
        //                     console.log('connected: ', this.state.my_account)
        //                     get_tokensTwo_decimals(this.state.USDx, this.state.USDT, this)
        //                     let timer_Next = setInterval(() => {
        //                         if (!(this.state.USDx_decimals && this.state.USDT_decimals)) {
        //                             console.log('111111111: not get yet...');
        //                         } else {
        //                             console.log('2222222222: i got it...');
        //                             clearInterval(timer_Next);
                                   
        //                         }
        //                     }, 100)
        //                 })
        //             })

        //         })
        //     }


        // )
    }

    render() {
        return (
            <div className="homeBox">
                <div className="wrappBox">
                    <CurrencyConversion />
                    <HistoricalRecord />
                </div>
            </div>
        )
    }


}
export default Home