pragma solidity ^0.5.4;

import './DSLibrary/DSAuth.sol';
import './interface/IERC20Token.sol';
import './interface/ILendFMe.sol';

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
    function div(uint x, uint y) internal pure returns (uint z) {
        require(y > 0, "ds-math-div-overflow");
        z = x / y;
    }
}

contract XSwap is DSAuth {
	using DSMath for uint256;

	uint256 constant internal OFFSET = 10 ** 18;

	bool private actived;
	address public lendFMe;
	bool public isOpen;
	mapping(address => mapping(address => uint256)) public prices; // 1 tokenA = ? tokenB
	mapping(address => mapping(address => uint256)) public fee;   // fee from tokenA to tokenB
	mapping(address => bool) public supportLending;
	mapping(address => uint256) public decimals;

	constructor() public {
	}

	function active(address _lendFMe) public {
		require(actived == false, "already actived.");
		owner = msg.sender;
		isOpen = true;
		lendFMe = _lendFMe;
		actived = true;
	}

	// trade _inputAmount of _input token to get _output token
	function trade(address _input, address _output, uint256 _inputAmount) public returns (bool) {
		return trade(_input, _output, _inputAmount, msg.sender);
	}

	function trade(address _input, address _output, uint256 _inputAmount, address _receiver) public returns (bool) {
		require(isOpen, "not open");
		require(prices[_input][_output] != 0, "invalid token address");
		require(decimals[_input] != 0, "input decimal not setteled");
		require(decimals[_output] != 0, "output decimal not setteled");
		NonStandardIERC20Token(_input).transferFrom(msg.sender, address(this), _inputAmount);
		if(supportLending[_input]) {
			ILendFMe(lendFMe).supply(_input, _inputAmount);
		}
		uint256 _tokenAmount = normalizeToken(_input, _inputAmount).mul(prices[_input][_output]).div(OFFSET);
		uint256 _fee = _tokenAmount.mul(fee[_input][_output]).div(OFFSET);
		uint256 _amountToUser = _tokenAmount.sub(_fee);

		if(supportLending[_output]) {
			ILendFMe(lendFMe).withdraw(_output, denormalizedToken(_output, _amountToUser));
		}
		NonStandardIERC20Token(_output).transfer(_receiver, denormalizedToken(_output, _amountToUser));
		return true;
	}

	function getTokenLiquidation(address _token) public view returns (uint256) {
		uint256 balanceInDefi = ILendFMe(lendFMe).getSupplyBalance(address(this), _token);
		return balanceInDefi.add(NonStandardIERC20Token(_token).balanceOf(address(this)));
	}

	function setLendFMe(address _lendFMe) public auth returns (bool) {
		lendFMe = _lendFMe;
		return true;
	}

	function enableLending(address _token) public auth returns (bool) {
		require(!supportLending[_token], "the token is already supported lending");
		supportLending[_token] = true;
		if (NonStandardIERC20Token(_token).allowance(address(this), lendFMe) == 0)
			NonStandardIERC20Token(_token).approve(lendFMe, uint256(-1));
		uint256 _balance = NonStandardIERC20Token(_token).balanceOf(address(this));
		if(_balance > 0) {
			ILendFMe(lendFMe).supply(_token, _balance);
		}
		return true;
	}

	function disableLending(address _token) public auth returns (bool) {
		require(supportLending[_token], "the token doesnt support lending");
		supportLending[_token] = false;
		// NonStandardIERC20Token(_token).approve(lendFMe, 0);
		ILendFMe(lendFMe).withdraw(_token, uint256(-1));
		return true;
	}

	// create new pairs
	function createPair(address _input, address _output, uint256 _priceInOut, uint256 _priceOutIn, uint256 _fee) external auth returns (bool) {
		setPrices(_input, _output, _priceInOut, _priceOutIn);
		setFee(_input, _output, _fee);
		return true;
	}

	function setPrices(address _input, address _output, uint256 _priceInOut, uint256 _priceOutIn) public auth returns (bool) {
		setPrices(_input, _output, _priceInOut);
		setPrices(_output, _input, _priceOutIn);
		return true;
	}

	function setPrices(address _input, address _output, uint256 _price) public auth returns (bool) {
		prices[_input][_output] = _price;
		return true;
	}

	function setFee(address _input, address _output, uint256 _fee) public auth returns (bool) {
		fee[_input][_output] = _fee;
		fee[_output][_input] = _fee;
		return true;
	}

	function setTokenDecimals(address _token, uint256 _decimals) public auth returns (bool){
		require(_decimals <= 18, "not supported decimal");
		decimals[_token] = _decimals;
		return true;
	}

	function emergencyStop(bool _open) external auth returns (bool) {
		isOpen = _open;
		return true;
	}

	function transferOut(address _token, address _receiver, uint256 _amount) external auth returns (bool) {
		if(supportLending[_token]) {
			ILendFMe(lendFMe).withdraw(_token, _amount);
		}
		uint256 _balance = NonStandardIERC20Token(_token).balanceOf(address(this));
		if(_balance >= _amount) {
			NonStandardIERC20Token(_token).transfer(_receiver, _amount);
			return true;
		}
		return false;
	}

	function transferOutALL(address _token, address _receiver) external auth returns (bool) {
		if(supportLending[_token]) {
			ILendFMe(lendFMe).withdraw(_token, uint256(-1));
		}
		uint256 _balance = NonStandardIERC20Token(_token).balanceOf(address(this));
		if(_balance > 0) {
			NonStandardIERC20Token(_token).transfer(_receiver, _balance);
		}

		return true;
	}

	function transferIn(address _token, uint256 _amount) external auth returns (bool) {
		NonStandardIERC20Token(_token).transferFrom(msg.sender, address(this), _amount);
		if(supportLending[_token]) {
			ILendFMe(lendFMe).supply(_token, NonStandardIERC20Token(_token).balanceOf(address(this)));
		}
	    return true;
	}

	function normalizeToken(address _token, uint256 _amount) internal view returns (uint256) {
		uint256 n = 18;
		return _amount.mul((10 ** (n.sub(decimals[_token]))));
	}

	function denormalizedToken(address _token, uint256 _amount) internal view returns (uint256) {
		uint256 n = 18;
		return _amount.div((10 ** (n.sub(decimals[_token]))));
	}
}