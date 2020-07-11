import address_map from './abi/address';

export const get_token_balance = (that) => {
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['USDx']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_USDx: res_getLiquidity
        });
    })
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['USDT']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_USDT: res_getLiquidity
        });
    })
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['DAI']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_DAI: res_getLiquidity
        });
    })
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['HUSD']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_HUSD: res_getLiquidity
        });
    })
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['BUSD']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_BUSD: res_getLiquidity
        });
    })
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['USDC']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_USDC: res_getLiquidity
        });
    })
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['PAX']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_PAX: res_getLiquidity
        });
    })
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['TUSD']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_TUSD: res_getLiquidity
        });
    })
    that.state.XSwap_stable.methods.getLiquidity(address_map[that.state.net_type]['GOLDx']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_GOLDx: res_getLiquidity
        });
    })

    // that.state.XSwap_btc.methods.getLiquidity(address_map[that.state.net_type]['imBTC']).call().then(res_getLiquidity => {
    //     // console.log('cur liquidaty: ', res_getLiquidity);
    //     that.setState({
    //         cur_liquidaty_imBTC: res_getLiquidity
    //     });
    // })
    that.state.XSwap_btc.methods.getLiquidity(address_map[that.state.net_type]['HBTC']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_HBTC: res_getLiquidity
        });
    })
    that.state.XSwap_btc.methods.getLiquidity(address_map[that.state.net_type]['WBTC']).call().then(res_getLiquidity => {
        // console.log('cur liquidaty: ', res_getLiquidity);
        that.setState({
            cur_liquidaty_WBTC: res_getLiquidity
        });
    })
}
export const get_token_lending = (that) => {
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['USDx']).call().then(res_lending => {
        // console.log('cur lending_USDx: ', res_lending);
        that.setState({
            cur_lending_USDx: res_lending
        });
    })
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['USDT']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_USDT: res_lending
        });
    })
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['DAI']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_DAI: res_lending
        });
    })
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['HUSD']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_HUSD: res_lending
        });
    })
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['BUSD']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_BUSD: res_lending
        });
    })
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['USDC']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_USDC: res_lending
        });
    })
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['PAX']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_PAX: res_lending
        });
    })
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['TUSD']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_TUSD: res_lending
        });
    })
    that.state.XSwap_stable.methods.supportDToken(address_map[that.state.net_type]['GOLDx']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_GOLDx: res_lending
        });
    })

    // that.state.XSwap_btc.methods.supportDToken(address_map[that.state.net_type]['imBTC']).call().then(res_lending => {
    //     // console.log('cur liquidaty: ', res_lending);
    //     that.setState({
    //         cur_lending_imBTC: res_lending
    //     });
    // })
    that.state.XSwap_btc.methods.supportDToken(address_map[that.state.net_type]['HBTC']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_HBTC: res_lending
        });
    })
    that.state.XSwap_btc.methods.supportDToken(address_map[that.state.net_type]['WBTC']).call().then(res_lending => {
        // console.log('cur liquidaty: ', res_lending);
        that.setState({
            cur_lending_WBTC: res_lending
        });
    })
}
export const get_token_enable = (that) => {
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['USDx']).call().then(res_enable => {
        // console.log('cur enable_USDx: ', res_enable);
        that.setState({
            cur_enable_USDx: res_enable
        });
    })
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['USDT']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_USDT: res_enable
        });
    })
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['DAI']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_DAI: res_enable
        });
    })
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['HUSD']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_HUSD: res_enable
        });
    })
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['BUSD']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_BUSD: res_enable
        });
    })
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['USDC']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_USDC: res_enable
        });
    })
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['PAX']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_PAX: res_enable
        });
    })
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['TUSD']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_TUSD: res_enable
        });
    })
    that.state.XSwap_stable.methods.tokensEnable(address_map[that.state.net_type]['GOLDx']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_GOLDx: res_enable
        });
    })

    // that.state.XSwap_btc.methods.tokensEnable(address_map[that.state.net_type]['imBTC']).call().then(res_enable => {
    //     // console.log('cur liquidaty: ', res_enable);
    //     that.setState({
    //         cur_enable_imBTC: res_enable
    //     });
    // })
    that.state.XSwap_btc.methods.tokensEnable(address_map[that.state.net_type]['HBTC']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_HBTC: res_enable
        });
    })
    that.state.XSwap_btc.methods.tokensEnable(address_map[that.state.net_type]['WBTC']).call().then(res_enable => {
        // console.log('cur liquidaty: ', res_enable);
        that.setState({
            cur_enable_WBTC: res_enable
        });
    })
}
export const get_token_price = (that) => {
    that.state.Oracle.methods.assetPrices(address_map[that.state.net_type]['DAI']).call().then(res_price => {
        // console.log('res_price_DAI: ', res_price);
        that.setState({
            price_DAI: res_price
        });
    })
    that.state.Oracle.methods.assetPrices(address_map[that.state.net_type]['USDT']).call().then(res_price => {
        // console.log('res_price_DAI: ', res_price);
        that.setState({
            price_USDT: res_price
        });
    })
    that.state.Oracle.methods.assetPrices(address_map[that.state.net_type]['HUSD']).call().then(res_price => {
        // console.log('res_price_DAI: ', res_price);
        that.setState({
            price_HUSD: res_price
        });
    })
    that.state.Oracle.methods.assetPrices(address_map[that.state.net_type]['USDx']).call().then(res_price => {
        // console.log('res_price_DAI: ', res_price);
        that.setState({
            price_USDx: res_price
        });
    })
    that.state.Oracle.methods.assetPrices(address_map[that.state.net_type]['GOLDx']).call().then(res_price => {
        // console.log('res_price_DAI: ', res_price);
        that.setState({
            price_GOLDx: res_price
        });
    })
}
export const get_is_open_state = (that) => {
    that.state.XSwap_stable.methods.isOpen().call().then(res_is_open_s => {
        // if (res_is_open_s) {
        // console.log('res_is_open_s: ', res_is_open_s);
        that.setState({
            got_is_open_xswap: true,
            is_open_xswap: res_is_open_s
        });
        // }
    })
    that.state.XSwap_btc.methods.isOpen().call().then(res_is_open => {
        // if (res_is_open) {
        // console.log('res_is_open_btc: ', res_is_open);
        that.setState({
            got_is_open_xswap_btc: true,
            is_open_xswap_btc: res_is_open
        });
        // }
    })
}
export const get_my_balance = (that) => {
    that.state.USDx.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_USDx: res_balance
            })
        }
    });

    that.state.HUSD.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_HUSD: res_balance
            })
        }
    });

    that.state.HBTC.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_HBTC: res_balance
            })
        }
    });

    that.state.BUSD.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_BUSD: res_balance
            })
        }
    });

    // that.state.imBTC.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
    //     if (res_balance) {
    //         that.setState({
    //             my_balance_imBTC: res_balance
    //         })
    //     }
    // });

    that.state.WBTC.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_WBTC: res_balance
            })
        }
    });

    that.state.USDT.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_USDT: res_balance
            })
        }
    });

    that.state.USDC.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_USDC: res_balance
            })
        }
    });

    that.state.PAX.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_PAX: res_balance
            })
        }
    });

    that.state.TUSD.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_TUSD: res_balance
            })
        }
    });

    that.state.DAI.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_DAI: res_balance
            })
        }
    });

    that.state.GOLDx.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
        if (res_balance) {
            that.setState({
                my_balance_GOLDx: res_balance
            })
        }
    });
}



