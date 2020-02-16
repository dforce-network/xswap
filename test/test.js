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
        lendFMe = await FakeLendFMe.new()
        xSwap = await XSwap.new(lendFMe.address)
        tx = await xSwap.setTokenDecimals(usdx.address, 18);
        tx = await xSwap.setTokenDecimals(usdt.address, 6);
        tx = await xSwap.setTokenDecimals(pax.address, 18);
        tx = await xSwap.setTokenDecimals(usdc.address, 6);
        tx = await xSwap.setTokenDecimals(dai.address, 18);
        tx = await xSwap.setTokenDecimals(tusd.address, 18);
    }

    it("test", async function () {
        await renewContract()

        const showLiquation = async function (note) {
            console.log("-------------------------------------------")
            console.log(note)
            console.log("usdx liquadation: ", f18(await xSwap.getTokenLiquidation(usdx.address)))
            console.log("usdt liquadation: ", f6(await xSwap.getTokenLiquidation(usdt.address)))
            console.log("pax liquadation: ", f18(await xSwap.getTokenLiquidation(pax.address)))
            console.log("usdc liquadation: ", f6(await xSwap.getTokenLiquidation(usdc.address)))
            console.log("dai liquadation: ", f18(await xSwap.getTokenLiquidation(dai.address)))
            console.log("tusd liquadation: ", f18(await xSwap.getTokenLiquidation(tusd.address)))
        }

        const showContractBalance = async function () {
            console.log("usdx userBalanceB_: ", f18(await usdx.balanceOf(xSwap.address)))
            console.log("usdt liquadation: ", f6(await usdt.balanceOf(xSwap.address)))
            console.log("pax liquadation: ", f18(await pax.balanceOf(xSwap.address)))
            console.log("usdc liquadation: ", f6(await usdc.balanceOf(xSwap.address)))
            console.log("dai liquadation: ", f18(await dai.balanceOf(xSwap.address)))
            console.log("tusd liquadation: ", f18(await tusd.balanceOf(xSwap.address)))
        }

        tx = await xSwap.setPrices(usdx.address, usdc.address, "1000000000000000000")
        tx = await xSwap.setPrices(usdc.address, usdx.address, "1000000000000000000")
        tx = await xSwap.setPrices(usdt.address, tusd.address, "1000000000000000000")
        tx = await xSwap.setPrices(tusd.address, usdt.address, "1000000000000000000")
        tx = await xSwap.setPrices(pax.address, dai.address,  "1000000000000000000")
        tx = await xSwap.setPrices(dai.address, pax.address,  "1000000000000000000")

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

        // approvex
        tx = await usdx.approvex(xSwap.address, {from: owner})
        tx = await usdt.approvex(xSwap.address, {from: owner})
        tx = await pax.approvex(xSwap.address, {from: owner})
        tx = await usdc.approvex(xSwap.address, {from: owner})
        tx = await dai.approvex(xSwap.address, {from: owner})
        tx = await tusd.approvex(xSwap.address, {from: owner})

        // transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (10000), {from: owner})
        tx = await xSwap.transferIn(usdt.address, d6 (10000), {from: owner})
        tx = await xSwap.transferIn(tusd.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(pax.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(dai.address, d18(10000), {from: owner})

        // transfer out
        tx = await xSwap.transferOut(usdx.address,owner ,d18(1000))
        tx = await xSwap.transferOut(usdc.address,owner ,d6 (1000))
        tx = await xSwap.transferOut(usdt.address,owner ,d6 (1000))
        tx = await xSwap.transferOut(tusd.address,owner ,d18(1000))
        tx = await xSwap.transferOut(pax.address,owner ,d18(1000))
        tx = await xSwap.transferOut(dai.address,owner ,d18(1000))

        // swap 
        // 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showLiquation("1000 usdx to usdc")

        // 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showLiquation("1000 usdc to usdx")

        // 1000 usdt to tusd
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdt.address, tusd.address, d6(1000), {from: user1})
        await showLiquation("1000 usdt to tusd")

        // 1000 tusd to usdt
        tx = await tusd.mint(user1, d18(1000))
        tx = await tusd.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(tusd.address, usdt.address, d18(1000), {from: user1})
        await showLiquation("1000 tusd to usdt")

        // close exchange
        tx = await xSwap.setPrices(usdx.address, usdc.address, "0")
        tx = await xSwap.setPrices(usdc.address, usdx.address, "0")
        tx = await xSwap.setPrices(usdt.address, tusd.address, "0")
        tx = await xSwap.setPrices(tusd.address, usdt.address, "0")
        tx = await xSwap.setPrices(pax.address, dai.address,  "0")
        tx = await xSwap.setPrices(dai.address, pax.address,  "0")

        // should fail if trade
        tx = await usdx.mint(user1, d18(100))
        try {
            await xSwap.trade(usdx.address, usdc.address, d18(100), {from: user1})
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }
        tx = await usdc.mint(user1, d6(100))
        try {
            await xSwap.trade(usdc.address, usdx.address, d6(100), {from: user1})
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        // open exchange
        tx = await xSwap.setPrices(usdx.address, usdc.address, "1000000000000000000")
        tx = await xSwap.setPrices(usdc.address, usdx.address, "1000000000000000000")
        tx = await xSwap.setPrices(usdt.address, tusd.address, "1000000000000000000")
        tx = await xSwap.setPrices(tusd.address, usdt.address, "1000000000000000000")
        tx = await xSwap.setPrices(pax.address, dai.address,  "1000000000000000000")
        tx = await xSwap.setPrices(dai.address, pax.address,  "1000000000000000000")

        // set lending 
        tx = await xSwap.enableLending(usdx.address)
        tx = await xSwap.enableLending(usdc.address)
        tx = await xSwap.enableLending(usdt.address)
        tx = await xSwap.enableLending(tusd.address)
        tx = await xSwap.enableLending(pax.address)
        await showLiquation("enable lending A, B, C, D, E")
        await showContractBalance()

        // transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (10000), {from: owner})
        tx = await xSwap.transferIn(usdt.address, d6 (10000), {from: owner})
        tx = await xSwap.transferIn(tusd.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(pax.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(dai.address, d18(10000), {from: owner})
        await showLiquation("transfer in")
        await showContractBalance() 
        
        // 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showLiquation("1000 usdx to usdc")
        await showContractBalance()


        // 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showLiquation("1000 usdc to usdx")
        await showContractBalance()

        // 1000 usdt to tusd
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdt.address, tusd.address, d6(1000), {from: user1})
        await showLiquation("1000 usdt to tusd")
        await showContractBalance()

        // 1000 tusd to usdt
        tx = await tusd.mint(user1, d18(1000))
        tx = await tusd.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(tusd.address, usdt.address, d18(1000), {from: user1})
        await showLiquation("1000 tusd to usdt")
        await showContractBalance()

        // disable A, B
        tx = await xSwap.disableLending(usdx.address)
        tx = await xSwap.disableLending(usdc.address)
        await showLiquation("disable lending A and B ")
        await showContractBalance()

        // 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showLiquation("1000 usdx to usdc")
        await showContractBalance()

        // 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showLiquation("1000 usdc to usdx")
        await showContractBalance()

        // stop trading, should fail if trading
        tx = await xSwap.emergencyStop(0)
        tx = await usdx.mint(user1, d18(100))
        try {
            await xSwap.trade(usdx.address, usdc.address, d18(100), {from: user1})
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }
        tx = await usdc.mint(user1, d6(100))
        try {
            await xSwap.trade(usdc.address, usdx.address, d6(100), {from: user1})
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        // re open
        tx = await xSwap.emergencyStop(1)

        // 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showLiquation("1000 usdx to usdc")
        await showContractBalance()

        // 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showLiquation("1000 usdc to usdx")
        await showContractBalance()

        // transfer out A: 2000, B: 2000
        tx = await xSwap.transferOut(usdx.address, owner, d18(2000))
        tx = await xSwap.transferOut(usdc.address, owner, d6(2000))
        await showLiquation("trasnfer out 2000 A and B")
        await showContractBalance()

        // transfer ALL
        tx = await xSwap.transferOutALL(usdx.address, owner)
        tx = await xSwap.transferOutALL(usdc.address, owner)
        await showLiquation("trasnfer out ALL A and B")
        await showContractBalance()

        // set A lending, disable B lending
        tx = await xSwap.enableLending(usdx.address)
        //tx = await xSwap.disableLending(usdc.address)
        await showLiquation("set A Lending, disable B Lending")
        await showContractBalance()

        // transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (10000), {from: owner})
        await showLiquation("transfer in")
        await showContractBalance()

        // transfer out A, B 1000 
        tx = await xSwap.transferOut(usdx.address, owner, d18(1000))
        tx = await xSwap.transferOut(usdc.address, owner, d6(1000))
        await showLiquation("trasnfer out 1000 A and B")
        await showContractBalance() 

        // transfer out ALL
        tx = await xSwap.transferOutALL(usdx.address, owner)
        tx = await xSwap.transferOutALL(usdc.address, owner)
        await showLiquation("trasnfer out ALL A and B")
        await showContractBalance() 

        // 45. transfer in 
        tx = await xSwap.transferIn(usdx.address, d18(10000), {from: owner})
        tx = await xSwap.transferIn(usdc.address, d6 (10000), {from: owner})
        await showLiquation("transfer in")
        await showContractBalance()     
    });
});
