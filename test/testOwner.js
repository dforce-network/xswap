'use strict'
const BN = require('bn.js');
const XSwap = artifacts.require('XSwap')
const PriceOracle = artifacts.require('PriceOracle')
const DSToken = artifacts.require("DSToken")
const DToken = artifacts.require("DToken")
const Handler = artifacts.require("Handler")
const Dispatcher = artifacts.require("Dispatcher")

function toStringDecimals(numStr, decimals, decimalPlace = decimals) {
    numStr = numStr.toLocaleString().replace(/,/g, '');
    decimals = decimals.toString();

    var str = Number(`1e+${decimals}`).toLocaleString().replace(/,/g, '').slice(1);

    var res = (numStr.length > decimals ?
        numStr.slice(0, numStr.length - decimals) + '.' + numStr.slice(numStr.length - decimals) :
        '0.' + str.slice(0, str.length - numStr.length) + numStr).replace(/(0+)$/g, "");

    // res = res.slice(-1) == '.' ? res + '00' : res;

    if (decimalPlace == 0)
        return res.slice(0, res.indexOf('.'));

    var length = res.indexOf('.') + 1 + decimalPlace;
    res = res.slice(0, length >= res.length ? res.length : length).replace(/(0+)$/g, "");
    return res.slice(-1) == '.' ? res + '00' : res;
}

