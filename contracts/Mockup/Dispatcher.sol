pragma solidity ^0.5.4;

interface IHandler {
    function deposit(address _token) external returns (bool);
    function withdraw(address _token, uint _amount) external returns (uint);
    function redeem(address _token, uint _amount) external returns (uint, uint);
    function getBalance(address _token) external view returns (uint);
    function getLiquidity(address _token) external view returns (uint);
    function getRealBalance(address _token) external view returns (uint);
    function getInterestRate(address _token) external view returns (uint);
    function getRealAmount(uint _pie) external view returns (uint);
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

contract Dispatcher is Ownable {

    using SafeMath for uint;

    /**
     * @dev List all handler contract address.
     */
    address[] public handlers;

	/**
     * @dev Deposit ratio of each handler contract.
     *      Notice: the sum of all deposit ratio should be 1000.
     */
    mapping(address => uint) public propotions;

    /**
     * @dev map: handlerAddress -> true/false,
     *      Whether the handler has been added or not.
     */
    mapping(address => bool) public handlerActive;

    /**
     * @dev Set original handler contract and its depoist ratio.
     *      Notice: the sum of all deposit ratio should be 1000.
     * @param _handlers The original support handler contract.
     * @param _propotions The original depoist ratio of support handler.
     */
    constructor (address[] memory _handlers, uint[] memory _propotions) public {
        setHandler(_handlers, _propotions);
    }

    /**
     * @dev Binary sort: sort data from small to large according to its value.
     *      Notice: sort `handlers` accordinng to the `proportion` of each handler
     * @param _data The data to sort, that is the `handlers` at here.
     * @param _left The index of data to start sorting.
     * @param _right The index of data to end sorting.
     */
    function sortByPropotions(address[] storage _data, int _left, int _right) internal {
        int i = _left;
        int j = _right;
        if (i == j)
            return;

        uint _pivot = propotions[_data[uint(_left + (_right - _left) / 2)]];
        while (i <= j) {
            while (propotions[_data[uint(i)]] < _pivot)
                i++;
            while (_pivot < propotions[_data[uint(j)]])
                j--;
            if (i <= j) {
                (_data[uint(i)], _data[uint(j)]) = (_data[uint(j)], _data[uint(i)]);
                i++;
                j--;
            }
        }
        if (_left < j)
            sortByPropotions(_data, _left, j);
        if (i < _right)
            sortByPropotions(_data, i, _right);
    }

    /**
     * @dev Set config for `handlers` and corresponding `propotions`.
     * @param _handlers The support handler contract.
     * @param _propotions Depoist ratio of support handler.
     */
    function setHandler(address[] memory _handlers, uint[] memory _propotions) private {
        // The length of `_handlers` must be equal to the length of `_propotions`.
        require(_handlers.length == _propotions.length, "setHandler: array parameters mismatch");
        uint _sum = 0;
        for (uint i = 0; i < _handlers.length; i++) {
            require(_handlers[i] != address(0), "setHandler: handlerAddr contract address invalid");
            require(_propotions[i] > 0, "setHandler: propotions must greater than 0");
            _sum = _sum.add(_propotions[i]);

            handlers.push(_handlers[i]);
            propotions[_handlers[i]] = _propotions[i];
            handlerActive[_handlers[i]] = true;
        }
        // If the `handlers` is not empty, the sum of `propotions` should be 1000.
        if (handlers.length > 0)
            require(_sum == 1000, "the sum of propotions must be 1000");

        // Sort `handlers` from small to large according to `propotions`.
        sortByPropotions(handlers, int(0), int(handlers.length - 1));
    }

    /**
     * @dev Update `propotions` of the `handlers`.
     * @param _handlers List of the `handlers` to update.
     * @param _propotions List of the `promotions` corresponding to `handlers` to update.
     */
    function updatePropotion(address[] memory _handlers, uint[] memory _propotions) public onlyManager {
        // The length of `_handlers` must be equal to the length of `_propotions`
        require(_handlers.length == _propotions.length && handlers.length == _propotions.length,
                "updatePropotion: array parameters mismatch");

        uint _sum = 0;
        for(uint i = 0; i < _propotions.length; i++){
            require(handlerActive[_handlers[i]], "updatePropotion: the handler contract address does not exist");
            _sum = _sum.add(_propotions[i]);

            propotions[_handlers[i]] = _propotions[i];
        }

        // The sum of `propotions` should be 1000.
        require(_sum == 1000, "the sum of propotions must be 1000");
        // Sort `handlers` from small to large according to the latest `propotions`.
        sortByPropotions(handlers, int(0), int(handlers.length - 1));
    }

	/**
     * @dev Add new handler.
     *      Notice: the corresponding ratio of the new handler is 0.
     * @param _handlers List of the new handlers to add.
     */
    function addHandler(address[] memory _handlers) public onlyManager {

        for(uint i = 0; i < _handlers.length; i++){
            require(!handlerActive[_handlers[i]], "addHandler: handler contract address already exists");
            require(_handlers[i] != address(0), "addHandler: handler contract address invalid");

            handlers.push(_handlers[i]);
            propotions[_handlers[i]] = 0;
            handlerActive[_handlers[i]] = true;
        }
        // Sort `handlers` from small to large according to the latest `propotions`.
        sortByPropotions(handlers, int(0), int(handlers.length - 1));
    }

    /**
     * @dev Query the current handler and the corresponding ratio.
     * @return Return two arrays, one is the current handler,
     *         and the other is the corresponding ratio.
     */
    function getHandler() external view returns (address[] memory, uint[] memory) {
        address[] memory _handlers = handlers;
        uint[] memory _propotions = new uint[](_handlers.length);
        for (uint i = 0; i < _propotions.length; i++)
            _propotions[i] = propotions[_handlers[i]];

        return (_handlers, _propotions);
    }

    /**
     * @dev According to the `propotion` of the `handlers`, calculate corresponding deposit amount.
     * @param _amount The amount to deposit.
     * @return Return two arrays, one is the current handler,
     *         and the other is the corresponding deposit amount.
     */
    function getDepositStrategy(uint _amount) external view returns (address[] memory, uint[] memory) {
        address[] memory _handlers = handlers;

        uint[] memory _amounts = new uint[](_handlers.length);

        uint _sum = 0;
        uint _lastIndex = _amounts.length.sub(1);
        for(uint i = 0; ; i++){
            // Calculate deposit amount according to the `propotion` of the `handlers`,
            // and the last handler gets the remaining quantity directly without calculating.
            if (i == _lastIndex) {
                _amounts[i] = _amount.sub(_sum);
                break;
            }

            _amounts[i] = _amount.mul(propotions[_handlers[i]]) / 1000;
            _sum = _sum.add(_amounts[i]);
        }

        return (_handlers, _amounts);
    }

	/**
     * @dev Sort `handlers` from small to large according to the APR of the corresponding market asset.
     * @param _data The data to sort, that is the `handlers` at here.
     * @param _left The index of data to start sorting.
     * @param _right The index of data to end sorting.
     * @param _token Asset address.
     */
    function sortByInterestRate(address[] memory _data, int _left, int _right, address _token) internal view {
        int i = _left;
        int j = _right;
        if (i == j)
            return;

        uint _pivot = IHandler(_data[uint(_left + (_right - _left) / 2)]).getInterestRate(_token);
        while (i <= j) {
            while (IHandler(_data[uint(i)]).getInterestRate(_token) < _pivot)
                i++;
            while (_pivot < IHandler(_data[uint(j)]).getInterestRate(_token))
                j--;
            if (i <= j) {
                (_data[uint(i)], _data[uint(j)]) = (_data[uint(j)], _data[uint(i)]);
                i++;
                j--;
            }
        }
        if (_left < j)
            sortByInterestRate(_data, _left, j, _token);
        if (i < _right)
            sortByInterestRate(_data, i, _right, _token);
    }

    /**
     * @dev According to new `handlers` which are sorted in order from small to large base on the APR
     *      of corresponding asset, provide a best strategy when withdraw asset.
     * @param _token The asset to withdraw.
     * @param _amount The amount to withdraw including exchange fees between tokens.
     * @return Return two arrays, one is the current handler,
     *         and the other is the corresponding withdraw amount.
     */
    function getWithdrawStrategy(address _token, uint _amount) external view returns (address[] memory, uint[] memory) {

        address[] memory _handlers = handlers;
        // Sort `handlers` from small to large according to the APR of `_token`.
        sortByInterestRate(_handlers, int(0), int(_handlers.length - 1), _token);

        uint[] memory _amounts = new uint[](_handlers.length);

        uint _balance;
        uint _sum = _amount;
        uint _lastIndex = _amounts.length.sub(1);
        for (uint i = 0; ; i++) {
            // The minimum amount can be withdrew from corresponding market.
            _balance = IHandler(_handlers[i]).getLiquidity(_token);
            if (_balance > _sum || i == _lastIndex){
                _amounts[i] = _sum;
                break;
            }

            _amounts[i] = _balance;
            _sum = _sum.sub(_balance);
        }

        return (_handlers, _amounts);
    }

    /**
     * @dev According to new `handlers` which are sorted in order from small to large base on the APR
     *      of corresponding asset, provide a best strategy when redeem asset.
     * @param _token The asset to redeem.
     * @param _amount The amount to redeem without exchange fees between tokens.
     * @return Return two arrays, one is the current handler,
     *         and the other is the corresponding redeem amount.
     */
    function getRedeemStrategy(address _token, uint _amount) external view returns (address[] memory, uint[] memory) {

        address[] memory _handlers = handlers;
        // Sort `handlers` from small to large according to the APR of `_token`.
        sortByInterestRate(_handlers, int(0), int(_handlers.length - 1), _token);

        uint[] memory _amounts = new uint[](_handlers.length);

        uint _balance;
        uint _sum = _amount;
        uint _lastIndex = _amounts.length.sub(1);
        for (uint i = 0; ; i++) {
            // The minimum amount can be redeemed from corresponding market.
            _balance = IHandler(_handlers[i]).getRealBalance(_token);
            if (_balance > _sum || i == _lastIndex){
                _amounts[i] = _sum;
                break;
            }

            _amounts[i] = _balance;
            _sum = _sum.sub(_balance);
        }

        return (_handlers, _amounts);
    }

    /**
     * @dev Get the final amount that  has subtracted the token exchange fee.
     * @param _pie Original amount of the token to query.
     * @return If the token can return directly, return the query amount `_pie`;
     *         if not, return the amount has subtracted the token exchange fee,
     *         eg: When user wants to get back USDx, he will get USR token first, then exchange it to USDx.
     */
    function getRealAmount(uint _pie) external view returns (uint) {
        // Although one `Dispatcher` can contain many `Handler`, type of the `Handler` is same,
        // so just use the `handler[0]`.
        return handlers.length > 0 ? IHandler(handlers[0]).getRealAmount(_pie) : _pie;
    }
}
