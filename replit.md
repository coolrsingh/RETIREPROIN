# Retirement Planning Web Application

## Overview

This is a full-stack retirement planning web application built with React/Vite frontend and Express.js backend. The application helps users create personalized retirement plans through either Quick Plan or Detailed Plan modes. It features interactive visualizations, financial calculations, and lead capture functionality with PDF export capabilities.

The system is designed as a professional financial planning tool that can collect client data, perform retirement calculations, and generate visual reports. It includes authentication, role-based access control, and CRM integration capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with Vite as the build tool, implementing a component-based architecture with the following key design decisions:

- **Component Library**: Uses Radix UI primitives with shadcn/ui components for consistent, accessible UI design
- **Styling**: TailwindCSS for utility-first styling with CSS custom properties for theming
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for financial data visualization and interactive charts

The application follows a professional light theme design with primary colors in blue and green, optimized for financial planning use cases.

### Backend Architecture
The backend uses Express.js with TypeScript, implementing a RESTful API architecture:

- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL
- **Authentication**: Replit Auth integration with session-based authentication
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling
- **Session Management**: PostgreSQL-backed session storage with express-session
- **File Processing**: Server-side PDF generation for retirement plan reports

### Data Architecture
The system uses PostgreSQL as the primary database with the following key entities:

- **Users**: Authentication and profile management with role-based access (client/admin)
- **Scenarios**: Retirement planning scenarios with quick/detailed modes
- **Financial Data**: Income, expenses, assets, liabilities, and goals tracking
- **Household Members**: Family member information for comprehensive planning
- **CRM Defaults**: Configurable assumption defaults for financial calculations
- **Leads**: Lead capture system for marketing and sales integration

### Authentication & Authorization
- **Authentication Provider**: Replit Auth with OpenID Connect integration
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Client and admin roles with different permission levels
- **Route Protection**: Middleware-based route protection for authenticated endpoints

### Business Logic
The core retirement calculation engine processes:
- **Financial Projections**: Net worth calculations over time with inflation adjustments
- **Lifecycle Events**: Education costs, marriage expenses, mini-retirements
- **Investment Returns**: Pre and post-retirement return rate modeling
- **Tax Considerations**: Support for old and new tax regime calculations

## External Dependencies

### Database & Storage
- **Neon Database**: PostgreSQL hosting service for production database
- **Drizzle ORM**: Database toolkit and ORM for TypeScript
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Authentication & Security
- **Replit Auth**: OpenID Connect authentication provider
- **express-session**: Session management middleware
- **passport**: Authentication middleware framework

### UI & Visualization
- **Radix UI**: Primitive component library for accessible UI components
- **Recharts**: Chart library for financial data visualization
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework

### Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire application
- **Zod**: Runtime type validation for forms and API data
- **ESBuild**: Fast JavaScript bundler for production builds

### External Services Integration
- **CRM System**: Configurable defaults and lead capture integration
- **PDF Generation**: Server-side PDF export for retirement reports
- **Email/Phone Validation**: Form validation for lead capture

The application is designed to be deployed on Replit with automatic database provisioning and authentication setup, but can be adapted for other hosting platforms with minimal configuration changes.