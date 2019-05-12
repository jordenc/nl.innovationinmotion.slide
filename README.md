# Slide smart curtains for Athom Homey

Control your curtains with Slide by Innovation In Motion (https://innovationinmotion.nl/), using Homey by Athom B.V.

**Want to show your appreciation for this app? A donation is possible via http://www.d2c.nl **

Install and setup your Slide device(s) using the official app by Innovation in Motion, on your smartphone. Login using your e-mail address and password of your Slide account, in the Homey app, and select which Slide(s) you want to add to Homey.

Enables the following cards to use in your flows:
- [Trigger] Position changed #level (From fully opened: 0.00 to fully closed: 1.00)
- [Action] Set position
- [Action] Immediate stop

Use at your own risk, I accept no responsibility for any damages caused by using this script.

# Changelog

**Version 0.3.5**
- Fixed re-authentication when token has expired. You might have to login again via pairing if your Slides stop working via Homey, due to a bug in the previous versions.

**Version 0.3.4**
- Minor bugfix
- Updated device icon

**Version 0.3.3**
- Changed device type, please remove and re-add your devices
- Minor bugfix

**Version 0.3.2**
- Minor bugfixes

**Version 0.3.1** 
- Fixed missing files

**Version 0.3.0**
- New Cloud API setup for final version.

**Version 0.2.2**
- Fixed a small bug

**Version 0.2.1**
- Fixed a crash
- Changed polling from every 20 to every 30 seconds

**Version 0.2.0**
- Better error detection
- Better scanning

**Version 0.1.0:**
- First release