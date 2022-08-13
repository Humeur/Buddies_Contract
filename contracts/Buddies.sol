// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';

library Counters {
    struct publicCounter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function.
        uint256 _value; // default: 0
    }

    struct reservedCounter {
        // This variable should never be directly accessed by users of the library: interactions must be restricted to
        // the library's function.
        uint256 _value; // default: 0
    }

    function current(publicCounter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(publicCounter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function current(reservedCounter storage counter) internal view returns (uint256) {
        return counter._value;
    }

    function increment(reservedCounter storage counter) internal {
        unchecked {
            counter._value += 1;
        }
    }

    function setDefaultReservedValue(reservedCounter storage counter, uint256 defaultValue) internal {
        require(counter._value == 0,
                "You can't set the default value if it was done before");

        unchecked {
            counter._value = defaultValue;
        }
    }
}

contract Buddies is ERC721Enumerable, Ownable {
    using Counters for Counters.publicCounter;
    using Counters for Counters.reservedCounter;

    Counters.publicCounter private _tokenIds;
    Counters.reservedCounter private reservedTokenIds;

    uint16 public constant BUDDIES_SUPPLY = 10000;
    uint16 public constant RESERVED_BUDDIES = 1000;
    uint8 public constant MAX_PER_MINT = 10;
    uint256 public constant BUDDY_PRICE = 0.05 ether;

    bool public saleIsActive;
    bool public marketplaceIsActive;

    struct Sale {
        address owner;
        uint256 price;
    }

    mapping(uint256 => Sale) private sales; //tokenId to Sale struct

    string private constant baseURI = "ipfs://QmSAiPb7RKTLuNkAJGFmKFXcfQywW9cckPvNCvsLm81F6i/";

    constructor() ERC721("Buddies", "BUDDY") {
        reservedTokenIds.setDefaultReservedValue(BUDDIES_SUPPLY - RESERVED_BUDDIES);
    }

    function mintBuddy(address _to) internal {
        _safeMint(_to, _tokenIds.current());

        _tokenIds.increment();
    }

    function mintReservedBuddy(address _contractOwnerAddress) internal {
        _safeMint(_contractOwnerAddress, reservedTokenIds.current());

        reservedTokenIds.increment();
    }

    function mintBuddies(uint8 _buddiesToMint) external payable {
        uint256 currentId = _tokenIds.current();

        require(currentId + _buddiesToMint < BUDDIES_SUPPLY - RESERVED_BUDDIES,
                "There is not enough Buddies to mint");
        require(_buddiesToMint > 0,
                "You must mint more than 0 Buddies");
        require(_buddiesToMint <= MAX_PER_MINT,
                "You cannot mint more than 10 Buddies");
        require(msg.value >= BUDDY_PRICE * _buddiesToMint,
                "Buddies are 0.05 ETH each, you must provide enough ethereum to mint");
        require(saleIsActive,
                "Sale is not active, you can't mint right now");

        for (uint8 count = 0; count < _buddiesToMint; ++count) {
            mintBuddy(msg.sender);
        }
    }

    function giftBuddies(uint8 _buddiesToGift, address _to) external payable onlyOwner {
        uint256 currentId = _tokenIds.current();

        require(currentId + _buddiesToGift < BUDDIES_SUPPLY - RESERVED_BUDDIES,
                "There is not enough Buddies to gift");
        require(_buddiesToGift <= MAX_PER_MINT,
                "You cannot gift more than 10 Buddies");
        require(_buddiesToGift > 0,
                "You must gift more than 0 Buddies");

        for (uint8 count = 0; count < _buddiesToGift; ++count) {
            mintBuddy(_to);
        } 
    }

    function mintReservedBuddies(uint16 _buddiesToMint) external payable onlyOwner {
        uint256 currentId = reservedTokenIds.current();

        require(currentId + _buddiesToMint < BUDDIES_SUPPLY,
                "There is not enough Buddies to mint");
        require(_buddiesToMint > 0,
                "You must mint more than 0 Buddies");

        for (uint8 count = 0; count < _buddiesToMint; ++count) {
            mintReservedBuddy(msg.sender);
        }
    }

    function withdraw() external payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0,
                "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success,
                "Transfer failed."
        );
    }

    function listBuddy(uint256 tokenId, uint256 _price) external payable {
        require(_price > 0,
                "Price must be greater than 0 ETH");
        require(ownerOf(tokenId) == msg.sender,
                "You must own a buddy to list it");
        require(marketplaceIsActive,
                "Marketplace is not active, you can't list right now");

        Sale memory sale = Sale(msg.sender, _price);
        sales[tokenId] = sale;
    }

    function unlistBuddy(uint256 tokenId) external payable {
        require(ownerOf(tokenId) == msg.sender,
                "You must own a buddy to unlist it");
        require(sales[tokenId].price != 0,
                "Buddy must be listed to be unlisted");

        delete sales[tokenId];
    }

    function buyBuddy(uint256 tokenId) external payable returns(bool) {
        require(ownerOf(tokenId) != msg.sender,
                "You cannot buy your own Buddy");
        require(msg.value >= sales[tokenId].price,
                "You must provide a sufficient amount of ETH to buy this Buddy");
        require(sales[tokenId].price != 0,
                "This buddy is not for sale");
        require(marketplaceIsActive,
                "Marketplace is not active, you can't buy a buddy right now");

        if (sales[tokenId].owner != ownerOf(tokenId)) {
            delete sales[tokenId];
            return false;
        }

        _safeTransfer(ownerOf(tokenId), msg.sender, tokenId, "");
        return true;
    }

    function buddiesListings(uint256 tokenId) external view returns(Sale memory) {
        return sales[tokenId];
    }

    function buddiesOfOwner(address _owner) external view returns(uint256[] memory) {
        uint256 buddiesCount = balanceOf(_owner);
        uint256[] memory buddiesId = new uint256[](buddiesCount);

        for (uint i = 0; i < buddiesCount; i++) {
            buddiesId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return buddiesId;
    }

    function flipSaleState() external onlyOwner() {
        saleIsActive = !saleIsActive;
    }

    function flipMarketplaceState() external onlyOwner() {
        marketplaceIsActive = !marketplaceIsActive;
    }

    function _baseURI() internal view virtual override returns(string memory) {
        return baseURI;
    }
}