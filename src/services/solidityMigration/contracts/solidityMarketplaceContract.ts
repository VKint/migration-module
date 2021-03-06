import { ISolidityGenrator } from '../types'

const MARKETPLACE_STATUS_OPEN = 'Open'
const MARKETPLACE_STATUS_CLOSED = 'Closed'

export default (solidityGenerator: ISolidityGenrator) => {
    return marketplace(solidityGenerator)
}

const marketplace = (solidityGenerator: ISolidityGenrator) => {
    const { name, royalties } = solidityGenerator
    return `// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {${name}} from './${name}.sol';

contract ${name}Data {
    
    event ${name}DataStatusChange(uint256 _id, bytes32 status);
    event ${name}DataPriceChange(uint256 _id, uint256 _price);
    event ${name}Sale(uint256 _id, address buyer, address seller);
    
    struct Data {
        address owner;
        ${royalties ? 'address creator;' : ''}
        uint256 id;
        uint256 price;
        bytes32 status;
    }
    
    ${name} public nft;
    
    mapping(uint256 => Data) public datas;
    
    uint256 saleCounter;
    
    constructor(${name} _NFT) public {
        nft = _NFT;
        saleCounter = 0;
    }
    
    function openSale(${name} NFT, uint256 _id) public {
        Data storage data = datas[_id];
        require(msg.sender == data.owner, "status can only be changed by owner");
        NFT.transferFrom(msg.sender, address(this), _id);
        datas[_id].status = "${MARKETPLACE_STATUS_OPEN}";
        emit ${name}DataStatusChange(_id, "${MARKETPLACE_STATUS_OPEN}");
    }
    
    function closeSale(${name} NFT, uint256 _id) public {
        Data storage data = datas[_id];
        require(msg.sender == data.owner, "status can only be changed by owner");
        NFT.transferFrom(address(this), msg.sender, data.id);
        datas[_id].status = "${MARKETPLACE_STATUS_CLOSED}";
        emit ${name}DataStatusChange(_id, "${MARKETPLACE_STATUS_CLOSED}");
    }
    
    function buy(${name} NFT, uint256 _id) payable public {
        address owner = NFT.ownerOf(_id);
        Data storage data = datas[_id];
        require(owner == address(this), 'contract is not the owner');
        require(data.status == "${MARKETPLACE_STATUS_OPEN}", 'must be open trade');
        require(msg.value == data.price, 'value must be identical to price');
        payable(data.owner).transfer(msg.value);
        NFT.approve(msg.sender, data.id);
        NFT.transferFrom(address(this), msg.sender, data.id);
        emit ${name}Sale(_id, msg.sender, data.owner);
        data.owner = msg.sender;
        data.status = "${MARKETPLACE_STATUS_CLOSED}";
        emit ${name}DataStatusChange(_id, "${MARKETPLACE_STATUS_CLOSED}");
    }
    
    function updatePrice(${name} NFT, uint256 _id, uint256 _price) public {
        Data storage data = datas[_id];
        address owner = NFT.ownerOf(_id);
        require(data.status != "${MARKETPLACE_STATUS_OPEN}", 'trade cannot be open');
        require(_price > 0, 'price must be greater than 0');
        require(owner == msg.sender, 'owner can only be changed by owner');
        datas[_id].owner = owner;
        datas[_id].price = _price;
        datas[_id].id = _id;
        emit ${name}DataPriceChange(_id, _price);
    }
    
    function updateStatus(uint256 _id, bytes32 _status) private {
        datas[_id].status = _status;
    }
}
`
}