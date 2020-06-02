pragma solidity ^0.5.4;

import "./interface/IDToken.sol";
import "./interface/IPriceOracle.sol";
import "./DSLibrary/DSMath.sol";
import "./DSLibrary/DSAuth.sol";
import "./DSLibrary/ReentrancyGuard.sol";
import "./DSLibrary/ERC20SafeTransfer.sol";

contract XSwap is DSAuth, ReentrancyGuard, ERC20SafeTransfer {
    using DSMath for uint;

    uint constant internal OFFSET = 10 ** 18;
    bool private actived;
    uint public maxSwing;

    address public oracle;
    mapping(address => mapping(address => uint)) public fee;  // Fee for exchange from tokenA to tokenB

    bool public isOpen;  // The state of contract
    mapping(address => bool) public tokensEnable;  // Support this token or not
    // Trade pair supports or not
    mapping(address => mapping(address => bool)) public tradesDisable;

    mapping(address => address) public supportDToken;
    mapping(address => address) public remainingDToken;

    bool public paused;

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

    // --- Init ---
    // This function is used with contract proxy, do not modify this function.
    function active(address _oracle) external {
        require(actived == false, "active: Already actived!");
        owner = msg.sender;
        isOpen = true;
        oracle = _oracle;
        maxSwing = 15 * 10 ** 17;
        notEntered = true;
        actived = true;
    }

    // ****************************
    // *** Authorized functions ***
    // ****************************

    /**
     * @notice Only authorized users can call this function.
     * @dev Sets a new oracle contract address.
     * @param _oracle New oracle contract.
     */
    function setOracle(address _oracle) external auth {
        oracle = _oracle;
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Set a new maxSwing value.
     * @param _maxSwing New maxSwing value.
     */
    function setMaxSwing(uint _maxSwing) external auth {
        // require(_maxSwing >= OFFSET && _maxSwing <= OFFSET.mul(2), "setMaxSwing: New maxSwing non-compliant");
        maxSwing = _maxSwing;
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Sets trading fee for specified trade pair.
     * @param _input One asset in the trade pair.
     * @param _output The other asset in the trade pair.
     * @param _fee Trading fee when swaps these two tokens.
     */
    function setFee(address _input, address _output, uint _fee) external auth {
        fee[_input][_output] = _fee;
        fee[_output][_input] = _fee;
    }

    function setFeeBatch(address[] calldata _input, address[] calldata _output, uint[] calldata _fee) external auth {
        require(_input.length == _output.length && _input.length == _fee.length, "setFeeBatch: ");
        for (uint i = 0; i < _input.length; i++) {
            require(_input[i] != _output[i], "setFeeBatch: ");
            fee[_input[i]][_output[i]] = _fee[i];
            fee[_output[i]][_input[i]] = _fee[i];
        }
    }

    /**
     * @dev Called by the authorized users to pause, triggers stopped state.
     */
    function pause() public auth {
        require(!paused, "pause: paused");
        paused = true;
    }

    /**
     * @dev Called by the authorized users to unpause, returns to normal state.
     */
    function unpause() public auth {
        require(paused, "unpause: not paused");
        paused = false;
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Changes the contract state.
     * @param _changeStateTo True means unpause contract, and false means pause conntract.
     */
    function emergencyStop(bool _changeStateTo) external auth {
        isOpen = _changeStateTo;
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Suspends a given asset.
     * @param _token Asset to suspend.
     */
    function disableToken(address _token) external auth {
        tokensEnable[_token] = false;
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Supports a given asset.
     * @param _token Asset to support.
     */
    function enableToken(address _token) external auth {
        tokensEnable[_token] = true;
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Suspends a given trade pair.
     * @param _input One asset in the trade pair.
     * @param _output The other asset in the trade pair.
     */
    function disableTrade(address _input, address _output) external auth {
        tradesDisable[_input][_output] = true;
        tradesDisable[_output][_input] = true;
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Supports a given trade pair.
     * @param _input One asset in the trade pair.
     * @param _output The other asset in the trade pair.
     */
    function enableTrade(address _input, address _output) external auth {
        tradesDisable[_input][_output] = false;
        tradesDisable[_output][_input] = false;
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Suspends a given dToken.
     * @param _dToken dToken to suspend.
     */
    function disableDToken(address _dToken) external auth {
        address _token = IDToken(_dToken).token();
        require(supportDToken[_token] == _dToken, "disableDToken: Does not support!");

        (uint _tokenBalance, bool flag) = getRedeemAmount(_dToken);

        if (_tokenBalance > 0)
            IDToken(_dToken).redeem(address(this), _tokenBalance);

        if (!flag)
            remainingDToken[_token] = _dToken;

        supportDToken[_token] = address(0);
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Supports a given dToken.
     * @param _dToken dToken to support.
     */
    function enableDToken(address _dToken) external auth {
        address _token = IDToken(_dToken).token();
        supportDToken[_token] = _dToken;
        remainingDToken[_token] = address(0);

        if (IERC20(_token).allowance(address(this), _dToken) != uint(-1))
            require(doApprove(_token, _dToken, uint(-1)), "enableDToken: Approve failed!");

        uint _balance = IERC20(_token).balanceOf(address(this));
        if (_balance > 0)
            IDToken(_dToken).mint(address(this), _balance);
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Transfer `_amount` asset`_token` to the contract.
     * @param _token Asset will be transfered into the contract.
     * @param _amount Amount will be transfered into the contract.
     */
    function transferIn(address _token, uint _amount) external auth {
        require(doTransferFrom(_token, msg.sender, address(this), _amount), "transferIn: TransferFrom failed!");
        uint _balance = IERC20(_token).balanceOf(address(this));

        address _dToken = supportDToken[_token];
        if (_dToken != address(0) && _balance > 0)
            IDToken(_dToken).mint(address(this), _balance);
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Transfer out `_amount` asset`_token` from the contract.
     * @param _token Asset will be transfered out from the contract.
     * @param _receiver Account who will receive asset.
     * @param _amount Specificed amount will be transfered out from the contract.
     */
    function transferOut(address _token, address _receiver, uint _amount) external auth {
        address _dToken = supportDToken[_token] == address(0) ? remainingDToken[_token] : supportDToken[_token];
        if (_dToken != address(0)) {

            (uint _tokenBalance, bool flag) = getRedeemAmount(_dToken);
            IDToken(_dToken).redeem(address(this), remainingDToken[_token] == _dToken ? _tokenBalance : _amount);
            if (flag)
                remainingDToken[_token] = address(0);
        }

        uint _balance = IERC20(_token).balanceOf(address(this));
        if (_balance >= _amount)
            require(doTransferOut(_token, _receiver, _amount), "transferOut: Transfer out failed!");
    }

    /**
     * @notice Only authorized users can call this function.
     * @dev Transfer out all asset`_token` from the contract.
     * @param _token Asset will be transfered out from the contract.
     * @param _receiver Account who will receive asset.
     */
    function transferOutALL(address _token, address _receiver) external auth {
        address _dToken = supportDToken[_token] == address(0) ? remainingDToken[_token] : supportDToken[_token];
        if (_dToken != address(0)) {

            (uint _tokenBalance, bool flag) = getRedeemAmount(_dToken);
            require(flag, "transferOutALL: Lack of liquidity!");
            if (_tokenBalance > 0)
                IDToken(_dToken).redeem(address(this), _tokenBalance);
            remainingDToken[_token] = address(0);
        }
        uint _balance = IERC20(_token).balanceOf(address(this));
        if (_balance > 0)
            require(doTransferOut(_token, _receiver, _balance), "transferOutALL: Transfer out all failed!");
    }

    // **************************
    // *** Internal functions ***
    // **************************

    /**
     * @dev Calculates valid amount can redeem from dToken.
     * @param _dToken dToken which will be redeemed.
     */
    function getRedeemAmount(address _dToken) internal view returns (uint, bool) {
        uint _tokenBalance = IDToken(_dToken).getTokenRealBalance(address(this));
        uint _balance = IDToken(_dToken).getLiquidity();
        if (_balance < _tokenBalance)
            return (_balance, false);

        return (_tokenBalance, true);
    }

    /**
     * @dev Calculates the exchange rate between two assets.
     * @param _input One asset in the trade pair.
     * @param _inputAmount Amount of input asset`input`.
     * @param _output The other asset in the trade pair.
     * @param _outputAmount Amount of output asset`_output`.
     */
    function getExchangeRate(address _input, uint _inputAmount, address _output, uint _outputAmount) internal view returns (uint) {
        uint _decimals = IERC20(_input).decimals();
        _inputAmount = _decimals < 18 ? _inputAmount.mul(10 ** (18 - _decimals)) : _inputAmount / (10 ** (_decimals - 18));
        _decimals = IERC20(_output).decimals();
        _outputAmount = _decimals < 18 ? _outputAmount.mul(10 ** (18 - _decimals)) : _outputAmount / (10 ** (_decimals - 18));
        return _inputAmount.mul(OFFSET).div(_outputAmount);
    }

    // ************************
    // *** Public functions ***
    // ************************

    /**
     * @dev Swaps `_inputAmount`asset to get another asset`_output`.
     * @param _input Asset that user wants to consume.
     * @param _output Asset that user wants to get.
     * @param _inputAmount Amount of asset consumed.
     */
    function swap(address _input, address _output, uint _inputAmount) external {
        swapWithSlippage(_input, _output, _inputAmount, 0, msg.sender);
    }

    function swap(address _input, address _output, uint _inputAmount, uint _outputAmount) external {
        swapWithSlippage(_input, _output, _inputAmount, _outputAmount, msg.sender);
    }

    function swapWithSlippageAndTime(address _input, address _output, uint _inputAmount, uint _outputAmount, uint _timestamp, address _receiver) external {
        require(_timestamp == 0 || _timestamp >= now, "swap: Invalid amount!");
        swapWithSlippage(_input, _output, _inputAmount, _outputAmount, _receiver);
    }

    function swapWithSlippage(address _input, address _output, uint _inputAmount, uint _outputAmount, address _receiver) public nonReentrant {
        require(isOpen && !paused, "swap: Contract paused!");

        uint _amountToUser = getAmountByInput(_input, _output, _inputAmount);
        require(_amountToUser > 0 && _amountToUser >= _outputAmount, "swap: Invalid amount!");

        uint _exchangeRate = getExchangeRate(_input, _inputAmount, _output, _amountToUser);
        require(_exchangeRate < maxSwing && _exchangeRate > 10 ** 36 / maxSwing, "swap: Abnormal exchange rate!");

        require(doTransferFrom(_input, msg.sender, address(this), _inputAmount), "swap: TransferFrom failed!");
        if (supportDToken[_input] != address(0))
            IDToken(supportDToken[_input]).mint(address(this), _inputAmount);

        if (supportDToken[_output] != address(0))
            IDToken(supportDToken[_output]).redeem(address(this), _amountToUser);
        else if (remainingDToken[_output] != address(0)) {

            (uint _tokenBalance, bool flag) = getRedeemAmount(remainingDToken[_output]);
            if (_tokenBalance > 0)
                IDToken(remainingDToken[_output]).redeem(address(this), _tokenBalance);

            if (flag)
                remainingDToken[_output] = address(0);
        }

        require(doTransferOut(_output, _receiver, _amountToUser), "swap: Transfer out failed!");
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

    /**
     * @dev Swaps  `_outputAmount`asset to get another asset`_input`.
     * @param _input Asset that user wants to get.
     * @param _output Asset that user wants to consume.
     * @param _outputAmount Amount of asset consumed.
     */
    function swapTo(address _input, address _output, uint _outputAmount) external {
        swapToWithSlippage(_input, _output, 0, _outputAmount, msg.sender);
    }

    function swapTo(address _input, address _output, uint _inputAmount, uint _outputAmount) external {
        swapToWithSlippage(_input, _output, _inputAmount, _outputAmount, msg.sender);
    }

    function swapToWithSlippageAndTime(address _input, address _output, uint _inputAmount, uint _outputAmount, uint _timestamp, address _receiver) external {
        require(_timestamp == 0 || _timestamp >= now, "swap: Invalid amount!");
        swapToWithSlippage(_input, _output, _inputAmount, _outputAmount, _receiver);
    }

    function swapToWithSlippage(address _input, address _output, uint _inputAmount, uint _outputAmount, address _receiver) public nonReentrant {
        require(isOpen && !paused, "swapTo: Contract paused!");

        uint _amountToUser = getAmountByOutput(_input, _output, _outputAmount);
        require(_amountToUser > 0 && (_inputAmount == 0 || _amountToUser <= _inputAmount), "swapTo: Invalid amount!");

        uint _exchangeRate = getExchangeRate(_input, _amountToUser, _output, _outputAmount);
        require(_exchangeRate < maxSwing && _exchangeRate > 10 ** 36 / maxSwing, "swapTo: Abnormal exchange rate!");

        require(doTransferFrom(_input, msg.sender, address(this), _amountToUser), "swapTo: TransferFrom failed!");
        if (supportDToken[_input] != address(0))
            IDToken(supportDToken[_input]).mint(address(this), _amountToUser);

        if (supportDToken[_output] != address(0))
            IDToken(supportDToken[_output]).redeem(address(this), _outputAmount);
        else if (remainingDToken[_output] != address(0)) {

            (uint _tokenBalance, bool flag) = getRedeemAmount(remainingDToken[_output]);
            if (_tokenBalance > 0)
                IDToken(remainingDToken[_output]).redeem(address(this), _tokenBalance);

            if (flag)
                remainingDToken[_output] = address(0);
        }

        require(doTransferOut(_output, _receiver, _outputAmount), "swapTo: Transfer out failed!");
        emit Swap(
            msg.sender,
            _receiver,
            _input,
            _amountToUser,
            IPriceOracle(oracle).assetPrices(_input),
            _output,
            _outputAmount,
            IPriceOracle(oracle).assetPrices(_output)
        );
    }

    /**
     * @dev Calculates the amount of `output` based on the amount`_inputAmount` of `input`.
     * @param _input Asset that user wants to consume.
     * @param _output Asset that user wants to get.
     * @param _inputAmount Amount of asset consumed.
     */
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

    /**
     * @dev Calculates the amount of `_input` based on the amount`_outputAmount` of `_output`.
     * @param _input Asset that user wants to get.
     * @param _output Asset that user wants to consume.
     * @param _outputAmount Amount of asset consumed.
     */
    function getAmountByOutput(address _input, address _output, uint _outputAmount) public view returns (uint) {

        if (!tokensEnable[_input] || !tokensEnable[_output] || tradesDisable[_input][_output] || _outputAmount == 0)
            return 0;

        IPriceOracle _oracle = IPriceOracle(oracle);
        if (_oracle.assetPrices(_input) == 0 || _oracle.assetPrices(_output) == 0)
            return 0;

        return _outputAmount
            .mul(_oracle.assetPrices(_output))
            .div(_oracle.assetPrices(_input))
            .mul(OFFSET)
            .div(OFFSET.sub(fee[_input][_output]))
            .add(1);
    }

    /**
     * @dev Gets the valid amount of `_token` to redeem.
     * @param _token Asset which will be redeemed.
     */
    function getLiquidity(address _token) external view returns (uint) {

        address _dToken = supportDToken[_token] == address(0) ? remainingDToken[_token] : supportDToken[_token];
        uint _tokenBalance;
        if (_dToken != address(0))
            (_tokenBalance, ) = getRedeemAmount(_dToken);

        if (supportDToken[_token] != address(0))
            return _tokenBalance;

        return _tokenBalance.add(IERC20(_token).balanceOf(address(this)));
    }

    /**
     * @dev Gets the exchange rate between the two assets.
     * @param _input Asset that will be consumed.
     * @param _output Asset that will be got.
     */
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
