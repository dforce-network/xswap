
# xSwap

## To check on the maximum amount available for swap in one transaction:

- **1). Call contract function `getLiquidity(tokenAddress)`:**
    Get the real-time balance of a particular asset

- **2). Call contract function `getAmountByOutput(inputAsset, outputAsset, outputAmount)`:**
    Get the real-time balance of the `inputAsset` by providing `outputAmount ` of the `outputAsset`

**eg:** To check on the maximum amount available of each asset for swap in respond to the trading request of “USDC-USDT”.
First, get the real-time balance of `USDT` by calling the function `getLiquidity(USDT_Address)`, for instance, let’s assume there are `10000` USDT sitting in the balance. Secondly, call the function `getAmountByOutput(USDC_Address, USDT_Address, 10000)` to get the real-time balance of USDC which is available for instant swap.

## Mainnet Contract Address(2020-05-26)

<table>
	<tr>
   		<th>Contract Name</th>
    	<th>Contract Address</th>
	</tr>
	<tr>
		<td> xSwap Proxy </td>
		<td> 0x03eF3f37856bD08eb47E2dE7ABc4Ddd2c19B60F2 </td>
	</tr>
	<tr>
		<td> BUSD </td>
		<td> 0x4Fabb145d64652a948d72533023f6E7A623C7C53  </td>
	</tr>
	<tr>
		<td> DAI </td>
		<td> 0x6B175474E89094C44Da98b954EedeAC495271d0F </td>
	</tr>
	<tr>
		<td> HUSD </td>
		<td> 0xdF574c24545E5FfEcb9a659c229253D4111d87e1 </td>
	</tr>
	<tr>
		<td> PAX </td>
		<td> 0x8E870D67F660D95d5be530380D0eC0bd388289E1 </td>
	</tr>
	<tr>
		<td> TUSD </td>
		<td> 0x0000000000085d4780B73119b644AE5ecd22b376 </td>
	</tr>
	<tr>
		<td> USDC </td>
		<td> 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 </td>
	</tr>
	<tr>
		<td> USDT </td>
		<td> 0xdAC17F958D2ee523a2206206994597C13D831ec7 </td>
	</tr>
	<tr>
		<td> USDx </td>
		<td> 0xeb269732ab75A6fD61Ea60b06fE994cD32a83549 </td>
	</tr>
	<tr>
		<td> DSGuard </td>
		<td> 0x9121D140fff2660f72f1fbeD92e7f66A11014d6C </td>
	</tr>
</table>

## Rinkeby Contract Address(2020-05-10)

<table>
	<tr>
   		<th>Contract Name</th>
    	<th>Contract Address</th>
	</tr>
	<tr>
		<td> xSwap Proxy </td>
		<td> 0x076CCd4c0025B0E89a1D6b6B33B781A0795Dc3c5 </td>
	</tr>
	<tr>
		<td> BUSD </td>
		<td> 0xBB4EeFbE28440D27D18e4269962bE2506366c476  </td>
	</tr>
	<tr>
		<td> DAI </td>
		<td> 0xA3A59273494BB5B8F0a8FAcf21B3f666A47d6140 </td>
	</tr>
	<tr>
		<td> HUSD </td>
		<td> 0x0D518472330FF1D943881BBBDda03b221A7F9F74 </td>
	</tr>
	<tr>
		<td> PAX </td>
		<td> 0x722E6238335d89393A42e2cA316A5fb1b8B2EB55 </td>
	</tr>
	<tr>
		<td> TUSD </td>
		<td> 0xe72a3181f69Eb21A19bd4Ce19Eb68FDb333d74c6 </td>
	</tr>
	<tr>
		<td> USDC </td>
		<td> 0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b </td>
	</tr>
	<tr>
		<td> USDT </td>
		<td> 0xaa74B62f737bbA1D2E520F9ec38Fc23b6E6817df </td>
	</tr>
	<tr>
		<td> USDx </td>
		<td> 0xD96cC7f80C1cb595eBcdC072531e1799B3a2436E </td>
	</tr>
	<tr>
		<td> DSGuard </td>
		<td> 0x694D5D8DeDFeaff6498e5A8763e0748C85cfeFC7 </td>
	</tr>
</table>


### Run test

```
npm install
truffle test
```
