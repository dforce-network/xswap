import React, { PureComponent } from 'react'
import './index.scss'
import Web3 from 'web3';
import Equivalent from '../Equivalent/index'
import Header from '../header/header'
import SwapTitle from '../SwapTitle/index'

let USDT_ABI = require('../../ABIs/USDT_ABI.json')
let XSwap_Abi = require('../../ABIs/XSwap_ABI.json')
let USDX_ABI = require('../../ABIs/USDX_ABI.json')
let TUSD_ABI = require('../../ABIs/USDT_ABI.json')
let PAI_ABI = require('../../ABIs/USDT_ABI.json')
class CurrencyConversion extends PureComponent {

    static propTypes = {}

    constructor(props) {
        super(props)
        this.state = {
            selectedItems: [
                {
                    img: 'images/logo-USDT.png',
                    defaultImg: 'images/iocn-xz.svg',
                    USDTname: 'USDT',
                    Tether: '(Tether USD)',
                    index: 0
                },
                {
                    img: 'images/logo-PAX.png',
                    USDTname: 'PAX',
                    Tether: '(Paxos Standard)',
                    index: 1
                },
                {
                    img: 'images/logo-TUSD.png',
                    USDTname: 'TUSD',
                    Tether: '( True TUSD)',
                    index: 2
                },
                {
                    img: 'images/logo-USDC.png',
                    USDTname: 'USDC',
                    Tether: '(USD Coin)',
                    index: 3
                }
            ],
            defaultImg: 'images/logo-USDT.png',
            defaultName: 'USDT',
            onOff: false,
            isShow: false,
            display_block: 'block',
            display_none: 'none',
            display_sou: 'none',
            priceValueInput: null,
            borderRed: false,
            priceValueInputUSDx: null,
            cardInfo: false,
            SelectionBoxUSDx: false,
            lockShow: false,
            USDT_balance: null,
            USDx_balance: null,
            USDT_price: false,
            DropDwownNone: false,
            my_account: null,
            USDT_turn_USDx: false,
            approve_res_hash: 0,
            is_borrow_enable: true,
            is_repay_enable: true,
            AalertInfutter: false,
            ChangeName: false
        }
        this.USDT_address = "0xA1e525F7d24D7cCB78A070BBd12C0BF21Fb4a848";
        this.XSwap_address = "0x5fc6345c302d0127a777eaf924f63c028b087f56";
        this.TUSD_address = "0xfeb2112e370091f25a2f96fb600484700a0ed603";
        this.USDx_address = "0xaf21bb8ae7b7a5eec37964e478583cd486fd12e2";
        this.PAX_address = "0xd414e78d5db39e90c704070943e067ffc0eb3d86"

        this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);

