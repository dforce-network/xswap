


export const get_allowance = async (contractInstance, my_account, address_mMarket, bn) => {
  return new Promise((resolve) => {
    contractInstance.methods.allowance(my_account, address_mMarket).call((err, res_allowance) => {
      console.log('res_allowance: ', res_allowance);
      if (bn(res_allowance).gt(bn('0'))) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  })
}


export const get_tokens_decimals = (USDx, WETH, imBTC, USDT, that) => {
  USDx.methods.decimals().call().then(res_usdx_decimals => {
    console.log('usdx: ', res_usdx_decimals);
    that.setState({ USDx_decimals: Number(res_usdx_decimals) })
  })

  WETH.methods.decimals().call().then(res_weth_decimals => {
    console.log('weth: ', res_weth_decimals);
    that.setState({ WETH_decimals: Number(res_weth_decimals) })
  })

  imBTC.methods.decimals().call().then(res_imBTC_decimals => {
    console.log('imbtc: ', res_imBTC_decimals);
    that.setState({ imBTC_decimals: Number(res_imBTC_decimals) })
  })

  USDT.methods.decimals().call().then(res_usdt_decimals => {
    console.log('usdt: ', res_usdt_decimals);
    that.setState({ USDT_decimals: Number(res_usdt_decimals) })
  })
}

export const get_tokensTwo_decimals = (USDx, USDT, that) => {
  USDx.methods.decimals().call().then(res_usdx_decimals => {
    console.log('usdx: ', res_usdx_decimals);
    that.setState({ USDx_decimals: Number(res_usdx_decimals) })
  })

  USDT.methods.decimals().call().then(res_usdt_decimals => {
    console.log('usdt: ', res_usdt_decimals);
    that.setState({ USDT_decimals: Number(res_usdt_decimals) })
  })
}

export const get_my_balance = (tokenContract, account, that) => {
  tokenContract.methods.balanceOf(account).call((err, res_balance) => {
    if (res_balance) {
      that.setState({
        my_balance: res_balance
      }, () => {
        // console.log(that.state.my_balance)
        // console.log(typeof (res_balance))
      })
    }
  });
}


export const get_supplied__available_to_withdraw = (mContract, tokenContract, account, token_address, m_address, that) => {
  mContract.methods.getSupplyBalance(account, token_address).call((err, res_supplied) => {

    that.setState({ my_supplied: res_supplied }, () => {

      mContract.methods.calculateAccountValues(account).call((err, res_account_values) => {
        mContract.methods.assetPrices(token_address).call((err, res_price) => {
          tokenContract.methods.balanceOf(m_address).call((err, res_cash) => {

            var m_supply = that.bn(res_account_values[1]);
            if (that.bn(res_account_values[2]).gt(that.bn('0'))) {
              var m_borrow = that.bn(res_account_values[2]).mul(that.bn(that.collateral_rate)).add(that.bn(5 ** 17)).div(that.bn(10 ** 18));
              if (that.bn(res_account_values[1]).gt(m_borrow)) {
                m_supply = that.bn(res_account_values[1]).sub(m_borrow);
              }
            }
            // console.log('res_supplied: ', res_supplied)
            // console.log('res_account_values: ', res_account_values)
            // console.log('res_price: ', res_price)
            // console.log('res_cash: ', res_cash)
            var liquidity_bn = m_supply.div(that.bn(res_price));
            var SmallNum_bn = liquidity_bn.lt(that.bn(res_supplied)) ? liquidity_bn : that.bn(res_supplied);
            var SmallNum_est = SmallNum_bn.lt(that.bn(res_cash)) ? SmallNum_bn.toString() : res_cash;
            // console.log('SmallNum_est: ', SmallNum_est)
            // console.log('-------------------------------------------')

            that.setState({ available_to_withdraw: SmallNum_est })

          })
        })
      })
    })
  })
}


export const get_available_to_borrow = (mContract, tokenContract, m_address, token_address, account, collateral_rate, originationFee, that) => {
  // console.log('***** get_available_to_borrow ****');

  mContract.methods.calculateAccountValues(account).call((err, res_account_values) => {
    var max_borrow = that.bn(res_account_values[1]).mul(that.bn(10 ** 18)).div(that.bn(collateral_rate));
    var max_borrow_safe = max_borrow.mul(that.bn('8')).div(that.bn('10'));

    if (max_borrow.lte(that.bn(res_account_values[2]))) {
      that.setState({ available_to_borrow: 0, available_to_borrow_safe: 0 });
      return false;
    }

    mContract.methods.assetPrices(token_address).call((err, res_price) => {
      // console.log('res_cash: ', res_cash);
      // console.log('res_price: ', res_price);
      tokenContract.methods.balanceOf(m_address).call((err, res_cash) => {

        var t_liquidity = max_borrow.sub(that.bn(res_account_values[2]));
        var liquidity_bn = that.bn(t_liquidity).mul(that.bn('10').pow(that.bn('18'))).div(that.bn(res_price).mul(that.bn('10').pow(that.bn('18')).add(that.bn(originationFee))));
        var to_borrow_bn = liquidity_bn.lt(that.bn(res_cash)) ? liquidity_bn : that.bn(res_cash);

        if (max_borrow_safe.lte(that.bn(res_account_values[2]))) {
          that.setState({ available_to_borrow: to_borrow_bn.toString(), available_to_borrow_safe: 0 });
          return false;
        }
        var t_liquidity_safe = max_borrow_safe.sub(that.bn(res_account_values[2]));
        var liquidity_bn_safe = that.bn(t_liquidity_safe).mul(that.bn('10').pow(that.bn('18'))).div(that.bn(res_price).mul(that.bn('10').pow(that.bn('18')).add(that.bn(originationFee))));
        var to_borrow_bn_safe = liquidity_bn_safe.lt(that.bn(res_cash)) ? liquidity_bn_safe : that.bn(res_cash);

        // console.log('available_to_borrow: ', to_borrow_bn.toString());
        // console.log('available_to_borrow_safe: ', to_borrow_bn_safe.toString());
        that.setState({
          available_to_borrow: to_borrow_bn.toString(),
          available_to_borrow_safe: to_borrow_bn_safe.toString()
        });
      })
    })
  })
}



export const get_borrow_balance = (mContract, account, token_address, that) => {
  mContract.methods.getBorrowBalance(account, token_address).call((err, res_borrowed) => {
    if (res_borrowed) {
      that.setState({
        my_borrowed: res_borrowed
      }, () => {
        // console.log(that.state.my_borrowed)
      })
    }
  });
}


// ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 ***** ***** 分割线 ***** 


export const handle_supply_max = (that, balance, decimals) => {
  var to_show;
  if (balance.length <= decimals) {
    to_show = ('0.' + ('000000000000000000' + balance).substr(-decimals)).substring(0, 18);
  } else {
    to_show = (that.bn(balance).div(that.bn(10 ** decimals)) + '.' + balance.substr(-decimals)).substring(0, 18);
  }

  that.setState({
    supply_amount: to_show,
    i_will_supply_max: true
  });

  if (that.bn(balance).toString() === that.bn('0').toString()) {
    that.setState({ is_supply_enable: false });
  } else {
    that.setState({ is_supply_enable: true });
  }
}


export const handle_withdraw_max = (that, balance, decimals) => {
  var to_show;
  if (balance.length <= decimals) {
    to_show = ('0.' + ('000000000000000000' + balance).substr(-decimals)).substring(0, 18);
  } else {
    to_show = (that.bn(balance).div(that.bn(10 ** decimals)) + '.' + balance.substr(-decimals)).substring(0, 18);
  }

  that.setState({
    withdraw_amount: to_show,
    i_will_withdraw_max: true
  });

  if (that.bn(balance).toString() === that.bn('0').toString()) {
    that.setState({ is_withdraw_enable: false });
  } else {
    that.setState({ is_withdraw_enable: true });
  }
}


export const handle_supply_change = (value, that, decimals, balance) => {
  if (value.length > 18) {
    return;
  }

  that.setState({ i_will_supply_max: false });

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_supply_enable: true,
      supply_amount: null
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > decimals) {
        console.log(' --- decimals extent ---');
        that.setState({
          supply_amount: value,
          is_supply_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
    }

    console.log(amount_bn.toString());

    if (amount_bn.gt(that.bn(balance))) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        supply_amount: value,
        is_supply_enable: false,
        no_such_balance: true
      });
      return false;
    } else {
      that.setState({
        supply_amount: value,
        is_supply_enable: true,
        no_such_balance: false
      });
    }
  }

  that.setState({ supply_amount: value });

  if ((Number(value)) === 0) {
    that.setState({ is_supply_enable: false });
    return;
  } else {
    that.setState({ is_supply_enable: true });
  }
}


