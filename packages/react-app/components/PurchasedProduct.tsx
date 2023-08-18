/* eslint-disable @next/next/no-img-element */
// This component displays a purchased product owned by a connected account and it's utilities.
// Importing the dependencies and utilities from react
import { useCallback, useEffect, useState } from "react";
// Import ethers to format the price of the product correctly
import { ethers } from "ethers";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import our custom hook to interact with the smart contract
import { useContractSend } from "@/hooks/contract/useContractWrite";


// Define the interface for the product
interface Product {
  id: number;
  ownedby: string;
  name: string;
  image: string;
  description: string;
  location: string;
  price: number;
  count: number;
}

// The Purchased component construct and utilities, taking the _product and the loading state as Props.
const Purchased = ({ _product, loading, setLoading }: any) => {
  // Sets the state which enables the useContractSend hooks to query automatically.
  const [enablequery, setEnableQuery] = useState(false);
  // Sets the product to be displayed assinging all attributes using the Product Interface.
  const [product, setProduct] = useState<Product | null>(null);
  // Sets the visible state of the Delete button.
  const [confirm, setConfirm] = useState(false);

  // Makes use of the useContractSend hook and the `deletePurchasedProduct` function to delete a purchased product.
  const { writeAsync: callProduct } = useContractSend("deletePurchasedProduct", [product?.id], enablequery);

  // The `getFormatProduct` function called in a `useEffect` hook to define the product to be displayed. 
  const getFormatProduct = useCallback(() => {
    // Returns null when the product it unavailable
    if (!_product) return null;
    // Sets the product state making use of `_product`, it's attribute's, and the Product interface 
    // if `_product` is available.
    setProduct({
      id: Number(_product.productId),
      ownedby: _product.ownedby,
      name: _product.name,
      image: _product.image,
      description: _product.description,
      location: _product.location,
      price: Number(_product.price),
      count: _product.count.toString()
    });

  }, [_product]);

  // Call the getFormatProduct function when the `_product` state changes
  useEffect(() => {
    getFormatProduct();
  }, [getFormatProduct]);

  // Define the `handleDelete` function to delete the product from the users purchased product
  const handleDelete = async () => {
    // throw an error if the `callProduct` utility is undefined.
    if (!callProduct) {
      toast.error("Failed to delete this product");
      throw "Failed to delete this product";
    }
    // sets the setLoading alert
    setLoading("Deleting...");
    toast.loading("Deleting...", { toastId: 1 });
    // delete the product with the `callProduct` utility returned from the `useContractSend` hook
    await callProduct();
    toast.done(1)
    // Disable the enablquery and confirm states
    setEnableQuery(false);
    setConfirm(false);
    // sets the setSuccess alert;
    toast.success("Deleted Successfully");
  };


  // Define the `modifyProduct` function that is called when the user clicks the Delete Product button
  const modifyProduct = async () => {
    setTimeout(async () => {
      try {
        // call the handleDelete function
        await handleDelete();
        // If there are an error's, display the error message
      } catch (e: any) {
        console.log({ e });
        toast.error(e?.reason || e?.message || "Something went wrong. Try again.");
        // Disable the enablquery and confirm states
        setEnableQuery(false);
        setConfirm(false);
        toast.done(1)
      } finally {
        // sets the setLoading alert
        setLoading("");
      }
    }, 1500);

  };

  // If the product cannot be loaded, return null
  if (!product) return null;

  // Format the price of the product from wei to cUSD 
  const productPriceFromWei = ethers.utils.formatEther(
    product.price.toString()
  );

  // Return the JSX for the product component
  return (
    <div className="flex p-4 py-5 px-5 dark:bg-slate-800 dark:border-slate-700 border-2 transform overflow rounded-lg bg-white text-left shadow-xl font-mono">
      <div className="flex-none w-48 h-60 mb-10  relative z-10 before:absolute before:top-1 before:left-1 before:w-full before:h-full before:bg-teal-400">
        {/* Displays the product's image */}
        <img src={product?.image}
          alt={"image"} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="mt-4 max-h-52 w-80 overflow-y-scroll px-4 py-4 ">
        <div className="relative flex flex-wrap">
          <div className="flex flex-wrap ">
            <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
              {/* Displays the product's name */}
              {product?.name}
            </h1>
            <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
              {/* Displays the product's price in cUSD */}
              {productPriceFromWei} cUSD
            </h1>
            <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
              {/* Displays the amount time the user purchased this */}
              purchased x{product?.count}
            </h1>
            <div className="w-full flex-none text-sm font-medium text-slate-400 mt-2">
              <svg fill="#000000" width="20px" height="20px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <title>location</title>
                <path d="M11.163 11.554c0-2.655 2.166-4.807 4.837-4.807s4.837 2.152 4.837 4.807-2.166 4.806-4.837 4.806-4.837-2.152-4.837-4.806zM7.777 12.154c0 2.011 2.454 6.25 2.454 6.25l5.769 9.614 5.438-9.613c0 0 2.785-4.27 2.785-6.25 0-4.513-3.682-8.171-8.223-8.171s-8.223 3.657-8.223 8.17z"></path>
              </svg>
              <h1 className=" relative flex-auto text-lg font-semibold text-white-400">
                {/* Displays the product's location */}
                {product?.location}
              </h1>
            </div>
          </div>
        </div>
        <div className="flex space-x-4 mb-6 text-sm font-medium">
          <div className="flex-auto flex space-x-4">
            {/* Sets  `enablequery`, and `confirm` states when clicked */}
            {!confirm && (<button
              disabled={!!loading || enablequery}
              onClick={() => {
                setEnableQuery(true);
                setTimeout(() => {
                  setConfirm(true);
                }, 1500);
              }}
              className="mt-4 h-14 w-full border-[1px] dark:border-slate-700 text-black p-2 rounded-lg hover:bg-black hover:text-white"
            >
              Confirm Delete
            </button>
            )}
            {/* Calls `modifyProduct` function when clicked */}
            {confirm && (<><button
              disabled={!!loading}
              onClick={() => {
                setTimeout(() => {
                  modifyProduct();
                }, 1000);
              }}
              className="mt-4 h-14 w-full border-[1px] border-gray-500 text-black p-2 rounded-lg hover:bg-black hover:text-white"
            >
              Delete Product
            </button>
              {/* cancles pending process and Sets `enablequery` and `confirm` states when clicked */}
              <button
                disabled={!!loading}
                onClick={() => {
                  setEnableQuery(false);
                  setConfirm(false);
                }}
                className="mt-4 h-14 w-full border-[1px] border-gray-500 text-black p-2 rounded-lg hover:bg-black hover:text-white"
              >
                Cancle
              </button>
            </>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-400">
          {/* Displays the product's description */}
          {product?.description}
        </p>
      </div>
    </div>
  );
};

export default Purchased;