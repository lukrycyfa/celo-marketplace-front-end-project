// This component displays a store product owned by a connected account and it's utilities.
// Importing the dependencies and utilities from react
import { useState, useEffect, useMemo } from "react";
// import ethers to convert the product price
import { ethers } from "ethers";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the UpdateProductModal for updating the product
import UpdateProductModal from "./UpdateProduct";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom hooks to interact with the smart contract
import { useContractSend } from "@/hooks/contract/useContractWrite";
import { useContractCall } from "@/hooks/contract/useContractRead";

// Define the interface for the product
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

// The MyProduct component construct and utilities, taking the _product and the loading state as Props.
const MyProduct = ({ _product, loading, setLoading }: any) => {
  // Sets the product to be displayed assinging all attributes using the Product Interface.
  const [product, setProduct] = useState<Product | null>(null);
  // Sets the product comments assinging all attributes using the Comments Interface.
  const [comments, setComments] = useState<Comments | null>(null);
  // Sets a function name to be called alongside the `useContractSend` hook
  const [functionname, setFunctionName] = useState<String | any>("");
  // Sets an action to be confirmed as a message when calling the `modifyProduct` function
  const [confirmAction, setConfirmAction] = useState<String | any>("");
  // Sets the args to be passed to the `useContractSend` hook
  const [args, setArgs] = useState<[] | any>([]);
  // Sets the state which enables the useContractSend hook to query automatically.
  const [enablequery, setEnableQuery] = useState(false);
  // Sets The visibilty state of the Addstock, Comments, and Connfirm modals.
  const [visibleAddstock, setVisibleAddstock] = useState(false);
  const [visibleComments, setVisibleComments] = useState(false);
  const [confirmmodal, setConnfirmModal] = useState(false);
  // Sets the visible state of the addstock button.
  const [confirm, setConfirm] = useState(false);
  // This state is used to store the value of the addstock input field
  const [productInstock, setProductInstock] = useState<Number | null>(0);
  // This state is used to debounce the addstock input field
  const [debouncedProductInstock] = useDebounce(productInstock, 500);

  // Checks if the addstock input field is complete
  const isComplete = Number(productInstock) > 0;

  // Clear the input field after stock has been added to the product
  const clearForm = () => {
    setProductInstock(0);
  };

  // The `useContractSend` custom hook, for making calls to the contracts providing a function name and args.
  const { writeAsync: writeProduct } = useContractSend(`${functionname}`, args, enablequery);

  // The `useContractCall` custom hook, for retriving comments relating to this product from the contract.
  const { data: _comments }: any = useContractCall("readProductComents", [Number(_product.productId)], true);
  // Assign the returned comments to the `_productcomment` variables
  const _productcomments = useMemo(()=> _comments ? _comments : [], [_comments]);

  // Resets these States when called. 
  const reSet = () => {
    setEnableQuery(false);
    setArgs([]);
    setFunctionName('');
    setConfirmAction("");
    setLoading("");
    setConnfirmModal(false);
    setVisibleAddstock(false);
    clearForm();
  }

  // Define the `handleWriteProduct` to make modifications to this product through the marketplace contract
  // taking a message as an peremeter for Alerts
  const handleWriteProduct = async (message: String | any) => {

    setTimeout(async () => {
      if (!writeProduct) {
        // throw an error if the `writeProduct` utility is undefined.
        toast.error(`Failed While ${message}ing Product`);
        reSet()
        throw `Failed While ${message}ing Product`;
      }
      try {
          // sets the Loading alert
          setLoading(`${message}ing...`);
          toast.loading(`${message}ing...`, { toastId: 1 })
          // make modifications to the product with the `writeProduct` utility returned from the `useContractSend` hook.
          await writeProduct();
          toast.done(1)
          // sets the Success alert
          toast.success(`${message}ed`)
          reSet();
        // Display an error message if something goes wrong
      } catch (e: any) {
        console.log({ e });
        toast.error(e?.message || "Something went wrong. Try again.");
        toast.done(1)
        reSet();
      }
    }, 2000);

  };

  //The modifyProduct function, called when the user needs to interact with the contract takking a `message` as an arg for alerts.
  const modifyProduct = async (message: String | any) => {
    try {
      // Call the handleWriteProduct function
      await handleWriteProduct(message);
      // Display an error message if something goes wrong
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
      toast.done(1)
      reSet();
    }
  };

  useEffect(() => {
    // Sets the product state making use of `_product`, it's attribute's, and the Product interface 
    // if `_product` is available.
    if (_product) {
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
    }
  }, [_product, _productcomments]);

  // Format the price of the product from wei to cUSD.
  const productPriceFromWei = ethers.utils.formatEther(
    `${product?.price?.toString() || 0}`
  );

  // Convert the product price with discount from wie to cUSD
  const productPriceWithDiscountFromWei = ethers.utils.formatEther(
    `${product?.pricewithdiscount?.toString() || 0}`
  );

  // Return the JSX for the component
  return (

    <div className="flex p-4 py-10 px-10 dark:bg-slate-800 dark:border-slate-700 border-2 transform overflow rounded-lg bg-white text-left shadow-xl font-mono">
      <div className="flex-none w-52 h-64 mb-10  relative z-10 before:absolute before:top-1 before:left-1 before:w-full before:h-full before:bg-teal-400">
        {/* Displays the product's image */}
        <img src={product?.image}
          alt={"image"} 
          className="absolute z-10 inset-0 w-full h-full object-fill object-center rounded-lg" loading="lazy" 
          />
      </div>
      <div className="mt-4 max-h-60 max-w-96 overflow-y-scroll px-4 py-4 ">
        <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-4 before:-left-60 before:-right-6">
          <div className="flex flex-wrap ">
            <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
              {/* Displays the products name */}
              {product?.name}
            </h1>
            <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
              {/* Displays the product's price in cUSD */}
              {productPriceFromWei} cUSD
            </h1>
            <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
              {/* Displays the product's price with discount in cUSD */}
              {productPriceWithDiscountFromWei} cUSD with discount.
            </h1>
            <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
              {/* Displays the amount of this product sold */}
              {product?.sold} sold
            </h1>
            <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
              {/* Displays the amount of this product left instock */}
              {product?.instock} in-stock
            </h1>
            <div className="w-full flex-none text-sm font-medium text-slate-700 mt-2">
              <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
                {/* Displays the product's location */}
                {product?.location}
              </h1>
            </div>
            <div className="w-full flex-none text-sm font-medium text-slate-700 mt-2">
              <h1 className=" relative flex-auto text-lg font-semibold text-white-900">
                {/* Displays the product's discount */}
                {product?.discount}% discount
              </h1>

            </div>
          </div>
        </div>

        <div className="flex space-x-2 mb-6 text-sm font-medium">
          <div className="flex-auto flex space-x-1">
            {/* Sets `functionname`, `args`, `confrimAction`, `enablequery`, and `confirmModal` states when clicked */}
            <button className="h-10 px-6 font-semibold rounded-md border hover:bg-blue-700 dark:border-slate-700 text-slate-400"
              disabled={!!loading}
              onClick={() => {
                setFunctionName('toggleDiscountStatus');
                setArgs([product?.id]);
                setEnableQuery(true);
                setConfirmAction(`${(!product?.ifdiscount && "Enabl" || product?.ifdiscount && "Disabl")}`);
                setConnfirmModal(true);
              }}
            >
              {!product?.ifdiscount && ("enable discount")}

              {product?.ifdiscount && "disable discount"}
            </button>
            {/* Sets `functionname`, `args`, `confrimAction`, `enablequery`, and `confirmModal` states when clicked */}
            <button className="h-10 px-6 font-semibold rounded-md border hover:bg-blue-700 dark:border-slate-700 text-slate-400" type="button"
              disabled={!!loading}
              onClick={() => {
                setFunctionName('deleteProduct');
                setArgs([product?.id]);
                setEnableQuery(true);
                setConfirmAction("Delet");
                setConnfirmModal(true);
              }}
            >
              Delete Product
            </button>

            {/* toggles open the Addstock modal when clicked */}
            <button
              disabled={!!loading}
              type="button"
              onClick={() => setVisibleAddstock(true)}
              className="h-10 px-6 font-semibold rounded-md border hover:bg-blue-700 dark:border-slate-700 text-slate-400" data-bs-toggle="modal"
              data-bs-target="#exampleModalCenter"
            >
              Add Stock
            </button>

            {/* toggles open the Comments modal when clicked */}
            <button
              disabled={!!loading}
              type="button"
              onClick={() => setVisibleComments(true)}
              className="h-10 px-6 font-semibold rounded-md border hover:bg-blue-700 dark:border-slate-700 text-slate-400" data-bs-toggle="modal"
              data-bs-target="#exampleModalCenter"
            >
              View Comments
            </button>
            {/* The Update product Component */}
            <UpdateProductModal product={product} />
          </div>
        </div>
        <p className="text-sm dark:text-slate-400">
          {/* Displays the product's description */}
          {product?.description}
        </p>
      </div>

      {/* The Addstock Modal */}
      {visibleAddstock && (
        <div
          className="fixed z-40  overflow-y-auto top-0 w-full left-0"
          id="modal"
        >

          <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-900 opacity-75" />
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div
              className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {/* Input fields for the amount of products to add to stock */}
                <label>Product Instock </label>
                <input
                  onChange={(e) => {
                    setProductInstock(Number(e.target.value));
                  }}
                  type="number"
                  className="w-full bg-gray-100 p-2 mt-2 mb-3"
                />
              </div>
              {/* cancles pending process and calls the `reSet` function when clicked */}
              <div className="bg-gray-200 px-4 py-3 text-right">
                <button
                  type="button"
                  disabled={!!loading}
                  className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                  onClick={() => {
                    reSet();
                  }}
                >
                  <i className="fas fa-times"></i> Cancel
                </button>

                {/* Sets `functionname`, `args`, `enablequery`, and `confirm` states when clicked */}
                {!confirm && (<button
                  type="button"
                  disabled={!isComplete || !!loading}
                  className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                  onClick={() => {
                    setFunctionName('addStock');
                    setArgs([product?.id, debouncedProductInstock]);
                    setEnableQuery(true);
                    setConfirm(true);

                  }}
                >
                  <i className="fas fa-times"></i> {"Confirm"}
                </button>)}
                {/* calls the `modifyProduct` function to Addstocks with 'addStock'  as `functionname` set in the `useContractSend` hook when clicked */}
                {confirm && (
                  <button
                    type="button"
                    disabled={!isComplete || !!loading}
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                    onClick={() => {
                      modifyProduct("Add");
                    }}
                  >
                    <i className="fas fa-times"></i> {loading ? loading : "Add Stock"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The Comments Modal */}
      {visibleComments && (
        <div
          className="fixed z-40  overflow-y-auto top-0 w-full left-0"
          id="modal"
        >
          <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-900 opacity-75" />
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div
              className="inline-block align-center px-2 py-2 dark:bg-slate-800 dark:border-slate-700 border-2 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >

              <div className="relative mt-6 space-y-2 dark:bg-slate-800 dark:border-slate-700 px-4 py-3 flex-1 px-4 sm:px-6">
                <p className="text-base font-semibold leading-6 text-gray-900">Comments</p>
                <div className="max-h-80 scroll-smooth overflow-y-scroll border-2 rounded-lg shadow-xl border-gray-900/10 pb-12">

                  {/* Displays all comments related to the product */}
                  <div className="mt-2 grid grid-cols-2 px-3 gap-x-2 gap-y-8 sm:grid-cols-6">
                    {comments?.comments.map((com, idx) => (
                      <div className="col-span-full px-4 border-2 dark:border-slate-700 rounded-lg shadow-xl" key={idx}>
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
                {/* toggles close the Comment modal when clicked */}
                <button
                  disabled={!!loading}
                  type="button"
                  className="py-2 px-10 bg-gray-500 text-white rounded hover:bg-gray-700 mr-0"
                  onClick={() => setVisibleComments(false)}
                >
                  <i className="fas fa-times"></i> Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* The Confirmmodal Modal used to confirm modification actions */}
      {confirmmodal && (
        <div
          className="fixed z-40  overflow-y-auto top-0 w-full left-0"
          id="modal"
        >
          <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-900 opacity-75" />
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div
              className="inline-block align-center px-2 py-2 dark:bg-slate-800 dark:border-slate-700 border-2 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="relative mt-6 space-y-2 dark:bg-slate-800 dark:border-slate-700 px-4 py-3 flex-1 px-4 sm:px-6">
                <div className="max-h-48  border-2 rounded-lg shadow-xl border-gray-900/10 pb-12">


                  <div className="mt-6 flex space-x-1 px-10 justify-between">
                    {/* cancles pending proccess and calls the `reSet` function when clicked */}
                    <button
                      type="button"
                      className="h-10 px-6 font-semibold rounded-lg border-2 shadow-xl hover:bg-blue-700 dark:border-slate-700 text-slate-400"
                      disabled={!!loading}
                      onClick={() => {
                        reSet();
                      }}
                    >
                      <i className="fas fa-times"></i> Cancel
                      {/* calls the `modifyProduct` function to modify the contract with the current `functionname` set in the `useContractSend` hook when clicked */}
                    </button>
                    <button className="h-10 px-6 font-semibold rounded-md border-2 shadow-xl hover:bg-blue-700 dark:border-slate-700 text-slate-400" type="button" onClick={() => {
                      modifyProduct(confirmAction);
                    }}
                    >
                      {loading ? loading : `Confirm ${confirmAction}e`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProduct;
