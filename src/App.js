import React from 'react';
import TokenSender from './TokenSender';
import Wallet from './components/Wallet';
import Grid from '@mui/material/Grid';

import { WalletProvider } from './components/WalletContext';

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <header className="App-header">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <h1>ERC20 Token Sender</h1>
            </Grid>
            <Grid item>
              <Wallet />
            </Grid>
          </Grid>
          <TokenSender />
        </header>
      </div>
    </WalletProvider>
  );
}

export default App;
