pragma solidity ^0.5.4;

interface IDToken {
	function mint(address _dst, uint _pie) external;
    function burn(address _src, uint _wad) external;
    function redeem(address _src, uint _pie) external;

    function getTokenRealBalance(address _src) external view returns (uint);
    function getLiquidity() external view returns (uint);
    function token() external view returns (address);
}