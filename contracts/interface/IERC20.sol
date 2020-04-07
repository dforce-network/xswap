pragma solidity ^0.5.4;

interface IERC20 {
    function transfer(address _to, uint _value) external;
    function transferFrom(address _from, address _to, uint _value) external;
    function approve(address _spender, uint _value) external;
    function balanceOf(address account) external view returns (uint);
	function allowance(address _owner, address _spender) external view returns (uint);
    function decimals() external view returns (uint);
}