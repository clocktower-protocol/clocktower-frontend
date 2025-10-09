import React from 'react';
import { Button, Card, Stack, Spinner } from 'react-bootstrap';
import { TOKEN_LOOKUP, FREQUENCY_LOOKUP, DAY_OF_WEEK_LOOKUP } from "../config";
import { formatEther } from 'viem';
import Avatar from "boring-avatars";
import { v4 as uuidv4 } from 'uuid';
import { SubView, DetailsLog } from '../types/subscription';

interface SubscriptionWidgetProps {
    subscriptionArray: SubView[];
    detailsArray: DetailsLog[];
    isSubscribed?: boolean;
    subscribe?: () => void;
    hasEnoughBalance?: boolean;
    isLoading?: boolean;
}

const SubscriptionWidget: React.FC<SubscriptionWidgetProps> = (props) => {
    const subscriptionArray = props.subscriptionArray;
    const detailsArray = props.detailsArray;
    const cards: React.ReactElement[] = [];

    // Show loading spinner if isLoading is true
    if (props.isLoading) {
        return (
            <Card style={{ marginBottom: "20px", width: "100%", maxWidth: "none", padding: "40px" }}>
                <Card.Body style={{ padding: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
                    <Spinner animation="border" variant="primary" style={{ marginBottom: "20px" }} />
                    <div style={{ textAlign: "center", fontSize: "16px", color: "#6c757d" }}>
                        Loading subscription...
                    </div>
                </Card.Body>
            </Card>
        );
    }

    // Helper functions
    const tickerLookup = (tokenAddress: `0x${string}`) => {
        const token = TOKEN_LOOKUP.find(t => t.address === tokenAddress);
        return token ? token.ticker : 'UNKNOWN';
    };

    const frequencyLookup = (frequency: number) => {
        const freq = FREQUENCY_LOOKUP.find(f => f.index === frequency);
        return freq ? freq.name : 'Unknown';
    };

    const dayOfWeekLookup = (day: number) => {
        const dayObj = DAY_OF_WEEK_LOOKUP.find(d => d.index === day);
        return dayObj ? dayObj.name : 'Unknown';
    };

    const dayEndString = (day: string) => {
        const dayNum = parseInt(day);
        if (dayNum === 1) return "1st";
        if (dayNum === 2) return "2nd";
        if (dayNum === 3) return "3rd";
        return dayNum + "th";
    };

    // Loop through subscriptions and create simplified widget cards
    for (let i = 0; i < subscriptionArray.length; i++) {
        // Only show non-cancelled subscriptions
        if (subscriptionArray[i].status < 1) {
            let description = detailsArray[i]?.description || '---';
            if (description === "") {
                description = "---";
            }

            // Format subscription amount
            let subAmount = formatEther(BigInt(subscriptionArray[i].subscription.amount));

            // Build payday string
            let paydayString = "";
            if (subscriptionArray[i].subscription.frequency > 0) {
                paydayString = dayEndString(String(subscriptionArray[i].subscription.dueDay)) + " Day of the " + frequencyLookup(subscriptionArray[i].subscription.frequency);
            } else {
                // Weekly
                let index = subscriptionArray[i].subscription.dueDay;
                if (subscriptionArray[i].subscription.dueDay === 7) {
                    index = 0;
                }
                paydayString = dayOfWeekLookup(index);
            }

            cards.push(
                <Card key={uuidv4()} style={{ marginBottom: "20px", width: "100%", maxWidth: "none", padding: "20px" }}>
                    <Card.Body style={{ padding: "0" }}>
                        {/* Title with Avatar and Description */}
                        <Card.Title style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                                <Avatar
                                    size={60}
                                    name={subscriptionArray[i].subscription.id}
                                    square={true}
                                    variant="marble"
                                    colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                />
                            </div>
                            <div style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold" }}>
                                {description}
                            </div>
                        </Card.Title>

                        <hr />

                        {/* Centered Amount and Due Date */}
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <Stack gap={3} style={{ width: "100%" }}>
                                {/* Amount */}
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "5px" }}>Amount</div>
                                    <div style={{ fontSize: "24px", fontWeight: "bold", color: "#0d6efd" }}>
                                        {subAmount} {tickerLookup(subscriptionArray[i].subscription.token)}
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "14px", color: "#6c757d", marginBottom: "5px" }}>Due</div>
                                    <div style={{ fontSize: "18px", fontWeight: "500" }}>
                                        {paydayString}
                                    </div>
                                </div>
                            </Stack>
                        </div>

                        <hr />

                        {/* Subscribe Button */}
                        <div style={{ textAlign: "center" }}>
                            {props.isSubscribed ? (
                                <Button variant="success" disabled style={{ width: "100%", padding: "12px" }}>
                                    Already Subscribed
                                </Button>
                            ) : !props.hasEnoughBalance ? (
                                <Button variant="danger" disabled style={{ width: "100%", padding: "12px" }}>
                                    Insufficient Balance
                                </Button>
                            ) : (
                                <Button 
                                    variant="primary" 
                                    onClick={props.subscribe}
                                    style={{ width: "100%", padding: "12px", fontSize: "16px", fontWeight: "bold" }}
                                >
                                    Subscribe
                                </Button>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            );
        }
    }

    return <>{cards}</>;
};

export default SubscriptionWidget;
