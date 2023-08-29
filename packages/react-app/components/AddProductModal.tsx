// This component is used to add a product to the marketplace.
// Importing the dependencies from react 
import { useState } from "react";
// import ethers to convert the product price to wei
import { ethers } from "ethers";
// Import the toast library to display notifications
import { toast } from "react-toastify";
// Import the useDebounce hook to debounce the input fields
import { useDebounce } from "use-debounce";
// Import our custom useContractSend hook to write a product to the marketplace contract
import { useContractSend } from "@/hooks/contract/useContractWrite";


// Define the AddProductModal component construct
const AddProductModal = () => {
  // The visible state is used to toggle the visibility of the modal
  const [visible, setVisible] = useState(false);
  // The following states are used to store the values of the input fields
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState<string | number>(0);
  const [productDiscount, setProductDiscount] = useState<string | number>(0);
  const [productInstock, setProductInstock] = useState<string | number>(0);
  const [productImage, setProductImage] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productLocation, setProductLocation] = useState("");
  // Sets the state that enables the useContractSend hook to query automatically.
  const [enablequery, setEnableQuery] = useState(false);

  // The following states are used to debounce the input fields
  const [debouncedProductName] = useDebounce(productName, 500);
  const [debouncedProductPrice] = useDebounce(productPrice, 500);
  const [debouncedProductImage] = useDebounce(productImage, 500);
  const [debouncedProductDescription] = useDebounce(productDescription, 500);
  const [debouncedProductLocation] = useDebounce(productLocation, 500);
  const [debouncedProductDiscount] = useDebounce(productDiscount, 500);
  const [debouncedProductInstock] = useDebounce(productInstock, 500);
  // Sets the state for the loading message
  const [loading, setLoading] = useState("");


  // Check if all the input fields are completed
  const isComplete =
    (productName.length > 0 &&
      Number(productPrice) > 0 &&
      productImage.length > 0 &&
      productLocation.length > 0 &&
      Number(productDiscount) >= 0 &&
      Number(productInstock) > 0 &&
      productDescription.length > 0);

  // Clear the input fields after the product is added to the marketplace
  const clearForm = () => {
    setProductName("");
    setProductPrice(0);
    setProductImage("");
    setProductDescription("");
    setProductLocation("");
    setProductDiscount(0);
    setProductInstock(0);
  };

  // Convert the product price to wei
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

  // Makes use of the useContractSend hook and the `writeProduct` function to add a product to the marketplace
  const { writeAsync: createProduct } = useContractSend("writeProduct", [
    debouncedProductName,
    debouncedProductImage,
    debouncedProductDescription,
    debouncedProductLocation,
    productPriceInWei,
    debouncedProductInstock,
    debouncedProductDiscount,
    productPriceWithDiscountInWei
  ], enablequery);

  // Called to reset states and clear the form
  const reSet = () => {
    setEnableQuery(false);
    setLoading("");
    setVisible(false);
    clearForm()
  };

  // Define function that handles the creation of a product through the marketplace contract
  const handleCreateProduct = async () => {

    setTimeout(async () => {
      // throw an error if the `createProduct` utility is undefined.
      if (!createProduct) {
        reSet();
        toast.error("Failed to create product");
        throw "Failed to create product";
      }

      if (!isComplete) throw new Error("Please fill all fields");
      try {
          // sets the setLoading alert
          setLoading("Creating...");
          toast.loading("Creating...", { toastId: 1 });
          // Create the product by calling the `createProduct` utility 
          if (createProduct) {
            // Create the product by calling the `createProduct` utility 
            await createProduct();
            // sets the setLoading alert
            setLoading("Product Added");
            toast.done(1)
            toast.success("Product Added");
            // Reset states and clear form
            setTimeout(() => {
              reSet();
            }, 2500);
          }        
      // Display an error message if something goes wrong
      } catch (e: any) {
        console.log({ e });
        toast.error(e?.message || "Something went wrong. Try again.");
        toast.done(1)
        // Reset states and input fields.
        reSet();
      }
    }, 1500);

  };

  const MAX_DISCOUNT = 100;

  // Asserts a valid discount value
  const validDiscount = (num: number) => {
    return (num < MAX_DISCOUNT);
  }

  // Called to enable and disable all input field and the `useContractSend` hook automatatic query state.  
  const enableSubmit = () => {
    setEnableQuery((prevEnableQuery) => !prevEnableQuery);
  
    document.querySelectorAll('input').forEach((input) => {
      input.disabled = enablequery;
    });
  };

  // Define function that handles the creation of a product, if a user submits the product form
  const addProduct = async (e: any) => {
    e.preventDefault();
    try {
      // Call the handleCreateProduct function
      await handleCreateProduct();
      // Display an error message if something goes wrong
    } catch (e: any) {
      console.log({ e });
      toast.error(e?.message || "Something went wrong. Try again.");
      toast.done(1)
      // Reset states and input fields.
      reSet();
    }
  };

  // Define the JSX that will be rendered
  return (
    <div className={"flex flex-row w-full justify-between py-4"}>
      <div>
        {/* Button Opens the Add product modal when clicked  */}
        <button
          type="button"
          onClick={() => setVisible(true)}
          className="inline-block ml-4 px-6 py-2.5 bg-black text-white font-medium text-md leading-tight rounded-2xl shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
          data-bs-toggle="modal"
          data-bs-target="#exampleModalCenter"
        >
          Add Product
        </button>

        {/* The AddProduct Modal */}
        {visible && (
          <div
            className="absolute z-40 overflow-y-scroll top-0 w-full left-0"
            id="modal"
          >
            {/* Form with input fields for the product, that triggers the addProduct function on submit */}
            <form onSubmit={addProduct}>
              <div className="flex items-center justify-center overflow-y-scroll min-height-80vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Description</label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 bg-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      defaultValue={''}
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
                      type="text"
                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Price (cUSD)</label>
                    <input
                      onChange={(e) => {
                        setProductPrice(Number(e.target.value));

                      }}
                      required

                      className="w-full bg-gray-100 p-2 mt-2 mb-3"
                    />

                    <label>Product Instock </label>
                    <input
                      onChange={(e) => {
                        setProductInstock(Number(e.target.value));
                      }}
                      required
                      type="number"
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
                        setProductDiscount(Number(e.target.value));
                      }}
                      required
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
                      }}
                    >
                      <i className="fas fa-times"></i> {enablequery && "Edit" || "Confirm"}
                    </button>

                    {/* Button to add the product to the marketplace */}
                    {enablequery && (<button
                      type="submit"
                      disabled={!!loading || !isComplete || !createProduct}
                      className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
                    >
                      {loading ? loading : "Create"}
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

export default AddProductModal;
