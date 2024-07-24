// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PublicDebt is ERC20, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // USDT token contract
    IERC20 public immutable usdt;
    
    // Price of each token in USDT (100 USDT with 6 decimals)
    uint256 public constant tokenPrice = 100 * 10**6;
    
    // Annual interest rate in percentage
    uint256 public immutable interestRate;
    
    // Duration of the debt in seconds
    uint256 public immutable duration;
    
    // Timestamp when the debt ends
    uint256 public immutable endTimestamp;

    // List of investors
    address[] public investors;
    
    // Mapping to check if an address is an investor
    mapping(address => bool) private isInvestor;
    
    // Mapping to store the last time an investor claimed interest
    mapping(address => uint256) public lastClaimedTime;

    // Whitelist
    mapping(address => bool) public whitelist;

    // Event emitted when tokens are purchased
    event TokensPurchased(address indexed buyer, uint256 amount);
    
    // Event emitted when interest is claimed
    event InterestClaimed(address indexed investor, uint256 amount);
    
    // Event emitted when capital is redeemed
    event CapitalRedeemed(address indexed investor, uint256 amount);
    
    // Constructor to initialize the contract
    constructor(
        string memory name,
        string memory symbol,
        address _usdt,
        uint256 _debtAmount,
        uint256 _interestRate,
        uint256 _duration
    ) ERC20(name, symbol) {
        // Validating input parameters
        require(_debtAmount > 0, "Debt amount must be greater than zero");
        require(_interestRate > 0, "Interest rate must be greater than zero");
        require(_duration > 0, "Duration must be greater than zero");

        usdt = IERC20(_usdt);
        interestRate = _interestRate;
        duration = _duration;
        endTimestamp = block.timestamp + _duration;

        // Mint initial supply of tokens to the contract
        _mint(address(this), _debtAmount / tokenPrice);
    }

    // Modifier to check if the sender is whitelisted
    modifier onlyWhitelisted() {
        require(whitelist[msg.sender], "Sender is not whitelisted");
        _;
    }

    // Function to add an address to the whitelist
    function addToWhitelist(address account) external onlyOwner {
        whitelist[account] = true;
    }

    // Function to remove an address from the whitelist
    function removeFromWhitelist(address account) external onlyOwner {
        whitelist[account] = false;
    }

    // Function to buy tokens, only for whitelisted addresses
    function buyTokens(uint256 amount) public nonReentrant onlyWhitelisted {
        require(amount > 0, "Amount must be greater than zero");
        
        uint256 cost = amount * tokenPrice;
        require(usdt.balanceOf(msg.sender) >= cost, "Insufficient USDT balance");
        require(usdt.allowance(msg.sender, address(this)) >= cost, "Insufficient allowance");
        
        uint256 balance = balanceOf(address(this));
        require(amount <= balance, "Buy a smaller number of tokens");

        usdt.safeTransferFrom(msg.sender, address(this), cost);
        _transfer(address(this), msg.sender, amount);
        
        if (!isInvestor[msg.sender]) {
            investors.push(msg.sender);
            isInvestor[msg.sender] = true;
            lastClaimedTime[msg.sender] = block.timestamp;
        }

        emit TokensPurchased(msg.sender, amount);
    }

    // Function to claim interest, only for whitelisted addresses
    function claimInterest() public nonReentrant onlyWhitelisted {
        uint256 interest = calculateInterest(msg.sender);
        require(interest > 0, "No interest to claim");
        
        lastClaimedTime[msg.sender] = block.timestamp;
        usdt.safeTransfer(msg.sender, interest);
        emit InterestClaimed(msg.sender, interest);
    }

    // Function to calculate interest for an investor
    function calculateInterest(address investor) public view returns (uint256) {
        uint256 balance = balanceOf(investor);
        uint256 timeElapsed = block.timestamp - lastClaimedTime[investor];
        uint256 totalInterest = balance * interestRate / 100 * timeElapsed / duration;
        return totalInterest;
    }

    // Function to redeem capital after the debt period is over, only for whitelisted addresses
    function redeemCapital() public nonReentrant onlyWhitelisted {
        require(block.timestamp >= endTimestamp, "Contract period not over");
        
        uint256 amount = balanceOf(msg.sender);
        require(amount > 0, "No tokens to redeem");

        _burn(msg.sender, amount);
        usdt.safeTransfer(msg.sender, amount * tokenPrice);
        emit CapitalRedeemed(msg.sender, amount);
    }

    // Function to get the balance of an account
    function getBalance(address account) public view returns (uint256) {
        return balanceOf(account);
    }

    // Function to get the contract's USDT balance
    function getContractUSDTBalance() public view returns (uint256) {
        return usdt.balanceOf(address(this)) / 10**6;
    }

    // Function to get the remaining time for the debt period
    function remainingTime() public view returns (uint256) {
        return endTimestamp - block.timestamp;
    }

}
