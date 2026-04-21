import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
const StockTradingInterface = ({ handleChartsStock }) => {
  const navigate = useNavigate();
  // Sample data
  const stocks = [
    {
      id: 1,
      symbol: "TATASTEEL",
      name: "Tata Steel",
      price: 189.76,
      change: 2.45,
    },
    {
      id: 2,
      symbol: "ONGC",
      name: "Oil and Natural Gas Corporation Ltd.",
      price: 412.33,
      change: -1.23,
    },
    {
      id: 3,
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd.",
      price: 171.22,
      change: 0.78,
    },
    {
      id: 4,
      symbol: "ICICIBANK",
      name: "ICICI Bank Ltd.",
      price: 185.67,
      change: 1.54,
    },
    {
      id: 5,
      symbol: "RELIANCE",
      name: "Realiance",
      price: 175.22,
      change: -2.31,
    },
  ];

  const mutualFunds = [
    {
      id: 1,
      symbol: "NIESSPA",
      name: "Nippon Paints",
      price: 474.55,
      expense: 0.04,
    },
    {
      id: 2,
      symbol: "SBIPSU",
      name: "SBIPSU",
      price: 178.89,
      expense: 0.015,
    },
    {
      id: 3,
      symbol: "MOM50",
      name: "Motilal Oswal",
      price: 116.78,
      expense: 0.04,
    },
    {
      id: 4,
      symbol: "ICICIB22",
      name: "ICICI Presidential Banking",
      price: 135.23,
      expense: 0.015,
    },
    {
      id: 5,
      symbol: "SILVER",
      name: "Aditya Birla Sun Life",
      price: 73.45,
      expense: 0.02,
    },
  ];

  // State management
  const [selectedType, setSelectedType] = useState("stocks");
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [symbol, setSymbol] = useState("TATASTEEL");

  const handleSymbol = () => {
    handleChartsStock(symbol);
  };

  // Handlers
  const handleItemSelect = (item) => {
    setSymbol(item.symbol);
    setSelectedItem(item);
    if (selectedType === "mutualFunds") {
      setPrice(item.price.toString());
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handleSubmit = () => {
    if (selectedItem) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const confirmOrder = () => {
    setShowModal(false);
    setShowConfirmation(true);
    setOrderConfirmed(true);
    
    // Send order data to teleBot API
    fetch('http://localhost:8000/api/teleBot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: selectedItem.symbol,
        name: selectedItem.name,
        type: selectedType === "stocks" ? "Stock" : "Mutual Fund",
        price: selectedType === "stocks" ? selectedItem.price : parseFloat(price),
        quantity: quantity,
        alert : "The stock is getting a drastic change",
        totalValue: parseFloat(totalValue),
        timestamp: new Date().toISOString()
      })
    })
    .then(response => {
      if (!response.ok) {
        console.error('Failed to send order to teleBot');
      }
      return response.json();
    })
    .then(data => console.log('TeleBot notification sent:', data))
    .catch(error => console.error('Error sending to teleBot:', error));
    
    // Auto-close confirmation message after 2 seconds
    setTimeout(() => {
      setShowConfirmation(false);
    }, 2000);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSelectedItem(null);
    setQuantity(1);
    setPrice("");
    setOrderConfirmed(false);
  };

  const totalValue =
    selectedType === "stocks" && selectedItem
      ? (selectedItem.price * quantity).toFixed(2)
      : price
      ? (parseFloat(price) * quantity).toFixed(2)
      : "0.00";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">

<header className="text-center mb-10">
          <h1 className="text-4xl font-semibold text-blue-900 mb-2">Investment Simulator</h1>
        </header>
      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Selection tabs */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 text-center ${
                  selectedType === "stocks"
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-600"
                }`}
                onClick={() => handleTypeChange("stocks")}
              >
                Stocks
              </button>
              <button
                className={`flex-1 py-3 text-center ${
                  selectedType === "mutualFunds"
                    ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                    : "text-gray-600"
                }`}
                onClick={() => handleTypeChange("mutualFunds")}
              >
                Mutual Funds
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {selectedType === "stocks" ? (
                  <ul className="space-y-2">
                    {stocks.map((stock) => (
                      <li
                        key={stock.id}
                        className={`p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                          selectedItem?.id === stock.id &&
                          selectedType === "stocks"
                            ? "bg-blue-50 border border-blue-200"
                            : "border"
                        }`}
                        onClick={() => handleItemSelect(stock)}
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">{stock.symbol}</div>
                          <div
                            className={
                              stock.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            ${stock.price}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {stock.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-2">
                    {mutualFunds.map((fund) => (
                      <li
                        key={fund.id}
                        className={`p-3 rounded-md cursor-pointer hover:bg-gray-50 ${
                          selectedItem?.id === fund.id &&
                          selectedType === "mutualFunds"
                            ? "bg-blue-50 border border-blue-200"
                            : "border"
                        }`}
                        onClick={() => handleItemSelect(fund)}
                      >
                        <div className="flex justify-between">
                          <div className="font-medium">{fund.symbol}</div>
                          <div className="text-gray-800">${fund.price}</div>
                        </div>
                        <div className="text-sm text-gray-600">{fund.name}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Selected item details */}
          <div className="bg-white rounded-lg shadow-sm border p-4 md:col-span-2">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                  <span className="text-lg font-semibold">
                    ${selectedItem.price}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="block mb-1">Symbol</span>
                    <span className="font-medium text-gray-800">
                      {selectedItem.symbol}
                    </span>
                  </div>
                  {selectedType === "stocks" ? (
                    <div className="text-sm text-gray-600">
                      <span className="block mb-1">24h Change</span>
                      <span
                        className={
                          selectedItem.change >= 0
                            ? "font-medium text-green-600"
                            : "font-medium text-red-600"
                        }
                      >
                        {selectedItem.change >= 0 ? "+" : ""}
                        {selectedItem.change}%
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <span className="block mb-1">Expense Ratio</span>
                      <span className="font-medium text-gray-800">
                        {selectedItem.expense}%
                      </span>
                    </div>
                  )}
                </div>

                {orderConfirmed ? (
                  <div className="pt-4 border-t mt-4">
                    <h3 className="text-lg font-medium mb-4">Order Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Symbol:</span>
                        <span className="font-medium">
                          {selectedItem.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">
                          {selectedType === "stocks" ? "Stock" : "Mutual Fund"}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">
                          $
                          {selectedType === "stocks"
                            ? selectedItem.price
                            : price}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-semibold">${totalValue}</span>
                      </div>
                      <button
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition mt-4"
                        onClick={() => {
                          navigate("/stockschart");
                        }}
                      >
                        View Charts
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t mt-4">
                    <h3 className="text-lg font-medium mb-4">Place Order</h3>
                    <div className="space-y-4">
                      {selectedType === "stocks" ? (
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={quantity}
                            min="1"
                            onChange={handleQuantityChange}
                            className="w-full p-2 border rounded-md"
                          />
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Price ($)
                            </label>
                            <input
                              type="number"
                              value={price}
                              min="0.01"
                              step="0.01"
                              onChange={handlePriceChange}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={quantity}
                              min="1"
                              onChange={handleQuantityChange}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>
                        </>
                      )}
                      <div>
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600">Total Value:</span>
                          <span className="font-semibold">${totalValue}</span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSubmit}
                          className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition font-medium"
                        >
                          Submit Order
                        </button>
                        <button
                          className="bg-gray-100 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-200 transition"
                          onClick={handleSymbol}
                        >
                          View Charts
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>
                  Select a {selectedType === "stocks" ? "stock" : "mutual fund"}{" "}
                  to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order confirmation modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Confirmation</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Symbol:</span>
                <span className="font-medium">{selectedItem.symbol}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">
                  {selectedType === "stocks" ? "Stock" : "Mutual Fund"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Price:</span>
                <span className="font-medium">
                  ${selectedType === "stocks" ? selectedItem.price : price}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total Value:</span>
                <span className="font-semibold">${totalValue}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={confirmOrder}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success notification */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Congratulations!
              </h3>
              <p className="text-gray-600">Your order has been confirmed.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTradingInterface;
