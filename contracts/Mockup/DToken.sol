pragma solidity ^0.5.4;

interface IDispatcher {
    function getHandler() external view returns (address[] memory, uint[] memory);
	function getDepositStrategy(uint _amount) external view returns (address[] memory, uint[] memory);
	function getWithdrawStrategy(address _token, uint _amount) external view returns (address[] memory, uint[] memory);
	function getRedeemStrategy(address _token, uint _amount) external view returns (address[] memory, uint[] memory);
	function getRealAmount(uint _pie) external view returns (uint);
}

interface IHandler {
    function deposit(address _token, uint _amount) external returns (bool);
    function withdraw(address _token, uint _amount) external returns (uint);
    function redeem(address _token, uint _amount) external returns (uint, uint);
    function getBalance(address _token) external view returns (uint);
    function getLiquidity(address _token) external view returns (uint);
    function getRealBalance(address _token) external view returns (uint);
    function getInterestRate(address _token) external view returns (uint);
    function getRealAmount(uint _pie) external view returns (uint);
}

interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint amount) external;

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint amount) external;

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint amount) external;

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint value);
}

contract ERC20SafeTransfer {
    function doTransferOut(address _token, address _to, uint _amount) internal returns (bool) {
        IERC20 token = IERC20(_token);
        bool result;

        token.transfer(_to, _amount);

        assembly {
            switch returndatasize()
                case 0 {
                    result := not(0)
                }
                case 32 {
                    returndatacopy(0, 0, 32)
                    result := mload(0)
                }
                default {
                    revert(0, 0)
                }
        }
        return result;
    }

    function doTransferFrom(address _token, address _from, address _to, uint _amount) internal returns (bool) {
        IERC20 token = IERC20(_token);
        bool result;

        token.transferFrom(_from, _to, _amount);

        assembly {
            switch returndatasize()
                case 0 {
                    result := not(0)
                }
                case 32 {
                    returndatacopy(0, 0, 32)
                    result := mload(0)
                }
                default {
                    revert(0, 0)
                }
        }
        return result;
    }

    function doApprove(address _token, address _to, uint _amount) internal returns (bool) {
        IERC20 token = IERC20(_token);
        bool result;

        token.approve(_to, _amount);

        assembly {
            switch returndatasize()
                case 0 {
                    result := not(0)
                }
                case 32 {
                    returndatacopy(0, 0, 32)
                    result := mload(0)
                }
                default {
                    revert(0, 0)
                }
        }
        return result;
    }
}

contract LibNote {
    event LogNote(
        bytes4   indexed  sig,
        address  indexed  usr,
        bytes32  indexed  arg1,
        bytes32  indexed  arg2,
        bytes             data
    ) anonymous;

    modifier note {
        _;
        assembly {
            // log an 'anonymous' event with a constant 6 words of calldata
            // and four indexed topics: selector, caller, arg1 and arg2
            let mark := msize                         // end of memory ensures zero
            mstore(0x40, add(mark, 288))              // update free memory pointer
            mstore(mark, 0x20)                        // bytes type data offset
            mstore(add(mark, 0x20), 224)              // bytes size (padded)
            calldatacopy(add(mark, 0x40), 0, 224)     // bytes payload
            log4(mark, 288,                           // calldata
                 shl(224, shr(224, calldataload(0))), // msg.sig
                 caller,                              // msg.sender
                 calldataload(4),                     // arg1
                 calldataload(36)                     // arg2
                )
        }
    }
}

