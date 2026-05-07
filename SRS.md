# Software Requirements Specification (SRS)

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Specific Requirements](#3-specific-requirements)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture](#6-system-architecture)
7. [Assumptions and Dependencies](#7-assumptions-and-dependencies)
8. [Appendices](#8-appendices)

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the Adarsha Pathasala Data Management System. The system is designed to streamline school administration by providing a comprehensive platform for managing student attendance, fee tracking, academic notes distribution, and real-time communication with parents and students through push notifications.

### 1.2 Scope

The system encompasses:
- **Attendance Management**: Dual-session tracking with automated notifications
- **Fee Management**: Monthly fee cycles with payment tracking and reminders
- **Notes Distribution**: Google Drive integration for study materials
- **Push Notifications**: Real-time alerts via Firebase Cloud Messaging
- **Progressive Web App**: Offline-capable mobile application
- **Role-Based Access**: Secure access for Admin, Teacher, and Parent/Student roles

**Out of Scope:**
- Financial payment gateway integration
- Advanced analytics and reporting
- Multi-language support
- Integration with external school management systems

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **PWA** | Progressive Web Application |
| **FCM** | Firebase Cloud Messaging |
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token |
| **API** | Application Programming Interface |
| **UI/UX** | User Interface/User Experience |
| **HTTPS** | HyperText Transfer Protocol Secure |
| **CORS** | Cross-Origin Resource Sharing |
| **CSP** | Content Security Policy |

### 1.4 References

- IEEE Standard for Software Requirements Specifications (IEEE 830-1998)
- React Documentation (reactjs.org)
- Supabase Documentation (supabase.com)
- Firebase Documentation (firebase.google.com)

## 2. Overall Description

### 2.1 Product Perspective

The Adarsha Pathasala Data Management System is a web-based application that serves as a centralized platform for school administration. It interfaces with:
- **Supabase**: PostgreSQL database for data persistence
- **Firebase Cloud Messaging**: Push notification delivery
- **Google Drive**: Study materials storage and sharing
- **Web Browsers**: Client-side application delivery

The system is designed as a Progressive Web App (PWA) to provide native app-like experience on mobile devices.

### 2.2 Product Functions

The major functions of the system include:
1. **User Authentication and Authorization**
2. **Attendance Recording and Tracking**
3. **Fee Management and Payment Processing**
4. **Study Notes Upload and Distribution**
5. **Push Notification Delivery**
6. **Offline Data Caching and Synchronization**
7. **System Administration and Reporting**

### 2.3 User Characteristics

#### 2.3.1 Admin User
- **Education**: Basic computer literacy
- **Technical Expertise**: Minimal technical skills
- **Usage Frequency**: Daily administrative tasks
- **Goals**: Efficient school management and oversight

#### 2.3.2 Teacher User
- **Education**: Teaching professionals
- **Technical Expertise**: Basic computer skills
- **Usage Frequency**: Daily during school hours
- **Goals**: Streamlined attendance marking and student management

#### 2.3.3 Parent/Student User
- **Education**: Varies (parents may have limited technical skills)
- **Technical Expertise**: Basic smartphone usage
- **Usage Frequency**: Regular check-ins for updates
- **Goals**: Stay informed about child's progress and school activities

### 2.4 Operating Environment

#### 2.4.1 Hardware Requirements
- **Server**: Standard web server (2GB RAM, 1 CPU core minimum)
- **Client**: Modern smartphone or computer with web browser

#### 2.4.2 Software Requirements
- **Server OS**: Linux/Windows/macOS
- **Database**: Supabase (PostgreSQL)
- **Runtime**: Node.js 16+
- **Client Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 2.5 Design and Implementation Constraints

- **Technology Stack**: Node.js backend, React frontend
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT-based sessions
- **Security**: HTTPS required for production
- **Performance**: Sub-2-second response times for API calls
- **Scalability**: Support for up to 1000 concurrent users

### 2.6 Assumptions and Dependencies

- Users have access to modern web browsers or smartphones
- Internet connectivity is available (with offline fallback)
- Supabase and Firebase services remain operational
- Google Drive links are publicly accessible for note sharing

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces

##### Login Interface
- Email and password input fields
- "Remember me" option
- Error message display
- Loading state indicators

##### Dashboard Interface
- Role-specific navigation menu
- Quick action buttons
- Status indicators
- Responsive design for mobile devices

##### Attendance Interface
- Student list with class selection
- Morning/Afternoon session toggles
- Bulk marking capabilities
- Confirmation dialogs

##### Fee Management Interface
- Student fee status overview
- Payment marking functionality
- Fee history display
- Reminder scheduling

##### Notes Interface
- Google Drive link input
- Metadata entry (title, subject, class)
- Preview functionality
- Upload confirmation

#### 3.1.2 Hardware Interfaces

- **Database Connection**: Supabase PostgreSQL via connection pooling
- **Notification Service**: Firebase Cloud Messaging API
- **File Storage**: Google Drive API integration

#### 3.1.3 Software Interfaces

- **Supabase Client**: Database operations and authentication
- **Firebase SDK**: Push notification management
- **Google Drive API**: File sharing and embedding
- **Web Standards**: HTML5, CSS3, JavaScript ES6+

#### 3.1.4 Communication Interfaces

- **HTTPS API**: RESTful endpoints with JSON payloads
- **WebSocket**: Real-time notification delivery (future enhancement)
- **CORS**: Cross-origin resource sharing configuration

### 3.2 Functional Requirements

#### 3.2.1 Authentication and Authorization

**FR-AUTH-001**: User Login
- **Description**: System shall authenticate users with email and password
- **Priority**: High
- **Input**: Email, password
- **Output**: JWT token, user profile
- **Pre-conditions**: Valid user account exists
- **Post-conditions**: User session established

**FR-AUTH-002**: Role-Based Access Control
- **Description**: System shall restrict access based on user roles
- **Priority**: High
- **Input**: User role, requested resource
- **Output**: Access granted/denied
- **Pre-conditions**: User authenticated
- **Post-conditions**: Appropriate permissions applied

#### 3.2.2 Attendance Management

**FR-ATT-001**: Record Attendance
- **Description**: Teachers shall mark student attendance for sessions
- **Priority**: High
- **Input**: Student ID, date, session (morning/afternoon), status
- **Output**: Attendance record saved
- **Pre-conditions**: Valid teacher login, student exists
- **Post-conditions**: Notification sent to parent

**FR-ATT-002**: Prevent Duplicate Entries
- **Description**: System shall prevent multiple attendance entries per session
- **Priority**: Medium
- **Input**: Student, date, session
- **Output**: Duplicate error or existing record
- **Pre-conditions**: Attendance record exists
- **Post-conditions**: No duplicate created

#### 3.2.3 Fee Management

**FR-FEE-001**: Track Fee Status
- **Description**: System shall maintain monthly fee records per student
- **Priority**: High
- **Input**: Student ID, fee amount, due date
- **Output**: Fee record created
- **Pre-conditions**: Student exists in system
- **Post-conditions**: Fee status tracked

**FR-FEE-002**: Mark Payment
- **Description**: Admin shall mark fees as paid
- **Priority**: High
- **Input**: Fee ID, payment confirmation
- **Output**: Status updated to paid
- **Pre-conditions**: Valid admin access
- **Post-conditions**: Payment notification sent

#### 3.2.4 Notification System

**FR-NOT-001**: Send Push Notifications
- **Description**: System shall deliver FCM notifications to registered devices
- **Priority**: Medium
- **Input**: User ID, message content, trigger event
- **Output**: Notification delivered
- **Pre-conditions**: Device token registered
- **Post-conditions**: Delivery status logged

**FR-NOT-002**: Register Device Tokens
- **Description**: System shall store FCM tokens for push delivery
- **Priority**: Medium
- **Input**: User ID, device token
- **Output**: Token stored in database
- **Pre-conditions**: User authenticated
- **Post-conditions**: Ready for notifications

#### 3.2.5 Notes Management

**FR-NOTES-001**: Upload Study Notes
- **Description**: Teachers shall add Google Drive links with metadata
- **Priority**: Medium
- **Input**: Drive URL, title, subject, class
- **Output**: Note record created
- **Pre-conditions**: Valid teacher access
- **Post-conditions**: Note available for students

**FR-NOTES-002**: Display Notes
- **Description**: Students shall view notes in embedded iframe
- **Priority**: Medium
- **Input**: Note selection
- **Output**: Embedded Google Drive preview
- **Pre-conditions**: Note exists
- **Post-conditions**: Note viewed and cached

### 3.3 Performance Requirements

**PERF-001**: Response Time
- **Description**: API responses shall complete within 2 seconds
- **Priority**: High
- **Measurement**: 95th percentile response time

**PERF-002**: Concurrent Users
- **Description**: System shall support 1000 concurrent users
- **Priority**: Medium
- **Measurement**: Load testing results

**PERF-003**: Notification Delivery
- **Description**: Push notifications shall deliver within 5 seconds
- **Priority**: Medium
- **Measurement**: FCM delivery metrics

### 3.4 Security Requirements

**SEC-001**: Data Encryption
- **Description**: Sensitive data shall be encrypted in transit and at rest
- **Priority**: High
- **Standards**: HTTPS, database encryption

**SEC-002**: Authentication Security
- **Description**: JWT tokens shall expire and require refresh
- **Priority**: High
- **Standards**: Secure token management

**SEC-003**: Access Control
- **Description**: Users shall only access authorized resources
- **Priority**: High
- **Standards**: RBAC implementation

### 3.5 Reliability Requirements

**REL-001**: System Availability
- **Description**: System shall maintain 99% uptime
- **Priority**: High
- **Measurement**: Monthly availability percentage

**REL-002**: Data Backup
- **Description**: Critical data shall be backed up regularly
- **Priority**: Medium
- **Standards**: Automated backup procedures

### 3.6 Maintainability Requirements

**MAINT-001**: Code Documentation
- **Description**: Code shall be well-documented with comments
- **Priority**: Medium
- **Standards**: JSDoc format

**MAINT-002**: Error Logging
- **Description**: System shall log errors for debugging
- **Priority**: Medium
- **Standards**: Structured logging

## 4. External Interface Requirements

### 4.1 User Interfaces

The system shall provide intuitive web interfaces optimized for mobile devices, featuring:
- Responsive design with touch-friendly controls
- Dark/light mode support
- Loading states and error handling
- Accessibility compliance (WCAG 2.1 AA)

### 4.2 Hardware Interfaces

- **Database**: Supabase PostgreSQL connection
- **Cache**: IndexedDB for offline storage
- **Notifications**: FCM service integration

### 4.3 Software Interfaces

- **Frontend-Backend**: RESTful API with JSON
- **Database**: Supabase client library
- **Notifications**: Firebase SDK
- **Build System**: Vite for frontend bundling

### 4.4 Communication Interfaces

- **Protocol**: HTTPS for all communications
- **Data Format**: JSON for API payloads
- **Authentication**: Bearer token in headers

## 5. Non-Functional Requirements

### 5.1 Performance

- Page load time: < 3 seconds
- API response time: < 2 seconds
- Notification delivery: < 5 seconds
- Concurrent users: 1000+

### 5.2 Security

- HTTPS encryption required
- JWT token expiration (24 hours)
- CORS policy enforcement
- Input validation and sanitization
- SQL injection prevention

### 5.3 Usability

- Mobile-first responsive design
- Intuitive navigation and workflows
- Clear error messages and feedback
- Offline functionality with caching

### 5.4 Reliability

- 99% uptime target
- Graceful error handling
- Automatic retry mechanisms
- Data consistency across sessions

### 5.5 Maintainability

- Modular code architecture
- Comprehensive documentation
- Automated testing framework
- Environment-based configuration

### 5.6 Portability

- Cross-platform compatibility
- Container-ready deployment
- Environment variable configuration
- No hardcoded dependencies

## 6. System Architecture

### 6.1 High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React PWA)   │◄──►│   (Express.js)  │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ - UI Components │    │ - API Routes    │    │ - User Data     │
│ - State Mgmt    │    │ - Controllers   │    │ - Attendance    │
│ - Caching       │    │ - Services      │    │ - Fees          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                        │                        │
       └────────────────────────┼────────────────────────┘
                                │
                   ┌────────────▼────────────┐
                   │  External Services      │
                   │                         │
                   │ - Firebase FCM          │
                   │ - Google Drive          │
                   └─────────────────────────┘
```

### 6.2 Component Description

#### Frontend Component
- **Technology**: React 19, Vite
- **Responsibilities**: User interface, state management, offline caching
- **Key Features**: PWA capabilities, responsive design, FCM integration

#### Backend Component
- **Technology**: Node.js, Express.js
- **Responsibilities**: API endpoints, business logic, authentication
- **Key Features**: RBAC, middleware, service integrations

#### Database Component
- **Technology**: Supabase (PostgreSQL)
- **Responsibilities**: Data persistence, user management, real-time subscriptions
- **Key Features**: Built-in authentication, row-level security

#### External Services
- **Firebase FCM**: Push notification delivery
- **Google Drive**: File storage and sharing

## 7. Assumptions and Dependencies

### 7.1 Assumptions

1. Users have access to modern web browsers with JavaScript enabled
2. Internet connectivity is generally available with offline fallback
3. Supabase and Firebase services maintain their current APIs
4. Google Drive links remain accessible for embedded viewing
5. Mobile devices support PWA installation and FCM notifications

### 7.2 Dependencies

1. **Supabase Service**: Database and authentication provider
2. **Firebase Project**: Cloud messaging and notification delivery
3. **Google Drive**: File storage and sharing platform
4. **Node.js Runtime**: Server-side JavaScript execution
5. **Modern Browsers**: Client-side application support

## 8. Appendices

### 8.1 Glossary

- **API**: Application Programming Interface
- **CORS**: Cross-Origin Resource Sharing
- **CSP**: Content Security Policy
- **FCM**: Firebase Cloud Messaging
- **JWT**: JSON Web Token
- **PWA**: Progressive Web Application
- **RBAC**: Role-Based Access Control
- **REST**: Representational State Transfer
- **SRS**: Software Requirements Specification

### 8.2 Data Dictionary

#### User Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | User email address |
| role | Enum | User role (admin/teacher/parent) |
| created_at | Timestamp | Record creation time |

#### Attendance Table
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to student |
| teacher_id | UUID | Foreign key to teacher |
| date | Date | Attendance date |
| session | Enum | Morning/Afternoon |
| status | Enum | Present/Absent |
| created_at | Timestamp | Record creation time |

### 8.3 Acceptance Criteria

- [ ] All functional requirements implemented and tested
- [ ] Performance benchmarks met
- [ ] Security requirements satisfied
- [ ] User acceptance testing completed
- [ ] Documentation finalized

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Development Lead | | | |
| Quality Assurance | | | |
| Client Representative | | | |

**End of Document**

## 6. Deployment Constraints

- Backend requires `backend/.env` based on `backend/.env.example`
- Frontend requires `frontend/.env` based on `frontend/.env.example`
- Build output is generated in `frontend/dist`
- `node_modules/` and generated builds are ignored by Git

## 7. Assumptions

- Users will grant notification permission in supported browsers
- Google Drive links are accessible for notes preview
- Supabase and Firebase services are available

## 8. Future enhancements

- Add SMS or WhatsApp notification channels
- Add payment gateway integration
- Add reporting dashboards for attendance and fee analytics
