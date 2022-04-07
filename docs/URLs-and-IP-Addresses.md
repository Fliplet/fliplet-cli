# Fliplet URLs and IP Addresses

**Fliplet Studio**, **Fliplet Web Apps** and **Fliplet Agent (Data Integration Service)** requires connectivity to the Internet. **Fliplet Apps** also require connectivity in order to get app updates and communicate with our systems. The endpoints below should be reachable for customers using our services behind a company firewall.

<p class="quote">Fliplet does not suggest whitelisting a set of static IP addresses to allow traffic for an app.</p>

In order to optimize the network path between an end user and a Fliplet app, end users on different ISPs or geographic locations might use different IP addresses to access the same Fliplet app. DNS might return different IP addresses to access a Fliplet App over time or from different network locations.

Note that using static IP address filtering is not considered a safe and effective means of protection. For example, an attacker could set up a malicious Fliplet app which could share the same IP address range as your app. Instead, we suggest that you take a [defense in depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)) approach using Single-Sign-On (e.g. SAML2).

In regards to ports, you must allow traffic for **TCP ports 80 and 443**.

## URL-based whitelisting

### URLs for all Fliplet Services

Fliplet Studio, Fliplet Web and Native apps as well as Fliplet Agent (Data Integration Service) make use of the following URLs:

- `api.fliplet.com`
- `cdn.fliplet.com`
- `cdn.api.fliplet.com`

**US customers** will also need to whitelist the following domains:

- `us.api.fliplet.com`
- `us.cdn.fliplet.com`
- `us.cdn.api.fliplet.com`

**Canadian customers** will also need to whitelist the following domains:

- `ca.api.fliplet.com`
- `ca.cdn.fliplet.com`
- `ca.cdn.api.fliplet.com`

---

### Additional URLs for Fliplet webapps

- `apps.fliplet.com`

**US customers** will also need to whitelist the following domain:

- `us-apps.fliplet.com`

**Canadian customers** will also need to whitelist the following domain:

- `ca-apps.fliplet.com`

---

### Additional URLs for Fliplet Studio

- `studio.fliplet.com`

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
52.212.7.119/32
```

### Additional IPs for US customers

```
54.193.126.209/32
54.67.74.6/32
52.219.20.0/22
52.219.24.0/21
52.92.48.0/22
54.231.232.0/21
52.219.120.0/22
52.219.112.0/21
52.52.191.128/26
54.151.38.62/32
```


### Additional IPs for Canadian customers

```
3.98.17.196/32
3.98.43.103/32
3.98.9.146/32
143.204.170.71/32
143.204.170.36/32
143.204.170.28/32
143.204.170.122/32
```

---

### Additional IPs for Fliplet App Actions

If you need to whitelist inbound requests to your systems from App Actions, please add the following IP addresses:

- Canadian customers: `3.98.9.146`
- European customers: `52.212.7.119`
- US customers: `54.151.38.62`

---

### Additional domains and IPs for emails sent by Fliplet Studio and Apps

If you need to whitelist inbound emails to your infrastructure received from system@fliplet.com, please consider whitelisting the following domains:

- Canadian customers: `ca.email.fliplet.com` and `ca-alt1.email.fliplet.com`
- European customers: `eu.email.fliplet.com` and `eu-alt1.email.fliplet.com`
- US customers: `us.email.fliplet.com` and `us-alt1.email.fliplet.com`

Additionally, if you need to whitelist emails by IP please add the following IP address ranges:

```
199.255.192.0/22
199.127.232.0/22
54.240.0.0/18
69.169.224.0/20
23.249.208.0/20
23.251.224.0/19
76.223.176.0/20
54.240.64.0/19
54.240.96.0/19
52.82.172.0/22
```

Keep in mind that those IP addresses are subject to change. If Fliplet adds or removes any outgoing IP address, we will update the SPF record, so you need to check back from time to time, if you want to make sure you have the latest list of IP address ranges.

You can use the `dig` unix command to get an up to date list of our SPF records at any time:

```
$ dig TXT amazonses.com +short| grep 'v=spf1'
```

Here’s the equivalent query (and result) using the Windows command prompt:

```
C:>nslookup -type=TXT amazonses.com | find "v=spf1"
```

---