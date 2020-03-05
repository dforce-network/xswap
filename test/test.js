'use strict'
const BN = require('bn.js');
const XSwap = artifacts.require('XSwap')
const DSAuth = artifacts.require('DSAuth')
const DSToken = artifacts.require("DSToken")
var DSGuard = artifacts.require("DSGuard")
const FakeLendFMe = artifacts.require("FakeLendFMe")

contract('test', function(accounts) {
    const owner = accounts[0]
    const admin = accounts[1]
    const user1 = accounts[2]

    let tx, userBalance
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

        const showLiquidation = async function (note) {
            console.log("-------------------------------------------")
            console.log(note)
            console.log("usdx liquadation: ", f18(await xSwap.getTokenLiquidation(usdx.address)))
            console.log("usdc liquadation: ", f6(await xSwap.getTokenLiquidation(usdc.address)))
            console.log("usdt liquadation: ", f6(await xSwap.getTokenLiquidation(usdt.address)))
            console.log("tusd liquadation: ", f18(await xSwap.getTokenLiquidation(tusd.address)))
            console.log("pax  liquadation: ", f18(await xSwap.getTokenLiquidation(pax.address)))
            console.log("dai  liquadation: ", f18(await xSwap.getTokenLiquidation(dai.address)))
        }

        const showABLiquidation = async function (note) {
            console.log("-------------------------------------------")
            console.log(note)
            console.log("usdx liquadation: ", f18(await xSwap.getTokenLiquidation(usdx.address)))
            console.log("usdc liquadation: ", f6(await xSwap.getTokenLiquidation(usdc.address)))
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

        await showLiquidation("init")

        // swap 
        // 1. 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showLiquidation("1. 1000 usdx to usdc")

        // 2. 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showLiquidation("2. 1000 usdc to usdx")

        // 3. 1000 usdt to tusd
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdt.address, tusd.address, d6(1000), {from: user1})
        await showLiquidation("3. 1000 usdt to tusd")

        // 4. 1000 tusd to usdt
        tx = await tusd.mint(user1, d18(1000))
        tx = await tusd.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(tusd.address, usdt.address, d18(1000), {from: user1})
        await showLiquidation("4. 1000 tusd to usdt")

        // 5. 1000 pax to dai
        tx = await pax.mint(user1, d18(1000))
        tx = await pax.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(pax.address, dai.address, d18(1000), {from: user1})
        await showLiquidation("5. 1000 pax to dai")
        await showContractBalance()

        // 6. 1000 dai to pax
        tx = await dai.mint(user1, d18(1000))
        tx = await dai.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(dai.address, pax.address, d18(1000), {from: user1})
        await showLiquidation("6. 1000 dai to pax")
        await showContractBalance()

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

        // 7. set lending 
        tx = await xSwap.enableLending(usdx.address)
        tx = await xSwap.enableLending(usdc.address)
        tx = await xSwap.enableLending(usdt.address)
        tx = await xSwap.enableLending(tusd.address)
        tx = await xSwap.enableLending(pax.address)
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
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showLiquidation("10. 1000 usdx to usdc")
        await showContractBalance()

        // 11. 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showLiquidation("11. 1000 usdc to usdx")
        await showContractBalance()

        // 12. 1000 usdt to tusd
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdt.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdt.address, tusd.address, d6(1000), {from: user1})
        await showLiquidation("12. 1000 usdt to tusd")
        await showContractBalance()

        // 13. 1000 tusd to usdt
        tx = await tusd.mint(user1, d18(1000))
        tx = await tusd.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(tusd.address, usdt.address, d18(1000), {from: user1})
        await showLiquidation("13. 1000 tusd to usdt")
        await showContractBalance()

        // 14. 1000 pax to dai
        tx = await pax.mint(user1, d18(1000))
        tx = await pax.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(pax.address, dai.address, d18(1000), {from: user1})
        await showLiquidation("14. 1000 pax to dai")
        await showContractBalance()

        // 15. 1000 dai to pax
        tx = await dai.mint(user1, d18(1000))
        tx = await dai.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(dai.address, pax.address, d18(1000), {from: user1})
        await showLiquidation("15. 1000 dai to pax")
        await showContractBalance()

        // 16. disable A, B
        tx = await xSwap.disableLending(usdx.address)
        tx = await xSwap.disableLending(usdc.address)
        await showLiquidation("16. disable lending A(usdx) and B(usdc) ")
        await showContractBalance()

        // 17. 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showLiquidation("17. 1000 usdx to usdc")
        await showContractBalance()

        // 18. 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showLiquidation("18. 1000 usdc to usdx")
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

        // 19. 1000 usdx to swap usdc
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showLiquidation("19. 1000 usdx to usdc")
        await showContractBalance()

        // 20. 1000 usdc change usdx
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
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
        tx = await xSwap.enableLending(usdx.address)
        //tx = await xSwap.disableLending(usdc.address)
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
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("28. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 29. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)        
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showABLiquidation("29. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set AB ratio
        tx = await xSwap.setPrices(usdx.address, usdc.address, "999900000000000000")
        tx = await xSwap.setPrices(usdc.address, usdx.address, "10001000000000000000")

        // 30. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("30. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 31. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(100))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(100), {from: user1})
        await showABLiquidation("31. 100 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // 32. disable usdx 
        tx = await xSwap.disableLending(usdx.address)
        await showABLiquidation("32. disable usdx")
        await showABContractBalance()

        // 33. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("33. after disable usdx lending, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 34. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(100))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(100), {from: user1})
        await showABLiquidation("34. after disable usdx lending, 100 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set rate
        tx = await xSwap.setPrices(usdx.address, usdc.address, "110000000000000000")
        tx = await xSwap.setPrices(usdc.address, usdx.address, "1001000000000000000")

        // 34.5 enable usdx lending 
        tx = await xSwap.enableLending(usdx.address)
        await showABLiquidation("34.5 enable usdx")
        await showABContractBalance()

        // 35. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("35. after ratio reset, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 36. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showABLiquidation("36. after ratio reset, 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set AB fee to 0
        tx = await xSwap.setFee(usdc.address, usdx.address,"0")

        // should fail if swap between A and B
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

        // set AB fee to 999,000,000,000,000,000
        tx = await xSwap.setFee(usdc.address, usdx.address, "999000000000000000")

        // 37. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("37.after reset A/B fee, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 38. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showABLiquidation("38.after reset A/B fee, 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // 39. set A no lending, B lending
        tx = await xSwap.disableLending(usdx.address)
        tx = await xSwap.enableLending(usdc.address)
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

        // 43. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("43. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 44. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showABLiquidation("44. 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set rate
        tx = await xSwap.setPrices(usdx.address, usdc.address, "999900000000000000")
        tx = await xSwap.setPrices(usdc.address, usdx.address, "10001000000000000000")

        // 45. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("45. after reset rate, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 46. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showABLiquidation("46. after reset rate, 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // 47. disable usdc
        tx = await xSwap.disableLending(usdc.address)
        await showABLiquidation("47. disable usdc")
        await showABContractBalance() 

        // 48. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("48. 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 49. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showABLiquidation("49. 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set rate
        tx = await xSwap.setPrices(usdx.address, usdc.address, "110000000000000000")
        tx = await xSwap.setPrices(usdc.address, usdx.address, "1001000000000000000")

        // 49.5 enable usdc
        tx = await xSwap.enableLending(usdc.address)
        await showABLiquidation("49.5 enable usdc")
        await showABContractBalance()

        // 50. swap A to B 909.090909,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(909.090909), {from: user1})
        await showABLiquidation("50. after reset rate, 909.090909 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 51. swap B to A 99.9000999, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(99.9000999), {from: user1})
        await showABLiquidation("51. after reset rate, 99.9000999 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance)

        // set A/B fee to 0
        tx = await xSwap.setFee(usdc.address, usdx.address, "0")

        // 52. swap A to B 1000,  usdx to usdc
        userBalance = await usdc.balanceOf(user1)
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdx.address, usdc.address, d18(1000), {from: user1})
        await showABLiquidation("52. after set fee to 0, 1000 usdx to usdc")
        await showABContractBalance()
        await userDiff(usdc, userBalance)

        // 53. swap B to A 1000, usdc to usdx
        userBalance = await usdx.balanceOf(user1)
        tx = await usdc.mint(user1, d6(1000))
        tx = await usdc.approvex(xSwap.address, {from: user1})
        tx = await xSwap.trade(usdc.address, usdx.address, d6(1000), {from: user1})
        await showABLiquidation("53.after set fee to 0, 1000 usdc to usdx")
        await showABContractBalance()
        await userDiff(usdx, userBalance) 
    });
});