export const get_first_data = (that) => {
    that.state.XSwap_stable.methods.fee(
        address_map[that.state.net_type][that.state.cur_send_token],
        address_map[that.state.net_type][that.state.cur_receive_token]
    ).call().then(res_Fee => {
        // console.log('res Fee: ', res_Fee);
        that.setState({
            cur_Fee: res_Fee
        });
    })
    that.state.XSwap_stable.methods.tradesDisable(
        address_map[that.state.net_type][that.state.cur_send_token],
        address_map[that.state.net_type][that.state.cur_receive_token]
    ).call().then(res_tradesDisable => {
        // console.log('res tradesDisable: ', res_tradesDisable);
        that.setState({
            cur_tradesDisable_stable: res_tradesDisable
        });
    })


    that.state.XSwap_btc.methods.fee(
        address_map[that.state.net_type][that.state.cur_send_token_btc],
        address_map[that.state.net_type][that.state.cur_receive_token_btc]
    ).call().then(res_Fee_btc => {
        // console.log('res Fee btc: ', res_Fee_btc);
        that.setState({
            cur_Fee_btc: res_Fee_btc
        });
    })
    that.state.XSwap_btc.methods.tradesDisable(
        address_map[that.state.net_type][that.state.cur_send_token_btc],
        address_map[that.state.net_type][that.state.cur_receive_token_btc]
    ).call().then(res_tradesDisable_btc => {
        // console.log('res Fee btc: ', res_Fee_btc);
        that.setState({
            cur_tradesDisable_btc: res_tradesDisable_btc
        });
    })
}
export const get_fee = (that) => {
    that.state.XSwap_stable.methods.fee(
        address_map[that.state.net_type][that.state.cur_send_token],
        address_map[that.state.net_type][that.state.cur_receive_token]
    ).call().then(res_Fee => {
        // console.log('res Fee: ', res_Fee);
        that.setState({
            cur_Fee: res_Fee
        });
    })
    that.state.XSwap_stable.methods.tradesDisable(
        address_map[that.state.net_type][that.state.cur_send_token],
        address_map[that.state.net_type][that.state.cur_receive_token]
    ).call().then(res_tradesDisable => {
        // console.log('res tradesDisable: ', res_tradesDisable);
        that.setState({
            cur_tradesDisable_stable: res_tradesDisable
        });
    })
}
export const get_fee_btc = (that) => {
    that.state.XSwap_btc.methods.fee(
        address_map[that.state.net_type][that.state.cur_send_token_btc],
        address_map[that.state.net_type][that.state.cur_receive_token_btc]
    ).call().then(res_Fee_btc => {
        // console.log('res Fee btc: ', res_Fee_btc);
        that.setState({
            cur_Fee_btc: res_Fee_btc
        });
    })
    that.state.XSwap_btc.methods.tradesDisable(
        address_map[that.state.net_type][that.state.cur_send_token_btc],
        address_map[that.state.net_type][that.state.cur_receive_token_btc]
    ).call().then(res_tradesDisable_btc => {
        // console.log('res Fee btc: ', res_Fee_btc);
        that.setState({
            cur_tradesDisable_btc: res_tradesDisable_btc
        });
    })
}


