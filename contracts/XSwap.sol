pragma solidity ^0.5.4;

import './DSLibrary/DSAuth.sol';
import './DSLibrary/ERC20SafeTransfer.sol';
import './interface/IPriceOracle.sol';
import './interface/ILendFMe.sol';
import './interface/IChai.sol';
import './interface/IUSR.sol';

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

contract XSwap is DSAuth, ERC20SafeTransfer {
	using DSMath for uint;

	uint constant internal OFFSET = 10 ** 18;
	//Mainnet
	// address constant private chai = 0x06AF07097C9Eeb7fD685c692751D5C66dB49c215;
	// IPot constant private pot = IPot(0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7);
	// uint constant RAY = 10 ** 27;
	// address constant private dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
	// address constant private USR = 0xA3A59273494BB5B8F0a8FAcf21B3f666A47d6140;
	// address constant private USDx = 0xeb269732ab75A6fD61Ea60b06fE994cD32a83549;

	//Rinkeby
	address constant private chai = 0x8a5C1BD4D75e168a4f65eB902c289400B90FD980;
	IPot constant private pot = IPot(0xC5881103670131228E8FA62F756202f7D0f79872);
	uint constant RAY = 10 ** 27;
	address constant private dai = 0xA3A59273494BB5B8F0a8FAcf21B3f666A47d6140;

	address constant private USR = 0x1f2B68512A0e4C2CcEFAd0af60E699B22588362a;
	address constant private USDx = 0xD96cC7f80C1cb595eBcdC072531e1799B3a2436E;

	bool private actived;
	address public lendFMe;
	address public oracle;
	bool public isOpen;

	mapping(address => mapping(address => bool)) public tradesDisable; // 1 tokenA = ? tokenB
	mapping(address => mapping(address => uint)) public fee;   // fee from tokenA to tokenB
	mapping(address => bool) public supportLending;
	mapping(address => bool) public tokensEnable; // 1 tokenA = ? tokenB

	constructor() public {
	}

	function active(address _lendFMe, address _oracle) public {
		require(actived == false, "already actived.");
		owner = msg.sender;
		isOpen = true;
		lendFMe = _lendFMe;
		oracle = _oracle;
		actived = true;
	}

	// swap _inputAmount of _input token to get _output token
	function swap(address _input, address _output, uint _inputAmount) public returns (bool) {
		return swap(_input, _output, _inputAmount, msg.sender);
	}

	function swap(address _input, address _output, uint _inputAmount, address _receiver) public returns (bool) {
		require(isOpen, "not open");

		require(doTransferFrom(_input, msg.sender, address(this), _inputAmount));
		if(supportLending[_input]) {
			if (_input == dai) {

				IChai(chai).join(address(this), _inputAmount);
				require(ILendFMe(lendFMe).supply(chai, IERC20(chai).balanceOf(address(this))) == 0, "");
			} else if (_input == USDx) {

				IUSR(USR).mint(address(this), _inputAmount);
				require(ILendFMe(lendFMe).supply(USR, IERC20(USR).balanceOf(address(this))) == 0, "");
			} else
				require(ILendFMe(lendFMe).supply(_input, _inputAmount) == 0, "");
		}
		
		uint _amountToUser = getAmountByInput(_input, _output, _inputAmount);

		require(_amountToUser > 0, "");
		if(supportLending[_output]) {
			if (_output == dai) {

				require(ILendFMe(lendFMe).withdraw(chai, getChaiAmount(_amountToUser)) == 0, ""); //assume chai / dai >= 1;
				IChai(chai).draw(address(this), _amountToUser);
			} else if (_output == USDx) {

				require(ILendFMe(lendFMe).withdraw(USR, getUSRAmount(_amountToUser)) == 0, ""); //assume USR / USDx >= 1;
				IUSR(USR).redeem(address(this), _amountToUser);
			} else
				require(ILendFMe(lendFMe).withdraw(_output, _amountToUser) == 0, "");
		}
		require(doTransferOut(_output, _receiver, _amountToUser));
		return true;
	}

	// swap _inputAmount of _input token to get _output token
	function swapTo(address _input, address _output, uint _OutputAmount) public returns (bool) {
		return swapTo(_input, _output, _OutputAmount, msg.sender);
	}

	function swapTo(address _input, address _output, uint _OutputAmount, address _receiver) public returns (bool) {
		require(isOpen, "not open");

		uint _inputAmount = getAmountByOutput(_input, _output, _OutputAmount);
		require(_inputAmount > 0, "");
		require(doTransferFrom(_input, msg.sender, address(this), _inputAmount));
		if(supportLending[_input]) {
			if (_input == dai) {

				IChai(chai).join(address(this), _inputAmount);
				require(ILendFMe(lendFMe).supply(chai, IERC20(chai).balanceOf(address(this))) == 0, "");
			} else if (_input == USDx) {

				IUSR(USR).mint(address(this), _inputAmount);
				require(ILendFMe(lendFMe).supply(USR, IERC20(USR).balanceOf(address(this))) == 0, "");
			} else
				require(ILendFMe(lendFMe).supply(_input, _inputAmount) == 0, "");
		}

		if(supportLending[_output]) {
			if (_output == dai) {

				require(ILendFMe(lendFMe).withdraw(chai, getChaiAmount(_OutputAmount)) == 0, ""); //assume chai / dai >= 1;
				IChai(chai).draw(address(this), _OutputAmount);
			} else if (_output == USDx) {

				require(ILendFMe(lendFMe).withdraw(USR, getUSRAmount(_OutputAmount)) == 0, ""); //assume USR / USDx >= 1;
				IUSR(USR).redeem(address(this), _OutputAmount);
			} else
				require(ILendFMe(lendFMe).withdraw(_output, _OutputAmount) == 0, "");
		}
		require(doTransferOut(_output, _receiver, _OutputAmount));
		return true;
	}

	function rpow(uint x, uint n, uint base) internal pure returns (uint z) {
        assembly {
            switch x case 0 {switch n case 0 {z := base} default {z := 0}}
            default {
                switch mod(n, 2) case 0 { z := base } default { z := x }
                let half := div(base, 2)  // for rounding.
                for { n := div(n, 2) } n { n := div(n,2) } {
                    let xx := mul(x, x)
                    if iszero(eq(div(xx, x), x)) { revert(0,0) }
                    let xxRound := add(xx, half)
                    if lt(xxRound, xx) { revert(0,0) }
                    x := div(xxRound, base)
                    if mod(n,2) {
                        let zx := mul(z, x)
                        if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) { revert(0,0) }
                        let zxRound := add(zx, half)
                        if lt(zxRound, zx) { revert(0,0) }
                        z := div(zxRound, base)
                    }
                }
            }
        }
    }

	function rmul(uint x, uint y) internal pure returns (uint z) {
        // always rounds down
        z = x.mul(y) / RAY;
    }

	function rdivup(uint x, uint y) internal pure returns (uint z) {
        z = x.mul(RAY).add(y.sub(1)) / y;
    }

	function divScale(uint x, uint y) internal pure returns (uint z) {
        z = x.mul(OFFSET).add(y.sub(1)) / y;
    }

	function getChaiAmount(uint _amount) public view returns (uint) {
		uint _RAY = RAY;
		uint _chi = rpow(pot.dsr(), now - pot.rho(), _RAY).mul(pot.chi()) / _RAY;
		return rdivup(_amount, _chi);
	}

	function getUSRAmount(uint _amount) public view returns (uint) {
		return rdivup(divScale(_amount, OFFSET.sub(IUSR(USR).originationFee())), IUSR(USR).getExchangeRate());
	}

	function exchangeRate(address _input, address _output) public view returns (uint) {
		uint _amount = getAmountByInput(_input, _output, 10 ** IERC20(_input).decimals());
		if (_amount == 0)
			return 0;

		uint _decimals = IERC20(_output).decimals();
		if (_decimals < 18)
			return _amount.mul(10 ** (18 - _decimals));

		return _amount / (10 ** (_decimals - 18));
	}

	function getAmountByInput(address _input, address _output, uint _inputAmount) public view returns (uint) {

		if (!tokensEnable[_input] || !tokensEnable[_output] || tradesDisable[_input][_output])
			return 0;

		IPriceOracle _oracle = IPriceOracle(oracle);
		if (_oracle.assetPrices(_output) == 0)
			return 0;

		uint _tokenAmount = _inputAmount
			.mul(_oracle.assetPrices(_input))
			.div(_oracle.assetPrices(_output))
			.mul(OFFSET.sub(fee[_input][_output])) / OFFSET;

		return _output == USDx ? _tokenAmount.mul(OFFSET.sub(IUSR(USR).originationFee())) / OFFSET : _tokenAmount;
	}

	function getAmountByOutput(address _input, address _output, uint _OutputAmount) public view returns (uint) {

		if (!tokensEnable[_input] || !tokensEnable[_output] || tradesDisable[_input][_output])
			return 0;

		IPriceOracle _oracle = IPriceOracle(oracle);
		if (_oracle.assetPrices(_input) == 0)
			return 0;

		uint _tokenAmount = _output == USDx ? divScale(_OutputAmount, OFFSET.sub(IUSR(USR).originationFee())) : _OutputAmount;
		_tokenAmount = _tokenAmount
			.mul(_oracle.assetPrices(_output))
			.div(_oracle.assetPrices(_input))
			.mul(OFFSET)
			.div(OFFSET.sub(fee[_input][_output]))
			.add(1);

		return _tokenAmount;
	}

	function getLiquidity(address _token) public view returns (uint) {
		if(supportLending[_token]) {

			uint _supplyBalance;
			uint _balance;
			if (_token == dai) {

				_supplyBalance = ILendFMe(lendFMe).getSupplyBalance(address(this), chai);
				_balance = IERC20(chai).balanceOf(lendFMe);
				_balance = _balance < _supplyBalance ? _balance : _supplyBalance;
				return rmul(_balance, rpow(pot.dsr(), now - pot.rho(), RAY).mul(pot.chi()) / RAY);
			} else if (_token == USDx) {

				_supplyBalance = ILendFMe(lendFMe).getSupplyBalance(address(this), USR);
				_balance = IERC20(USR).balanceOf(lendFMe);
				return rmul(_balance < _supplyBalance ? _balance : _supplyBalance, IUSR(USR).getExchangeRate());
			} else
				return ILendFMe(lendFMe).getSupplyBalance(address(this), _token);
		}
		return IERC20(_token).balanceOf(address(this));
	}

	function setLendFMe(address _lendFMe) public auth returns (bool) {
		lendFMe = _lendFMe;
		return true;
	}

	function setOracle(address _oracle) public auth returns (bool) {
		oracle = _oracle;
		return true;
	}

	function enableLending(address _token) public auth returns (bool) {
		require(!supportLending[_token], "the token is already supported lending");
		supportLending[_token] = true;

		if (_token == dai) {

			if (IERC20(_token).allowance(address(this), chai) != uint(-1))
            	require(doApprove(_token, chai, uint(-1)), "");
			if (IERC20(chai).allowance(address(this), lendFMe) != uint(-1))
            	require(doApprove(chai, lendFMe, uint(-1)), "");
		} else if (_token == USDx) {

			if (IERC20(_token).allowance(address(this), USR) != uint(-1))
            	require(doApprove(_token, USR, uint(-1)), "");
			if (IERC20(USR).allowance(address(this), lendFMe) != uint(-1))
            	require(doApprove(USR, lendFMe, uint(-1)), "");
		} else {

			if (IERC20(_token).allowance(address(this), lendFMe) != uint(-1))
            	require(doApprove(_token, lendFMe, uint(-1)), "");
		}

		uint _balance = IERC20(_token).balanceOf(address(this));
		if(_balance > 0) {
			if (_token == dai) {

				IChai(chai).join(address(this), _balance);
				require(ILendFMe(lendFMe).supply(chai, IERC20(chai).balanceOf(address(this))) == 0, "");
			} else if (_token == USDx) {

				IUSR(USR).mint(address(this), _balance);
				require(ILendFMe(lendFMe).supply(USR, IERC20(USR).balanceOf(address(this))) == 0, "");
			} else
				require(ILendFMe(lendFMe).supply(_token, _balance) == 0, "");
		}
		return true;
	}

	function disableLending(address _token) public auth returns (bool) {
		require(supportLending[_token], "the token doesnt support lending");
		supportLending[_token] = false;

		if (_token == dai) {

			ILendFMe(lendFMe).withdraw(chai, uint(-1));
			IChai(chai).exit(address(this), IERC20(chai).balanceOf(address(this)));
		} else if (_token == USDx) {

			ILendFMe(lendFMe).withdraw(USR, uint(-1));
			IUSR(USR).burn(address(this), IERC20(USR).balanceOf(address(this)));
		} else
			ILendFMe(lendFMe).withdraw(_token, uint(-1));

		return true;
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

	function setFee(address _input, address _output, uint _fee) public auth returns (bool) {
		fee[_input][_output] = _fee;
		fee[_output][_input] = _fee;
		return true;
	}

	function emergencyStop(bool _open) external auth returns (bool) {
		isOpen = _open;
		return true;
	}

	function transferOut(address _token, address _receiver, uint _amount) external auth returns (bool) {
		if(supportLending[_token]) {
			if (_token == dai) {

				require(ILendFMe(lendFMe).withdraw(chai, getChaiAmount(_amount)) == 0, "");
				IChai(chai).draw(address(this), _amount);
			} else if (_token == USDx) {

				require(ILendFMe(lendFMe).withdraw(USR, getUSRAmount(_amount)) == 0, "");
				IUSR(USR).redeem(address(this), _amount);
			} else
				require(ILendFMe(lendFMe).withdraw(_token, _amount) == 0, "");
		}
		uint _balance = IERC20(_token).balanceOf(address(this));
		if(_balance >= _amount) {
			require(doTransferOut(_token, _receiver, _amount));
			return true;
		}
		return false;
	}

	function transferOutALL(address _token, address _receiver) external auth returns (bool) {
		if(supportLending[_token]) {
			if (_token == dai) {

				ILendFMe(lendFMe).withdraw(chai, uint(-1));
				IChai(chai).exit(address(this), IERC20(chai).balanceOf(address(this)));
			} else if (_token == USDx) {

				ILendFMe(lendFMe).withdraw(USR, uint(-1));
				IUSR(USR).burn(address(this), IERC20(USR).balanceOf(address(this)));
			} else
				ILendFMe(lendFMe).withdraw(_token, uint(-1));
		}
		uint _balance = IERC20(_token).balanceOf(address(this));
		if(_balance > 0)
			require(doTransferOut(_token, _receiver, _balance));

		return true;
	}

	function transferIn(address _token, uint _amount) external auth returns (bool) {
		require(doTransferFrom(_token, msg.sender, address(this), _amount));
		uint _balance = IERC20(_token).balanceOf(address(this));
		if(supportLending[_token]) {
			if (_token == dai) {

				IChai(chai).join(address(this), _balance);
				require(ILendFMe(lendFMe).supply(chai, IERC20(chai).balanceOf(address(this))) == 0, "");
			} else if (_token == USDx) {

				IUSR(USR).mint(address(this), _balance);
				require(ILendFMe(lendFMe).supply(USR, IERC20(USR).balanceOf(address(this))) == 0, "");
			} else
				require(ILendFMe(lendFMe).supply(_token, _balance) == 0, "");
		}
	    return true;
	}
}