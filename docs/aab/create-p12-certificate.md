# Manually creating a P12 certificate

If you're using Fliplet Automated App Build system with an Apple Enterprise account and want to manually provide your certificate, we will need its P12 key. Please follow this steps to generate one with your Apple account.

**NOTE: You need a Mac to complete the following steps and generate a certificate.**

1. Log in on [Apple Developer portal](https://developer.apple.com/) with your Enterprise account.
2. Click on **Certificates, Identifiers & Profiles** from the left sidebar.
3. Click on the plus icon on the top right to [create a new certificate](https://developer.apple.com/account/ios/certificate/create).
4. Choose **In-House and Ad Hoc** from the **Production** section and continue.
5. Following the steps from the interface, on your Mac open the **Utilities** folder from the application and launch **Keychain Access**.
6. Within the Keychain Access drop down menu, select **Keychain Access** > **Certificate Assistant** > **Request a Certificate from a Certificate Authority**.
7. In the Certificate Information window, enter the following information:
  - In the User Email Address field, enter your email address.
  - In the Common Name field, create a name for your private key (e.g., John Doe Dev Key).
  - The CA Email Address field should be left empty.
  - In the "Request is" group, select the "Saved to disk" option.
  - Click Continue within Keychain Access to complete the CSR generating process.
8. Back to the Apple website on your browser, click continue and then **select the .certSigningRequest file saved on your Mac** to upload it, then click continue.
9. Your certificate will be ready for download. Download it on your Mac then click on it to install it on Keychain Access.
10. Expand the imported certificate like the picture below, right click on the private key and click export:

![img](https://cl.ly/1v273Y1p2S0N/Image%202018-06-11%20at%207.26.14%20PM.png)

11. When prompted to choose a password, leave it blank and continue.
12. You then will be prompted to type in the password of your local user (the one on your Mac) to finish exporting the certificate.
13. Select the destination where to export the **p12** certificate.