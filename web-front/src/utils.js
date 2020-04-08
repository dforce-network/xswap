
let address_map = require('./abi/address_map.json');


export const handle_approve_click = (that, XSwap_addr) => {
  that.state.cur_send_contract.methods.approve(XSwap_addr, -1).send(
    {
      from: that.state.my_account,
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


export const swap_click = (that, input_addr, output_addr) => {
  if (!that.state.is_wap_enable) {
    console.log('i return u');
    return false;
  }

  that.state.cur_send_contract.methods.allowance(that.state.my_account, address_map[that.state.net_type]['XSwap']).call((err, res_allowance) => {
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.state.XSwap.methods.trade(input_addr, output_addr, that.state.side_A_amount_real.toString())
        .send({ from: that.state.my_account, }, (reject, res_hash) => {
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
          }
          if (reject) {
            console.log(reject);
          }
        })
    } else {
      that.state.cur_send_contract.methods.approve(address_map[that.state.net_type]['XSwap'], -1).send(
        {
          from: that.state.my_account,
        }, (reject, res_hash) => {
          if (res_hash) {
            console.log(res_hash);
            that.state.XSwap.methods.trade(input_addr, output_addr, that.state.side_A_amount_real.toString())
              .send({ from: that.state.my_account, }, (reject, res_hash) => {
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
                }
                if (reject) {
                  console.log(reject);
                }
              })
          }
          if (reject) {
            console.log(reject);
          }
        }
      )
    }
  });
}

export const get_exchange__get_fee = (that, input_addr, output_addr) => {
  that.state.XSwap.methods.prices(input_addr, output_addr).call().then(res_exchange_price => {
    console.log(res_exchange_price);
    that.setState({
      cur_exchange: res_exchange_price
    });
  })
  that.state.XSwap.methods.fee(input_addr, output_addr).call().then(res_exchange_fee => {
    console.log(res_exchange_fee);
    that.setState({
      cur_fee: res_exchange_fee
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

  that.state.XSwap.methods.prices(input_addr, output_addr).call().then(res_exchange_price => {
    console.log(res_exchange_price);
    that.setState({
      cur_exchange: res_exchange_price
    })
  })

  that.state.XSwap.methods.fee(input_addr, output_addr).call().then(res_exchange_fee => {
    console.log(res_exchange_fee);
    that.setState({
      cur_fee: res_exchange_fee
    })
  })
}


export const get_allowance = (that, address_XSwap) => {
  that.state.USDx.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    // console.log('res_allowance: ', res_allowance);
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({ is_approved_USDx: true });
    } else {
      that.setState({ is_approved_USDx: false });
    }
  });

  that.state.imBTC.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    // console.log('res_allowance: ', res_allowance);
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({ is_approved_imBTC: true });
    } else {
      that.setState({ is_approved_imBTC: false });
    }
  });

  that.state.USDT.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    // console.log('res_allowance: ', res_allowance);
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({ is_approved_USDT: true });
    } else {
      that.setState({ is_approved_USDT: false });
    }
  });

  that.state.HBTC.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    // console.log('res_allowance: ', res_allowance);
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({ is_approved_HBTC: true });
    } else {
      that.setState({ is_approved_HBTC: false });
    }
  });

  that.state.USDC.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    // console.log('res_allowance: ', res_allowance);
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({ is_approved_USDC: true });
    } else {
      that.setState({ is_approved_USDC: false });
    }
  });

  that.state.PAX.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    // console.log('res_allowance: ', res_allowance);
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({ is_approved_PAX: true });
    } else {
      that.setState({ is_approved_PAX: false });
    }
  });

  that.state.TUSD.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    // console.log('res_allowance: ', res_allowance);
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({ is_approved_TUSD: true });
    } else {
      that.setState({ is_approved_TUSD: false });
    }
  });

  that.state.DAI.methods.allowance(that.state.my_account, address_XSwap).call((err, res_allowance) => {
    // console.log('res_allowance: ', res_allowance);
    if (that.bn(res_allowance).gt(that.bn('0'))) {
      that.setState({ is_approved_DAI: true });
    } else {
      that.setState({ is_approved_DAI: false });
    }
  });
}


export const get_my_balance = (that) => {
  that.state.USDx.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance_USDx: res_balance
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

  that.state.USDT.methods.balanceOf(that.state.my_account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance_USDT: res_balance
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
}


export const handle_A_max = (that) => {
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
  }

  console.log(t_balance);

  var to_show_recive = that.bn(t_balance).sub(that.bn(t_balance).mul(that.bn(that.state.cur_fee)).div(that.bn(10 ** 18)))
    .mul(that.bn(that.state.cur_exchange)).div(that.bn(10 ** 18));
  to_show_recive = format_bn(to_show_recive, that.state.cur_send_decimals, 4);

  that.setState({
    is_wap_enable: true,
    side_A_amount: format_bn(t_balance, that.state.cur_send_decimals, that.state.cur_send_decimals),
    side_A_amount_real: that.bn(t_balance),
    side_B_amount: to_show_recive,
    is_Insufficient_Balance: false
  });
}


export const handle_A_change = (value, that) => {
  if (value.length > 18) {
    return;
  }

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

  var to_show_recive = amount_bn.sub(amount_bn.mul(that.bn(that.state.cur_fee)).div(that.bn(10 ** 18)))
    .mul(that.bn(that.state.cur_exchange)).div(that.bn(10 ** 18));
  to_show_recive = format_bn(to_show_recive, that.state.cur_send_decimals, 4);

  console.log(to_show_recive);

  that.setState({
    side_A_amount: value,
    side_A_amount_real: amount_bn,
    side_B_amount: to_show_recive
  });

  if (amount_bn.toString() === '0') {
    that.setState({
      is_wap_enable: false
    });
    return false;
  }

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
  }

  // console.log(t_balance);
  compare(that, t_balance, amount_bn.toString());
}

const compare = (that, my_balance, input_balance) => {
  if (that.bn(input_balance).gt(that.bn(my_balance))) {
    console.log('no such balance');
    that.setState({
      is_wap_enable: false,
      is_Insufficient_Balance: true
    });
  } else {
    console.log('u can swap');
    that.setState({
      is_wap_enable: true,
      is_Insufficient_Balance: false
    });
  }
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