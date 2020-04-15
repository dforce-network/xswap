pragma solidity ^0.5.4;

interface IUSR {
	function mint(address _dst, uint _pie) external;
    function burn(address _src, uint _wad) external;
    function redeem(address _src, uint _pie) external;

    function getExchangeRate() external view returns (uint);
    function getFixedInterestRate(uint _interval) external view returns (uint);
    function originationFee() external view returns (uint);
    function getRedeemAmount(uint _wad) external view returns (uint);
}