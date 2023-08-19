# Celo MarketPlace Front-End Project

- On this celo marketplace front-end project, developed for the Celo marketplace contract I have made a couple of improvements to the UI/UX, added new features and utilities as part of these improvements. Some of the key improvements made are the comment section, an approval process before a product purchase, a sort product utility, a product discount feature, and more. More details about these features below. 

- The Comment section basically was added for customers and product owners to make reviews on products
- The Approval before purchase process basically is a hook `useContractEvents` added to handle some edge errors keeping track of the user’s purchase approval process asserting from logs there was an approval and provisioned allowance for the product purchase.
- The Sort Product utility is added to sort products in the preferred available order.
- The product discount feature is there basically for the product owner to apply discounts on products and enable or disable these features at will.
- Others
  - The `enablequery` state is an additional feature to the `useContractSend` hook to enable or disable the hook's automatic queries only when args or other requirements for a contract call are complete.
  - Also I added a `setTimeout` function to some function calls that depends on queries made before they could be successfully executed.
  - And a CRUD Modal.

## Used Tech-Stack's  🛠

- [Celo](https://docs.celo.org/) - A carbon-negative, mobile-first, EVM-compatible blockchain ecosystem leading a thriving new digital economy for all.
- [Celo Composer](https://github.com/celo-org/celo-composer#how-to-use-celo-composer) - A CLI tool that enables you to quickly build and deploy dapps on Celo.
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [NextJS](https://nextjs.org/) - A popular open-source framework for building React applications with server-side rendering, automatic code splitting, and optimized performance.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapidly building custom user interfaces.
- [RainbowKit](https://www.rainbowkit.com/) - A React library that makes it easy to add a wallet connection to your dapp.
- [WAGMI](https://wagmi.sh/) - A collection of React hooks that makes it easy to interact with a blockchain.

## Installation and Setup 🛠
- Clone this this repository.

```bash
git clone https://github.com/lukrycyfa/celo-marketplace-front-end-project.git
``` 
- Get a project ID from [walletconnet](https://cloud.walletconnect.com/app) 
  - Create a .env file in the react-app directory and populate this key with the ID.

  ```js
  NEXT_PUBLIC_WC_PROJECT_ID=ID
  ```
- cd into the react-app directory and issue the following commands

```bash
npm install
```
```bash
npm run dev
```
- A link should be provided to interact with your front end on the terminal.

## Testing…
- Follow the link to the dapp, and connect to the app with the `connect wallet` button.
- Add a product to the marketplace with the `Add Product` modal if non is available or just for test purposes. After the product is added it should be available in your store products.
- Purchase a product. While purchasing a product the first click to buy the product pops up metamask where you are to choose `Use Default` for the value to be approved, then wait for the approved notification before proceeding to purchase the product. After purchase the product should be available in your purchased products.

