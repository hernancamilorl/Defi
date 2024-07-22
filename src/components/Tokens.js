import React, { Component } from 'react';
import publicDebtContract from '../abis/PublicDebt.json';
import usdtContract from '../abis/MockUSDT.json';
import Web3 from 'web3';
import Swal from 'sweetalert2';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navigation from './Navbar';
import MyCarousel from './Carousel';
import { Container } from 'react-bootstrap';

class Tokens extends Component {
  async componentDidMount() {
    // 1. Load Web3
    await this.loadWeb3();
    // 2. Load Blockchain Data
    await this.loadBlockchainData();
  }

  // 1. Load Web3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Accounts: ', accounts);
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert('You should consider using Metamask!');
    }
  }

  // 2. Load Blockchain Data
  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    console.log('networkId:', networkId);
    const networkData = publicDebtContract.networks[networkId];
    console.log('NetworkData:', networkData);

    if (networkData) {
      const abi = publicDebtContract.abi;
      const address = networkData.address;
      console.log('address:', address);
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });

      // Crear instancia del contrato MockUSDT
      const usdtAddress = usdtContract.networks[networkId].address;
      const usdt = new web3.eth.Contract(usdtContract.abi, usdtAddress);
      this.setState({ usdt, usdtAddress });
    } else {
      window.alert('The Smart Contract is not deployed on the current network!');
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '0x0',
      loading: true,
      contract: null,
      errorMessage: ''
    };
  }

  _getBalance = async () => {
    try {
      console.log("Fetching user's token balance...");
      const balance = await this.state.contract.methods.balanceOf(this.state.account).call();
      Swal.fire({
        icon: 'info',
        title: 'User Token Balance:',
        width: 800,
        padding: '3em',
        text: `${balance} tokens`,
        backdrop: `
          rgba(15, 238, 168, 0.2)
          left top
          no-repeat
        `
      });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  _getContractBalance = async () => {
    try {
      console.log("Fetching contract's token balance...");
      const balance = await this.state.contract.methods.balanceOf(this.state.contract.options.address).call();
      Swal.fire({
        icon: 'info',
        title: 'Contract Token Balance:',
        width: 800,
        padding: '3em',
        text: `${balance} tokens`,
        backdrop: `
          rgba(15, 238, 168, 0.2)
          left top
          no-repeat
        `
      });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  _getContractBalanceUSDT = async () => {
    try {
      console.log("Fetching contract's token balance...");
      const balance = await this.state.contract.methods.getUSDTBalance().call();
      Swal.fire({
        icon: 'info',
        title: 'Contract USDT Balance:',
        width: 800,
        padding: '3em',
        text: `${balance} USDT`,
        backdrop: `
          rgba(15, 238, 168, 0.2)
          left top
          no-repeat
        `
      });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  _buyTokens = async (amount) => {
    try {
      console.log("Buying tokens...");
      const tokenPrice = 100 * 10 ** 6; // 100 USDT with 6 decimals
      const usdtAmount = amount * tokenPrice;

      const spender = this.state.contract.options.address; // Dirección del contrato PublicDebt

      // Aprobar el contrato para gastar USDT en nombre del usuario
      await this._approveUSDT(spender, amount);
      
      await this.state.contract.methods.buyTokens(amount).send({ 
        from: this.state.account
      });

      Swal.fire({
        icon: 'success',
        title: 'Token Purchase Successful!',
        width: 800,
        padding: '3em',
        text: `You have purchased ${amount} tokens for ${usdtAmount / 10 ** 6} USDT`,
        backdrop: `
          rgba(15, 238, 168, 0.2)
          left top
          no-repeat
        `
      });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    } finally {
      this.setState({ loading: false });
    }
  }

  _approveUSDT = async (spender, amount) => {
    try {
        const allowance = await this.state.usdt.methods.allowance(this.state.account, spender).call();
        const amountNeeded = amount - allowance;

        if (amountNeeded > 0) {
          await this.state.usdt.methods.approve(spender, amountNeeded).send({ from: this.state.account });
          console.log(`Approved ${amountNeeded / 10 ** 6} USDT for ${spender}`);
        }
    } catch (err) {
        this.setState({ errorMessage: err });
        console.error(`Error in approving USDT: ${err.message}`);
    }
  }

  render() {
    return (
      <div>
        <Navigation account={this.state.account} />
        <MyCarousel />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>ERC-20 Token Management</h1>
                &nbsp;
                <Container>
                  <Row>
                    <Col>
                      <h3> User Tokens </h3>
                      <form onSubmit={(event) => {
                        event.preventDefault();
                        this._getBalance();
                      }} >
                        <input type="submit"
                          className="btn btn-block btn-success btn-sm"
                          value="GET TOKEN BALANCE" />
                      </form>
                    </Col>
                    <Col>
                      <h3> Contract Tokens </h3>
                      <form onSubmit={(event) => {
                        event.preventDefault();
                        this._getContractBalance();
                      }} >
                        <input type="submit"
                          className="btn btn-block btn-info btn-sm"
                          value="GET CONTRACT TOKEN BALANCE" />
                      </form>
                    </Col>
                    <Col>
                      <h3> Contract USDT </h3>
                      <form onSubmit={(event) => {
                          event.preventDefault();
                          this._getContractBalanceUSDT();
                        }} >
                        <input type="submit"
                          className="btn btn-block btn-warning btn-sm"
                          value="GET CONTRACT USDT BALANCE" />
                      </form>
                    </Col>
                  </Row>
                </Container>
                &nbsp;
                <h3>Buy ERC-20 Tokens</h3>
                <form onSubmit={(event) => {
                  event.preventDefault();
                  const amount = this._numTokens.value;
                  this._buyTokens(amount);
                }}>
                  <input type="number"
                    className="form-control mb-1"
                    placeholder="Number of tokens to buy"
                    ref={(input) => this._numTokens = input} />

                  <input type="submit"
                    className="btn btn-block btn-primary btn-sm"
                    value="BUY TOKENS" />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default Tokens;
