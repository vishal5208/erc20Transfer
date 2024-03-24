import React, { createContext, useContext, useState } from "react";

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

  // Load wallet status and address from localStorage on mount
  useState(() => {
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
