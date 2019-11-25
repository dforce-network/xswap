pragma solidity ^0.5.4;

import './DSAuth.sol';

interface IERC20Token {
    function balanceOf(address _owner) external view returns (uint);
    function allowance(address _owner, address _spender) external view returns (uint);
    function transfer(address _to, uint _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function approve(address _spender, uint _value) external returns (bool success);
    function totalSupply() external view returns (uint);
}

library DSMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x, "ds-math-add-overflow");
    }
    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x, "ds-math-sub-underflow");
    }
    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }
}

contract XSwap is DSAuth {
	using DSMath for uint256;

	uint256 constant internal OFFSET = 10000; 

	address public usdx;
	address public owner;
	bool public isOpen;
	mapping(address => uint256) public price; // 1 token = ? usdx
	mapping(address => uint256) public sellRate; // offset 10^4
	mapping(address => uint256) public buyRate;  // offset 10^4

	constructor(address _usdx) public {
		usdx = _usdx;
		owner = msg.sender;
		isOpen = true;
	}

	function sellToken(uint256 _tokenAmount, address _tokenAddr) external {
		sellToken(_tokenAmount, _tokenAddr, msg.sender);
	}

	function buyToken(uint256 _tokenAmount, address _tokenAddr) external {
		buyToken(_tokenAmount, _tokenAddr, msg.sender);
	}

	// sell token to get usdx
	function sellToken(uint256 _tokenAmount, address _tokenAddr, address _receiver) public {
		require(isOpen, "not open");
		require(price[_tokenAddr]!= 0 && sellRate[_tokenAddr] != 0, "invalid token address");
		require(IERC20Token(_tokenAddr).transferFrom(msg.sender, address(this), _tokenAmount), "approve or balance not enough");
		uint256 _usdxAmount = _tokenAmount.mul(price[_tokenAddr]);
		uint256 _fee = _usdxAmount.mul(sellRate[_tokenAddr]) / OFFSET;
		require(IERC20Token(usdx).transfer(_receiver, _usdxAmount.sub(_fee)));
	}

	// use usdx to buy token
	function buyToken(uint256 _usdxAmount, address _tokenAddr, address _receiver) public {
		require(isOpen, "not open");
		require(price[_tokenAddr]!= 0, "invalid token address");
		require(buyRate[_tokenAddr] != 0, "invalid token address");
		require(IERC20Token(usdx).transferFrom(msg.sender, address(this), _usdxAmount), "approve or balance not enough");
		uint256 _tokenAmount = _usdxAmount / price[_tokenAddr];
		uint256 _fee = _tokenAmount.mul(buyRate[_tokenAddr]) / OFFSET;
		require(IERC20Token(_tokenAddr).transfer(_receiver, _tokenAmount.sub(_fee)));
	}

	function updatePair(address _tokenAddr, uint256 _price, uint256 _sellRate, uint256 _buyRate) external auth {
		price[_tokenAddr] = _price;
		sellRate[_tokenAddr] = _sellRate;
		buyRate[_tokenAddr] = _buyRate;
	}

	function updatePrice(address _tokenAddr, uint256 _price) external auth {
		price[_tokenAddr] = _price;
	}

	function updateSellRate(address _tokenAddr, uint256 _sellRate) external auth {
		sellRate[_tokenAddr] = _sellRate;
	}

	function updateBuyRate(address _tokenAddr, uint256 _buyRate) external auth {
		buyRate[_tokenAddr] = _buyRate;
	}

	function emergencyStop(bool _open) external auth {
		isOpen = _open;
	}

	function transferOut(address _tokenAddr, address _receiver, uint256 _amount) auth external returns (bool) {
		return IERC20Token(_tokenAddr).transfer(_receiver, _amount);
	}
}
