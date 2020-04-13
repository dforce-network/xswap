pragma solidity ^0.5.4;

interface IChai {
	function join(address dst, uint wad) external;
	function exit(address dst, uint wad) external;
	function draw(address src, uint wad) external;
}

interface IPot {
    function chi() external view returns (uint256);
    function rho() external view returns (uint256);
    function dsr() external view returns (uint256);
    function drip() external returns (uint256);
    function join(uint256) external;
    function exit(uint256) external;
}