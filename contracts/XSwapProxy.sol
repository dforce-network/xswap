pragma solidity ^0.5.4;

import './upgradeability/AdminUpgradeabilityProxy.sol';

contract XSwapProxy is AdminUpgradeabilityProxy {
    bytes _data;
    constructor(address _implementation) public AdminUpgradeabilityProxy(_implementation, msg.sender, _data) {
    }
}