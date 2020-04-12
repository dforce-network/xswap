
let address_map = require('./abi/address_map.json');


export const swap_click = (that, input_addr, output_addr) => {
  if (!that.state.is_wap_enable) {
    console.log('i return u');
    return false;
  }
  that.setState({
    is_wap_enable: false
  })

  var t_str_xswap = that.state.is_stable_coin_send ? 'XSwap_stable' : 'XSwap_btc';
  var t_obj_xswap = that.state.is_stable_coin_send ? that.state.XSwap_stable : that.state.XSwap_btc;

  that.state.cur_send_contract.methods.allowance(that.state.my_account, address_map[that.state.net_type][t_str_xswap]).call((err, res_allowance) => {
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      t_obj_xswap.methods.swap(input_addr, output_addr, that.state.side_A_amount_real.toString())
        .send({
          from: that.state.my_account,
          gas: 1000000
        }, (reject, res_hash) => {
          if (res_hash) {
            console.log(res_hash);
            let timestamp = new Date().getTime();
            i_got_hash(
              that,
              that.state.my_account,
              that.state.net_type,
              that.state.cur_send_addr,
              format_bn(that.state.side_A_amount_real, that.state.cur_send_decimals, 2),
              that.state.cur_recive_addr,
              that.state.side_B_amount,
              res_hash,
              timestamp,
              'pendding'
            );
            that.setState({
              is_wap_enable: true,
              side_A_amount: '',
              side_B_amount: ''
            })
          }
          if (reject) {
            console.log(reject);
            that.setState({
              is_wap_enable: true
            })
          }
        })
    } else {
      that.state.cur_send_contract.methods.approve(address_map[that.state.net_type][t_str_xswap], -1).send(
        {
          from: that.state.my_account,
        }, (reject, res_hash) => {
          if (res_hash) {
            console.log(res_hash);
            t_obj_xswap.methods.swap(input_addr, output_addr, that.state.side_A_amount_real.toString())
              .send({
                from: that.state.my_account,
                gas: 1000000
              }, (reject, res_hash) => {
                if (res_hash) {
                  console.log(res_hash);
                  let timestamp = new Date().getTime();
                  i_got_hash(
                    that,
                    that.state.my_account,
                    that.state.net_type,
                    that.state.cur_send_addr,
                    format_bn(that.state.side_A_amount_real, that.state.cur_send_decimals, 2),
                    that.state.cur_recive_addr,
                    that.state.side_B_amount,
                    res_hash,
                    timestamp,
                    'pendding'
                  );
                  that.setState({
                    is_wap_enable: true,
                    side_A_amount: '',
                    side_B_amount: ''
                  })
                }
                if (reject) {
                  console.log(reject);
                  that.setState({
                    is_wap_enable: true
                  })
                }
              })
          }
          if (reject) {
            console.log(reject);
            that.setState({
              is_wap_enable: true
            })
          }
        }
      )
    }
  });
}
export const swapTo_click = (that, input_addr, output_addr) => {
  if (!that.state.is_wap_enable) {
    console.log('i return u');
    return false;
  }
  that.setState({
    is_wap_enable: false
  })

  var t_str_xswap = that.state.is_stable_coin_send ? 'XSwap_stable' : 'XSwap_btc';
  var t_obj_xswap = that.state.is_stable_coin_send ? that.state.XSwap_stable : that.state.XSwap_btc;

  that.state.cur_send_contract.methods.allowance(that.state.my_account, address_map[that.state.net_type][t_str_xswap]).call((err, res_allowance) => {
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      t_obj_xswap.methods.swapTo(input_addr, output_addr, that.state.side_B_amount_real.toString())
        .send({
          from: that.state.my_account,
          gas: 1000000
        }, (reject, res_hash) => {
          if (res_hash) {
            console.log(res_hash);
            let timestamp = new Date().getTime();
            i_got_hash(
              that,
              that.state.my_account,
              that.state.net_type,
              that.state.cur_send_addr,
              // format_bn(that.state.side_A_amount_real, that.state.cur_send_decimals, 2),
              that.state.side_A_amount,
              that.state.cur_recive_addr,
              // that.state.side_B_amount,
              format_bn(that.state.side_B_amount_real, that.state.cur_recive_decimals, 2),
              res_hash,
              timestamp,
              'pendding'
            );
            that.setState({
              is_wap_enable: true,
              side_A_amount: '',
              side_B_amount: ''
            })
          }
          if (reject) {
            console.log(reject);
            that.setState({
              is_wap_enable: true
            })
          }
        })
    } else {
      that.state.cur_send_contract.methods.approve(address_map[that.state.net_type][t_str_xswap], -1).send(
        {
          from: that.state.my_account,
        }, (reject, res_hash) => {
          if (res_hash) {
            console.log(res_hash);
            t_obj_xswap.methods.swapTo(input_addr, output_addr, that.state.side_B_amount_real.toString())
              .send({
                from: that.state.my_account,
                gas: 1000000
              }, (reject, res_hash) => {
                if (res_hash) {
                  console.log(res_hash);
                  let timestamp = new Date().getTime();
                  i_got_hash(
                    that, that.state.my_account, that.state.net_type,
                    that.state.cur_send_addr, that.state.side_A_amount,
                    that.state.cur_recive_addr, format_bn(that.state.side_B_amount_real, that.state.cur_send_decimals, 2),
                    res_hash, timestamp, 'pendding'
                  );
                  that.setState({
                    is_wap_enable: true,
                    side_A_amount: '',
                    side_B_amount: ''
                  })
                }
                if (reject) {
                  console.log(reject);
                  that.setState({
                    is_wap_enable: true
                  })
                }
              })
          }
          if (reject) {
            console.log(reject);
            that.setState({
              is_wap_enable: true
            })
          }
        }
      )
    }
  });
}


