pragma solidity ^0.5.4;

import './DSAuth.sol';
import './IDispatcher.sol';

interface IERC20Token {
    function balanceOf(address _owner) external view returns (uint);
    function allowance(address _owner, address _spender) external view returns (uint);
    function transfer(address _to, uint _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function approve(address _spender, uint _value) external returns (bool success);
    function totalSupply() external view returns (uint);
}

interface ILendFMe {
	function supply(address _token, uint _amounts) external returns (uint);
	function withdraw(address _token, uint _amounts) external returns (uint);
	function getSupplyBalance(address _user, address _token) external view returns (uint256);
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

	uint256 constant internal OFFSET = 10 ** 18;

	address public owner;
	address public lendFMe;
	bool public isOpen;
	mapping(address => mapping(address => uint256)) public prices; // 1 tokenA = ? tokenB
	mapping(address => mapping(address => uint256)) public fee;   // fee from tokenA to tokenB
	mapping(address => bool) public supportLending;

	constructor() public {
		owner = msg.sender;
		isOpen = true;
	}

	function trade(address _input, address _output, uint256 _inputAmount) public {
		trade(_input, _output, _inputAmount, msg.sender);
	}

	function trade(address _input, address _output, uint256 _inputAmount, address _receiver) public {
		require(isOpen, "not open");
		require(prices[_input][_output] != 0, "invalid token address");
		IERC20Token(_input).transferFrom(msg.sender, address(this), _inputAmount);
		if(supportLending[_input]) {
			ILendFMe(lendFMe).supply(_input, _inputAmount);
		}
		
		uint256 _tokenAmount = _inputAmount * OFFSET / prices[_input][_output];
		uint256 _fee = _tokenAmount * fee[_input][_output] / OFFSET;
		uint256 _amountToUser = _tokenAmount - _fee;
		if(supportLending[_output]) {
			ILendFMe(lendFMe).withdraw(_output, _amountToUser);
		}
		IERC20Token(_output).transfer(_receiver, _amountToUser);
	}

	function getTokenBalance(address _token) public returns (uint256) {
		uint256 balanceInDefi = ILendFMe(lendFMe).getSupplyBalance(address(this), _token);
		return balanceInDefi + IERC20Token(_token).balanceOf(address(this));
	}

	function setLendFMe(address _lendFMe) public auth {
		lendFMe = _lendFMe;
	}

	function enableLending(address _token) public auth {
		require(!supportLending[_token], "the token is already supported lending");
		supportLending[_token] = true;
		IERC20Token(_token).approve(lendFMe, uint256(-1));
		uint256 _balance = IERC20Token(_token).balanceOf(address(this));
		if(_balance > 0) {
			ILendFMe(lendFMe).supply(_token, _balance);
		}
	}

	function disableLending(address _token) public auth {
		require(supportLending[_token], "the token doesnt support lending");
		supportLending[_token] = false;
		uint256 _balance = ILendFMe(lendFMe).getSupplyBalance(address(this), _token);
		if(_balance > 0) {
			ILendFMe(lendFMe).withdraw(_token, _balance);
		}
	}

	function setPrices(address _input, address _output, uint256 _price) external auth {
		prices[_input][_output] = _price;
	}

	function setFee(address _input, address _output, uint256 _fee) external auth {
		prices[_input][_output] = _fee;
		prices[_output][_input] = _fee;
	}

	function emergencyStop(bool _open) external auth {
		isOpen = _open;
	}

	function transferOut(address _token, address _receiver) auth external returns (bool) {
		uint256 _balance = IERC20Token(_token).balanceOf(address(this));
		if(supportLending[_token]) {
			_balance = ILendFMe(lendFMe).getSupplyBalance(address(this), _token);
			if(_balance > 0) {
				ILendFMe(lendFMe).withdraw(_token, _balance);
			}
		}
		if(_balance > 0) {
			IERC20Token(_token).transfer(_receiver, _balance);
		}

		return true;
	}
	
	function transferIn(address _token, uint256 _amount) auth external returns (bool) {
		IERC20Token(_token).transferFrom(msg.sender, address(this), _amount);
		if(supportLending[_token]) {
			ILendFMe(lendFMe).supply(_token, IERC20Token(_token).balanceOf(address(this)));
		}
	    return true;
	}
}
