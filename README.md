# Arthur the verifier
Just like how Arthur accepts the proof and verifies whatever the magician Merlin gives it to him, our bot takes in an email address (as proof) and assigns you the user a role, which could potentially give them access to the whole discord server. Here the bot is invoked by a slash command "/email". Also, it sends out a message in another channel which is meant for introductions. In that message it pings that user and attaches a bio and linkedin address of the user which the user has previosly provided. Btw, the email is deleted within sometime to ensure that the privacy of the user is not compromised

## Setting and Assumptions
The bot is useful for your server if
1. you use some sort of form which people *have* to fill to enter the server and the data from the form is stored in google sheet.
2. Members who join the sever have very limited access to the server. Assigning a role to them gives them access. Now you want to assign them role given they provide the email address which they have used to fill in the form.
3. The probability that someone joins the server without filling the form i.e. the server invite link leaks AND inputs an email address of someone who is yet to verify is negligible. 
