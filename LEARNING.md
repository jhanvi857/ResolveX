# Learning Outcomes

Building this DNS Resolver project helped me understand not just DNS resolution, but how modern web infrastructure works under the hood.

## DNS fundamentals

- Learned that DNS (Domain Name System) converts human-readable domains into IP addresses.

Example:

google.com -> 142.x.x.x

- Understood the hierarchy of DNS:

Root Server -> TLD Server -> Authoritative Server

Resolution flow:

google.com
-> Root server
-> .com TLD
-> Google authoritative server
-> Final IP

- Learned that a custom resolver starts from known root server IPs and recursively discovers the answer.

## DNS record types

### A Record
Maps a domain to an IPv4 address.

google.com
-> 142.x.x.x

### AAAA Record
Maps a domain to IPv6.

### MX Record
Specifies mail servers.

gmail.com
-> alt3.gmail-smtp-in.l.google.com

MX records return hostnames, not direct IPs.

Another DNS lookup is needed:

MX hostname
-> A lookup
-> IP

### NS Record
Tells which authoritative servers manage a domain.

### TXT Record
Stores additional metadata:

- SPF
- verification
- email configs

### CNAME Record

Acts like an alias:

route-optimizer.vercel.app
-> CNAME
-> cname.vercel-dns.com
-> A Record
-> 62.x.x.x

Instead of returning an IP directly, CNAME points to another hostname.

## DNS uses UDP

Learned that DNS primarily uses:

UDP Port 53

Reasons:

- very small requests
- low overhead
- faster than TCP
- no connection setup

Example DNS request:

gmail.com ?

## Why UDP works despite being connectionless

UDP does not guarantee:

- delivery
- ordering
- retries

But DNS works because:

- queries are tiny
- request IDs are attached
- timeout and retry logic exists

Example:

Query #1 -> lost
Query #2 -> retry

DNS usually follows:

1 request -> 1 response

so ordering problems are minimal.

## TCP 3-way handshake

After DNS returns IP:

Browser establishes TCP connection.

Steps:

Client -> SYN
Server -> SYN + ACK
Client -> ACK

Purpose:

- establish reliable connection
- synchronize sequence numbers

Only after this:

connection established

## TLS handshake

Learned that HTTPS security starts AFTER TCP.

Sequence:

DNS
-> TCP connection
-> TLS handshake
-> HTTP request

TLS procedure:

Client Hello
-> Server Hello
-> Certificate sent
-> Browser verification
-> Key exchange
-> Secure tunnel created

Purpose:

- encryption
- authentication
- secure communication

## TLS certificates

TLS certificates act as digital identity cards.

Browser verifies:

- certificate validity
- trusted issuer
- matching domain

Example:

Certificate:
github.com

Certificates are issued for:

Domains Yes
IPs No

This explains browser warnings when opening raw IPs.

## Virtual hosting

Learned that:

One IP != One Website

Modern servers host many websites on one IP.

Example:

142.x.x.x
-> github.com
-> gitlab.com
-> leetcode.com

Browser sends:

Host: github.com

Server uses Host header to determine which website to serve.

## Why multiple domains share one IP

Reasons:

- IPv4 address limitations
- infrastructure efficiency
- cloud scalability
- reduced cost

Same IP often represents:

a network entry point

not necessarily:

same machine or same storage server

## CDN (Content Delivery Network)

Learned that websites use edge servers worldwide.

Instead of:

India -> USA

traffic becomes:

India -> nearest edge server

Benefits:

- lower latency
- faster loading
- reduced server load
- global scalability

## Modern website flow

Typing:

https://gmail.com

actually triggers:

Browser cache
-> DNS lookup (UDP)
-> IP received
-> TCP handshake
-> TLS handshake
-> HTTP request
-> Packets routed
-> Server response
-> Browser renders page

## Understanding packets

Large data is split into packets.

Each packet contains:

- source IP
- destination IP
- payload
- sequence information

Flow:

Laptop
-> Router
-> ISP
-> Internet routers
-> Server

Packets are later reassembled.

## DNS resolution is not the same as website accessibility

Getting an IP does not guarantee opening a website.

Modern websites additionally depend on:

- TLS certificates
- Host headers
- CDN routing
- virtual hosting
- security rules

Example:

github.com -> IP Yes
Direct IP access -> may fail No

## Key insight

DNS only answers:

"Where should I connect?"

Modern web infrastructure additionally needs:

- trust
- routing
- encryption
- traffic distribution

Final request lifecycle:

