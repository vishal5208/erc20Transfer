import { ethers } from 'ethers';

export const connectWallet = async () => {
  try {
    // Check if MetaMask is installed and available
    if (window.ethereum) {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Connect to MetaMask provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Get signer
      const signer = provider.getSigner();

      // Get the current Ethereum account
      const address = await signer.getAddress();

      // Return the wallet object with the address
      return { address };
    } else {
      throw new Error('MetaMask not detected');
    }
  } catch (error) {
    throw new Error('Failed to connect to wallet: ' + error.message);
  }
};
