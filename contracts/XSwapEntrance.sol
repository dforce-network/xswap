pragma solidity ^0.5.4;

import './DSLibrary/DSAuth.sol';

contract XSwapEntrance is DSAuth {
	address public currentImplement;

	function setImplement (address _xswap) auth external {
		currentImplement = _xswap;
	}
}