export const handle_withdraw_change = (value, that, decimals, balance) => {
  if (value.length > 18) {
    return;
  }

  that.setState({ i_will_withdraw_max: false });

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_withdraw_enable: true,
      withdraw_amount: null
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > decimals) {
        console.log(' --- decimals extent ---');
        that.setState({
          withdraw_amount: value,
          is_withdraw_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
    }

    console.log(amount_bn.toString());

    if (amount_bn.gt(that.bn(balance))) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        withdraw_amount: value,
        is_withdraw_enable: false,
        no_such_withdraw_balance: true
      });
      return false;
    } else {
      that.setState({
        withdraw_amount: value,
        is_withdraw_enable: true,
        no_such_withdraw_balance: false
      });
    }
  }

  that.setState({ withdraw_amount: value });

  if ((Number(value)) === 0) {
    that.setState({ is_withdraw_enable: false });
    return;
  } else {
    that.setState({ is_withdraw_enable: true });
  }
}


export const handle_approve = (tokenContract, that, m_address) => {
  if (that.state.isEnableing) {
    return false;
  }

  that.setState({ isEnableing: true });

  tokenContract.methods.approve(m_address, -1).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('handle_approve_gasLimit: ', gasLimit);
      console.log('handle_approve_gasPrice: ', gasPrice);

      tokenContract.methods.approve(m_address, -1).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          if (res_hash) {
            console.log(res_hash);
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'approve', '-1', res_hash, timestamp, 'pendding', that);
            let check_approve = setInterval(() => {
              that.new_web3.eth.getTransactionReceipt(res_hash, (res_fail, res_success) => {
                if (res_success) {
                  clearInterval(check_approve);
                  if (res_success.status === true) {
                    that.setState({ is_approved: true })
                  }
                }
                if (res_fail) {
                  console.log(res_fail);
                  clearInterval(check_approve);
                }
              })
            }, 2000)
          }
          if (reject) {
            that.setState({ isEnableing: false });
            console.log(reject)
          }
        }
      )
    })
  });
};


