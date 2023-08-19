// The MyProductList component displays all products purchased and for sale by a connected account
// Importing needed dependencies and utilities from react
import { useState, Fragment, useEffect, useMemo } from "react";
// Import the MyProduct and Purchased components to render products information.
import MyProduct from "./StoreProduct";
import Purchased from "./PurchasedProduct";
// Import other components needed to render information
import { Popover, Transition } from '@headlessui/react';
import ResponsivePagination from 'react-responsive-pagination';
import 'react-responsive-pagination/themes/classic.css';
// Import our custom useContractCall hook to retrive our product from the marketplace contract
import { useContractCall } from "@/hooks/contract/useContractRead";

// The MyProducts component construct and utilities, taking a connected address and the loading state as Props.
const MyProducts = ({ address, loading, setLoading }: any) => {
  // Define the states to store pagination values for displaying the Purchased products and Store products
  const [storePage, setStorePage] = useState(1);
  const [purchasedPage, setPurchasedPage] = useState(1);

  // Define the states to store our returned products from the contract.
  const [storeproducts, setStoreProducts] = useState<[] | any>([]);
  const [purchasedproducts, setPurchasedProducts] = useState<[] | any>([])

  // Instanciate the useContractCall hook to return all connected account Store Products and Purchased Product from the contract.
  const { data: _storeproductsmeta } = useContractCall("readMyProducts", [], true, address);
  const { data: _productsmeta } = useContractCall("readMyPurchasedProducts", [], true, address);

  // Assign the returned products to variables. 
  const _storeproducts =  useMemo(()=> _storeproductsmeta ? _storeproductsmeta : Array, [_storeproductsmeta ]);
  const _purchasedproducts = useMemo(()=> _productsmeta ? _productsmeta : Array, [_productsmeta]);

  // assign the returned products to their respective states
  useEffect(()=>{
    setStoreProducts(_storeproducts);
    setPurchasedProducts(_purchasedproducts);
  },[_storeproducts, _purchasedproducts ])  

  // Define and called to assign returned storeproducts to individual MyProduct components.  
  const getMyStoreProducts = () => {
    var ProductArray = Array();
    // If there are no store products an empty array will be returned
    if (storeproducts) {
      //Loop through the storeproducts, populate a MyProduct component and push it into the products array
      storeproducts.forEach((prod: object | any, id: number | any) => {
        ProductArray.push(
          <MyProduct
            _product={prod}
            key={id}
            loading={loading}
            setLoading={setLoading}
          />
        )
      })
    }
    // return the products array
    return ProductArray;
  }

  // Define and called to assign returned purchasedproducts to individual Purchased components.
  const getPurchasedProducts = () => {
    var ProductArray = Array();
    // If there are no purchased products an empty array will be returned
    if (purchasedproducts) {
      //Loop through the purchasedproducts, populate a Purchased component and push it into the products array
      purchasedproducts.forEach((prod: object | any, id: number | any) => {
        ProductArray.push(
          <Purchased
            _product={prod}
            key={id}
            loading={loading}
            setLoading={setLoading}
          />
        )
      })
    }
    // return the products array
    return ProductArray;
  }

  //Called to change the currently displayed storeproduct
  const storePageChange = (page: number | any) => {
    setStorePage(page);
  }

  //Called to change the currently displayed purchasedproduct
  const purchasedPageChange = (page: number | any) => {
    setPurchasedPage(page);
  }

  // Define the JSX that will be rendered
  return (

    <div className="bg-white dark:bg-slate-900 dark:border-slate-700">
      <header className="relative bg-white dark:bg-slate-900 dark:border-slate-700">
        <p className="flex h-10 items-center justify-center bg-indigo-600 px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          My Products
        </p>
        <nav aria-label="Top" className="mx-auto max-w-7xl  px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center"></div>

            {/* Flyout menus */}
            <Popover.Group className="hidden lg:ml-8 lg:block lg:self-stretch">
              <div className="flex h-full space-x-8">
                {/* Display The Store Products */}
                <Popover className="flex">
                  <>
                    <div className="relative flex">
                      {/* Toggles opens and closes the display store products popover when clicked */}
                      <Popover.Button
                        disabled={!!loading}
                        className="py-2 px-8 bg-gray-500 text-white rounded-lg shadow-xl hover:bg-gray-700 mr-2"
                      >
                        In Store
                      </Popover.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Popover.Panel className="absolute inset-x-0 top-full text-sm text-gray-500">
                        <div className="absolute inset-0 top-1/2  shadow" aria-hidden="true" />

                        <div className="relative  rounded-lg text-left shadow-xl dark:bg-slate-900 dark:border-slate-700">
                          <div className="mx-auto max-w-7xl  px-6  py-8">
                            <div className="overflow-x-scroll items-center justify-center dark:border-slate-800 border-2 flex space-x-2 px-10 rounded-lg grid-cols-4 gap-x-8 gap-y-10 py-20">
                              {/* Displays a selected storeproduct component */}
                              {(<>{getMyStoreProducts()[storePage - 1]}</>)}

                            </div>
                            <div className="py-2">
                              {/* Pagination used to select the displayed component  */}
                              {!loading && (<ResponsivePagination
                                total={getMyStoreProducts().length}
                                current={storePage}
                                onPageChange={page => storePageChange(page)}
                              />)}
                            </div>

                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>

                </Popover>
                {/* Display The Purchased Products */}
                <Popover className="flex">
                  <>
                    <div className="relative flex">
                      {/* Toggles opens and closes the display purchased products popover when clicked */}
                      <Popover.Button
                        disabled={!!loading}
                        className="py-2 px-8 bg-gray-500 text-white rounded-lg shadow-xl hover:bg-gray-700 mr-2"
                      >
                        Purchased
                      </Popover.Button>
                    </div>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Popover.Panel className="absolute inset-x-0 top-full text-sm text-gray-500">
                        <div className="absolute inset-0 top-1/2  shadow" aria-hidden="true" />

                        <div className="relative  rounded-lg text-left shadow-xl dark:bg-slate-900 dark:border-slate-700">
                          <div className="mx-auto max-w-7xl  px-6  py-8">
                            <div className="overflow-x-scroll items-center justify-center dark:border-slate-800 border-2 flex space-x-2 px-10 rounded-lg grid-cols-4 gap-x-8 gap-y-10 py-10">
                              {/* Displays a selected purchasedproduct component */}
                              {(<>{getPurchasedProducts()[purchasedPage - 1]}</>)}
                            </div>
                            <div className="py-2">
                              {/* Pagination used to select the displayed component  */}
                              {!loading && (<ResponsivePagination
                                total={getPurchasedProducts().length}
                                current={purchasedPage}
                                onPageChange={page => purchasedPageChange(page)}
                              />)}
                            </div>
                          </div>
                        </div>
                      </Popover.Panel>
                    </Transition>
                  </>

                </Popover>

              </div>
            </Popover.Group>
          </div>

        </nav>

      </header>

    </div>

  );
};

export default MyProducts;
