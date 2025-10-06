import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import styles from '../css/clocktower.module.css';

const IframeTest: React.FC = () => {
    const [subscriptionId, setSubscriptionId] = useState('123');
    const [frequency, setFrequency] = useState('0');
    const [dueDay, setDueDay] = useState('0');
    const [returnUrl, setReturnUrl] = useState('https://example.com/callback');
    const [iframeUrl, setIframeUrl] = useState('');

    const generateIframeUrl = () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const hashRoute = `#/public_subscription/${subscriptionId}/${frequency}/${dueDay}`;
        const encodedReturnUrl = encodeURIComponent(returnUrl);
        const fullUrl = `${baseUrl}${hashRoute}?return_url=${encodedReturnUrl}`;
        setIframeUrl(fullUrl);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(iframeUrl);
        alert('URL copied to clipboard!');
    };

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
                                    <label className="form-label">Frequency:</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={frequency}
                                        onChange={(e) => setFrequency(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Due Day:</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={dueDay}
                                        onChange={(e) => setDueDay(e.target.value)}
                                        placeholder="0"
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
                                            backgroundColor: '#f8f9fa', 
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
