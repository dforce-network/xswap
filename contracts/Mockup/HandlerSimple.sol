pragma solidity ^0.5.4;

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

contract Handler is Ownable, ERC20SafeTransfer {

    using SafeMath for uint;

    address dToken;      // dToken address
    uint interestRate;
    uint public balance;

    event SetInterestRate(address indexed owner, uint indexed InterestRate, uint indexed oldInterestRate);

    /**
     * @dev Throws if called by any account other than the dToken.
     */
    modifier onlyDToken() {
        require(msg.sender == dToken, "non-dToken");
        _;
    }

    constructor (address _dToken, uint _interestRate) public {
        dToken = _dToken;
        setInterest(_interestRate);
    }
    
    function setInterest(uint _interestRate) internal {
        uint _oldInterestRate = interestRate;
        require(_interestRate != _oldInterestRate, "setInterestRate: Old and new values cannot be the same.");
        interestRate = _interestRate;
        emit SetInterestRate(msg.sender, _interestRate, _oldInterestRate);
    }

    /**
     * @dev Owner function to set a new interest rate values.
     * @param _interestRate new interest rate values.
     */
    function setInterestRate(uint _interestRate) external onlyManager {
        setInterest(_interestRate);
    }

    /**
     * @dev Supply token to market, but only for owenr.
     * @param _token Token to supply.
     */
    function supply(address _token) external onlyOwner {
    }

    /**
     * @dev Withdraw token from market, but only for owenr.
     * @param _token Token to withdraw.
     * @param _recipient Account address to receive token.
     * @param _amount Token amount to withdraw.
     */
    function withdraw(address _token, address _recipient, uint _amount) external onlyOwner {

        uint _balance = _amount == uint(-1) ? IERC20(_token).balanceOf(address(this)) : _amount;
        require(doTransferOut(_token, _recipient, _balance), 'withdraw: transfer token out of contract failed.');
    }

    /**
     * @dev Take out token, but only for owenr.
     * @param _token Token address to take out.
     * @param _recipient Account address to receive token.
     * @param _amount Token amount to take out.
     */
    function takeOut(address _token, address _recipient, uint _amount) external onlyOwner {
        require(doTransferOut(_token, _recipient, _amount), 'takeOut: transfer token out of contract failed.');
    }

    /**
     * @dev This token `_token` approves to market and dToken contract.
     * @param _token Token address to approve.
     */
    function approve(address _token) public {

        if (IERC20(_token).allowance(address(this), dToken) != uint(-1))
            require(doApprove(_token, dToken, uint(-1)), "approve: Handler contract approve dToken failed.");
    }

    function setBalance(uint _amount) external {
        balance = balance.add(_amount);
    }

    /**
     * @dev Supply token to market, but only for dToken contract.
     * @param _token Token to deposit.
     * @return True is success, false is failure.
     */
    function deposit(address _token, uint _amount) external onlyDToken returns (bool) {
        _token;
        balance = balance.add(_amount);
        return true;
    }

    /**
     * @dev Withdraw token from market, but only for dToken contract.
     * @param _token Token to withdraw.
     * @param _amount Token amount to withdraw.
     * @return Actually withdraw token amount.
     */
    function withdraw(address _token, uint _amount) external onlyDToken returns (uint){
        if (_amount == 0 || IERC20(_token).balanceOf(address(this)) < _amount)
            return 0;
        balance = balance.sub(_amount);
        return _amount;
    }

    /**
     * @dev Redeem token from market, but only for dToken contract.
     * @param _token Token to redeem.
     * @param _amount Token amount to redeem.
     * @return Actually redeem token amount.
     */
    function redeem(address _token, uint _amount) external onlyDToken returns (uint, uint){
        if (_amount == 0 || IERC20(_token).balanceOf(address(this)) < _amount)
            return (0, 0);
        balance = balance.sub(_amount);
        return (_amount, _amount);
    }

    /**
     * @dev Supply balance with any accumulated interest for `_token` belonging to `handler`
     * @param _token Token to get balance.
     */
    function getBalance(address _token) public view returns (uint) {
        return balance;
    }

    /**
     * @dev The maximum withdrawable amount of token `_token` in the market.
     * @param _token Token to get balance.
     */
    function getLiquidity(address _token) public view returns (uint) {
        return IERC20(_token).balanceOf(address(this));
    }

    /**
     * @dev The maximum withdrawable amount of asset `_token` in the market,
     *      and excludes fee, if has.
     * @param _token Token to get actual balance.
     */
    function getRealBalance(address _token) external view returns (uint) {
        return getLiquidity(_token);
    }

    /**
     * @dev Calculate the actual amount of token that has excluded exchange fee
     *      between token and wrapped token, if has.
     * @param _pie Token amount to get.
     */
    function getRealAmount(uint _pie) external view returns (uint) {
        return _pie;
    }

    /**
     * @dev Get token `_token` APR in the market.
     * @param _token Token to get APR.
     */
    function getInterestRate(address _token) external view returns (uint) {
        _token;
        return interestRate;
    }

    function getTargetAddress() external view returns (address) {
        return address(0);
    }

    function getDToken() external view returns (address) {
        return dToken;
    }
}
