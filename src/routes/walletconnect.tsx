import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { useConnection, useConnect } from 'wagmi';
import { config } from '../wagmiconfig';
import { Container, Alert, Spinner } from 'react-bootstrap';
import styles from '../css/clocktower.module.css';

const WalletConnect: React.FC = () => {
    const { connector } = useParams();
    const [searchParams] = useSearchParams();
    const return_url = searchParams.get('return_url');
    const iframe_url = searchParams.get('iframe_url');
    const navigate = useNavigate();
    const { address, isConnected } = useConnection({ config });
    const { connect, connectors, isPending } = useConnect({ config });
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRedirect = React.useCallback(() => {
        // Prioritize iframe_url if provided (return to iframe)
        const redirectUrl = iframe_url || return_url;
        
        if (redirectUrl) {
            try {
                const decodedUrl = decodeURIComponent(redirectUrl);
                window.location.href = decodedUrl;
            } catch (error) {
                console.error('Invalid redirect URL:', error);
                // Fallback to home
                navigate('/');
            }
        } else {
            // No redirect URL - go to home
            navigate('/');
        }
    }, [iframe_url, return_url, navigate]);

    useEffect(() => {
        // If already connected, redirect immediately
        if (isConnected && address) {
            handleRedirect();
            return;
        }

        // If connector specified, try to connect
        if (connector && !isConnecting && !isPending) {
            const foundConnector = connectors.find(c => c.id === connector);
            if (foundConnector) {
                setIsConnecting(true);
                connect({ connector: foundConnector });
            } else {
                setError(`Wallet connector "${connector}" not found`);
            }
        }
    }, [connector, connectors, connect, isConnected, address, isPending, isConnecting, handleRedirect]);

    // Handle redirect after connection
    useEffect(() => {
        if (isConnected && address && isConnecting) {
            // Small delay to ensure connection is stable
            const timer = setTimeout(() => {
                handleRedirect();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isConnected, address, isConnecting, handleRedirect]);

    return (
        <div className={styles.top_level_public}>
            <Container className="py-5">
                <div className="text-center">
                    {error ? (
                        <Alert variant="danger">
                            <Alert.Heading>Connection Error</Alert.Heading>
                            <p>{error}</p>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => navigate('/')}
                            >
                                Go Home
                            </button>
                        </Alert>
                    ) : (
                        <>
                            <Spinner animation="border" variant="primary" style={{ marginBottom: '20px' }} />
                            <h4>
                                {isPending || isConnecting ? 'Connecting Wallet...' : 'Redirecting...'}
                            </h4>
                            <p className="text-muted">
                                {isPending || isConnecting 
                                    ? 'Please approve the connection in your wallet' 
                                    : 'Please wait while we redirect you'}
                            </p>
                        </>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default WalletConnect;

