### Audit by 

​	Horsen Li

​	Jun Liu

​	Skyge Li

​	Snow Ji



### Results

问题1（威胁：较低）： 不支持精度大于18的币种。

建议：可不处理



问题2（威胁：一般）： usdt精度是6，小于0.1的部分无法收到手续费。

建议：修改手续费处理机制，示例代码：

if rate == 0 {

 _fee = 0;

}

else {

​    _fee = (rate/offset).add(1);

}



问题3（威胁：一般）： transferFrom和transfer不一定有返回值，添加require会导致合约执行不成功。

建议：去掉require或者对transfer和transferFrom进行封装，示例代码：

function doTransferIn(address tokenAddr, address from, uint amount) internal returns (bool result) {

​    ERC20NonStandard token = ERC20NonStandard(tokenAddr);

​    token.transferFrom(from, address(this), amount);



​    assembly {

​      switch returndatasize()

​        case 0 {           // This is a non-standard ERC-20

​          result := not(0)     // set result to true

​        }

​        case 32 {           // This is a complaint ERC-20

​          returndatacopy(0, 0, 32)

​          result := mload(0)    // Set `result = returndata` of external call

​        }

​        default {           // This is an excessively non-compliant ERC-20, revert.

​          revert(0, 0)

​        }

​    }

 }



问题4（威胁：一般）： 目前合约适合USDC和USDX之间的1：1兑换，如果支持USDT或者其它非成分币，updatePrice可能需要频繁调用。

建议：从Oracle获取价格