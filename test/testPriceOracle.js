'use strict'
const BN = require('bn.js');
const XSwap = artifacts.require('XSwap')
const PriceOracle = artifacts.require('PriceOracle')
const DSToken = artifacts.require("DSToken")

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

    let priceOracle 
    let usdx, usdt, usdc, pax, dai, tusd, busd, husd, goldx
    let BASE = new BN(web3.utils.toWei('1', "ether"));

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
        
        goldx = await DSToken.new("0x474F4C44780000000000000000000000", 18)
        
        priceOracle = await PriceOracle.new(accounts[0], web3.utils.toWei('0.005', "ether"))
    }

    let scrollBlock  = async function (num) {
        for (let index = 0; index < num; index++) {
            await usdx.mint(user1, 1)
        }
    }

    it("test", async function () {
        await renewContract()


        await priceOracle.setPrice(usdc.address, "1000000000000000000000000000000")
        await priceOracle.setReaders(usdx.address, usdc.address)
        await priceOracle.setReaders(tusd.address, usdc.address)

        await priceOracle.setPrice(pax.address, "1000000000000000000")
        await priceOracle.setReaders(busd.address, pax.address)
        await priceOracle.setReaders(husd.address, pax.address)

        await priceOracle.setPrice(usdt.address, "1000000000000000000000000000000")
        await priceOracle.setPrice(dai.address, "1000000000000000000")
        await priceOracle.setPrice(goldx.address, "58031776048907822500")


        // await priceOracle._setMaxSwingForAsset(pax.address, "1000000000000000000")

        try {
            await priceOracle._setMaxSwingForAsset(pax.address, web3.utils.toWei('0.0001', "ether"))
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }

        try {
            await priceOracle._setMaxSwingForAsset(pax.address, web3.utils.toWei('0.11', "ether"))
            assert.fail('Expected revert not received');
        } catch (error) {
            const revertFound = error.message.search('revert') >= 0;
            assert(revertFound, `Expected "revert", got ${error} instead`)
        }
        
        await priceOracle._setMaxSwingForAsset(goldx.address, web3.utils.toWei('0.1', "ether"))
        let price = await priceOracle.assetPrices(goldx.address)
        await priceOracle.setPrice(goldx.address, web3.utils.toWei('80', "ether"))
        assert(price.mul(BASE.add(await priceOracle.maxSwings(goldx.address))).div(BASE).toString(), (await priceOracle.assetPrices(goldx.address)).toString())
        console.log((await priceOracle.assetPrices(goldx.address)).toString())

        price = await priceOracle.assetPrices(goldx.address)
        await priceOracle.setPrice(goldx.address, web3.utils.toWei('0.5', "ether"))
        assert(price.mul(BASE.sub(await priceOracle.maxSwings(goldx.address))).div(BASE).toString(), (await priceOracle.assetPrices(goldx.address)).toString())
        console.log((await priceOracle.assetPrices(goldx.address)).toString())
        
        price = await priceOracle.assetPrices(pax.address)
        await priceOracle.setPrice(pax.address, web3.utils.toWei('1.5', "ether"))
        assert(price.mul(BASE.add(await priceOracle.maxSwing())).div(BASE).toString(), (await priceOracle.assetPrices(pax.address)).toString())
        console.log((await priceOracle.assetPrices(pax.address)).toString())

        price = await priceOracle.assetPrices(pax.address)
        await priceOracle.setPrice(pax.address, web3.utils.toWei('0.5', "ether"))
        assert(price.mul(BASE.sub(await priceOracle.maxSwing())).div(BASE).toString(), (await priceOracle.assetPrices(dai.address)).toString())
        console.log((await priceOracle.assetPrices(pax.address)).toString())
        
        await scrollBlock(240)

        price = await priceOracle.assetPrices(goldx.address)
        await priceOracle.setPrice(goldx.address, web3.utils.toWei('80', "ether"))
        assert(price.mul(BASE.add(await priceOracle.maxSwings(goldx.address))).div(BASE).toString(), (await priceOracle.assetPrices(goldx.address)).toString())
        console.log((await priceOracle.assetPrices(goldx.address)).toString())

        price = await priceOracle.assetPrices(goldx.address)
        await priceOracle.setPrice(goldx.address, web3.utils.toWei('0.5', "ether"))
        assert(price.mul(BASE.sub(await priceOracle.maxSwings(goldx.address))).div(BASE).toString(), (await priceOracle.assetPrices(goldx.address)).toString())
        console.log((await priceOracle.assetPrices(goldx.address)).toString())
        
        price = await priceOracle.assetPrices(pax.address)
        await priceOracle.setPrice(pax.address, web3.utils.toWei('1.5', "ether"))
        assert(price.mul(BASE.add(await priceOracle.maxSwing())).div(BASE).toString(), (await priceOracle.assetPrices(pax.address)).toString())
        console.log((await priceOracle.assetPrices(pax.address)).toString())

        price = await priceOracle.assetPrices(pax.address)
        await priceOracle.setPrice(pax.address, web3.utils.toWei('0.5', "ether"))
        assert(price.mul(BASE.sub(await priceOracle.maxSwing())).div(BASE).toString(), (await priceOracle.assetPrices(dai.address)).toString())
        console.log((await priceOracle.assetPrices(pax.address)).toString())

        await scrollBlock(240)

        price = await priceOracle.assetPrices(goldx.address)
        await priceOracle.setPrice(goldx.address, web3.utils.toWei('80', "ether"))
        assert(price.mul(BASE.add(await priceOracle.maxSwings(goldx.address))).div(BASE).toString(), (await priceOracle.assetPrices(goldx.address)).toString())
        console.log((await priceOracle.assetPrices(goldx.address)).toString())

        price = await priceOracle.assetPrices(goldx.address)
        await priceOracle.setPrice(goldx.address, web3.utils.toWei('0.5', "ether"))
        assert(price.mul(BASE.sub(await priceOracle.maxSwings(goldx.address))).div(BASE).toString(), (await priceOracle.assetPrices(goldx.address)).toString())
        console.log((await priceOracle.assetPrices(goldx.address)).toString())
        
        price = await priceOracle.assetPrices(pax.address)
        await priceOracle.setPrice(pax.address, web3.utils.toWei('1.5', "ether"))
        assert(price.mul(BASE.add(await priceOracle.maxSwing())).div(BASE).toString(), (await priceOracle.assetPrices(pax.address)).toString())
        console.log((await priceOracle.assetPrices(pax.address)).toString())

        price = await priceOracle.assetPrices(pax.address)
        await priceOracle.setPrice(pax.address, web3.utils.toWei('0.5', "ether"))
        assert(price.mul(BASE.sub(await priceOracle.maxSwing())).div(BASE).toString(), (await priceOracle.assetPrices(dai.address)).toString())
        console.log((await priceOracle.assetPrices(pax.address)).toString())



    });
});
