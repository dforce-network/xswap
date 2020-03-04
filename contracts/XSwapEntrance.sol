pragma solidity ^0.5.4;

import './DSLibrary/DSAuth.sol';

contract XSwapEntrance is DSAuth {
	address public currentImplement;

	function setImplement (address _xswap) external auth returns (bool) {
		currentImplement = _xswap;
		return true;
	}

	function getImplement () external view returns (address) {
		return currentImplement;
	}
}