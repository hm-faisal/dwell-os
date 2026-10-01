# data-protection-compliance Specification

## Purpose

Enforces data protection compliance including TLS encryption in transit, AES-256-GCM symmetric encryption at rest for sensitive PII and verification documents, and audit logging for sensitive data access.

## Requirements

### Requirement: Encryption in Transit
The system SHALL mandate TLS 1.2 or higher for all client-to-server and inter-service communications, rejecting insecure plaintext HTTP connections in production.

#### Scenario: Production connection requires TLS
- **WHEN** client initiates an HTTP request in production environment
- **THEN** system redirects to HTTPS with HSTS header enabled

### Requirement: Encryption at Rest for Sensitive PII and Verification Documents
The system SHALL encrypt all personally identifiable information (PII) including user phone numbers, identity document URLs, and verification data at rest using AES-256-GCM envelope encryption. Plaintext PII SHALL NOT be stored in the database.

#### Scenario: Storing government ID and verification data
- **WHEN** user uploads verification data and document URL
- **THEN** system encrypts the payload using AES-256-GCM with a unique 12-byte initialization vector (IV) and stores the resulting ciphertext and authentication tag in the database

#### Scenario: Decrypting verification record for authorized reviewer
- **WHEN** an authorized Admin reviews a verification request
- **THEN** system decrypts the AES-256-GCM ciphertext, verifies the authentication tag integrity, and returns the plaintext payload

#### Scenario: Tampered ciphertext decryption attempt
- **WHEN** system attempts to decrypt a verification record whose ciphertext or authentication tag has been tampered with
- **THEN** system aborts decryption, logs an integrity violation, and throws a cryptographic error

### Requirement: Document and PII Access Audit Logging
The system SHALL record an audit entry in the DocumentAuditLog table whenever sensitive documents or encrypted PII are decrypted and accessed. Each audit record SHALL capture the actorId, document/record identifier, IP address, timestamp, and action performed.

#### Scenario: Accessing sensitive verification document
- **WHEN** Admin views and decrypts a tenant's verification document
- **THEN** system records an audit entry in DocumentAuditLog capturing the Admin's user ID, IP address, document ID, and action "DECRYPT_VIEW"