export const get_exchange__get_fee = (that, input_addr, output_addr, t_bool) => {
  // console.log(t_bool);
  // console.log(input_addr);
  // console.log(output_addr);
  var t_Contract = t_bool ? that.state.XSwap_stable : that.state.XSwap_btc;

  t_Contract.methods.exchangeRate(input_addr, output_addr).call().then(res_exchange_price => {
    console.log('cur_exchange: ', res_exchange_price);
    that.setState({
      cur_exchange: res_exchange_price
    });
  })
  t_Contract.methods.getLiquidity(output_addr).call().then(res_getLiquidity => {
    console.log('cur liquidaty: ', res_getLiquidity);
    that.setState({
      cur_liquidaty: res_getLiquidity
    });
  })
}


export const get_data_first = (that, address_XSwap, input_addr, output_addr) => {
  that.state.USDT.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({
        is_approved_USDT: true,
        cur_is_approved: true
      });
    } else {
      that.setState({
        is_approved_USDT: false,
        cur_is_approved: false
      });
    }
  });

  that.state.USDT.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance_USDT: res_balance,
        cur_balance: res_balance
      })
    }
  });

  that.state.XSwap_stable.methods.exchangeRate(input_addr, output_addr).call().then(res_exchange_price => {
    console.log('cur_exchange: ', res_exchange_price);
    that.setState({
      cur_exchange: res_exchange_price
    })
  })

  that.state.XSwap_stable.methods.getLiquidity(output_addr).call().then(res_getLiquidity => {
    console.log('cur liquidaty: ', res_getLiquidity);
    that.setState({
      cur_liquidaty: res_getLiquidity
    });
  })
}


export const format_bn = (numStr, decimals, decimalPlace = decimals) => {
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

export const i_got_hash = (that, account, net_type, send_token, send_amount, recive_token, recive_amount, hash, timestamp, status) => {
  if (window.localStorage) {
    let key = account + '-' + net_type;
    let historyData = JSON.parse(window.localStorage.getItem(key)) || [];
    historyData.push({
      account: account,
      net_type: net_type,
      send_token: send_token,
      send_amount: send_amount,
      recive_token: recive_token,
      recive_amount: recive_amount,
      hash: hash,
      timestamp: timestamp,
      status: status
    });
    window.localStorage.setItem(key, JSON.stringify(historyData));
    console.log('got hash && setItem.');

    that.setState({ load_new_history: Math.random() });
  }
}


export const format_num_to_K = (str_num) => {
  var part_a = str_num.split('.')[0];
  var part_b = str_num.split('.')[1];

  var reg = /\d{1,3}(?=(\d{3})+$)/g;
  part_a = (part_a + '').replace(reg, '$&,');

  return part_a + '.' + part_b;
}


// *** line line line ***


export const get_my_balance = (that) => {
  that.state.USDx.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance_USDx: res_balance
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
  that.state.HUSD.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance_HUSD: res_balance
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


  that.state.imBTC.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance_imBTC: res_balance
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
  that.state.WBTC.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance_WBTC: res_balance
      })
    }
  });
}


