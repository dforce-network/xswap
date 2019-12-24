import React, { PureComponent } from 'react'
import './index.scss'
class Equivalent extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {

        }
    }

    render() {
        return (
            <>
                {
                    this.props.ustdprice ? <div className="EquivalentExchange">

                        <span>1 {this.props.ChangeName ? this.props.ChangeName : "USDT"} ={this.props.ustdprice} USDx</span>


                        <img src={'images/icon-yw.svg'} alt="YW" />
                    </div> : null
                }

            </>
        )
    }
}

export default Equivalent