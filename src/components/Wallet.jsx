import React from 'react';
import Button from "@mui/material/Button";
import { useWallet } from './WalletContext';

function Wallet() {
  const { walletStatus, walletAddress, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      <p>Wallet Status: {walletStatus}</p>
      <p>Wallet Address: {walletAddress}</p>
      {walletStatus === 'connected' ? (
        <Button variant="contained" color="secondary" onClick={disconnectWallet}>Disconnect Wallet</Button>
      ) : (
        <Button variant="contained" color="primary" onClick={connectWallet}>Connect Wallet</Button>
      )}
    </div>
  );
}

export default Wallet;
