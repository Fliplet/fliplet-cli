# Fliplet URLs and IP Addresses

**Fliplet Studio**, **Fliplet Web Apps** and **Fliplet Agent (DIS)** requires connectivity to the Internet. **Fliplet Apps** also require connectivity in order to get app updates and communicate with our systems. The endpoints below should be reachable for customers using our services behind a company firewall.

**Fliplet does not currently provide a way to map static IP addresses to an app.** In order to optimize the network path between an end user and a Fliplet app, end users on different ISPs or geographic locations might use different IP addresses to access the same Fliplet app. DNS might return different IP addresses to access a Fliplet App over time or from different network locations.

Note that using static IP address filtering is not considered a safe and effective means of protection. For example, an attacker could set up a malicious Fliplet app which could share the same IP address range as your app. Instead, we suggest that you take a [defense in depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)) approach using Single-Sign-On (e.g. SAML2).


## URLs for all Fliplet Services

Fliplet Studio, Fliplet Web and Native apps as well as Fliplet Agent (DIS) make use of the following URLs:

- api.fliplet.com
- cdn.fliplet.com
- cdn.api.fliplet.com

**US customers** will also need to whitelist the following domains:

- us.api.fliplet.com
- us.cdn.fliplet.com
- us.cdn.api.fliplet.com

---

## Additional URLs for Fliplet webapps

- apps.fliplet.com

**US customers** will also need to whitelist the following domain:

- us-apps.fliplet.com

---

## Additional URLs for Fliplet Studio

- production.studio.fliplet.com