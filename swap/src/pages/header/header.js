import React, { PureComponent } from 'react'
import './style.scss'
import Web3 from 'web3';
let XSwap_Abi = require('../../ABIs/XSwap_ABI.json')

class Header extends PureComponent {
    constructor(props) {
        super(props)
        
        this.state = {
            
        }

        this.new_web3 = window.new_web3 = new Web3(Web3.givenProvider || null);

        this.XSwap_address = "0x5fc6345c302d0127a777eaf924f63c028b087f56";
        this.USDT_address = "0xA1e525F7d24D7cCB78A070BBd12C0BF21Fb4a848";

        this.XSwap = new this.new_web3.eth.Contract(XSwap_Abi, this.XSwap_address);
    }
    handleClickMetaMask ()
    {
        this.XSwap.methods.sellToken('1000000000000000000', this.USDT_address).send(
            {
                from: this.state.my_account,
            }, (reject, res_hash) => {
                // 成功后返回哈希
                if (res_hash) {
                    console.log(res_hash)

                }
                // 点击取消
                if (reject) {
                    console.log(reject)
                }
            }
        )
    }
 

    render() {
        return (
            <header>
                <div className="navLeftlogo">
                    <img src={'images/logo-xswap.svg'} alt="XSWAP" />
                </div>
                <div className="navRightTitle">
                    {                          
                         
                         this.props.addres !== undefined &&  this.props.addres ? <span>{this.props.addres.substring(0, 4) + '...' + this.props.addres.substring(this.props.addres.length - 4)}</span>:<span onClick={this.handleClickMetaMask.bind(this)}>Connect</span>  
                    }
                     
                    <div className="wrongNetwork">
                        <img src={'images/icon-wl.svg'} alt="Wrong Network"/>  
                        <p>Wrong Network</p>
                    </div>
                </div>
            </header>
        )
    }
}
export default Header