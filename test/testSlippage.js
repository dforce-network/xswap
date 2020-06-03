'use strict'
const BN = require('bn.js');
const XSwap = artifacts.require('XSwap')
const PriceOracle = artifacts.require('PriceOracle')
const DSAuth = artifacts.require('DSAuth')
const DSToken = artifacts.require("DSToken")
var DSGuard = artifacts.require("DSGuard")
const FakeLendFMe = artifacts.require("FakeLendFMe")

contract('test', function(accounts) {
    const owner = accounts[0]
    const admin = accounts[1]
    const user1 = accounts[2]

    let tx, userBalance
    let lendFMe, xSwap, dsGuard, priceOracle
    let usdx, usdt, usdc, pax, dai, tusd, test, busd, husd

    let expectedAmount, slippage, minExpectedAmount, newExpectedAmount, newMinExpectedAmount, maxExpectedAmount

    const d18 = function (amount) {
        amount = new BN(amount)
        return web3.utils.toWei(amount, "ether")
    }

    const d6 = function (amount) {
        amount = new BN(amount)
        return web3.utils.toWei(amount, "mwei")
    }

    const f18 = function (amount) {
        amount = new BN(amount)
        return web3.utils.fromWei(amount, "ether")
    }

    const f6 = function (amount) {
        amount = new BN(amount)
        return web3.utils.fromWei(amount, "mwei")
    }

    let renewContract = async function () {
        usdx = await DSToken.new("0x444600000000000000000000000000", 18)
        usdt = await DSToken.new("0x444600000000000000000000000000", 6)
        pax = await DSToken.new("0x444600000000000000000000000000", 18)
        usdc = await DSToken.new("0x444600000000000000000000000000", 6)
        dai = await DSToken.new("0x444600000000000000000000000000", 18)
        tusd = await DSToken.new("0x444600000000000000000000000000", 18)
        busd = await DSToken.new("0x746573740000000000000000000000", 18)
        husd = await DSToken.new("0x746573740000000000000000000000", 8)
        test = await DSToken.new("0x746573740000000000000000000000", 18)
        lendFMe = await FakeLendFMe.new()
        priceOracle = await PriceOracle.new(accounts[0], web3.utils.toWei('0.001', "ether"))
        xSwap = await XSwap.new()
        tx = await xSwap.active(priceOracle.address)

        tx = await xSwap.enableToken(usdc.address)
        tx = await xSwap.enableToken(usdx.address)
        tx = await xSwap.enableToken(tusd.address)

        tx = await xSwap.enableToken(pax.address)
        tx = await xSwap.enableToken(busd.address)
        tx = await xSwap.enableToken(husd.address)

        tx = await xSwap.enableToken(usdt.address)
        tx = await xSwap.enableToken(dai.address)


        tx = await xSwap.setFee(usdc.address, usdx.address,"1000000000000000")
        tx = await xSwap.setFee(usdt.address, tusd.address,"1000000000000000")
        tx = await xSwap.setFee(pax.address, dai.address,"1000000000000000")
    }

    it("test", async function () {
        await renewContract()

        const showLiquidation = async function (note) {
            console.log("-------------------------------------------")
            console.log(note)
            console.log("usdx liquadation: ", f18(await xSwap.getLiquidity(usdx.address)))
            console.log("usdc liquadation: ", f6(await xSwap.getLiquidity(usdc.address)))
            console.log("usdt liquadation: ", f6(await xSwap.getLiquidity(usdt.address)))
            console.log("tusd liquadation: ", f18(await xSwap.getLiquidity(tusd.address)))
            console.log("pax  liquadation: ", f18(await xSwap.getLiquidity(pax.address)))
            console.log("dai  liquadation: ", f18(await xSwap.getLiquidity(dai.address)))
        }

        const showABLiquidation = async function (note) {
            console.log("-------------------------------------------")
            console.log(note)
            console.log("usdx liquadation: ", f18(await xSwap.getLiquidity(usdx.address)))
            console.log("usdc liquadation: ", f6(await xSwap.getLiquidity(usdc.address)))
        }

        const showContractBalance = async function () {
            console.log("usdx contract balance: ", f18(await usdx.balanceOf(xSwap.address)))
            console.log("usdc contract balance: ", f6(await usdc.balanceOf(xSwap.address)))
            console.log("usdt contract balance: ", f6(await usdt.balanceOf(xSwap.address)))
            console.log("tusd contract balance: ", f18(await tusd.balanceOf(xSwap.address)))
            console.log("pax  contract balance: ", f18(await pax.balanceOf(xSwap.address)))
            console.log("dai  contract balance: ", f18(await dai.balanceOf(xSwap.address)))
        }

        const showABContractBalance = async function () {
            console.log("usdx contract balance: ", f18(await usdx.balanceOf(xSwap.address)))
            console.log("usdc contract balance: ", f6(await usdc.balanceOf(xSwap.address)))
        }

        const userDiff = async function (token, initBalance) {
            let currentBalance =  await token.balanceOf(user1);
            let diff = currentBalance.sub(initBalance);
            if(token == usdt || token == usdc) {
                console.log("user get: ", f6(diff))
            } else {
                console.log("user get: ", f18(diff))
            }
        }

        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        tx = await priceOracle.setReaders(usdc.address, usdx.address)
        tx = await priceOracle.setReaders(tusd.address, usdx.address)

        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        tx = await priceOracle.setReaders(husd.address, pax.address)
        tx = await priceOracle.setReaders(tusd.address, pax.address)

        tx = await priceOracle.setPrice(usdt.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(dai.address, "1000000000000000000")

        tx = await xSwap.setFee(usdc.address, usdx.address,"1000000000000000")
        tx = await xSwap.setFee(usdt.address, tusd.address,"1000000000000000")
        tx = await xSwap.setFee(pax.address, dai.address,"1000000000000000")

        // minting token
        tx = await usdx.mint(owner, d18(10000000))
        tx = await usdt.mint(owner, d6 (10000000))
        tx = await pax.mint(owner, d18(10000000))
        tx = await usdc.mint(owner, d6 (10000000))
        tx = await dai.mint(owner, d18(10000000))
        tx = await tusd.mint(owner, d18(10000000))
        tx = await husd.mint(owner, d18(10000000))
        tx = await busd.mint(owner, d18(10000000))

        // approvex
        tx = await usdx.approvex(xSwap.address, {from: owner})
        tx = await usdt.approvex(xSwap.address, {from: owner})
        tx = await pax.approvex(xSwap.address, {from: owner})
        tx = await usdc.approvex(xSwap.address, {from: owner})
        tx = await dai.approvex(xSwap.address, {from: owner})
        tx = await tusd.approvex(xSwap.address, {from: owner})
        tx = await husd.approvex(xSwap.address, {from: owner})
        tx = await busd.approvex(xSwap.address, {from: owner})

        // transfer in
        tx = await xSwap.transferIn(usdx.address, d18(100000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (100000), {from: owner})
        tx = await xSwap.transferIn(usdt.address, d6 (100000), {from: owner})
        tx = await xSwap.transferIn(tusd.address, d18(100000), {from: owner})
        tx = await xSwap.transferIn(pax.address, d18(100000), {from: owner})
        tx = await xSwap.transferIn(dai.address, d18(100000), {from: owner})
        tx = await xSwap.transferIn(husd.address, d18(100000), {from: owner})
        tx = await xSwap.transferIn(busd.address, d18(100000), {from: owner})

        await showLiquidation("init")

        // swap
        // -------------------- 06.02 test slippage ------------------
        // 55. swap A to B 100, usdt to usdx, slippage is 0.1%, pass
        tx = await usdt.mint(user1, d6(100))
        tx = await usdt.approvex(xSwap.address, { from: user1 })
        tx = await priceOracle._setPendingAnchor(usdt.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdt.address, "1000000000000000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        console.log('usdt price is: ', (await priceOracle.assetPrices(usdt.address)).toString() / 10**30)
        console.log('usdx price is: ', (await priceOracle.assetPrices(usdx.address)).toString()/10**18)
        expectedAmount = await xSwap.getAmountByInput(usdt.address, usdx.address, d6(100))
        console.log('==== expectedAmount', expectedAmount.toString()/10**18)
        slippage = 0.001
        minExpectedAmount = expectedAmount.mul(new BN((1-slippage) * 10000)).div(new BN(10000))
        console.log('==== minExpectedAmount', minExpectedAmount.toString(),"\n")

        let userUSDTBalance = await usdt.balanceOf(user1)
        let userUSDxBalance = await usdx.balanceOf(user1)

        console.log('before swap, user1 usdt balance is: ', userUSDTBalance.toString())
        console.log('before swap, user1 usdx balance is: ', userUSDxBalance.toString(), "\n")
        console.log('Swap 100 usdt to usdx', '\n')
        tx = await xSwap.swap(usdt.address, usdx.address, d6(100), minExpectedAmount, { from: user1 })
        console.log('after  swap, user1 usdt balance is: ', (await usdt.balanceOf(user1)).toString())
        console.log('after  swap, user1 usdx balance is: ', (await usdx.balanceOf(user1)).toString(), "\n")

        // 55'. swap A to B 100, usdt to usdx, slippage is 0.1%(min expected amount is too low, fail!)
        tx = await usdt.mint(user1, d6(100))
        tx = await usdt.approvex(xSwap.address, { from: user1 })
        tx = await priceOracle._setPendingAnchor(usdt.address, "1000000000000000000000000000000")
        tx = await priceOracle.setPrice(usdt.address, "1000000000000000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        console.log('usdt price is: ', (await priceOracle.assetPrices(usdt.address)).toString() / 10**30)
        console.log('usdx price is: ', (await priceOracle.assetPrices(usdx.address)).toString()/10**18)
        expectedAmount = await xSwap.getAmountByInput(usdt.address, usdx.address, d6(100))
        console.log('==== expectedAmount', expectedAmount.toString()/10**18)
        slippage = 0.001
        minExpectedAmount = expectedAmount.mul(new BN((1-slippage) * 10000)).div(new BN(10000))
        console.log('==== minExpectedAmount', minExpectedAmount.toString(), "\n")
        let acutalExpectedAmount55 = expectedAmount.add(new BN(1))
        console.log('=====acutalExpectedAmount55', acutalExpectedAmount55.toString())

        let userUSDTBalance55 = await usdt.balanceOf(user1)
        let userUSDxBalance55 = await usdx.balanceOf(user1)

        console.log('before swap, user1 usdt balance is: ', userUSDTBalance55.toString())
        console.log('before swap, user1 usdx balance is: ', userUSDxBalance55.toString(), "\n")
        console.log('Swap 100 usdt to usdx', '\n')

        try {
            tx = await xSwap.swap(usdt.address, usdx.address, d6(100), acutalExpectedAmount55, { from: user1 })
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        console.log('after  swap, user1 usdt balance is: ', (await usdt.balanceOf(user1)).toString())
        console.log('after  swap, user1 usdx balance is: ', (await usdx.balanceOf(user1)).toString(), "\n")

        // 56. swap A to B 100, dai to husd, slippage is 0.1%(increase input token price), pass
        tx = await dai.mint(user1, d18(100))
        console.log('user1 balance', (await dai.balanceOf(user1)).toString())
        tx = await dai.approvex(xSwap.address, { from: user1 })
        tx = await priceOracle._setPendingAnchor(dai.address, "1000000000000000000")
        tx = await priceOracle.setPrice(dai.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(pax.address, "1000000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        console.log('current dai price is: ', (await priceOracle.assetPrices(dai.address))/10**18)
        console.log('current husd price is: ', (await priceOracle.assetPrices(husd.address))/10**28)
        expectedAmount = await xSwap.getAmountByInput(dai.address, husd.address, d18(100))
        console.log('==== expectedAmount', expectedAmount.toString())
        slippage = 0.001
        minExpectedAmount = expectedAmount.mul(new BN((1-slippage) * 10000)).div(new BN(10000))
        console.log('==== minExpectedAmount', minExpectedAmount.toString(), "\n")

        tx = await priceOracle._setPendingAnchor(dai.address, "1100000000000000000")
        tx = await priceOracle.setPrice(dai.address, "1100000000000000000")
        tx = await priceOracle._setPendingAnchor(pax.address, "1000000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        console.log('after set new price, dai price is: ', (await priceOracle.assetPrices(dai.address))/10**18)
        console.log('after set new price, husd price is: ', (await priceOracle.assetPrices(husd.address))/10**28)
        newExpectedAmount = await xSwap.getAmountByInput(dai.address, husd.address, d18(100))
        console.log('==== new expectedAmount', newExpectedAmount.toString())
        newMinExpectedAmount = newExpectedAmount.mul(new BN((1-slippage) * 10000)).div(new BN(10000))
        console.log('==== new minExpectedAmount', newMinExpectedAmount.toString(),"\n")

        let userdaiBalance56 = await dai.balanceOf(user1)
        let userhusdBalance56 = await husd.balanceOf(user1)

        console.log('before swap, user1 dai balance is: ', userdaiBalance56.toString())
        console.log('before swap, user1 husd balance is: ', userhusdBalance56.toString(), "\n")

        tx = await xSwap.swap(dai.address, husd.address, d18(100), minExpectedAmount, { from: user1 })

        console.log('after  swap, user1 dai balance is: ', (await dai.balanceOf(user1)).toString())
        console.log('after  swap, user1 husd balance is: ', (await husd.balanceOf(user1)).toString(), "\n")

        // 56'. swap A to B 99(gwei), dai to husd, slippage is 0.1%(increase input token price), pass
        let mintAmount = web3.utils.toWei('99', 'gwei')
        console.log('tiny mint amount is: ', mintAmount.toString()/10**18)
        tx = await dai.mint(user1, mintAmount)
        console.log('user1 balance', (await dai.balanceOf(user1)).toString()/10**18)
        tx = await dai.approvex(xSwap.address, { from: user1 })
        tx = await priceOracle._setPendingAnchor(dai.address, "1000000000000000000")
        tx = await priceOracle.setPrice(dai.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(pax.address, "1000000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        console.log('current dai price is: ', (await priceOracle.assetPrices(dai.address))/10**18)
        console.log('current husd price is: ', (await priceOracle.assetPrices(husd.address))/10**28)
        expectedAmount = await xSwap.getAmountByInput(dai.address, husd.address, mintAmount)
        console.log('==== expectedAmount', expectedAmount.toString())
        slippage = 0.001
        minExpectedAmount = expectedAmount.mul(new BN((1-slippage) * 10000)).div(new BN(10000))
        console.log('==== minExpectedAmount', minExpectedAmount.toString(), "\n")

        tx = await priceOracle._setPendingAnchor(dai.address, "1100000000000000000")
        tx = await priceOracle.setPrice(dai.address, "1100000000000000000")
        tx = await priceOracle._setPendingAnchor(pax.address, "1000000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        console.log('after set new price, dai price is: ', (await priceOracle.assetPrices(dai.address))/10**18)
        console.log('after set new price, husd price is: ', (await priceOracle.assetPrices(husd.address))/10**28)
        newExpectedAmount = await xSwap.getAmountByInput(dai.address, husd.address, mintAmount)
        console.log('==== new expectedAmount', newExpectedAmount.toString())
        newMinExpectedAmount = newExpectedAmount.mul(new BN((1-slippage) * 10000)).div(new BN(10000))
        console.log('==== new minExpectedAmount', newMinExpectedAmount.toString(),"\n")

        console.log('before swap, user1 dai balance is: ', (await dai.balanceOf(user1)).toString())
        console.log('before swap, user1 husd balance is: ', (await husd.balanceOf(user1)).toString(), "\n")

        tx = await xSwap.swap(dai.address, husd.address, mintAmount, minExpectedAmount, { from: user1 })

        console.log('after  swap, user1 dai balance is: ', (await dai.balanceOf(user1)).toString())
        console.log('after  swap, user1 husd balance is: ', (await husd.balanceOf(user1)).toString(), "\n")

        // 57. swap A to B 100, dai to husd, slippage is 0.1%(decrease input token price), fail
        tx = await dai.mint(user1, d18(100))
        tx = await dai.approvex(xSwap.address, { from: user1 })
        tx = await priceOracle._setPendingAnchor(dai.address, "1000000000000000000")
        tx = await priceOracle.setPrice(dai.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(pax.address, "1000000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        console.log('current dai price is: ', (await priceOracle.assetPrices(dai.address))/10**18)
        console.log('current husd price is: ', (await priceOracle.assetPrices(husd.address))/10**28)
        expectedAmount = await xSwap.getAmountByInput(dai.address, husd.address, d18(100))
        console.log('==== expected amount', expectedAmount.toString())
        slippage = 0.0001
        minExpectedAmount = expectedAmount.mul(new BN((1-slippage) * 10000)).div(new BN(10000))
        console.log('==== minExpectedAmount', minExpectedAmount.toString(), "\n")

        tx = await priceOracle._setPendingAnchor(dai.address, "990000000000000000")
        tx = await priceOracle.setPrice(dai.address, "990000000000000000")
        tx = await priceOracle._setPendingAnchor(pax.address, "1000000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        console.log('after set new price, dai price is: ', (await priceOracle.assetPrices(dai.address))/10**18)
        console.log('after set new price, husd price is: ', (await priceOracle.assetPrices(husd.address))/10**28)
        newExpectedAmount = await xSwap.getAmountByInput(dai.address, husd.address, d18(100))
        console.log('==== new expectedAmount', newExpectedAmount.toString())
        newMinExpectedAmount = newExpectedAmount.mul(new BN((1-slippage) * 10000)).div(new BN(10000))
        console.log('==== new minExpectedAmount', newMinExpectedAmount.toString(),"\n")

        let userdaiBalance = await dai.balanceOf(user1)
        let userhusdBalance = await husd.balanceOf(user1)

        console.log('before swap, user1 dai balance is: ', userdaiBalance.toString())
        console.log('before swap, user1 husd balance is: ', userhusdBalance.toString(), "\n")

        console.log('Swap 100 dai to husd', '\n')
        try {
            tx = await xSwap.swap(dai.address, husd.address, d18(100), minExpectedAmount, { from: user1 })
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        console.log('after  swap, user1 dai balance is: ', (await dai.balanceOf(user1)).toString())
        console.log('after  swap, user1 husd balance is: ', (await husd.balanceOf(user1)).toString(), "\n")

        // 58. swap B to A 100, pax to usdc, slippage is 0.1%, pass(price does not change)
        tx = await pax.mint(user1, d18(10000))
        tx = await pax.approvex(xSwap.address, { from: user1 })
        tx = await priceOracle._setPendingAnchor(pax.address, "1000000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        console.log('pax price is: ', (await priceOracle.assetPrices(pax.address)).toString() / 10**18)
        console.log('usdc price is: ', (await priceOracle.assetPrices(usdc.address)).toString()/10**30)
        expectedAmount = await xSwap.getAmountByOutput(pax.address, usdc.address, d6(100))
        console.log('==== expectedAmount', expectedAmount.toString()/10**18)
        slippage = 0.001
        maxExpectedAmount = expectedAmount.mul(new BN((1+slippage) * 100000)).div(new BN(100000))
        console.log('==== maxExpectedAmount', maxExpectedAmount.toString()/10**18,"\n")

        let userPAXBalance58 = await pax.balanceOf(user1)
        let userUSDcBalance58 = await usdc.balanceOf(user1)

        console.log('before swap, user1 pax balance is: ', userPAXBalance58.toString())
        console.log('before swap, user1 usdc balance is: ', userUSDcBalance58.toString(), "\n")
        console.log('Swap pax to 100 usdc', '\n')
        tx = await xSwap.swapTo(pax.address, usdc.address, maxExpectedAmount, d6(10), { from: user1 })
        console.log('after  swap, user1 pax balance is: ', (await pax.balanceOf(user1)).toString())
        console.log('after  swap, user1 usdc balance is: ', (await usdc.balanceOf(user1)).toString())

        // 59. swap B to A 100, pax to usdc, slippage is 0.1%, pass(increase input token price)
        tx = await pax.mint(user1, d18(10000))
        tx = await pax.approvex(xSwap.address, { from: user1 })
        tx = await priceOracle._setPendingAnchor(pax.address, "1000000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        console.log('pax price is: ', (await priceOracle.assetPrices(pax.address)).toString() / 10**18)
        console.log('usdc price is: ', (await priceOracle.assetPrices(usdc.address)).toString()/10**30)
        expectedAmount = await xSwap.getAmountByOutput(pax.address, usdc.address, d6(100))
        console.log('==== expectedAmount', expectedAmount.toString()/10**18)
        slippage = 0.001
        maxExpectedAmount = expectedAmount.mul(new BN((1+slippage) * 100000)).div(new BN(100000))
        console.log('==== maxExpectedAmount', maxExpectedAmount.toString() / 10 ** 18, "\n")

        tx = await priceOracle._setPendingAnchor(pax.address, "1100000000000000000")
        tx = await priceOracle.setPrice(pax.address, "1100000000000000000")
        console.log('after set new price, pax price is: ', (await priceOracle.assetPrices(pax.address))/10**18)
        console.log('after set new price, husd price is: ', (await priceOracle.assetPrices(usdc.address))/10**30)
        newExpectedAmount = await xSwap.getAmountByOutput(pax.address, usdc.address, d6(100))
        console.log('==== new expectedAmount', newExpectedAmount.toString()/10**18)
        newMinExpectedAmount = newExpectedAmount.mul(new BN((1+slippage) * 10000)).div(new BN(10000))
        console.log('==== new minExpectedAmount', newMinExpectedAmount.toString()/10**18,"\n")

        let userPAXBalance59 = await pax.balanceOf(user1)
        let userUSDcBalance59 = await usdc.balanceOf(user1)

        console.log('before swap, user1 pax balance is: ', userPAXBalance59.toString())
        console.log('before swap, user1 usdc balance is: ', userUSDcBalance59.toString(), "\n")
        console.log('Swap pax to 100 usdc', '\n')
        tx = await xSwap.swapTo(pax.address, usdc.address, maxExpectedAmount, d6(10), { from: user1 })
        console.log('after  swap, user1 pax balance is: ', (await pax.balanceOf(user1)).toString())
        console.log('after  swap, user1 usdc balance is: ', (await usdc.balanceOf(user1)).toString())

        // 60. swap B to A 100, dai to usdx, slippage is 0.1%, pass(decrease input token price)
        console.log('test 60')
        tx = await dai.mint(user1, d18(1000))
        tx = await dai.approvex(xSwap.address, { from: user1 })
        tx = await priceOracle._setPendingAnchor(dai.address, "1000000000000000000")
        tx = await priceOracle.setPrice(dai.address, "1000000000000000000")
        tx = await priceOracle._setPendingAnchor(usdx.address, "1000000000000000000")
        tx = await priceOracle.setPrice(usdx.address, "1000000000000000000")
        console.log('dai price is: ', (await priceOracle.assetPrices(dai.address)).toString() / 10**18)
        console.log('usdx price is: ', (await priceOracle.assetPrices(usdx.address)).toString()/10**18)
        expectedAmount = await xSwap.getAmountByOutput(dai.address, usdx.address, d18(100))
        console.log('==== expectedAmount', expectedAmount.toString()/10**18)
        slippage = 0.001
        maxExpectedAmount = expectedAmount.mul(new BN((1+slippage) * 100000)).div(new BN(100000))
        console.log('==== maxExpectedAmount', maxExpectedAmount.toString() / 10 ** 18, "\n")

        tx = await priceOracle._setPendingAnchor(dai.address, "990000000000000000")
        tx = await priceOracle.setPrice(dai.address, "990000000000000000")
        console.log('after set new price, dai price is: ', (await priceOracle.assetPrices(dai.address))/10**18)
        console.log('after set new price, usdx price is: ', (await priceOracle.assetPrices(usdx.address))/10**18)
        newExpectedAmount = await xSwap.getAmountByOutput(dai.address, usdx.address, d18(100))
        console.log('==== new expectedAmount', newExpectedAmount.toString()/10**18)
        newMinExpectedAmount = newExpectedAmount.mul(new BN((1+slippage) * 10000)).div(new BN(10000))
        console.log('==== new minExpectedAmount', newMinExpectedAmount.toString()/10**18,"\n")

        let userDAIBalance60 = await dai.balanceOf(user1)
        let userUSDxBalance60 = await usdx.balanceOf(user1)

        console.log('before swap, user1 dai balance is: ', userDAIBalance60.toString())
        console.log('before swap, user1 usdx balance is: ', userUSDxBalance60.toString(), "\n")
        console.log('Swap dai to 100 usdx', '\n')

        try {
            tx = await xSwap.swapTo(dai.address, usdx.address, maxExpectedAmount, d18(100), { from: user1 })
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        console.log('after  swap, user1 dai balance is: ', (await dai.balanceOf(user1)).toString())
        console.log('after  swap, user1 usdx balance is: ', (await usdx.balanceOf(user1)).toString())
    });


});
