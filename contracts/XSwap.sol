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

	address public lendFMe;
	bool public isOpen;
	mapping(address => mapping(address => uint256)) public prices; // 1 tokenA = ? tokenB
	mapping(address => mapping(address => uint256)) public fee;   // fee from tokenA to tokenB
	mapping(address => bool) public supportLending;
	mapping(address => uint256) public decimals;

	constructor(address _lendFMe) public {
		isOpen = true;
		lendFMe = _lendFMe;
	}

	function trade(address _input, address _output, uint256 _inputAmount) public {
		trade(_input, _output, _inputAmount, msg.sender);
	}

	function trade(address _input, address _output, uint256 _inputAmount, address _receiver) public {
		require(isOpen, "not open");
		require(prices[_input][_output] != 0, "invalid token address");
		require(decimals[_input] != 0, "input decimal not setteled");
		require(decimals[_output] != 0, "output decimal not setteled");
		IERC20Token(_input).transferFrom(msg.sender, address(this), _inputAmount);
		if(supportLending[_input]) {
			ILendFMe(lendFMe).supply(_input, _inputAmount);
		}
		uint256 _tokenAmount = normalizeToken(_input, _inputAmount) * prices[_input][_output] / OFFSET;
		uint256 _fee = _tokenAmount * fee[_input][_output] / OFFSET;
		uint256 _amountToUser = _tokenAmount - _fee;

		if(supportLending[_output]) {
			ILendFMe(lendFMe).withdraw(_output, denormalizedToken(_output, _amountToUser));
		}
		IERC20Token(_output).transfer(_receiver, denormalizedToken(_output, _amountToUser));
	}

	function getTokenLiquidation(address _token) public view returns (uint256) {
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
		IERC20Token(_token).approve(lendFMe, 0);
		ILendFMe(lendFMe).withdraw(_token, uint256(-1));
	}

	function createPair(address _input, address _output, uint256 _priceInOut, uint256 _priceOutIn, uint256 _fee) external auth {
		setPrices(_input, _output, _priceInOut, _priceOutIn);
		setFee(_input, _output, _fee);
	}

	function setPrices(address _input, address _output, uint256 _priceInOut, uint256 _priceOutIn) public auth {
		setPrices(_input, _output, _priceInOut);
		setPrices(_output, _input, _priceOutIn);		
	}

	function setPrices(address _input, address _output, uint256 _price) public auth {
		prices[_input][_output] = _price;
	}

	function setFee(address _input, address _output, uint256 _fee) public auth {
		fee[_input][_output] = _fee;
		fee[_output][_input] = _fee;
	}

	function setTokenDecimals(address _token, uint256 _decimals) public auth {
		require(_decimals <= 18);
		decimals[_token] = _decimals;
	}

	function emergencyStop(bool _open) external auth {
		isOpen = _open;
	}

	function transferOut(address _token, address _receiver, uint256 _amount) auth external returns (bool) {
		if(supportLending[_token]) {
			ILendFMe(lendFMe).withdraw(_token, _amount);		
		}
		uint256 _balance = IERC20Token(_token).balanceOf(address(this));
		if(_balance >= _amount) {
			IERC20Token(_token).transfer(_receiver, _amount);
			return true;
		}
		return false;
	}

	function transferOutALL(address _token, address _receiver) auth external returns (bool) {
		if(supportLending[_token]) {
			ILendFMe(lendFMe).withdraw(_token, uint256(-1));		
		}
		uint256 _balance = IERC20Token(_token).balanceOf(address(this));
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

	function normalizeToken(address _token, uint256 _amount) internal returns (uint256) {
		return _amount * (10 ** (18 - decimals[_token]));
	}

	function denormalizedToken(address _token, uint256 _amount) internal returns (uint256) {
		return _amount / (10 ** (18 - decimals[_token]))
		;
	}
}
