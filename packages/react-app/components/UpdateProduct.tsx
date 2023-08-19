// This component is used to update a product already in the marketplace
// Importing the dependencies from react 
import { useEffect, useState } from "react";
// import ethers to convert the product price
import { ethers } from "ethers";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to update a product in the marketplace contract
import { useContractSend } from "@/hooks/contract/useContractWrite";

// Define the UpdateProductModal component and utilities
const UpdateProductModal = ({ product }: any) => {
  // The visible state is used to toggle the visibility of the modal
  const [visible, setVisible] = useState(false);
  // The following states are used to store the values of the input fields
  const [productName, setProductName] = useState<String | any>("");
  const [productPrice, setProductPrice] = useState<string | number>("");
  const [productOldPrice, setProductOldPrice] = useState<string | number>("");
  const [productDiscount, setProductDiscount] = useState<string | number>("");
  const [productImage, setProductImage] = useState<string | any>("");
  const [productDescription, setProductDescription] = useState<string | any>("");
  const [productLocation, setProductLocation] = useState<string | any>("");
  const [productId, setProductId] = useState<string | any>("");
  // Sets the state which enables the useContractSend hook to query automatically.
  const [enablequery, setEnableQuery] = useState(false);
  // The following states are used to debounce the input fields
  const [debouncedProductName] = useDebounce(productName, 500);
  const [debouncedProductPrice] = useDebounce(productPrice, 500);
  const [debouncedProductImage] = useDebounce(productImage, 500);
  const [debouncedProductDescription] = useDebounce(productDescription, 500);
  const [debouncedProductLocation] = useDebounce(productLocation, 500);
  const [debouncedProductDiscount] = useDebounce(productDiscount, 500);
  const [debouncedProductId] = useDebounce(productId, 500);
  // Sets the state for the loading message
  const [loading, setLoading] = useState("");

  // Checks if all the input fields are completed
  const isComplete =
    (productName.length > 0 &&
      Number(productPrice) > 0 &&
      productImage.length > 0 &&
      productLocation.length > 0 &&
      Number(productDiscount) >= 0 &&
      productDescription.length > 0);

  // Clear the input fields after the product is added to the marketplace
  const clearForm = () => {
    setProductName("");
    setProductPrice(0);
    setProductImage("");
    setProductDescription("");
    setProductLocation("");
    setProductDiscount(0);
  };

  // Convert the old product price from wei
  const productPriceOldFromWei = ethers.utils.formatEther(
    `${productOldPrice.toString() || 0}`
  );

  // Convert the new product price to wei
  const productPriceInWei = Number(ethers.utils.parseEther(
    `${debouncedProductPrice.toString() || 0}`
  ));


  // Convert the product price with discount to wei
  const productPriceWithDiscountInWei = Number(ethers.utils.parseEther(
    `${(Number(debouncedProductPrice) - ((Number(debouncedProductDiscount) / 100) * Number(debouncedProductPrice))).toString() || 0}`
  ));

  // Convert the product price with discount from wie to cUSD
  const productPriceWithDiscountFromWei = ethers.utils.formatEther(
    `${productPriceWithDiscountInWei.toString() || 0}`
  );

  //Make use of the useContractSend hook and the `updateProduct` function to update a product to the marketplace
  const { writeAsync: updateProduct } = useContractSend("updateProduct", [
    debouncedProductName,
    debouncedProductImage,
    debouncedProductDescription,
    debouncedProductLocation,
    debouncedProductDiscount,
    productPriceWithDiscountInWei,
    productPriceInWei,
    debouncedProductId
  ], enablequery);

  //Called to reset states and clear the form
  const reSet = () => {
    setEnableQuery(false);
    setLoading("");
    setVisible(false);
    clearForm()
  };

  // Define function that handles the update of a product through the marketplace contract
  const handleUpdateProduct = async () => {

    setTimeout(async () => {
      // throw an error if the `updateProduct` utility is undefined.
      if (!updateProduct) {
        toast.error("Failed to create product");
        reSet();
        throw "Failed to create product";
      }

      if (!isComplete) throw new Error("Please fill all fields");
      // sets the Loading alert
      setLoading("Updating...");
      toast.loading("Updating...", { toastId: 1 });
      // Update the product by calling the `updateProduct` utility
      await updateProduct();
      // sets the Loading alert 
      toast.done(1)
      setLoading("Product Updated");
      // sets the Success alert 
      toast.success("Product Updated");
      // Reset states and clear the form
      setTimeout(() => {
        reSet();
      }, 2000);
    }, 1500);

  };

  // Asserts a valid discount value
  const validDiscount = (num: number) => {
    return (num < 100);
  }

  // Called to enable and disable all input field and the `useContractSend` hook's automatic query state (`enablequery`). 
  const enableSubmit = () => {
    if (enablequery) {
      document.querySelectorAll('input').forEach((i) => {
        i.disabled = false;
      });
      setEnableQuery(false);
    } else {
      document.querySelectorAll('input').forEach((i) => {
        i.disabled = true;
      });
      setEnableQuery(true);
    }

  }


  // Define function that handles the update of a product, if a user submits the product form
  const doUpdateProduct = async (e: any) => {
    e.preventDefault();
    try {
      // Call the handleUpdateProduct function 
      await handleUpdateProduct()
      // Display an error message if something goes wrong
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
      toast.done(1)
      // Reset states and input fields
      reSet();
    }
  };

  // Populates the Input fields when the product is available
  useEffect(() => {
    if (product) {
      setProductName(product.name);
      setProductOldPrice(product.price)
      setProductDiscount(product.discount);
      setProductImage(product.image);
      setProductDescription(product.description);
      setProductLocation(product.location);
      setProductId(product.id);
    }
  }, [product]);

  // Define the JSX that will be rendered
  return (
    <div className={"flex flex-row w-full justify-between"}>
      <div>
        {/* Button Opens the Update product modal when clicked  */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="inline-block ml-4 px-6 py-2.5 bg-black text-white font-medium text-md leading-tight rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        >
          Update Product
        </button>

        {/* The UpdateProduct Modal */}
        {visible && (
          <div
            className="fixed z-40 overflow-y-auto top-0 w-full left-0"
            id="modal"
          >
            {/* Form with input fields for the product, that triggers the Product `doUpdateProduct` function on submit */}
            <form onSubmit={doUpdateProduct}>
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
                  {/* Input fields for the product */}
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <label>Product Name</label>
                    <input
                      onChange={(e) => {
                        setProductName(e.target.value);
                      }}
                      value={productName}
                      required
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Image (URL)</label>
                    <input
                      onChange={(e) => {
                        setProductImage(e.target.value);
                      }}
                      required
                      value={productImage}
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Description</label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 bg-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      defaultValue={productDescription}
                      required
                      onChange={(e) => {
                        setProductDescription(e.target.value);
                      }}
                    />

                    <label>Product Location</label>
                    <input
                      onChange={(e) => {
                        setProductLocation(e.target.value);
                      }}
                      required
                      value={productLocation}
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Price (cUSD) {`(Old Price ${productPriceOldFromWei.toString()}) cUSD`}</label>
                    <input
                      onChange={(e) => {
                        setProductPrice(Number(e.target.value));
                      }}
                      required
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>price with discount {productPriceWithDiscountFromWei} cUSD</label>
                    <br>
                    </br>
                    <label>Product Discount Input a Value Between (0% - 99%)</label>
                    <input
                      onChange={(e) => {
                        if (!validDiscount(Number(e.target.value))) {
                          setProductDiscount(Number(0))
                          return;
                        }
                        setProductDiscount(Number(e.target.value));;
                      }}
                      required
                      value={productDiscount}
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />
                  </div>
                  {/* Button closes the modal and reset's states when clicked */}
                  <div className="bg-gray-200 px-4 py-3 text-right">
                    <button
                      disabled={!!loading}
                      type="button"
                      className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                      onClick={() => {
                        reSet();
                        setVisible(false);
                      }}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                    {/* Calls the `enableSubmit`function to edit input fields or confirm submit when clicked */}
                    <button
                      type="button"
                      disabled={!isComplete || !!loading}
                      className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                      onClick={() => {
                        enableSubmit();
                        console.log(updateProduct);
                      }}
                    >
                      <i className="fas fa-times"></i> {enablequery && "Edit" || "Confirm"}
                    </button>
                    {/* Button to update the product in the marketplace */}
                    {enablequery && (<button
                      type="submit"
                      disabled={!!loading || !isComplete || !updateProduct}
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                    >
                      {loading ? loading : "Update"}
                    </button>)}

                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateProductModal;
