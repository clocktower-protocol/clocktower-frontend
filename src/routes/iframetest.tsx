import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import styles from '../css/clocktower.module.css';

interface SubscriptionCompleteMessage {
    type: 'subscription_complete';
    subscription_id: string;
    user_address: string;
    success: boolean;
    return_url: string | null;
}

const IframeTest: React.FC = () => {
    const [subscriptionId, setSubscriptionId] = useState('123');
    const [returnUrl, setReturnUrl] = useState('https://example.com/callback');
    const [iframeUrl, setIframeUrl] = useState('');
    const [subscriptionSuccess, setSubscriptionSuccess] = useState<SubscriptionCompleteMessage | null>(null);

    const generateIframeUrl = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const hashRoute = `#/public_subscription/${subscriptionId}`;
        const encodedReturnUrl = encodeURIComponent(returnUrl);
        const fullUrl = `${baseUrl}${hashRoute}?return_url=${encodedReturnUrl}`;
        setIframeUrl(fullUrl);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(iframeUrl);
        alert('URL copied to clipboard!');
    };

    // Listen for postMessage from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Security: Validate origin
            // In production, you may want to allow specific origins from a config list
            // For now, we accept same-origin messages (iframe must be same-origin)
            if (event.origin !== window.location.origin) {
                console.warn('Message from unexpected origin:', event.origin);
                // Reject messages from unknown origins for security
                return;
            }

            // Check if message is subscription completion
            if (event.data && event.data.type === 'subscription_complete') {
                const message = event.data as SubscriptionCompleteMessage;
                setSubscriptionSuccess(message);
                console.log('Subscription completed:', message);
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div className={styles.top_level_public}>
            <Container className="py-4">
                <Row>
                    <Col md={6}>
                        <Card>
                            <Card.Header>
                                <h4>Iframe Test Configuration</h4>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <label className="form-label">Subscription ID:</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={subscriptionId}
                                        onChange={(e) => setSubscriptionId(e.target.value)}
                                        placeholder="Enter subscription ID"
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Return URL:</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={returnUrl}
                                        onChange={(e) => setReturnUrl(e.target.value)}
                                        placeholder="https://example.com/callback"
                                    />
                                </div>
                                
                                <Button 
                                    variant="primary" 
                                    onClick={generateIframeUrl}
                                    className="mb-3"
                                >
                                    Generate Iframe URL
                                </Button>
                                
                                {iframeUrl && (
                                    <div>
                                        <label className="form-label">Generated URL:</label>
                                        <div className="input-group mb-3">
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={iframeUrl}
                                                readOnly
                                            />
                                            <Button 
                                                variant="outline-secondary" 
                                                onClick={copyToClipboard}
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col md={6}>
                        <Card>
                            <Card.Header>
                                <h4>Iframe Preview</h4>
                            </Card.Header>
                            <Card.Body>
                                {iframeUrl ? (
                                    <div style={{ 
                                        border: '2px solid #dee2e6', 
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        height: '600px'
                                    }}>
                                        <iframe
                                            src={iframeUrl}
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            title="Subscription Widget"
                                            style={{ 
                                                border: 'none',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <Alert variant="info">
                                        Generate an iframe URL first to see the preview
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                
                {subscriptionSuccess && (
                    <Row className="mt-4">
                        <Col>
                            <Card>
                                <Card.Header>
                                    <h4>✅ Subscription Completed!</h4>
                                </Card.Header>
                                <Card.Body>
                                    <Alert variant="success">
                                        <strong>Subscription Success:</strong>
                                        <ul style={{ marginTop: '10px', marginBottom: 0 }}>
                                            <li><strong>Subscription ID:</strong> {subscriptionSuccess.subscription_id}</li>
                                            <li><strong>User Address:</strong> {subscriptionSuccess.user_address}</li>
                                            <li><strong>Status:</strong> {subscriptionSuccess.success ? 'Success' : 'Failed'}</li>
                                        </ul>
                                    </Alert>
                                    <p className="text-muted">
                                        This is how the parent window receives subscription completion events via postMessage.
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                )}

                <Row className="mt-4">
                    <Col>
                        <Card>
                            <Card.Header>
                                <h4>HTML Code for Third-Party Sites</h4>
                            </Card.Header>
                            <Card.Body>
                                {iframeUrl ? (
                                    <div>
                                        <p>Copy this HTML code to embed the subscription widget on your site:</p>
                                        <pre style={{ 
                                            backgroundColor: '#000000', 
                                            color: '#ffffff',
                                            padding: '15px', 
                                            borderRadius: '4px',
                                            overflow: 'auto'
                                        }}>
{`<iframe 
  src="${iframeUrl}"
  width="450" 
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>`}
                                        </pre>
                                        <div className="mt-3">
                                            <p><strong>JavaScript Integration:</strong></p>
                                            <pre style={{ 
                                                backgroundColor: '#f8f9fa', 
                                                color: '#000000',
                                                padding: '15px', 
                                                borderRadius: '4px',
                                                overflow: 'auto',
                                                border: '1px solid #dee2e6'
                                            }}>
{`// Listen for subscription completion events
window.addEventListener('message', (event) => {
    // Security: Validate origin in production
    if (event.origin !== '${window.location.origin}') {
        return; // Reject messages from unknown origins
    }
    
    if (event.data.type === 'subscription_complete') {
        const { subscription_id, user_address, success } = event.data;
        console.log('Subscription completed:', subscription_id);
        
        // Handle success - redirect, show message, etc.
        if (success) {
            // Your success handling code here
            alert('Subscription successful!');
        }
    }
});`}
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <Alert variant="info">
                                        Generate an iframe URL first to see the HTML code
                                    </Alert>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default IframeTest;
