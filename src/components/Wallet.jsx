import React, { useEffect, useState } from 'react';
import Button from "@mui/material/Button";
import { useWallet } from './WalletContext';

function Wallet() {
  const { walletStatus, walletAddress, connectWallet, disconnectWallet } = useWallet();
  const [currentWallet, setCurrentWallet] = useState(walletAddress);

  useEffect(() => {
    // Function to handle account change
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setCurrentWallet(accounts[0]);
      } else {
        setCurrentWallet(null);
      }
    };

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    // Cleanup function
    return () => {
      if (window.ethereum) {
        window.ethereum.off("accountsChanged", handleAccountsChanged);
      }
    };
  }, []); // Only run once on component mount

  return (
    <div>
      <p>Wallet Status: {walletStatus}</p>
      <p>Wallet Address: {currentWallet}</p>
      {walletStatus === 'connected' ? (
        <Button variant="contained" color="secondary" onClick={disconnectWallet}>Disconnect Wallet</Button>
      ) : (
        <Button variant="contained" color="primary" onClick={connectWallet}>Connect Wallet</Button>
      )}
    </div>
  );
}

export default Wallet;