export const handle_A_max = (that) => {
  that.setState({
    is_from_right_input: false
  });
  var t_obj_xswap = that.state.is_stable_coin_send ? that.state.XSwap_stable : that.state.XSwap_btc;

  var t_balance;
  if (that.state.cur_send_addr === 'USDT') {
    t_balance = that.state.my_balance_USDT;
  } else if (that.state.cur_send_addr === 'USDx') {
    t_balance = that.state.my_balance_USDx;
  } else if (that.state.cur_send_addr === 'USDC') {
    t_balance = that.state.my_balance_USDC;
  } else if (that.state.cur_send_addr === 'TUSD') {
    t_balance = that.state.my_balance_TUSD;
  } else if (that.state.cur_send_addr === 'PAX') {
    t_balance = that.state.my_balance_PAX;
  } else if (that.state.cur_send_addr === 'DAI') {
    t_balance = that.state.my_balance_DAI;
  } else if (that.state.cur_send_addr === 'HBTC') {
    t_balance = that.state.my_balance_HBTC;
  } else if (that.state.cur_send_addr === 'imBTC') {
    t_balance = that.state.my_balance_imBTC;
  } else if (that.state.cur_send_addr === 'WBTC') {
    t_balance = that.state.my_balance_WBTC;
  } else if (that.state.cur_send_addr === 'HUSD') {
    t_balance = that.state.my_balance_HUSD;
  } else if (that.state.cur_send_addr === 'BUSD') {
    t_balance = that.state.my_balance_BUSD;
  }

  console.log(t_balance);

  t_obj_xswap.methods.getAmountByInput(
    address_map[that.state.net_type][that.state.cur_send_addr],
    address_map[that.state.net_type][that.state.cur_recive_addr],
    t_balance
  ).call().then(res_i_can_get => {
    console.log('i_can_get token: ', res_i_can_get);
    that.setState({
      side_B_amount: format_bn(res_i_can_get, that.state.cur_recive_decimals, 4)
    });
  })

  that.setState({
    is_wap_enable: true,
    side_A_amount: format_bn(t_balance, that.state.cur_send_decimals, 4),
    side_A_amount_real: that.bn(t_balance),
    is_Insufficient_Balance: false
  });
}