export const Emergency_start = (that, Contract) => {
    Contract.methods.emergencyStop(true).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (reject) {
                console.log(reject);
                that.setState({
                    mask_Emergency: false,
                    cur_Emergency_action: ''
                });
            }
            if (res_hash) {
                console.log(res_hash);
                that.setState({
                    mask_Emergency: false,
                    cur_Emergency_action: ''
                });
            }
        }
    )
}
export const Emergency_stop = (that, Contract) => {
    Contract.methods.emergencyStop(false).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (reject) {
                console.log(reject);
                that.setState({
                    mask_Emergency: false,
                    cur_Emergency_action: ''
                });
            }
            if (res_hash) {
                console.log(res_hash);
                that.setState({
                    mask_Emergency: false,
                    cur_Emergency_action: ''
                });
            }
        }
    )
}


export const format_persentage = (num) => {
    return num / 10 + '%';
}

export const format_persentage_tofixed = (num) => {
    return (num / 10).toFixed(1) + '%';
}

export const format_balance = (numStr, decimals, decimalPlace = decimals) => {
    numStr = numStr.toLocaleString().replace(/,/g, '');
    // decimals = decimals.toString();
    var str = (10 ** decimals).toLocaleString().replace(/,/g, '').slice(1);
    var res = (numStr.length > decimals ?
        numStr.slice(0, numStr.length - decimals) + '.' + numStr.slice(numStr.length - decimals) :
        '0.' + str.slice(0, str.length - numStr.length) + numStr).replace(/(0+)$/g, "");
    res = res.slice(-1) === '.' ? res + '00' : res;
    if (decimalPlace === 0)
        return res.slice(0, res.indexOf('.'));
    var length = res.indexOf('.') + 1 + decimalPlace;
    return res.slice(0, length >= res.length ? res.length : length);
    // return res.slice(-1) == '.' ? res + '00' : res;
}

export const format_str_to_K = (str_num) => {
    var reg = /\d{1,3}(?=(\d{3})+$)/g;

    // if (str_num.indexOf('.') > 0) {
    //   str_num = str_num.slice(0, str_num.indexOf('.') + 3);
    // }

    if (str_num.indexOf('.') > 0) {
        var part_a = str_num.split('.')[0];
        var part_b = str_num.split('.')[1];
        part_a = (part_a + '').replace(reg, '$&,');
        return part_a + '.' + part_b;
    } else {
        str_num = (str_num + '').replace(reg, '$&,');
        return str_num;
    }
}


