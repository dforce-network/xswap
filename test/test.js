'use strict'
const BN = require('bn.js');
const XSwap = artifacts.require('./XSwap.sol')
const DSAuth = artifacts.require('./DSAuth.sol')
const DSToken = artifacts.require("DSToken")

contract('test', function(accounts) {
    const owner = accounts[0]
    const admin = accounts[1]
    const user1 = accounts[2]

    let tx, senderBalance, fee, liquidity, tokens
    let usdx, usdt, pax, usdc, xSwap
    senderBalance = []
    liquidity = []
    tokens = []

    let updateToken = async function (tokenAddr) {
        let token = await DSToken.at(tokenAddr)
        senderBalance[tokenAddr] = await token.balanceOf.call(user1)
        liquidity[tokenAddr] = await token.balanceOf.call(xSwap.address)
    }

    let updateAndCheckUserBalance = async function(target, tokenAddr) {
        let token = await DSToken.at(tokenAddr)
        target = new BN(target)
        let oldSenderBalance = new BN(senderBalance[tokenAddr])
        senderBalance[tokenAddr] = new BN(await token.balanceOf.call(user1))
        let diff = senderBalance[tokenAddr].sub(oldSenderBalance).abs()
        assert.equal(diff.toString(), target.toString(), "check user balance fail")
    }

    let updateAndCheckLiquility = async function (target, tokenAddr) {
        let token = await DSToken.at(tokenAddr)
        target = new BN(target)
        let oldLiquility = new BN(liquidity[tokenAddr])
        liquidity[tokenAddr] = new BN(await token.balanceOf.call(xSwap.address))
        let diff = liquidity[tokenAddr].sub(oldLiquility).abs()
        assert.equal(diff.toString(), target.toString(), "check liquidity fail")
    }

    let renewContract = async function () {
        usdx = await DSToken.new("0x444600000000000000000000000000", 18)
        usdt = await DSToken.new("0x444600000000000000000000000000", 6)
        pax = await DSToken.new("0x444600000000000000000000000000", 18)
        usdc = await DSToken.new("0x444600000000000000000000000000", 6)
        xSwap = await XSwap.new(usdx.address)            
    }

    const d18 = function (amount) {
        amount = new BN(amount)
        return web3.utils.toWei(amount, "ether")
    }

    const d6 = function (amount) {
        amount = new BN(amount)
        return web3.utils.toWei(amount, "mwei")
    }

    const fromD18 = function (amount) {
        amount = new BN(amount)
        return amount.div(new BN(10).pow(18))
    }

    const fromD6 = function (amount) {
        amount = new BN(amount)
        return amount.div(new BN(10).pow(6))
    }

    it("case1", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdt.address, new BN(10 ** 12), new BN(30), new BN(30))
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdt.mint(xSwap.address, d6(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(usdt.address)
        tx = await xSwap.buyToken(d18(1000), usdt.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(1000), usdx.address)
        await updateAndCheckUserBalance(d6(997), usdt.address)
        await updateAndCheckLiquility(d18(1000), usdx.address)
        await updateAndCheckLiquility(d6(997), usdt.address) 
    })

    it("case2", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdt.address, new BN(10 ** 12), new BN(10), new BN(10))
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdt.mint(xSwap.address, d6(998.99))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        try {
          tx = await xSwap.buyToken(d18(1000), usdt.address, user1, {from: user1})
          assert.fail('Expected revert not received');
        } catch (error) {
          const revertFound = error.message.search('revert') >= 0;
          assert(revertFound, `Expected 'revert', got ${error} instead`);
        }        
    })

    it("case3", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdt.address, new BN(10 ** 12), new BN(10), new BN(10))
        tx = await usdx.mint(user1, d18(1000))
        tx = await usdt.mint(xSwap.address, d6(999))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(usdt.address)
        tx = await xSwap.buyToken(d18(1000), usdt.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(1000), usdx.address)
        await updateAndCheckUserBalance(d6(999), usdt.address)
        await updateAndCheckLiquility(d18(1000), usdx.address)
        await updateAndCheckLiquility(d6(999), usdt.address)
    })

    it("case4", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdt.address, new BN(10 ** 12), new BN(10), new BN(10))
        tx = await usdx.mint(xSwap.address, d18(998.99))
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        try {
          tx = await xSwap.sellToken(d6(1000), usdt.address, user1, {from: user1})
          assert.fail('Expected revert not received');
        } catch (error) {
          const revertFound = error.message.search('revert') >= 0;
          assert(revertFound, `Expected 'revert', got ${error} instead`);
        }        
    })

    it("case5", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdt.address, new BN(10 ** 12), new BN(10), new BN(10))
        tx = await usdx.mint(xSwap.address, d18(999))
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdt.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(usdt.address)
        tx = await xSwap.sellToken(d6(1000), usdt.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(999), usdx.address)
        await updateAndCheckUserBalance(d6(1000), usdt.address)
        await updateAndCheckLiquility(d18(999), usdx.address)
        await updateAndCheckLiquility(d6(1000), usdt.address)
    })

    it("case6", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdt.address, new BN(10 ** 12), new BN(20), new BN(20))
        tx = await usdx.mint(xSwap.address, d18(1000))
        tx = await usdt.mint(user1, d6(1000))
        tx = await usdt.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(usdt.address)
        tx = await xSwap.sellToken(d6(1000), usdt.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(998), usdx.address)
        await updateAndCheckUserBalance(d6(1000), usdt.address)
        await updateAndCheckLiquility(d18(998), usdx.address)
        await updateAndCheckLiquility(d6(1000), usdt.address)
    })

    it("case7", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await usdx.mint(user1, d18(1000))
        tx = await pax.mint(xSwap.address, d18(1000))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(pax.address)
        tx = await xSwap.buyToken(d18(1000), pax.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(999), pax.address)
        await updateAndCheckUserBalance(d18(1000), usdx.address)
        await updateAndCheckLiquility(d18(999), pax.address)
        await updateAndCheckLiquility(d18(1000), usdx.address)
    })

    it("case8", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await usdx.mint(user1, d18(1000))
        tx = await pax.mint(xSwap.address, d18(998.99))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        try {
          tx = await xSwap.buyToken(d18(1000), pax.address, user1, {from: user1})
          assert.fail('Expected revert not received');
        } catch (error) {
          const revertFound = error.message.search('revert') >= 0;
          assert(revertFound, `Expected 'revert', got ${error} instead`);
        }
    })

    it("case9", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await usdx.mint(user1, d18(1000))
        tx = await pax.mint(xSwap.address, d18(999))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(pax.address)
        tx = await xSwap.buyToken(d18(1000), pax.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(999), pax.address)
        await updateAndCheckUserBalance(d18(1000), usdx.address)
        await updateAndCheckLiquility(d18(999), pax.address)
        await updateAndCheckLiquility(d18(1000), usdx.address)
    })

    it("case10", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await usdx.mint(xSwap.address, d18(998.99))
        tx = await pax.mint(user1, d18(1000))
        tx = await pax.approvex(xSwap.address, {from: user1})

        try {
          tx = await xSwap.sellToken(d18(1000), pax.address, user1, {from: user1})
          assert.fail('Expected revert not received');
        } catch (error) {
          const revertFound = error.message.search('revert') >= 0;
          assert(revertFound, `Expected 'revert', got ${error} instead`);
        }
    })

    it("case11", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(20), new BN(20))
        tx = await usdx.mint(xSwap.address, d18(1000))
        tx = await pax.mint(user1, d18(1000))
        tx = await pax.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(pax.address)
        tx = await xSwap.sellToken(d18(1000), pax.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(998), usdx.address)
        await updateAndCheckUserBalance(d18(1000), pax.address)
        await updateAndCheckLiquility(d18(998), usdx.address)
        await updateAndCheckLiquility(d18(1000), pax.address)
    })

    it("case12", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await usdx.mint(xSwap.address, d18(999))
        tx = await pax.mint(user1, d18(1000))
        tx = await pax.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(pax.address)
        tx = await xSwap.sellToken(d18(1000), pax.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(999), usdx.address)
        await updateAndCheckUserBalance(d18(1000), pax.address)
        await updateAndCheckLiquility(d18(999), usdx.address)
        await updateAndCheckLiquility(d18(1000), pax.address)
    })

    it("case19", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdt.address, new BN(10 ** 12), new BN(10), new BN(10))
        tx = await usdt.mint(xSwap.address, d6(1000000))
        tx = await usdx.mint(user1, d18(1000000))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(usdt.address)
        tx = await xSwap.buyToken(d6(1000000), usdt.address, user1, {from: user1})
        await updateAndCheckUserBalance(d6(999000), usdt.address)
        await updateAndCheckUserBalance(d18(1000000), usdx.address)
        await updateAndCheckLiquility(d6(999000), usdt.address)
        await updateAndCheckLiquility(d18(1000000), usdx.address)
    })

    it("case20", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await pax.mint(xSwap.address, d18(1000000))
        tx = await usdx.mint(user1, d18(1000000))
        tx = await usdx.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(pax.address)
        tx = await xSwap.buyToken(d18(1000000), pax.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(999000), pax.address)
        await updateAndCheckUserBalance(d18(1000000), usdx.address)
        await updateAndCheckLiquility(d18(999000), pax.address)
        await updateAndCheckLiquility(d18(1000000), usdx.address)
    })

    it("case21", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await usdx.mint(xSwap.address, d18(1000000))
        tx = await pax.mint(user1, d18(1000000))
        tx = await pax.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(pax.address)
        tx = await xSwap.sellToken(d18(1000000), pax.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(999000), usdx.address)
        await updateAndCheckUserBalance(d18(1000000), pax.address)
        await updateAndCheckLiquility(d18(999000), usdx.address)
        await updateAndCheckLiquility(d18(1000000), pax.address)
    })

    it("case22", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdt.address, new BN(10 ** 12), new BN(10), new BN(10))
        tx = await usdx.mint(xSwap.address, d18(1000000))
        tx = await usdt.mint(user1, d6(1000000))
        tx = await usdt.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(usdt.address)
        tx = await xSwap.sellToken(d6(1000000), usdt.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(999000), usdx.address)
        await updateAndCheckUserBalance(d6(1000000), usdt.address)
        await updateAndCheckLiquility(d18(999000), usdx.address)
        await updateAndCheckLiquility(d6(1000000), usdt.address)
    })

    it("case23", async function () {
        await renewContract()
        tx = await xSwap.updatePair(usdc.address, new BN(10 ** 12), new BN(10), new BN(10))
        tx = await usdx.mint(xSwap.address, d18(1000000))
        tx = await usdc.mint(user1, d6(1000000))
        tx = await usdc.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(usdc.address)
        tx = await xSwap.sellToken(d6(1000000), usdc.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(999000), usdx.address)
        await updateAndCheckUserBalance(d6(1000000), usdc.address)
        await updateAndCheckLiquility(d18(999000), usdx.address)
        await updateAndCheckLiquility(d6(1000000), usdc.address)
    })

    it("case24", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await pax.mint(xSwap.address, d18(2))
        tx = await usdx.mint(user1, d18(1.000001))
        tx = await pax.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(pax.address)
        tx = await xSwap.sellToken(d18(1.000001), pax.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(1.000001 * 99.9 / 100), usdx.address)
        await updateAndCheckUserBalance(d18(1.000001), pax.address)
        await updateAndCheckLiquility(d18(1.000001 * 99.9 / 100), usdx.address)
        await updateAndCheckLiquility(d18(1.000001), pax.address)
    })

    it("case28", async function () {
        await renewContract()
        tx = await xSwap.updatePair(pax.address, new BN(1), new BN(10), new BN(10))
        tx = await pax.mint(xSwap.address, d18(2))
        tx = await usdx.mint(user1, d18(1.000001))
        tx = await pax.approvex(xSwap.address, {from: user1})

        await updateToken(usdx.address)
        await updateToken(pax.address)
        tx = await xSwap.sellToken(d18(1.000001), pax.address, user1, {from: user1})
        await updateAndCheckUserBalance(d18(1.000001 * 99.9 / 100), usdx.address)
        await updateAndCheckUserBalance(d18(1.000001), pax.address)
        await updateAndCheckLiquility(d18(1.000001 * 99.9 / 100), usdx.address)
        await updateAndCheckLiquility(d18(1.000001), pax.address)
    })
});
