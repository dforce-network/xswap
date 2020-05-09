pragma solidity ^0.5.4;

import './interface/IDToken.sol';
import './interface/IPriceOracle.sol';
import './DSLibrary/DSMath.sol';
import './DSLibrary/DSAuth.sol';
import './DSLibrary/ReentrancyGuard.sol';
import './DSLibrary/ERC20SafeTransfer.sol';

contract XSwap is DSAuth, ReentrancyGuard, ERC20SafeTransfer {
	using DSMath for uint;

	uint constant internal OFFSET = 10 ** 18;
	bool private actived;

	address public oracle;
	mapping(address => mapping(address => uint)) public fee;   // fee from tokenA to tokenB

	bool public isOpen;
	mapping(address => bool) public tokensEnable; // 1 tokenA = ? tokenB
	mapping(address => mapping(address => bool)) public tradesDisable; // 1 tokenA = ? tokenB

	mapping(address => address) public supportDToken;
	mapping(address => address) public freeDToken;

	event Swap(
		address from,
		address to,
		address input,
		uint inputAmount,
		uint inputPrice,
		address output,
		uint outputAmount,
		uint outputPrice
	);

	constructor() public {
	}

	function active(address _oracle) external {
		require(actived == false, "already actived.");
		owner = msg.sender;
		isOpen = true;
		oracle = _oracle;
		notEntered = true;
		actived = true;
	}

	function setOracle(address _oracle) external auth {
		oracle = _oracle;
	}

	function setFee(address _input, address _output, uint _fee) external auth {
		fee[_input][_output] = _fee;
		fee[_output][_input] = _fee;
	}

	function emergencyStop(bool _open) external auth {
		isOpen = _open;
	}

	function disableToken(address _token) external auth {
		tokensEnable[_token] = false;
	}

	function enableToken(address _token) external auth {
		tokensEnable[_token] = true;
	}
	
	function disableTrade(address _input, address _output) external auth {
		tradesDisable[_input][_output] = true;
		tradesDisable[_output][_input] = true;
	}

	function enableTrade(address _input, address _output) external auth {
		tradesDisable[_input][_output] = false;
		tradesDisable[_output][_input] = false;
	}

	function enableDToken(address _dToken) external auth {
		address _token = IDToken(_dToken).token();
		supportDToken[_token] = _dToken;
		freeDToken[_token] = address(0);

		if (IERC20(_token).allowance(address(this), _dToken) != uint(-1))
			require(doApprove(_token, _dToken, uint(-1)), "");

		uint _balance = IERC20(_token).balanceOf(address(this));
		if (_balance > 0)
			IDToken(_dToken).mint(address(this), _balance);
	}

	function disableDToken(address _dToken) external auth {
		address _token = IDToken(_dToken).token();
		require(supportDToken[_token] == _dToken, "the token doesnt support dToken");

		(uint _tokenBalance, bool flag) = getRedeemAmount(_dToken);
		
		if (_tokenBalance > 0)
			IDToken(_dToken).redeem(address(this), _tokenBalance);
		
		if (!flag)
			freeDToken[_token] = _dToken;

		supportDToken[_token] = address(0);
	}	

	function transferIn(address _token, uint _amount) external auth {
		require(doTransferFrom(_token, msg.sender, address(this), _amount));
		uint _balance = IERC20(_token).balanceOf(address(this));

		address _dToken = supportDToken[_token];
		if (_dToken != address(0) && _balance > 0)
			IDToken(_dToken).mint(address(this), _balance);
	}

	function transferOut(address _token, address _receiver, uint _amount) external auth {
		address _dToken = supportDToken[_token] == address(0) ? freeDToken[_token] : supportDToken[_token];
		if (_dToken != address(0)) {

			(uint _tokenBalance, bool flag) = getRedeemAmount(_dToken);
			IDToken(_dToken).redeem(address(this), freeDToken[_token] == _dToken ? _tokenBalance : _amount);
			if (flag)
				freeDToken[_token] = address(0);
		}

		uint _balance = IERC20(_token).balanceOf(address(this));
		if (_balance >= _amount)
			require(doTransferOut(_token, _receiver, _amount));
	}

	function transferOutALL(address _token, address _receiver) external auth {
		address _dToken = supportDToken[_token] == address(0) ? freeDToken[_token] : supportDToken[_token];
		if (_dToken != address(0)) {

			(uint _tokenBalance, bool flag) = getRedeemAmount(_dToken);
			require(flag, "transferOutALL:");
			if (_tokenBalance > 0)
				IDToken(_dToken).redeem(address(this), _tokenBalance);
			freeDToken[_token] = address(0);
		}
		uint _balance = IERC20(_token).balanceOf(address(this));
		if (_balance > 0)
			require(doTransferOut(_token, _receiver, _balance));
	}

	function getRedeemAmount(address _dToken) internal view returns (uint, bool) {
		uint _tokenBalance = IDToken(_dToken).getTokenRealBalance(address(this));
		uint _balance = IDToken(_dToken).getLiquidity();
		if (_balance < _tokenBalance)
			return (_balance, false);

		return (_tokenBalance, true);
	}

	// swap _inputAmount of _input token to get _output token
	function swap(address _input, address _output, uint _inputAmount) external {
		swap(_input, _output, _inputAmount, msg.sender);
	}

	function swap(address _input, address _output, uint _inputAmount, address _receiver) public nonReentrant {
		require(isOpen, "not open");

		uint _amountToUser = getAmountByInput(_input, _output, _inputAmount);
		require(_amountToUser > 0, "");
		require(doTransferFrom(_input, msg.sender, address(this), _inputAmount));
		if (supportDToken[_input] != address(0))
			IDToken(supportDToken[_input]).mint(address(this), _inputAmount);
		
		if (supportDToken[_output] != address(0))
			IDToken(supportDToken[_output]).redeem(address(this), _amountToUser);
		else if (freeDToken[_output] != address(0)) {

			(uint _tokenBalance, bool flag) = getRedeemAmount(freeDToken[_output]);
			if (_tokenBalance > 0)
				IDToken(freeDToken[_output]).redeem(address(this), _tokenBalance);

			if (flag)
				freeDToken[_output] = address(0);
		}

		require(doTransferOut(_output, _receiver, _amountToUser));
		emit Swap(
			msg.sender,
			_receiver,
			_input,
			_inputAmount,
			IPriceOracle(oracle).assetPrices(_input),
			_output,
			_amountToUser,
			IPriceOracle(oracle).assetPrices(_output)
		);
	}

	// swap _inputAmount of _input token to get _output token
	function swapTo(address _input, address _output, uint _outputAmount) external {
		swapTo(_input, _output, _outputAmount, msg.sender);
	}

	function swapTo(address _input, address _output, uint _outputAmount, address _receiver) public nonReentrant {
		require(isOpen, "not open");

		uint _inputAmount = getAmountByOutput(_input, _output, _outputAmount);
		require(_inputAmount > 0, "");
		require(doTransferFrom(_input, msg.sender, address(this), _inputAmount));
		if (supportDToken[_input] != address(0))
			IDToken(supportDToken[_input]).mint(address(this), _inputAmount);

		if (supportDToken[_output] != address(0))
			IDToken(supportDToken[_output]).redeem(address(this), _outputAmount);
		else if (freeDToken[_output] != address(0)) {

			(uint _tokenBalance, bool flag) = getRedeemAmount(freeDToken[_output]);
			if (_tokenBalance > 0)
				IDToken(freeDToken[_output]).redeem(address(this), _tokenBalance);

			if (flag)
				freeDToken[_output] = address(0);
		}

		require(doTransferOut(_output, _receiver, _outputAmount));
		emit Swap(
			msg.sender,
			_receiver,
			_input,
			_inputAmount,
			IPriceOracle(oracle).assetPrices(_input),
			_output,
			_outputAmount,
			IPriceOracle(oracle).assetPrices(_output)
		);
	}

	function getAmountByInput(address _input, address _output, uint _inputAmount) public view returns (uint) {

		if (!tokensEnable[_input] || !tokensEnable[_output] || tradesDisable[_input][_output])
			return 0;

		IPriceOracle _oracle = IPriceOracle(oracle);
		if (_oracle.assetPrices(_output) == 0)
			return 0;

		return _inputAmount
			.mul(_oracle.assetPrices(_input))
			.div(_oracle.assetPrices(_output))
			.mul(OFFSET.sub(fee[_input][_output])) / OFFSET;
	}

	function getAmountByOutput(address _input, address _output, uint _outputAmount) public view returns (uint) {

		if (!tokensEnable[_input] || !tokensEnable[_output] || tradesDisable[_input][_output] || _outputAmount == 0)
			return 0;

		IPriceOracle _oracle = IPriceOracle(oracle);
		if (_oracle.assetPrices(_input) == 0)
			return 0;

		return _outputAmount
			.mul(_oracle.assetPrices(_output))
			.div(_oracle.assetPrices(_input))
			.mul(OFFSET)
			.div(OFFSET.sub(fee[_input][_output]))
			.add(1);
	}

	function getLiquidity(address _token) external view returns (uint) {

		address _dToken = supportDToken[_token] == address(0) ? freeDToken[_token] : supportDToken[_token];
		uint _tokenBalance;
		if (_dToken != address(0))
			(_tokenBalance, ) = getRedeemAmount(_dToken);

		if (supportDToken[_token] != address(0))
			return _tokenBalance;
 
		return _tokenBalance.add(IERC20(_token).balanceOf(address(this)));
	}

	function exchangeRate(address _input, address _output) external view returns (uint) {
		uint _amount = getAmountByInput(_input, _output, 10 ** IERC20(_input).decimals());
		if (_amount == 0)
			return 0;

		uint _decimals = IERC20(_output).decimals();
		if (_decimals < 18)
			return _amount.mul(10 ** (18 - _decimals));

		return _amount / (10 ** (_decimals - 18));
	}
}