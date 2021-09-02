# Installation

# Contracts
当前版本有以下几份主要的contracts:
 - __NFT.sol__: 生成、储存、管理NFT以及相关信息
 - __Market.sol__: 管理NFT的交易以及利益分配
 - __ShareTokenTemplate.sol__: Share Token的模版（完善中）

 以下罗列了每份合同中的public以及external function，即可以从合同外access的function。其中具有view的function属于getter method，不需要支付gas fee。一些functions会有特殊的modifier作为限制，列举以下: 
 - `onlyAdmin`: 只有admin地址可以call这个function
 - `onlyTokenOwner(tokenId)`: 只有`tokenId`的owner地址可以call这个function
 - `onlyRegisteredNFTContract(nftAddr)`: `nftAddr`必须是已经注册在market合同中的nft合同
 - `nonReentrant`: 用于某些需要防御reentrancy attack的function

 在modifier的基础上，代码逻辑中还会出现更多相关的规则，会尽量在描述中写明。

 某些function会生成event，event可以在链上追溯，前后端可抓取，在相应blockchain explorer网站上也能看到。

## NFT.sol
 - 用户流程：通过mintNFT生成nft，第一次mint时，通过setApprovalForAll将市场合同的地址设定为operator，之后就可以把nft放到市场合同售卖。如果不想完全授权，可以每个生成的nft单独授权，但是推荐一次解决，省用户gas fee。
 - Admin：对具备一定影响力的用户进行认证。

### Events
    event Mint (
        uint256 indexed tokenId,
        address indexed creator,
        string tokenURI,
        uint256 timestamp
    );

    event Verification (
        address indexed creator,
        address indexed admin,
        uint256 timestamp
    );

    event Transfer (
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    event Approval (
        address indexed owner,
        address indexed approved,
        uint256 indexed tokenId
    );

    event ApprovalForAll (
        address indexed owner,
        address indexed operator,
        bool approved
    );

### Functions
 - `function isVerified(address creator) public view returns (bool)`: 返回`creator`是否认证。
 - `function creatorOf(uint256 tokenId) public view returns (address)`: 返回`tokenId`的创作者。
 - `function ownerOf(uint256 tokenId) public view returns (address)`: 返回`tokenId`的拥有者。
 - `function balanceOf(address owner) public view returns (uint256)`: 返回`owner`拥有的的token数量。
 - `function tokenURI(uint256 tokenId) public view returns (string memory)`: 返回存放`tokenId`的metadata的uri。
 - `function getApproved(uint256 tokenId) public view returns (address)`: 返回`tokenId`授权的地址。
 - `function isApprovedForAll(address owner, address operator) public view returns (bool)`: 返回`operator`是否具有`owner`的完全授权。
 - `function approve(address to, uint256 tokenId) public`: caller必须为`tokenId`的拥有者，或具有该拥有者的完全授权。将`tokenId`授权给地址`to`，`to`将有权转手`tokenId`。单个token最多只能同时授权给一个地址，再次授权会覆盖掉之前的地址。生成一个Approval event。
 - `function setApprovalForAll(address operator, bool approved) public`: 设定`operator`是否具有caller的完全授权。若`approved`设定为true，`operator`将有权转手caller所有的token。每个地址可以拥有不止一个具有完全授权的`operator`地址。生成一个ApprovalForAll event。
 - `function mintNFT(string memory tokenURI) public nonReentrant returns (uint256)`: 创建一个token，metadata将存放于`tokenURI`。token的拥有者和创作者为caller。返回`tokenId`。生成一个Mint event。
 - `function transferFrom(address from, address to, uint256 tokenId) public`: `from`必须为`tokenId`的拥有者，caller必须为拥有者或具有授权。将`tokenId`转手给`to`。生成一个Transfer event。
 - `function safeTransferFrom(address from, address to, uint256 tokenId) public`: 同`transferFrom`，但会检查`to`是否为`ERC721Receiver`。
 - `function verify(address creator) public onlyAdmin;`: 认证`creator`。生成一个Verification event。

 ## market.sol
 - 用户流程：通过listToken把nft放到市场上售卖，可以修改价格或取消listing。通过buyToken购买nft。通过withdrawReward取出目前存储的creator reward。
 - Admin：通过withdrawFee取出目前存储的手续费。在未来可注册更多可用的nft合同。

 ### Events
    event Listing (
        uint256 tokenId,
        address indexed from,
        uint256 price,
        uint256 timestamp
    );

    event Cancellation (
        uint256 tokenId,
        address indexed from,
        uint256 timestamp
    );

    event Edit (
        uint256 tokenId,
        address indexed from,
        uint256 oldPrice,
        uint256 newPrice,
        uint256 timestamp
    );

    event Purchase (
        uint256 tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event RewardWithdrawal (
        address indexed creator,
        uint256 amount,
        uint256 timestamp
    );

    event FeeWithdrawal (
        address indexed admin,
        uint256 amount,
        uint256 timestamp
    );

    event NFTContractRegistration (
        address indexed contractAddr,
        address indexed admin,
        uint256 timestamp
    );

 ### Functions
 - `function isListed(uint256 tokenId) public view returns (bool)`: 返回`tokenId`是否listed。
 - `function priceOf(uint256 tokenId) public view returns (uint256)`: 返回`tokenId`的价格。
 - `function rewardOf(address creator) public view returns (uint256)`: 返回`creator`在合同中未取出的奖励余额。
 - `function feeBalance() public view returns (uint256)`: 返回平台在合同中未取出的手续费余额。
 - `function listToken(address nftAddr, uint256 tokenId, uint256 price) public onlyRegisteredNFTContract(nftAddr)`: 将`nftAddr`中的`tokenId`放到市场上售卖，价格为`price`，`price`不为零。caller必须为`tokenId`的owner，市场合同必须已具有授权。listing期间`tokenId`会转手给市场合同，合同内会存储原owner信息，此期间无法通过其他方式再转手该token。生成一个Listing event。
 - `function cancelListing(address nftAddr, uint256 tokenId) public onlyRegisteredNFTContract(nftAddr) onlyTokenOwner(tokenId)`: 取消nftAddr中`tokenId`的listing。tokenId必须已经listed。生成一个Cancellation event。
 - `function setPrice(address nftAddr, uint256 tokenId, uint256 price) public onlyRegisteredNFTContract(nftAddr) onlyTokenOwner(tokenId)`: 将nftAddr中`tokenId`的价格修改为price。`tokenId`必须已经listed。生成一个Edit event。
 - `function buyToken(address nftAddr, uint256 tokenId) public payable nonReentrant onlyRegisteredNFTContrac (nftAddr)`: 购买`nftAddr`中的`tokenId`。装账金额必须等同售卖价格。caller不可以为`tokenId`的owner。抽取3%的金额作为reward存给对应的creator，2%作为平台手续费，这些金额都将存在合同里，可以随时取出。生成一个Purchase event。
 - `function withdrawReward(uint256 amount) public nonReentrant`: 取出caller存于合同中的reward，金额为`amount`。`amount`必须不超过余额。生成一个RewardWithdrawal event。
 - `function withdrawFee(uint256 amount) public nonReentrant onlyAdmin`: 取出存于合同中的平台手续费，金额为`amount`。`amount`必须不超过余额。生成一个FeeWithdrawal event。
 - `function registerNFTContract(address nftAddr) public onlyAdmin`: 将`nftAddr`注册到市场合同中作为可用的nft合同。生成一个Registration event。
