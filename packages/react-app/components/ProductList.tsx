// The ProductList component displays all products for sale in the marketplace and other utilities.
// Importing needed dependencies and utilities from react
import { useState, Fragment, useEffect } from "react";
// Import the useContractCall hook to return all products from the contract to the market place
import { useContractCall } from "@/hooks/contract/useContractRead";
// Import ethers from ethers to convert values
import { ethers } from "ethers";
// Import the AddProductModal, Product, MyProducts and Alert components to add products, render product and alert information.
import AddProductModal from "./AddProductModal";
import MyProducts from "./MyProductList";
import Product from "@/components/Product";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import the custom hook useFeeInfo to read gas fee information form the network
import { useFeeInfo } from "@/hooks/contract/useNeworkFee";
// Import the  `useRetriveBalance` to return address and account balance.
import { useRetriveBalance } from "@/hooks/contract/useReturnBalance";
// Import other components needed to render information
import { Dialog, Transition, Menu } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'


//The ProductList component construct and utilities
const ProductList = () => {
  // Define the states to store the loading messages
  const [loading, setLoading] = useState("");

  // Define the states of which our products are sorted 
  const [sortByprice, setSortByPrice] = useState(false);
  const [sortBysold, setSortBySold] = useState(false);

  // Define the state to store our the returned products from the contract.
  const [marketproducts, setMarketProducts] = useState<[] | any>([]);

  // Sets the visible state of the My Products slide over (modal) 
  const [open, setOpen] = useState(false);

  // Instanciate the useContractCall hook to return all products from the contract to the market place
  const { data: _productsmeta } = useContractCall("readProducts", [], true);

  // Instanciate the useFeeInfo hook to read gas fee information form the network
  const { gasPrice, maxFeePerGas } = useFeeInfo()

  // Instanciate the seRetriveBalance hook to read connected accounts's address and cusdBalance
  const { address, cusdBalance } = useRetriveBalance()

  // Assign the returned products to variable 
  const _products = _productsmeta ? _productsmeta : [];

  // assign the returned products to the state
  useEffect(()=>{
    setMarketProducts(_products);
  },[_products])


  // Define and called to assign returned products to individual product components either sorted or not
  const getProducts = (sortBy?: string | null) => {
    // If there are no products, return null
    if (!marketproducts) return null;
    // assign the retrived products 
    var _retrivedProducts = marketproducts;
    const products = Array();
    // asserts if the the function was called with the sorted parameter
    if (sortBy !== null) {
      // re-assign the the retrived products after been sorted
      _retrivedProducts = sortProducts(_products, sortBy);
    }
    //Loop through the _retrivedProducts, populate a Product component and push it into the products array
    _retrivedProducts.forEach((i: object | any, idx: number | any) => {
      products.push(
        <Product
          key={idx}
          _product={i}
          address={address || ""}
          setLoading={setLoading}
          loading={loading}
        />
      );
    })
    // return the products array
    return products;
  };

  // Defined and called to sort the products taking products and sortBy as paremeters
  const sortProducts = (products: [] | any, sortBy: string | any) => {
    // assign the products to a variable 
    var _sortedProducts = products;
    // and sort products using the sortBy paremeter
    _sortedProducts.sort((pro_one: object | any, pro_two: object | any) => {
      return Number(pro_one[sortBy]) - Number(pro_two[sortBy])
    }).reverse()
    return _sortedProducts;
  }

  // Return the JSX for the component
  return (
    <div>

      {/* Display the products and other utilities */}
      <div className="bg-white dark:bg-slate-800 dark:border-slate-500 font-mono">
        {/* Display the Addproduct modal */}
        {address && (<AddProductModal />)}

        <h1 className="text-3xl font-mono text-center tracking-tight dark:text-slate-300">Next-Stores</h1>
        {/* Toggle opens The My Product modal */}
        <div className="bg-gray-200 px-4 py-3 items-center justify-center dark:bg-slate-800 dark:border-slate-700  border-2 rounded-lg text-right">
          <button
            disabled={!!loading}
            type="button"
            className="py-2 px-8 bg-gray-500 text-white rounded-lg shadow-xl hover:bg-gray-700 mr-2"
            onClick={() => {
              setOpen(true)
            }}
          >
            <i className="fas fa-times"></i> My Products
          </button>

          {/* The Sort Items Drop Down */}
          <Menu as="div" className="relative inline-block  text-left">
            {/* Toggles the Sort Items drop down */}
            <div>
              <Menu.Button className="py-2 px-8 bg-gray-500 text-white rounded-lg shadow-xl hover:bg-gray-700 mr-2">
                Sort Products

              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-20 mt-4 w-56 items-center dark:bg-slate-700 dark:border-slate-600 justify-center origin-top-right divide-y divide-gray-600 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {/* Sort Items by price */}
                <div className="py-1 justify-center grid">
                  <Menu.Item>
                    <button
                      disabled={!!loading}
                      type="button"
                      className="py-2 px-12 bg-gray-500 text-white rounded-lg shadow-xl hover:bg-gray-800 mr-2"
                      onClick={() => {
                        setSortByPrice(true);
                        setSortBySold(false);
                      }}
                    >
                      <i className="fas fa-times"></i> sort by price
                    </button>
                  </Menu.Item>
                </div>
                {/* Sort Items by sold */}
                <div className="py-1 justify-center grid space-x-1">
                  <Menu.Item>
                    <button
                      disabled={!!loading}
                      type="button"
                      className="py-2 px-12 bg-gray-500 text-white rounded-lg shadow-xl hover:bg-gray-800 mr-2"
                      onClick={() => {
                        setSortByPrice(false);
                        setSortBySold(true);
                      }}
                    >
                      <i className="fas fa-times"></i> sort by sold
                    </button>
                  </Menu.Item>
                </div>
                {/* Sort Items in the default order */}
                <div className="py-1 justify-center grid space-x-1">
                  <Menu.Item>
                    <button
                      disabled={!!loading}
                      type="button"
                      className="py-2 px-12 bg-gray-500 text-white rounded-lg shadow-xl hover:bg-gray-800 mr-2"
                      onClick={() => {
                        setSortByPrice(false);
                        setSortBySold(false);
                      }}
                    >
                      <i className="fas fa-times"></i> default order
                    </button>
                  </Menu.Item>

                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
        <div className="mx-auto max-w-2xl items-center justify-center px-1 py-10 sm:px-6 sm:py-10 lg:max-w-7xl lg:px-8 font-mono">
          {/* Displays gas fee and account balance */}
          {address && (<div className="overflow-x-scroll items-center justify-center dark:border-slate-800 border-2 flex space-x-2 px-3 rounded-lg grid-cols-4 gap-x-8 gap-y-10 py-3">
            <h2 className="text-1xl font-bold text-center tracking-tight dark:text-slate-400">FeeData-gasPrice: {ethers.utils.formatEther(gasPrice || 0)} cUSD</h2>
            <h2 className="text-1xl font-bold text-center tracking-tight dark:text-slate-400">FeeData-maxFeePerGas: {ethers.utils.formatEther( maxFeePerGas || 0)} cUSD</h2>
            <h2 className="text-1xl font-bold text-center tracking-tight dark:text-slate-400">Wallet-Balance: {Number(cusdBalance?.formatted || 0).toFixed(2)} cUSD</h2>
          </div>)}
          {(<div className="flex flex-nowrap overflow-x-scroll border-2 dark:bg-slate-800 dark:border-slate-700 space-x-8 px-10 rounded-lg shadow-xl py-10">
            {/* Return Products in individual components in default order */}
            {!sortByprice && !sortBysold && (<>{getProducts()}</>)}
            {/* Return Products in individual components sorted by price */}
            {sortByprice && (<>{getProducts("price")}</>)}
            {/* Return Products in individual components sorted by sold */}
            {sortBysold && (<>{getProducts("sold")}</>)}
          </div>)}

        </div>

        {/* Modal to display connected accounts products both in the marketplace and purchased */}
        <Transition.Root show={open} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0  overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto  relative w-screen max-w-6xl">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        {/* Toggle closes The My Product modal */}
                        <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                          <button
                            disabled={!!loading}
                            type="button"
                            className="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </Transition.Child>
                      <div className="flex h-full flex-col overflow-y-scroll dark:bg-slate-900 dark:border-slate-800 bg-white py-6 shadow-xl">
                        <div className="px-4 sm:px-6">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Panel title
                          </Dialog.Title>
                        </div>
                        <div className="relative mt-6 flex-1  px-4 sm:px-6">
                          {/* Displays the MyProducts Component */}
                          <MyProducts
                            address={address}
                            loading={loading}
                            setLoading={setLoading}
                          />
                        </div>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
      {/* displays any available alert */}
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default ProductList;
