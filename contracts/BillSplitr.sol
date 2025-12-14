// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title BillSplitr
 * @dev Decentralized expense splitting and settlement on Polygon
 */
contract BillSplitr {
    
    struct Group {
        string name;
        address creator;
        address[] members;
        bool active;
        uint256 createdAt;
    }
    
    struct Expense {
        string groupId;
        address paidBy;
        uint256 amount;
        string category;
        string receiptHash; // IPFS hash
        bool verified;
        uint256 timestamp;
        address[] splitWith;
    }
    
    struct Settlement {
        string groupId;
        address from;
        address to;
        uint256 amount;
        string txHash;
        uint256 timestamp;
        bool completed;
    }
    
    mapping(string => Group) public groups;
    mapping(string => Expense[]) public groupExpenses;
    mapping(string => Settlement[]) public groupSettlements;
    mapping(address => uint256) public creditScores;
    mapping(address => string[]) public userGroups;
    
    event GroupCreated(string indexed groupId, address indexed creator, string name);
    event MemberAdded(string indexed groupId, address indexed member);
    event ExpenseAdded(string indexed groupId, address indexed paidBy, uint256 amount);
    event SettlementCompleted(string indexed groupId, address indexed from, address indexed to, uint256 amount);
    event CreditScoreUpdated(address indexed user, uint256 newScore);
    
    /**
     * @dev Create a new expense group
     */
    function createGroup(string memory groupId, string memory name) external {
        require(groups[groupId].createdAt == 0, "Group already exists");
        
        address[] memory members = new address[](1);
        members[0] = msg.sender;
        
        groups[groupId] = Group({
            name: name,
            creator: msg.sender,
            members: members,
            active: true,
            createdAt: block.timestamp
        });
        
        userGroups[msg.sender].push(groupId);
        
        emit GroupCreated(groupId, msg.sender, name);
    }
    
    /**
     * @dev Add member to group
     */
    function addMember(string memory groupId, address member) external {
        Group storage group = groups[groupId];
        require(group.active, "Group not active");
        require(msg.sender == group.creator, "Only creator can add members");
        
        group.members.push(member);
        userGroups[member].push(groupId);
        
        emit MemberAdded(groupId, member);
    }
    
    /**
     * @dev Add expense to group
     */
    function addExpense(
        string memory groupId,
        uint256 amount,
        string memory category,
        string memory receiptHash,
        address[] memory splitWith
    ) external {
        require(groups[groupId].active, "Group not active");
        require(isMember(groupId, msg.sender), "Not a group member");
        
        Expense memory newExpense = Expense({
            groupId: groupId,
            paidBy: msg.sender,
            amount: amount,
            category: category,
            receiptHash: receiptHash,
            verified: true,
            timestamp: block.timestamp,
            splitWith: splitWith
        });
        
        groupExpenses[groupId].push(newExpense);
        
        emit ExpenseAdded(groupId, msg.sender, amount);
    }
    
    /**
     * @dev Record settlement payment
     */
    function recordSettlement(
        string memory groupId,
        address to,
        uint256 amount,
        string memory txHash
    ) external payable {
        require(groups[groupId].active, "Group not active");
        require(isMember(groupId, msg.sender), "Not a group member");
        require(msg.value >= amount, "Insufficient payment");
        
        // Transfer payment
        payable(to).transfer(amount);
        
        Settlement memory newSettlement = Settlement({
            groupId: groupId,
            from: msg.sender,
            to: to,
            amount: amount,
            txHash: txHash,
            timestamp: block.timestamp,
            completed: true
        });
        
        groupSettlements[groupId].push(newSettlement);
        
        // Update credit scores
        creditScores[msg.sender] += 10;
        creditScores[to] += 5;
        
        emit SettlementCompleted(groupId, msg.sender, to, amount);
        emit CreditScoreUpdated(msg.sender, creditScores[msg.sender]);
        emit CreditScoreUpdated(to, creditScores[to]);
    }
    
    /**
     * @dev Check if address is group member
     */
    function isMember(string memory groupId, address user) public view returns (bool) {
        Group storage group = groups[groupId];
        for (uint256 i = 0; i < group.members.length; i++) {
            if (group.members[i] == user) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Get group details
     */
    function getGroup(string memory groupId) external view returns (
        string memory name,
        address creator,
        address[] memory members,
        bool active,
        uint256 createdAt
    ) {
        Group storage group = groups[groupId];
        return (group.name, group.creator, group.members, group.active, group.createdAt);
    }
    
    /**
     * @dev Get expenses for group
     */
    function getGroupExpenses(string memory groupId) external view returns (Expense[] memory) {
        return groupExpenses[groupId];
    }
    
    /**
     * @dev Get settlements for group
     */
    function getGroupSettlements(string memory groupId) external view returns (Settlement[] memory) {
        return groupSettlements[groupId];
    }
    
    /**
     * @dev Get user's credit score
     */
    function getCreditScore(address user) external view returns (uint256) {
        return creditScores[user];
    }
    
    /**
     * @dev Get user's groups
     */
    function getUserGroups(address user) external view returns (string[] memory) {
        return userGroups[user];
    }
}
