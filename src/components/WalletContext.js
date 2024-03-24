import React, { createContext, useContext, useState, useEffect } from "react";

import { connectWallet as connectToWallet } from "../utils/connectWallet";

const WalletContext = createContext();

export const useWallet = () => {
  return useContext(WalletContext);
};

export const WalletProvider = ({ children }) => {
  const [walletStatus, setWalletStatus] = useState("disconnected");
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = async () => {
    try {
      const wallet = await connectToWallet();
      localStorage.setItem("walletStatus", "connected");
      localStorage.setItem("walletAddress", wallet.address);
      setWalletStatus("connected");
      setWalletAddress(wallet.address);
    } catch (error) {
      console.log("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = () => {
    localStorage.removeItem("walletStatus");
    localStorage.removeItem("walletAddress");
    setWalletStatus("disconnected");
    setWalletAddress("");
  };

  useEffect(() => {
    // Function to handle account change
    const handleAccountChange = (accounts) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      } else {
        // No accounts detected, disconnect wallet
        disconnectWallet();
      }
    };

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountChange);
    }

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.off("accountsChanged", handleAccountChange);
      }
    };
  }, []); // Only run once on component mount

  // Load wallet status and address from localStorage on mount
  useEffect(() => {
    const storedStatus = localStorage.getItem("walletStatus");
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedStatus === "connected" && storedAddress) {
      setWalletStatus(storedStatus);
      setWalletAddress(storedAddress);
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        walletStatus,
        walletAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
