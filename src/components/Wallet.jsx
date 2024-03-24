import React from 'react';
import Button from "@mui/material/Button";
import { useWallet } from './WalletContext';

function Wallet() {
  const { walletStatus, walletAddress, connectWallet, disconnectWallet } = useWallet();

  const truncatedAddress = walletAddress ? `${walletAddress.substring(0, 5)}...${walletAddress.substring(walletAddress.length - 3)}` : '';

  return (
    <div>
    
    
      {walletStatus === 'connected' ? (
        <Button 
          variant="contained" 
          // color="secondary" 
          onClick={disconnectWallet}
          style={{ width: '200px' }} // Set a fixed width
        >
          {truncatedAddress}
        </Button>
      ) : (
        <Button 
          variant="contained" 
          // color="primary" 
          onClick={connectWallet}
          style={{ width: '200px' }} // Set a fixed width
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}

export default Wallet;