export const handle_supply_click = (that, decimals, token_address) => {
  if (!(that.state.is_supply_enable && that.state.supply_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_supply_enable: false });

  var amount_str = that.state.supply_amount;// '123.456'
  var amount_bn;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** decimals));
  }

  if (that.state.i_will_supply_max) {
    amount_bn = that.bn(that.state.my_balance)
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.mMarket.methods.supply(token_address, amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.mMarket.methods.supply(token_address, amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            that.setState({ is_supply_enable: true, supply_amount: null });
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'supply', amount_bn.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject)
            that.setState({ is_supply_enable: true });
          }
        }
      )
    })
  })
}


export const handle_withdraw_click = (that, decimals, token_address) => {
  if (!(that.state.is_withdraw_enable && that.state.withdraw_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_withdraw_enable: false });

  var amount_str = that.state.withdraw_amount;// '123.456'
  var amount_bn;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** decimals));
  }

  var amount_bn_to_history = amount_bn;

  if (that.state.i_will_withdraw_max) {
    amount_bn = that.bn('-1');
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.mMarket.methods.withdraw(token_address, amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.mMarket.methods.withdraw(token_address, amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            let timestamp = new Date().getTime();
            that.setState({ is_withdraw_enable: true, withdraw_amount: null });
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'withdraw', amount_bn_to_history.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject);
            that.setState({ is_withdraw_enable: true });
          }
        }
      )
    })
  })
}