contract('test', function(accounts) {
    const owner = accounts[0]
    const admin = accounts[1]
    const user1 = accounts[2]

    let tx, userBalance
    let xSwap, priceOracle 
    let usdx, usdt, usdc, pax, dai, tusd, test, busd, husd
    let dusdx, dusdt, dusdc, dpax, ddai, dtusd, dbusd, dhusd
    let dusdxHandler, dusdtHandler, dusdcHandler, dpaxHandler, ddaiHandler, dtusdHandler, dbusdHandler, dhusdHandler
    let dusdxDispatcher, dusdtDispatcher, dusdcDispatcher, dpaxDispatcher, ddaiDispatcher, dtusdDispatcher, dbusdDispatcher, dhusdDispatcher

    const d18 = function (amount) {
        amount = new BN(amount)
        return web3.utils.toWei(amount, "ether")
    }

    const d8 = function (amount) {
        amount = new BN(amount)
        return amount.mul(new BN('10').pow(new BN('8'))).toLocaleString().replace(/,/g, '');
    }

    const d6 = function (amount) {
        amount = new BN(amount)
        return web3.utils.toWei(amount, "mwei")
    }

    const f18 = function (amount) {
        amount = new BN(amount)
        return web3.utils.fromWei(amount, "ether")
    }

    const f8 = function (amount) {
        amount = new BN(amount)
        return toStringDecimals(amount, 8)
    }

    const f6 = function (amount) {
        amount = new BN(amount)
        return web3.utils.fromWei(amount, "mwei")
    }

    let renewContract = async function () {
        usdc = await DSToken.new("0x444600000000000000000000000000", 6)
        usdx = await DSToken.new("0x444600000000000000000000000000", 18)
        tusd = await DSToken.new("0x444600000000000000000000000000", 18)

        pax = await DSToken.new("0x444600000000000000000000000000", 18)
        busd = await DSToken.new("0x444600000000000000000000000000", 18)
        husd = await DSToken.new("0x444600000000000000000000000000", 8)
        
        usdt = await DSToken.new("0x444600000000000000000000000000", 6)
        
        dai = await DSToken.new("0x444600000000000000000000000000", 18)
        
        test = await DSToken.new("0x746573740000000000000000000000", 18)
        priceOracle = await PriceOracle.new(accounts[0])
        xSwap = await XSwap.new()
        tx = await xSwap.active(priceOracle.address)

        dusdc = await DToken.new('dusdc', 'dusdc', 18, usdc.address, test.address, web3.utils.toWei(new BN('0'), "finney"))
        dusdx = await DToken.new('dusdx', 'dusdx', 18, usdx.address, test.address, web3.utils.toWei(new BN('0'), "finney"))
        dtusd = await DToken.new('dtusd', 'dtusd', 18, tusd.address, test.address, web3.utils.toWei(new BN('0'), "finney"))

        dpax = await DToken.new('dpax', 'dpax', 18, pax.address, test.address, web3.utils.toWei(new BN('0'), "finney"))
        dbusd = await DToken.new('dbusd', 'dbusd', 18, busd.address, test.address, web3.utils.toWei(new BN('0'), "finney"))
        dhusd = await DToken.new('dhusd', 'dhusd', 18, husd.address, test.address, web3.utils.toWei(new BN('0'), "finney"))
        
        dusdt = await DToken.new('dusdt', 'dusdt', 18, usdt.address, test.address, web3.utils.toWei(new BN('0'), "finney"))
        
        ddai = await DToken.new('ddai', 'ddai', 18, dai.address, test.address, web3.utils.toWei(new BN('0'), "finney"))

        dusdcHandler = await Handler.new(dusdc.address, web3.utils.toWei(new BN('50'), "finney"))
        dusdxHandler = await Handler.new(dusdx.address, web3.utils.toWei(new BN('50'), "finney"))
        dtusdHandler = await Handler.new(dtusd.address, web3.utils.toWei(new BN('50'), "finney"))

        dpaxHandler = await Handler.new(dpax.address, web3.utils.toWei(new BN('50'), "finney"))
        dbusdHandler = await Handler.new(dbusd.address, web3.utils.toWei(new BN('50'), "finney"))
        dhusdHandler = await Handler.new(dhusd.address, web3.utils.toWei(new BN('50'), "finney"))
        
        dusdtHandler = await Handler.new(dusdt.address, web3.utils.toWei(new BN('50'), "finney"))
        
        ddaiHandler = await Handler.new(ddai.address, web3.utils.toWei(new BN('50'), "finney"))

        dusdcDispatcher = await Dispatcher.new([dusdcHandler.address], [1000])
        dusdxDispatcher = await Dispatcher.new([dusdxHandler.address], [1000])
        dtusdDispatcher = await Dispatcher.new([dtusdHandler.address], [1000])

        dpaxDispatcher = await Dispatcher.new([dpaxHandler.address], [1000])
        dbusdDispatcher = await Dispatcher.new([dbusdHandler.address], [1000])
        dhusdDispatcher = await Dispatcher.new([dhusdHandler.address], [1000])
        
        dusdtDispatcher = await Dispatcher.new([dusdtHandler.address], [1000])
        
        ddaiDispatcher = await Dispatcher.new([ddaiHandler.address], [1000])

        tx = await dusdc.setManager(owner)
        tx = await dusdx.setManager(owner)
        tx = await dtusd.setManager(owner)

        tx = await dpax.setManager(owner)
        tx = await dbusd.setManager(owner)
        tx = await dhusd.setManager(owner)
        
        tx = await dusdt.setManager(owner)
        
        tx = await ddai.setManager(owner)


        tx = await dusdc.updateDispatcher(dusdcDispatcher.address)
        tx = await dusdx.updateDispatcher(dusdxDispatcher.address)
        tx = await dtusd.updateDispatcher(dtusdDispatcher.address)

        tx = await dpax.updateDispatcher(dpaxDispatcher.address)
        tx = await dbusd.updateDispatcher(dbusdDispatcher.address)
        tx = await dhusd.updateDispatcher(dhusdDispatcher.address)
        
        tx = await dusdt.updateDispatcher(dusdtDispatcher.address)
        
        tx = await ddai.updateDispatcher(ddaiDispatcher.address)


        tx = await dusdcHandler.approve(usdc.address)
        tx = await dusdxHandler.approve(usdx.address)
        tx = await dtusdHandler.approve(tusd.address)

        tx = await dpaxHandler.approve(pax.address)
        tx = await dbusdHandler.approve(busd.address)
        tx = await dhusdHandler.approve(husd.address)
        
        tx = await dusdtHandler.approve(usdt.address)
        
        tx = await ddaiHandler.approve(dai.address)

        // tx = await xSwap.setTokenDecimals(usdx.address, 18);
        // tx = await xSwap.setTokenDecimals(usdt.address, 6);
        // tx = await xSwap.setTokenDecimals(pax.address, 18);
        // tx = await xSwap.setTokenDecimals(usdc.address, 6);
        // tx = await xSwap.setTokenDecimals(dai.address, 18);
        // tx = await xSwap.setTokenDecimals(tusd.address, 18);
    }

    it("test", async function () {
        await renewContract()

        const showLiquidation = async function (note) {
            console.log("-------------------------------------------")
            console.log(note)
            console.log("usdc liquadation: ", f6(await xSwap.getLiquidity(usdc.address)))
            console.log("usdx liquadation: ", f18(await xSwap.getLiquidity(usdx.address)))
            console.log("tusd liquadation: ", f18(await xSwap.getLiquidity(tusd.address)))
            console.log("pax  liquadation: ", f18(await xSwap.getLiquidity(pax.address)))
            console.log("busd  liquadation: ", f18(await xSwap.getLiquidity(busd.address)))
            console.log("husd  liquadation: ", f8(await xSwap.getLiquidity(husd.address)))
            console.log("usdt liquadation: ", f6(await xSwap.getLiquidity(usdt.address)))
            console.log("dai  liquadation: ", f18(await xSwap.getLiquidity(dai.address)))
        }

        const showSupportDToken = async function () {
            console.log("-------------------------------------------")
            console.log("usdc supportDToken: ", await xSwap.supportDToken(usdc.address))
            console.log("usdx supportDToken: ", await xSwap.supportDToken(usdx.address))
            console.log("tusd supportDToken: ", await xSwap.supportDToken(tusd.address))
            console.log("pax  supportDToken: ", await xSwap.supportDToken(pax.address))
            console.log("busd  supportDToken: ", await xSwap.supportDToken(busd.address))
            console.log("husd  supportDToken: ", await xSwap.supportDToken(husd.address))
            console.log("usdt supportDToken: ", await xSwap.supportDToken(usdt.address))
            console.log("dai  supportDToken: ", await xSwap.supportDToken(dai.address))
        }

        const showFreeDToken = async function () {
            console.log("-------------------------------------------")
            console.log("usdc freeDToken: ", await xSwap.freeDToken(usdc.address))
            console.log("usdx freeDToken: ", await xSwap.freeDToken(usdx.address))
            console.log("tusd freeDToken: ", await xSwap.freeDToken(tusd.address))
            console.log("pax  freeDToken: ", await xSwap.freeDToken(pax.address))
            console.log("busd  freeDToken: ", await xSwap.freeDToken(busd.address))
            console.log("husd  freeDToken: ", await xSwap.freeDToken(husd.address))
            console.log("usdt freeDToken: ", await xSwap.freeDToken(usdt.address))
            console.log("dai  freeDToken: ", await xSwap.freeDToken(dai.address))
        }

        const showABLiquidation = async function (note) {
            console.log("-------------------------------------------")
            console.log(note)
            console.log("usdx liquadation: ", f18(await xSwap.getLiquidity(usdx.address)))
            console.log("usdc liquadation: ", f6(await xSwap.getLiquidity(usdc.address)))
        }

        const showContractBalance = async function () {
            console.log("-------------------------------------------")
            console.log("usdc contract balance: ", f6(await usdc.balanceOf(xSwap.address)))
            console.log("usdx contract balance: ", f18(await usdx.balanceOf(xSwap.address)))
            console.log("tusd contract balance: ", f18(await tusd.balanceOf(xSwap.address)))
            console.log("pax  contract balance: ", f18(await pax.balanceOf(xSwap.address)))
            console.log("busd  contract balance: ", f18(await busd.balanceOf(xSwap.address)))
            console.log("husd  contract balance: ", f8(await husd.balanceOf(xSwap.address)))
            console.log("usdt contract balance: ", f6(await usdt.balanceOf(xSwap.address)))
            console.log("dai  contract balance: ", f18(await dai.balanceOf(xSwap.address)))
        }

        const showHandlerLiquidity = async function () {
            console.log("-------------------------------------------")
            console.log("usdc Handler Liquidity: ", f6(await usdc.balanceOf(dusdcHandler.address)))
            console.log("usdx Handler Liquidity: ", f18(await usdx.balanceOf(dusdxHandler.address)))
            console.log("tusd Handler Liquidity: ", f18(await tusd.balanceOf(dtusdHandler.address)))
            console.log("pax  Handler Liquidity: ", f18(await pax.balanceOf(dpaxHandler.address)))
            console.log("busd  Handler Liquidity: ", f18(await busd.balanceOf(dbusdHandler.address)))
            console.log("husd  Handler Liquidity: ", f8(await husd.balanceOf(dhusdHandler.address)))
            console.log("usdt Handler Liquidity: ", f6(await usdt.balanceOf(dusdtHandler.address)))
            console.log("dai  Handler Liquidity: ", f18(await dai.balanceOf(ddaiHandler.address)))
        }

        const showHandlerBalance = async function () {
            console.log("-------------------------------------------")
            console.log("usdc Handler balance: ", f6(await dusdcHandler.getBalance(usdc.address)))
            console.log("usdx Handler balance: ", f18(await dusdxHandler.getBalance(usdx.address)))
            console.log("tusd Handler balance: ", f18(await dtusdHandler.getBalance(tusd.address)))
            console.log("pax  Handler balance: ", f18(await dpaxHandler.getBalance(pax.address)))
            console.log("busd  Handler balance: ", f18(await dbusdHandler.getBalance(busd.address)))
            console.log("husd  Handler balance: ", f8(await dhusdHandler.getBalance(husd.address)))
            console.log("usdt Handler balance: ", f6(await dusdtHandler.getBalance(usdt.address)))
            console.log("dai  Handler balance: ", f18(await ddaiHandler.getBalance(dai.address)))
            console.log("===========================================\n")
        }

        const showABContractBalance = async function () {            
            console.log("usdx contract balance: ", f18(await usdx.balanceOf(xSwap.address)))
            console.log("usdc contract balance: ", f6(await usdc.balanceOf(xSwap.address)))
        }

        const userDiff = async function (token, initBalance) {
            let currentBalance =  await token.balanceOf(user1);
            let diff = currentBalance.sub(initBalance);
            if(token == usdt || token == usdc) {
                console.log("user initBalance: ", f6(initBalance))
                console.log("user currentBalance: ", f6(currentBalance))
                console.log("user get: ", f6(diff))
            } else if (token == busd) {
                console.log("user initBalance: ", f8(initBalance))
                console.log("user currentBalance: ", f8(currentBalance))
                console.log("user get: ", f8(diff))
            } else {
                console.log("user initBalance: ", f18(initBalance))
                console.log("user currentBalance: ", f18(currentBalance))
                console.log("user get: ", f18(diff))
            }
        }

        tx = await xSwap.enableToken(usdc.address)
        tx = await xSwap.enableToken(usdx.address)
        tx = await xSwap.enableToken(tusd.address)

        tx = await xSwap.enableToken(pax.address)
        tx = await xSwap.enableToken(busd.address)
        tx = await xSwap.enableToken(husd.address)

        tx = await xSwap.enableToken(usdt.address)
        tx = await xSwap.enableToken(dai.address)

        // tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        // tx = await priceOracle.setReaders(usdc.address, usdx.address)
        // tx = await priceOracle.setReaders(pax.address, usdx.address)
        // tx = await priceOracle.setReaders(tusd.address, usdx.address)
        // tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        // tx = await priceOracle.setPrice(usdt.address, "1000000000000000000000000000000")
        // tx = await priceOracle.setPrice(dai.address, "1000000000000000000")

        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setReaders(usdx.address, usdc.address)
        tx = await priceOracle.setReaders(tusd.address, usdc.address)

        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        tx = await priceOracle.setReaders(busd.address, pax.address)
        tx = await priceOracle.setReaders(husd.address, pax.address)

        tx = await priceOracle.setPrice(usdt.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(dai.address, "1000000000000000000")

        // tx = await xSwap.setFee(usdc.address, usdx.address,"1000000000000000")
        // tx = await xSwap.setFee(usdc.address, tusd.address,"1000000000000000")
        // tx = await xSwap.setFee(usdc.address, pax.address,"1000000000000000")
        // tx = await xSwap.setFee(usdc.address, busd.address,"1000000000000000")
        // tx = await xSwap.setFee(usdc.address, husd.address,"1000000000000000")
        // tx = await xSwap.setFee(usdc.address, usdt.address,"1000000000000000")
        // tx = await xSwap.setFee(usdc.address, dai.address,"1000000000000000")

        // tx = await xSwap.setFee(usdx.address, tusd.address,"1000000000000000")
        // tx = await xSwap.setFee(usdx.address, pax.address,"1000000000000000")
        // tx = await xSwap.setFee(usdx.address, busd.address,"1000000000000000")
        // tx = await xSwap.setFee(usdx.address, husd.address,"1000000000000000")
        // tx = await xSwap.setFee(usdx.address, usdt.address,"1000000000000000")
        // tx = await xSwap.setFee(usdx.address, dai.address,"1000000000000000")
        
        // tx = await xSwap.setFee(tusd.address, pax.address,"1000000000000000")
        // tx = await xSwap.setFee(tusd.address, busd.address,"1000000000000000")
        // tx = await xSwap.setFee(tusd.address, husd.address,"1000000000000000")
        // tx = await xSwap.setFee(tusd.address, usdt.address,"1000000000000000")
        // tx = await xSwap.setFee(tusd.address, dai.address,"1000000000000000")

        // tx = await xSwap.setFee(pax.address, busd.address,"1000000000000000")
        // tx = await xSwap.setFee(pax.address, husd.address,"1000000000000000")
        // tx = await xSwap.setFee(pax.address, usdt.address,"1000000000000000")
        // tx = await xSwap.setFee(pax.address, dai.address,"1000000000000000")

        // tx = await xSwap.setFee(busd.address, husd.address,"1000000000000000")
        // tx = await xSwap.setFee(busd.address, usdt.address,"1000000000000000")
        // tx = await xSwap.setFee(busd.address, dai.address,"1000000000000000")

        // tx = await xSwap.setFee(husd.address, usdt.address,"1000000000000000")
        // tx = await xSwap.setFee(husd.address, dai.address,"1000000000000000")

        // tx = await xSwap.setFee(usdt.address, dai.address,"1000000000000000")


        // minting token 
        tx = await usdc.mint(owner, d6(10000000))
        tx = await usdx.mint(owner, d18(10000000))
        tx = await tusd.mint(owner, d18(10000000))
        tx = await pax.mint(owner, d18(10000000))
        tx = await busd.mint(owner, d18(10000000))
        tx = await husd.mint(owner, d8(10000000))
        tx = await usdt.mint(owner, d6(10000000))
        tx = await dai.mint(owner, d18(10000000))

        // approvex
        tx = await usdc.approvex(xSwap.address, {from: owner})
        tx = await usdx.approvex(xSwap.address, {from: owner})
        tx = await tusd.approvex(xSwap.address, {from: owner})
        tx = await pax.approvex(xSwap.address, {from: owner})
        tx = await busd.approvex(xSwap.address, {from: owner})
        tx = await husd.approvex(xSwap.address, {from: owner})
        tx = await usdt.approvex(xSwap.address, {from: owner})
        tx = await dai.approvex(xSwap.address, {from: owner})

        // transfer in 
        tx = await xSwap.transferIn(usdc.address, d6(10000), {from: owner})
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(tusd.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(pax.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(busd.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(husd.address, d8(10000), {from: owner})
        tx = await xSwap.transferIn(usdt.address, d6(10000), {from: owner})
        tx = await xSwap.transferIn(dai.address, d18(10000), {from: owner})

        // transfer out
        tx = await xSwap.transferOut(usdc.address, owner ,d6(1000))
        tx = await xSwap.transferOut(usdx.address, owner ,d18(1000))
        tx = await xSwap.transferOut(tusd.address, owner ,d18(1000))
        tx = await xSwap.transferOut(pax.address, owner ,d18(1000))
        tx = await xSwap.transferOut(busd.address, owner ,d18(1000))
        tx = await xSwap.transferOut(husd.address, owner ,d8(1000))
        tx = await xSwap.transferOut(usdt.address, owner ,d6(1000))
        tx = await xSwap.transferOut(dai.address, owner ,d18(1000))
        await showLiquidation("init")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await xSwap.enableDToken(usdc.address, dusdc.address)
        tx = await xSwap.enableDToken(usdx.address, dusdx.address)
        tx = await xSwap.enableDToken(tusd.address, dtusd.address)
        tx = await xSwap.enableDToken(pax.address, dpax.address)
        tx = await xSwap.enableDToken(busd.address, dbusd.address)
        tx = await xSwap.enableDToken(husd.address, dhusd.address)
        tx = await xSwap.enableDToken(usdt.address, dusdt.address)
        tx = await xSwap.enableDToken(dai.address, ddai.address)
        await showLiquidation("1. enable DToken")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await dusdcHandler.takeOut(usdc.address, owner, d6(4000))
        tx = await dusdxHandler.takeOut(usdx.address, owner, d18(4000))
        tx = await dtusdHandler.takeOut(tusd.address, owner, d18(4000))
        tx = await dpaxHandler.takeOut(pax.address, owner, d18(4000))
        tx = await dbusdHandler.takeOut(busd.address, owner, d18(4000))
        tx = await dhusdHandler.takeOut(husd.address, owner, d8(4000))
        tx = await dusdtHandler.takeOut(usdt.address, owner, d6(4000))
        tx = await ddaiHandler.takeOut(dai.address, owner, d18(4000))
        await showLiquidation("2. Handler.takeOut 4000")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await xSwap.disableDToken(usdc.address)
        tx = await xSwap.disableDToken(usdx.address)
        tx = await xSwap.disableDToken(tusd.address)
        tx = await xSwap.disableDToken(pax.address)
        tx = await xSwap.disableDToken(busd.address)
        tx = await xSwap.disableDToken(husd.address)
        tx = await xSwap.disableDToken(usdt.address)
        tx = await xSwap.disableDToken(dai.address)
        await showLiquidation("3. disable DToken")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await xSwap.enableDToken(usdc.address, dusdc.address)
        tx = await xSwap.enableDToken(usdx.address, dusdx.address)
        tx = await xSwap.enableDToken(tusd.address, dtusd.address)
        tx = await xSwap.enableDToken(pax.address, dpax.address)
        tx = await xSwap.enableDToken(busd.address, dbusd.address)
        tx = await xSwap.enableDToken(husd.address, dhusd.address)
        tx = await xSwap.enableDToken(usdt.address, dusdt.address)
        tx = await xSwap.enableDToken(dai.address, ddai.address)
        await showLiquidation("4. enable DToken")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await xSwap.disableDToken(usdc.address)
        tx = await xSwap.disableDToken(usdx.address)
        tx = await xSwap.disableDToken(tusd.address)
        tx = await xSwap.disableDToken(pax.address)
        tx = await xSwap.disableDToken(busd.address)
        tx = await xSwap.disableDToken(husd.address)
        tx = await xSwap.disableDToken(usdt.address)
        tx = await xSwap.disableDToken(dai.address)
        await showLiquidation("5. disable DToken")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        try {
            
            await xSwap.transferOutALL(usdc.address, owner)
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        try {
            
            await xSwap.transferOutALL(usdx.address, owner)
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        try {
            
            await xSwap.transferOutALL(tusd.address, owner)
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        try {
            
            await xSwap.transferOutALL(pax.address, owner)
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        try {
            
            await xSwap.transferOutALL(busd.address, owner)
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        try {
            
            await xSwap.transferOutALL(husd.address, owner)
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        try {
            
            await xSwap.transferOutALL(usdt.address, owner)
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        try {
            
            await xSwap.transferOutALL(dai.address, owner)
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }
        
        await showLiquidation("6. transferOutALL")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await husd.mint(user1, d8(1000))
        tx = await husd.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(husd.address, usdc.address, d8(1000), user1, {from: user1})
        await showLiquidation("7. 1000 husd to usdc")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await usdc.mint(user1, d6(100))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swapTo(usdc.address, husd.address, d8(1000), user1, {from: user1})
        await showLiquidation("8. usdc to 1000 husd")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await usdc.transfer(dusdcHandler.address, d6(1000))
        tx = await usdx.transfer(dusdxHandler.address, d18(1000))
        tx = await tusd.transfer(dtusdHandler.address, d18(1000))
        tx = await pax.transfer(dpaxHandler.address, d18(1000))
        tx = await busd.transfer(dbusdHandler.address, d18(1000))
        tx = await husd.transfer(dhusdHandler.address, d8(1000))
        tx = await usdt.transfer(dusdtHandler.address, d6(1000))
        tx = await dai.transfer(ddaiHandler.address, d18(1000))
        await showLiquidation("9. transfer in Handler 1000")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await usdc.mint(user1, d6(1100))
        userBalance = await usdc.balanceOf(user1)
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swapTo(usdc.address, husd.address, d8(1000), user1, {from: user1})
        await showLiquidation("10. usdc to 1000 husd")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()
        await userDiff(usdc, userBalance)

        tx = await xSwap.transferOut(usdc.address, owner ,d6(1000))
        tx = await xSwap.transferOut(usdx.address, owner ,d18(1000))
        tx = await xSwap.transferOut(tusd.address, owner ,d18(1000))
        tx = await xSwap.transferOut(pax.address, owner ,d18(1000))
        tx = await xSwap.transferOut(busd.address, owner ,d18(1000))
        // tx = await xSwap.transferOut(husd.address, owner ,d8(1000))
        tx = await xSwap.transferOut(usdt.address, owner ,d6(1000))
        tx = await xSwap.transferOut(dai.address, owner ,d18(1000))
        await showLiquidation("11. xSwap transferOut 1000")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await usdc.transfer(dusdcHandler.address, d6(3000))
        tx = await usdx.transfer(dusdxHandler.address, d18(3000))
        tx = await tusd.transfer(dtusdHandler.address, d18(3000))
        tx = await pax.transfer(dpaxHandler.address, d18(3000))
        tx = await busd.transfer(dbusdHandler.address, d18(3000))
        tx = await husd.transfer(dhusdHandler.address, d8(3000))
        tx = await usdt.transfer(dusdtHandler.address, d6(3000))
        tx = await dai.transfer(ddaiHandler.address, d18(3000))
        await showLiquidation("12. transfer in Handler 3000")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await xSwap.transferOut(usdc.address, owner ,d6(3000))
        await xSwap.transferOutALL(usdx.address, owner)

        tx = await usdt.mint(user1, d6(3000))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdt.address, tusd.address, d6(3000), user1, {from: user1})

        tx = await usdt.mint(user1, d6(1001))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swapTo(usdt.address, pax.address, d18(1000), user1, {from: user1})

        tx = await usdt.mint(user1, d6(100))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdt.address, busd.address, d6(100), user1, {from: user1})
        
        // tx = await xSwap.transferOut(husd.address, owner ,d6(2000))

        tx = await husd.mint(user1, d8(3001))
        tx = await husd.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swapTo(husd.address, usdt.address, d6(3000), user1, {from: user1})

        tx = await xSwap.transferOut(dai.address, owner ,d18(3000))

        await showLiquidation("13. freeDToken 3000")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()

        tx = await usdt.mint(user1, d6(100))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swapTo(usdt.address, husd.address, d8(100), user1, {from: user1})
        await showLiquidation("14. clean")
        await showContractBalance()
        await showSupportDToken()
        await showFreeDToken()
        await showHandlerLiquidity()
        await showHandlerBalance()
return
        // swap 
        // 1. 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showLiquidation("1. 1000 usdx to usdc")

        // 2. 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showLiquidation("2. 1000 usdc to usdx")

        // 3. 1000 usdt to tusd
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdt.address, tusd.address, d6(1000), user1, {from: user1})
        await showLiquidation("3. 1000 usdt to tusd")

        // 4. 1000 tusd to usdt
        tx = await tusd.mint(user1, d18(1000))
        tx = await tusd.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(tusd.address, usdt.address, d18(1000), user1, {from: user1})
        await showLiquidation("4. 1000 tusd to usdt")

        // 5. 1000 pax to dai
        tx = await pax.mint(user1, d18(1000))
        tx = await pax.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(pax.address, dai.address, d18(1000), user1, {from: user1})
        await showLiquidation("5. 1000 pax to dai")
        await showContractBalance()

        // 6. 1000 dai to pax
        tx = await dai.mint(user1, d18(1000))
        tx = await dai.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(dai.address, pax.address, d18(1000), user1, {from: user1})
        await showLiquidation("6. 1000 dai to pax")
        await showContractBalance()

        // close exchange
        // tx = await xSwap.setPrices(usdx.address, usdc.address, "0")
        // tx = await xSwap.setPrices(usdc.address, usdx.address, "0")
        // tx = await xSwap.setPrices(usdt.address, tusd.address, "0")
        // tx = await xSwap.setPrices(tusd.address, usdt.address, "0")
        // tx = await xSwap.setPrices(pax.address, dai.address,  "0")
        // tx = await xSwap.setPrices(dai.address, pax.address,  "0")

        // tx = await priceOracle.setPrice(usdx.address, "0")
        // tx = await priceOracle.setPrice(usdc.address, "0")
        // tx = await priceOracle.setPrice(usdt.address, "0")
        // tx = await priceOracle.setPrice(dai.address, "0")
        tx = await priceOracle.setReaders(usdx.address, test.address)
        tx = await priceOracle.setReaders(usdc.address, test.address)
        tx = await priceOracle.setReaders(usdt.address, test.address)
        tx = await priceOracle.setReaders(dai.address, test.address)

        // should fail if swap
        tx = await usdx.mint(user1, d18(100))
        try {
            await xSwap.swap(usdx.address, usdc.address, d18(100), user1, {from: user1})
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }
        tx = await usdc.mint(user1, d6(100))
        try {
            await xSwap.swap(usdc.address, usdx.address, d6(100), user1, {from: user1})
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        // open exchange
        // tx = await xSwap.setPrices(usdx.address, usdc.address, "1000000000000000000")
        // tx = await xSwap.setPrices(usdc.address, usdx.address, "1000000000000000000")
        // tx = await xSwap.setPrices(usdt.address, tusd.address, "1000000000000000000")
        // tx = await xSwap.setPrices(tusd.address, usdt.address, "1000000000000000000")
        // tx = await xSwap.setPrices(pax.address, dai.address,  "1000000000000000000")
        // tx = await xSwap.setPrices(dai.address, pax.address,  "1000000000000000000")

        // tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        // tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        // tx = await priceOracle.setPrice(usdt.address, "1000000000000000000000000000000")
        // tx = await priceOracle.setPrice(dai.address, "1000000000000000000")

        tx = await priceOracle.setReaders(usdx.address, usdc.address)
        tx = await priceOracle.setReaders(usdc.address, '0x0000000000000000000000000000000000000000')
        tx = await priceOracle.setReaders(usdt.address, '0x0000000000000000000000000000000000000000')
        tx = await priceOracle.setReaders(dai.address, '0x0000000000000000000000000000000000000000')

        // 7. set lending 
        tx = await xSwap.enableDToken(usdx.address, dusdx.address)
        tx = await xSwap.enableDToken(usdc.address, dusdc.address)
        tx = await xSwap.enableDToken(usdt.address, dusdt.address)
        tx = await xSwap.enableDToken(tusd.address, dtusd.address)
        tx = await xSwap.enableDToken(pax.address, dpax.address)
        await showLiquidation("7. enable lending A, B, C, D, E")
        await showContractBalance()

        // 8. transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (10000), {from: owner})
        tx = await xSwap.transferIn(usdt.address, d6 (10000), {from: owner})
        tx = await xSwap.transferIn(tusd.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(pax.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(dai.address, d18(10000), {from: owner})
        await showLiquidation("8. transfer in 10000 of all")
        await showContractBalance()

        // 9. transfet out 1000 of all
        tx = await xSwap.transferOut(usdx.address, owner, d18(1000), {from: owner})
        tx = await xSwap.transferOut(usdc.address, owner, d6 (1000), {from: owner})
        tx = await xSwap.transferOut(usdt.address, owner, d6 (1000), {from: owner})
        tx = await xSwap.transferOut(tusd.address, owner, d18(1000), {from: owner})
        tx = await xSwap.transferOut( pax.address, owner, d18(1000), {from: owner})
        tx = await xSwap.transferOut( dai.address, owner, d18(1000), {from: owner})
        await showLiquidation("9. transfer out 1000 of all")
        await showContractBalance()
        
        // 10. 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showLiquidation("10. 1000 usdx to usdc")
        await showContractBalance()

        // 11. 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showLiquidation("11. 1000 usdc to usdx")
        await showContractBalance()

        // 12. 1000 usdt to tusd
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdt.address, tusd.address, d6(1000), user1, {from: user1})
        await showLiquidation("12. 1000 usdt to tusd")
        await showContractBalance()

        // 13. 1000 tusd to usdt
        tx = await tusd.mint(user1, d18(1000))
        tx = await tusd.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(tusd.address, usdt.address, d18(1000), user1, {from: user1})
        await showLiquidation("13. 1000 tusd to usdt")
        await showContractBalance()

        // 14. 1000 pax to dai
        tx = await pax.mint(user1, d18(1000))
        tx = await pax.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(pax.address, dai.address, d18(1000), user1, {from: user1})
        await showLiquidation("14. 1000 pax to dai")
        await showContractBalance()

        // 15. 1000 dai to pax
        tx = await dai.mint(user1, d18(1000))
        tx = await dai.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(dai.address, pax.address, d18(1000), user1, {from: user1})
        await showLiquidation("15. 1000 dai to pax")
        await showContractBalance()

        // 16. disable A, B
        tx = await xSwap.disableDToken(usdx.address)
        tx = await xSwap.disableDToken(usdc.address)
        await showLiquidation("16. disable lending A(usdx) and B(usdc) ")
        await showContractBalance()

        // 17. 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showLiquidation("17. 1000 usdx to usdc")
        await showContractBalance()

        // 18. 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showLiquidation("18. 1000 usdc to usdx")
        await showContractBalance()

        // stop trading, should fail if trading
        tx = await xSwap.emergencyStop(0)
        tx = await usdx.mint(user1, d18(100))
        try {
            await xSwap.swap(usdx.address, usdc.address, d18(100), user1, {from: user1})
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }
        tx = await usdc.mint(user1, d6(100))
        try {
            await xSwap.swap(usdc.address, usdx.address, d6(100), user1, {from: user1})
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        // re open
        tx = await xSwap.emergencyStop(1)

        // 19. 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showLiquidation("19. 1000 usdx to usdc")
        await showContractBalance()

        // 20. 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showLiquidation("20. 1000 usdc to usdx")
        await showContractBalance()

        // 21. transfer out A: 2000, B: 3000
        tx = await xSwap.transferOut(usdx.address, owner, d18(2000))
        tx = await xSwap.transferOut(usdc.address, owner, d6(3000))
        await showLiquidation("21. trasnfer out 2000 A and 3000 B")
        await showContractBalance()

        // 22. transfer ALL
        tx = await xSwap.transferOutALL(usdx.address, owner)
        tx = await xSwap.transferOutALL(usdc.address, owner)
        await showLiquidation("22. trasnfer out ALL A and B")
        await showContractBalance()

        // 23. set A(usdx) lending, disable B(usdc) lending
        tx = await xSwap.enableDToken(usdx.address, dusdx.address)
        // tx = await xSwap.disableLending(usdc.address)
        await showABLiquidation("23. set A Lending, disable B Lending")
        await showABContractBalance()

        // 24. transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (10000), {from: owner})
        await showABLiquidation("24. transfer in 10000 A(usdx) and B(usdc)")
        await showABContractBalance()

        // 25. transfer out A, B 1000 
        tx = await xSwap.transferOut(usdx.address, owner, d18(1000))
        tx = await xSwap.transferOut(usdc.address, owner, d6(1000))
        await showABLiquidation("25. trasnfer out 1000 A and B")
        await showABContractBalance() 

        // 26. transfer out ALL
        tx = await xSwap.transferOutALL(usdx.address, owner)
        tx = await xSwap.transferOutALL(usdc.address, owner)
        await showABLiquidation("26. trasnfer out ALL A and B")
        await showABContractBalance() 

        // 27. transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (10000), {from: owner})
        await showABLiquidation("27. transfer in 10000 A(usdx) and B(usdc)")
        await showABContractBalance()

        // 28. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("28. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 29. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)        
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showABLiquidation("29. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set AB ratio
        // tx = await xSwap.setPrices(usdx.address, usdc.address, "999900000000000000")
        // tx = await xSwap.setPrices(usdc.address, usdx.address, "10001000000000000000")
        tx = await priceOracle.setReaders(usdx.address, '0x0000000000000000000000000000000000000000')
        tx = await priceOracle._setPendingAnchor(usdx.address, "999900000000000000")
        tx = await priceOracle.setPrice(usdx.address, "999900000000000000")
        // console.log((await priceOracle.assetPrices(usdx.address)).toString());
        // console.log((await priceOracle.assetPrices(usdc.address)).toString());

        // 30. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("30. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "10001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "10001000000000000000000000000000")

        // 31. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(100))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(100), user1, {from: user1})
        await showABLiquidation("31. 100 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // 32. disable usdx 
        tx = await xSwap.disableDToken(usdx.address)
        await showABLiquidation("32. disable usdx")
        await showABContractBalance()

        tx = await priceOracle._setPendingAnchor(usdx.address, "999900000000000000")
        tx = await priceOracle.setPrice(usdx.address, "999900000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        // 33. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("33. after disable usdx lending, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "10001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "10001000000000000000000000000000")
        // 34. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(100))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(100), user1, {from: user1})
        await showABLiquidation("34. after disable usdx lending, 100 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set rate
        // tx = await xSwap.setPrices(usdx.address, usdc.address, "110000000000000000")
        // tx = await xSwap.setPrices(usdc.address, usdx.address, "1001000000000000000")

        // 34.5 enable usdx lending 
        tx = await xSwap.enableDToken(usdx.address, dusdx.address)
        await showABLiquidation("34.5 enable usdx")
        await showABContractBalance()

        tx = await priceOracle._setPendingAnchor(usdx.address, "110000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "110000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")

        // 35. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("35. after ratio reset, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1001000000000000000000000000000")
        // 36. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showABLiquidation("36. after ratio reset, 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set AB fee to 0
        tx = await xSwap.setFee(usdc.address, usdx.address,"0")

        tx = await priceOracle._setPendingAnchor(usdx.address, "110000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "110000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        // 37. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("37. after reset A/B fee to 0%, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1001000000000000000000000000000")
        // 38. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showABLiquidation("38. after reset A/B fee to 0%, 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set AB fee to 999,000,000,000,000,000
        tx = await xSwap.setFee(usdc.address, usdx.address, "999000000000000000")

        // 39. set A no lending, B lending
        tx = await xSwap.disableDToken(usdx.address)
        tx = await xSwap.enableDToken(usdc.address, dusdc.address)
        await showABLiquidation("39. disable A Lending, set B Lending")
        await showABContractBalance() 

        // 40. transfer out A, B 1000 
        tx = await xSwap.transferOut(usdx.address, owner, d18(1000))
        tx = await xSwap.transferOut(usdc.address, owner, d6(1000))
        await showABLiquidation("40. trasnfer out 1000 A and B")
        await showABContractBalance() 

        // 41. transfer out ALL
        tx = await xSwap.transferOutALL(usdx.address, owner)
        tx = await xSwap.transferOutALL(usdc.address, owner)
        await showABLiquidation("41. trasnfer out ALL A and B")
        await showABContractBalance() 

        // 42. transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (10000), {from: owner})
        await showABLiquidation("42. transfer in 10000 A(usdx) and B(usdc)")
        await showABContractBalance()

        tx = await priceOracle._setPendingAnchor(usdx.address, "110000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "110000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        // 43. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("43. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1001000000000000000000000000000")
        // 44. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showABLiquidation("44. 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set rate
        // tx = await xSwap.setPrices(usdx.address, usdc.address, "999900000000000000")
        // tx = await xSwap.setPrices(usdc.address, usdx.address, "10001000000000000000")
        tx = await priceOracle._setPendingAnchor(usdx.address, "999900000000000000")
        tx = await priceOracle.setPrice(usdx.address, "999900000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")

        // 45. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("45. after reset rate, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "10001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "10001000000000000000000000000000")
        // 46. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showABLiquidation("46. after reset rate, 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // 47. disable usdc
        tx = await xSwap.disableDToken(usdc.address)
        await showABLiquidation("47. disable usdc")
        await showABContractBalance() 

        tx = await priceOracle._setPendingAnchor(usdx.address, "999900000000000000")
        tx = await priceOracle.setPrice(usdx.address, "999900000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        // 48. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("48. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "10001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "10001000000000000000000000000000")
        // 49. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showABLiquidation("49. 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set rate
        // tx = await xSwap.setPrices(usdx.address, usdc.address, "110000000000000000")
        // tx = await xSwap.setPrices(usdc.address, usdx.address, "1001000000000000000")
        tx = await priceOracle._setPendingAnchor(usdx.address, "110000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "110000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        
        // 49.5 enable usdc
        tx = await xSwap.enableDToken(usdc.address, dusdc.address)
        await showABLiquidation("49.5 enable usdc")
        await showABContractBalance()

        // 50. swap A to B 909.090909,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(909.090909), user1, {from: user1})
        await showABLiquidation("50. after reset rate, 909.090909 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1001000000000000000000000000000")
        // 51. swap B to A 99.9000999, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(99.9000999), user1, {from: user1})
        await showABLiquidation("51. after reset rate, 99.9000999 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set A/B fee to 0
        tx = await xSwap.setFee(usdc.address, usdx.address, "0")

        tx = await priceOracle._setPendingAnchor(usdx.address, "110000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "110000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        // 52. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdx.address, usdc.address, d18(1000), user1, {from: user1})
        await showABLiquidation("52. after set fee to 0, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdc.address, "1001000000000000000000000000000")
        tx = await priceOracle.setPrice(usdc.address, "1001000000000000000000000000000")
        // 53. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.swap(usdc.address, usdx.address, d6(1000), user1, {from: user1})
        await showABLiquidation("53.after set fee to 0, 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance) 
    });
});