export const handle_A_change = (value, that) => {
  if (value.length > 18) {
    return;
  }
  if (value === '') {
    // console.log('nullllllllll');
    that.setState({
      side_A_amount: '',
      is_wap_enable: false,
      side_B_amount: '',
      is_Insufficient_Balance: false,
      is_liquidity_limit: false
    });
    return;
  }

  that.setState({
    is_from_right_input: false
  });
  var t_obj_xswap = that.state.is_stable_coin_send ? that.state.XSwap_stable : that.state.XSwap_btc;

  var amount_bn;
  var temp_value = value;
  if (temp_value.indexOf('.') > 0) {
    var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
    if (sub_num > that.state.cur_send_decimals) {
      that.setState({
        side_A_amount: value,
        is_wap_enable: false
      });
      return false;
    }
    temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(temp_value).mul(that.bn(10 ** (that.state.cur_send_decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(value).mul(that.bn(10 ** that.state.cur_send_decimals));
  }

  console.log(amount_bn.toString());

  t_obj_xswap.methods.getAmountByInput(
    address_map[that.state.net_type][that.state.cur_send_addr],
    address_map[that.state.net_type][that.state.cur_recive_addr],
    amount_bn.toString()
  ).call().then(res_i_can_get => {
    console.log('i_can_get token: ', res_i_can_get);
    that.setState({
      side_B_amount: format_bn(res_i_can_get, that.state.cur_recive_decimals, 4)
    });

    var t_balance;
    if (that.state.cur_send_addr === 'USDT') {
      t_balance = that.state.my_balance_USDT;
    } else if (that.state.cur_send_addr === 'USDx') {
      t_balance = that.state.my_balance_USDx;
    } else if (that.state.cur_send_addr === 'USDC') {
      t_balance = that.state.my_balance_USDC;
    } else if (that.state.cur_send_addr === 'TUSD') {
      t_balance = that.state.my_balance_TUSD;
    } else if (that.state.cur_send_addr === 'PAX') {
      t_balance = that.state.my_balance_PAX;
    } else if (that.state.cur_send_addr === 'DAI') {
      t_balance = that.state.my_balance_DAI;
    } else if (that.state.cur_send_addr === 'HBTC') {
      t_balance = that.state.my_balance_HBTC;
    } else if (that.state.cur_send_addr === 'imBTC') {
      t_balance = that.state.my_balance_imBTC;
    } else if (that.state.cur_send_addr === 'WBTC') {
      t_balance = that.state.my_balance_WBTC;
    } else if (that.state.cur_send_addr === 'HUSD') {
      t_balance = that.state.my_balance_HUSD;
    } else if (that.state.cur_send_addr === 'BUSD') {
      t_balance = that.state.my_balance_BUSD;
    }
    compare(that, t_balance, amount_bn.toString(), res_i_can_get, that.state.cur_liquidaty);
  })

  that.setState({
    side_A_amount: value,
    side_A_amount_real: amount_bn
  });

  if (amount_bn.toString() === '0') {
    that.setState({
      is_wap_enable: false
    });
    return false;
  }
}


export const handle_B_change = (value, that) => {
  if (value.length > 18) {
    return;
  }
  if (value === '') {
    // console.log('nullllllllll');
    that.setState({
      side_A_amount: '',
      is_wap_enable: false,
      side_B_amount: '',
      is_Insufficient_Balance: false,
      is_liquidity_limit: false
    });
    return;
  }

  that.setState({
    is_from_right_input: true
  });
  var t_obj_xswap = that.state.is_stable_coin_send ? that.state.XSwap_stable : that.state.XSwap_btc;

  var amount_bn;
  var temp_value = value;
  if (temp_value.indexOf('.') > 0) {
    var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
    if (sub_num > that.state.cur_recive_decimals) {
      that.setState({
        side_B_amount: value,
        is_wap_enable: false
      });
      return false;
    }
    temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(temp_value).mul(that.bn(10 ** (that.state.cur_recive_decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(value).mul(that.bn(10 ** that.state.cur_recive_decimals));
  }

  console.log(amount_bn.toString());

  t_obj_xswap.methods.getAmountByOutput(
    address_map[that.state.net_type][that.state.cur_send_addr],
    address_map[that.state.net_type][that.state.cur_recive_addr],
    amount_bn.toString()
  ).call().then(res_i_can_send => {
    console.log('i_can_ send token: ', res_i_can_send);
    that.setState({
      side_A_amount: format_bn(res_i_can_send, that.state.cur_send_decimals, 4)
    });

    console.log(that.state.cur_send_addr);
    var t_balance;
    if (that.state.cur_send_addr === 'USDT') {
      t_balance = that.state.my_balance_USDT;
    } else if (that.state.cur_send_addr === 'USDx') {
      t_balance = that.state.my_balance_USDx;
    } else if (that.state.cur_send_addr === 'USDC') {
      t_balance = that.state.my_balance_USDC;
    } else if (that.state.cur_send_addr === 'TUSD') {
      t_balance = that.state.my_balance_TUSD;
    } else if (that.state.cur_send_addr === 'PAX') {
      t_balance = that.state.my_balance_PAX;
    } else if (that.state.cur_send_addr === 'DAI') {
      t_balance = that.state.my_balance_DAI;
    } else if (that.state.cur_send_addr === 'HBTC') {
      t_balance = that.state.my_balance_HBTC;
    } else if (that.state.cur_send_addr === 'imBTC') {
      t_balance = that.state.my_balance_imBTC;
    } else if (that.state.cur_send_addr === 'WBTC') {
      t_balance = that.state.my_balance_WBTC;
    } else if (that.state.cur_send_addr === 'HUSD') {
      t_balance = that.state.my_balance_HUSD;
    } else if (that.state.cur_send_addr === 'BUSD') {
      t_balance = that.state.my_balance_BUSD;
    }

    compare_receive(that, res_i_can_send, t_balance, amount_bn.toString(), that.state.cur_liquidaty);
  })

  that.setState({
    side_B_amount: value,
    side_B_amount_real: amount_bn
  });

  if (amount_bn.toString() === '0') {
    that.setState({
      is_wap_enable: false
    });
    return false;
  }
}

const compare_receive = (that, i_can_send, my_balance, receive_balance, liquidity_amount) => {
  if (that.bn(i_can_send).gt(that.bn(my_balance))) {
    console.log('no such balance');
    that.setState({
      is_wap_enable: false,
      is_Insufficient_Balance: true,
      is_liquidity_limit: false
    });
  } else {
    console.log('u can swap');
    that.setState({
      is_wap_enable: true,
      is_Insufficient_Balance: false
    }, () => {
      if (that.bn(receive_balance).gt(that.bn(liquidity_amount))) {
        console.log('liquidity limit');
        that.setState({
          is_wap_enable: false,
          is_liquidity_limit: true
        });
      } else {
        console.log('u can swap');
        that.setState({
          is_wap_enable: true,
          is_liquidity_limit: false
        });
      }
    });
  }
}
const compare = (that, my_balance, input_balance, i_can_get, liquidity_amount) => {
  if (that.bn(input_balance).gt(that.bn(my_balance))) {
    console.log('no such balance');
    that.setState({
      is_wap_enable: false,
      is_Insufficient_Balance: true,
      is_liquidity_limit: false
    });
  } else {
    console.log('u can swap');
    that.setState({
      is_wap_enable: true,
      is_Insufficient_Balance: false
    }, () => {
      if (that.bn(i_can_get).gt(that.bn(liquidity_amount))) {
        console.log('liquidity limit');
        that.setState({
          is_wap_enable: false,
          is_liquidity_limit: true
        });
      } else {
        console.log('u can swap');
        that.setState({
          is_wap_enable: true,
          is_liquidity_limit: false
        });
      }
    });
  }
}