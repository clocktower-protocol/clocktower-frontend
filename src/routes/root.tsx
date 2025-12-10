import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, Container, Nav, Button, Row, Col, Modal, Stack, Alert, NavDropdown } from 'react-bootstrap';
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import { config } from '../wagmiconfig';
import { CHAIN_LOOKUP, WALLET_LOOKUP, ADMIN_ACCOUNT } from '../config';
import Icon from '../components/Icon';
import { v4 as uuidv4 } from 'uuid';
import styles from '../css/clocktower.module.css';
import ThemeToggle from '../components/ThemeToggle';
import { useConnection, useConnect, useConnectionEffect, useWatchPendingTransactions, useSwitchChain, useDisconnect, useConnectors, useChains } from 'wagmi';
import { createApolloClient } from '../apolloclient';
import { ApolloProvider } from '@apollo/client/react';

const Root: React.FC = () => {
    const { address, isConnected, isDisconnected, chainId } = useConnection({ config });
    const [client, setClient] = useState(() => createApolloClient(chainId));

    useEffect(() => {
        if (chainId) {
            setClient(createApolloClient(chainId));
        }
    }, [chainId]);

    const switchChain = useSwitchChain();
    const disconnect = useDisconnect();
    const location = useLocation();
    const [account, setAccount] = useState<string>("");
    const [showWalletChoice, setShowWalletChoice] = useState<boolean>(false);
    const [selectedChain, setSelectedChain] = useState<number>(0);

    const navigate = useNavigate();
    const handleOnClickCalendar = useCallback(() => navigate('/calendar', { replace: true }), [navigate]);
    const handleOnClickAccount = useCallback(() => navigate('/account/' + account, { replace: true }), [navigate, account]);
    const handleOnClickSubscriptions = useCallback(() => navigate(`/subscriptions/created`, { replace: true }), [navigate]);
    const handleOnClickAdmin = useCallback(() => navigate('/admin', { replace: true }), [navigate]);
    // const accountSwitch = useCallback((passedAddress: string) => navigate('/account/' + passedAddress), [navigate]);
    const linkToMain = useCallback(() => navigate('/', { replace: true }), [navigate]);

    const handleClose = () => {
        setShowWalletChoice(false);
    };

    const handleShow = () => setShowWalletChoice(true);

    const handleDisconnect = () => {
        disconnect.mutate();
    };

    useConnectionEffect({
        config,
        onConnect() {
            console.log('Connected!');
        },
        onDisconnect() {
            console.log('Disconnected!');
            linkToMain();
        },
    });

    useWatchPendingTransactions({
        onError(error) {
            console.log('Error', error);
        }
    });

    const connect = useConnect({ config });
    const connectors = useConnectors();
    const chains = useChains({ config });

    const supportedChainIds = config.chains.map(chain => chain.id);

    useEffect(() => {
        setAccount(address || "");
        if (address !== undefined && address !== account) {
            if ((location.pathname.slice(0, 20) !== "/public_subscription") && 
                (location.pathname.slice(0, 8) !== "/history") && 
                (location.pathname.slice(0, 11) !== "/iframetest") &&
                (location.pathname.slice(0, 13) !== "/subscriptions") &&
                (location.pathname.slice(0, 8) !== "/account") &&
                (location.pathname.slice(0, 9) !== "/calendar")) {
                navigate('/subscriptions/created', { replace: true });
            }
        }
    }, [address, chains, navigate, location, account]);

    const adminAccount = ADMIN_ACCOUNT;

    const walletButtonClick = () => {
        handleShow();
    };

    const changeChain = (chain_id: number) => {
        switchChain.mutate({ chainId: chain_id });
        const chainIndex = CHAIN_LOOKUP.findIndex((lchain) => lchain.id === chain_id);
        if (chainIndex !== -1) {
            setSelectedChain(chainIndex);
        }
    };

    useEffect(() => {
        if (chainId) {
            CHAIN_LOOKUP.forEach((lchain, index) => {
                if (lchain.id === chainId) {
                    setSelectedChain(index);
                }
            });
        }
    }, [chainId]);

    return (
        <ApolloProvider client={client}>
            <div key={"root"}>
                <Modal show={showWalletChoice} onHide={handleClose} className={styles.wallet_modal}>
                    <Modal.Header closeButton>
                        <Modal.Title className="w-100 text-center">Choose a Wallet</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Container>
                            <Stack gap={3}>
                                {connectors.map((connector) => (
                                    <Row key={uuidv4()}>
                                        <Col key={uuidv4()} md="auto">
                                            {WALLET_LOOKUP.map((lWallet) => {
                                                if (lWallet.id === connector.id) {
                                                    return <Icon key={uuidv4()} icon={lWallet.icon}></Icon>;
                                                } else {
                                                    return "";
                                                }
                                            })}
                                        </Col>
                                        <Col key={uuidv4()}>
                                            <Button
                                                style={{ width: "100%" }}
                                                variant="info"
                                                key={uuidv4()}
                                                onClick={() => {
                                                    connect.mutate({ connector });
                                                    handleClose();
                                                }}
                                            >
                                                {connector.name}
                                                {connect.isPending && ' (connecting)'}
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}
                            </Stack>
                        </Container>
                    </Modal.Body>
                </Modal>
            </div>
            <div key={"topDiv"}>
                <div key={"navBarKey"} className="navBar">
                    <Navbar key="navBar" bg="dark" variant="dark" expand="lg" className={styles.navbar}>
                        <Container fluid>
                            <Navbar.Brand>
                                <Link to="/subscriptions/created" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className={styles.clocktower_brand}>Clocktower</div>
                                </Link>
                            </Navbar.Brand>
                            
                            {/* Mobile Right Side - Always Visible */}
                            <div className="d-lg-none" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ThemeToggle />
                                {isConnected && !isDisconnected ? (
                                    <>
                                        <Navbar.Text className={styles.account_text_nav} style={{ fontSize: '0.8rem' }}>{address?.slice(0, 4) + "..." + address?.slice(38, 42)}</Navbar.Text>
                                        <Button variant="outline-danger" size="sm" className={styles.wallet_button} onClick={handleDisconnect}>Disconnect</Button>
                                    </>
                                ) : (
                                    <Button variant="outline-success" size="sm" className={styles.wallet_button} onClick={() => walletButtonClick()}>Sign in</Button>
                                )}
                                <Navbar.Toggle aria-controls="navbar-nav" />
                            </div>
                            
                            <Navbar.Collapse id="navbar-nav">
                                {/* Desktop Navigation */}
                                <Nav className="d-none d-lg-flex me-auto">
                                    <Button variant="outline-info" className={styles.account_button} onClick={handleOnClickAccount}>Account</Button>
                                    <Button variant="outline-info" className={styles.subscriptions_button} onClick={handleOnClickSubscriptions}>Subscriptions</Button>
                                    <Button variant="outline-info" className={styles.calendar_button} onClick={handleOnClickCalendar}>Calendar</Button>
                                    {account === adminAccount && <Button variant="outline-info" style={{ margin: "5px" }} onClick={handleOnClickAdmin}>Admin</Button>}
                                </Nav>
                                
                                {/* Mobile Navigation */}
                                <div className="d-lg-none mb-3" style={{ 
                                    backgroundColor: '#000000',
                                    borderRadius: '0 0 12px 12px',
                                    padding: '10px 0',
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    width: '150px',
                                    marginTop: '5px',
                                    marginBottom: '10px',
                                    zIndex: 1000
                                }}>
                                    <div className="mb-2" style={{ textAlign: 'right', backgroundColor: '#000000', marginRight: '15px' }}>
                                        <Button variant="link" className="text-light p-0" onClick={handleOnClickAccount} style={{ textDecoration: 'none', textAlign: 'right', width: '100%', backgroundColor: '#000000' }}>Account</Button>
                                    </div>
                                    <div className="mb-2" style={{ textAlign: 'right', backgroundColor: '#000000', marginRight: '15px' }}>
                                        <Button variant="link" className="text-light p-0" onClick={handleOnClickSubscriptions} style={{ textDecoration: 'none', textAlign: 'right', width: '100%', backgroundColor: '#000000' }}>Subscriptions</Button>
                                    </div>
                                    <div className="mb-2" style={{ textAlign: 'right', backgroundColor: '#000000', marginRight: '15px' }}>
                                        <Button variant="link" className="text-light p-0" onClick={handleOnClickCalendar} style={{ textDecoration: 'none', textAlign: 'right', width: '100%', backgroundColor: '#000000' }}>Calendar</Button>
                                    </div>
                                    {account === adminAccount && (
                                        <div className="mb-2" style={{ textAlign: 'right', backgroundColor: '#000000', marginRight: '15px' }}>
                                            <Button variant="link" className="text-light p-0" onClick={handleOnClickAdmin} style={{ textDecoration: 'none', textAlign: 'right', width: '100%', backgroundColor: '#000000' }}>Admin</Button>
                                        </div>
                                    )}
                                    {isConnected && !isDisconnected && (
                                        <div className="mb-2" style={{ textAlign: 'right', backgroundColor: '#000000', marginRight: '15px' }}>
                                            <Button variant="link" className="text-danger p-0" onClick={handleDisconnect} style={{ textDecoration: 'none', textAlign: 'right', width: '100%', backgroundColor: '#000000' }}>Disconnect</Button>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Desktop Right Side */}
                                <Nav className="d-none d-lg-flex align-items-center" style={{ gap: '20px', paddingRight: '20px' }}>
                                    {chains.length > 1 ?
                                        <NavDropdown title={<span className={styles.chain_pulldown}>Chain: <Icon key={uuidv4()} icon={CHAIN_LOOKUP[selectedChain].icon}></Icon> {CHAIN_LOOKUP[selectedChain].displayName} </span>} id="basic-nav-dropdown" style={{ marginRight: 'auto' }}>
                                            {chains.map((chain) => (
                                                <NavDropdown.Item key={uuidv4()} className={styles.chain_pulldown2}>
                                                    {CHAIN_LOOKUP.map((lchain) => {
                                                        if (lchain.id === chain.id) {
                                                            return <Icon key={uuidv4()} className={styles.chain_icon} icon={lchain.icon}></Icon>;
                                                        } else {
                                                            return "";
                                                        }
                                                    })}
                                                    <Button variant="outline-info" key={chain.id} onClick={() => changeChain(chain.id)}>
                                                        {CHAIN_LOOKUP.find(lchain => lchain.id === chain.id)?.displayName || chain.name}
                                                    </Button>
                                                </NavDropdown.Item>
                                            ))}
                                        </NavDropdown>
                                        :
                                        <Navbar.Text style={{ margin: 0, whiteSpace: 'nowrap', marginRight: 'auto' }}>
                                            <span className={styles.chain_pulldown}>Chain: <Icon key={uuidv4()} icon={CHAIN_LOOKUP[0].icon}></Icon> {CHAIN_LOOKUP[0].displayName} </span>
                                        </Navbar.Text>
                                    }
                                    {isConnected && !isDisconnected ? (
                                        <Navbar.Text className={styles.account_text_nav} style={{ margin: 0 }}>Account: {address?.slice(0, 5) + "..." + address?.slice(37, 42)}</Navbar.Text>
                                    ) : (
                                        <Button variant="outline-success" className={styles.wallet_button} onClick={() => walletButtonClick()}>Sign in Wallet</Button>
                                    )}
                                    
                                    {/* Desktop Hamburger Menu */}
                                    <NavDropdown 
                                        title={<span style={{ fontSize: '1.2rem' }}>☰</span>} 
                                        id="desktop-hamburger-dropdown"
                                        className={styles.desktop_hamburger_menu}
                                        drop="start"
                                    >
                                        <NavDropdown.Item>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                <span>Theme</span>
                                                <ThemeToggle />
                                            </div>
                                        </NavDropdown.Item>
                                        {isConnected && !isDisconnected && (
                                            <NavDropdown.Item>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    onClick={handleDisconnect}
                                                    style={{ width: '100%' }}
                                                >
                                                    Disconnect
                                                </Button>
                                            </NavDropdown.Item>
                                        )}
                                    </NavDropdown>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                </div>
                <div key={"mainDiv"} id="detail" className="mainDiv">
                    {!isConnected ? (
                        <Alert className={`text-center ${styles.connect_wallet_alert}`} variant="info">Please Connect Wallet</Alert>
                    ) : supportedChainIds.includes(chainId || 0) ? (
                        <Outlet context={[account]} />
                    ) : (
                        <div className="alertDiv">
                            <Alert variant="danger" className="text-center">Please Connect Back to Supported Chain</Alert>
                        </div>
                    )}
                </div>
            </div>
        </ApolloProvider>
    );
};

export default Root;