contract Ownable {
    address public owner;
    address public pendingOwner;
    mapping(address => bool) public managers;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event SetManager(address indexed owner, address indexed newManager);
    event RemoveManager(address indexed owner, address indexed previousManager);

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "onlyOwner: non-owner");
        _;
    }

    /**
     * @dev Throws if called by any account other than a manager.
     */
    modifier onlyManager() {
        require(managers[msg.sender], "onlyManager: non-manager");
        _;
    }

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () public {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @dev Returns true if the user(`account`) is the a manager.
     */
    function isManager(address _account) public view returns (bool) {
        return managers[_account];
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner_`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != owner, "transferOwnership: the same owner.");
        pendingOwner = _newOwner;
    }

    /**
     * @dev Accepts ownership of the contract.
     * Can only be called by the settting new owner(`pendingOwner`).
     */
    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "acceptOwnership: only new owner do this.");
        emit OwnershipTransferred(owner, pendingOwner);
        owner = pendingOwner;
        pendingOwner = address(0);
    }

    /**
     * @dev Set a new user(`account`) as a manager.
     * Can only be called by the current owner.
     */
    function setManager(address _account) external onlyOwner {
        require(_account != address(0), "setManager: account cannot be a zero address.");
        require(!isManager(_account), "setManager: Already a manager address.");
        managers[_account] = true;
        emit SetManager(owner, _account);
    }

    /**
     * @dev Remove a previous manager account.
     * Can only be called by the current owner.
     */
    function removeManager(address _account) external onlyOwner {
        require(_account != address(0), "removeManager: _account cannot be a zero address.");
        require(isManager(_account), "removeManager: Not an admin address.");
        managers[_account] = false;
        emit RemoveManager(owner, _account);
    }
}

contract Pausable is Ownable {
    bool public paused;

    /**
     * @dev Emitted when the pause is triggered by a pauser (`account`).
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by a pauser (`account`).
     */
    event Unpaused(address account);

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!paused, "whenNotPaused: paused");
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(paused, "whenPaused: not paused");
        _;
    }

    /**
     * @dev Initializes the contract in unpaused state. Assigns the Pauser role
     * to the deployer.
     */
    constructor () internal {
        paused = false;
    }

    /**
     * @dev Called by the contract owner to pause, triggers stopped state.
     */
    function pause() public whenNotPaused onlyOwner {
        paused = true;
        emit Paused(owner);
    }

    /**
     * @dev Called by the contract owner to unpause, returns to normal state.
     */
    function unpause() public whenPaused onlyOwner {
        paused = false;
        emit Unpaused(owner);
    }
}

library SafeMath {
    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x);
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x);
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }
}

contract DToken is LibNote, Pausable, ERC20SafeTransfer {
    using SafeMath for uint;
    // --- Data ---
    bool private initialized;           // Flag of initialize data

    uint public exchangeRate;           // The rate accumulator
    uint public lastTriggerTime;        // The last recorded time
    uint public bufferExchangeRate;     // The cache rate accumulator
    uint public bufferLastTriggerTime;  // The cache recorded time
    uint public samplingInterval;       // Minimum time interval for exchange rate changes

    uint public originationFee;         // Trade fee

    address public dispatcher;
    address public token;

    uint constant BASE = 10 ** 18;

    // --- ERC20 Data ---
    string  public name;
    string  public symbol;
    uint8   public decimals;
    uint256 public totalSupply;
    uint256 public totalToken;

    mapping (address => uint)                      public balanceOf;
    mapping (address => mapping (address => uint)) public allowance;

    // --- Event ---
    event Approval(address indexed src, address indexed guy, uint wad);
    event Transfer(address indexed src, address indexed dst, uint wad);
    event NewDispatcher(address Dispatcher, address oldDispatcher);
    event NewOriginationFee(uint oldOriginationFeeMantissa, uint newOriginationFeeMantissa);
    event NewSamplingInterval(uint oldSamplingInterval, uint newSamplingInterval);

    /**
     * The constructor is used here to ensure that the implementation
     * contract is initialized. An uncontrolled implementation
     * contract might lead to misleading state
     * for users who accidentally interact with it.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _token,
        address _dispatcher,
        uint _originationFee
    ) public {
        initialize(_name, _symbol, _decimals, _token, _dispatcher, _originationFee);
    }

    // --- Init ---
    function initialize(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _token,
        address _dispatcher,
        uint _originationFee
    ) public {
        require(!initialized, "initialize: already initialized.");
        require(_originationFee < BASE / 10, "initialize: fee should be less than ten percent.");
        owner = msg.sender;
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        token = _token;
        dispatcher = _dispatcher;
        originationFee = _originationFee;
        exchangeRate = BASE;
        bufferExchangeRate = BASE;
        lastTriggerTime = now;
        bufferLastTriggerTime = now;
        initialized = true;
        samplingInterval = 60;

        emit NewDispatcher(_dispatcher, address(0));
        emit NewOriginationFee(0, _originationFee);
        emit NewSamplingInterval(0, 60);
    }

    /**
     * @dev Manager function to set a new dispatcher contract address.
     * @param _newDispatcher New dispatcher contract address.
     * @return bool true=success, otherwise a failure.
     */
    function updateDispatcher(address _newDispatcher) external onlyManager returns (bool) {
        address _oldDispatcher = dispatcher;
        require(_newDispatcher != _oldDispatcher, "updateDispatcher: same dispatcher address.");
        dispatcher = _newDispatcher;
        emit NewDispatcher(_newDispatcher, _oldDispatcher);

        return true;
    }

    /**
     * @dev Manager function to set a new origination fee.
     * @param _newOriginationFee New trading fee ratio, scaled by 1e18.
     * @return bool true=success, otherwise a failure.
     */
    function updateOriginationFee(uint _newOriginationFee) external onlyManager returns (bool) {
        require(_newOriginationFee < BASE / 10, "updateOriginationFee: fee should be less than ten percent.");
        uint _oldOriginationFee = originationFee;
        require(_oldOriginationFee != _newOriginationFee, "updateOriginationFee: same fee.");
        originationFee = _newOriginationFee;
        emit NewOriginationFee(_oldOriginationFee, _newOriginationFee);

        return true;
    }

    /**
     * @dev Manager function to set a new sampling interval.
     * @param _newSamplingInterval Reasonable sampling interval, at least one block time.
     * @return bool true=success, otherwise a failure.
     */
    function updateSamplingInterval(uint _newSamplingInterval) external onlyManager returns (bool) {
        require(_newSamplingInterval > 15,
                "updateSamplingInterval: Sampling interval should be greater than 15 seconds.");
        uint _oldSamplingInterval = samplingInterval;
        require(_oldSamplingInterval != _newSamplingInterval, "updateSamplingInterval: same sampling interval.");
        samplingInterval = _newSamplingInterval;
        emit NewSamplingInterval(_oldSamplingInterval, _newSamplingInterval);

        return true;
    }

    /**
     * @dev Owner function to transfer token out to avoid user makes a wrong operation.
     * @param _token Reserve asset.
     * @param _recipient Account to receive asset.
     * @param _amount Amount to transfer.
     */
    function takeOut(address _token, address _recipient, uint _amount) external onlyOwner {
        require(doTransferOut(_token, _recipient, _amount), 'takeOut: Token transfer out of contract failed.');
    }

    function rmul(uint x, uint y) internal pure returns (uint z) {
        z = x.mul(y) / BASE;
    }

    function rdiv(uint x, uint y) internal pure returns (uint z) {
        z = x.mul(BASE) / y;
    }

    function rdivup(uint x, uint y) internal pure returns (uint z) {
        z = x.mul(BASE).add(y.sub(1)) / y;
    }

    /**
     * @dev After the operation, check whether the remaining token balance is valid or not.
     * @param _handlers All support `handler` address.
     * @param _token Token address to check.
     */
    function checkTotalToken(address[] memory _handlers, address _token) internal view {
        // Accumulate each handler balance.
        uint _tokenTotal = 0;
        for (uint i = 0; i < _handlers.length; i++)
            _tokenTotal = _tokenTotal.add(IHandler(_handlers[i]).getBalance(_token));

        // The accumulated amount can not be greater than the total deposit amount of handlers.
        require(totalToken <= _tokenTotal, "checkTotalToken: invalid token amount");
    }

    /**
     * @dev Update the exchange rate to ensure current exchange rate is not expired.
     * @param _exchangeRate Current exchange rate.
     */
    function snapshot(uint _exchangeRate) internal {
        // If the exchange rate has expired, then update it.
        if (now - lastTriggerTime > samplingInterval) {
            bufferExchangeRate = exchangeRate;
            bufferLastTriggerTime = lastTriggerTime;
            exchangeRate = _exchangeRate;
            lastTriggerTime = now;
        }
    }

    /**
     * @dev Deposit token to earn savings, but only when the contract is not paused.
     * @param _dst Account who will get savings.
     * @param _pie Amount to deposit, scaled by 1e18.
     */
    function mint(address _dst, uint _pie) public note whenNotPaused {
        // Get deposit strategy base on the deposit amount `_pie`.
        (address[] memory _handlers, uint[] memory _amount) = IDispatcher(dispatcher).getDepositStrategy(_pie);

        address _token = token;
        // Get current exchange rate.
        uint _exchangeRate = getExchangeRateByHandler(_handlers, _token);

        for (uint i = 0; i < _handlers.length; i++) {
            // If deposit amount is 0 by this handler, then pass.
            if (_amount[i] == 0)
                continue;
            // Transfer the calculated token amount from `msg.sender` to the `handler`.
            require(doTransferFrom(_token, msg.sender, _handlers[i], _amount[i]), "mint: transferFrom token failed");
            // The `handler` deposit obtained token to corresponding market to earn savings.
            require(IHandler(_handlers[i]).deposit(_token, _amount[i]), "mint: handler deposit failed");
        }

        // Calculate amount of the dToken based on current exchange rate.
        uint _wad = rdivup(_pie, _exchangeRate);
        balanceOf[_dst] = balanceOf[_dst].add(_wad);
        totalSupply = totalSupply.add(_wad);
        // Update memory exchange rate.
        snapshot(_exchangeRate);

        // Increase total amount of the dToken.
        totalToken = totalToken.add(_pie);

        // After operation, check if the token change is reasonable.
        checkTotalToken(_handlers, _token);
        emit Transfer(address(0), _dst, _wad);
    }

    /**
     * @dev Withdraw to get token according to input dToken amount,
     *      but only when the contract is not paused.
     * @param _src Account who will spend dToken.
     * @param _wad Amount to burn dToken, scaled by 1e18.
     */
    function burn(address _src, uint _wad) public note whenNotPaused {
        // Get current exchange rate.
        uint _exchangeRate = getExchangeRate();
        require(balanceOf[_src] >= _wad, "burn: insufficient balance");
        if (_src != msg.sender && allowance[_src][msg.sender] != uint(-1)) {
            require(allowance[_src][msg.sender] >= _wad, "burn: insufficient allowance");
            allowance[_src][msg.sender] = allowance[_src][msg.sender].sub(_wad);
        }
        balanceOf[_src] = balanceOf[_src].sub(_wad);
        totalSupply = totalSupply.sub(_wad);

        // Calculate amount of the token based on current exchange rate.
        uint _pie = rmul(_wad, _exchangeRate);
        address _token = token;
        uint _totalAmount;
        uint _userAmount;

        // Get `_token` best withdraw strategy base on the withdraw amount `_pie`.
        (address[] memory _handlers, uint[] memory _amount) = IDispatcher(dispatcher).getWithdrawStrategy(_token, _pie);
        for (uint i = 0; i < _handlers.length; i++) {
            if (_amount[i] == 0)
                continue;

            // The `handler` withdraw calculated amount from the market.
            _totalAmount = IHandler(_handlers[i]).withdraw(_token, _amount[i]);
            require(_totalAmount > 0, "burn: handler withdraw failed");

            // After subtracting the fee, the user finally can get quantity.
            _userAmount = rmul(_totalAmount, BASE.sub(originationFee));
            // Transfer the calculated token amount from the `handler` to the receiver `_src`.
            if (_userAmount > 0)
                require(doTransferFrom(_token, _handlers[i], msg.sender, _userAmount), "burn: transfer to user failed");

            // Transfer the token trade fee from the `handler` to the `dToken`.
            require(doTransferFrom(_token, _handlers[i], address(this), _totalAmount.sub(_userAmount)),
                    "burn: transfer fee failed");

        }

        // Update cache exchange rate.
        snapshot(_exchangeRate);

        // Decrease total amount of the dToken.
        totalToken = totalToken > _pie ? totalToken.sub(_pie) : 0;
        // After operation, check if the token change is reasonable.
        checkTotalToken(_handlers, _token);
        emit Transfer(_src, address(0), _wad);
    }

    /**
     * @dev Withdraw to get specified token, but only when the contract is not paused.
     * @param _src Account who will spend dToken.
     * @param _pie Amount to withdraw token, scaled by 1e18.
     */
    function redeem(address _src, uint _pie) public note whenNotPaused {
        // Calculate total token amount to withdraw including fee.
        uint _redeemAmountWithFee = rdivup(_pie, BASE.sub(originationFee));
        address _token = token;
        // Get `_token` best redeem strategy base on the redeem amount including fee.
        (address[] memory _handlers, uint[] memory _amount) = IDispatcher(dispatcher).getRedeemStrategy(_token, _redeemAmountWithFee);
        // Get current exchange rate.
        uint _exchangeRate = getExchangeRateByHandler(_handlers, _token);
        uint _totalAmountWithFee;
        uint _totalAmount;
        uint _userAmount;
        uint _sum;
        for (uint i = 0; i < _handlers.length; i++) {
            if (_amount[i] == 0)
                continue;

            // The `handler` redeem calculated amount from the market.
            // The calculated amount contains exchange token fee, if it exists.
            (_totalAmountWithFee, _totalAmount) = IHandler(_handlers[i]).redeem(_token, _amount[i]);
            require(_totalAmountWithFee > 0 && _totalAmount > 0, "redeem: ");

            // After subtracting the fee, the user finally can get quantity.
            _userAmount = rmul(_totalAmount, BASE.sub(originationFee));

            // Transfer the calculated token amount from the `handler` to the receiver `_src`
            if (_userAmount > 0)
                require(doTransferFrom(_token, _handlers[i], msg.sender, _userAmount),
                        "redeem: transfer to user failed");

            // Transfer the token trade fee from the `handler` to the `dToken`.
            require(doTransferFrom(_token, _handlers[i], address(this), _totalAmount.sub(_userAmount)),
                    "redeem: transfer fee failed");

            _sum = _sum.add(_totalAmountWithFee);
        }

        // Calculate amount of the dToken based on current exchange rate.
        uint _wad = rdivup(_sum, _exchangeRate);

        require(balanceOf[_src] >= _wad, "redeem: insufficient balance");
        if (_src != msg.sender && allowance[_src][msg.sender] != uint(-1)) {
            require(allowance[_src][msg.sender] >= _wad, "redeem: insufficient allowance");
            allowance[_src][msg.sender] = allowance[_src][msg.sender].sub(_wad);
        }
        balanceOf[_src] = balanceOf[_src].sub(_wad);
        totalSupply = totalSupply.sub(_wad);

        // Update cache exchange rate.
        snapshot(_exchangeRate);

        // Decrease total amount of the dToken.
        totalToken = totalToken > _sum ? totalToken.sub(_sum) : 0;
        // After operation, check if the token change is reasonable.
        checkTotalToken(_handlers, _token);
        emit Transfer(_src, address(0), _wad);
    }

    // --- Token ---
    function transfer(address _dst, uint _wad) external returns (bool) {
        return transferFrom(msg.sender, _dst, _wad);
    }

    // Like transferFrom but Token-denominated
    function move(address _src, address _dst, uint _pie) external returns (bool) {
        uint _exchangeRate = getExchangeRate();
        snapshot(_exchangeRate);
        // Rounding up to ensure `_dst` gets at least `_pie` token
        return transferFrom(_src, _dst, rdivup(_pie, _exchangeRate));
    }

    function transferFrom(address _src, address _dst, uint _wad) public returns (bool)
    {
        require(balanceOf[_src] >= _wad, "transferFrom: insufficient balance");
        if (_src != msg.sender && allowance[_src][msg.sender] != uint(-1)) {
            require(allowance[_src][msg.sender] >= _wad, "transferFrom: insufficient allowance");
            allowance[_src][msg.sender] = allowance[_src][msg.sender].sub(_wad);
        }
        balanceOf[_src] = balanceOf[_src].sub(_wad);
        balanceOf[_dst] = balanceOf[_dst].add(_wad);
        emit Transfer(_src, _dst, _wad);
        return true;
    }

    function approve(address _spender, uint _wad) external returns (bool) {
        allowance[msg.sender][_spender] = _wad;
        emit Approval(msg.sender, _spender, _wad);
        return true;
    }

    /**
     * @dev According to the current exchange rate, get user's corresponding token balance
     *      based on the dToken amount, which has substracted dToken fee.
     * @param _account Account to query token balance.
     * @return Actual token balance based on dToken amount.
     */
    function getTokenBalance(address _account) public view returns (uint) {
        uint _exchangeRate = getExchangeRate();
        uint _pie = rmul(rmul(balanceOf[_account], _exchangeRate), BASE.sub(originationFee));
        return _pie;
    }

    /**
     * @dev According to the current exchange rate, get user's corresponding token balance
     *      based on the dToken amount, which has substracted dToken fee, and exchainging fee between
     *      token and wrapped token, if it has.
     * @param _account Account to query token balance.
     * @return Actual token balance excluding all fee.
     */
    function getTokenRealBalance(address _account) external view returns (uint) {
        uint _pie = getTokenBalance(_account);
        return IDispatcher(dispatcher).getRealAmount(_pie);
    }

    /**
     * @dev Get the current list of the `handlers`.
     */
    function getHandler() public view returns (address[] memory) {
        (address[] memory _handlers,) = IDispatcher(dispatcher).getHandler();
        return _handlers;
    }

    /**
     * @dev Get all deposit token amount including interest.
     */
    function getTotalBalance() external view returns (uint) {
        address[] memory _handlers = getHandler();
        uint _tokenTotalBalance = 0;
        for (uint i = 0; i < _handlers.length; i++)
            _tokenTotalBalance = _tokenTotalBalance.add(IHandler(_handlers[i]).getBalance(token));
        return _tokenTotalBalance;
    }

    /**
     * @dev Get maximum valid token amount in the whole market.
     */
    function getLiquidity() external view returns (uint) {
        address[] memory _handlers = getHandler();
        uint _liquidity = 0;
        for (uint i = 0; i < _handlers.length; i++)
            _liquidity = _liquidity.add(IHandler(_handlers[i]).getLiquidity(token));
        return _liquidity;
    }

    /**
     * @dev Current newest exchange rate, scaled by 1e18.
     */
    function getExchangeRate() public view returns (uint) {
        address[] memory _handlers = getHandler();
        return getExchangeRateByHandler(_handlers, token);
    }

    /**
     * @dev According to `_handlers` and token amount `_token` to calculate the exchange rate.
     * @param _handlers The list of `_handlers`.
     * @param _token Token address.
     * @return Current exchange rate between token and dToken.
     */
    function getExchangeRateByHandler(address[] memory _handlers, address _token) public view returns (uint) {
        uint _tokenTotal = 0;
        for (uint i = 0; i < _handlers.length; i++)
            _tokenTotal = _tokenTotal.add(IHandler(_handlers[i]).getBalance(_token));

        return totalSupply == 0 || _tokenTotal == 0 ? exchangeRate : rdiv(_tokenTotal, totalSupply);
    }

    /**
     * @dev According to time interval, calculate token APR.
     * @param _interval Time interval(uint: second)
     */
    function getFixedInterestRate(uint _interval) public view returns (uint) {
        uint _duration = now.sub(bufferLastTriggerTime);
        if (_duration == 0)
            return 0;

        uint _interestRatePerSecond = getExchangeRate().sub(bufferExchangeRate) / now.sub(bufferLastTriggerTime);
        return _interestRatePerSecond.mul(_interval);
    }

    /**
     * @dev Get the token annualized interest rate.
     * @return Return the annualized interest rate.
     */
    function getAnnualInterestRate() public view returns (uint) {
        return getFixedInterestRate(31536000);
    }
}
