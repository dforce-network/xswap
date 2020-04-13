pragma solidity ^0.5.4;

interface IPriceOracle {
	function assetPrices(address asset) external view returns (uint);
}