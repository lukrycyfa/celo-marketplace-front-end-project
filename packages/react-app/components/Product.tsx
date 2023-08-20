/* eslint-disable @next/next/no-img-element */
// This component displays a product and it's utilities.
// Importing the dependencies and utilities from react
import { useCallback, useEffect, useState, Fragment, useMemo } from "react";
// Import ethers to format the price of the product correctly
import { ethers } from "ethers";
// Import other components needed to render information
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Link from "next/link";
// Import the useConnectModal hook to trigger the wallet connect modal
import { useConnectModal } from "@rainbow-me/rainbowkit";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import our custom identicon template to display the owner of the product
import { identiconTemplate } from "@/components/helpers";
// Import our custom hooks to interact with the smart contract
import { useContractApprove } from "@/hooks/contract/useApprove";
import { useContractCall } from "@/hooks/contract/useContractRead";
import { useContractSend } from "@/hooks/contract/useContractWrite";
import { useContractEvents } from "@/hooks/contract/useEvents";

// Define the interface for the product, an interface is a type that describes the properties of an object
interface Product {
  id: number;
  owner: string;
  name: string;
  image: string;
  description: string;
  location: string;
  price: number;
  sold: number;
  instock: number;
  pricewithdiscount: number;
  discount: string;
  ifdiscount: boolean;
}

// Define the interface for a Comment
interface Comment {
  customer: String;
  review: String;
}

// Define the interface for the products Comments
interface Comments {
  comments: Comment[];
}

