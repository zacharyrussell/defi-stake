import React from 'react';
import { DAppProvider, Kovan } from '@usedapp/core';
import { Header } from "./components/Header"
import { Container } from "@material-ui/core"
import { Main } from "./components/Main"
import { getDefaultProvider } from 'ethers'


function App() {
  return (
    <DAppProvider config={{
      readOnlyChainId: Kovan.chainId,
      readOnlyUrls: {
        [Kovan.chainId]: getDefaultProvider('kovan'),
      },
      notifications: {
        expirationPeriod: 1000,
        checkInterval: 1000
      }
    }}>
      <Header />
      <Container maxWidth="md">
        <div></div>
        <Main />
      </Container>
    </DAppProvider>
  )
}

export default App;
