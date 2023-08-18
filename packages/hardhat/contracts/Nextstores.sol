// SPDX-License-Identifier: MIT

// Version of Solidity compiler this program was written for
pragma solidity >=0.7.0 <0.9.0;

// Interface for the ERC20 token, in our case cUSD
interface IERC20Token {
    // Transfers tokens from one address to another
    function transfer(address, uint256) external returns (bool);

    // Approves a transfer of tokens from one address to another
    function approve(address, uint256) external returns (bool);

    // Transfers tokens from one address to another, with the permission of the first address
    function transferFrom(address, address, uint256) external returns (bool);

    // Returns the total supply of tokens
    function totalSupply() external view returns (uint256);

    // Returns the balance of tokens for a given address
    function balanceOf(address) external view returns (uint256);

    // Returns the amount of tokens that an address is allowed to transfer from another address
    function allowance(address, address) external view returns (uint256);

    // Event for token transfers
    event Transfer(address indexed from, address indexed to, uint256 value);
    // Event for approvals of token transfers
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

// Contract for the marketplace
contract Marketplace {
    // Keeps track of the number of products added to the marketplace
    uint256 internal productsLength = 0;
    // Keeps track of the number of products available in the marketplace
    uint256 private _liveProCount = 0;
    // Address of the cUSDToken
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    // Structure for a product
    struct Product {
        // The product Id
        uint256 productId;
        // Address of the product owner
        address payable owner;
        // Name of the product
        string name;
        // Link to an image of the product
        string image;
        // Description of the product
        string description;
        // Location of the product
        string location;
        // Price of the product in tokens
        uint256 price;
        // Number of times the product has been sold
        uint256 sold;
        // Amount of product in stock
        uint256 instock;
        // Product discount in percentage
        uint256 discount;
        // Product discount in wei
        uint256 pricewithdiscount;
        // Product discount availability
        bool ifdiscount;
    }

    // Construct for a products comment
    struct ProductComments {
        // Customer making the comment
        address customer;
        // The comment
        string review;
    }

     // Construct for a purchased product
    struct PurchasedProduct {
        // The product Id
        uint256 productId;
        // The owner of the product
        address ownedby;
        // Name of the product
        string name;
        // Link to an image of the product
        string image;
        // Description of the product
        string description;
        // Location of the product
        string location;
        // Price of the product in tokens
        uint256 price;
        // The amount of times this product was purchased
        uint256 count;
    }

    // Construct carrying information of an accounts products
    struct MyProductsInfo {
        // Address to the owner of the products
        address userId;
        // Available amount of purchased products
        uint256 purchased;
        // Available amount of products for sale in stock
        uint256 instock;
        // An array of purchased product Ids
        uint256[] purchasedIds;
        // An array products Ids for sale Ids
        uint256[] instockIds;
    }
    // Mapping of an account to an index of a `PurchasedProduct` construct
    mapping(address => mapping(uint256 => PurchasedProduct)) private _myPurchasedProducts;
    mapping(address => mapping(uint256 => uint256)) private _myPurchasedProductsIdx;
    // Mapping of an account to a construct of `MyProductsInfo`
    mapping(address => MyProductsInfo) private _myProductsInfos;
    // Mapping of products to their index
    mapping(uint256 => Product) internal products;
    // Mapping of a product index to an array of `ProductComments`
    mapping(uint256 => ProductComments[]) private _productComments;

    // uncomment to enable
    // Mapping for an account to sales from products
    // mapping(address =>  uint256) private _salesBalance;

    // Writes a new product to the marketplace
    function writeProduct( string memory _name, string memory _image, string memory _description,
        string memory _location, uint256 _price, uint256 _instock, uint256 _discount, uint256 pricewithdiscount ) public {
        require( bytes(_name).length > 0 && bytes(_image).length > 0 && bytes(_description).length > 0 && bytes(_location).length > 0,
            "Some Inputs Provided Where Invalid");
        productsLength += 1;
        _liveProCount += 1;
        products[productsLength] = Product( productsLength, payable(msg.sender), _name,_image,
            _description, _location, _price, 0, _instock, _discount, pricewithdiscount, false );

        if (_myProductsInfos[msg.sender].userId == msg.sender) {
            _myProductsInfos[msg.sender].instock += 1;
            _myProductsInfos[msg.sender].instockIds.push(productsLength);
            return;
        }

        uint256[] memory purchasedIds;
        uint256[] memory instockIds;
        _myProductsInfos[msg.sender] = MyProductsInfo( msg.sender, 0, 1, purchasedIds, instockIds );
        _myProductsInfos[msg.sender].instockIds.push(productsLength);
        
    }

    // Update existing product in the market place
    function updateProduct( string memory _name, string memory _image, string memory _description,
        string memory _location, uint256 _discount, uint256 pricewithdiscount, uint256 _price, uint256 _index ) public {
        require( msg.sender == products[_index].owner, "Caller Is Unauthorized to Update This Product" );
        require( bytes(_name).length > 0 && bytes(_image).length > 0 && bytes(_description).length > 0 &&
                bytes(_location).length > 0 && _price > 1000, "Some Inputs Provided Where Invalid" );
        products[_index].name = _name;
        products[_index].image = _image;
        products[_index].description = _description;
        products[_index].location = _location;
        products[_index].price = _price;
        products[_index].pricewithdiscount = pricewithdiscount;
        products[_index].discount = _discount;
    }

    // Enable or disable discount applied to a product
    function toggleDiscountStatus(uint256 _index) public {
        require( msg.sender == products[_index].owner, "Caller Is Unauthorized to Update This Product" );
        if (products[_index].ifdiscount) {
            products[_index].ifdiscount = false;
            return;
        }
        products[_index].ifdiscount = true;
    }

    // Add the stock to an existing product
    function addStock(uint256 _index, uint256 _newstock) public {
        require( msg.sender == products[_index].owner, "Caller Is Unauthorized to Update This Product" );
        products[_index].instock += _newstock;
    }

    // Comment on an existing product
    function commentProduct(string memory _comment, uint256 _index) public {
        require( bytes(_comment).length > 0 && bytes(products[_index].name).length > 0,
            "Caller Has Requested An invalid Product Or Provided An Invalid Input"
        );
        _productComments[_index].push(ProductComments(msg.sender, _comment));
    }

    // Delete an existing product
    function deleteProduct(uint256 _index) public {
        require( msg.sender == products[_index].owner, "Caller Is Unauthorized to Update This Product" );
        delete products[_index];
        delete _productComments[_index]; 
        _myProductsInfos[msg.sender].instock -= 1;
        _liveProCount--;
    }

    // Delete an existing purchased product
    function deletePurchasedProduct(uint256 _index) public {
        require(
            msg.sender == _myPurchasedProducts[msg.sender][_index].ownedby,
            "Caller Is Unauthorized to Delete This Product"
        );
        delete _myPurchasedProducts[msg.sender][_index];
        _myProductsInfos[msg.sender].purchased -= 1;
        _myProductsInfos[msg.sender].purchasedIds[_myPurchasedProductsIdx[msg.sender][_index]] = 0;
    }

    // Read all products from on the contract
    function readProducts() public view returns (Product[] memory) {
        uint idx = 0;
        Product[] memory prods = new Product[](_liveProCount);
        for (uint i = 1; i < productsLength+1; i++) {
            if (bytes(products[i].description).length > 0) {
                prods[idx] = products[i];
                idx++;
            }
        }
        return prods;
    }

    // Read all products created by the connected account from the contract
    function readMyProducts() public view returns (Product[] memory) {
        uint idx = 0;
        Product[] memory prods = new Product[](_myProductsInfos[msg.sender].instock);
        for (uint i = 0; i < _myProductsInfos[msg.sender].instockIds.length; i++) {
            if (bytes(products[_myProductsInfos[msg.sender].instockIds[i]].description).length > 0 ) {
                prods[idx] = products[_myProductsInfos[msg.sender].instockIds[i]];
                idx++;
            }
        }
        return prods;
    }

    // Asserts a valid product
    function validProduct(uint Idx) public view returns (bool) {
        return (bytes(products[Idx].description).length > 0 && bytes(products[Idx].name).length > 0);
    }

    // Return a single product from the contract
    function readProduct(uint Idx) public view returns (Product memory) {
        return products[Idx];
    }

    // Return all comments associated to a product
    function readProductComents( uint idx ) public view returns (ProductComments[] memory) {
        return _productComments[idx];
    }

    // uncomment to enable
    // Return sales balance associated to c
    // function readSalesBalance() public view returns (uint)
    // {
    //     return _salesBalance[msg.sender];
    // }

    // Read all purchased products associated with the connected account from the contract
    function readMyPurchasedProducts() public view returns (PurchasedProduct[] memory){
        PurchasedProduct[] memory prods = new PurchasedProduct[](_myProductsInfos[msg.sender].purchased);
        uint idx = 0;
        for (uint i = 0; i < _myProductsInfos[msg.sender].purchasedIds.length; i++) {
            if ( bytes(_myPurchasedProducts[msg.sender][_myProductsInfos[msg.sender].purchasedIds[i]].description).length > 0 ) {
                prods[idx] = _myPurchasedProducts[msg.sender][_myProductsInfos[msg.sender].purchasedIds[i]];
                idx++;
            }
        }
        return prods;
    }

    // Buys a product from the marketplace
    function buyProduct( uint256 _index ) public payable {
        // Transfers the tokens from the buyer to the seller
        require( bytes(products[_index].name).length > 0 && products[_index].productId == _index, "Caller Has Requested An invalid Product");
        require( products[_index].owner != msg.sender, "The Product Owner Is Unauthorized to buy Own Product" );
        require( products[_index].instock > 0, "Requested Product is Out Of Stock");
        uint price = products[_index].price;
        if (products[_index].ifdiscount) {
            price = products[_index].pricewithdiscount;
            require(products[_index].price > price, "Discount Out Of Range");
        }
        require(IERC20Token(cUsdTokenAddress).transferFrom( msg.sender, products[_index].owner, price ), "Transfer failed.");
        // uncomment to enable this line
        // _salesBalance[products[_index].owner] += price;
        if (_myPurchasedProducts[msg.sender][_index].productId == _index &&
            bytes(_myPurchasedProducts[msg.sender][_index].description).length > 0) {
            _myPurchasedProducts[msg.sender][_index].count++;
            products[_index].sold += 1;
            products[_index].instock -= 1;
            return;
        }
        // Increases the number of times the product has been sold
        uint count = 1;
        products[_index].sold += 1;
        products[_index].instock -= 1;
        _myPurchasedProducts[msg.sender][_index] = PurchasedProduct( _index, msg.sender, products[_index].name,products[_index].image,
            products[_index].description, products[_index].location, products[_index].price, count );

        if (_myProductsInfos[msg.sender].userId == msg.sender) {
            _myProductsInfos[msg.sender].purchased += 1;
            _myProductsInfos[msg.sender].purchasedIds.push(_index);
            _myPurchasedProductsIdx[msg.sender][_index] = _myProductsInfos[msg.sender].purchasedIds.length - 1;
            return;
        }

        uint256[] memory purchasedIds;
        uint256[] memory instockIds;
        _myProductsInfos[msg.sender] = MyProductsInfo( msg.sender, 1, 0, purchasedIds, instockIds );
        _myProductsInfos[msg.sender].purchasedIds.push(_index);
        _myPurchasedProductsIdx[msg.sender][_index] = _myProductsInfos[msg.sender].purchasedIds.length - 1;
    }
}
