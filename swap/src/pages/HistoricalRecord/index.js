import React, { PureComponent } from 'react'
import './index.scss'
class HistoricalRecord extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    render() {
        return (
            <div className="HistoricalRecordAll">
                <div className="historyTitle">
                    <span>HISTORY</span>
                </div>
                <div className="histroyWrapper">
                    <div className="historySetpbar">
                        <div className="histroycircular">
                            <div></div>
                        </div>
                        <div className="DottedLine"></div>
                        <div className="CheckMarkborder">
                            <img src={'images/iocn-xz.svg'} alt="xz" className="xz" />
                        </div>
                    </div>
                    <div className="histroyWritten">
                        <div className="histroyTop">
                            <div className="histroyTopTitle">
                                <span>Mar 24, 2019 at 10:26:40 |</span>
                                <span className="histroyEspecially">&nbsp;&nbsp;&nbsp;0x830f...22b0</span>
                            </div>
                            <p>Unlock USDT</p>
                        </div>
                        <div className="histroyBottom">
                            <div className="histroyBottomTitle">
                                <span>
                                    Mar 24, 2019 at 10:26:40  |
                                    </span>
                                <span className="histroyEspecially">&nbsp;&nbsp;&nbsp;0x830f...22b0</span>
                            </div>
                            <p>Unlock USDT</p>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default HistoricalRecord