# Troubleshooting Playnite Web

This guide provides solutions to common problems that Playnite Web users encounter when using the plugin. If you're having trouble using the plugin, check here for a solution before opening an issue. 

## I Discovered a Security Vulnerability 

If you discover a security vulnerability, it's important to let us know so that we can resolve it. However, sharing information about vulnerabilities publicly can make it possible for bad actors to take advantage of the vulnerability, exposing yourself and other users to potential harm. Because GitHub issues are public, you must submit the information as a security advisory for confidentiality. This will allow private communication between you and the respository maintainers. 

### Solution

1. **Do not** open an issue.
2. [Submit a security advisory on GitHub](https://github.com/andrew-codes/playnite-web/security/advisories/new).

## Can't Load Playnite Web After Upgrading Playnite to Version 12

After upgrading Playnite from version 11 to 12, you may receive an error message that the Playnite Web plugin can't be loaded. 

To resolve this issue, you need to manually delete a configuration file in the **Data** folder to remove some incompatible settings values left over from the old version of the plugin. The **Data** folder is the directory that stores your settings for Playnite Web. 

### Solution

1. Run Playnite and open the add-ons view. 
2. Navigate to Playnite Web and select the **Data** folder. 
3. Leave the **Data** folder open in Windows Explorer and completely close Playnite. 
4. Delete the file named **config.json**.
5. Open Playnite and re-apply your Playnite Web settings. 