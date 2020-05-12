# Fliplet URLs and IP Addresses

**Fliplet Studio**, **Fliplet Web Apps** and **Fliplet Agent (DIS)** requires connectivity to the Internet. **Fliplet Apps** also require connectivity in order to get app updates and communicate with our systems. The endpoints below should be reachable for customers using our services behind a company firewall.

**Fliplet does not suggest whitelisting a set of static IP addresses to allow traffic for an app.** In order to optimize the network path between an end user and a Fliplet app, end users on different ISPs or geographic locations might use different IP addresses to access the same Fliplet app. DNS might return different IP addresses to access a Fliplet App over time or from different network locations.

Note that using static IP address filtering is not considered a safe and effective means of protection. For example, an attacker could set up a malicious Fliplet app which could share the same IP address range as your app. Instead, we suggest that you take a [defense in depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)) approach using Single-Sign-On (e.g. SAML2).

In regards to ports, you must allow traffic for **TCP ports 80 and 443**.

## URL-based whitelisting

### URLs for all Fliplet Services

Fliplet Studio, Fliplet Web and Native apps as well as Fliplet Agent (DIS) make use of the following URLs:

- `api.fliplet.com`
- `cdn.fliplet.com`
- `cdn.api.fliplet.com`

**US customers** will also need to whitelist the following domains:

- `us.api.fliplet.com`
- `us.cdn.fliplet.com`
- `us.cdn.api.fliplet.com`

---

### Additional URLs for Fliplet webapps

- `apps.fliplet.com`

**US customers** will also need to whitelist the following domain:

- `us-apps.fliplet.com`

---

### Additional URLs for Fliplet Studio

- `production.studio.fliplet.com`

---

## IP-based whitelisting

Please note that the following list may change over time. We regularly update our IP ranges hence IP-based whitelisting is not recommended.

### IPs for all Fliplet Services

```
52.19.68.87/32
63.32.114.158/32
63.32.146.94/32
52.218.0.0/17
52.92.40.0/21
54.231.128.0/19
18.200.212.0/23
52.212.248.0/26
3.249.28.0/23
52.19.124.0/23
```

### Additional IPs for US customers

54.193.126.209/32
54.67.74.6/32
52.219.20.0/22
52.219.24.0/21
52.92.48.0/22
54.231.232.0/21
52.219.120.0/22
52.219.112.0/21
52.52.191.128/26
```