Domain
-> DNS -> IP
-> TCP
-> TLS
-> Host routing
-> CDN
-> Backend servers
-> Response## Learning outcomes

- Learned that DNS (Domain Name System) converts human-readable domains into IP addresses.

Example:

google.com -> 142.x.x.x

- Understood the hierarchy of DNS:

Root Server -> TLD Server -> Authoritative Server

Resolution flow:

google.com
-> Root server
-> .com TLD
-> Google authoritative server
-> Final IP

- Learned that a custom resolver starts from known root server IPs and recursively discovers the answer.

## DNS record types

### A Record
Maps a domain to an IPv4 address.

google.com
-> 142.x.x.x

### AAAA Record
Maps a domain to IPv6.

### MX Record
Specifies mail servers.

gmail.com
-> alt3.gmail-smtp-in.l.google.com

MX records return hostnames, not direct IPs.

Another DNS lookup is needed:

MX hostname
-> A lookup
-> IP

### NS Record
Tells which authoritative servers manage a domain.

### TXT Record
Stores additional metadata:

- SPF
- verification
- email configs

### CNAME Record

Acts like an alias:

route-optimizer.vercel.app
-> CNAME
-> cname.vercel-dns.com
-> A Record
-> 62.x.x.x

Instead of returning an IP directly, CNAME points to another hostname.

## DNS uses UDP

Learned that DNS primarily uses:

UDP Port 53

Reasons:

- very small requests
- low overhead
- faster than TCP
- no connection setup

Example DNS request:

gmail.com ?

## Why UDP works despite being connectionless

UDP does not guarantee:

- delivery
- ordering
- retries

But DNS works because:

- queries are tiny
- request IDs are attached
- timeout and retry logic exists

Example:

Query #1 -> lost
Query #2 -> retry

DNS usually follows:

1 request -> 1 response

so ordering problems are minimal.

## TCP 3-way handshake

After DNS returns IP:

Browser establishes TCP connection.

Steps:

Client -> SYN
Server -> SYN + ACK
Client -> ACK

Purpose:

- establish reliable connection
- synchronize sequence numbers

Only after this:

connection established

## TLS handshake

Learned that HTTPS security starts AFTER TCP.

Sequence:

DNS
-> TCP connection
-> TLS handshake
-> HTTP request

TLS procedure:

Client Hello
-> Server Hello
-> Certificate sent
-> Browser verification
-> Key exchange
-> Secure tunnel created

Purpose:

- encryption
- authentication
- secure communication

## TLS certificates

TLS certificates act as digital identity cards.

Browser verifies:

- certificate validity
- trusted issuer
- matching domain

Example:

Certificate:
github.com

Certificates are issued for:

Domains : Yes
IPs : No

This explains browser warnings when opening raw IPs.

## Virtual hosting

Learned that:

One IP != One Website

Modern servers host many websites on one IP.

Example:

142.x.x.x
-> github.com
-> gitlab.com
-> leetcode.com

Browser sends:

Host: github.com

Server uses Host header to determine which website to serve.

## Why multiple domains share one IP

Reasons:

- IPv4 address limitations
- infrastructure efficiency
- cloud scalability
- reduced cost

Same IP often represents:

a network entry point

not necessarily:

same machine or same storage server

## CDN (Content Delivery Network)

Learned that websites use edge servers worldwide.

Instead of:

India -> USA

traffic becomes:

India -> nearest edge server

Benefits:

- lower latency
- faster loading
- reduced server load
- global scalability

## Modern website flow

Typing:

https://gmail.com

actually triggers:

Browser cache
-> DNS lookup (UDP)
-> IP received
-> TCP handshake
-> TLS handshake
-> HTTP request
-> Packets routed
-> Server response
-> Browser renders page

## Understanding packets

Large data is split into packets.

Each packet contains:

- source IP
- destination IP
- payload
- sequence information

Flow:

Laptop
-> Router
-> ISP
-> Internet routers
-> Server

Packets are later reassembled.

## DNS resolution is not the same as website accessibility

Getting an IP does not guarantee opening a website.

Modern websites additionally depend on:

- TLS certificates
- Host headers
- CDN routing
- virtual hosting
- security rules

Example:

github.com -> IP Yes
Direct IP access -> may fail No

## Key insight

DNS only answers:

"Where should I connect?"

Modern web infrastructure additionally needs:

- trust
- routing
- encryption
- traffic distribution

Final request lifecycle:

Domain
-> DNS -> IP
-> TCP
-> TLS
-> Host routing
-> CDN
-> Backend servers
-> Response
