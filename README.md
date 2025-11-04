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
