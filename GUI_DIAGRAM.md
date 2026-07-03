# BharatOne Super App: GUI Flow Diagram

Below is the visual map of the graphical user interfaces and how they connect to the backend system in the BharatOne Super App.

```mermaid
graph TD
    %% Styling Classes
    classDef auth fill:#1e293b,stroke:#e2e8f0,stroke-width:2px,color:#fff
    classDef rider fill:#166534,stroke:#a3e635,stroke-width:2px,color:#fff
    classDef driver fill:#854d0e,stroke:#facc15,stroke-width:2px,color:#fff
    classDef shared fill:#334155,stroke:#38bdf8,stroke-width:2px,color:#fff
    classDef backend fill:#0f172a,stroke:#6366f1,stroke-width:2px,color:#fff,stroke-dasharray: 5 5
    
    %% Auth Flow
    subgraph Authentication_Layer [Authentication Flow]
        LoginScreen("🔑 LoginScreen.js\n(Rider & Driver Demo Logins)"):::auth
        RegisterScreen("📝 RegisterScreen.js"):::auth
    end

    %% Rider Flow
    subgraph Rider_Flow [Rider / Passenger Interface]
        RiderHome("🏠 RiderHomeScreen.js\nSuper App Dashboard"):::rider
        ServiceRibbon("🎛️ Service Ribbon\n(Ride | Ambulance | Parcel | Food)"):::rider
        RiderMap("🌍 Real-time Leaflet Map\n(Nearby Drivers & Route)"):::rider
        RiderActive("🚗 RideActiveScreen.js\n(Live Telemetry & Tracking)"):::rider
        Receipt("🎫 Digital Receipt\n(Completed / Cancelled)"):::rider
    end

    %% Driver Flow
    subgraph Driver_Flow [Driver / Courier Interface]
        DriverHome("🚦 DriverHomeScreen.js\nDriver Control Center"):::driver
        DriverMap("🌍 Live Driver Map\n(Your Location & Pickup)"):::driver
        IncomingOffer("🚨 Incoming Dispatch Offer\n(Accept / Decline)"):::driver
        DriverActive("📍 Active Mission Panel\n(Arrived -> Started -> Complete)"):::driver
    end

    %% Shared Components
    subgraph Shared_Components [Global UI Components]
        ErrorBoundary("🛡️ ErrorBoundary.js\n(Crash Protection)"):::shared
        AuthContext("🔐 AuthContext.js\n(Token & WebSocket State)"):::shared
    end

    %% Backend System
    subgraph Backend_Infrastructure [Backend Server]
        PostgreSQL[("🗄️ PostgreSQL\n(Users, Drivers, Rides)")]:::backend
        REST_API("🌐 Express.js REST API\n(/api/rides)"):::backend
        SocketIO("⚡ Socket.io\n(Real-time Dispatching)"):::backend
        AISim("🤖 Driver AI Simulator\n(Auto-matching & GPS Emulation)"):::backend
    end

    %% Flow Connections (Auth)
    LoginScreen -->|Authenticates via Context| AuthContext
    RegisterScreen -->|Creates Account| AuthContext
    AuthContext -->|If Role == Rider| RiderHome
    AuthContext -->|If Role == Driver| DriverHome

    %% Flow Connections (Rider)
    RiderHome --- ServiceRibbon
    RiderHome --- RiderMap
    RiderHome -->|Selects Route & Submits| REST_API
    REST_API -->|Triggers Search| SocketIO
    RiderHome -->|Transitions UI| RiderActive
    RiderActive --- RiderMap
    RiderActive -->|Trip Ends| Receipt
    Receipt -->|Return to Dashboard| RiderHome

    %% Flow Connections (Driver)
    DriverHome --- DriverMap
    DriverHome -->|Toggles Online| SocketIO
    SocketIO -->|Broadcasts Request| IncomingOffer
    IncomingOffer -->|Accepts| DriverActive
    DriverActive -->|Updates Status| SocketIO
    DriverActive -->|Mission Complete| DriverHome

    %% Backend Inner Workings
    REST_API <--> PostgreSQL
    SocketIO <--> PostgreSQL
    SocketIO <--> AISim
    AISim -->|Simulates Driving GPS| SocketIO
    
    %% Real-time Sync Links
    SocketIO == "Emits Live GPS & Status" ==> RiderActive
    SocketIO == "Emits Nearby Drivers" ==> RiderHome
```

### Key UI Screen Breakdowns:

- **LoginScreen**: Handles standard auth and provides quick-access demo buttons mapping directly to the PostgreSQL seeded test accounts.
- **RiderHomeScreen**: The core Super App dashboard featuring a sleek glassmorphism UI, a real OpenStreetMap (Leaflet), and a quick Service Ribbon to dynamically switch prices and configurations for Ambulances, Taxis, Parcels, or Food.
- **DriverHomeScreen**: Designed for drivers and couriers to toggle their online status, accept incoming requests, and manage the `Arrived` -> `Started` -> `Completed` workflow.
- **RideActiveScreen**: A highly dynamic telemetry screen for riders. It listens to WebSocket streams to show a pulsing radar during searches, driver profiles when matched, live GPS movement during the ride, and a final receipt upon completion.
