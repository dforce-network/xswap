'use strict'
const BN = require('bn.js');
const XSwap = artifacts.require('./XSwap.sol')
const DSAuth = artifacts.require('./DSAuth.sol')
const DSToken = artifacts.require("DSToken")
var DSGuard = artifacts.require("DSGuard")
const FakeLendFMe = artifacts.require("FakeLendFMe")

contract('test', function(accounts) {
    const owner = accounts[0]
    const admin = accounts[1]
    const user1 = accounts[2]

    let tx
    let lendFMe, xSwap, dsGuard
    let usdx, usdt, usdc, pax, dai, tusd

    const d18 = function (amount) {
        amount = new BN(amount)
        return web3.utils.toWei(amount, "ether")
    }

    const d6 = function (amount) {
        amount = new BN(amount)
        return web3.utils.toWei(amount, "mwei")
    }

    let renewContract = async function () {
        usdx = await DSToken.new("0x444600000000000000000000000000", 18)
        usdt = await DSToken.new("0x444600000000000000000000000000", 6)
        pax = await DSToken.new("0x444600000000000000000000000000", 18)
        usdc = await DSToken.new("0x444600000000000000000000000000", 6)
        dai = await DSToken.new("0x444600000000000000000000000000", 18)
        tusd = await DSToken.new("0x444600000000000000000000000000", 18)
        lendFMe = await FakeLendFMe.new()
        xSwap = await XSwap.new(lendFMe.address)
        tx = await xSwap.setTokenDecimals(usdx.address, 18);
        tx = await xSwap.setTokenDecimals(usdt.address, 6);
        tx = await xSwap.setTokenDecimals(pax.address, 18);
        tx = await xSwap.setTokenDecimals(usdc.address, 6);
        tx = await xSwap.setTokenDecimals(dai.address, 18);
        tx = await xSwap.setTokenDecimals(tusd.address, 18);
    }

    it("case1", async function () {
        await renewContract()
        tx = await xSwap.setPrices(usdx.address, usdc.address, "1001000000000000000")
        tx = await xSwap.setPrices(usdx.address, usdt.address, "1002000000000000000")
        tx = await xSwap.setPrices(usdx.address, tusd.address, "1003000000000000000")
        tx = await xSwap.setPrices(usdx.address, pax.address,  "1004000000000000000")
        tx = await xSwap.setPrices(usdx.address, dai.address,  "1005000000000000000")

        tx = await xSwap.setPrices(usdc.address, usdx.address,"998000000000000000")
        tx = await xSwap.setPrices(usdc.address, usdt.address,"997000000000000000")
        tx = await xSwap.setPrices(usdc.address, tusd.address,"996000000000000000")
        tx = await xSwap.setPrices(usdc.address, pax.address, "995000000000000000")
        tx = await xSwap.setPrices(usdc.address, dai.address, "994000000000000000")

        tx = await xSwap.setPrices(usdt.address, usdx.address,"999900000000000000")
        tx = await xSwap.setPrices(usdt.address, usdc.address,"999800000000000000")
        tx = await xSwap.setPrices(usdt.address, tusd.address,"999700000000000000")
        tx = await xSwap.setPrices(usdt.address, pax.address, "999600000000000000")
        tx = await xSwap.setPrices(usdt.address, dai.address, "999500000000000000")

        tx = await xSwap.setPrices(tusd.address, usdx.address,"1000000000000000000")
        tx = await xSwap.setPrices(tusd.address, usdc.address,"1001000000000000000")
        tx = await xSwap.setPrices(tusd.address, usdt.address,"1002000000000000000")
        tx = await xSwap.setPrices(tusd.address, pax.address, "1003000000000000000")
        tx = await xSwap.setPrices(tusd.address, dai.address, "1004000000000000000")

        tx = await xSwap.setPrices(pax.address, usdx.address,"10000000000000000000")
        tx = await xSwap.setPrices(pax.address, usdc.address,"10001000000000000000")
        tx = await xSwap.setPrices(pax.address, usdt.address,"10002000000000000000")
        tx = await xSwap.setPrices(pax.address, tusd.address,"10003000000000000000")
        tx = await xSwap.setPrices(pax.address, dai.address, "10004000000000000000")

        tx = await xSwap.setPrices(dai.address, usdx.address,"110000000000000000")
        tx = await xSwap.setPrices(dai.address, usdc.address,"111000000000000000")
        tx = await xSwap.setPrices(dai.address, usdt.address,"112000000000000000")
        tx = await xSwap.setPrices(dai.address, tusd.address,"113000000000000000")
        tx = await xSwap.setPrices(dai.address, pax.address, "114000000000000000")

        tx = await xSwap.setFee(usdc.address, usdx.address,"100000000000000")
        tx = await xSwap.setFee(usdt.address, usdx.address,"1000000000000000")
        tx = await xSwap.setFee(tusd.address, usdx.address,"500000000000000")
        tx = await xSwap.setFee(pax.address, usdx.address,"2500000000000000")
        tx = await xSwap.setFee(dai.address, usdx.address,"1500000000000000")

        // minting token 
        tx = await usdx.mint(owner, d18(10000000))
        tx = await usdt.mint(owner, d6 (10000000))
        tx = await pax.mint(owner, d18(10000000))
        tx = await usdc.mint(owner, d6 (10000000))
        tx = await dai.mint(owner, d18(10000000))
        tx = await tusd.mint(owner, d18(10000000))

        // approvex
        tx = await usdx.approvex(xSwap.address, {from: owner})
        tx = await usdt.approvex(xSwap.address, {from: owner})
        tx = await pax.approvex(xSwap.address, {from: owner})
        tx = await usdc.approvex(xSwap.address, {from: owner})
        tx = await dai.approvex(xSwap.address, {from: owner})
        tx = await tusd.approvex(xSwap.address, {from: owner})

        // transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(100000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (100000), {from: owner})
        tx = await xSwap.transferIn(usdt.address, d6 (100000), {from: owner})
        tx = await xSwap.transferIn(tusd.address, d18(100000), {from: owner})
        tx = await xSwap.transferIn(pax.address, d18(100000), {from: owner})
        tx = await xSwap.transferIn(dai.address, d18(100000), {from: owner})

        // transfer out
        tx = await xSwap.transferOut(usdx.address,user1 ,d18(1000))
        tx = await xSwap.transferOut(usdc.address,owner ,d6 (1000))
        tx = await xSwap.transferOut(usdt.address,owner ,d6 (1000))
        tx = await xSwap.transferOut(tusd.address,owner ,d18(1000))
        tx = await xSwap.transferOut(pax.address,owner ,d18(1000))
        tx = await xSwap.transferOut(dai.address,owner ,d18(1000))

        // swap 
        // 1000 usdx to swap dai 
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        console.log("user1 usdx balance: ", (await usdx.balanceOf(user1)).toString())
        console.log("user1 dai balance: ", (await dai.balanceOf(user1)).toString())
        tx = await xSwap.trade(usdx.address, dai.address, d18(10), {from: user1})
        console.log("user1 dai balance: ", (await dai.balanceOf(user1)).toString())
        console.log("user1 usdx balance: ", (await usdx.balanceOf(user1)).toString())
    });
});
