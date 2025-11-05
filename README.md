# Clocktower Frontend

A modern, user-friendly frontend for the Clocktower Protocol - a decentralized subscription management system.

## Features

### Core Functionality
- **Subscription Management**
  - Create and manage recurring subscriptions
  - Support for multiple payment frequencies (weekly, monthly, etc.)
  - Customizable subscription amounts and tokens
  - Subscription history tracking
  - Calendar view for payment schedules 

### User Features
- **Multi-chain Support**
  - Compatible with multiple blockchain networks
  - Seamless chain switching
  - Support for various tokens across chains

- **Wallet Integration**
  - Multi-wallet support
  - Transaction status tracking

### Provider Features
- **Subscription Creation**
  - Easy-to-use subscription creation form
  - Customizable subscription details
  - URL and description management
  - Token and amount configuration

- **Account Management**
  - Provider profile customization
  - Company information management
  - Domain verification

### Third-Party Integration (Iframe Widget)

- **Embeddable Subscription Widget**
  - Seamless integration into third-party websites
  - Users can subscribe with crypto wallets without leaving your site
  - PostMessage API for secure communication
  - Automatic redirect back to your site after subscription

#### Integration Workflow

1. **User clicks subscribe button** on your website
2. **Iframe opens** with the Clocktower subscription widget
3. **User connects wallet** and completes subscription inside iframe
4. **PostMessage sent** to parent window with subscription details
5. **Parent window redirects** user back to your callback URL with subscription confirmation

#### Quick Start for Third Parties

**1. Generate Iframe URL:**

```html
<iframe 
  src="https://clocktower-frontend.com/#/public_subscription/{subscriptionId}?return_url={encodedCallbackUrl}"
  width="450" 
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
</iframe>
```

**2. Listen for Subscription Completion:**

```javascript
window.addEventListener('message', (event) => {
  // Security: Validate origin - CRITICAL for production
  if (event.origin !== 'https://clocktower-frontend.com') {
    console.warn('Rejected message from unexpected origin:', event.origin);
    return;
  }
  
  if (event.data && event.data.type === 'subscription_complete') {
    const { subscription_id, user_address, success, return_url } = event.data;
    
    if (success) {
      // Redirect to your callback URL with subscription details
      if (return_url) {
        const callbackUrl = new URL(return_url);
        callbackUrl.searchParams.set('subscription_id', subscription_id);
        callbackUrl.searchParams.set('user_address', user_address);
        callbackUrl.searchParams.set('subscription_success', 'true');
        
        // Redirect the parent window
        window.location.href = callbackUrl.toString();
      }
    }
  }
});
```

**3. Test Your Integration:**

Visit `https://clocktower-frontend.com/#/iframetest` to:
- Generate test iframe URLs
- See example integration code
- Test postMessage communication
- View HTML and JavaScript integration examples

#### Security Considerations

- **Origin Validation**: Always validate the `event.origin` in your message listener
- **HTTPS Required**: Use HTTPS for both your site and the Clocktower frontend
- **Return URL**: Pass your callback URL as the `return_url` query parameter (URL-encoded)
- **Cross-Origin**: The iframe must be from the same origin or properly configured for cross-origin communication

#### Message Format

The iframe sends the following message structure:

```typescript
{
  type: 'subscription_complete',
  subscription_id: string,
  user_address: string,
  success: boolean,
  return_url: string | null
}
```

For more details and examples, visit the [iframe test page](https://clocktower-frontend.com/#/iframetest) or see the integration code in `src/routes/iframetest.tsx`.

## Technical Stack
- **TypeScript** - Primary programming language
- React-based frontend
- Vite for build tooling
- Vitest for unit testing
- Wagmi for wallet integration
- Apollo Client for GraphQL queries
- Bootstrap for responsive design
- FullCalendar for calendar functionality

## Testing

This project uses [Vitest](https://vitest.dev/) for unit testing. Tests are located in `src/components/__tests__/`.

### Quick Start

```bash
npm test              # Watch mode
npm test -- --run     # Run once
npm test:coverage     # Coverage report
```

### Test Coverage

**74 tests** covering 7 components:
- Icon (6) - ThemeToggle (6) - Forms (33) - SubscribersTable (7) - SubscriptionCards (22)

### Writing Tests

Use the custom render from `test-utils.tsx`:

```typescript
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';

// Basic rendering
render(<MyComponent />);

// With router
render(<MyComponent />, { includeRouter: true });

// User interactions
const user = userEvent.setup();
await user.click(button);
```

For detailed how-to documentation, visit [clocktower.finance](https://clocktower.finance)