// The Product component construct and utilities, taking the product, connected address and the loading state as Props.
const Product = ({ _product, address, loading, setLoading }: any) => {
  // Sets the state that enables the useContractSend hook to query automatically.
  const [enablequery, setEnableQuery] = useState(false);
  // Sets the product to be displayed assinging all attributes using the Product Interface.
  const [product, setProduct] = useState<Product | null>(null);
  // Sets the product comments assinging all attributes using the Comments Interface.
  const [comments, setComments] = useState<Comments | null>(null);
  // Sets the visible state of the purchase button when a buyer is getting approved to purchase the product
  const [confirm, setConfirm] = useState(false)
  // Sets the visible state of the comment button
  const [confirmcomment, setConfirmComment] = useState(false);
  // Sets a function name to be called alongside the `useContractSend` hook
  const [functionname, setFunctionName] = useState<String | any>("");
  // Sets the comment to be passed into the args of the `useContractSend` hook
  const [newComment, setNewComment] = useState<String | any>("");
  // Sets the args to be passed to the `useContractSend` hook
  const [args, setArgs] = useState<[] | any>([]);
  // Sets the visible state of the Comments slide over (modal)
  const [open, setOpen] = useState(false);
  // Sets the approved state for the Products before purchase
  const [approved, setApproved] = useState(false);

  // Reassign the product price to the `_price` variable pending on basis the discount is enabled (`ifdiscount`)
  const _price = (!product?.ifdiscount && product?.price.toString() || product?.ifdiscount && product?.pricewithdiscount.toString())

  // Use the useContractApprove hook to approve the spending of the product's price, for the ERC20 cUSD contract  
  const { writeAsync: approve } = useContractApprove(_price || "0");

  // The `useContractEvents` custom hook, keeping track of events the purchase for this product is approved  
  var { approvedEvent, setApprovedEvent } = useContractEvents('Approval', address, confirm);

  // The `useContractSend` custom hook, for making calls to the contracts providing a function name and args.
  const { writeAsync: callProduct } = useContractSend(`${functionname}`, args, enablequery);

  // The `useContractCall` custom hook, for retriving comments relating to this product.
  const { data: _comments }: any = useContractCall("readProductComents", [Number(_product.productId)], true);
  // Assign the returned comments to the `_productcomment` variables
  const _productcomments = useMemo(()=> _comments ? _comments : [], [_comments]);

  // Use the useConnectModal hook to trigger the wallet connect modal
  const { openConnectModal } = useConnectModal();


  // The `getFormatProduct` function called in a `useEffect` hook to define the product to be displayed. 
  const getFormatProduct = useCallback(() => {
    // Returns null when the product it unavailable
    if (!_product) return null;
    // Sets the product state making use of `_product`, it's attribute's, and the Product interface 
    setProduct({
      id: Number(_product.productId),
      owner: _product.owner,
      name: _product.name,
      image: _product.image,
      description: _product.description,
      location: _product.location,
      price: Number(_product.price),
      sold: _product.sold.toString(),
      instock: Number(_product.instock),
      pricewithdiscount: Number(_product.pricewithdiscount),
      discount: `${Number(_product.discount)}`,
      ifdiscount: _product.ifdiscount
    });

    // Returns when the product comments are unavailable
    if (!_productcomments) return;
    // Sets the product comments making use of each comments attribute's and the Comments interface 
    var comms = Array()
    _productcomments.forEach((cm: object | any) => {
      comms.push({
        customer: cm.customer,
        review: cm.review
      })
    })
    setComments({ comments: comms });
  }, [_product, _productcomments]);

  // Call the getFormatProduct function when `_product` state changes
  useEffect(() => {
    getFormatProduct();
  }, [getFormatProduct]);

  // Sets the `Approved`, `ApprovedEvent` and alerts state if `approvedEvent && confirm`.
  useEffect(() => {
    if (approvedEvent && confirm) {
      setApprovedEvent(false);
      setTimeout(() => {
        setEnableQuery(true);
      }, 4000);
      setLoading("");
      toast.done(1)
      setApproved(true);
      toast.success("Purchase Approved")
    }
  }, [approvedEvent, confirm, setApprovedEvent, setLoading ]);

  // Resets these States when called. 
  const reSet = () => {
    setEnableQuery(false);
    setArgs([]);
    setFunctionName("");
    setNewComment("");
    setLoading("");
    setConfirmComment(false);
    setApproved(false);
    setConfirm(false);
  }


  // Define the handlePurchase function which handles the purchase interaction with the smart contract
  const handlePurchase = async () => {
    // throw an error if the `callProduct` utility is undefined.
    if (!callProduct) {
      toast.error("Failed to purchase this product");
      reSet();
      throw "Failed to purchase this product";
    }
    try {
            // sets the setLoading alert
      toast.loading("Purchasing...", { toastId: 1 });
      // makes the product purchase with the `callProduct` utility returned from the `useContractSend` hook.
      await callProduct();
      // sets the Success alert
      toast.done(1);
      toast.success("Product Purchased");
      reSet();
    } catch (e: any) {
      // Display any error's if anything goes wrong with the proccess
      toast.error(e?.reason || e?.message || "Something went wrong. Try again.");
      toast.done(1);
      reSet();
    } 
  };

  // The handleApprove function utilized in make calls to ERC20 cUSD contract to approve the purchase of the product. 
  const handleApprove = async () => {
    // Opens the connection modal when the user is not yet connected
    if (!address && openConnectModal) {
      reSet();
      openConnectModal();
      return;
    }
    // throw an error if the `approve` utility is undefined.
    if (!approve) {
      toast.error("Failed to Approve this Purchase");
      reSet();
      throw "Failed to Approve this Purchase";
    }
    try {
      // sets the Loading alert
      setLoading("Approving...");
      toast.loading("Approving...", { toastId: 1 });
      // Approves the purchase with the `approve` utility returned from the `useContractApprove` hook.
      await approve();
    } catch (e: any) {
      // Display any error's if anything goes wrong with the proccess
      toast.error(e?.reason || e?.message || "Something went wrong. Try again.");
      toast.done(1);
      reSet();
    }
  };

  // Define the handleComment function which handles the creation of a comment for a product on the contract
  const handleComment = async () => {
    // throw an error if the `callProduct` utility is undefined.
    if (!callProduct) {
      toast.error("Failed to comment this product");
      reSet();
      throw "Failed to comment this product";
    }
    try {
      // sets the Loading alert
      toast.loading("commenting...", { toastId: 1 });
      // makes the comment with the `callProduct` utility returned from the `useContractSend` hook.
      await callProduct();
      // sets the Success alert
      toast.done(1)
      toast.success("Done");
      reSet();      
    }catch (e: any) {
      // Display any error's if anything goes wrong with the proccess
      toast.error(e?.reason || e?.message || "Something went wrong. Try again.");
      toast.done(1);
      reSet();
    }  
  };


  //The getProduct function, called when the user needs to interact with the contract taking a `function` and a `message` as args.
  const getProduct = async (message: String | any, func: Function | any) => {
    // sets the Loading alert
    setLoading(`${message}ing...`);
    setTimeout(async () => {
      try {
        // If the user is not connected, trigger the wallet connect modal
        if (!address && openConnectModal) {
          openConnectModal();
          setLoading("");
          return;
        }
        // If the user is connected, call parsed `function`
        await func();
      } catch (e: any) {
        console.log({ e });
        // Display any error's if anything goes wrong with the proccess
        toast.error(e?.reason || e?.message || "Something went wrong. Try again.");
        toast.done(1);
        reSet();
      }
    }, 1500);

  };

  // If the product cannot be loaded, return null
  if (!product) return null;

  // Format the price of the product from wei to cUSD. 
  const productPriceFromWei = ethers.utils.formatEther(
    product.price.toString()
  );

  // Convert the product price with discount from wie to cUSD
  const productPriceWithDiscountInWei = ethers.utils.formatEther(
    product.pricewithdiscount.toString()
  );

  // Return the JSX for the product component
  return (
    <div className="group relative shrink-0 px-3 w-96 border-2 rounded-lg dark:bg-slate-900 dark:border-slate-800 bg-white text-left shadow-xl font-mono p-2">
      <div className="mt-4 flex justify-between ">
        <span
          className={
            "absolute z-10 right-0 mt-4 bg-amber-400 text-black p-1 rounded-l-lg px-4"
          }
        >
          {/* Displays the amount of this product sold */}
          <p className="mt-1 text-sm dark:text-slate-900">{product.sold} sold</p>
          {/* Displays the product's ID */}
          <p className="mt-1 text-sm dark:text-slate-900">ID {product.id}</p>
          {/* Displays the product's discount if enabled */}
          {product.ifdiscount && (<p className="mt-1 text-sm dark:text-slate-900"
          >
            {product.discount}% 0ff
          </p>)}
        </span>
      </div>
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
        {/* Displays the product's image */}
        <img
          src={product.image}
          alt={"image"}
          className="h-full w-full object-fill object-center lg:h-full lg:w-full"
        />
      </div>
      <div className="mt-4 max-h-52 overflow-y-scroll border-2 px-2 py-2 rounded-lg dark:bg-slate-800 dark:border-slate-900">
        <div className="mt-4 flex justify-between">
          {/* Displays the products name */}
          <p className="mt-2 text-1xl font-bold dark:text-slate-200">{product.name}</p>
          {/* Provides a link to the product's owner transactions on explorer */}
          <Link
            href={`https://explorer.celo.org/alfajores/address/${product.owner}`}

          >
            {identiconTemplate(product.owner)}
          </Link>
        </div>
        <div className="mt-1 flex justify-between">
          {/* Displays the products price */}
          <p className="mt-2 text-1xl font-bold dark:text-slate-200">{productPriceFromWei} cUSD</p>
        </div>
        <div className="mt-2 flex justify-between ">

          <div className={"pt-1"}>
            <div className={"max-h-40 overflow-y-hidden scrollbar-hide"}>
              {/* Displays the product's description */}
              <h3 className="mt-4 text-sm dark:text-slate-200">
                {product.description}
              </h3>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <div className={"flex flex-row"}>

            {/* Displays the product's location */}
            <svg fill="#000000" width="20px" height="20px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <title>location</title>
              <path d="M11.163 11.554c0-2.655 2.166-4.807 4.837-4.807s4.837 2.152 4.837 4.807-2.166 4.806-4.837 4.806-4.837-2.152-4.837-4.806zM7.777 12.154c0 2.011 2.454 6.25 2.454 6.25l5.769 9.614 5.438-9.613c0 0 2.785-4.27 2.785-6.25 0-4.513-3.682-8.171-8.223-8.171s-8.223 3.657-8.223 8.17z"></path>
            </svg>
            <h3 className="pt-1 text-sm dark:text-slate-200">{product.location}</h3>
          </div>

        </div>
      </div>

      <div className="mt-3 flex space-x-1 justify-between">
        {/* Sets `functionname`, `args`, `confrim`, `enablequery` states, and calls `handleApprove` when clicked */}
        {address.toUpperCase() !== product.owner.toUpperCase() && (<>
          {!confirm && (<button
            disabled={!!loading || approved}
            onClick={async () => {
              setFunctionName("buyProduct");
              setArgs([product.id]);
              setConfirm(true);
              await handleApprove();
            }}
            className="mt-4 h-14 w-full border-[1px] border-slate-800 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-800 hover:text-black"
          >
            {/* Displays the product's price or the Price With Discount in cUSD pending on the availability of an enabled discount */}
            Buy for {!product.ifdiscount && productPriceFromWei || product.ifdiscount && productPriceWithDiscountInWei} cUSD
          </button>
          )}
          {/* Calls the `getProduct` function when clicked */}
          {confirm && (<button
            disabled={!approved || !!loading || !callProduct}
            onClick={() => {
              setLoading("Purchasing...");
              getProduct("Purchas", handlePurchase);
            }}
            className="mt-4 h-14 w-full border-[1px] border-slate-800 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-800 hover:text-black"
          >
            {/* Displays "Wait..." or " Make Purchase" pending on `approved` */}
            {!approved && "Wait..." || approved && " Make Purchase"}
          </button>
          )}
        </>)}

        {/* toggles open the Comment modal when clicked */}
        {!approved && (<button
          disabled={!!loading}
          className="mt-4 h-14 w-full border-[1px] border-slate-800 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-800 hover:text-black"
          onClick={() => setOpen(true)}
        >
          Comments
        </button>)}
        {/* terminates pending proccess and calls the `reSet` function when clicked */}
        {approved && (<button
          disabled={!!loading}
          className="mt-4 h-14 w-full border-[1px] border-slate-800 dark:text-slate-200 p-2 rounded-lg hover:bg-slate-800 hover:text-black"
          onClick={() => reSet()}
        >
          Cancle
        </button>)}
      </div>
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

          <div className="fixed inset-0 overflow-hidden">
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
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-500"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                        {/* toggles close the Comment modal when clicked */}
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
                          Comments
                        </Dialog.Title>
                      </div>
                      <div className="relative mt-6 space-y-2 dark:bg-slate-800 dark:border-slate-700 py-2 flex-1 px-4 sm:px-6 shadow-xl font-mono">{/* Your content */}

                        <div className="border-b max-h-64 dark:border-slate-700 pb-12">
                          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                            <div className="col-span-full">
                              <label className="block text-sm font-medium leading-6 text-slate-200">
                                Comment Product
                              </label>
                              {/* Text area to input commnets */}
                              <div className="mt-2">
                                <textarea
                                  rows={3}
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                  value={newComment}
                                  onChange={(e) => {
                                    setNewComment(e.target.value);
                                  }}
                                />
                              </div>
                              <p className="mt-3 text-sm leading-6 text-slate-200">Comment on this product.</p>
                            </div>
                          </div>
                          <div className="mt-6 flex space-x-1 justify-between">

                            {/* Sets `functionname`, `args`, `confrimcomment` and `enablequery` states when clicked */}
                            {!confirmcomment && (
                              <>
                                <button
                                  disabled={!!loading || !newComment}
                                  onClick={() => {
                                    setFunctionName("commentProduct");
                                    setArgs([newComment, product.id]);
                                    setEnableQuery(true);
                                    setConfirmComment(true);
                                  }}
                                  className="h-10 px-6 font-semibold rounded-md border hover:bg-blue-700 dark:border-slate-700 text-slate-300"
                                >
                                  Confirm
                                </button>
                              </>
                            )}
                            {/* Calls  the `handleComment` function  when clicked */}
                            {confirmcomment && (
                              <>
                                <button
                                  disabled={!!loading || !callProduct}
                                  onClick={() => {
                                    setLoading("commenting...");
                                    setTimeout(() => {
                                      getProduct("comment", handleComment);
                                    }, 2000);
                                  }}
                                  className="h-10 px-6 font-semibold rounded-md border hover:bg-blue-700 dark:border-slate-700 text-slate-300"
                                >
                                  {/* Displays loading or "Comment" pending on `loading` state */}
                                  {loading ? loading : "Comment"}
                                </button>
                              </>
                            )}
                            {/* Calls the `reSet` function when clicked */}
                            <button
                              disabled={!!loading}
                              onClick={() => {
                                reSet();
                              }}
                              className="h-10 px-6 font-semibold rounded-md border hover:bg-blue-700 dark:border-slate-700 text-slate-300"
                            >
                              Cancle
                            </button>
                          </div>
                        </div>
                        <p className="text-base font-semibold leading-6 text-slate-300">Comments</p>
                        <div className="max-h-80 scroll-smooth px-2 overflow-y-scroll dark:bg-slate-800 dark:border-slate-700 border-2 rounded-lg shadow-xl border-gray-900/10 pb-12">

                          {/* Displays all comments related to the product */}
                          <div className="mt-2 grid grid-cols-2 dark:bg-slate-800 dark:border-slate-700 gap-x-2 gap-y-4 sm:grid-cols-6">
                            {comments?.comments.map((com, idx) => (
                              <div className="col-span-full px-2 border-2 dark:border-slate-700 rounded-lg shadow-xl" key={idx}>
                                <p className="mt-1 text-sm text-gray-500">
                                  Customer ~{" "}{`${com?.customer.slice(0, 6)}...${com?.customer.slice(36, com?.customer.length)}`}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  Review ~{" "}{com?.review}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
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
  );
};

export default Product;