        this.new_web3.givenProvider.enable().then(res_accounts => {

            this.setState({
                my_account: res_accounts[0]
            })
        })
        this.bn = this.new_web3.utils.toBN;
        this.USDT = new this.new_web3.eth.Contract(USDT_ABI, this.USDT_address);
        this.XSwap = new this.new_web3.eth.Contract(XSwap_Abi, this.XSwap_address);
        this.TUSD = new this.new_web3.eth.Contract(TUSD_ABI, this.TUSD_address);
        this.USDx = new this.new_web3.eth.Contract(USDX_ABI, this.USDx_address);
        this.PAX = new this.new_web3.eth.Contract(PAI_ABI, this.PAX_address);
    }


    handleClick() {

        this.myImage.src = 'images/icon-xls.svg'
        this.FnShow()
    }
    handleClickLocation() {
        this.setState({
            USDT_turn_USDx: !this.state.USDT_turn_USDx
        })

        if (!this.state.USDT_turn_USDx) {
            this.DropDwownWrapper.className = "DropDwownRight"
        }
        else {
            this.DropDwownWrapper.className = "DropDwownWrapper"
        }




    }
    handleClickButton() {

        if (this.state.priceValueInput === null) {

            this.div.className = 'ConnectingBoxShow'
            this.setState({
                AalertInfutter: false
            })

        }
        else {
            this.div.className = 'ConnectingBox'
            if (this.state.USDT_balance < this.state.priceValueInput) {
                this.SelectionBoxUsdt.className = "SelectionBoxUsdtRed"
                this.div.className = 'ConnectingBoxShow'
                this.setState({
                    cardInfo: false,
                    AalertInfutter: true
                })
            }
            else {
                if (this.state.priceValueInput > this.state.USDx_balance) {
                    this.SelectionBoxUstx.className = "SelectioBoxUstxRed"
                    this.div.className = 'ConnectingBoxShow'
                    this.setState({
                        cardInfo: false,
                        AalertInfutter: true
                    })
                }
                else {
                    this.XSwap.methods.sellToken(this.state.priceValueInput, this.USDT_address).send(
                        {
                            from: this.state.my_account
                        }, (reject, res) => {
                            if (res) {
                                console.log(res)
                            }
                            if (reject) {
                                console.log(reject)
                            }
                        }
                    )
                }
            }
               
        }
        this.setState({
            priceValueInputUSDx: this.state.USDT_price * this.state.priceValueInput
        })

        if (this.state.USDT_balance > this.state.priceValueInput && this.state.priceValueInput && this.state.priceValueInput < this.state.USDx_balance) {
            this.setState({
                cardInfo: true
            })
        }
        if(this.state.USDT_turn_USDx)
        {
            console.log('111')
        }
        else {
            console.log('2222')
        }

    }
    FnShow() {
        if (this.state.display_block === 'none') {
            this.setState({
                display_block: 'block',
                display_none: 'none'
            })
        }
        else if (this.state.display_block === 'block') {
            this.setState({
                display_block: 'none',
                display_none: 'block'
            })

        }
    }
    handleClickDisplayNone(item) {
        if (item.USDTname === 'PAX') {
            // this.pax()
        }
        this.setState({
            ChangeName: item.USDTname
        })
        this.setState({
            defaultImg: item.img,
            defaultName: item.USDTname
        })
        this.myImage.src = 'images/icon-xl.svg'
        this.FnShow()
    }
    USDT_approve() {
        this.USDT.methods.approve(this.XSwap_address, -1).send(
            {
                from: this.state.my_account,
            }, (reject, res_hash) => {
                if (res_hash) {
                    console.log(res_hash)
                }

                if (reject) {
                    console.log(reject)
                }
            }
        )
    }

    handleClickMeta() {
        this.USDT_approve()
    }
    inputChange(evt) {

        let value = evt.target.value

        if (evt.target.type === 'tel') {
            value = (value.match(/^\d*(\.?\d{0,2})/g)[0]) || null
        }
        this.setState({
            priceValueInputUSDx: value * this.state.USDT_price
        })
        this.setState({
            priceValueInput: value
        })
    }
    USDXinputChange(e) {
        let value = e.target.value
        if (e.target.type === 'tel') {
            value = (value.match(/^\d*(\.?\d{0,2})/g)[0]) || null
        }
        this.setState({
            priceValueInputUSDx: value
        })
    }
    inputOnFocus(e) {
        if (e.target.value < this.props.balance) {
            this.SelectionBoxUsdt.className = 'SelectionBoxUsdt'
        }
    }

    componentDidMount() {

        setTimeout(() => {
            this.USDT.methods.decimals().call().then(res_tusd_decimals => {
                console.log('TUSD: ', res_tusd_decimals);
                this.XSwap.methods.price(this.TUSD_address).call().then(TUSD_price => {
                    console.log('TUSD_price: ', TUSD_price);

                    this.XSwap.methods.sellRate(this.TUSD_address).call().then(res_sellRate => {
                        console.log('res_sellRate: ', res_sellRate);

                        let number = this.bn(10 ** res_tusd_decimals).mul(this.bn(TUSD_price)).mul(this.bn(10000).sub(this.bn(res_sellRate))).div(this.bn(10000))
                        let snumber = number.toString().substring(18, 0)
                        var str = '0.' + snumber
                        var strNumber = parseFloat(str)
                        var strFloat = strNumber.toFixed(4)
                        this.setState({
                            USDT_price: strFloat
                        })
                    })
                })
            })

            this.USDT.methods.balanceOf(this.state.my_account).call((err, res_balance) => {
                let res_number = parseInt(res_balance)
                let float_number = (res_number / 10 ** 6).toFixed(2)
                this.setState({
                    USDT_balance: float_number
                })

            })
            this.USDx.methods.balanceOf(this.state.my_account).call((err, res_balance) => {
                let res_number = parseInt(res_balance)
                let float_number = (res_number / 10 ** 6).toFixed(2)
                this.setState({
                    USDx_balance: float_number
                })
            })
            this.USDT.methods.allowance(
                this.state.my_account,
                this.XSwap_address).call((err, res) => {
                    if (res.toString() === '0') {
                        this.setState({
                            lockShow: false
                        })
                    }
                    else {
                        this.setState({
                            lockShow: true
                        })
                    }

                })


        }, 5000);

    }
    pax() {
        this.PAX.methods.decimals().call().then(res_tusd_decimals => {
            console.log('PAX: ', res_tusd_decimals);
            this.XSwap.methods.price(this.TUSD_address).call().then(PAX_price => {
                console.log('PAX_price: ', PAX_price);
                this.XSwap.methods.sellRate(this.TUSD_address).call().then(res_sellRate => {
                    console.log('res_sellRate: ', res_sellRate);
                    let number = this.bn(10 ** res_tusd_decimals).mul(this.bn(PAX_price)).mul(this.bn(10000).sub(this.bn(res_sellRate))).div(this.bn(10000))
                    let snumber = number.toString().substring(18, 0)
                    var str = '0.' + snumber
                    var strNumber = parseFloat(str)
                    var strFloat = strNumber.toFixed(4)
                    console.log(strFloat)
                    this.setState({
                        USDT_price: strFloat
                    })
                })
            })
        })
        this.PAX.methods.balanceOf(this.state.my_account).call((err, res_balance) => {
            let res_number = parseInt(res_balance)
            let float_number = (res_number / 10 ** 12).toFixed(2)
            this.setState({
                USDT_balance: float_number
            })
        })
    }

    render() {
        return (
            <>
                <Header addres={this.state.my_account} />
                <SwapTitle />
                <div className="CurrencyConversionBox">

                    <div className="CurrencyConversionAll">
                        <div className="CurrencyConversionLeft">
                            <span>SEND</span>
                            <p>{this.state.USDT_balance}</p>
                        </div>
                        <div className="CurrencyConversionRight">
                            <span>
                                RECEIVE
                           </span>
                        </div>
                    </div>
                    <div className="SelectionBoxAll" ref={(ref) => { this.SelectionBoxAll = ref }}>
                        <div className={this.state.USDT_turn_USDx ? "SelectionBoxUsdtLeft" : 'SelectionBoxUsdt'} ref={(ref) => { this.SelectionBoxUsdt = ref }}>
                            <div className="SelectionBoxUsdtMoeny"  >
                                <img src={this.state.defaultImg} alt="USDT" className="ustdLogo" />
                                <span ref={(ref) => { this.spanUSDt = ref }} onClick={this.handleClick.bind(this)}>{this.state.defaultName}</span>
                                <img src={'images/icon-xl.svg'} alt="xiala" className="selectionDownload" ref={(ref) => { this.myImage = ref }} />
                                <img src={'images/icon-suo.svg'} alt="lock" className={this.state.lockShow ? "selectionNone" : "selectionLock"} onClick={this.handleClickMeta.bind(this)} />
                            </div>
                            <input type="tel" placeholder="Amount" value={this.state.priceValueInput || ''} onChange={(e) => this.inputChange(e)} onFocus={(e) => this.inputOnFocus(e)} />

                        </div>
                        <p onClick={this.handleClickLocation.bind(this)}>
                            <img src={'images/icon-qh.svg'} alt="QH" />
                        </p>
                        <div className={this.state.USDT_turn_USDx ? 'SelectionBoxUsdtRight' : 'SelectionBoxUstx'} ref={(ref) => { this.SelectionBoxUstx = ref }}>
                            <div className="SelectionBoxUsdtMoeny" >
                                <img src={'images/logo-USDx.svg'} alt="USDT" className="ustXLogo" />
                                <span ref={(ref) => { this.spanUSDx = ref }}>USDx</span>
                            </div>
                            <input type='tel' placeholder="Amount" value={this.state.priceValueInputUSDx || ''} onChange={(e) => this.USDXinputChange(e)} />
                        </div>
                    </div>
                    <div className="DropDwownWrapper" ref={(ref) => { this.DropDwownWrapper = ref }} style={{ display: this.state.display_none }}>
                        <div className="ulist">
                            {
                                this.state.selectedItems && this.state.selectedItems.map((item, index) => {

                                    return (<li onClick={this.handleClickDisplayNone.bind(this, item)} key={index}>
                                        <div className="DropdownTerm">
                                            <img src={item.img} alt="USDT" className="ustdLogo" />
                                            <p>{item.USDTname}<span>{item.Tether}</span></p>
                                        </div>
                                        <div className="CheckMark">
                                            <img src={item.defaultImg} alt="" className="XZ" />
                                        </div>
                                    </li>)
                                })
                            }
                        </div>
                    </div>
                    <div className="ConnectingWrapper">
                        <div className='ConnectingBox' ref={(ref) => { this.div = ref }}  >
                            <img src={'images/icon-tx.svg'} alt="QH" />
                            {
                                this.state.AalertInfutter ? <span>Insufficient Balance</span> : <span>Connect your Wallet to Swap</span>
                            }
                        </div>
                        <div className={this.state.cardInfo ? "ButtonSwapgray" : "ButtonSwap"} onClick={this.handleClickButton.bind(this)}>
                            <p>SWAP</p>
                        </div>

                    </div>
                    <Equivalent ustdprice={this.state.USDT_price} ChangeName={this.state.ChangeName} />
                </div>
            </>
        )
    }
}
export default CurrencyConversion