export const handle_Transfer_in_change = (that, value, decimal) => {
    if (value.length > 18) {
        return;
    }

    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
        var sub_num = temp_value.length - temp_value.indexOf('.') - 1;
        if (sub_num > decimal) {
            that.setState({
                Transfer_in_value: value
            });
            return false;
        }
        temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);
        amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimal - sub_num)));
    } else {
        amount_bn = that.bn(value).mul(that.bn(10 ** decimal));
    }

    console.log(amount_bn.toString());

    that.setState({
        Transfer_in_value: value,
        Transfer_in_value_real: amount_bn
    });
}
export const handle_Transfer_in_max = (that, cur_Transfer_in_token, decimals) => {
    var t_balance;
    if (cur_Transfer_in_token === 'USDx') {
        t_balance = that.state.my_balance_USDx;
    } else if (cur_Transfer_in_token === 'HUSD') {
        t_balance = that.state.my_balance_HUSD;
    } else if (cur_Transfer_in_token === 'HBTC') {
        t_balance = that.state.my_balance_HBTC;
    } else if (cur_Transfer_in_token === 'BUSD') {
        t_balance = that.state.my_balance_BUSD;
    } else if (cur_Transfer_in_token === 'imBTC') {
        t_balance = that.state.my_balance_imBTC;
    } else if (cur_Transfer_in_token === 'WBTC') {
        t_balance = that.state.my_balance_WBTC;
    } else if (cur_Transfer_in_token === 'USDT') {
        t_balance = that.state.my_balance_USDT;
    } else if (cur_Transfer_in_token === 'USDC') {
        t_balance = that.state.my_balance_USDC;
    } else if (cur_Transfer_in_token === 'PAX') {
        t_balance = that.state.my_balance_PAX;
    } else if (cur_Transfer_in_token === 'TUSD') {
        t_balance = that.state.my_balance_TUSD;
    } else if (cur_Transfer_in_token === 'DAI') {
        t_balance = that.state.my_balance_DAI;
    } else if (cur_Transfer_in_token === 'GOLDx') {
        t_balance = that.state.my_balance_GOLDx;
    }

    var to_show;
    if (t_balance.length <= decimals) {
        to_show = ('0.' + ('000000000000000000' + t_balance).substr(-decimals)).substring(0, 18);
    } else {
        to_show = (that.bn(t_balance).div(that.bn(10 ** decimals)) + '.' + t_balance.substr(-decimals)).substring(0, 18);
    }

    that.setState({
        Transfer_in_value: to_show,
        Transfer_in_value_real: t_balance
    });
}
export const handle_Transfer_out_change = (that, value, decimal) => {
    that.setState({
        Transfer_out_value_real_bool: false
    });
    if (value.length > 18) {
        return;
    }

    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
        var sub_num = temp_value.length - temp_value.indexOf('.') - 1;
        if (sub_num > decimal) {
            that.setState({
                Transfer_out_value: value
            });
            return false;
        }
        temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);
        amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimal - sub_num)));
    } else {
        amount_bn = that.bn(value).mul(that.bn(10 ** decimal));
    }

    console.log(amount_bn.toString());

    that.setState({
        Transfer_out_value: value,
        Transfer_out_value_real: amount_bn
    });
}
export const handle_Transfer_out_max = (that, cur_Transfer_out_token, decimals) => {
    var t_balance;
    if (cur_Transfer_out_token === 'USDx') {
        t_balance = that.state.cur_liquidaty_USDx;
    } else if (cur_Transfer_out_token === 'HUSD') {
        t_balance = that.state.cur_liquidaty_HUSD;
    } else if (cur_Transfer_out_token === 'HBTC') {
        t_balance = that.state.cur_liquidaty_HBTC;
    } else if (cur_Transfer_out_token === 'BUSD') {
        t_balance = that.state.cur_liquidaty_BUSD;
    } else if (cur_Transfer_out_token === 'imBTC') {
        t_balance = that.state.cur_liquidaty_imBTC;
    } else if (cur_Transfer_out_token === 'WBTC') {
        t_balance = that.state.cur_liquidaty_WBTC;
    } else if (cur_Transfer_out_token === 'USDT') {
        t_balance = that.state.cur_liquidaty_USDT;
    } else if (cur_Transfer_out_token === 'USDC') {
        t_balance = that.state.cur_liquidaty_USDC;
    } else if (cur_Transfer_out_token === 'PAX') {
        t_balance = that.state.cur_liquidaty_PAX;
    } else if (cur_Transfer_out_token === 'TUSD') {
        t_balance = that.state.cur_liquidaty_TUSD;
    } else if (cur_Transfer_out_token === 'DAI') {
        t_balance = that.state.cur_liquidaty_DAI;
    } else if (cur_Transfer_out_token === 'GOLDx') {
        t_balance = that.state.cur_liquidaty_GOLDx;
    }

    var to_show;
    if (t_balance.length <= decimals) {
        to_show = ('0.' + ('000000000000000000' + t_balance).substr(-decimals)).substring(0, 18);
    } else {
        to_show = (that.bn(t_balance).div(that.bn(10 ** decimals)) + '.' + t_balance.substr(-decimals)).substring(0, 18);
    }

    that.setState({
        Transfer_out_value: to_show,
        Transfer_out_value_real_bool: true
    });
}
export const click_Transfer_in = (that) => {
    if (!that.state.Transfer_in_value) {
        return;
    }
    that.setState({
        is_enbale_transferIn: false
    });
    var t_Contract = that.state.XSwap_stable;
    var t_xswapAddr = address_map[that.state.net_type]['XSwap_stable'];
    if (
        that.state.cur_Transfer_in_token === 'HBTC'
        || that.state.cur_Transfer_in_token === 'imBTC'
        || that.state.cur_Transfer_in_token === 'WBTC'
    ) {
        t_Contract = that.state.XSwap_btc;
        t_xswapAddr = address_map[that.state.net_type]['XSwap_btc'];
    }


    var t_tokenIn_contract = that.state.USDx;
    if (that.state.cur_Transfer_in_token === 'HBTC') {
        t_tokenIn_contract = that.state.HBTC;
    } else if (that.state.cur_Transfer_in_token === 'imBTC') {
        t_tokenIn_contract = that.state.imBTC;
    } else if (that.state.cur_Transfer_in_token === 'WBTC') {
        t_tokenIn_contract = that.state.WBTC;
    } else if (that.state.cur_Transfer_in_token === 'USDT') {
        t_tokenIn_contract = that.state.USDT;
    } else if (that.state.cur_Transfer_in_token === 'DAI') {
        t_tokenIn_contract = that.state.DAI;
    } else if (that.state.cur_Transfer_in_token === 'HUSD') {
        t_tokenIn_contract = that.state.HUSD;
    } else if (that.state.cur_Transfer_in_token === 'BUSD') {
        t_tokenIn_contract = that.state.BUSD;
    } else if (that.state.cur_Transfer_in_token === 'USDC') {
        t_tokenIn_contract = that.state.USDC;
    } else if (that.state.cur_Transfer_in_token === 'PAX') {
        t_tokenIn_contract = that.state.PAX;
    } else if (that.state.cur_Transfer_in_token === 'TUSD') {
        t_tokenIn_contract = that.state.TUSD;
    } else if (that.state.cur_Transfer_in_token === 'GOLDx') {
        t_tokenIn_contract = that.state.GOLDx;
    }


    t_tokenIn_contract.methods.allowance(that.state.my_account, t_xswapAddr).call((err, res_allowance) => {
        if (that.bn(res_allowance).gt(that.bn('0'))) {
            console.log((that.state.Transfer_in_value_real).toString());
            t_Contract.methods.transferIn(
                address_map[that.state.net_type][that.state.cur_Transfer_in_token],
                (that.state.Transfer_in_value_real).toString()
            ).send(
                {
                    from: that.state.my_account,
                    gas: 250000
                }, (reject, res_hash) => {
                    if (res_hash) {
                        that.setState({
                            is_enbale_transferIn: true,
                            Transfer_in_value: ''
                        });
                    }
                    if (reject) {
                        that.setState({
                            is_enbale_transferIn: true
                        });
                    }
                }
            )
        } else {

            // approve first
            t_tokenIn_contract.methods.approve(t_xswapAddr, -1).send(
                {
                    from: that.state.my_account,
                    gas: 250000
                }, (reject, res_hash) => {
                    if (reject) {
                        that.setState({
                            is_enbale_transferIn: true
                        });
                    }
                    if (res_hash) {
                        console.log((that.state.Transfer_in_value_real).toString());
                        t_Contract.methods.transferIn(
                            address_map[that.state.net_type][that.state.cur_Transfer_in_token],
                            (that.state.Transfer_in_value_real).toString()
                        ).send(
                            {
                                from: that.state.my_account,
                                gas: 250000
                            }, (reject, res_hash) => {
                                if (res_hash) {
                                    that.setState({
                                        is_enbale_transferIn: true,
                                        Transfer_in_value: ''
                                    });
                                }
                                if (reject) {
                                    that.setState({
                                        is_enbale_transferIn: true
                                    });
                                }
                            }
                        )
                    }
                }
            )
        }
    })
}
export const click_Transfer_out = (that) => {
    if (!that.state.Transfer_out_value) {
        return;
    }
    that.setState({
        is_enbale_transferOut: false
    });

    var t_Contract = that.state.XSwap_stable;
    if (that.state.cur_Transfer_out_token === 'HBTC'
        || that.state.cur_Transfer_out_token === 'imBTC'
        || that.state.cur_Transfer_out_token === 'WBTC') {
        t_Contract = that.state.XSwap_btc;
    }
    console.log((that.state.Transfer_out_value_real).toString());

    if (that.state.Transfer_out_value_real_bool) {
        click_Transfer_out_all(that, t_Contract);
        return false;
    }

    t_Contract.methods.transferOut(
        address_map[that.state.net_type][that.state.cur_Transfer_out_token],
        that.state.my_account,
        (that.state.Transfer_out_value_real).toString()
    ).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                that.setState({
                    is_enbale_transferOut: true,
                    Transfer_out_value: ''
                });
            }
            if (reject) {
                that.setState({
                    is_enbale_transferOut: true
                });
            }
        }
    )
}
export const click_Transfer_out_all = (that, t_Contract) => {
    t_Contract.methods.transferOutALL(
        address_map[that.state.net_type][that.state.cur_Transfer_out_token],
        that.state.my_account
    ).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                that.setState({
                    is_enbale_transferOut: true,
                    Transfer_out_value: ''
                });
            }
            if (reject) {
                that.setState({
                    is_enbale_transferOut: true
                });
            }
        }
    )
}