export const handle_borrow_change = (value, that, decimals, balance) => {
  if (value.length > 18) {
    return;
  }

  that.setState({ i_will_borrow_max: false, borrow_exceed: false });

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_borrow_enable: true,
      borrow_amount: null,
      borrow_exceed: false,
      no_such_borrow_balance: false
    });
    return false;
  } else {
    var amount_bn, sub_num;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > decimals) {
        console.log(' --- decimals extent ---');
        that.setState({
          borrow_amount: value,
          is_borrow_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
    }

    console.log(amount_bn.toString());

    if (amount_bn.gt(that.bn(balance))) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        borrow_amount: value,
        is_borrow_enable: false,
        borrow_exceed: false,
        no_such_borrow_balance: true
      });
      return false;
    } else {
      that.setState({
        borrow_amount: value,
        is_borrow_enable: true,
        no_such_borrow_balance: false
      });
    }

    if (amount_bn.gt(that.bn(that.state.available_to_borrow_safe))) {
      that.setState({ borrow_exceed: true })
    } else {
      that.setState({ borrow_exceed: false })
    }

    if (amount_bn.gt(that.bn(that.state.available_to_borrow))) {
      that.setState({ borrow_exceed: false })
    }
  }

  that.setState({ borrow_amount: value, no_such_borrow_balance: false });

  if ((Number(value)) === 0) {
    that.setState({ is_borrow_enable: false, borrow_exceed: false });
    return;
  } else {
    that.setState({ is_borrow_enable: true });
  }
}


export const handle_repay_change = (value, that, decimals, balance) => {
  if (value.length > 18) {
    return;
  }

  that.setState({ i_will_repay_max: false });

  if (value === null || value === '') {
    console.log("value === null || value === ''")
    that.setState({
      is_repay_enable: true,
      repay_amount: null,
      no_such_repay_balance: false
    });
    return false;
  } else {
    var amount_bn;
    var temp_value = value;
    if (temp_value.indexOf('.') > 0) {
      var sub_num = temp_value.length - temp_value.indexOf('.') - 1;// 3
      if (sub_num > decimals) {
        console.log(' --- decimals extent ---');
        that.setState({
          repay_amount: value,
          is_repay_enable: false
        });
        return false;
      }
      temp_value = temp_value.substr(0, temp_value.indexOf('.')) + temp_value.substr(value.indexOf('.') + 1);// '123456'
      amount_bn = that.bn(temp_value).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
    } else {
      amount_bn = that.bn(value).mul(that.bn(10 ** decimals));
    }

    console.log(amount_bn.toString());

    if (amount_bn.gt(that.bn(balance)) || amount_bn.gt(that.bn(that.state.my_borrowed))) {
      console.log(' --- INSUFFICIENT BALANCE ---');
      that.setState({
        repay_amount: value,
        is_repay_enable: false
      });

      if (amount_bn.gt(that.bn(balance))) {
        that.setState({ no_such_repay_balance: true });
      }
      return false;
    }
  }

  that.setState({ repay_amount: value });

  if ((Number(value)) === 0 || Number(that.state.my_borrowed) === 0) {
    that.setState({ is_repay_enable: false });
    return;
  } else {
    that.setState({ is_repay_enable: true });
  }
}


export const handle_borrow_click = (that, decimals, token_address) => {
  if (!(that.state.is_borrow_enable && that.state.borrow_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_borrow_enable: false });

  var amount_str = that.state.borrow_amount;// '123.456'
  var amount_bn;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn = that.bn(amount_str).mul(that.bn(10 ** decimals));
  }

  if (that.state.i_will_borrow_max) {
    amount_bn = that.bn(that.state.available_to_borrow_safe)
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.mMarket.methods.borrow(token_address, amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.mMarket.methods.borrow(token_address, amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            that.setState({ is_borrow_enable: true, borrow_amount: null, borrow_exceed: false });
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'borrow', amount_bn.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject)
            that.setState({ is_borrow_enable: true });
          }
        }
      )
    })
  })
}


