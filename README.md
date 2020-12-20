# slack-bolt-oauth-install

Sample project for Slack OAuth install by slack framework Bolt with Typescript on AWS Lambda managed by Serverless Framework

```bash
# node 10.13+ required
# 0) Create a new project with this template
yarn global add serverless
serverless create \
  --template-url https://github.com/irongineer/slack-bolt-oauth-install/tree/main \
  --path slack-bolt-oauth-install

# 1) Slack App Configuration
# Go to https://api.slack.com/apps
#   - Create a Global Shortcut named `Workout!` and Callback ID `muscle` in 'Interactivity & Shortcuts' tab (Request URL can be a dummy) ** DON"T forget to click `Save` button! **
#   - Add a Redirect Url in 'OAuth & Permissions' tab (Redirect URL can be a dummy) ** DON"T forget to click `Save` button! **
#   - Create a bot user @{bot-name} by clicking `Edit` button of `App Display Name` and input your Bot name in 'App Home' Tab
#   - Click the Activate Public Distribution button in 'Manage distribution' tab after check "Remove Hard Coded Information" (cf. https://api.slack.com/start/distributing/public#enabling)
#   - Get Environment Variables from 'Basic Information' tab

# 2) App Setup
yarn global add serverless
yarn
cp _env .env
vi .env
# Set Environment Variables
#   - SLACK_SIGNING_SECRET
#   - SLACK_CLIENT_ID
#   - SLACK_CLIENT_SECRET
source .env

# 3) Local Development
sls offline # local dev (or `yarn start`)
ngrok http 3000 # on another terminal window

# Update the Request URL for the 'Slash Commands' and 'Interactivity & Shortcuts' with the ngrok URL
# ex) https://xxxxxxxxxxx.ngrok.io/dev/slack/events
# Update the Redirect URL for the 'Redirect URLs' with the ngrok URL
# ex) https://xxxxxxxxxxx.ngrok.io/dev/slack/oauth_redirect
# Update the Request URLs for the 'Install' with the ngrok URL
# ex.1) https://xxxxxxxxxxx.ngrok.io/dev/slack/install
# ex.2) https://xxxxxxxxxxx.ngrok.io/dev/slack/user_install

# 4) Make sure it works on Slack
#  Install your app from `Add to Slack` button by accessing `/slack/install` or /slack/user_install` endpoint
#  Redirect to `/slack/oauth_redirect` endpoint after installing your app
#  After install, check it works
#   1. Add app to a target channel for sharing training result
#   2. Try muscle command below
#     - `お願いします！` of `スクワットしとく？` on Global Shortcuts
#   3. Check it works
#     - Open the training reps modal
#     - Select a training reps you clicked static select box
#     - Select a training result you clicked radio button
#     - Change to the status according to the selected training result
#     - Share your training record to the channel you selected

# 5) Deploy to AWS
export AWS_ACCESS_KEY_ID=xxx  # Skip if you have already completed `aws configure`
export AWS_SECRET_ACCESS_KEY=yyy  # Skip if you have already completed `aws configure`
sls deploy # (or `yarn deploy`)

# Update the Request URL for the 'Slash Commands' and 'Interactivity & Shortcuts' with the deployed AWS URL
# ex) https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/slack/events
# Update the Redirect URL for the 'Redirect URLs' with the deployed AWS URL
# ex) https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/slack/oauth_redirect
# Update the Request URL for the 'Install' with the deployed AWS URL
# ex.1) https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/slack/install
# ex.2) https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/slack/user_install
```
