pragma solidity ^0.5.4;

interface IDispatcher {

	// external function
	function trigger() external returns (bool);
	function withdrawProfit() external returns (bool);
	function drainFunds(uint256 _index) external returns (bool);

	// get function
	function getReserve() external view returns (uint256);
	function getReserveRatio() external view returns (uint256);
	function getPrinciple() external view returns (uint256);
	function getBalance() external view returns (uint256);
	function getProfit() external view returns (uint256);
	function getTHPrinciple(uint256 _index) external view returns (uint256);
	function getTHBalance(uint256 _index) external view returns (uint256);
	function getTHProfit(uint256 _index) external view returns (uint256);
	function getToken() external view returns (address);
	function getFund() external view returns (address);

	function getTHStructures() external view returns (uint256[] memory, address[] memory, address[] memory);
	function getTHData(uint256 _index) external view returns (uint256, uint256, uint256, uint256);

	// 取得 target handler 數量
	function getTHCount() external view returns (uint256);

	// 取得第 _index 個 target handler 地址
	function getTHAddress(uint256 _index) external view returns (address);

	// 取得第 _index 個 target 地址
	function getTargetAddress(uint256 _index) external view returns (address);

	// 取得目標比例, 每四位數做分割
	function getPropotion() external view returns (uint256[] memory);

	// 取得收益對象地址
	function getProfitBeneficiary() external view returns (address);

	// 取得 reserve 比例上限
	function getReserveUpperLimit() external view returns (uint256);

	// 取得 reserve 比例下限
	function getReserveLowerLimit() external view returns (uint256);

	// 取得執行最小單位
	function getExecuteUnit() external view returns (uint256);

	// governmence function 
	function setAimedPropotion(uint256[] calldata _thPropotion) external returns (bool);
	function addTargetHandler(address _targetHandlerAddr) external returns (bool);
	function removeTargetHandler(address _targetHandlerAddr, uint256 _index) external returns (bool);
	function setProfitBeneficiary(address _profitBeneficiary) external returns (bool);
	function setReserveLowerLimit(uint256 _number) external returns (bool);
	function setReserveUpperLimit(uint256 _number) external returns (bool);
	function setExecuteUnit(uint256 _number) external returns (bool);
}