export const handle_repay_click = (that, decimals, token_address) => {
  if (!(that.state.is_repay_enable && that.state.repay_amount)) {
    console.log('i return you...');
    return false;
  }

  that.setState({ is_repay_enable: false });

  var amount_str = that.state.repay_amount;// '123.456'
  var amount_bn;
  var amount_bn_to_history;

  if (amount_str.indexOf('.') > 0) {
    var sub_num = amount_str.length - amount_str.indexOf('.') - 1;// 3
    amount_str = amount_str.substr(0, amount_str.indexOf('.')) + amount_str.substr(amount_str.indexOf('.') + 1);// '123456'
    amount_bn_to_history = amount_bn = that.bn(amount_str).mul(that.bn(10 ** (decimals - sub_num)));// bn_'123456'
  } else {
    amount_bn_to_history = amount_bn = that.bn(amount_str).mul(that.bn(10 ** decimals));
  }

  if (that.state.i_will_repay_max) {
    // if (that.bn(that.state.my_balance).gt(that.bn(that.state.my_borrowed))) {
    //   amount_bn = that.bn('-1');
    //   amount_bn_to_history = that.bn(that.state.my_borrowed);
    // } else {
    //   amount_bn_to_history = amount_bn = that.bn(that.state.my_balance);
    // }
    amount_bn = that.bn('-1');
    amount_bn_to_history = that.bn(that.state.my_borrowed);
  }

  console.log('amount_bn: ', amount_bn);
  console.log('amount_bn string: ', amount_bn.toString());

  that.state.mMarket.methods.repayBorrow(token_address, amount_bn.toString()).estimateGas({ from: that.state.my_account }, (err, gasLimit) => {
    that.new_web3.eth.getGasPrice((err, gasPrice) => {
      console.log('supply_gasLimit: ', gasLimit);
      console.log('supply_gasPrice: ', gasPrice);

      that.state.mMarket.methods.repayBorrow(token_address, amount_bn.toString()).send(
        {
          from: that.state.my_account,
          gas: Math.ceil(gasLimit * that.gas_limit_coefficient),
          gasPrice: gasPrice
        }, (reject, res_hash) => {
          // 成功后返回哈希
          if (res_hash) {
            console.log(res_hash);
            that.setState({ is_repay_enable: true, repay_amount: null });
            let timestamp = new Date().getTime();
            i_got_hash(that.state.my_account, that.state.net_type, that.token_name, 'repay', amount_bn_to_history.toString(), res_hash, timestamp, 'pendding', that);
          }
          // 点击取消
          if (reject) {
            console.log(reject)
            that.setState({ is_repay_enable: true });
          }
        }
      )
    })
  })
}


export const handle_borrow_max = (that, balance, decimals) => {
  var to_show;
  balance = balance.toString();
  if (balance.length <= decimals) {
    to_show = ('0.' + ('000000000000000000' + balance).substr(-decimals)).substring(0, 18);
  } else {
    to_show = (that.bn(balance).div(that.bn(10 ** decimals)) + '.' + balance.substr(-decimals)).substring(0, 18);
  }

  that.setState({
    borrow_amount: to_show,
    i_will_borrow_max: true,
    borrow_exceed: false
  });

  if (that.bn(balance).toString() === that.bn('0').toString()) {
    that.setState({ is_borrow_enable: false });
  } else {
    that.setState({ is_borrow_enable: true });
  }
}


export const handle_repay_max = (that, balance, borrowed, decimals) => {
  var to_show;

  // if (that.bn(balance).gt(that.bn(borrowed))) {
  //   if (borrowed.length <= decimals) {
  //     to_show = ('0.' + ('000000000000000000' + borrowed).substr(-decimals)).substring(0, 18);
  //   } else {
  //     to_show = (that.bn(borrowed).div(that.bn(10 ** decimals)) + '.' + borrowed.substr(-decimals)).substring(0, 18);
  //   }
  // } else {
  //   if (balance.length <= decimals) {
  //     to_show = ('0.' + ('000000000000000000' + balance).substr(-decimals)).substring(0, 18);
  //   } else {
  //     to_show = (that.bn(balance).div(that.bn(10 ** decimals)) + '.' + balance.substr(-decimals)).substring(0, 18);
  //   }
  // }

  if (borrowed.length <= decimals) {
    to_show = ('0.' + ('000000000000000000' + borrowed).substr(-decimals)).substring(0, 18);
  } else {
    to_show = (that.bn(borrowed).div(that.bn(10 ** decimals)) + '.' + borrowed.substr(-decimals)).substring(0, 18);
  }

  that.setState({
    repay_amount: to_show,
    i_will_repay_max: true
  });

  if (that.bn(balance).toString() === that.bn('0').toString() || that.bn(borrowed).toString() === that.bn('0').toString() || that.bn(balance).lt(that.bn(borrowed))) {
    that.setState({ is_repay_enable: false });
  } else {
    that.setState({ is_repay_enable: true });
  }
}


// ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 ***** ***** 分割线 ***** 


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


export const i_got_hash = (account, net_type, token, action, amount, hash, timestamp, status, that) => {
  if (window.localStorage) {
    let key = account + '-' + net_type;
    let contractData = JSON.parse(window.localStorage.getItem(key)) || [];
    contractData.push({
      account: account,
      net_type: net_type,
      token: token,
      action: action,
      amount: amount,
      hash: hash,
      timestamp: timestamp,
      status: status
    });
    window.localStorage.setItem(key, JSON.stringify(contractData));
    console.log('got hash && setItem.');

    that.setState({ load_new_history: Math.random() });
  }
}



export const format_str_to_kmb = (str_num) => {
  var t_num = Number(str_num);
  var out_a, out_b, t_index;


  if (t_num >= 1E9) {
    out_a = Math.floor(t_num / 1E9);
    if ((t_num % 1E9 / 1E9).toString().indexOf('.') > 0) {
      t_index = (t_num % 1E9 / 1E9).toString().indexOf('.') + 1;
      out_b = (t_num % 1E9 / 1E9).toString().substr(t_index, 2);
    } else {
      out_b = '00';
    }
    return out_a + '.' + out_b + 'G';
  }


  if (t_num >= 1E6) {
    out_a = Math.floor(t_num / 1E6);
    if ((t_num % 1E6 / 1E6).toString().indexOf('.') > 0) {
      t_index = (t_num % 1E6 / 1E6).toString().indexOf('.') + 1;
      out_b = (t_num % 1E6 / 1E6).toString().substr(t_index, 2);
    } else {
      out_b = '00';
    }
    return out_a + '.' + out_b + 'M';
  }


  if (t_num >= 1E3) {
    out_a = Math.floor(t_num / 1E3);
    if ((t_num % 1E3 / 1E3).toString().indexOf('.') > 0) {
      t_index = (t_num % 1E3 / 1E3).toString().indexOf('.') + 1;
      out_b = (t_num % 1E3 / 1E3).toString().substr(t_index, 2);
    } else {
      out_b = '00';
    }
    return out_a + '.' + out_b + 'K';
  }

  return str_num;

}




export const getTxnHashHref = (networkId) => {
  let txnHashHref;
  switch (networkId) {
    case "1":
      txnHashHref = "https://etherscan.io/tx/";
      break;
    case "2"://Morden(不再使用的网络)
      txnHashHref = "https://etherscan.io/tx/";
      break;
    case "3":
      txnHashHref = "https://ropsten.etherscan.io/tx/";
      break;
    case "4":
      txnHashHref = "https://rinkeby.etherscan.io/tx/";
      break;
    case "42":
      txnHashHref = "https://kovan.etherscan.io/tx/";
      break;
    default:
      txnHashHref = "";
  }
  return txnHashHref;
}

export const findNetwork = (networkId) => {
  let networkName;
  switch (networkId) {
    case "1":
      networkName = "Main";
      break;
    case "2":
      networkName = "Morden";
      break;
    case "3":
      networkName = "Ropsten";
      break;
    case "4":
      networkName = "Rinkeby";
      break;
    case "42":
      networkName = "Kovan";
      break;
    default:
      networkName = "Unknown";
  }
  return networkName;
}



// export const get_allowance = async (web) => {
//   return new Promise(resolve => {
//     web.givenProvider.enable().then(res_accounts => {
//       setTimeout(() => { resolve(res_accounts) }, 15000)

//     })
//   })
//   await web.givenProvider.enable().then(res_accounts => {
//     console.log(res_accounts);
//     return res_accounts;
//   })
// }

// ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 *****  ***** 分割线 ***** ***** 分割线 ***** 


export const format_num_to_K = (str_num) => {
  var part_a = str_num.split('.')[0];
  var part_b = str_num.split('.')[1];

  var reg = /\d{1,3}(?=(\d{3})+$)/g;
  part_a = (part_a + '').replace(reg, '$&,');

  return part_a + '.' + part_b;
}