export const control_lending_disableLending = (that, t_Contract, token) => {
    t_Contract.methods.disableDToken(address_map[that.state.net_type][token]).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                console.log(res_hash);
            }
            if (reject) {
                console.log(reject);
            }
        }
    )
}
export const control_lending_enableLending = (that, t_Contract, token) => {
    t_Contract.methods.enableDToken(address_map[that.state.net_type][token]).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                console.log(res_hash);
            }
            if (reject) {
                console.log(reject);
            }
        }
    )
}
export const control_enable_enableToken = (that, t_Contract, token) => {
    t_Contract.methods.enableToken(address_map[that.state.net_type][token]).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                console.log(res_hash);
            }
            if (reject) {
                console.log(reject);
            }
        }
    )
}
export const control_enable_disableToken = (that, t_Contract, token) => {
    t_Contract.methods.disableToken(address_map[that.state.net_type][token]).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                console.log(res_hash);
            }
            if (reject) {
                console.log(reject);
            }
        }
    )
}



export const setfee_click = (that, t_Contract, cur_input_token, cur_output_token, setfee_value_real) => {
    // console.log(cur_input_token, cur_output_token, setfee_value_real);
    t_Contract.methods.setFee(
        address_map[that.state.net_type][cur_input_token],
        address_map[that.state.net_type][cur_output_token],
        setfee_value_real
    ).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                console.log(res_hash);
                that.show_setfee_Cancel();
            }
            if (reject) {
                console.log(reject);
                that.show_setfee_Cancel();
            }
        }
    )
}
export const enableTrade_click = (that, t_Contract, cur_input_token, cur_output_token) => {
    // console.log(cur_input_token, cur_output_token, setfee_value_real);
    t_Contract.methods.enableTrade(
        address_map[that.state.net_type][cur_input_token],
        address_map[that.state.net_type][cur_output_token]
    ).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                console.log(res_hash);
                that.mask_click_open_Cancel();
            }
            if (reject) {
                console.log(reject);
                that.mask_click_open_Cancel();
            }
        }
    )
}
export const disableTrade_click = (that, t_Contract, cur_input_token, cur_output_token) => {
    // console.log(cur_input_token, cur_output_token, setfee_value_real);
    t_Contract.methods.disableTrade(
        address_map[that.state.net_type][cur_input_token],
        address_map[that.state.net_type][cur_output_token]
    ).send(
        {
            from: that.state.my_account,
            gas: 250000
        }, (reject, res_hash) => {
            if (res_hash) {
                console.log(res_hash);
                that.mask_click_close_Cancel();
            }
            if (reject) {
                console.log(reject);
                that.mask_click_close_Cancel();
            }
        }
    )
}